import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(readFileSync('components/balhinbalay/InstallPrompt.jsx','utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText;
function setup({ios=false,standalone=false,blocked=false,cooldown=false}={}){
 let slots=[],idx=0,effect,cleanup,ready=false;const events=new Map(),timers=new Map(),storage=new Map();let timerId=0;
 if(cooldown)storage.set('balhinbalay-install-dismissed-until',String(Date.now()+100000));
 const react={useState:initial=>{const i=idx++;if(!(i in slots))slots[i]=initial;return[slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v];},useRef:initial=>{const i=idx++;if(!(i in slots))slots[i]={current:initial};return slots[i];},useEffect:fn=>{if(!ready)effect=fn;}};
 const media={matches:standalone,addEventListener:(k,f)=>events.set('media:'+k,f),removeEventListener:k=>events.delete('media:'+k)};
 const context={exports:{},require:n=>n==='react'?react:{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},window:{matchMedia:()=>media,addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k)},navigator:{userAgent:ios?'iPhone':'Android',platform:ios?'iPhone':'Linux',maxTouchPoints:1},localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return storage.get(k);},setItem:(k,v)=>{if(blocked)throw Error('blocked');storage.set(k,v);}},Date,setTimeout:f=>{timers.set(++timerId,f);return timerId;},clearTimeout:i=>timers.delete(i)};
 vm.runInNewContext(code,context);
 function render(){idx=0;const view=context.exports.default();if(!ready){ready=true;cleanup=effect();}return view;}
 render();return{render,events,storage,timers,fire:(name,arg)=>events.get(name)?.(arg),flush:()=>{for(const f of [...timers.values()])f();timers.clear();},cleanup:()=>cleanup?.()};
}
function buttons(v){return v.props.children[1].props.children.filter(Boolean);}
let x=setup();assert.equal(x.render(),null);let calls=0;
const event={preventDefault(){},prompt:async()=>{calls++;},userChoice:Promise.resolve({outcome:'dismissed'})};
x.fire('beforeinstallprompt',event);assert.ok(x.render());await buttons(x.render())[0].props.onClick();assert.equal(calls,1);assert.equal(x.render(),null);
x.fire('beforeinstallprompt',event);assert.equal(x.render(),null,'late event cannot undo dismissal');assert.ok(x.storage.size);x.cleanup();assert.equal(x.events.size,0);
x=setup({ios:true});x.fire('appinstalled');x.flush();assert.equal(x.render(),null,'iOS timer cannot undo installation');
x=setup({ios:true});x.flush();assert.ok(x.render());assert.equal(buttons(x.render()).length,1);buttons(x.render())[0].props.onClick();assert.equal(x.render(),null);
x=setup({standalone:true});x.flush();assert.equal(x.render(),null);
x=setup({cooldown:true});x.fire('beforeinstallprompt',event);assert.equal(x.render(),null);
x=setup({blocked:true});x.fire('beforeinstallprompt',event);buttons(x.render())[1].props.onClick();assert.equal(x.render(),null);x.fire('beforeinstallprompt',event);assert.equal(x.render(),null);
x=setup();x.fire('beforeinstallprompt',{...event,prompt:async()=>{throw Error('unavailable');}});await buttons(x.render())[0].props.onClick();assert.equal(x.render(),null);
console.log('PASS simulated React lifecycle: native user-click, dismissal/cooldown, blocked storage, installed mode, iOS timing, late events, error and listener cleanup. Native device installation NOT tested.');
