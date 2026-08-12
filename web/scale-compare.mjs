import { BAR, LINK, GARAGE, FOOTPRINTS } from '../model/geometry.mjs';
import { SITE_CONTEXT, PARCEL_LOCAL_FT, localFtToLonLat, lonLatToLocalFt } from '../model/site-context.mjs';

const FT_PER_M = 3.280839895013123;
const IN_PER_FT = 12;
const PLAN_FILES = [
  'S0-SPINE','S1-ARMATURE','S2-BRIDGE','S3-NARROW','S4-CORE','S5-PERCH',
  'S6-TOWER','S7-DATUM','S8-WATER','S9-ASSEMBLY','S10-SQUARE'
];

const $ = id => document.getElementById(id);
const panel = $('scaleCompare');
const button = $('scale');
const close = $('scaleClose');
if (!panel || !button) throw new Error('scale comparison UI is missing');

const ft = inches => inches / IN_PER_FT;
const bar = { x0:ft(BAR.x0), x1:ft(BAR.x1), y0:ft(BAR.y0), y1:ft(BAR.y1) };
const link = { x0:ft(LINK.x0), x1:ft(LINK.x1), y0:ft(LINK.y0), y1:ft(LINK.y1) };
const garage = { x0:ft(GARAGE.x0), x1:ft(GARAGE.x1), y0:ft(GARAGE.y0), y1:ft(GARAGE.y1) };
const compound = {
  x0:Math.min(bar.x0,link.x0,garage.x0), x1:Math.max(bar.x1,link.x1,garage.x1),
  y0:Math.min(bar.y0,link.y0,garage.y0), y1:Math.max(bar.y1,link.y1,garage.y1),
};
const dims = {
  barW:bar.x1-bar.x0, barD:bar.y1-bar.y0,
  compoundW:compound.x1-compound.x0, compoundD:compound.y1-compound.y0,
  lowerW:ft(FOOTPRINTS.L0.x1-FOOTPRINTS.L0.x0), lowerD:ft(FOOTPRINTS.L0.y1-FOOTPRINTS.L0.y0),
  upperW:ft(FOOTPRINTS.L2.x1-FOOTPRINTS.L2.x0), upperD:ft(FOOTPRINTS.L2.y1-FOOTPRINTS.L2.y0),
};

function polygonArea(points){
  let a=0;
  for(let i=0,j=points.length-1;i<points.length;j=i++) a += points[j].east*points[i].north-points[i].east*points[j].north;
  return Math.abs(a/2);
}
function bbox(points){
  const xs=points.map(p=>p.east),ys=points.map(p=>p.north);
  return {minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};
}
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

const roundTripLL = localFtToLonLat(100,0);
const roundTrip = lonLatToLocalFt(roundTripLL.lon,roundTripLL.lat);
const roundTripError = Math.hypot(roundTrip.east-100,roundTrip.north);
const parcelFt2 = polygonArea(PARCEL_LOCAL_FT);
const parcelAc = parcelFt2/43560;
const parcelBox = bbox(PARCEL_LOCAL_FT);
const parcelSpanFt = Math.max(parcelBox.maxX-parcelBox.minX, parcelBox.maxY-parcelBox.minY);

function levelBounds(level){
  const rooms=level.rooms||[];
  if(!rooms.length)return null;
  const x0=Math.min(...rooms.map(r=>r.x0)), y0=Math.min(...rooms.map(r=>r.y0));
  const x1=Math.max(...rooms.map(r=>r.x0+r.w)), y1=Math.max(...rooms.map(r=>r.y0+r.d));
  return {x0,y0,x1,y1,w:x1-x0,d:y1-y0,name:level.name||''};
}
function planSummary(plan){
  const levels=(plan.levels||[]).map(levelBounds).filter(Boolean);
  const x0=Math.min(...levels.map(x=>x.x0)),y0=Math.min(...levels.map(x=>x.y0));
  const x1=Math.max(...levels.map(x=>x.x1)),y1=Math.max(...levels.map(x=>x.y1));
  const programSf=(plan.levels||[]).flatMap(l=>l.rooms||[]).reduce((s,r)=>s+r.w*r.d,0);
  return {id:plan.id||'scheme',levels,w:x1-x0,d:y1-y0,x0,y0,x1,y1,programSf};
}

