const $ = (id) => document.getElementById(id);

const providers = [
  { aliases: ['telecel','telefonica celular del paraguay','telefónica celular del paraguay','tigo paraguay','tigo'], brand: 'Tigo', legal: 'Telefónica Celular del Paraguay S.A.E.', badge: 'TIGO' },
  { aliases: ['nucleo','núcleo','personal paraguay','personal'], brand: 'Personal', legal: 'Núcleo S.A.', badge: 'PERSONAL' },
  { aliases: ['amx paraguay','claro paraguay','claro'], brand: 'Claro', legal: 'AMX Paraguay S.A.', badge: 'CLARO' },
  { aliases: ['hola paraguay','vox paraguay','vox'], brand: 'VOX', legal: 'Hola Paraguay S.A.', badge: 'VOX' },
  { aliases: ['copaco','compania paraguaya de comunicaciones','compañía paraguaya de comunicaciones'], brand: 'COPACO', legal: 'Compañía Paraguaya de Comunicaciones S.A.', badge: 'COPACO' }
];

const coloMap = {
  EZE: 'Buenos Aires, Argentina', GRU: 'São Paulo, Brasil', GIG: 'Río de Janeiro, Brasil',
  SCL: 'Santiago, Chile', MVD: 'Montevideo, Uruguay', LIM: 'Lima, Perú', MIA: 'Miami, Estados Unidos',
  DFW: 'Dallas, Estados Unidos', IAD: 'Ashburn, Estados Unidos', LAX: 'Los Ángeles, Estados Unidos'
};

const accessOptions = {
  mobile: ['5G', '4G LTE', '3G', '2G / EDGE', 'Otra red móvil'],
  wifi: ['Fibra óptica (FTTH)', 'Cable / HFC', 'ADSL / VDSL', 'Internet fijo inalámbrico', 'Internet satelital', 'Otro acceso fijo'],
  ethernet: ['Fibra óptica (FTTH)', 'Cable / HFC', 'ADSL / VDSL', 'Red corporativa / Ethernet', 'Otro acceso fijo']
};

function identifyProvider(org = '') {
  const haystack = org.toLowerCase();
  return providers.find(p => p.aliases.some(a => haystack.includes(a))) || null;
}

function setProvider(data) {
  const match = identifyProvider(`${data.org || ''} ${data.asn || ''}`);
  $('publicIp').textContent = data.ip || '—';
  $('networkLocation').textContent = [data.city, data.country_name || data.country].filter(Boolean).join(', ') || '—';
  if (match) {
    $('providerName').textContent = match.brand;
    $('providerLegal').textContent = match.legal;
    $('providerBadge').textContent = match.badge;
  } else {
    $('providerName').textContent = data.org || 'Proveedor no identificado';
    $('providerLegal').textContent = data.org ? 'Razón social no asociada en NetSpeed' : 'No disponible';
    $('providerBadge').textContent = 'ISP';
  }
}

async function detectNetwork() {
  try {
    const [ipRes, traceRes] = await Promise.allSettled([
      fetch('https://ipapi.co/json/', { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject()),
      fetch('https://speed.cloudflare.com/cdn-cgi/trace', { cache: 'no-store' }).then(r => r.ok ? r.text() : Promise.reject())
    ]);
    if (ipRes.status === 'fulfilled') setProvider(ipRes.value);
    else {
      $('providerName').textContent = 'Proveedor no detectado';
      $('providerLegal').textContent = 'La consulta de IP no estuvo disponible';
    }
    if (traceRes.status === 'fulfilled') {
      const trace = Object.fromEntries(traceRes.value.trim().split('\n').map(line => line.split('=')));
      const colo = trace.colo || '';
      $('serverLocation').textContent = colo ? `${coloMap[colo] || colo} · nodo ${colo}` : 'Nodo automático de Cloudflare';
      if ($('publicIp').textContent === '—' && trace.ip) $('publicIp').textContent = trace.ip;
    } else {
      $('serverLocation').textContent = 'Nodo automático de Cloudflare';
    }
  } catch {
    $('providerName').textContent = 'Proveedor no detectado';
    $('providerLegal').textContent = 'No disponible';
  }
}

function detectBrowserConnection() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return;
  const pieces = [];
  if (c.effectiveType) pieces.push(`perfil ${c.effectiveType.toUpperCase()}`);
  if (Number.isFinite(c.downlink)) pieces.push(`≈ ${c.downlink} Mbps`);
  if (Number.isFinite(c.rtt)) pieces.push(`RTT ≈ ${c.rtt} ms`);
  if (pieces.length) $('browserEstimate').textContent = `Estimación: ${pieces.join(' · ')}`;
}

function updateOnlineState() {
  $('onlineStatus').textContent = navigator.onLine ? 'En línea' : 'Sin conexión';
}
window.addEventListener('online', updateOnlineState);
window.addEventListener('offline', updateOnlineState);

