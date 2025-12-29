// ============================================
// ULTIMATE 3D HEXAGON ENERGY NETWORK ENGINE
// Premium Glassmorphism + Fiber-Optic Core
// ============================================

function initHexagonEnergyBackground(){
  const canvas=document.getElementById('bg3d');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
  
  let time=0;
  const particles=[];
  const rayStreams=[];
  
  // HEXAGON CORE - Central energy vortex
  class HexagonCore{
    constructor(x,y){
      this.x=x;
      this.y=y;
      this.size=80;
      this.rotation=0;
      this.rotationSpeed=0.003;
      this.glow=0;
      this.pulseStrength=0;
    }
    update(){
      this.rotation+=this.rotationSpeed;
      this.glow=Math.sin(time*0.03)*0.4+0.6;
      this.pulseStrength=Math.sin(time*0.02)*0.3+0.7;
    }
    draw(){
      ctx.save();
      ctx.translate(this.x,this.y);
      ctx.rotate(this.rotation);
      
      // Inner glow
      const innerGlow=ctx.createRadialGradient(0,0,0,0,0,this.size*1.2);
      innerGlow.addColorStop(0,`hsla(180,100%,60%,${this.glow*0.8})`);
      innerGlow.addColorStop(0.5,`hsla(200,100%,40%,${this.glow*0.4})`);
      innerGlow.addColorStop(1,`hsla(220,100%,20%,0)`);
      ctx.fillStyle=innerGlow;
      ctx.beginPath();
      ctx.arc(0,0,this.size*1.5,0,Math.PI*2);
      ctx.fill();
      
      // Hexagon shape
      ctx.strokeStyle=`hsla(180,100%,${50+Math.sin(time*0.04)*20}%,${this.glow})`;
      ctx.lineWidth=3+this.pulseStrength*2;
      ctx.beginPath();
      for(let i=0;i<6;i++){
        const angle=(i*Math.PI/3)-Math.PI/2;
        const px=Math.cos(angle)*this.size;
        const py=Math.sin(angle)*this.size;
        if(i===0)ctx.moveTo(px,py);
        else ctx.lineTo(px,py);
      }
      ctx.closePath();
      ctx.stroke();
      
      // Hexagon fill with gradient
      const hexGradient=ctx.createRadialGradient(0,0,0,0,0,this.size);
      hexGradient.addColorStop(0,`hsla(180,100%,40%,${0.3*this.pulseStrength})`);
      hexGradient.addColorStop(1,`hsla(200,100%,20%,${0.1*this.pulseStrength})`);
      ctx.fillStyle=hexGradient;
      ctx.fill();
      
      // Center spark
      ctx.globalAlpha=this.glow;
      ctx.fillStyle=`hsla(180,100%,80%,1)`;
      ctx.beginPath();
      ctx.arc(0,0,8+Math.sin(time*0.05)*4,0,Math.PI*2);
      ctx.fill();
      
      ctx.globalAlpha=1;
      ctx.restore();
    }
  }
  
  // RAY STREAM - Energy beams from hexagon
  class RayStream{
    constructor(angle){
      this.angle=angle;
      this.length=0;
      this.maxLength=400;
      this.speed=4;
      this.particles=[];
      for(let i=0;i<15;i++){
        this.particles.push({offset:i*20,opacity:0});
      }
    }
    update(){
      this.length=Math.min(this.length+this.speed,this.maxLength);
      for(let p of this.particles){
        p.offset=Math.max(p.offset-3,0);
        p.opacity=1-(p.offset/this.maxLength);
      }
    }
    draw(coreX,coreY){
      const endX=coreX+Math.cos(this.angle)*this.length;
      const endY=coreY+Math.sin(this.angle)*this.length;
      
      // Ray line
      ctx.strokeStyle=`hsla(180,100%,50%,0.3)`;
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(coreX,coreY);
      ctx.lineTo(endX,endY);
      ctx.stroke();
      
      // Particle stream
      for(let p of this.particles){
        const px=coreX+Math.cos(this.angle)*(this.length-p.offset);
        const py=coreY+Math.sin(this.angle)*(this.length-p.offset);
        ctx.fillStyle=`hsla(180,100%,60%,${p.opacity})`;
        ctx.beginPath();
        ctx.arc(px,py,2+p.opacity*3,0,Math.PI*2);
        ctx.fill();
      }
    }
  }
  
  // PARTICLE - Digital sparks
  class Particle{
    constructor(){
      this.x=Math.random()*canvas.width;
      this.y=Math.random()*canvas.height;
      this.vx=(Math.random()-0.5)*2;
      this.vy=(Math.random()-0.5)*2;
      this.size=Math.random()*2+0.5;
      this.opacity=Math.random()*0.6+0.2;
      this.life=Math.random()*100+50;
      this.maxLife=this.life;
    }
    update(){
      this.x+=this.vx;
      this.y+=this.vy;
      this.life--;
      if(this.x<0||this.x>canvas.width)this.vx*=-1;
      if(this.y<0||this.y>canvas.height)this.vy*=-1;
      if(this.life<=0){
        this.x=Math.random()*canvas.width;
        this.y=Math.random()*canvas.height;
        this.life=this.maxLife;
      }
      this.opacity=this.life/this.maxLife;
    }
    draw(){
      ctx.globalAlpha=this.opacity;
      ctx.fillStyle=`hsla(180,100%,60%,1)`;
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
      ctx.fill();
    }
  }
  
  // Initialize
  const hexCore=new HexagonCore(canvas.width/2,canvas.height/2);
  for(let i=0;i<6;i++){
    rayStreams.push(new RayStream((i*Math.PI/3)-Math.PI/2));
  }
  for(let i=0;i<80;i++)particles.push(new Particle());
  
  // Main animation loop
  function animate(){
    // Deep space background
    const bgGradient=ctx.createRadialGradient(canvas.width/2,canvas.height/2,0,canvas.width/2,canvas.height/2,Math.max(canvas.width,canvas.height)*0.7);
    bgGradient.addColorStop(0,'#001a33');
    bgGradient.addColorStop(0.5,'#000d1a');
    bgGradient.addColorStop(1,'#000000');
    ctx.fillStyle=bgGradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    // Subtle animated grid
    ctx.globalAlpha=0.02+Math.sin(time*0.0005)*0.015;
    ctx.strokeStyle='hsla(180,100%,50%,0.5)';
    ctx.lineWidth=0.5;
    const gridSize=120;
    for(let i=0;i<canvas.width;i+=gridSize){
      for(let j=0;j<canvas.height;j+=gridSize){
        ctx.strokeRect(i+Math.sin(time*0.0008+i)*5,j+Math.cos(time*0.0008+j)*5,gridSize-10,gridSize-10);
      }
    }
    ctx.globalAlpha=1;
    
    // Update and draw rays
    for(const ray of rayStreams){
      ray.update();
      ray.draw(hexCore.x,hexCore.y);
    }
    
    // Update and draw hexagon core
    hexCore.update();
    hexCore.draw();
    
    // Update and draw particles
    for(const particle of particles){
      particle.update();
      particle.draw();
    }
    
    // Cinematic lens flares
    ctx.globalAlpha=0.06;
    for(let i=0;i<4;i++){
      const flareX=canvas.width*0.2+i*0.25*canvas.width+Math.sin(time*0.001+i)*30;
      const flareY=canvas.height*0.3+Math.cos(time*0.0008+i)*40;
      const flareGradient=ctx.createRadialGradient(flareX,flareY,0,flareX,flareY,80);
      flareGradient.addColorStop(0,`hsla(180,100%,60%,1)`);
      flareGradient.addColorStop(1,`hsla(180,100%,60%,0)`);
      ctx.fillStyle=flareGradient;
      ctx.fillRect(flareX-100,flareY-100,200,200);
    }
    ctx.globalAlpha=1;
    
    time++;
    requestAnimationFrame(animate);
  }
  
  animate();
  
  // Resize handler
  window.addEventListener('resize',()=>{
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
  });
}

// Initialize the premium background
initHexagonEnergyBackground();

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
