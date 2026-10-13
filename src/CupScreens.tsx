import {useEffect,useRef,useState} from 'react';
import {Stars,Team,CharacterPreview,CupTrophy} from './CupVisuals';
export {Stars} from './CupVisuals';
import {GroupStageHub} from './GroupStage';
import {TEAMS,TEAM_BY_ID} from './teams';
import {Cup} from './cup';
import {KnockoutStage} from './KnockoutStage';
import {CUP_CHARACTERS} from './characters';
const REGIONS=['ALL','EUROPE','S. AMERICA','N. AMERICA','ASIA','AFRICA','OCEANIA'];
export function CupSelect({selected,onSelect,onBack,onDraw,character=0,onCharacter}:{selected:string;character?:number;onCharacter?:(n:number)=>void;onSelect:(id:string)=>void;onBack:()=>void;onDraw:()=>void}){
 const [search,setSearch]=useState(''),[region,setRegion]=useState('ALL');const roster=useRef<HTMLDivElement>(null);
 const shown=TEAMS.filter(t=>(region==='ALL'||t.region===region)&&`${t.name} ${t.id}`.toLowerCase().includes(search.toLowerCase().trim()));
 useEffect(()=>{if(roster.current)roster.current.scrollTop=0;},[search,region]);
 const t=TEAM_BY_ID[selected];
 return <section className="cup-screen cup-selection"><header className="selection-heading"><div className="selection-brand"><CupTrophy/><div><h2>INT. CUP</h2><p>TEAM SELECTION</p></div></div><button className="selection-back" onClick={onBack} aria-label="Back to title">←</button></header>
 <div className="selection-layout"><div className="selection-roster-panel"><nav className="selection-regions" aria-label="Filter teams by region">{REGIONS.map(r=><button key={r} aria-pressed={region===r} onClick={()=>setRegion(r)}>{r}</button>)}</nav>
 <div className="selection-search"><input type="search" aria-label="Find a national team" placeholder="Search teams…" value={search} onChange={e=>setSearch(e.target.value)}/><span>{shown.length} TEAMS</span></div>
 <div ref={roster} className="cup-roster" role="radiogroup" aria-label="Your national team">{shown.map(team=><label key={team.id} title={team.name} className={`cup-card ${selected===team.id?'chosen':''}`}><input type="radio" name="cup-team" aria-label={team.name} checked={selected===team.id} onChange={()=>onSelect(team.id)}/><img className="selection-flag" src={`./flags/${team.flag}.svg`} alt=""/><Stars id={team.id}/><span className="selection-code">{team.id}</span></label>)}{shown.length===0&&<p className="selection-no-results">No teams found.<button onClick={()=>{setSearch('');setRegion('ALL');}}>SHOW ALL TEAMS</button></p>}</div></div>
 <aside className="selection-preview" aria-label="Selected team"><div className="selection-team-heading"><img src={`./flags/${t.flag}.svg`} alt=""/><div><h3>{t.name}</h3><Stars id={selected}/></div></div>
 <div className="selection-preview-field"><div className="cup-character-picker"><button aria-label="Previous character" onClick={()=>onCharacter?.((character+5)%6)}>‹</button><CharacterPreview id={selected} character={character}/><button aria-label="Next character" onClick={()=>onCharacter?.((character+1)%6)}>›</button><span>{CUP_CHARACTERS[character].name} · {character+1}/6</span></div><div className="selection-details"><span>OVERALL</span><Stars id={selected}/><div className="selection-rating-bar" aria-hidden="true"><i style={{width:`${Math.min(5,t.stars)/5*100}%`}}/></div><p>48 TEAMS<br/>12 GROUPS<br/>ONE CUP</p></div></div>
 <p className="selection-rules">Choose your country.<br/>Finish in the top two to advance.</p><button className="confirm-team" onClick={onDraw}>CONFIRM TEAM</button></aside></div>
 </section>;
}
export function CupHub(props:{cup:Cup;onPlay:()=>void;onSimulate:()=>void;onBack:()=>void}){return props.cup.stage==='group'?<GroupStageHub cup={props.cup} onPlay={props.onPlay} onBack={props.onBack}/>:<KnockoutStage {...props}/>;}
