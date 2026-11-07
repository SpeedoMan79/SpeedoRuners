/* Gali Dauda: 3D endless runner (Three.js r128)
   Look: curved world, cartoon (toon) shading with outlines, rail tracks, trains, graffiti walls, bridges.
   Characters, trains aur maps sab original hain. */
(function(){
'use strict';
var T=window.THREE;
function $(id){return document.getElementById(id);}
function fatal(t){var p=document.createElement('p');p.className='fatal';p.textContent=t;document.body.appendChild(p);}
if(!T){fatal('3D engine load nahi hua. Internet check karke page dobara kholo.');return;}

/* ================= CONFIG: yahin apne characters aur maps badlo ================= */
var CHARS=[
  {name:'Chintu',skin:0xc98a5b,shirt:0xff8a2b,pants:0x243b73,hair:0x1c1420,hat:0x2f6fe0,pack:0xffd23f,shoes:0xf4f0e6,style:'cap'},
  {name:'Meera', skin:0xb97a4f,shirt:0x1fb5a3,pants:0x5a3a8c,hair:0x150f1a,hat:null,pack:0xee4b7e,shoes:0xfafafa,style:'braid'},
  {name:'Dabbu', skin:0xaab8d0,shirt:0x7f93b5,pants:0x4a5875,hair:null,hat:null,pack:0xffb627,shoes:0x2a2f3d,style:'robot'}
];
var MAPS=[
  {name:'Station Subah',sky:['#2f86e0','#7cc4f5','#d6f0ff'],fog:0xd6f0ff,fogN:45,fogF:140,
   hemiS:0xffffff,hemiG:0xa9b4c4,hemiI:0.66,sunC:0xfff1cc,sunI:0.6,sunCol:'#fffbe3',sunSize:84,stars:false,clouds:true,cloudCol:0xffffff,
   ballast:'#9a948c',sleeper:'#7a5538',rail:0xd3dae2,walk:'#cfc9bf',ground:0x86a96b,wall:'#e9e2d3',
   blds:['#f2a65a','#4f9d8a','#c8505a','#9cc16d','#f5dd7a','#6a9ed8'],win:'#fff2b0',glassA:'#8fc2e8',glassB:'#4c7fb0',lit:0,emis:0,
   trains:[0xe53935,0x1e88e5,0xf9a825],accents:['#ffd23f','#ffffff','#1e3a8a'],trainEm:0,bill:0,headGlow:0.25,lamps:false,lampGlow:0,neon:false},
  {name:'Bazaar Sham',sky:['#4b3a9e','#ff7f6e','#ffc98a'],fog:0xffc98a,fogN:36,fogF:125,
   hemiS:0xffd9b0,hemiG:0x7a4f5a,hemiI:0.64,sunC:0xffa860,sunI:0.62,sunCol:'#fff0c0',sunSize:100,stars:false,clouds:true,cloudCol:0xffb89a,
   ballast:'#85736b',sleeper:'#5b3d2e',rail:0xe2c9bd,walk:'#c4a48a',ground:0x6b4a45,wall:'#f3d9b8',
   blds:['#e86a5b','#f2a541','#3fb8af','#c0508a','#f4d35e'],win:'#ffd98a',glassA:'#a07a96',glassB:'#4b3558',lit:0.3,emis:0.55,
   trains:[0x2fa84f,0xe8503a,0x8e44ad],accents:['#fff3d6','#ffd23f','#ffd23f'],trainEm:0.45,bill:0.4,headGlow:0.55,lamps:true,lampGlow:0.5,neon:false},
  {name:'Raat Express',sky:['#060520','#1d0f4d','#2e1a66'],fog:0x2e1a66,fogN:28,fogF:112,
   hemiS:0x7a70e0,hemiG:0x1c1438,hemiI:0.62,sunC:0xa8b8ff,sunI:0.5,sunCol:'#e6ecff',sunSize:50,stars:true,clouds:false,cloudCol:0xffffff,
   ballast:'#3a3548',sleeper:'#2a2030',rail:0x9fb4e8,walk:'#4a3d6e',ground:0x17111f,wall:'#3a3068',
   blds:['#4a3b8f','#573f9a','#3b2f74','#5d4aa8'],win:'#ffd36b',glassA:'#2f2a6e',glassB:'#15113a',lit:0.45,emis:1,
   trains:[0xff4f81,0x25c1ae,0x8f6bff],accents:['#ffe36b','#ffffff','#ffe36b'],trainEm:1,bill:1,headGlow:1,lamps:true,lampGlow:1,neon:true}
];
var GRAF=['#ff4f81','#25c1ae','#ffb627','#8f6bff','#4cc9f0','#ff7a3d','#9be15d'];
var TAGS=['GALI','DAUDA','BHAAG','COOL','DESI','SIKKE','MELA','ZOOM','JOSH'];
var SIGNS=['CHAI','MELA','DHABA','MITHAI','SALE!','PAKODE'];
var TRAIN_LEN=[6,9,12];

/* ================= renderer, scene, camera ================= */
var renderer;
try{
  renderer=new T.WebGLRenderer({canvas:$('c'),antialias:true,powerPreference:'high-performance'});
}catch(err){
  fatal('Is browser mein 3D (WebGL) chalu nahi hai.');
  return;
}
var dpr=Math.min(window.devicePixelRatio||1,1.75);
renderer.setPixelRatio(dpr);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;
var maxAniso=Math.min(4,renderer.capabilities.getMaxAnisotropy());

var scene=new T.Scene();
scene.fog=new T.Fog(0xffffff,30,110);
var camera=new T.PerspectiveCamera(60,1,0.1,460);
var hemi=new T.HemisphereLight(0xffffff,0x444444,0.7); scene.add(hemi);
var sun=new T.DirectionalLight(0xffffff,0.6);
sun.position.set(-8,16,9); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-10; sun.shadow.camera.right=10; sun.shadow.camera.top=14; sun.shadow.camera.bottom=-10;
sun.shadow.camera.near=1; sun.shadow.camera.far=50; sun.shadow.bias=-0.0006; sun.shadow.normalBias=0.02;
scene.add(sun); scene.add(sun.target);

var W=1,H=1;
function resize(){
  W=window.innerWidth; H=window.innerHeight;
  renderer.setSize(W,H,false);
  camera.aspect=W/H;
  layoutSheet();
}

/* ================= small helpers ================= */
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function rnd(a,b){return a+Math.random()*(b-a);}
function pick(a){return a[(Math.random()*a.length)|0];}
function mkCanvas(w,h){var c=document.createElement('canvas'); c.width=w; c.height=h; return c;}
function hexCss(n){return '#'+('000000'+n.toString(16)).slice(-6);}
function noise(x,w,h,n,amt){
  for(var i=0;i<n;i++){
    x.fillStyle='rgba('+(Math.random()<0.5?'255,255,255':'0,0,0')+','+(Math.random()*amt).toFixed(3)+')';
    x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2);
  }
}
function rr(x,a,b,w,h,r){
  x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath();
}
function ctex(c,rx,ry){
  var t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=maxAniso;
  if(rx) t.repeat.set(rx,ry); return t;
}
var capCache={};
function capsule(r,len){
  var k=r+'_'+len; if(capCache[k]) return capCache[k];
  var pts=[],n=7,i,a;
  for(i=0;i<=n;i++){a=-Math.PI/2+i/n*Math.PI/2; pts.push(new T.Vector2(Math.cos(a)*r,Math.sin(a)*r-len/2));}
  for(i=0;i<=n;i++){a=i/n*Math.PI/2; pts.push(new T.Vector2(Math.cos(a)*r,Math.sin(a)*r+len/2));}
  return (capCache[k]=new T.LatheGeometry(pts,14));
}

/* ================= cartoon look: curved world + toon shading + outlines ================= */
// Curve: door ki cheezein neeche aur side mein jhukti hain (vertex shader mein), isse duniya ghoomti hui lagti hai.
var CURVE={value:new T.Vector2(0,0.0028)};
var PV=[
  'vec4 mvPosition = vec4( transformed, 1.0 );',
  '#ifdef USE_INSTANCING',
  'mvPosition = instanceMatrix * mvPosition;',
  '#endif',
  'mvPosition = modelViewMatrix * mvPosition;',
  'float cz = max( 0.0, -mvPosition.z - 12.0 );',
  'mvPosition.y -= cz * cz * uCurve.y;',
  'mvPosition.x += cz * cz * uCurve.x;',
  'gl_Position = projectionMatrix * mvPosition;'
].join('\n');
function curveFn(sh){
  sh.uniforms.uCurve=CURVE;
  sh.vertexShader=sh.vertexShader
    .replace('#include <common>','#include <common>\nuniform vec2 uCurve;')
    .replace('#include <project_vertex>',PV);
}
function outlineFn(sh){
  sh.uniforms.uCurve=CURVE; sh.uniforms.uOl={value:this.userData.ol||0.012};
  sh.vertexShader=sh.vertexShader
    .replace('#include <common>','#include <common>\nuniform vec2 uCurve;\nuniform float uOl;')
    .replace('#include <begin_vertex>','vec3 transformed = position + normalize( normal ) * uOl;')
    .replace('#include <project_vertex>',PV);
}
function spriteFn(sh){
  sh.uniforms.uCurve=CURVE;
  sh.vertexShader=sh.vertexShader
    .replace('#include <common>','#include <common>\nuniform vec2 uCurve;')
    .replace('vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );',
      'vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\nfloat cz = max( 0.0, -mvPosition.z - 12.0 );\nmvPosition.y -= cz * cz * uCurve.y;\nmvPosition.x += cz * cz * uCurve.x;');
}
var GRAD=(function(){
  var t=new T.DataTexture(new Uint8Array([85,150,215,255]),4,1,T.LuminanceFormat);
  t.minFilter=t.magFilter=T.NearestFilter; t.generateMipmaps=false; t.needsUpdate=true; return t;
})();
function opts(p,o){if(o) for(var k in o) p[k]=o[k]; return p;}
function tm(c,o){var m=new T.MeshToonMaterial(opts({color:c,gradientMap:GRAD},o)); m.onBeforeCompile=curveFn; return m;}
function lm(c,o){var m=new T.MeshLambertMaterial(opts({color:c},o)); m.onBeforeCompile=curveFn; return m;}
function bm(c,o){var m=new T.MeshBasicMaterial(opts({color:c},o)); m.onBeforeCompile=curveFn; return m;}
var OUT_COL=0x1b1233, outCache={};
function outMat(th){
  var k=th.toFixed(4);
  if(!outCache[k]){var m=new T.MeshBasicMaterial({color:OUT_COL,side:T.BackSide}); m.userData.ol=th; m.onBeforeCompile=outlineFn; outCache[k]=m;}
  return outCache[k];
}
var boxOut=new T.MeshBasicMaterial({color:OUT_COL,side:T.BackSide}); boxOut.onBeforeCompile=curveFn;
function ol(o,th){o.add(new T.Mesh(o.geometry,outMat(th))); return o;}
function bx(w,h,d,m,th){
  var o=new T.Mesh(new T.BoxGeometry(w,h,d),m); o.castShadow=true;
  if(th){var s=new T.Mesh(o.geometry,boxOut); s.scale.set(1+2*th/w,1+2*th/h,1+2*th/d); o.add(s);}
  return o;
}
function ball(r,m,sx,sy,sz,th){
  var o=new T.Mesh(new T.SphereGeometry(r,16,12),m); o.scale.set(sx||1,sy||1,sz||1); o.castShadow=true;
  return th?ol(o,th):o;
}
function limb(r,L,m,th){
  var o=new T.Mesh(capsule(r,L-2*r),m); o.position.y=-L/2; o.castShadow=true;
  return th?ol(o,th):o;
}
var glowCanvas=mkCanvas(64,64);
(function(){
  var x=glowCanvas.getContext('2d'), gr=x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.25,'rgba(255,255,255,.45)'); gr.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=gr; x.fillRect(0,0,64,64);
})();
var glowTex=new T.CanvasTexture(glowCanvas);
function glow(color,size,op){
  var s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:color,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false,fog:false}));
  s.material.onBeforeCompile=spriteFn;
  s.scale.set(size,size,1); s.userData.base=op; return s;
}
function fadeAt(z){return clamp((105+z)/26,0,1);}

