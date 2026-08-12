// Pure site-fitting utilities for Henry House.
// No Three.js here: these functions operate in local feet.

export function polygonArea(points){
  let a=0;
  for(let i=0,j=points.length-1;i<points.length;j=i++)
    a+=points[j].east*points[i].north-points[i].east*points[j].north;
  return a/2;
}
export function meanPoint(points){
  return {
    east:points.reduce((s,p)=>s+p.east,0)/points.length,
    north:points.reduce((s,p)=>s+p.north,0)/points.length,
  };
}
export function insidePoly(e,n,poly){
  let c=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[i],b=poly[j];
    if(((a.north>n)!=(b.north>n)) &&
       e<(b.east-a.east)*(n-a.north)/(b.north-a.north+1e-9)+a.east) c=!c;
  }
  return c;
}
export function boundsOf(points,pad=0){
  const es=points.map(p=>p.east),ns=points.map(p=>p.north);
  return {
    minE:Math.min(...es)-pad,maxE:Math.max(...es)+pad,
    minN:Math.min(...ns)-pad,maxN:Math.max(...ns)+pad,
  };
}
export function normDeg(d){ d%=360; return d<0?d+360:d; }
export function bearingVec(deg){
  const r=deg*Math.PI/180;
  return {east:Math.sin(r),north:Math.cos(r)};
}
export function houseAxes(deg){
  return {long:bearingVec(deg),up:bearingVec(deg-90)};
}
export function localToWorld(x,y,baseE,baseN,bearing){
  const a=houseAxes(bearing);
  return {
    east:baseE+a.long.east*x+a.up.east*y,
    north:baseN+a.long.north*x+a.up.north*y,
  };
}
export function worldToLocal(e,n,baseE,baseN,bearing){
  const a=houseAxes(bearing),de=e-baseE,dn=n-baseN;
  return {
    x:de*a.long.east+dn*a.long.north,
    y:de*a.up.east+dn*a.up.north,
  };
}
export function distToPolyline(p,line){
  let best=Infinity;
  for(let i=1;i<line.length;i++){
    const a=line[i-1],b=line[i],dx=b.east-a.east,dy=b.north-a.north,L2=dx*dx+dy*dy||1;
    const t=Math.max(0,Math.min(1,((p.east-a.east)*dx+(p.north-a.north)*dy)/L2));
    best=Math.min(best,Math.hypot(p.east-(a.east+t*dx),p.north-(a.north+t*dy)));
  }
  return best;
}
function boundaryRMS(src,dst,angle,scale){
  const cs=meanPoint(src),cd=meanPoint(dst),c=Math.cos(angle),s=Math.sin(angle);
  const stride=Math.max(1,Math.floor(dst.length/100)),sample=dst.filter((_,i)=>i%stride===0);
  let sum=0;
  for(const p of src){
    const x=(p.east-cs.east)*scale,y=(p.north-cs.north)*scale;
    const e=cd.east+c*x-s*y,n=cd.north+s*x+c*y;
    let d2=Infinity;
    for(const q of sample){ const v=(e-q.east)**2+(n-q.north)**2; if(v<d2)d2=v; }
    sum+=d2;
  }
  return Math.sqrt(sum/src.length);
}
export function similarityRegistration(srcParcel,dstParcel){
  const scale=Math.sqrt(Math.abs(polygonArea(dstParcel))/Math.max(1,Math.abs(polygonArea(srcParcel))));
  let bestA=0,best=Infinity;
  for(let d=-180;d<180;d+=2){
    const a=d*Math.PI/180,r=boundaryRMS(srcParcel,dstParcel,a,scale);
    if(r<best){best=r;bestA=a}
  }
  for(let d=-2;d<=2;d+=.1){
    const a=bestA+d*Math.PI/180,r=boundaryRMS(srcParcel,dstParcel,a,scale);
    if(r<best){best=r;bestA=a}
  }
  const cs=meanPoint(srcParcel),cd=meanPoint(dstParcel),c=Math.cos(bestA),s=Math.sin(bestA);
  const transform=p=>{
    const x=(p.east-cs.east)*scale,y=(p.north-cs.north)*scale;
    return {east:cd.east+c*x-s*y,north:cd.north+s*x+c*y};
  };
  return {transform,rotationDeg:bestA*180/Math.PI,scale,rmsFt:best};
}