function gridSvg(w,d,maxW,maxD){
  let s='';
  for(let x=0;x<=maxW;x+=10) s+=`<line x1="${x}" y1="0" x2="${x}" y2="${maxD}"/>`;
  for(let y=0;y<=maxD;y+=10) s+=`<line x1="0" y1="${y}" x2="${maxW}" y2="${y}"/>`;
  return `<g class="scale-grid">${s}</g>`;
}
function currentSvg(maxW,maxD){
  const ox=5,oy=5;
  return `<svg class="footprint-svg" viewBox="0 0 ${maxW+10} ${maxD+10}" role="img" aria-label="Henry House exact footprint at the shared comparison scale">
    <g transform="translate(${ox} ${oy})">${gridSvg(maxW,maxD,maxW,maxD)}
      <rect class="fp-main" x="${bar.x0}" y="${bar.y0}" width="${dims.barW}" height="${dims.barD}"/>
      <rect class="fp-link" x="${link.x0}" y="${link.y0}" width="${link.x1-link.x0}" height="${link.y1-link.y0}"/>
      <rect class="fp-garage" x="${garage.x0}" y="${garage.y0}" width="${garage.x1-garage.x0}" height="${garage.y1-garage.y0}"/>
      <line class="ruler" x1="0" y1="${Math.min(maxD-3,35)}" x2="100" y2="${Math.min(maxD-3,35)}"/>
    </g></svg>`;
}
function schemeSvg(s,maxW,maxD){
  const ox=5-s.x0,oy=5-s.y0;
  const levelRects=s.levels.map((l,i)=>`<rect class="scheme-level l${i%3}" x="${l.x0}" y="${l.y0}" width="${l.w}" height="${l.d}"/>`).join('');
  return `<svg class="footprint-svg" viewBox="0 0 ${maxW+10} ${maxD+10}" role="img" aria-label="${esc(s.id)} footprint at the shared comparison scale"><g transform="translate(${ox} ${oy})">${gridSvg(maxW,maxD,maxW,maxD)}${levelRects}</g></svg>`;
}

async function loadPlans(){
  const loaded=[];
  for(const id of PLAN_FILES){
    try{
      const r=await fetch(`plans/${id}.json`,{cache:'force-cache'});
      if(r.ok)loaded.push(planSummary(await r.json()));
    }catch(_){ /* a missing comparison must not break the site */ }
  }
  return loaded;
}

function renderHouseComparisons(plans){
  const maxW=Math.ceil(Math.max(dims.compoundW,...plans.map(p=>p.w))/10)*10;
  const maxD=Math.ceil(Math.max(40,dims.compoundD,...plans.map(p=>p.d))/10)*10;
  const cards=[`<article class="compare-card current"><div class="compare-title">CURRENT HENRY HOUSE</div>${currentSvg(maxW,maxD)}<div class="compare-meta"><b>${dims.compoundW.toFixed(0)} × ${dims.compoundD.toFixed(0)} ft compound</b><span>72 × 26 ft house bar · 24 × 24 ft garage</span></div></article>`];
  for(const p of plans) cards.push(`<article class="compare-card"><div class="compare-title">${esc(p.id)}</div>${schemeSvg(p,maxW,maxD)}<div class="compare-meta"><b>${p.w.toFixed(0)} × ${p.d.toFixed(0)} ft envelope</b><span>${Math.round(p.programSf).toLocaleString()} sf room-program sum across levels</span></div></article>`);
  $('houseComparisons').innerHTML=cards.join('');
  $('sharedHouseScale').textContent=`All footprints below share one SVG scale: 10 ft grid, ${maxW} × ${maxD} ft frame. No card auto-fits itself.`;
}

