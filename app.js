const $ = (id) => document.getElementById(id);

const VERSION = '2.0.0';
const CF_DOWN = 'https://speed.cloudflare.com/__down';
const CF_UP = 'https://speed.cloudflare.com/__up';
const CF_TRACE = 'https://www.cloudflare.com/cdn-cgi/trace';
const IP_INFO = 'https://ipapi.co/json/';

const operators = {
  tigo: { name:'Tigo', legal:'Telefónica Celular del Paraguay S.A.E.' },
  personal: { name:'Personal', legal:'Núcleo S.A.' },
  claro: { name:'Claro', legal:'AMX Paraguay S.A.' },
  vox: { name:'VOX', legal:'Hola Paraguay S.A.' },
  copaco: { name:'COPACO', legal:'Compañía Paraguaya de Comunicaciones S.A.' }
};

const connectionLabels = {
  'mobile-5g':'Red móvil · 5G','mobile-4g':'Red móvil · 4G LTE','mobile-3g':'Red móvil · 3G','mobile-2g':'Red móvil · 2G / EDGE',
  fiber:'Wi-Fi / fijo · Fibra óptica FTTH',hfc:'Wi-Fi / fijo · Cable / HFC',dsl:'Wi-Fi / fijo · ADSL / VDSL',
  'fixed-wireless':'Wi-Fi / fijo · Inalámbrico fijo',satellite:'Wi-Fi / fijo · Satelital',ethernet:'Ethernet / LAN'
};

const coloNames = {EZE:'Buenos Aires, Argentina',GRU:'São Paulo, Brasil',GIG:'Rio de Janeiro, Brasil',SCL:'Santiago, Chile',MVD:'Montevideo, Uruguay',LIM:'Lima, Perú',MIA:'Miami, Estados Unidos'};

function median(values){const a=[...values].sort((x,y)=>x-y);const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2}
function mean(values){return values.reduce((a,b)=>a+b,0)/Math.max(values.length,1)}
function round2(n){return Number.isFinite(n)?n.toFixed(2):'—'}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function cacheBust(){return `r=${Date.now()}-${Math.random()}`}

function setPhase(name,speed=0,progress=0){
  $('phase').textContent=name;
  $('mainSpeed').textContent=round2(speed);
  const deg=Math.max(15,Math.min(345,15+progress*330));
  $('gauge').style.background=`conic-gradient(var(--cyan) 0deg,var(--violet) ${deg}deg,#18314a ${deg}deg 360deg)`;
}
function setProgress(text){$('progressText').textContent=text}
function setActiveMetric(id){document.querySelectorAll('.metric').forEach(x=>x.classList.remove('active'));if(id)$(id)?.closest('.metric')?.classList.add('active')}

function inferKnownOperator(org=''){
  const s=org.toLowerCase();
  if(s.includes('telefonica celular del paraguay')||s.includes('tigo')) return 'tigo';
  if(s.includes('nucleo')||s.includes('personal paraguay')) return 'personal';
  if(s.includes('amx paraguay')||s.includes('claro paraguay')) return 'claro';
  if(s.includes('hola paraguay')||s.includes('vox')) return 'vox';
  if(s.includes('compania paraguaya de comunicaciones')||s.includes('copaco')) return 'copaco';
  return null;
}

function renderOperatorFromSelection(){
  const selected=$('operatorSelect').value;
  if(selected==='auto') return detectNetworkIdentity();
  if(operators[selected]){
    $('operatorName').textContent=operators[selected].name;
    $('operatorLegal').textContent=operators[selected].legal;
    $('operatorLegal').dataset.manual='1';
  } else {
    $('operatorName').textContent='Otro operador';
    $('operatorLegal').textContent='Confirmado manualmente';
    $('operatorLegal').dataset.manual='1';
  }
  localStorage.setItem('netspeed.operator',selected);
}