/* ================= particles + speed lines ================= */
var NP=280,pPos=new Float32Array(NP*3),pCol=new Float32Array(NP*3),pVel=new Float32Array(NP*3),pBase=new Float32Array(NP*3),pLife=new Float32Array(NP),pMax=new Float32Array(NP),pHead=0;
for(var pi=0;pi<NP;pi++) pPos[pi*3+1]=-100;
var pGeo=new T.BufferGeometry();
pGeo.setAttribute('position',new T.BufferAttribute(pPos,3));
pGeo.setAttribute('color',new T.BufferAttribute(pCol,3));
var pts=new T.Points(pGeo,new T.PointsMaterial({size:0.17,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true}));
pts.frustumCulled=false; scene.add(pts);
function emit(x,y,z,vx,vy,vz,life,r,g,b){
  var i=pHead; pHead=(pHead+1)%NP;
  pPos[i*3]=x; pPos[i*3+1]=y; pPos[i*3+2]=z; pVel[i*3]=vx; pVel[i*3+1]=vy; pVel[i*3+2]=vz;
  pLife[i]=pMax[i]=life; pBase[i*3]=r; pBase[i*3+1]=g; pBase[i*3+2]=b;
}
function burst(x,y,z,n,spd,life,r,g,b){
  for(var i=0;i<n;i++) emit(x,y,z,rnd(-spd,spd),rnd(0.3,1.4)*spd,rnd(-spd,spd),life*rnd(0.6,1),r,g,b);
}
function updParticles(dt,d){
  for(var i=0;i<NP;i++){
    if(pLife[i]<=0) continue;
    pLife[i]-=dt;
    if(pLife[i]<=0){pPos[i*3+1]=-100; pCol[i*3]=pCol[i*3+1]=pCol[i*3+2]=0; continue;}
    pVel[i*3+1]-=9*dt;
    pPos[i*3]+=pVel[i*3]*dt; pPos[i*3+1]+=pVel[i*3+1]*dt; pPos[i*3+2]+=pVel[i*3+2]*dt+d;
    var f=pLife[i]/pMax[i];
    pCol[i*3]=pBase[i*3]*f; pCol[i*3+1]=pBase[i*3+1]*f; pCol[i*3+2]=pBase[i*3+2]*f;
  }
  pGeo.attributes.position.needsUpdate=true; pGeo.attributes.color.needsUpdate=true;
}
var NL=34,lPos=new Float32Array(NL*6),lData=[];
function resetLine(L,far){L.x=(Math.random()<0.5?-1:1)*rnd(1.4,5.2); L.y=rnd(0.5,6.5); L.z=far?rnd(-90,-30):rnd(-90,10); L.l=rnd(2,5);}
for(var li0=0;li0<NL;li0++){var L0={}; resetLine(L0,false); lData.push(L0);}
var lGeo=new T.BufferGeometry(); lGeo.setAttribute('position',new T.BufferAttribute(lPos,3));
var lMat=new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false}); lMat.onBeforeCompile=curveFn;
var speedLines=new T.LineSegments(lGeo,lMat); speedLines.frustumCulled=false; scene.add(speedLines);
function updLines(d,sp){
  var op=clamp((sp-17)/16,0,1)*0.45;
  lMat.opacity=op; speedLines.visible=op>0.01;
  if(!speedLines.visible) return;
  for(var i=0;i<NL;i++){
    var L=lData[i]; L.z+=d*1.7;
    if(L.z-L.l>16) resetLine(L,true);
    lPos[i*6]=L.x; lPos[i*6+1]=L.y; lPos[i*6+2]=L.z; lPos[i*6+3]=L.x; lPos[i*6+4]=L.y; lPos[i*6+5]=L.z-L.l;
  }
  lGeo.attributes.position.needsUpdate=true;
}

/* ================= world (rebuilt when the map changes) ================= */
var world=new T.Group(); scene.add(world);
var dyn=new T.Group(); scene.add(dyn);   // obstacles and coins
var disp=[];                              // things to dispose on rebuild
var skyMesh=null, sunSprite=null, starPts=null, cloudRoot=null;
var roadTex=null, walkTexs=[];
var blds=[], props=[], facades=[], deco={};
var mapIdx=0, charIdx=0;
var UNIT=new T.BoxGeometry(1,1,1);
var tpl={};
var coinTpl=null;
var obs=[], coins=[];

function track(o){disp.push(o); return o;}
function clearWorld(){
  while(world.children.length) world.remove(world.children[0]);
  while(dyn.children.length) dyn.remove(dyn.children[0]);
  if(skyMesh) scene.remove(skyMesh);
  if(sunSprite) scene.remove(sunSprite);
  if(starPts) scene.remove(starPts);
  if(cloudRoot) scene.remove(cloudRoot);
  skyMesh=sunSprite=starPts=cloudRoot=null;
  disp.forEach(function(o){if(o&&o.dispose) o.dispose();});
  disp=[]; blds=[]; props=[]; facades=[]; deco={}; tpl={}; obs=[]; coins=[]; walkTexs=[]; roadTex=null;
}

