import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import {platform} from './platform';
import './style.css';
const root=createRoot(document.getElementById('root')!);
function LoadError(){return <main className="service-loading" role="alert"><p>COULD NOT LOAD YOUR GAME</p><p>Please check your connection and try again.</p><button onClick={()=>location.reload()}>RETRY</button></main>;}
class GameErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(error:unknown){platform.setLoading(false);platform.setGameplay(false);console.error('Game could not start',error);}
 render(){return this.state.failed?<LoadError/>:this.props.children;}
}
async function boot(){
 root.render(<main className="service-loading" role="status"><p>LOADING YOUR GAME...</p></main>);
 try{
  await platform.initialize();
  platform.setLoading(true);
  root.render(<GameErrorBoundary><App/></GameErrorBoundary>);
 }catch(error){
  console.error('Game initialization failed',error);
  root.render(<LoadError/>);
 }
}
void boot();
