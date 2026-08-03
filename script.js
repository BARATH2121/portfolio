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
  window.setTimeout(finish,2000);
}

// ---------------------------------------------
// 1) GOLDEN TORNADO (interactive background)
//    Sculpted hourglass of glowing strands, with
//    twinkling dots, racing comets, comet/dot
//    ripple collisions, cursor repel, and drag-spin.
// ---------------------------------------------
function initGoldenTornado(){
  const canvas=document.getElementById('bg3d');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;

  const reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Props (mirrors the Originkit Tornado controls) ----
  const BACKGROUND='#000000';
  const GOLD_HUE=48;                 // matches #FFCC00
  const LINE_COUNT=100;              // even, silky spacing (matches "123 lines" feel)
  const TOP_RADIUS=0.27;             // crown flare — from reference: top 190px
  const WAIST_RADIUS=0.075;          // pinch width — from reference: waist 53px
  const WAIST_POSITION=0.5;          // waist position 50%
  const BOTTOM_RADIUS=1.05;          // base spread — from reference: bottom 835px (wraps into a disc)
  const TWIST=2;                     // spiral turns — matches reference: twist 2
  const ZOOM=1.1;
  const SPEED=0.00085;               // auto rotation speed
  const DIRECTION_UP=false;          // matches reference: Direction = Down
  const SHOW_DOTS=false;             // matches reference: Dots = Hide
  const SHOW_COMETS=false;           // matches reference: Comets = Hide
  const REPEL=true;
  const DRAG_SENSITIVITY=0.006;
  const FRICTION=0.93;

  let time=0;
  let baseRotation=0.6;
  let dragVel=0, dragging=false, lastPX=0;
  let mouseX=-9999, mouseY=-9999, mouseActive=false;
  let fieldOffX=0, fieldOffY=0; // whole-form repel offset

  const ripples=[]; // {x,y,t}

  canvas.style.cursor='grab';
  canvas.style.touchAction='none';

  canvas.addEventListener('pointerdown',(e)=>{
    dragging=true; lastPX=e.clientX; dragVel=0;
    canvas.style.cursor='grabbing';
    try{ canvas.setPointerCapture(e.pointerId); }catch(err){}
  });
  window.addEventListener('pointermove',(e)=>{
    mouseX=e.clientX; mouseY=e.clientY; mouseActive=true;
    if(!dragging)return;
    const dx=e.clientX-lastPX;
    baseRotation+=dx*DRAG_SENSITIVITY;
    dragVel=dx*DRAG_SENSITIVITY;
    lastPX=e.clientX;
  });
  window.addEventListener('pointerup',()=>{ dragging=false; canvas.style.cursor='grab'; });
  canvas.addEventListener('pointerleave',()=>{ mouseActive=false; });
  canvas.addEventListener('click',(e)=>{
    ripples.push({x:e.clientX,y:e.clientY,t:0});
  });

  function easeInOut(k){ return k<0.5 ? 2*k*k : 1-Math.pow(-2*k+2,2)/2; }
  function W(){ return canvas.width; }
  function topY(){ return canvas.height*0.06; }
  function bottomY(){ return canvas.height*0.94; }
  function centerX(){ return canvas.width/2+fieldOffX; }

  function radiusAt(t){
    const crown=TOP_RADIUS*W()*ZOOM;
    const pinch=WAIST_RADIUS*W()*ZOOM;
    const base=BOTTOM_RADIUS*W()*ZOOM;
    if(t<WAIST_POSITION){
      return crown+(pinch-crown)*easeInOut(t/WAIST_POSITION);
    }
    return pinch+(base-pinch)*easeInOut((t-WAIST_POSITION)/(1-WAIST_POSITION));
  }

  function goldColor(t,alpha,bright){
    // consistent bright #FFCC00-style gold, not fading to amber
    const light=48+(bright||0)*22;
    return `hsla(${GOLD_HUE},100%,${light}%,${alpha})`;
  }

  function pointOn(strandIndex,t,rot){
    const angle=(strandIndex/LINE_COUNT)*Math.PI*2+t*TWIST*Math.PI*2+rot;
    const r=radiusAt(t);
    const y=topY()+t*(bottomY()-topY())+fieldOffY;
    const x=centerX()+Math.cos(angle)*r;
    return {x,y,r,angle};
  }

  function drawStrands(rot){
    const steps=64;
    for(let s=0;s<LINE_COUNT;s++){
      ctx.beginPath();
      for(let i=0;i<=steps;i++){
        const t=i/steps;
        let p=pointOn(s,t,rot);
        let x=p.x,y=p.y;
        if(REPEL&&mouseActive){
          const dx=x-mouseX,dy=y-mouseY;
          const dist=Math.hypot(dx,dy);
          const rad=110;
          if(dist<rad&&dist>0.001){
            const f=(1-dist/rad)*36;
            x+=(dx/dist)*f; y+=(dy/dist)*f;
          }
        }
        if(i===0)ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      }
      const grad=ctx.createLinearGradient(0,topY(),0,bottomY());
      grad.addColorStop(0,goldColor(0,0.75,1));
      grad.addColorStop(0.5,goldColor(0.5,0.6,0.85));
      grad.addColorStop(1,goldColor(1,0.5,0.75));
      ctx.strokeStyle=grad;
      ctx.lineWidth=1.1;
      ctx.stroke();
    }
  }

  class Dust{
    constructor(){ this.reset(); }
    reset(){
      this.strand=Math.floor(Math.random()*LINE_COUNT);
      this.t=Math.random();
      this.speed=0.00022+Math.random()*0.00035;
      this.jitter=(Math.random()-0.5)*22;
      this.size=0.8+Math.random()*1.8;
      this.phase=Math.random()*Math.PI*2;
      this.twinkleSpeed=0.05+Math.random()*0.06;
      this.bump=0;
    }
    update(rot){
      const dir=DIRECTION_UP?-1:1;
      this.t+=dir*this.speed*16;
      if(this.t>1||this.t<0)this.reset();
      const p=pointOn(this.strand,this.t,rot);
      this.x=p.x+Math.cos(p.angle+Math.PI/2)*this.jitter;
      this.y=p.y-(this.bump*8);
      if(this.bump>0)this.bump=Math.max(0,this.bump-0.04);
    }
    draw(){
      const twinkle=Math.sin(time*this.twinkleSpeed+this.phase)*0.4+0.6+this.bump*0.6;
      ctx.globalAlpha=Math.max(0.12,Math.min(1,twinkle));
      ctx.fillStyle=`hsla(${GOLD_HUE},90%,${70+this.bump*20}%,1)`;
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.size+this.bump*1.5,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha=1;
    }
  }
  const dust=[];
  if(SHOW_DOTS){ for(let i=0;i<90;i++)dust.push(new Dust()); }

  class Comet{
    constructor(){ this.reset(); }
    reset(){
      this.strand=Math.floor(Math.random()*LINE_COUNT);
      this.t=DIRECTION_UP?1:0;
      this.speed=0.0009+Math.random()*0.0006;
      this.trail=[];
    }
    update(rot){
      const dir=DIRECTION_UP?-1:1;
      this.t+=dir*this.speed*16;
      if(this.t>1||this.t<0){ this.reset(); return; }
      const p=pointOn(this.strand,this.t,rot);
      this.x=p.x; this.y=p.y;
      this.trail.push({x:p.x,y:p.y});
      if(this.trail.length>16)this.trail.shift();

      // collision-with-dust ripple
      for(const d of dust){
        const dx=d.x-this.x, dy=d.y-this.y;
        if(dx*dx+dy*dy<170){
          d.bump=1;
          ripples.push({x:this.x,y:this.y,t:0});
          break;
        }
      }
    }
    draw(){
      for(let i=0;i<this.trail.length;i++){
        const p=this.trail[i];
        const k=i/this.trail.length;
        ctx.globalAlpha=k*0.9;
        ctx.fillStyle=`hsla(${GOLD_HUE},95%,${75+k*15}%,1)`;
        ctx.beginPath();
        ctx.arc(p.x,p.y,0.7+k*2.6,0,Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha=1;
    }
  }
  const comets=[];
  if(SHOW_COMETS){
    for(let i=0;i<5;i++){ const c=new Comet(); c.t=Math.random(); comets.push(c); }
  }

  function drawRipples(){
    for(let i=ripples.length-1;i>=0;i--){
      const r=ripples[i];
      r.t+=0.035;
      if(r.t>1){ ripples.splice(i,1); continue; }
      const rad=r.t*70;
      ctx.globalAlpha=(1-r.t)*0.5;
      ctx.strokeStyle=`hsla(${GOLD_HUE},95%,70%,1)`;
      ctx.lineWidth=1.4;
      ctx.beginPath();
      ctx.arc(r.x,r.y,rad,0,Math.PI*2);
      ctx.stroke();
    }
    ctx.globalAlpha=1;
    if(ripples.length>40)ripples.splice(0,ripples.length-40);
  }

  function drawCoreGlow(){
    const cx=centerX(), cy=topY();
    const pulse=Math.sin(time*0.02)*0.15+0.85;
    const rad=radiusAt(0)*1.1*pulse;
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rad);
    g.addColorStop(0,`hsla(${GOLD_HUE},100%,70%,${0.4*pulse})`);
    g.addColorStop(1,`hsla(${GOLD_HUE},100%,55%,0)`);
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(cx,cy,rad,0,Math.PI*2);
    ctx.fill();
  }

  function frame(){
    ctx.fillStyle=BACKGROUND;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    if(!dragging){
      baseRotation+=SPEED+dragVel;
      dragVel*=FRICTION;
    }

    if(REPEL&&mouseActive){
      const targetOffX=(canvas.width/2-mouseX)*0.03;
      const targetOffY=(canvas.height*0.4-mouseY)*0.015;
      fieldOffX+=(targetOffX-fieldOffX)*0.05;
      fieldOffY+=(targetOffY-fieldOffY)*0.05;
    }else{
      fieldOffX*=0.95; fieldOffY*=0.95;
    }

    drawCoreGlow();
    drawStrands(baseRotation);
    for(const d of dust){ d.update(baseRotation); d.draw(); }
    for(const c of comets){ c.update(baseRotation); c.draw(); }
    drawRipples();

    time++;
    if(!reducedMotion)requestAnimationFrame(frame);
  }

  if(reducedMotion){
    ctx.fillStyle=BACKGROUND;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawCoreGlow();
    drawStrands(baseRotation);
  }else{
    frame();
  }

  window.addEventListener('resize',()=>{
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
  });
}

// ---------------------------------------------
// 2) FLOATING GLASS ORBS (gold/amber)
// ---------------------------------------------
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
initGoldenTornado();
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
