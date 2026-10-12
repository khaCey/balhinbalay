import {useEffect,useRef} from 'react';
import {defaults} from './data';
import {useApp} from './model';
import {normaliseQuery} from './browserState';
import {fetchRealListings} from './realInventory';

export default function WebTools(){
 const app=useApp(),latest=useRef(app);
 useEffect(()=>{latest.current=app;},[app]);
 useEffect(()=>{
  const context=document.modelContext;if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  const register=tool=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{/* Optional browser capability. */}};
  register({name:'read_property_results',title:'Read real property results',description:'Read currently eligible real listings matching the visible search.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},async execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Expected an empty object.');const data=await fetchRealListings(latest.current.state.q,{all:true});return {query:latest.current.state.q,properties:data.listings.map(p=>({id:p.id,title:p.title,city:p.location.city,price:p.price_amount,mode:p.transaction_type,type:p.property.property_type}))};}});
  register({name:'start_property_search',title:'Start a real property search',description:'Set rent or sale, city and keyword and open real listing results.',inputSchema:{type:'object',properties:{mode:{type:'string',enum:['Rent','Buy']},city:{type:'string',maxLength:100},keyword:{type:'string',maxLength:200}},required:['mode'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['mode','city','keyword'].includes(k))||!['Rent','Buy'].includes(input.mode)||('city'in input&&(typeof input.city!=='string'||input.city.length>100))||('keyword'in input&&(typeof input.keyword!=='string'||input.keyword.length>200)))throw new Error('Provide a valid Rent/Buy mode, city and keyword.');const q=normaliseQuery({...defaults(),mode:input.mode,cities:input.city?[input.city]:[],keyword:input.keyword||'',method:'Keyword'});latest.current.startSearch(q);const data=await fetchRealListings(q,{all:true});return {page:'results',count:data.total};}});
  return ()=>lifecycle.abort();
 },[]);
 return null;
}