function buildSky(m){
  var c=mkCanvas(4,512), x=c.getContext('2d'), gr=x.createLinearGradient(0,0,0,512), i, j;
  gr.addColorStop(0,m.sky[0]); gr.addColorStop(0.32,m.sky[1]); gr.addColorStop(0.5,m.sky[2]); gr.addColorStop(1,m.sky[2]);
  x.fillStyle=gr; x.fillRect(0,0,4,512);
  var st=track(new T.CanvasTexture(c));
  skyMesh=new T.Mesh(track(new T.SphereGeometry(400,24,16)),track(new T.MeshBasicMaterial({map:st,side:T.BackSide,fog:false,depthWrite:false})));
  skyMesh.renderOrder=-2; scene.add(skyMesh);
  var sm=track(new T.SpriteMaterial({map:glowTex,color:new T.Color(m.sunCol),fog:false,depthWrite:false,transparent:true,blending:T.AdditiveBlending,opacity:1}));
  sunSprite=new T.Sprite(sm); sunSprite.scale.set(m.sunSize,m.sunSize,1); scene.add(sunSprite);
  if(m.stars){
    var arr=new Float32Array(260*3);
    for(i=0;i<260;i++){
      var a=Math.random()*Math.PI*2, e=rnd(0.12,1.3), r=380;
      arr[i*3]=Math.cos(a)*Math.cos(e)*r; arr[i*3+1]=Math.sin(e)*r; arr[i*3+2]=Math.sin(a)*Math.cos(e)*r;
    }
    var sg=track(new T.BufferGeometry()); sg.setAttribute('position',new T.BufferAttribute(arr,3));
    starPts=new T.Points(sg,track(new T.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,fog:false,transparent:true,opacity:0.9})));
    scene.add(starPts);
  }
  if(m.clouds){
    cloudRoot=new T.Group(); scene.add(cloudRoot);
    for(i=0;i<9;i++){
      var cg=new T.Group(); cg.position.set(rnd(-320,320),rnd(40,95),rnd(-340,-250)); cg.userData.v=rnd(1.5,4);
      var n=5+((Math.random()*3)|0);
      for(j=0;j<n;j++){
        var sp=new T.Sprite(track(new T.SpriteMaterial({map:glowTex,color:m.cloudCol,transparent:true,opacity:0.85,depthWrite:false,fog:false})));
        var sz=rnd(50,90); sp.scale.set(sz*1.4,sz*0.7,1); sp.position.set((j-n/2)*34+rnd(-8,8),rnd(-8,8),rnd(-4,4)); cg.add(sp);
      }
      cloudRoot.add(cg);
    }
  }
}

/* rail tracks: ballast, sleepers, rails */
function buildTrack(m){
  var c=mkCanvas(256,256), x=c.getContext('2d'), i, k;
  x.fillStyle=m.ballast; x.fillRect(0,0,256,256);
  noise(x,256,256,7000,0.2);
  for(i=0;i<60;i++){
    x.fillStyle='rgba(0,0,0,'+(0.04+Math.random()*0.06).toFixed(3)+')';
    x.beginPath(); x.ellipse(rnd(0,256),rnd(0,256),rnd(4,12),rnd(2,6),0,0,6.3); x.fill();
  }
  [256/6,128,256*5/6].forEach(function(cx){
    for(k=0;k<8;k++){
      var sy=k*32+9;
      x.fillStyle='rgba(0,0,0,.35)'; x.fillRect(cx-38,sy+3,76,13);
      x.fillStyle=m.sleeper; x.fillRect(cx-37,sy,74,12);
      x.fillStyle='rgba(255,255,255,.14)'; x.fillRect(cx-37,sy,74,3);
      x.fillStyle='rgba(0,0,0,.25)'; x.fillRect(cx-37,sy+9,74,3);
    }
    [-15,15].forEach(function(o){x.fillStyle='rgba(0,0,0,.35)'; x.fillRect(cx+o-5,0,10,256);});
  });
  roadTex=track(ctex(c,1,27));
  var road=new T.Mesh(track(new T.PlaneGeometry(6.6,216)),track(lm(0xffffff,{map:roadTex})));
  road.geometry.rotateX(-Math.PI/2); road.position.set(0,0,-100); road.receiveShadow=true; world.add(road);
  // 3D rails
  var rm=track(tm(m.rail)), rg=track(new T.BoxGeometry(0.1,0.11,216));
  [-2.2,0,2.2].forEach(function(lx){
    [-0.4,0.4].forEach(function(o){
      var r=new T.Mesh(rg,rm); r.position.set(lx+o,0.06,-100); world.add(r);
    });
  });
  // platform (safety line on inner edge)
  var pc=mkCanvas(128,128), px=pc.getContext('2d');
  px.fillStyle=m.walk; px.fillRect(0,0,128,128); noise(px,128,128,900,0.12);
  px.strokeStyle='rgba(0,0,0,.22)'; px.lineWidth=2;
  for(i=0;i<=4;i++){px.beginPath(); px.moveTo(i*32,0); px.lineTo(i*32,128); px.stroke(); px.beginPath(); px.moveTo(0,i*32); px.lineTo(128,i*32); px.stroke();}
  px.fillStyle='#ffd23f'; px.fillRect(6,0,10,128);
  px.fillStyle='rgba(0,0,0,.25)'; px.fillRect(16,0,3,128);
  var pg=track(new T.PlaneGeometry(2,216)); pg.rotateX(-Math.PI/2);
  var curbM=track(tm(0x8f8798)), baseG=track(new T.BoxGeometry(2,0.15,216)), curbG=track(new T.BoxGeometry(0.22,0.17,216));
  [-1,1].forEach(function(s){
    var wt=track(ctex(pc,s<0?-1:1,108)); walkTexs.push(wt);
    var w=new T.Mesh(pg,track(lm(0xffffff,{map:wt}))); w.position.set(s*4.3,0.16,-100); w.receiveShadow=true; world.add(w);
    var b=new T.Mesh(baseG,curbM); b.position.set(s*4.3,0.075,-100); world.add(b);
    var cb=new T.Mesh(curbG,curbM); cb.position.set(s*3.4,0.085,-100); world.add(cb);
  });
  var ground=new T.Mesh(track(new T.PlaneGeometry(520,520)),track(lm(m.ground)));
  ground.geometry.rotateX(-Math.PI/2); ground.position.set(0,-0.03,-100); ground.receiveShadow=true; world.add(ground);
}

/* ---- graffiti walls, billboards, building facades ---- */
function drawTag(x,txt,cx,cy,size,rot,fill,stroke){
  x.save(); x.translate(cx,cy); x.rotate(rot);
  x.font=size+'px "Lilita One","Baloo 2",Impact,sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.lineJoin='round';
  x.lineWidth=size*0.3; x.strokeStyle=stroke; x.strokeText(txt,3,5);
  x.lineWidth=size*0.2; x.strokeStyle='#ffffff'; x.strokeText(txt,0,0);
  x.fillStyle=fill; x.fillText(txt,0,0);
  x.restore();
}
function makeGraffiti(m){
  var c=mkCanvas(288,224), x=c.getContext('2d'), i;
  x.fillStyle=m.wall; x.fillRect(0,0,288,224); noise(x,288,224,1400,0.1);
  var g=x.createLinearGradient(0,0,0,224); g.addColorStop(0,'rgba(255,255,255,.12)'); g.addColorStop(1,'rgba(0,0,0,.18)');
  x.fillStyle=g; x.fillRect(0,0,288,224);
  for(i=0;i<5;i++){ // spray splotches
    x.fillStyle=pick(GRAF); x.globalAlpha=0.35; x.beginPath(); x.arc(rnd(20,268),rnd(30,190),rnd(20,46),0,6.3); x.fill();
  }
  x.globalAlpha=1;
  var c1=pick(GRAF), c2=pick(GRAF);
  drawTag(x,pick(TAGS),rnd(100,160),rnd(70,100),rnd(60,76),rnd(-0.18,0.1),c1,'#1b1233');
  drawTag(x,pick(TAGS),rnd(150,200),rnd(150,180),rnd(34,46),rnd(-0.1,0.18),c2,'#1b1233');
  for(i=0;i<4;i++){ // paint drips
    var dx=rnd(30,258), dy=rnd(110,150); x.strokeStyle=pick(GRAF); x.lineWidth=4; x.lineCap='round';
    x.beginPath(); x.moveTo(dx,dy); x.lineTo(dx,dy+rnd(14,40)); x.stroke();
  }
  x.fillStyle='#fff'; for(i=0;i<5;i++){ // small stars
    var sx=rnd(14,274), sy=rnd(14,120); x.beginPath(); x.arc(sx,sy,2.5,0,6.3); x.fill();
  }
  x.fillStyle='rgba(0,0,0,.35)'; x.fillRect(0,214,288,10);
  return c;
}
function makeSignTex(m){
  var c=mkCanvas(256,128), x=c.getContext('2d'), bg=pick(GRAF);
  x.fillStyle=bg; x.fillRect(0,0,256,128);
  x.strokeStyle='#fff'; x.lineWidth=8; x.strokeRect(8,8,240,112);
  x.strokeStyle='#1b1233'; x.lineWidth=3; x.strokeRect(14,14,228,100);
  x.font='58px "Lilita One","Baloo 2",Impact,sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.lineJoin='round';
  var t=pick(SIGNS); x.lineWidth=10; x.strokeStyle='#1b1233'; x.strokeText(t,128,68); x.fillStyle='#fff'; x.fillText(t,128,68);
  return c;
}
function makeFacade(m,base){
  var c=mkCanvas(192,256), x=c.getContext('2d'), e=mkCanvas(192,256), y=e.getContext('2d'), r, k;
  x.fillStyle=base; x.fillRect(0,0,192,256);
  var g=x.createLinearGradient(0,0,0,256); g.addColorStop(0,'rgba(255,255,255,.14)'); g.addColorStop(1,'rgba(0,0,0,.1)');
  x.fillStyle=g; x.fillRect(0,0,192,256); noise(x,192,256,1400,0.09);
  y.fillStyle='#000'; y.fillRect(0,0,192,256);
  for(r=0;r<4;r++){
    for(k=0;k<3;k++){
      var wx=k*64+12, wy=r*64+14, lit=Math.random()<m.lit;
      x.fillStyle='rgba(0,0,0,.35)'; rr(x,wx-4,wy-4,48,44,4); x.fill();
      if(lit){x.fillStyle=m.win;} else {var gg=x.createLinearGradient(0,wy,0,wy+36); gg.addColorStop(0,m.glassA); gg.addColorStop(1,m.glassB); x.fillStyle=gg;}
      rr(x,wx,wy,40,36,3); x.fill();
      if(lit){y.fillStyle=m.win; rr(y,wx,wy,40,36,3); y.fill();}
      x.fillStyle='rgba(255,255,255,.22)'; x.fillRect(wx-5,wy+37,50,4);
      x.fillStyle='rgba(255,255,255,.18)'; x.fillRect(wx+20,wy,2,36);
    }
    x.fillStyle='rgba(0,0,0,.22)'; x.fillRect(0,r*64,192,4);
  }
  return {a:c,b:e};
}
function buildDeco(m){
  var i, t;
  deco.roofM=track(lm(0x4a4552));
  deco.tankM=track(tm(0x8a6a4a));
  deco.metalM=track(tm(0x4a4658));
  deco.lampM=track(bm(m.lamps?0xfff0c8:0xdddddd));
  deco.concM=track(tm(m.neon?0x5a4d8a:0xbdb7ad));
  deco.stripeM=track(tm(0xffd23f,{emissive:0xffd23f,emissiveIntensity:m.neon?0.6:0.15}));
  deco.signG=track(new T.BoxGeometry(0.14,1.8,0.5));
  deco.panelG=track(new T.PlaneGeometry(3.6,2.8));
  deco.billG=track(new T.PlaneGeometry(3.2,1.6));
  deco.tankG=track(new T.CylinderGeometry(0.8,0.8,1.3,12));
  deco.grafM=[]; deco.billM=[];
  for(i=0;i<5;i++){
    t=track(ctex(makeGraffiti(m),1,1));
    deco.grafM.push(track(lm(0xffffff,{map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:m.bill*0.3})));
  }
  for(i=0;i<4;i++){
    t=track(ctex(makeSignTex(m),1,1));
    deco.billM.push(track(lm(0xffffff,{map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:m.bill})));
  }
}

