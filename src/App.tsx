import {DEFAULT_DIFFICULTY,DIFFICULTIES} from './difficulty';
import {CupRewardScreen} from './CupRewardScreen';
import {claimCupReward,cupOutcome} from './rewards';
import {Shop} from './ShopScreen';
import {SkinId,isSkinId} from './shopCatalog';
import {Wallet,emptyWallet,readWallet,writeWallet,purchaseSkin,equipSkin,redeemTestCoins,TEST_COIN_CODE,skinAvatar} from './shop';
'use client';
import {useEffect,useRef,useState} from 'react';
import {CharacterCreator} from './CharacterCreator';
import {Avatar} from './avatar';
import {Wardrobe,readWardrobe,writeWardrobe,saveToWardrobe,equippedAvatar,DEFAULT_PLAYER} from './wardrobe';
import {makeCharacterParts,loadCupCharacterAssets,loadShopAssets} from './characters';
import {TEAM_BY_ID} from './teams';
import {loadStadiums,chooseStadium,STADIUM_NAMES} from './stadiums';
import {makeAvatarParts} from './avatarArt';
import {RoomLobby} from './RoomLobby';
import {RoomClient, RoomState, serverURL} from './network';
import {TitleScreen,TitleMode,launchTitleMode} from './TitleScreen';
import {Match,TEAMS,paint,makeParts,cropSprite,GameArt,Aim,Mode,Difficulty} from './game';
import {Cup,createCup,completeRound,playerFixture,roundToken,stageLabel} from './cup';
import {CupSelect,CupHub} from './CupScreens';
type Screen='title'|'select'|'cup'|'match'|'result'|'settings'|'rooms'|'creator'|'shop';
const LEVELS:Difficulty[]=['easy','normal','hard'];
export default function Home(){
 const canvas=useRef<HTMLCanvasElement>(null),frame=useRef<HTMLDivElement>(null),game=useRef<Match|null>(null),art=useRef<GameArt|null>(null),drag=useRef<{x:number;y:number}|null>(null),aim=useRef<Aim|null>(null),audio=useRef<AudioContext|null>(null);
 const [screen,setScreen]=useState<Screen>('title'),[ready,setReady]=useState(false),[assetError,setAssetError]=useState(false),[mode,setMode]=useState<Mode>('normal'),[difficulty,setDifficulty]=useState<Difficulty>(DEFAULT_DIFFICULTY),[duration,setDuration]=useState(45),[sound,setSound]=useState(true),[team,setTeam]=useState('ARG'),[paused,setPaused]=useState(false),[hud,setHud]=useState({score:[0,0],phase:'idle',message:'',time:45,teams:['ARG','BRA'],sudden:false});
 const [cupCharacter,setCupCharacter]=useState(0);const stadiums=useRef<CanvasImageSource[]>([]),lastStadium=useRef(-1);
 const [rewardCup,setRewardCup]=useState<Cup|null>(null);
 const [cup,setCup]=useState<Cup|null>(null);const cupRef=useRef<Cup|null>(null),playingRound=useRef<string|null>(null);
 function storeCup(c:Cup|null){cupRef.current=c;setCup(c);}
 function finishRound(next:Cup){storeCup(next);if(next.coinEligible&&cupOutcome(next)&&!wallet.cupRewards?.[next.runId!])setRewardCup(next);}
 function collectCupReward(){if(!rewardCup)throw Error('No completed cup.');const latest=readWallet(localStorage);const result=claimCupReward(latest,rewardCup);commitWallet(result.wallet);return result.reward;}
 function changeDifficulty(value:Difficulty){setDifficulty(value);const c=cupRef.current;if(c&&value!=='hard')storeCup({...c,coinEligible:false});}

 const [wardrobe,setWardrobe]=useState<Wardrobe>(()=>{try{return readWardrobe(localStorage);}catch{return {version:1,characters:[],equippedId:null};}});
 const [wallet,setWallet]=useState<Wallet>(()=>{try{return readWallet(localStorage);}catch{return emptyWallet();}});
 const [roomNotice,setRoomNotice]=useState('');
 const avatar=wallet.equipped?skinAvatar(wallet.equipped):equippedAvatar(wardrobe);
 const roomWardrobe:Wardrobe={...wardrobe,equippedId:wallet.equipped?`shop:${wallet.equipped}`:wardrobe.equippedId,characters:[...wardrobe.characters,...wallet.owned.map(id=>({id:`shop:${id}`,avatar:skinAvatar(id)}))]};
 function commitWallet(next:Wallet){writeWallet(localStorage,next);setWallet(next);}
 function buyShopSkin(id:SkinId){try{commitWallet(purchaseSkin(wallet,id));tone();return null;}catch(e){return e instanceof Error?e.message:'Purchase could not be saved.';}}
 function equipShopSkin(id:SkinId){try{commitWallet(equipSkin(wallet,id));if(room)net.current?.send({type:'avatar',avatar:skinAvatar(id)});return null;}catch(e){return e instanceof Error?e.message:'Could not equip skin.';}}

 const [editingId,setEditingId]=useState<string|null>(null),[creatorReturn,setCreatorReturn]=useState<'title'|'rooms'>('title');
 function openCreator(id:string|null,back:'title'|'rooms'){setEditingId(id);setCreatorReturn(back);setScreen('creator');}
 function saveCharacter(value:Avatar){try{const id=editingId||(globalThis.crypto?.randomUUID?.()||`player-${Date.now()}-${Math.random().toString(36).slice(2)}`);const next=saveToWardrobe(wardrobe,value,id);writeWardrobe(localStorage,next);commitWallet(equipSkin(wallet,null));setWardrobe(next);setEditingId(id);return null;}catch{return 'Could not save. Browser storage is unavailable or full. Your draft is still here.';}}
 function equipCharacter(id:string|null){if(connecting)return;if(id?.startsWith('shop:')&&isSkinId(id.slice(5))){const error=equipShopSkin(id.slice(5) as SkinId);setNetworkError(error||'');return;}try{const next={...wardrobe,equippedId:id};writeWardrobe(localStorage,next);commitWallet(equipSkin(wallet,null));setWardrobe(next);if(room)net.current?.send({type:'avatar',avatar:equippedAvatar(next)});setNetworkError('');}catch{setNetworkError('Could not equip: browser storage is unavailable or full.');}}
 const [titleMode,setTitleMode]=useState<TitleMode>('Int Cup');
 const net=useRef<RoomClient|null>(null);
 const [room,setRoom]=useState<RoomState|null>(null),[roomCode,setRoomCode]=useState(''),[networkError,setNetworkError]=useState(''),[connecting,setConnecting]=useState(false),[server,setServer]=useState(serverURL),[copied,setCopied]=useState(false);
 useEffect(()=>{if(art.current)art.current.playerParts=room?room.players.map(p=>makeAvatarParts(p.avatar||DEFAULT_PLAYER)):cup?[makeCharacterParts([TEAM_BY_ID[cup.player]],false,[cup.character||0])[0],null]:avatar?[makeAvatarParts(avatar),null]:undefined;},[avatar,room,cup,ready]);
 useEffect(()=>{const el=frame.current;if(!el)return;const block=(e:MouseEvent)=>{if(e.type==='contextmenu'||e.type==='dblclick'||e.detail>1){e.preventDefault();if(e.type==='dblclick')e.stopPropagation();}};el.addEventListener('dblclick',block,true);el.addEventListener('contextmenu',block,true);return()=>{el.removeEventListener('dblclick',block,true);el.removeEventListener('contextmenu',block,true);};},[]);
 const online=!!room;
 function leaveRoom(){net.current?.close();net.current=null;setRoom(null);setConnecting(false);aim.current=null;drag.current=null;charge.current=0;}
 function roomMenu(){leaveRoom();setCopied(false);storeCup(null);setNetworkError('');setScreen('rooms');setPaused(false);}
 async function connectRoom(create:boolean){
  if(connecting)return;
  if(!create&&roomCode===TEST_COIN_CODE){try{const next=redeemTestCoins(wallet,roomCode);commitWallet(next);setRoomCode('');setNetworkError('');setRoomNotice(`Test coins ready: ${next.coins.toLocaleString()} coins. Open the Shop to unlock players.`);}catch{setNetworkError('Could not save test coins. Browser storage is unavailable.');}return;}
  setRoomNotice('');
  if(!create&&!/^[A-Z2-9]{6}$/.test(roomCode.trim().toUpperCase())){setNetworkError('Enter the six-character room code.');return;}
  setNetworkError('');setConnecting(true);net.current?.close();
  try{const url=new URL(server);if(!['ws:','wss:'].includes(url.protocol))throw Error('Use a ws:// or wss:// server address.');if(location.protocol==='https:'&&url.protocol!=='wss:')throw Error('Secure pages need a wss:// game server.');
   const client=new RoomClient(url.href,r=>{setRoom(r);if(art.current&&stadiums.current[r.stadium??0])art.current.stadium=stadiums.current[r.stadium??0];setConnecting(false);setDuration(r.duration);setMode(r.mode);},()=>{angle.current=net.current?.seat===1?-2.44:-.7;aim.current=null;drag.current=null;charge.current=0;setPaused(false);setScreen('match');setTimeout(()=>canvas.current?.focus(),0);},message=>{setNetworkError(message);setConnecting(false);},message=>{setRoom(null);setConnecting(false);setNetworkError(message);setScreen('rooms');setPaused(false);});
   net.current=client;await client.connect();client.send(create?{type:'create',team,avatar,mode:mode==='golden'?'golden':'normal',duration}:{type:'join',team,avatar,code:roomCode.trim().toUpperCase()});
  }catch(e){net.current?.close();net.current=null;setNetworkError(e instanceof Error?e.message:'Connection failed.');setConnecting(false);}
 }
 async function copyCode(){if(!room)return;try{await navigator.clipboard.writeText(room.code);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{setNetworkError(`Room code: ${room.code}`);}}
 const live=useRef({screen,paused,sound});live.current={screen,paused,sound};const angle=useRef(-.7),charge=useRef(0),initialised=useRef(false);
 function tone(goal=false){if(!live.current.sound)return;try{const a=audio.current||(audio.current=new AudioContext());void a.resume();const o=a.createOscillator(),v=a.createGain();o.connect(v);v.connect(a.destination);o.type=goal?'sine':'triangle';o.frequency.setValueAtTime(goal?740:230,a.currentTime);o.frequency.exponentialRampToValueAtTime(goal?1100:110,a.currentTime+.12);v.gain.setValueAtTime(goal?.12:.05,a.currentTime);v.gain.exponentialRampToValueAtTime(.001,a.currentTime+(goal?.7:.16));o.start();o.stop(a.currentTime+(goal?.7:.17));}catch{}}
 useEffect(()=>{
  const m=new Match();m.teams=['FRA','POR'];game.current=m;m.onGoal=()=>tone(true);let active=true,animation=0,previous=0,accumulator=0,lastUi=0;
  const image=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});
  void Promise.all([loadStadiums(),image('./art/ragdoll-atlas-v3.png'),image('./art/ball-v3.png'),loadCupCharacterAssets(),loadShopAssets()]).then(([arenas,sprites,ball])=>{if(active){art.current={stadium:arenas[0],sprites,parts:makeParts(sprites),ball:cropSprite(ball,0,0,ball.width,ball.height,16,16)};stadiums.current=arenas;setReady(true);}}).catch(()=>{if(active)setAssetError(true);});
  const draw=(t:number)=>{const dt=Math.min((t-previous)/1000||0,.05);previous=t;
   if(net.current?.active)net.current.render(m);
   if(live.current.screen==='match'&&!live.current.paused){if(!net.current?.active){accumulator+=dt;while(accumulator>=1/60){m.tick(1/60);accumulator-=1/60;}}
    if(charge.current>0){charge.current=Math.min(320,charge.current+dt*250);aim.current={x:Math.cos(angle.current)*charge.current,y:Math.sin(angle.current)*charge.current};}
    if(m.phase==='finished'){setHud({score:[...m.score],phase:m.phase,message:m.message,time:m.time,teams:[...m.teams],sudden:m.suddenDeath});setScreen('result');}
   }else accumulator=0;
   const c=canvas.current?.getContext('2d');if(c){c.save();paint(c,m,aim.current,art.current,live.current.screen==='title'||live.current.screen==='settings',net.current?.seat||0);c.restore();}
   if(t-lastUi>70){setHud({score:[...m.score],phase:m.phase,message:m.message,time:m.time,teams:[...m.teams],sudden:m.suddenDeath});lastUi=t;}
   animation=requestAnimationFrame(draw);
  };animation=requestAnimationFrame(draw);
  const visibility=()=>{if(document.hidden&&live.current.screen==='match'){if(!net.current?.active)setPaused(true);drag.current=null;aim.current=null;charge.current=0;}};document.addEventListener('visibilitychange',visibility);
  return()=>{active=false;net.current?.close();cancelAnimationFrame(animation);m.dispose();document.removeEventListener('visibilitychange',visibility);};
 },[]);
 function playSelectedMode(){
  if(!ready)return;
  launchTitleMode(titleMode,{
   cup:()=>{setMode('normal');select();},
   friendly:()=>{setMode('normal');roomMenu();},
   practice:()=>{
    leaveRoom();storeCup(null);setMode('practice');game.current!.start([team,'BRA'],'practice',difficulty,duration);
    angle.current=-.7;setPaused(false);setScreen('match');tone();setTimeout(()=>canvas.current?.focus(),0);
   }
  });
 }
 function beginCup(){setRewardCup(null);storeCup({...createCup(team),character:cupCharacter,runId:globalThis.crypto?.randomUUID?.()||`cup-${Date.now()}-${Math.random()}`,coinEligible:difficulty==='hard'});setScreen('cup');tone();}
 function begin(){if(cupRef.current&&playingRound.current)return;const m=game.current!,c=cupRef.current;let opponent='BRA';
  if(c){const f=playerFixture(c);if(!f)return;opponent=f.home===c.player?f.away:f.home;playingRound.current=roundToken(c);}
  if(c&&art.current){lastStadium.current=chooseStadium(lastStadium.current);art.current.stadium=stadiums.current[lastStadium.current];}
  angle.current=-.7;m.start([c?.player||team,opponent],c?'normal':mode,difficulty,duration);setPaused(false);aim.current=null;drag.current=null;charge.current=0;setScreen('match');tone();setTimeout(()=>canvas.current?.focus(),0);
 }
 function resetMenu(){leaveRoom();if(art.current&&stadiums.current[0])art.current.stadium=stadiums.current[0];game.current!.phase='idle';game.current!.teams=['FRA','POR'];setScreen('title');setPaused(false);drag.current=null;aim.current=null;charge.current=0;}
 function select(){if(!ready)return;storeCup(null);setScreen('select');tone();}
 const isDraw=hud.score[0]===hud.score[1];
 function advance(){const c=cupRef.current,m=game.current!;if(!c||!playingRound.current)return;
  if(c.stage!=='group'&&m.score[0]===m.score[1]){m.extraTime();setScreen('match');return;}
  finishRound(completeRound(c,playingRound.current,[m.score[0],m.score[1]]));playingRound.current=null;setScreen('cup');
 }
 function simulateRound(){const c=cupRef.current;if(!c||playerFixture(c))return;finishRound(completeRound(c,roundToken(c)));}
 function togglePause(){if(screen!=='match')return;setPaused(p=>!p);drag.current=null;aim.current=null;charge.current=0;}
 function point(e:React.PointerEvent<HTMLCanvasElement>){const r=e.currentTarget.getBoundingClientRect();return{x:(e.clientX-r.left)*1000/r.width,y:(e.clientY-r.top)*562/r.height};}
 function down(e:React.PointerEvent<HTMLCanvasElement>){if(e.button!==0||!e.isPrimary||e.detail>1)return;if(paused||screen!=='match'||game.current?.phase!=='playing')return;e.preventDefault();canvas.current?.focus();e.currentTarget.setPointerCapture(e.pointerId);drag.current=point(e);aim.current={x:0,y:0};}
 function move(e:React.PointerEvent<HTMLCanvasElement>){if(!drag.current)return;const p=point(e),sign=1;aim.current={x:(p.x-drag.current.x)*sign*2.1,y:(p.y-drag.current.y)*sign*2.1,pointer:p};}
 function launch(){if(aim.current&&game.current&&!paused){if(net.current?.active){net.current.send({type:'launch',x:aim.current.x*.058,y:aim.current.y*.058});tone();}else if(game.current.launch(0,aim.current.x*.058,aim.current.y*.058))tone();}drag.current=null;aim.current=null;charge.current=0;}
 function keyDown(e:React.KeyboardEvent){if(screen!=='match')return;if(e.key==='Escape'||e.key.toLowerCase()==='p'){e.preventDefault();togglePause();return;}if(screen!=='match'||paused)return;if(['ArrowLeft','ArrowRight',' '].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')angle.current-=.12;if(e.key==='ArrowRight')angle.current+=.12;if(e.key===' '&&!charge.current)charge.current=12;}}
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await frame.current?.requestFullscreen();}catch{}}
 const minutes=Math.min(90,Math.floor((1-hud.time/duration)*90));
 return <main className="game-page"><div className="cabinet" ref={frame}>
  <div className={`game-screen${screen==='title'?' is-title':screen==='select'?' is-team-select':screen==='shop'?' is-group-stage is-shop':screen==='creator'?' is-group-stage is-character-creator':screen==='cup'?' is-group-stage':''}`} onKeyDown={keyDown}>
   <canvas ref={canvas} width={1000} height={562} aria-label="Football pitch. Drag and release to launch. Left and right arrows aim; hold Space to charge. Escape pauses." tabIndex={0} onContextMenu={e=>e.preventDefault()} onDoubleClick={e=>{e.preventDefault();e.stopPropagation();}} onClickCapture={e=>{if(e.detail>1){e.preventDefault();e.stopPropagation();}}} onMouseDownCapture={e=>{if(e.detail>1){e.preventDefault();e.stopPropagation();}}} onDragStart={e=>e.preventDefault()} onPointerDown={down} onPointerMove={move} onPointerUp={launch} onPointerCancel={()=>{drag.current=null;aim.current=null;charge.current=0;}} onKeyUp={e=>{if(e.key===' '){e.preventDefault();launch();}}} onBlur={()=>{drag.current=null;aim.current=null;charge.current=0;}}/>
   {(!ready||assetError)&&<div className="loading-screen" role="status"><p>{assetError?'ART COULD NOT LOAD':'LOADING THE PITCH...'}</p>{assetError&&<button onClick={()=>location.reload()}>TRY AGAIN</button>}</div>}
   {screen==='title'&&ready&&<TitleScreen mode={titleMode} onMode={setTitleMode} onPlay={playSelectedMode} onSettings={()=>setScreen('settings')} onCreate={()=>openCreator(null,'title')} onShop={()=>setScreen('shop')}/>}
   {screen==='shop'&&ready&&<Shop wallet={wallet} onBuy={buyShopSkin} onEquip={equipShopSkin} onBack={()=>setScreen('title')}/>}
   {screen==='creator'&&<CharacterCreator key={editingId||'new'} saved={wardrobe.characters.find(c=>c.id===editingId)?.avatar||null} onSave={saveCharacter} onBack={()=>setScreen(creatorReturn)}/>}
   {screen==='select'&&<CupSelect character={cupCharacter} onCharacter={setCupCharacter} selected={team} onSelect={id=>{setTeam(id);tone();}} onBack={resetMenu} onDraw={beginCup}/>}
   {rewardCup&&<CupRewardScreen key={rewardCup.runId} cup={rewardCup} onClaim={collectCupReward} onClose={()=>setRewardCup(null)}/>}
   {screen==='cup'&&cup&&<CupHub cup={cup} onPlay={begin} onSimulate={simulateRound} onBack={resetMenu}/>}
   {screen==='rooms'&&<RoomLobby notice={roomNotice} wardrobe={roomWardrobe} onEquip={equipCharacter} onNew={()=>openCreator(null,'rooms')} onEdit={id=>openCreator(id,'rooms')} avatar={avatar} room={room} seat={net.current?.seat||0} team={team} code={roomCode} server={server} connecting={connecting} copied={copied} error={networkError} onCode={setRoomCode} onServer={setServer} onCreate={()=>connectRoom(true)} onJoin={()=>connectRoom(false)} onReady={()=>net.current?.send({type:'ready'})} onCopy={copyCode} onLeave={roomMenu} onBack={resetMenu}/>}
   {(screen==='match'||screen==='result')&&<>
    <div className="score-overlay"><span className="home-score">{hud.teams[0]} {hud.score[0]}</span><div className="match-clock"><button onClick={togglePause} aria-label={paused?'Resume game':'Pause game'}>{online?'☰':paused?'▶':'Ⅱ'}</button><span>{mode==='practice'?'∞':mode==='golden'||hud.sudden?'GG':`${minutes}′`}</span></div><span className="away-score">{mode==='practice'?'PRACTICE':`${hud.score[1]} ${hud.teams[1]}`}</span></div>
    {screen==='match'&&!paused&&(hud.phase==='countdown'||hud.phase==='goal')&&<div className={`announcement${hud.phase==='goal'?' goal-announcement':''}`} aria-live="polite"><span>{hud.phase==='countdown'?(hud.sudden?'NEXT GOAL WINS':mode==='practice'?'PRACTICE':`${online?'FRIEND MATCH':cup?stageLabel(cup):'MATCH'} · ${hud.teams[0]} VS ${hud.teams[1]}`):''}</span><strong>{hud.phase==='countdown'?hud.message:'GOAL!'}</strong></div>}
    {screen==='match'&&!paused&&hud.phase==='playing'&&mode==='practice'&&<span className="practice-hint">DRAG TO AIM · RELEASE TO LAUNCH · ESC TO PAUSE</span>}
   </>}
   {screen==='match'&&paused&&<section className="pause-screen"><h2>{online?'MATCH MENU':'PAUSED'}</h2>{online&&<p>THE ONLINE MATCH KEEPS PLAYING</p>}<button className="white-button" onClick={togglePause}>RESUME</button><button onClick={resetMenu}>MAIN MENU</button></section>}
   {screen==='settings'&&<section className="settings-screen"><h2>SETTINGS</h2><div className="difficulty-options" role="group" aria-label="Difficulty">{LEVELS.map(level=><button key={level} aria-pressed={difficulty===level} onClick={()=>changeDifficulty(level)}>{DIFFICULTIES[level].label.toUpperCase()}</button>)}</div><p className="difficulty-reward-note">{difficulty==='hard'?'HARD · INT. CUP COINS ENABLED':'INT. CUP COINS DISABLED'}<br/>Earn coins only on Hard. Easy and Regular award no coins.<br/>Changing away from Hard makes the current cup ineligible.</p><button onClick={()=>setSound(!sound)}>SOUND: {sound?'ON':'OFF'}</button><button onClick={()=>setDuration(duration===45?90:45)}>MATCH LENGTH: {duration} SECONDS</button><p>DRAG TOWARD YOUR TARGET<br/>RELEASE TO LAUNCH YOUR PLAYER</p><p>KEYBOARD: ← → AIM / HOLD SPACE TO CHARGE<br/>ESC OR P TO PAUSE</p><button className="white-button" onClick={()=>setScreen('title')}>BACK</button></section>}
   {screen==='result'&&!online&&<section className="result-screen"><span className="result-stage">{cup?stageLabel(cup):'MATCH'} · FULL TIME</span><h2>{hud.message}</h2><div className="final-score"><img src={`./flags/${TEAMS.find(t=>t.id===hud.teams[0])?.flag}.svg`} alt={hud.teams[0]}/><span>{hud.score[0]} - {hud.score[1]}</span><img src={`./flags/${TEAMS.find(t=>t.id===hud.teams[1])?.flag}.svg`} alt={hud.teams[1]}/></div><p>{cup?.stage==='group'?'YOUR RESULT + SIMULATED MATCHES UPDATE THE TABLES':isDraw?'DRAW · NEXT GOAL WINS':'CONTINUE TO SEE THE NEXT ROUND'}</p><div className="result-actions"><button className="white-button" onClick={advance}>{isDraw&&cup?.stage!=='group'?'GOLDEN GOAL':'UPDATE TABLES & CONTINUE'}</button><button onClick={resetMenu}>MAIN MENU</button></div></section>}
   {screen==='result'&&online&&<section className="result-screen"><span>FRIEND MATCH · FULL TIME</span><h2>{hud.score[0]===hud.score[1]?'DRAW':hud.score[net.current?.seat||0]>hud.score[1-(net.current?.seat||0)]?'YOU WIN!':'YOU LOSE'}</h2><div className="final-score">{hud.teams[0]} {hud.score[0]} - {hud.score[1]} {hud.teams[1]}</div><button className="white-button" onClick={()=>net.current?.send({type:'ready'})}>{room?.players[net.current?.seat||0]?.ready?'CANCEL REMATCH':'REMATCH'}</button><p>{room?.players.some(p=>p.ready)?'WAITING FOR BOTH PLAYERS TO ACCEPT':'BOTH PLAYERS MUST ACCEPT THE REMATCH'}</p><button onClick={resetMenu}>LEAVE ROOM</button></section>}
   {screen!=='title'&&<div className="pixel-overlay" aria-hidden="true"/>}
  </div>
  <div className="under-game"><span>{screen==='match'?(online?`YOU: ${net.current?.seat===0?'LEFT':'RIGHT'} · DRAG TOWARD TARGET`:'DRAG TOWARD TARGET · RELEASE'):screen==='cup'||screen==='select'?`INT. CUP · ${DIFFICULTIES[difficulty].label.toUpperCase()} · ${cup?cup.coinEligible?'COINS ENABLED':'NO COIN REWARDS':difficulty==='hard'?'COINS ENABLED':'NO COIN REWARDS'}`:'POCKET FOOTBALL v1.33 · RAGDOLL FOOTBALL'}</span><button onClick={fullscreen}>FULLSCREEN</button></div>
 </div></main>;
}