async function detectNetworkIdentity(){
  try{
    const res=await fetch(`${IP_INFO}?${cacheBust()}`,{cache:'no-store'});
    if(!res.ok) throw new Error('IP lookup failed');
    const d=await res.json();
    const org=d.org||d.asn||'Red no identificada';
    $('publicIp').textContent=d.ip||'—';
    $('networkLocation').textContent=[d.city,d.country_name].filter(Boolean).join(', ')||'—';
    $('asnOrg').textContent=`ASN / red: ${org}`;
    const match=inferKnownOperator(org);
    if(match){$('operatorName').textContent=operators[match].name;$('operatorLegal').textContent=operators[match].legal}
    else {$('operatorName').textContent='Operador no confirmado';$('operatorLegal').textContent='La IP pertenece a: '+org}
  }catch(e){
    $('operatorName').textContent='Operador no confirmado';$('operatorLegal').textContent='No se pudo consultar la red pública';$('asnOrg').textContent='ASN / red: —';
  }
}

async function detectCloudflareColo(){
  try{
    const r=await fetch(`${CF_TRACE}?${cacheBust()}`,{cache:'no-store'});const t=await r.text();
    const kv=Object.fromEntries(t.trim().split('\n').map(line=>line.split('=')));
    const colo=kv.colo||'—';$('serverLocation').textContent=`${coloNames[colo]||'Nodo Cloudflare'} · nodo ${colo}`;
  }catch{$('serverLocation').textContent='Nodo Cloudflare · ubicación no disponible'}
}

function detectBrowserConnection(){
  $('onlineStatus').textContent=navigator.onLine?'En línea':'Sin conexión';
  const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(!c){$('browserEstimate').textContent='Sin estimación del navegador';return}
  const parts=[];if(c.effectiveType)parts.push(`perfil ${c.effectiveType}`);if(c.downlink)parts.push(`≈ ${c.downlink} Mbps`);if(c.rtt)parts.push(`RTT ≈ ${c.rtt} ms`);
  $('browserEstimate').textContent=parts.length?parts.join(' · '):'Sin estimación del navegador';
}

async function pingOnce(){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),3500);const t0=performance.now();
  try{const r=await fetch(`${CF_DOWN}?bytes=0&${cacheBust()}`,{cache:'no-store',signal:controller.signal});if(!r.ok)throw new Error();await r.arrayBuffer();return performance.now()-t0}
  finally{clearTimeout(timer)}
}

async function measureLatency(){
  setPhase('PING',0,.06);setActiveMetric('ping');setProgress('Midiendo latencia y estabilidad…');
  const values=[];
  for(let i=0;i<9;i++){
    try{const ms=await pingOnce();values.push(ms);setProgress(`Ping ${i+1}/9 · ${ms.toFixed(0)} ms`)}catch{}
    await sleep(80);
  }
  if(values.length<3) throw new Error('No se pudo medir el ping');
  const usable=values.slice(1);const p=median(usable);const diffs=[];for(let i=1;i<usable.length;i++)diffs.push(Math.abs(usable[i]-usable[i-1]));
  const j=mean(diffs);$('ping').textContent=p.toFixed(0);$('jitter').textContent=j.toFixed(1);return{ping:p,jitter:j}
}

async function downloadWorker(endAt,onBytes){
  while(performance.now()<endAt){
    const controller=new AbortController();const remaining=Math.max(700,endAt-performance.now()+300);const timer=setTimeout(()=>controller.abort(),remaining);
    try{
      const r=await fetch(`${CF_DOWN}?bytes=5000000&${cacheBust()}`,{cache:'no-store',signal:controller.signal});if(!r.ok)continue;
      if(r.body?.getReader){const reader=r.body.getReader();while(true){const {done,value}=await reader.read();if(done)break;if(value)onBytes(value.byteLength);if(performance.now()>=endAt){controller.abort();break}}}
      else {const b=await r.arrayBuffer();onBytes(b.byteLength)}
    }catch(e){}finally{clearTimeout(timer)}
  }
}

async function measureDownload(durationMs=8000,streams=4){
  setActiveMetric('download');setPhase('DESCARGA',0,.12);setProgress('Preparando conexiones de descarga…');
  let bytes=0;const start=performance.now();const endAt=start+durationMs;const add=n=>{bytes+=n};
  const ui=setInterval(()=>{const elapsed=(performance.now()-start)/1000;const mbps=(bytes*8)/Math.max(elapsed,.1)/1e6;const progress=Math.min(1,(performance.now()-start)/durationMs);setPhase('DESCARGA',mbps,.12+.42*progress);$('download').textContent=round2(mbps);setProgress(`Descarga multiconexión · ${Math.round(progress*100)}%`)},180);
  await Promise.all(Array.from({length:streams},()=>downloadWorker(endAt,add)));clearInterval(ui);
  const seconds=(performance.now()-start)/1000;const mbps=(bytes*8)/seconds/1e6;$('download').textContent=round2(mbps);setPhase('DESCARGA',mbps,.54);return mbps;
}