const category = $('accessCategory');
const technology = $('accessTechnology');
function loadSavedAccess() {
  const saved = JSON.parse(localStorage.getItem('netspeed-access') || 'null');
  if (!saved) return;
  category.value = saved.category;
  refreshTechnology(saved.technology);
  applyAccessSummary(saved.category, saved.technology);
}
function refreshTechnology(selected = '') {
  const values = accessOptions[category.value] || [];
  technology.innerHTML = values.length ? '<option value="">Seleccionar…</option>' : '<option value="">Primero seleccioná una categoría</option>';
  values.forEach(v => {
    const o = document.createElement('option'); o.value = v; o.textContent = v; technology.appendChild(o);
  });
  technology.disabled = !values.length;
  if (selected) technology.value = selected;
}
function applyAccessSummary(cat, tech) {
  if (!cat || !tech) return;
  const prefix = cat === 'mobile' ? 'Red móvil' : cat === 'wifi' ? 'Wi‑Fi' : 'Ethernet';
  $('connectionSummary').textContent = `${prefix} · ${tech}`;
  $('connectionSource').textContent = 'Dato confirmado manualmente';
  $('confirmedBadge').classList.remove('hidden');
}
category.addEventListener('change', () => {
  refreshTechnology();
  $('confirmedBadge').classList.add('hidden');
  $('connectionSummary').textContent = category.options[category.selectedIndex]?.text || 'No identificada';
  $('connectionSource').textContent = 'Elegí la tecnología para confirmar';
});
technology.addEventListener('change', () => {
  if (!category.value || !technology.value) return;
  localStorage.setItem('netspeed-access', JSON.stringify({ category: category.value, technology: technology.value }));
  applyAccessSummary(category.value, technology.value);
});

const PING_URL = 'https://speed.cloudflare.com/__down?bytes=0';
const DOWNLOAD_BYTES = 20_000_000;
const DOWNLOAD_URL = `https://speed.cloudflare.com/__down?bytes=${DOWNLOAD_BYTES}`;
const UPLOAD_URL = 'https://speed.cloudflare.com/__up';

function setPhase(label) { $('phaseLabel').textContent = label; }
function setSpeed(value) {
  const n = Math.max(0, Number(value) || 0);
  $('mainSpeed').textContent = n.toFixed(2);
  const deg = Math.min(330, 30 + Math.log10(n + 1) * 110);
  $('speedRing').style.background = `conic-gradient(var(--accent) 0deg,var(--accent2) ${deg}deg,#1a3047 ${deg}deg 360deg)`;
}

async function pingTest(samples = 7) {
  const times = [];
  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    const res = await fetch(`${PING_URL}&r=${Math.random()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Ping failed');
    await res.arrayBuffer();
    times.push(performance.now() - start);
  }
  const avg = times.reduce((a,b) => a+b, 0) / times.length;
  const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length;
  return { ping: avg, jitter: Math.sqrt(variance) };
}

async function downloadTest() {
  const start = performance.now();
  const res = await fetch(`${DOWNLOAD_URL}&r=${Math.random()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Download failed');
  const reader = res.body?.getReader();
  let total = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      const sec = (performance.now() - start) / 1000;
      if (sec > .2) setSpeed((total * 8) / sec / 1_000_000);
    }
  } else {
    const blob = await res.blob(); total = blob.size;
  }
  const seconds = (performance.now() - start) / 1000;
  return (total * 8) / seconds / 1_000_000;
}

async function uploadTest() {
  const size = 6_000_000;
  const payload = new Uint8Array(size);
  const start = performance.now();
  const res = await fetch(UPLOAD_URL, { method: 'POST', body: payload, cache: 'no-store' });
  if (!res.ok) throw new Error('Upload failed');
  const seconds = (performance.now() - start) / 1000;
  return (size * 8) / seconds / 1_000_000;
}

$('startBtn').addEventListener('click', async () => {
  const btn = $('startBtn');
  btn.disabled = true;
  ['ping','jitter','download','upload'].forEach(id => $(id).textContent = '—');
  setSpeed(0);
  try {
    setPhase('PING');
    const p = await pingTest();
    $('ping').textContent = p.ping.toFixed(0);
    $('jitter').textContent = p.jitter.toFixed(1);

    setPhase('DESCARGA');
    const down = await downloadTest();
    $('download').textContent = down.toFixed(2);
    setSpeed(down);

    setPhase('SUBIDA');
    const up = await uploadTest();
    $('upload').textContent = up.toFixed(2);
    setSpeed(up);
    setPhase('COMPLETO');
  } catch (e) {
    console.error(e);
    setPhase('ERROR');
    alert('No se pudo completar la prueba. Revisá la conexión e intentá nuevamente.');
  } finally {
    btn.disabled = false;
  }
});

let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredInstallPrompt = e; $('installBtn').classList.remove('hidden');
});
$('installBtn').addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null; $('installBtn').classList.add('hidden');
});

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(console.error));

updateOnlineState();
detectBrowserConnection();
loadSavedAccess();
detectNetwork();