var NEON=[0xff4f81,0x25c1ae,0xffb627,0x8f6bff];
function dressBuilding(g){
  var u=g.userData, m=MAPS[mapIdx], s=u.side, k=1+((Math.random()*3)|0), w=3.6*k, j, ch;
  var h=1.2*(6+((Math.random()*8)|0));
  u.w=w; u.h=h;
  u.body.scale.set(w,h,w); u.body.position.y=h/2;
  u.tm.repeat.set(w/3.6,h/4.8); u.te.repeat.set(w/3.6,h/4.8);
  while(g.children.length>1){ch=g.children[1]; if(ch.isSprite) ch.material.dispose(); g.remove(ch);}
  u.glows=[];
  var fx=-s*w/2, ry=s>0?-Math.PI/2:Math.PI/2;
  for(j=0;j<k;j++){ // graffiti wall at street level
    var p=new T.Mesh(deco.panelG,pick(deco.grafM)); p.position.set(fx-s*0.03,1.4,-w/2+1.8+j*3.6); p.rotation.y=ry; g.add(p);
  }
  if(h>7.2 && Math.random()<0.6){ // shop sign
    var sy=rnd(4.2,h-1.5), sz=rnd(-w/2+1.7,w/2-1.7);
    var bb=new T.Mesh(deco.billG,pick(deco.billM)); bb.position.set(fx-s*0.06,sy,sz); bb.rotation.y=ry; g.add(bb);
    if(m.neon){var gl=glow(pick(NEON),5,0.4); gl.position.set(fx-s*0.6,sy,sz); g.add(gl); u.glows.push(gl);}
  }
  if(m.neon && Math.random()<0.5 && h>6){ // vertical neon bar
    var col=pick(NEON), nb=new T.Mesh(deco.signG,new T.MeshBasicMaterial({color:col}));
    nb.material.onBeforeCompile=curveFn;
    var ny=rnd(3.2,h-1.6), nz=rnd(-w*0.3,w*0.3); nb.position.set(fx-s*0.25,ny,nz); g.add(nb);
    var gl2=glow(col,4.2,0.5); gl2.position.set(fx-s*0.7,ny,nz); g.add(gl2); u.glows.push(gl2);
  }
  if(Math.random()<0.35){ // rooftop water tank
    var tk=new T.Mesh(deco.tankG,deco.tankM); tk.position.set(rnd(-w*0.25,w*0.25),h+0.65,rnd(-w*0.25,w*0.25)); g.add(tk);
  }
  g.position.x=s*(5.4+w/2);
}
function buildBuildings(m){
  m.blds.forEach(function(b){facades.push(makeFacade(m,b));});
  [-1,1].forEach(function(s){
    var cur=14, list=[];
    for(var i=0;i<15;i++){
      var f=facades[i%facades.length], g=new T.Group();
      var mt=track(new T.MeshLambertMaterial({emissive:0xffffff,emissiveIntensity:m.emis}));
      mt.onBeforeCompile=curveFn;
      var tx=track(ctex(f.a,1,1)), te=track(ctex(f.b,1,1));
      mt.map=tx; mt.emissiveMap=te;
      var body=new T.Mesh(UNIT,[mt,mt,deco.roofM,deco.roofM,mt,mt]);
      g.add(body); g.userData={side:s,mt:mt,tm:tx,te:te,body:body,w:6,h:10,glows:[]};
      dressBuilding(g);
      cur-=g.userData.w/2; g.position.z=cur; cur-=g.userData.w/2;
      world.add(g); list.push(g);
    }
    blds.push(list);
  });
}

/* ---- props: lamps, bridges ---- */
function makeLamp(side,m){
  var g=new T.Group();
  var pole=new T.Mesh(deco.poleG,deco.metalM); pole.position.y=2.3; g.add(pole);
  var arm=new T.Mesh(deco.armG,deco.metalM); arm.position.set(-side*0.55,4.6,0); g.add(arm);
  var head=new T.Mesh(deco.headG,deco.lampM); head.position.set(-side*1.05,4.52,0); g.add(head);
  var gl=glow(m.neon?0xffd27a:0xffe2a0,5.0,m.lampGlow); gl.position.set(-side*1.05,4.3,0); g.add(gl); g.userData.glow=gl;
  return g;
}
function makeBridge(){
  var g=new T.Group();
  var beam=bx(11.8,1.0,2.8,deco.concM,0.04); beam.position.y=9.0; g.add(beam);
  var strip=bx(11.82,0.14,2.82,deco.stripeM); strip.position.y=8.42; g.add(strip);
  [-1,1].forEach(function(s){var pl=bx(0.9,9,1.4,deco.concM,0.04); pl.position.set(s*5.0,4.5,0); g.add(pl);});
  return g;
}
function buildProps(m){
  var i, g, n;
  deco.poleG=track(new T.CylinderGeometry(0.06,0.08,4.6,8));
  deco.armG=track(new T.BoxGeometry(1.1,0.07,0.07));
  deco.headG=track(new T.BoxGeometry(0.42,0.1,0.22));
  if(m.lamps){
    n=6;
    [-1,1].forEach(function(s){
      for(i=0;i<n;i++){g=makeLamp(s,m); g.position.set(s*4.9,0.16,-i*18-(s>0?9:0)+8); world.add(g); props.push({g:g,span:n*18,lamp:true});}
    });
  }
  n=3; for(i=0;i<n;i++){g=makeBridge(); g.position.z=-i*70+6; world.add(g); props.push({g:g,span:n*70});}
}