export function terrainBearing(H,e,n,r=30){
  const gx=(H(e+r,n)-H(e-r,n))/(2*r);
  const gn=(H(e,n+r)-H(e,n-r))/(2*r);
  const gradientBearing=normDeg(Math.atan2(gx,gn)*180/Math.PI);
  // Henry House's modeled gradient is +8% along X and +30% along +Y.
  // Its gradient therefore points 75.0686° counterclockwise from +X.
  return normDeg(gradientBearing+75.0686);
}
function median(values){
  const b=[...values].sort((a,b)=>a-b);
  return b[Math.floor(b.length/2)];
}
export function fitHouseAt({
  H,parcelPts,east,north,bearing,fit,modelRelativeGrade,
}){
  const samples=[];
  for(let ix=0;ix<7;ix++)for(let iy=0;iy<5;iy++){
    const x=fit.x0+(fit.x1-fit.x0)*ix/6;
    const y=fit.y0+(fit.y1-fit.y0)*iy/4;
    const p=localToWorld(x,y,east,north,bearing);
    if(!insidePoly(p.east,p.north,parcelPts)) return null;
    samples.push({x,y,...p,h:H(p.east,p.north)});
  }
  const base=median(samples.map(p=>p.h-modelRelativeGrade(p.x,p.y)));
  let ss=0,max=0;
  for(const p of samples){
    const d=p.h-(base+modelRelativeGrade(p.x,p.y));
    ss+=d*d; max=Math.max(max,Math.abs(d));
  }
  return {base,rms:Math.sqrt(ss/samples.length),max};
}
/**
 * WHERE THE FLOOR GOES WHEN THE HILL IS NOT THE HILL THAT WAS DRAWN.
 *
 * `fitHouseAt` sets the floor by best-fitting the model's ASSUMED grade — 8%
 * along the bar, 30% across it — to the real terrain, and then site-v3 drops the
 * model by that plane's height at the pivot. Where the ground really does fall
 * 30%, the two agree and the lower level walks out as drawn.
 *
 * Where it does not, they do not. The plane still descends 12.6 ft across the
 * bar and its terrace whatever the hill is doing, so on the flat river bench —
 * about 1% — the LOWER LEVEL floor is placed roughly 8.6 ft beneath the ground
 * around it. That is the whole storey: the clear height is 8.9 ft. The walkout,
 * the lower terrace and the second egress are all drawn against a slope that is
 * not there, and the fit metric reports a large RMS while the house is drawn
 * buried anyway.
 *
 * The walkout is not a drawing decision. It is a claim about the slope. So this
 * seats the floor where the slope actually allows — the lower terrace at natural
 * grade — and reports what that leaves: how much fall the hill gives against the
 * 12.6 ft the design spends, and how much earth ends up against the back wall.
 * A caller that wants the assumed plane can still have it; this one says what it
 * costs.
 *
 * All feet, all pivot-relative.
 */
export function seatHouse({
  H, east, north, bearing,
  terraceY, backY, terraceDrop, designRise,
}) {
  const low = localToWorld(0, terraceY, east, north, bearing);
  const back = localToWorld(0, backY, east, north, bearing);
  const gLow = H(low.east, low.north), gBack = H(back.east, back.north);
  // the terrace sits terraceDrop below the lower floor, so putting the terrace
  // at grade puts the floor that much above it
  const ffe = gLow + terraceDrop;
  const fall = gBack - gLow;
  return {
    ffe, fall, designRise,
    crossPct: (fall / Math.abs(backY - terraceY)) * 100,
    walksOut: fall >= designRise - 0.5,
    shortfall: Math.max(0, designRise - fall),
    // earth standing against the uphill wall once the floor is where it can be
    buried: Math.max(0, gBack - ffe),
  };
}

export function findHouseCandidates({
  H,parcelPts,roadPts,terrainMin,terrainMax,fit,modelRelativeGrade,
  step=55,separation=170,count=3,
}){
  const b=boundsOf(parcelPts,-45),found=[];
  for(let north=b.minN;north<=b.maxN;north+=step){
    for(let east=b.minE;east<=b.maxE;east+=step){
      if(!insidePoly(east,north,parcelPts)) continue;
      const bearing=terrainBearing(H,east,north);
      const match=fitHouseAt({H,parcelPts,east,north,bearing,fit,modelRelativeGrade});
      if(!match) continue;
      const roadDistance=distToPolyline({east,north},roadPts),elev=H(east,north);
      const elevNorm=(elev-terrainMin)/Math.max(1,terrainMax-terrainMin);
      const lowPenalty=elevNorm<.13?(.13-elevNorm)*900:0;
      const score=match.rms*13+match.max*2.4+roadDistance*.035+lowPenalty;
      found.push({east,north,az:bearing,fit:match,roadDistance,score,elev});
    }
  }
  found.sort((a,b)=>a.score-b.score);
  const out=[];
  for(const c of found){
    if(out.every(o=>Math.hypot(o.east-c.east,o.north-c.north)>separation)){
      out.push(c); if(out.length===count) break;
    }
  }
  return out;
}

