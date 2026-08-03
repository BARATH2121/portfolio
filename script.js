// ============================================
// INTERACTIVE 3D ENGINE — BLACK & GOLD EDITION
// Draggable/repel Tornado + floating glass orbs
// + cursor spotlight + whole-page tilt/parallax
// + 5s "BARATH" glowing loader
// ============================================

// ---------------------------------------------
// 0) LOADER — glowing "BARATH" intro, shown 5s
// ---------------------------------------------
function initLoader(){
  const loader=document.getElementById('loader');
  if(!loader)return;
  document.body.style.overflow='hidden';
  const finish=()=>{
    loader.classList.add('hide');
    document.body.style.overflow='';
    setTimeout(()=>{ if(loader.parentNode)loader.parentNode.removeChild(loader); },900);
  };
  window.setTimeout(finish,5000);
}

// ---------------------------------------------
// 1) GOLDEN TORNADO (interactive background)
//    Sculpted hourglass of glowing strands, with
//    twinkling dots, racing comets, comet/dot
//    ripple collisions, cursor repel, and drag-spin.
// ---------------------------------------------
// ---------------------------------------------
// 1) GOLDEN BLACK HOLE (interactive background)
//    A tilted, rotating accretion disk of gold
//    particles swirling around a dark core, with
//    trailing streaks. Drag to rotate/tilt the
//    view, hover to nudge particles, click for a
//    ripple burst.
// ---------------------------------------------
function initGoldenBlackHole(){
  const canvas=document.getElementById('bg3d');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;

  const reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Props (mirrors the Originkit Black Hole controls) ----
  const GOLD_HUE=48;                 // matches #FFCC00
  const PARTICLE_COUNT=900;
  const ORBIT_RADIUS_PCT=0.62;       // outer orbit radius, fraction of min(w,h)
  const INNER_RADIUS_PCT=0.09;       // event-horizon cutoff, fraction of outer
  const PARTICLE_SIZE=1.6;
  const BASE_SPEED=0.0016;
  const TRAIL_LENGTH=5;
  const TILT_ANGLE=0.34;             // ~20deg, disc inclination (X axis)
  const SIDEWAY_TILT=2.35;           // ~136deg, in-plane orientation (Z axis)
  const GRAVITY_INFLOW=0;            // 0 = stable rings (matches reference default)
  const DRAG_SENSITIVITY=0.006;
  const FRICTION=0.92;
  const REPEL_RADIUS=90;
  const REPEL_STRENGTH=22;

  let time=0;
  let sidewayTilt=SIDEWAY_TILT, tiltAngle=TILT_ANGLE;
  let velSide=0, velTilt=0;
  let dragging=false, lastPX=0, lastPY=0;
  let mouseX=-9999, mouseY=-9999, mouseActive=false;
  const ripples=[];

  canvas.style.cursor='grab';
  canvas.style.touchAction='none';

  canvas.addEventListener('pointerdown',(e)=>{
    dragging=true; lastPX=e.clientX; lastPY=e.clientY; velSide=0; velTilt=0;
    canvas.style.cursor='grabbing';
    try{ canvas.setPointerCapture(e.pointerId); }catch(err){}
  });
  window.addEventListener('pointermove',(e)=>{
    mouseX=e.clientX; mouseY=e.clientY; mouseActive=true;
    if(!dragging)return;
    const dx=e.clientX-lastPX, dy=e.clientY-lastPY;
    sidewayTilt+=dx*DRAG_SENSITIVITY;
    tiltAngle+=dy*DRAG_SENSITIVITY*0.6;
    tiltAngle=Math.max(-1.3,Math.min(1.3,tiltAngle));
    velSide=dx*DRAG_SENSITIVITY;
    velTilt=dy*DRAG_SENSITIVITY*0.6;
    lastPX=e.clientX; lastPY=e.clientY;
  });
  window.addEventListener('pointerup',()=>{ dragging=false; canvas.style.cursor='grab'; });
  canvas.addEventListener('pointerleave',()=>{ mouseActive=false; });
  canvas.addEventListener('click',(e)=>{ ripples.push({x:e.clientX,y:e.clientY,t:0}); });

  function centerX(){ return canvas.width/2; }
  function centerY(){ return canvas.height*0.46; }
  function outerR(){ return Math.min(canvas.width,canvas.height)*ORBIT_RADIUS_PCT; }
  function innerR(){ return outerR()*INNER_RADIUS_PCT; }

  class Particle{
    constructor(){ this.reset(true); }
    reset(initial){
      this.r=innerR()+Math.random()*(outerR()-innerR());
      if(!initial)this.r=outerR();
      this.theta=Math.random()*Math.PI*2;
      this.size=PARTICLE_SIZE*(0.4+Math.random()*1.3);
      this.trail=[];
    }
    angularSpeed(){
      const rr=Math.max(this.r,innerR()*1.2);
      return BASE_SPEED*(outerR()/rr);
    }
    project(){
      const X0=this.r*Math.cos(this.theta);
      const Z0=this.r*Math.sin(this.theta);
      const Y0=0;
      // tilt around X axis (inclination)
      const Y1=Y0*Math.cos(tiltAngle)-Z0*Math.sin(tiltAngle);
      const Z1=Y0*Math.sin(tiltAngle)+Z0*Math.cos(tiltAngle);
      const X1=X0;
      // rotate around Z axis (in-plane orientation)
      const Xr=X1*Math.cos(sidewayTilt)-Y1*Math.sin(sidewayTilt);
      const Yr=X1*Math.sin(sidewayTilt)+Y1*Math.cos(sidewayTilt);
      return {sx:centerX()+Xr, sy:centerY()+Yr, depth:Z1};
    }
    update(){
      this.theta+=this.angularSpeed()*16;
      if(GRAVITY_INFLOW>0){
        this.r-=GRAVITY_INFLOW*0.02;
        if(this.r<innerR()){ this.reset(false); }
      }
      const p=this.project();
      let sx=p.sx, sy=p.sy;
      if(mouseActive){
        const dx=sx-mouseX, dy=sy-mouseY;
        const dist=Math.hypot(dx,dy);
        if(dist<REPEL_RADIUS&&dist>0.001){
          const f=(1-dist/REPEL_RADIUS)*REPEL_STRENGTH;
          sx+=(dx/dist)*f; sy+=(dy/dist)*f;
        }
      }
      this.sx=sx; this.sy=sy; this.depth=p.depth;
      this.trail.push({x:sx,y:sy});
      if(this.trail.length>TRAIL_LENGTH)this.trail.shift();
    }
    draw(){
      const depthNorm=(this.depth/outerR()+1)/2; // 0 back .. 1 front
      const baseAlpha=0.25+depthNorm*0.65;
      const hue=GOLD_HUE;
      for(let i=0;i<this.trail.length;i++){
        const t=this.trail[i];
        const k=(i+1)/this.trail.length;
        ctx.globalAlpha=baseAlpha*k*0.7;
        ctx.fillStyle=`hsla(${hue},100%,${50+depthNorm*25}%,1)`;
        ctx.beginPath();
        ctx.arc(t.x,t.y,this.size*(0.5+k*0.6),0,Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha=1;
    }
  }

  const particles=[];
  for(let i=0;i<PARTICLE_COUNT;i++)particles.push(new Particle());

  function drawCore(){
    const cx=centerX(), cy=centerY();
    const r=innerR();
    // soft gold accretion glow behind the core
    const glow=ctx.createRadialGradient(cx,cy,r*0.3,cx,cy,r*2.2);
    glow.addColorStop(0,`hsla(${GOLD_HUE},100%,60%,0.35)`);
    glow.addColorStop(0.5,`hsla(${GOLD_HUE},100%,55%,0.12)`);
    glow.addColorStop(1,'hsla(48,100%,55%,0)');
    ctx.fillStyle=glow;
    ctx.beginPath();
    ctx.arc(cx,cy,r*2.2,0,Math.PI*2);
    ctx.fill();

    // event horizon ring
    ctx.strokeStyle=`hsla(${GOLD_HUE},100%,70%,0.6)`;
    ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.ellipse(cx,cy,r*1.15,r*1.15*0.55,sidewayTilt,0,Math.PI*2);
    ctx.stroke();

    // pure black core void
    ctx.fillStyle='#000000';
    ctx.beginPath();
    ctx.ellipse(cx,cy,r,r*0.55,sidewayTilt,0,Math.PI*2);
    ctx.fill();
  }

  function drawRipples(){
    for(let i=ripples.length-1;i>=0;i--){
      const rp=ripples[i];
      rp.t+=0.03;
      if(rp.t>1){ ripples.splice(i,1); continue; }
      ctx.globalAlpha=(1-rp.t)*0.5;
      ctx.strokeStyle=`hsla(${GOLD_HUE},100%,70%,1)`;
      ctx.lineWidth=1.4;
      ctx.beginPath();
      ctx.arc(rp.x,rp.y,rp.t*80,0,Math.PI*2);
      ctx.stroke();
    }
    ctx.globalAlpha=1;
    if(ripples.length>30)ripples.splice(0,ripples.length-30);
  }

  function frame(){
    ctx.fillStyle='#000000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    if(!dragging){
      sidewayTilt+=0.0016+velSide;
      velSide*=FRICTION; velTilt*=FRICTION;
      tiltAngle+=velTilt;
    }

    particles.sort((a,b)=>(a.depth||0)-(b.depth||0));
    for(const p of particles)p.update();
    drawCore();
    for(const p of particles)p.draw();
    drawRipples();

    time++;
    if(!reducedMotion)requestAnimationFrame(frame);
  }

  if(reducedMotion){
    ctx.fillStyle='#000000';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for(const p of particles)p.update();
    drawCore();
    for(const p of particles)p.draw();
  }else{
    frame();
  }

  window.addEventListener('resize',()=>{
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
  });
}

function initFloatingOrbs(){
  const container=document.createElement('div');
  container.className='floating-orbs';
  container.setAttribute('aria-hidden','true');
  ['orb orb-1','orb orb-2','orb orb-3','orb orb-4'].forEach(cls=>{
    const d=document.createElement('div');
    d.className=cls;
    container.appendChild(d);
  });
  document.body.prepend(container);
}

// ---------------------------------------------
// 3) CURSOR SPOTLIGHT (gold)
// ---------------------------------------------
function initCursorSpotlight(){
  const spotlight=document.createElement('div');
  spotlight.className='cursor-spotlight';
  spotlight.setAttribute('aria-hidden','true');
  document.body.appendChild(spotlight);

  let targetX=window.innerWidth/2, targetY=window.innerHeight/2;
  let curX=targetX, curY=targetY;

  window.addEventListener('pointermove',(e)=>{
    targetX=e.clientX; targetY=e.clientY;
  });

  function loop(){
    curX+=(targetX-curX)*0.15;
    curY+=(targetY-curY)*0.15;
    spotlight.style.setProperty('--sx',curX+'px');
    spotlight.style.setProperty('--sy',curY+'px');
    requestAnimationFrame(loop);
  }
  loop();
}

// ---------------------------------------------
// 4) 3D TILT ON CARDS (whole page)
// ---------------------------------------------
function initTiltCards(){
  const selectors='.project-card, .github-project-card, .skill-category, .meta-item, .contact-link, .timeline-content';
  const cards=document.querySelectorAll(selectors);
  const MAX_TILT=10;

  cards.forEach(card=>{
    card.style.transformStyle='preserve-3d';
    card.style.willChange='transform';
    card.style.transition='transform 0.15s ease-out, box-shadow 0.3s ease';

    card.addEventListener('mousemove',(e)=>{
      const rect=card.getBoundingClientRect();
      const px=(e.clientX-rect.left)/rect.width;
      const py=(e.clientY-rect.top)/rect.height;
      const rotateX=(0.5-py)*MAX_TILT;
      const rotateY=(px-0.5)*MAX_TILT;
      card.style.transform=`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transition='transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease';
      card.style.transform='perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    });
    card.addEventListener('mouseenter',()=>{
      card.style.transition='transform 0.15s ease-out, box-shadow 0.3s ease';
    });
  });
}

// ---------------------------------------------
// 5) TILTING HERO PROFILE IMAGE
// ---------------------------------------------
function initHeroTilt(){
  const container=document.querySelector('.profile-image-container');
  if(!container)return;
  container.style.transformStyle='preserve-3d';
  container.style.willChange='transform';

  let targetRX=0, targetRY=0, curRX=0, curRY=0;
  const MAX_TILT=14;

  window.addEventListener('mousemove',(e)=>{
    const px=e.clientX/window.innerWidth;
    const py=e.clientY/window.innerHeight;
    targetRY=(px-0.5)*MAX_TILT*2;
    targetRX=(0.5-py)*MAX_TILT;
  });

  function loop(){
    curRX+=(targetRX-curRX)*0.08;
    curRY+=(targetRY-curRY)*0.08;
    container.style.transform=`perspective(900px) rotateX(${curRX}deg) rotateY(${curRY}deg)`;
    requestAnimationFrame(loop);
  }
  loop();
}

// ---------------------------------------------
// INIT EVERYTHING
// ---------------------------------------------
initLoader();
initGoldenBlackHole();
initFloatingOrbs();
initCursorSpotlight();
initTiltCards();
initHeroTilt();


// ============================================
// SCROLL & NAVIGATION ENHANCEMENTS
// ============================================

const navLinks=document.querySelectorAll('a[href^="#"]');
navLinks.forEach(anchor=>{
  anchor.addEventListener('click',function(e){
    e.preventDefault();
    const targetId=this.getAttribute('href');
    const target=document.querySelector(targetId);
    if(target){
      const headerOffset=80;
      const elementPosition=target.getBoundingClientRect().top+window.pageYOffset;
      const offsetPosition=elementPosition-headerOffset;
      window.scrollTo({top:offsetPosition,behavior:'smooth'});
    }
  });
});

// Navbar scroll effect with glassmorphism
window.addEventListener('scroll',function(){
  const navbar=document.querySelector('.navbar');
  if(!navbar)return;
  const scrollY=window.scrollY;
  if(scrollY>50){
    navbar.style.background='rgba(0,8,20,0.9)';
    navbar.style.backdropFilter='blur(18px)';
    navbar.style.boxShadow='0 4px 30px rgba(0,255,255,0.1)';
  }else{
    navbar.style.background='rgba(0,15,30,0.85)';
    navbar.style.backdropFilter='blur(12px)';
    navbar.style.boxShadow='none';
  }
});

// Intersection observer for fade-in animations
const observerOptions={threshold:0.1,rootMargin:'0px 0px -100px 0px'};
const observer=new IntersectionObserver(function(entries){
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.style.animation='fadeInUp 0.6s ease forwards';
      observer.unobserve(entry.target);
    }
  });
},observerOptions);

document.querySelectorAll('.project-card').forEach(card=>{
  card.style.opacity='0';
  observer.observe(card);
});
document.querySelectorAll('.skill-category').forEach(card=>{
  card.style.opacity='0';
  observer.observe(card);
});
document.querySelectorAll('.timeline-content').forEach(card=>{
  card.style.opacity='0';
  observer.observe(card);
});

// Animation keyframes
const style=document.createElement('style');
style.textContent=`@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`;
document.head.appendChild(style);

window.addEventListener('load',()=>{
  const elements=document.querySelectorAll('.project-card, .skill-category, .timeline-content');
  elements.forEach((el,index)=>{
    el.style.animationDelay=`${index*100}ms`;
  });
});

// Project link hover effects
const projectLinks=document.querySelectorAll('.project-link');
projectLinks.forEach(link=>{
  link.addEventListener('mouseenter',function(){
    this.style.transform='translateX(15px)';
    this.style.color='#f5f3ff';
  });
  link.addEventListener('mouseleave',function(){
    this.style.transform='translateX(0)';
    this.style.color='#c4b5fd';
  });
});

console.log('⚡ ULTIMATE HEXAGON ENERGY CORE ENGINE DEPLOYED!');
console.log('💫 Premium 3D Background with Fiber-Optic Streams - Ready for Production');


// Enhanced hover z-index management
const interactiveElements = document.querySelectorAll('.btn, .project-card, .skill-tag, .contact-link');
interactiveElements.forEach(el => {
  el.addEventListener('mouseenter', function() { this.style.zIndex = '10'; });
  el.addEventListener('mouseleave', function() { this.style.zIndex = 'auto'; });
});

// Performance tracking for page visibility
document.addEventListener('visibilitychange', () => {
  if(document.hidden) {
    console.log('Portfolio minimized');
  } else {
    console.log('Portfolio active');
  }
});

console.log('✨ Enhanced animations active!');
