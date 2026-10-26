import { Component, type ReactNode } from 'react';
interface Props { children:ReactNode; }
interface State { error:boolean; }
export default class SceneErrorBoundary extends Component<Props,State>{state={error:false};static getDerivedStateFromError(){return {error:true};}componentDidCatch(error:Error){console.log('[MYTHOS] Rendering error',error);}render(){if(this.state.error)return <div className="loading"><h2>The sanctuary needs WebGL.</h2><p>ENABLE HARDWARE ACCELERATION AND RELOAD</p><button className="panel-submit" style={{width:200}} onClick={()=>globalThis.location.reload()}>Retry sanctuary</button></div>;return this.props.children;}}