/* ---- obstacles: trains, barriers, overhead gates, coins ---- */
function trainArt(css,acc){
  var s=mkCanvas(256,128), x=s.getContext('2d'), e=mkCanvas(256,128), y=e.getContext('2d'), g;
  x.fillStyle=css; x.fillRect(0,0,256,128);
  g=x.createLinearGradient(0,0,0,128); g.addColorStop(0,'rgba(255,255,255,.28)'); g.addColorStop(0.45,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(0,0,0,.28)');
  x.fillStyle=g; x.fillRect(0,0,256,128); noise(x,256,128,500,0.06);
  x.fillStyle='#2a2634'; x.fillRect(0,114,256,14);
  x.fillStyle=acc; x.fillRect(0,96,256,9);
  x.fillStyle='rgba(255,255,255,.85)'; x.fillRect(0,106,256,3);
  y.fillStyle='#000'; y.fillRect(0,0,256,128);
  [14,142].forEach(function(wx){
    x.fillStyle='rgba(0,0,0,.35)'; rr(x,wx-3,27,100,58,10); x.fill();
    var gg=x.createLinearGradient(0,30,0,82); gg.addColorStop(0,'#8fd3ff'); gg.addColorStop(1,'#2d5f95');
    x.fillStyle=gg; rr(x,wx,30,94,52,8); x.fill();
    x.fillStyle='rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(wx+10,82); x.lineTo(wx+34,30); x.lineTo(wx+50,30); x.lineTo(wx+26,82); x.closePath(); x.fill();
    if(Math.random()<0.8){y.fillStyle='#ffd878'; rr(y,wx,30,94,52,8); y.fill();}
  });
  x.fillStyle='rgba(0,0,0,.35)'; x.fillRect(0,0,3,128); x.fillRect(125,0,2,128);
  var f=mkCanvas(160,220), q=f.getContext('2d');
  q.fillStyle=css; q.fillRect(0,0,160,220);
  g=q.createLinearGradient(0,0,0,220); g.addColorStop(0,'rgba(255,255,255,.25)'); g.addColorStop(1,'rgba(0,0,0,.25)');
  q.fillStyle=g; q.fillRect(0,0,160,220);
  q.fillStyle='#2a2634'; q.fillRect(0,196,160,24);
  q.fillStyle='#14121c'; rr(q,34,12,92,22,5); q.fill();
  q.fillStyle='#ffb627'; q.font='700 15px "Baloo 2",sans-serif'; q.textAlign='center'; q.textBaseline='middle'; q.fillText('GALI EXP',80,24);
  q.fillStyle='rgba(0,0,0,.35)'; rr(q,16,40,128,96,14); q.fill();
  var wg=q.createLinearGradient(0,44,0,130); wg.addColorStop(0,'#9ad9ff'); wg.addColorStop(1,'#2b5a8f');
  q.fillStyle=wg; rr(q,20,44,120,88,12); q.fill();
  q.fillStyle=css; q.fillRect(77,44,6,88);
  q.fillStyle='rgba(255,255,255,.3)'; q.beginPath(); q.moveTo(26,128); q.lineTo(60,48); q.lineTo(76,48); q.lineTo(42,128); q.closePath(); q.fill();
  q.fillStyle=acc; q.fillRect(0,148,160,12); q.fillStyle='rgba(255,255,255,.85)'; q.fillRect(0,162,160,3);
  q.fillStyle='#fff'; rr(q,56,170,48,20,4); q.fill();
  q.fillStyle='#222'; q.font='700 14px "Baloo 2",sans-serif'; q.fillText(String(1000+((Math.random()*8999)|0)),80,181);
  return {side:s,sideE:e,front:f};
}
function makeTrain(ci,L,m){
  var g=new T.Group(), Wd=2.0, Ht=2.55, y0=0.5, art=deco.art[ci];
  var ts=track(ctex(art.side,L/3,1)), te=track(ctex(art.sideE,L/3,1));
  var sideM=track(tm(0xffffff,{map:ts,emissive:0xffffff,emissiveMap:te,emissiveIntensity:m.trainEm}));
  var frontM=track(tm(0xffffff,{map:deco.frontTex[ci]}));
  var backM=track(tm(m.trains[ci]));
  var body=new T.Mesh(new T.BoxGeometry(Wd,Ht,L),[sideM,sideM,deco.trainRoofM,deco.trainUnderM,frontM,backM]);
  body.position.y=y0+Ht/2; body.castShadow=true;
  var hull=new T.Mesh(body.geometry,boxOut); hull.scale.set(1+0.1/Wd,1+0.1/Ht,1+0.1/L); body.add(hull);
  g.add(body);
  var n=L>8?3:2, i;
  for(i=0;i<n;i++){var ac=bx(1.1,0.28,1.3,deco.trainRoofDarkM); ac.position.set(0,y0+Ht+0.14,(i-(n-1)/2)*(L/n)); g.add(ac);}
  [-1,1].forEach(function(s){
    var bg=bx(1.7,0.42,1.5,deco.trainUnderM); bg.position.set(0,0.3,s*(L/2-1.7)); g.add(bg);
  });
  [-1,1].forEach(function(s){
    var hl=new T.Mesh(deco.headlightG,deco.headlightM); hl.position.set(s*0.62,y0+0.55,L/2+0.02); g.add(hl);
  });
  var gl=glow(0xfff0b0,2.6,m.headGlow); gl.position.set(0,y0+0.6,L/2+0.5); g.add(gl);
  return g;
}
function makeBarrier(m){
  var g=new T.Group();
  var c=mkCanvas(128,32), x=c.getContext('2d'), i;
  for(i=0;i<8;i++){x.fillStyle=(i%2)?'#fff6e0':'#ff5a1f'; x.fillRect(i*16,0,17,32);}
  var st=track(new T.CanvasTexture(c));
  var board=bx(2.0,0.4,0.12,track(tm(0xffffff,{map:st})),0.03); board.position.set(0,0.82,0); g.add(board);
  var board2=bx(2.0,0.4,0.12,track(tm(0xffffff,{map:st})),0.03); board2.position.set(0,0.36,0); g.add(board2);
  var legM=track(tm(0x38343f));
  [-0.85,0.85].forEach(function(px){var l=bx(0.12,1.15,0.4,legM,0.025); l.position.set(px,0.58,0); g.add(l);});
  var lamp=new T.Mesh(track(new T.SphereGeometry(0.11,10,8)),track(bm(0xffa31a))); lamp.position.set(0,1.18,0); g.add(lamp);
  var gl=glow(0xffa31a,1.6,0.8); gl.position.set(0,1.2,0.1); g.add(gl);
  return g;
}
function makeGate(m){
  var g=new T.Group(), pm=track(tm(0x8a8497));
  [-1.05,1.05].forEach(function(px){var p=new T.Mesh(track(new T.CylinderGeometry(0.08,0.08,2.5,10)),pm); p.position.set(px,1.25,0); p.castShadow=true; ol(p,0.02); g.add(p);});
  var c=mkCanvas(256,64), x=c.getContext('2d'), i;
  x.fillStyle='#ffd23f'; x.fillRect(0,0,256,64);
  x.fillStyle='#1b1233';
  for(i=-2;i<14;i++){x.beginPath(); x.moveTo(i*24,0); x.lineTo(i*24+12,0); x.lineTo(i*24-6,64); x.lineTo(i*24-18,64); x.closePath(); x.fill();}
  x.fillStyle='#d7263d'; rr(x,44,8,168,48,10); x.fill();
  x.font='38px "Lilita One","Baloo 2",Impact,sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillStyle='#fff'; x.fillText('JHUKO',128,34);
  var bt=track(new T.CanvasTexture(c));
  var beam=bx(2.3,0.58,0.2,track(tm(0xffffff,{map:bt})),0.03); beam.position.set(0,1.45,0); g.add(beam);
  var bulbM=track(bm(0xfff0b8));
  for(i=0;i<5;i++){var b=new T.Mesh(track(new T.SphereGeometry(0.05,8,6)),bulbM); b.position.set(-0.9+i*0.45,1.1,0.12); g.add(b);}
  return g;
}
function buildTemplates(m){
  var ci, li;
  deco.trainRoofM=track(tm(0xd5dbe3)); deco.trainRoofDarkM=track(tm(0x9aa3b0)); deco.trainUnderM=track(tm(0x2a2634));
  deco.headlightG=track(new T.SphereGeometry(0.14,10,8)); deco.headlightM=track(bm(0xfff2b0));
  deco.art=[]; deco.frontTex=[];
  for(ci=0;ci<m.trains.length;ci++){
    var a=trainArt(hexCss(m.trains[ci]),m.accents[ci]); deco.art.push(a); deco.frontTex.push(track(ctex(a.front,1,1)));
  }
  tpl.train=[];
  for(ci=0;ci<m.trains.length;ci++){
    var row=[]; for(li=0;li<TRAIN_LEN.length;li++) row.push(makeTrain(ci,TRAIN_LEN[li],m));
    tpl.train.push(row);
  }
  tpl.barrier=makeBarrier(m); tpl.gate=makeGate(m);
  var cg=track(new T.CylinderGeometry(0.3,0.3,0.07,20)); cg.rotateX(Math.PI/2);
  var ig=track(new T.CylinderGeometry(0.2,0.2,0.1,16)); ig.rotateX(Math.PI/2);
  coinTpl=new T.Group();
  var c1=new T.Mesh(cg,track(tm(0xffc21a,{emissive:0xff9d00,emissiveIntensity:0.55}))); c1.castShadow=true; coinTpl.add(c1);
  coinTpl.add(new T.Mesh(ig,track(tm(0xffe27a,{emissive:0xffb000,emissiveIntensity:0.5}))));
}

function applyMap(){
  var m=MAPS[mapIdx];
  clearWorld();
  scene.fog.color.setHex(m.fog); scene.fog.near=m.fogN; scene.fog.far=m.fogF;
  hemi.color.setHex(m.hemiS); hemi.groundColor.setHex(m.hemiG); hemi.intensity=m.hemiI;
  sun.color.setHex(m.sunC); sun.intensity=m.sunI;
  buildSky(m); buildDeco(m); buildTrack(m); buildProps(m); buildBuildings(m); buildTemplates(m);
}

/* ================= character rig (cartoon: bada sir, bade joote, outline) ================= */
function makeRig(cfg){
  var robot=cfg.style==='robot', R={};
  var root=new T.Group(); R.root=root;
  var mSkin=tm(cfg.skin), mShirt=tm(cfg.shirt), mPants=tm(cfg.pants), mShoe=tm(cfg.shoes), mPack=tm(cfg.pack);
  var pelvis=new T.Group(); pelvis.position.y=1.02; root.add(pelvis); R.pelvis=pelvis;
  pelvis.add(ball(0.14,mPants,1.35,0.9,1,0.012));
  var torso=new T.Group(); torso.position.y=0.04; pelvis.add(torso); R.torso=torso;
  var chest=new T.Mesh(capsule(0.16,0.34),mShirt); chest.scale.set(1.3,1,0.8); chest.position.y=0.3; chest.castShadow=true; ol(chest,0.012); torso.add(chest);
  var neck=new T.Mesh(new T.CylinderGeometry(0.05,0.055,0.1,10),mSkin); neck.position.y=0.64; torso.add(neck);
  var head=new T.Group(); head.position.y=0.8; head.scale.setScalar(1.4); torso.add(head); R.head=head;
  if(robot){
    head.add(bx(0.22,0.24,0.22,mSkin,0.01));
    var vis=new T.Mesh(new T.BoxGeometry(0.18,0.05,0.02),new T.MeshBasicMaterial({color:0x25c1ae})); vis.position.set(0,0.02,-0.115); head.add(vis);
    var ant=new T.Mesh(new T.CylinderGeometry(0.012,0.012,0.1,6),mSkin); ant.position.y=0.17; head.add(ant);
    R.led=new T.Mesh(new T.SphereGeometry(0.035,8,6),new T.MeshBasicMaterial({color:0xff4f81})); R.led.position.y=0.23; head.add(R.led);
  } else {
    head.add(ball(0.113,mSkin,0.95,1.12,1,0.009));
    [-1,1].forEach(function(s){var e=ball(0.03,mSkin); e.position.set(s*0.105,0,0); head.add(e);});
    if(cfg.hair){var hr=ball(0.12,tm(cfg.hair),0.98,1.1,1.0,0.009); hr.position.set(0,0.012,0.012); head.add(hr);}
    if(cfg.hat){
      var hatM=tm(cfg.hat);
      var cap=new T.Mesh(new T.SphereGeometry(0.128,14,8,0,Math.PI*2,0,Math.PI/2),hatM); cap.position.y=0.035; cap.castShadow=true; ol(cap,0.009); head.add(cap);
      var vs=bx(0.17,0.016,0.1,hatM); vs.position.set(0,0.03,-0.13); vs.rotation.x=0.12; head.add(vs);
    }
    if(cfg.style==='braid'){
      var br=new T.Group(); br.position.set(0,-0.02,0.11); head.add(br); R.braid=br;
      var hm=tm(cfg.hair);
      for(var b=0;b<4;b++){var bb=ball(0.045-b*0.004,hm,1,1,1,0.008); bb.position.y=-0.05-b*0.075; br.add(bb);}
      var tie=ball(0.032,tm(0xee4b7e)); tie.position.y=-0.36; br.add(tie);
    }
  }
  var pack=bx(0.34,0.42,0.17,mPack,0.012); pack.position.set(0,0.32,0.18); torso.add(pack);
  var flap=bx(0.34,0.1,0.19,tm(new T.Color(cfg.pack).multiplyScalar(0.7).getHex())); flap.position.set(0,0.5,0.18); torso.add(flap);
  R.arms=[]; R.legs=[];
  [-1,1].forEach(function(s){
    var sh=new T.Group(); sh.position.set(s*0.25,0.52,0); torso.add(sh);
    sh.add(ball(0.062,mShirt)); sh.add(limb(0.056,0.3,mShirt,0.01));
    var el=new T.Group(); el.position.y=-0.3; sh.add(el);
    el.add(limb(0.045,0.28,mSkin,0.01)); var hand=ball(0.058,mSkin,1,1,1,0.01); hand.position.y=-0.3; el.add(hand);
    R.arms.push({sh:sh,el:el});
    var hip=new T.Group(); hip.position.set(s*0.095,-0.02,0); pelvis.add(hip);
    hip.add(limb(0.085,0.46,mPants,0.012));
    var kn=new T.Group(); kn.position.y=-0.45; hip.add(kn);
    kn.add(limb(0.068,0.45,mPants,0.012));
    var an=new T.Group(); an.position.y=-0.45; kn.add(an);
    var ft=bx(0.14,0.1,0.32,mShoe,0.012); ft.position.set(0,-0.04,-0.06); an.add(ft);
    R.legs.push({hip:hip,kn:kn});
  });
  return R;
}
function lerpPose(a,b,w){var o={}; for(var k in a) o[k]=a[k]+(b[k]-a[k])*w; return o;}
function runPose(p){
  var s=Math.sin(p), c=Math.cos(p), s2=Math.sin(p+Math.PI), c2=Math.cos(p+Math.PI);
  return {py:1.02+0.04*Math.cos(2*p),prx:0,pry:-s*0.12,tx:-0.22,ty:s*0.2,tz:c*0.04,hx:0.12,
    tL:s*0.85,tR:s2*0.85,kL:0.25+Math.max(0,c),kR:0.25+Math.max(0,c2),
    aL:-s*0.85+0.15,aR:-s2*0.85+0.15,eL:0.95+0.25*s,eR:0.95+0.25*s2};
}
var JUMP={py:1.08,prx:0,pry:0,tx:-0.12,ty:0,tz:0,hx:0.1,tL:1.05,tR:-0.35,kL:1.15,kR:0.75,aL:2.1,aR:1.9,eL:0.25,eR:0.35};
var SLIDE={py:0.42,prx:1.25,pry:0,tx:-0.5,ty:0,tz:0,hx:-0.5,tL:0.15,tR:0.2,kL:0.12,kR:0.5,aL:1.2,aR:1.0,eL:0.3,eR:0.4};
function deadPose(t){
  return {py:0.32,prx:1.45,pry:0,tx:-0.2,ty:0,tz:0,hx:-0.3,tL:0.7,tR:0.3,kL:0.4,kR:0.9,aL:2.5+Math.sin(t*18)*0.25,aR:2.2+Math.cos(t*16)*0.25,eL:0.4,eR:0.6};
}
function applyPose(R,P){
  R.pelvis.position.y=P.py; R.pelvis.rotation.set(P.prx,P.pry,0);
  R.torso.rotation.set(P.tx,P.ty,P.tz); R.head.rotation.x=P.hx;
  R.legs[0].hip.rotation.x=P.tL; R.legs[0].kn.rotation.x=-P.kL;
  R.legs[1].hip.rotation.x=P.tR; R.legs[1].kn.rotation.x=-P.kR;
  R.arms[0].sh.rotation.x=P.aL; R.arms[0].el.rotation.x=P.eL;
  R.arms[1].sh.rotation.x=P.aR; R.arms[1].el.rotation.x=P.eR;
}
var rig=null;
function setCharacter(i){
  if(rig) scene.remove(rig.root);
  charIdx=i; rig=makeRig(CHARS[i]); scene.add(rig.root);
}
var blob=new T.Mesh(new T.CircleGeometry(0.55,20),bm(0x000000,{transparent:true,opacity:0.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
blob.rotation.x=-Math.PI/2; blob.position.y=0.03; scene.add(blob);

/* ================= game state ================= */
var X=[-2.2,0,2.2];
var state='menu', dist=0, speed=9, ph=0, nextSpawn=40, score=0, coinsGot=0, best=0, dieT=0, shakeAmt=0, landT=0, dustT=0;
var wJ=0, wS=0, wD=0, deadClock=0;
var player={lane:1,x:0,y:0,vy:0,slideT:0};
var viewY=0, viewTarget=0;

try{
  var pr=JSON.parse(localStorage.getItem('gali-dauda-prefs4')||'{}');
  if(typeof pr.m==='number'&&MAPS[pr.m]) mapIdx=pr.m;
  if(typeof pr.c==='number'&&CHARS[pr.c]) charIdx=pr.c;
  best=parseInt(localStorage.getItem('gali-dauda-best')||'0',10)||0;
}catch(e){}
function savePrefs(){try{localStorage.setItem('gali-dauda-prefs4',JSON.stringify({m:mapIdx,c:charIdx}));}catch(e){}}

/* sound */
var AC=null;
function beep(f,d,type,v){
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    var o=AC.createOscillator(), gn=AC.createGain();
    o.type=type||'square'; o.frequency.value=f; gn.gain.value=v||0.04;
    o.connect(gn); gn.connect(AC.destination); o.start();
    gn.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d); o.stop(AC.currentTime+d);
  }catch(e){}
}

/* spawning */
function rnd3(){return (Math.random()*3)|0;}
function addCoinLine(lane,z,n,y){
  for(var k=0;k<n;k++){
    var c=coinTpl.clone(); c.position.set(X[lane],y||0.9,z-k*2.1);
    var gl=glow(0xffc23a,1.3,0.45); c.add(gl);
    dyn.add(c); coins.push({mesh:c,y:y||0.9,got:false,glow:gl,seed:Math.random()*6});
  }
}
function addObs(type,lane,z,ci,li){
  var o={type:type,x:X[lane],d:0.5,glows:[]}, m;
  if(type==='block'){
    if(ci===undefined) ci=(Math.random()*tpl.train.length)|0;
    if(li===undefined) li=(Math.random()*TRAIN_LEN.length)|0;
    m=tpl.train[ci][li].clone(); o.d=TRAIN_LEN[li];
  } else if(type==='low'){m=tpl.barrier.clone(); o.d=0.4;}
  else {m=tpl.gate.clone(); o.d=0.3;}
  m.position.set(o.x,0,z); dyn.add(m); o.mesh=m;
  m.traverse(function(ch){
    if(ch.isSprite){ch.material=ch.material.clone(); ch.material.onBeforeCompile=spriteFn; o.glows.push(ch);}
  });
  obs.push(o); return o;
}
function spawn(){
  var r=Math.random(), z=-100, l, k, len=0, li=(Math.random()*TRAIN_LEN.length)|0, ci=(Math.random()*tpl.train.length)|0, o;
  if(r<0.24){ // ek train
    l=rnd3(); o=addObs('block',l,z); len=o.d; addCoinLine((l+1+((Math.random()*2)|0))%3,z,6);
  } else if(r<0.4){ // do trains, ek lane khali
    l=rnd3(); for(k=0;k<3;k++) if(k!==l) addObs('block',k,z,ci,li);
    len=TRAIN_LEN[li]; addCoinLine(l,z,6);
  } else if(r<0.52){ // trains aage-peeche, beech wali lane khali
    addObs('block',0,z,ci,li); addObs('block',2,z-TRAIN_LEN[li]-8,(ci+1)%tpl.train.length,li);
    len=TRAIN_LEN[li]*2+8; addCoinLine(1,z-4,8);
  } else if(r<0.68){ // low barriers: kudo
    for(k=0;k<3;k++) addObs('low',k,z); addCoinLine(1,z-3,3,1.9);
  } else if(r<0.82){ // overhead gates: phisalo
    for(k=0;k<3;k++) addObs('high',k,z); addCoinLine(rnd3(),z-3,4);
  } else if(r<0.92){ // mix: train, barrier, gate
    var order=[0,1,2].sort(function(){return Math.random()-0.5;});
    o=addObs('block',order[0],z,ci,li); len=o.d; addObs('low',order[1],z); addObs('high',order[2],z);
    addCoinLine(order[1],z-4,3,1.9);
  } else {
    addCoinLine(rnd3(),z,10);
  }
  return len;
}

/* actions */
function move(d){
  if(state!=='play') return;
  var n=clamp(player.lane+d,0,2);
  if(n!==player.lane){player.lane=n; beep(520,0.06,'triangle',0.03);}
}
function jump(){
  if(state!=='play'||player.y>0.05) return;
  player.vy=12.8; player.slideT=0; beep(660,0.12,'triangle',0.04);
  burst(player.x,0.1,0.2,8,1.2,0.5,0.9,0.8,0.6);
}
function slide(){
  if(state!=='play') return;
  player.slideT=0.7; if(player.y>0.05) player.vy=-24;
}
var sp=null;
window.addEventListener('pointerdown',function(e){sp={x:e.clientX,y:e.clientY,done:false};});
window.addEventListener('pointermove',function(e){
  if(!sp||sp.done||state!=='play') return;
  var dx=e.clientX-sp.x, dy=e.clientY-sp.y;
  if(Math.hypot(dx,dy)<26) return;
  sp.done=true;
  if(Math.abs(dx)>Math.abs(dy)) move(dx>0?1:-1); else if(dy<0) jump(); else slide();
});
window.addEventListener('pointerup',function(){sp=null;});
window.addEventListener('pointercancel',function(){sp=null;});
window.addEventListener('keydown',function(e){
  var k=e.key;
  if(state!=='play'){
    if((k==='Enter'||k===' ')&&!e.repeat&&(state==='menu'||state==='over')){e.preventDefault(); startGame();}
    return;
  }
  if(k==='ArrowLeft'||k==='a'||k==='A') move(-1);
  else if(k==='ArrowRight'||k==='d'||k==='D') move(1);
  else if(k==='ArrowUp'||k==='w'||k==='W'||k===' '){jump(); e.preventDefault();}
  else if(k==='ArrowDown'||k==='s'||k==='S'){slide(); e.preventDefault();}
});

/* ================= UI flow ================= */
var el={
  hud:$('hud'), wrap:$('wrap'), sheet:$('sheet'),
  score:$('score'), coins:$('coins'),
  ttl:$('ttl'), sub:$('sub'), stats:$('stats'),
  fScore:$('fScore'), fCoins:$('fCoins'), fBest:$('fBest'),
  play:$('play'), chars:$('chars'), maps:$('maps'),
  speed:$('speed'), flash:$('flash')
};
function layoutSheet(){
  if(el.wrap.hidden||W>H){viewTarget=0; return;}
  var sh=el.sheet.getBoundingClientRect().height;
  viewTarget=clamp(0.69*H-(H-sh)/2,0,0.35*H);
}
function clearObjects(){
  while(dyn.children.length) dyn.remove(dyn.children[0]);
  obs=[]; coins=[];
}
function startGame(){
  if(state==='play') return;
  clearObjects(); dist=0; speed=0; nextSpawn=40; score=0; coinsGot=0; shakeAmt=0; wD=0; wJ=0; wS=0; landT=0;
  player={lane:1,x:0,y:0,vy:0,slideT:0}; sp=null;
  state='play'; el.wrap.hidden=true; el.hud.hidden=false; viewTarget=0;
  el.score.textContent='0'; el.coins.textContent='0';
  beep(440,0.1,'triangle',0.05); setTimeout(function(){beep(660,0.15,'triangle',0.05);},90);
}
function crash(){
  state='dying'; dieT=1.0; deadClock=0; shakeAmt=1; landT=0;
  beep(120,0.35,'sawtooth',0.07);
  el.flash.style.transition='none'; el.flash.style.opacity='0.75';
  window.requestAnimationFrame(function(){el.flash.style.transition='opacity .5s'; el.flash.style.opacity='0';});
  burst(player.x,0.9,0,36,4.5,0.9,1,0.7,0.3);
}
function showOver(){
  state='over';
  if(score>best){best=score; try{localStorage.setItem('gali-dauda-best',String(best));}catch(e){}}
  el.ttl.textContent='Takkar ho gayi!';
  el.sub.textContent='Character ya map badalna ho to chun lo, phir dobara bhaago.';
  el.fScore.textContent=score; el.fCoins.textContent=coinsGot; el.fBest.textContent=best;
  el.stats.hidden=false; el.play.textContent='Phir se bhaago!';
  el.hud.hidden=true; el.wrap.hidden=false;
  clearObjects(); wD=0; player.slideT=0; player.y=0; player.lane=1;
  layoutSheet();
}
el.play.addEventListener('click',startGame);

function buildUI(){
  el.chars.innerHTML=''; el.maps.innerHTML='';
  CHARS.forEach(function(cfg,i){
    var b=document.createElement('button'); b.type='button'; b.className='opt';
    var c=document.createElement('div'); c.className='chip';
    c.style.background='linear-gradient(135deg,'+hexCss(cfg.shirt)+' 55%,'+hexCss(cfg.pack)+' 55%)';
    var n=document.createElement('span'); n.textContent=cfg.name;
    b.appendChild(c); b.appendChild(n);
    b.addEventListener('click',function(){setCharacter(i); savePrefs(); refreshSel();});
    el.chars.appendChild(b);
  });
  MAPS.forEach(function(m,i){
    var b=document.createElement('button'); b.type='button'; b.className='opt';
    var s=document.createElement('div'); s.className='swatch';
    s.style.background='linear-gradient(to bottom,'+m.sky[0]+','+m.sky[2]+' 55%,'+m.ballast+' 55%)';
    var n=document.createElement('span'); n.textContent=m.name;
    b.appendChild(s); b.appendChild(n);
    b.addEventListener('click',function(){mapIdx=i; savePrefs(); applyMap(); refreshSel();});
    el.maps.appendChild(b);
  });
  refreshSel();
}
function refreshSel(){
  Array.prototype.forEach.call(el.chars.children,function(b,i){b.setAttribute('aria-pressed',i===charIdx?'true':'false');});
  Array.prototype.forEach.call(el.maps.children,function(b,i){b.setAttribute('aria-pressed',i===mapIdx?'true':'false');});
}

/* ================= per-frame update ================= */
function scrollWorld(d,t){
  var i, j, g, list, q, p, f, gl, fl;
  if(roadTex) roadTex.offset.y+=d/8;
  for(i=0;i<walkTexs.length;i++) walkTexs[i].offset.y+=d/2;
  for(j=0;j<blds.length;j++){
    list=blds[j];
    for(i=0;i<list.length;i++){
      g=list[i]; g.position.z+=d;
      gl=g.userData.glows;
      for(q=0;q<gl.length;q++) gl[q].material.opacity=gl[q].userData.base*fadeAt(g.position.z)*(0.85+0.15*Math.sin(t*3+i));
    }
    var front=list[0];
    if(front.position.z-front.userData.w/2>22){
      var back=list[list.length-1]; list.shift();
      dressBuilding(front);
      front.position.z=back.position.z-back.userData.w/2-front.userData.w/2;
      list.push(front);
    }
  }
  for(i=0;i<props.length;i++){
    p=props[i]; p.g.position.z+=d;
    if(p.g.position.z>18) p.g.position.z-=p.span;
    if(p.lamp) p.g.userData.glow.material.opacity=p.g.userData.glow.userData.base*fadeAt(p.g.position.z);
  }
  if(cloudRoot){
    for(i=0;i<cloudRoot.children.length;i++){
      f=cloudRoot.children[i]; f.position.x+=f.userData.v*0.016;
      if(f.position.x>340) f.position.x=-340;
    }
  }
}
function step(dt,t){
  var target=state==='play'?15+Math.min(20,dist/170):(state==='dying'?0:9);
  var acc=state==='dying'?55:14;
  speed+=clamp(target-speed,-acc*dt,acc*dt);
  var d=speed*dt; dist+=d; ph+=dt*speed*0.62;
  scrollWorld(d,t);
  var i, o, c;

  if(state==='play'){
    player.x+=(X[player.lane]-player.x)*Math.min(1,dt*13);
    var wasAir=player.y>0.02;
    player.vy-=36*dt; player.y+=player.vy*dt;
    if(player.y<=0){player.y=0; if(wasAir&&player.vy<-3){landT=0.18; burst(player.x,0.1,0.2,10,1.5,0.5,0.9,0.8,0.6); shakeAmt=Math.max(shakeAmt,0.18);} player.vy=0;}
    if(player.slideT>0) player.slideT-=dt;
    if(player.y<=0.02){
      dustT-=dt;
      if(dustT<=0){dustT=0.07; emit(player.x+rnd(-0.2,0.2),0.06,0.35,rnd(-0.3,0.3),rnd(0.3,0.9),rnd(0.5,1.5),0.5,0.85,0.75,0.55);}
    }
    if(dist>=nextSpawn){var len=spawn(); nextSpawn=dist+speed*0.65+7+len;}
  } else {
    player.x+=(X[1]-player.x)*Math.min(1,dt*8);
  }

  for(i=obs.length-1;i>=0;i--){
    o=obs[i]; o.mesh.position.z+=d;
    var oz=o.mesh.position.z;
    for(var g2=0;g2<o.glows.length;g2++) o.glows[g2].material.opacity=o.glows[g2].userData.base*fadeAt(oz);
    if(oz-o.d/2>20){dyn.remove(o.mesh); for(var g3=0;g3<o.glows.length;g3++) o.glows[g3].material.dispose(); obs.splice(i,1); continue;}
    if(state==='play' && oz-o.d/2<0.45 && oz+o.d/2>-0.45 && Math.abs(player.x-o.x)<0.9){
      var hit=false;
      if(o.type==='block') hit=true;
      else if(o.type==='low' && player.y<0.8) hit=true;
      else if(o.type==='high' && player.slideT<=0 && player.y<1.65) hit=true;
      if(hit){crash(); break;}
    }
  }
  for(i=coins.length-1;i>=0;i--){
    c=coins[i]; c.mesh.position.z+=d;
    var cz=c.mesh.position.z;
    c.mesh.rotation.y=t*5+c.seed; c.mesh.position.y=c.y+Math.sin(t*3+c.seed)*0.08;
    c.glow.material.opacity=c.glow.userData.base*fadeAt(cz);
    if(cz>12){dyn.remove(c.mesh); c.glow.material.dispose(); coins.splice(i,1); continue;}
    if(state==='play' && !c.got && Math.abs(cz)<0.8 && Math.abs(c.mesh.position.x-player.x)<0.9 && !(c.y>1.5 && player.y<0.5)){
      c.got=true; dyn.remove(c.mesh); c.glow.material.dispose(); coinsGot++; el.coins.textContent=coinsGot;
      burst(c.mesh.position.x,c.y,0,10,2.2,0.5,1,0.8,0.2); beep(980,0.07,'square',0.03);
    }
  }
  if(state==='dying'){
    dieT-=dt; deadClock+=dt; shakeAmt=Math.max(0,shakeAmt-dt*1.4);
    if(dieT<=0) showOver();
  }
  if(landT>0) landT-=dt;
  if(state==='play'){score=Math.floor(dist)+coinsGot*10; el.score.textContent=score;}

  animateChar(dt,t);
  updParticles(dt,d);
  updLines(d,state==='play'?speed:0);
  el.speed.style.opacity=(state==='play'?clamp((speed-17)/18,0,1):0).toFixed(2);
}

function animateChar(dt,t){
  var airborne=player.y>0.05, sliding=state==='play'&&player.slideT>0;
  wJ+=((airborne&&!sliding?1:0)-wJ)*Math.min(1,dt*14);
  wS+=((sliding?1:0)-wS)*Math.min(1,dt*18);
  wD+=((state==='dying'?1:0)-wD)*Math.min(1,dt*10);
  var P=runPose(ph);
  if(landT>0){P.py-=0.1*(landT/0.18); P.tx-=0.12*(landT/0.18);}
  P=lerpPose(P,JUMP,wJ); P=lerpPose(P,SLIDE,wS); P=lerpPose(P,deadPose(deadClock),wD);
  applyPose(rig,P);
  var dx=X[player.lane]-player.x;
  rig.root.position.set(player.x,player.y,state==='dying'?Math.min(1.4,deadClock*3):0);
  rig.root.rotation.z=clamp(-dx*0.12,-0.3,0.3);
  rig.root.rotation.y=clamp(-dx*0.22,-0.5,0.5);
  if(rig.braid){rig.braid.rotation.x=-(0.28+0.16*Math.sin(ph*2)); rig.braid.rotation.z=Math.sin(ph)*0.14;}
  if(rig.led) rig.led.material.color.setHex((t%0.6<0.3)?0xff4f81:0xffb627);
  var sc=clamp(1-player.y*0.18,0.5,1);
  blob.position.x=player.x; blob.position.z=state==='dying'?rig.root.position.z:0; blob.scale.set(sc,sc,sc);
  blob.material.opacity=0.32*sc;
}

function updateCamera(dt,t){
  var vf=58+(speed/36)*6, asp=W/H, th=Math.tan(vf*Math.PI/360);
  var d=clamp(3.9/(th*asp),7,13.5);
  camera.fov=vf; camera.aspect=asp;
  viewY+=(viewTarget-viewY)*Math.min(1,dt*4);
  if(viewY>1) camera.setViewOffset(W,H,0,viewY,W,H); else camera.clearViewOffset();
  var px=player.x*0.55, sx=0, sy=0;
  if(shakeAmt>0){sx=(Math.random()-0.5)*shakeAmt*0.6; sy=(Math.random()-0.5)*shakeAmt*0.6;}
  var bob=state==='play'?Math.sin(ph*2)*0.03:0;
  camera.position.set(px+sx,3.0+d*0.32+sy+bob,d);
  camera.lookAt(px*0.7,1.3,-11);
  camera.rotateZ(clamp((player.x-X[player.lane])*0.012,-0.04,0.04));
  camera.updateProjectionMatrix();
  if(skyMesh) skyMesh.position.copy(camera.position);
  if(sunSprite) sunSprite.position.set(camera.position.x-70,camera.position.y+55,camera.position.z-340);
  if(starPts) starPts.position.copy(camera.position);
  if(cloudRoot) cloudRoot.position.copy(camera.position);
  sun.position.set(-8+player.x*0.2,16,9); sun.target.position.set(player.x*0.2,0,-2);
}

/* ================= loop ================= */
var last=0, slow=0, frames=0;
function frame(ts){
  var dt=Math.min(0.05,Math.max(0,(ts-last)/1000)||0); last=ts;
  var t=ts/1000;
  CURVE.value.set(Math.sin(t*0.11)*0.0011,0.0026+0.0006*Math.sin(t*0.07));
  step(dt,t); updateCamera(dt,t);
  renderer.render(scene,camera);
  if(dpr>1){
    frames++; if(dt>0.034) slow++;
    if(frames>=120){ if(slow>70){dpr=1; renderer.setPixelRatio(1); renderer.setSize(W,H,false);} frames=0; slow=0; }
  }
  window.requestAnimationFrame(frame);
}
window.addEventListener('resize',resize);
document.addEventListener('visibilitychange',function(){last=0;});

function boot(){
  resize(); buildUI(); setCharacter(charIdx); applyMap(); layoutSheet(); viewY=viewTarget;
  window.requestAnimationFrame(frame);
}
if(document.fonts&&document.fonts.load){
  var started=false;
  var go=function(){if(started) return; started=true; boot();};
  Promise.all([document.fonts.load('40px "Lilita One"'),document.fonts.load('700 20px "Baloo 2"')]).then(go,go);
  setTimeout(go,1500);
} else boot();
})();
