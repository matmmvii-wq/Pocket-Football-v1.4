import {Avatar,normalizeAvatar} from './avatar';

export type InviteParams=Record<string,unknown>;
export type MultiplayerRequest={kind:'create'}|{kind:'join';code:string}|{kind:'invalid'};
export type RoomPresence={roomId:string;isJoinable:boolean;inviteParams:{roomCode:string}};

export function roomCode(value:unknown):string|null{
 if(typeof value!=='string')return null;
 const code=value.trim().toUpperCase();return /^[A-Z2-9]{6}$/.test(code)?code:null;
}
export function invitationRequest(params:unknown):MultiplayerRequest{
 const code=params&&typeof params==='object'&&!Array.isArray(params)?roomCode((params as InviteParams).roomCode):null;
 return code?{kind:'join',code}:{kind:'invalid'};
}
export function startupMultiplayer(params:unknown,instant:boolean):MultiplayerRequest|null{
 // An invitation always takes priority over the party-leader flag.
 if(params!=null&&(typeof params!=='object'||Object.keys(params).length))return invitationRequest(params);
 return instant?{kind:'create'}:null;
}
export function roomPresence(room:{code:string;players:unknown[];isJoinable?:boolean}|null):RoomPresence|null{
 const code=room&&roomCode(room.code);if(!room||!code)return null;
 return {roomId:code,isJoinable:room.isJoinable!==false&&room.players.length<2,inviteParams:{roomCode:code}};
}
// Display metadata only. Never use this field as an account ID or authorization.
export function displayUsername(value:unknown):string|null{
 return typeof value==='string'&&/^[A-Za-z0-9._]{1,20}$/.test(value)?value:null;
}
export function playerName(player:{username?:string|null}|undefined,seat:number){
 return displayUsername(player?.username)||`Guest ${seat+1}`;
}
// Character labels belong to the owner's wardrobe, not the network payload.
export function publicAvatar(value:unknown):Avatar{
 const avatar=normalizeAvatar(value);return {...avatar,name:avatar.skinId?avatar.name:'Custom Player'};
}
