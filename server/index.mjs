import {chooseStadium} from '../src/stadiums';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,extname,sep} from 'node:path';
import {randomInt} from 'node:crypto';
import {WebSocketServer,WebSocket} from 'ws';
import {publicAvatar,displayUsername} from '../src/multiplayer';
import {Match,TEAMS} from '../src/game';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'client');
const rooms=new Map(),connections=new Map();
const allowed=process.env.ALLOWED_ORIGINS?.split(',').map(x=>x.trim()).filter(Boolean);
const mime={'.mp4':'video/mp4','.jpg':'image/jpeg','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
 if(req.url==='/health'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,rooms:rooms.size}));return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+sep))throw Error();const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(404);res.end('Not found');}
});
const wss=new WebSocketServer({noServer:true,maxPayload:2048,perMessageDeflate:false});
server.on('upgrade',(req,socket,head)=>{
 const ip=req.socket.remoteAddress||'unknown';
 if(req.url!=='/ws'||(allowed&&!allowed.includes(req.headers.origin))||(connections.get(ip)||0)>=12||wss.clients.size>=Number(process.env.MAX_CONNECTIONS||400)){socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');return;}
 wss.handleUpgrade(req,socket,head,ws=>{ws.ip=ip;connections.set(ip,(connections.get(ip)||0)+1);wss.emit('connection',ws);});
});
function send(ws,msg){if(ws.readyState===WebSocket.OPEN&&ws.bufferedAmount<128000)ws.send(JSON.stringify(msg));}
function error(ws,message){send(ws,{type:'error',message});}
function broadcast(room,msg){room.members.forEach(p=>send(p.ws,msg));}
function lobby(room){broadcast(room,{type:'room',code:room.code,stadium:room.stadium,isJoinable:!room.active&&room.members.length<2,players:room.members.map(p=>({team:p.team,ready:p.ready,avatar:p.avatar,username:p.username})),mode:room.mode,duration:room.duration});}
function snapshot(room){const m=room.match;return {type:'snapshot',seq:room.seq++,score:m.score,time:m.time,duration:m.duration,phase:m.phase,message:m.message,teams:m.teams,mode:m.mode,sudden:m.suddenDeath,bodies:m.objects.map(b=>[b.position.x,b.position.y,b.angle])};}
function closeRoom(room,reason){if(!rooms.has(room.code))return;broadcast(room,{type:'closed',message:reason});for(const p of room.members)p.ws.room=null;room.match.dispose();rooms.delete(room.code);}
function leave(ws){if(ws.room){const room=rooms.get(ws.room);if(room)closeRoom(room,'A player left. Create or join another room.');ws.room=null;}}
function code(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s;do{s=Array.from({length:6},()=>alphabet[randomInt(alphabet.length)]).join('');}while(rooms.has(s));return s;}
wss.on('connection',ws=>{
 ws.alive=true;ws.window=Date.now();ws.count=0;ws.created=0;ws.lastLaunch=0;ws.on('pong',()=>ws.alive=true);
 ws.on('message',raw=>{
  const now=Date.now();if(now-ws.window>1000){ws.window=now;ws.count=0;}if(++ws.count>40){ws.close(1008,'Too many messages');return;}
  let data;try{data=JSON.parse(raw.toString());if(!data||typeof data!=='object')throw Error();}catch{error(ws,'Invalid message.');return;}
  const room=rooms.get(ws.room);
  if(data.type==='create'||data.type==='join'){
   if(room){error(ws,'Leave your current room first.');return;}
   const username=displayUsername(data.username);const team=TEAMS.some(t=>t.id===data.team)?data.team:'ARG';const avatar=data.avatar&&typeof data.avatar==='object'?publicAvatar(data.avatar):null;
   if(data.type==='create'){
    if(now-ws.created<1500){error(ws,'Please wait before creating another room.');return;}
    if(rooms.size>=Number(process.env.MAX_ROOMS||100)){error(ws,'Server is full. Try again shortly.');return;}
    ws.created=now;const id=code(),match=new Match();match.multiplayer=true;const r={code:id,match,members:[{ws,team,avatar,username,ready:false}],mode:data.mode==='golden'?'golden':'normal',duration:data.duration===90?90:45,seq:0,created:now,active:false,stadium:chooseStadium(-1)};rooms.set(id,r);ws.room=id;send(ws,{type:'seat',seat:0});lobby(r);
   }else{
    const r=rooms.get(String(data.code||'').toUpperCase());if(!r){error(ws,'Room not found. Check the code.');return;}if(r.members.length>=2){error(ws,'This room is full.');return;}
    r.members.push({ws,team,avatar,username,ready:false});ws.room=r.code;send(ws,{type:'seat',seat:1});lobby(r);
   }return;
  }
  if(data.type==='leave'){leave(ws);return;}
  if(!room){error(ws,'Join a room first.');return;}
  const seat=room.members.findIndex(p=>p.ws===ws),member=room.members[seat];
  if(data.type==='identity'){member.username=displayUsername(data.username);lobby(room);return;}
  if(data.type==='avatar'){
   if(room.active)return;
   member.avatar=publicAvatar(data.avatar);room.members.forEach(p=>p.ready=false);lobby(room);return;
  }
  if(data.type==='ready'){
   if(room.active&&room.match.phase!=='finished')return;
   member.ready=!member.ready;lobby(room);
   if(room.members.length===2&&room.members.every(p=>p.ready)){
    if(room.active)room.stadium=chooseStadium(room.stadium);room.members.forEach(p=>p.ready=false);room.match.start(room.members.map(p=>p.team),room.mode,'normal',room.duration);room.active=true;lobby(room);broadcast(room,{type:'start'});broadcast(room,snapshot(room));
   }
  }else if(data.type==='launch'){
   if(!room.active||!Number.isFinite(data.x)||!Number.isFinite(data.y)||Math.abs(data.x)>1000||Math.abs(data.y)>1000||now-ws.lastLaunch<200)return;
   ws.lastLaunch=now;room.match.launch(seat,data.x,data.y);
  }
 });
 ws.on('error',()=>{});
 ws.on('close',()=>{leave(ws);connections.set(ws.ip,Math.max(0,(connections.get(ws.ip)||1)-1));});
});
let previous=performance.now(),acc=0,frame=0;
const clock=setInterval(()=>{const now=performance.now();acc+=Math.min(.1,(now-previous)/1000);previous=now;while(acc>=1/60){for(const room of rooms.values())if(room.active)room.match.tick(1/60);acc-=1/60;frame++;if(frame%3===0)for(const room of rooms.values())if(room.active)broadcast(room,snapshot(room));}},1000/60);
const heartbeat=setInterval(()=>{for(const ws of wss.clients){if(!ws.alive){ws.terminate();continue;}ws.alive=false;ws.ping();}for(const room of rooms.values())if(Date.now()-room.created>2*60*60*1000||(!room.active&&Date.now()-room.created>10*60*1000))closeRoom(room,'Room expired. Please create a new one.');},15000);
const port=Number(process.env.PORT||3000);server.listen(port,process.env.HOST||'0.0.0.0',()=>console.log(`Pocket Cup listening on port ${server.address().port}`));
function shutdown(){clearInterval(clock);clearInterval(heartbeat);for(const ws of wss.clients)ws.terminate();server.close(()=>process.exit(0));}process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