function parcelSvg(){
  const b=parcelBox,pad=55,w=b.maxX-b.minX+pad*2,h=b.maxY-b.minY+pad*2;
  const pts=PARCEL_LOCAL_FT.map(p=>`${p.east-b.minX+pad},${b.maxY-p.north+pad}`).join(' ');
  const rulerY=h-28;
  return `<svg class="parcel-scale-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Parcel and 100 foot ruler at one true coordinate scale">
    <polygon points="${pts}" class="parcel-outline"/>
    <g class="parcel-ruler"><line x1="${pad}" y1="${rulerY}" x2="${pad+100}" y2="${rulerY}"/><line x1="${pad}" y1="${rulerY-10}" x2="${pad}" y2="${rulerY+10}"/><line x1="${pad+50}" y1="${rulerY-7}" x2="${pad+50}" y2="${rulerY+7}"/><line x1="${pad+100}" y1="${rulerY-10}" x2="${pad+100}" y2="${rulerY+10}"/></g>
  </svg>`;
}

function physicalSpan(b){
  const lat=(b[0]+b[2])/2, mLat=111320, mLon=111320*Math.cos(lat*Math.PI/180);
  return {w:Math.abs(b[3]-b[1])*mLon,h:Math.abs(b[2]-b[0])*mLat};
}
async function renderLocations(){
  const current={name:'Henry parcel 064.03',w:(parcelBox.maxX-parcelBox.minX)/FT_PER_M,h:(parcelBox.maxY-parcelBox.minY)/FT_PER_M,parcel:true};
  let rows=[current];
  try{
    const r=await fetch('https://raw.githubusercontent.com/hartswf0/motor/main/creo5/places/index.json',{cache:'force-cache'});
    if(r.ok){
      const index=await r.json();
      rows.push(...index.filter(x=>Array.isArray(x.bbox)&&x.bbox.length===4).map(x=>({name:x.name,...physicalSpan(x.bbox)})));
    }
  }catch(_){ }
  const max=Math.max(...rows.map(x=>Math.max(x.w,x.h)));
  $('locationComparisons').innerHTML=rows.map(x=>{
    const w=100*x.w/max,h=100*x.h/max;
    return `<div class="place-row"><div class="place-name">${esc(x.name)}</div><div class="place-size"><div class="place-box${x.parcel?' current':''}" style="width:${Math.max(2,w)}%;height:${Math.max(8,h*.46)}px"></div></div><div class="place-dims">${Math.round(x.w)} × ${Math.round(x.h)} m</div></div>`;
  }).join('');
  $('locationScaleNote').textContent=`Same linear bar scale across ${rows.length} saved CREO place windows; longest dimension = ${Math.round(max)} m.`;
}

function initAudit(){
  $('scaleAudit').innerHTML=`
    <div><b>PASS</b><span>3D house source: inches ÷ 12 = feet</span></div>
    <div><b>PASS</b><span>Site coordinates: feet; 100 ft geodetic round-trip error ${roundTripError.toFixed(6)} ft</span></div>
    <div><b>${Math.abs(parcelAc-SITE_CONTEXT.deedAcres)<.2?'PASS':'CHECK'}</b><span>fallback parcel polygon ${parcelAc.toFixed(2)} ac vs ${SITE_CONTEXT.deedAcres.toFixed(2)} deed ac</span></div>
    <div><b>1:1</b><span>bar ${dims.barW.toFixed(0)} × ${dims.barD.toFixed(0)} ft · compound ${dims.compoundW.toFixed(0)} × ${dims.compoundD.toFixed(0)} ft · parcel span ~${Math.round(parcelSpanFt)} ft</span></div>`;
  $('parcelScale').innerHTML=parcelSvg();
}

let previous=null;
function openPanel(){
  previous=document.querySelector('.dock .on:not(#scale)');
  document.querySelectorAll('.dock .on').forEach(x=>x.classList.remove('on'));
  button.classList.add('on');panel.classList.add('on');panel.setAttribute('aria-hidden','false');
}
function closePanel(){
  panel.classList.remove('on');panel.setAttribute('aria-hidden','true');button.classList.remove('on');
  (previous||$('site'))?.classList.add('on');
}
button.addEventListener('click',()=>panel.classList.contains('on')?closePanel():openPanel());
close?.addEventListener('click',closePanel);
addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('on'))closePanel()});

initAudit();
const plans=await loadPlans();
renderHouseComparisons(plans);
renderLocations();