class MinHeap{
  constructor(){this.a=[]}
  push(x){
    const a=this.a;a.push(x);let i=a.length-1;
    while(i){const p=(i-1)>>1;if(a[p].f<=x.f)break;a[i]=a[p];i=p}
    a[i]=x;
  }
  pop(){
    const a=this.a;if(!a.length)return null;
    const root=a[0],last=a.pop();
    if(a.length){
      let i=0;
      while(true){
        const l=i*2+1,r=l+1;if(l>=a.length)break;
        const c=r<a.length&&a[r].f<a[l].f?r:l;
        if(a[c].f>=last.f)break;a[i]=a[c];i=c;
      }
      a[i]=last;
    }
    return root;
  }
  get length(){return this.a.length}
}
function lineOK(H,parcelPts,a,b,maxGrade){
  const L=Math.hypot(b.east-a.east,b.north-a.north);
  const N=Math.max(2,Math.ceil(L/18));
  let prev={...a,h:H(a.east,a.north)};
  for(let i=1;i<=N;i++){
    const t=i/N,e=a.east+(b.east-a.east)*t,n=a.north+(b.north-a.north)*t;
    if(!insidePoly(e,n,parcelPts)) return false;
    const h=H(e,n),run=Math.hypot(e-prev.east,n-prev.north);
    if(Math.abs(h-prev.h)/(run||1)>maxGrade) return false;
    prev={east:e,north:n,h};
  }
  return true;
}
function smoothPath(H,parcelPts,path,maxGrade){
  if(path.length<3)return path;
  const out=[path[0]];let i=0;
  while(i<path.length-1){
    let j=path.length-1;
    for(;j>i+1;j--) if(lineOK(H,parcelPts,path[i],path[j],maxGrade)) break;
    out.push(path[j]);i=j;
  }
  return out;
}
export function routeDrive({
  H,parcelPts,start,goal,maxGrade=.15,step=24,edgePenaltyFt=35,
}){
  if(!insidePoly(goal.east,goal.north,parcelPts))return null;
  const b=boundsOf(parcelPts,0),nx=Math.ceil((b.maxE-b.minE)/step),ny=Math.ceil((b.maxN-b.minN)/step);
  const idx=(i,j)=>j*(nx+1)+i,coord=(i,j)=>({east:b.minE+i*step,north:b.minN+j*step});
  const snap=p=>({i:Math.max(0,Math.min(nx,Math.round((p.east-b.minE)/step))),j:Math.max(0,Math.min(ny,Math.round((p.north-b.minN)/step)))});
  const nearestInside=q=>{
    for(let r=0;r<10;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){
      const i=q.i+di,j=q.j+dj;
      if(i>=0&&i<=nx&&j>=0&&j<=ny){
        const p=coord(i,j);if(insidePoly(p.east,p.north,parcelPts))return{i,j};
      }
    }
    return q;
  };
  let S=nearestInside(snap(start)),G=nearestInside(snap(goal));
  const N=(nx+1)*(ny+1);if(N>24000)return null;
  const gs=new Float64Array(N);gs.fill(Infinity);
  const came=new Int32Array(N);came.fill(-1);
  const closed=new Uint8Array(N),heap=new MinHeap(),sId=idx(S.i,S.j),gId=idx(G.i,G.j);
  gs[sId]=0;heap.push({id:sId,i:S.i,j:S.j,f:0});
  const dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  let found=false;
  while(heap.length){
    const cur=heap.pop();if(closed[cur.id])continue;closed[cur.id]=1;
    if(cur.id===gId){found=true;break}
    const cp=coord(cur.i,cur.j),ch=H(cp.east,cp.north);
    for(const[di,dj]of dirs){
      const i=cur.i+di,j=cur.j+dj;if(i<0||i>nx||j<0||j>ny)continue;
      const p=coord(i,j);if(!insidePoly(p.east,p.north,parcelPts))continue;
      const run=step*Math.hypot(di,dj),grade=Math.abs(H(p.east,p.north)-ch)/run;
      if(grade>maxGrade+.025)continue;
      const edge=distToPolyline(p,parcelPts)<edgePenaltyFt?2.5:1;
      const penalty=1+Math.max(0,grade-.08)*45+Math.max(0,grade-.12)*180;
      const cost=gs[cur.id]+run*penalty*edge,id=idx(i,j);
      if(cost<gs[id]){
        gs[id]=cost;came[id]=cur.id;
        heap.push({id,i,j,f:cost+Math.hypot(p.east-goal.east,p.north-goal.north)});
      }
    }
  }
  if(!found)return null;
  const raw=[];let id=gId;
  while(id>=0){
    const j=Math.floor(id/(nx+1)),i=id-j*(nx+1);
    raw.push(coord(i,j));if(id===sId)break;id=came[id];
  }
  raw.reverse();raw[0]={...start};raw[raw.length-1]={...goal};
  return smoothPath(H,parcelPts,raw,maxGrade);
}
export function profileDrive(H,path,endZ,maxGrade=.12){
  if(!path||path.length<2)return[];
  const p=path.map(x=>({...x,z:H(x.east,x.north)}));
  p[0].z=H(p[0].east,p[0].north);p[p.length-1].z=endZ;
  for(let pass=0;pass<6;pass++){
    for(let i=1;i<p.length;i++){
      const run=Math.hypot(p[i].east-p[i-1].east,p[i].north-p[i-1].north);
      p[i].z=Math.max(p[i-1].z-maxGrade*run,Math.min(p[i-1].z+maxGrade*run,p[i].z));
    }
    p[p.length-1].z=endZ;
    for(let i=p.length-2;i>=0;i--){
      const run=Math.hypot(p[i+1].east-p[i].east,p[i+1].north-p[i].north);
      p[i].z=Math.max(p[i+1].z-maxGrade*run,Math.min(p[i+1].z+maxGrade*run,p[i].z));
    }
    p[0].z=H(p[0].east,p[0].north);
  }
  return p;
}