async function uploadWorker(endAt,payload,onBytes){
  while(performance.now()<endAt){
    const controller=new AbortController();const remaining=Math.max(900,endAt-performance.now()+400);const timer=setTimeout(()=>controller.abort(),remaining);
    try{const r=await fetch(`${CF_UP}?${cacheBust()}`,{method:'POST',body:payload,cache:'no-store',signal:controller.signal});if(r.ok)onBytes(payload.size)}catch(e){}finally{clearTimeout(timer)}
  }
}

async function measureUpload(durationMs=8000,streams=3){
  setActiveMetric('upload');setPhase('SUBIDA',0,.58);setProgress('Preparando conexiones de subida…');
  const payload=new Blob([new Uint8Array(1000000)]);let bytes=0;const start=performance.now();const endAt=start+durationMs;const add=n=>{bytes+=n};
  const ui=setInterval(()=>{const elapsed=(performance.now()-start)/1000;const mbps=(bytes*8)/Math.max(elapsed,.1)/1e6;const progress=Math.min(1,(performance.now()-start)/durationMs);setPhase('SUBIDA',mbps,.58+.4*progress);$('upload').textContent=round2(mbps);setProgress(`Subida multiconexión · ${Math.round(progress*100)}%`)},180);
  await Promise.all(Array.from({length:streams},()=>uploadWorker(endAt,payload,add)));clearInterval(ui);
  const seconds=(performance.now()-start)/1000;const mbps=(bytes*8)/seconds/1e6;$('upload').textContent=round2(mbps);setPhase('SUBIDA',mbps,.98);return mbps;
}

async function runTest(){
  $('startBtn').disabled=true;['ping','jitter','download','upload'].forEach(id=>$(id).textContent='—');setPhase('INICIANDO',0,.02);
  try{await measureLatency();await sleep(250);await measureDownload();await sleep(350);await measureUpload();setPhase('COMPLETO',Number($('download').textContent)||0,1);setProgress('Prueba completada · descarga y subida guardadas por separado');setActiveMetric(null)}
  catch(e){console.error(e);setPhase('ERROR',0,.05);setProgress('No se pudo completar la prueba. Revisá la conexión e intentá nuevamente.');setActiveMetric(null)}
  finally{$('startBtn').disabled=false}
}

function applySavedSettings(){
  const op=localStorage.getItem('netspeed.operator');if(op&&$('operatorSelect').querySelector(`option[value="${op}"]`))$('operatorSelect').value=op;
  const conn=localStorage.getItem('netspeed.connection');if(conn&&$('connectionSelect').querySelector(`option[value="${conn}"]`))$('connectionSelect').value=conn;
  if(op&&op!=='auto')renderOperatorFromSelection();
  if(conn&&conn!=='auto'){$('connectionLabel').textContent=connectionLabels[conn]||'Confirmada manualmente';$('connectionSource').textContent='Dato confirmado manualmente'}
}

$('startBtn').addEventListener('click',runTest);
$('operatorSelect').addEventListener('change',()=>{const v=$('operatorSelect').value;localStorage.setItem('netspeed.operator',v);renderOperatorFromSelection()});
$('connectionSelect').addEventListener('change',()=>{const v=$('connectionSelect').value;localStorage.setItem('netspeed.connection',v);if(v==='auto'){$('connectionLabel').textContent='No identificada';$('connectionSource').textContent='Podés confirmarla abajo'}else{$('connectionLabel').textContent=connectionLabels[v];$('connectionSource').textContent='Dato confirmado manualmente'}});
window.addEventListener('online',detectBrowserConnection);window.addEventListener('offline',detectBrowserConnection);

(async function init(){
  detectBrowserConnection();applySavedSettings();
  if($('operatorSelect').value==='auto')await detectNetworkIdentity();
  await detectCloudflareColo();
  if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}
})();
