// ============================================
// ADVANCED 3D GLASSY WEDGES BACKGROUND ENGINE
// Glassmorphism + Fiber-optic Network Effect
// ============================================

function initGlassyWedgesBackground(){
  const canvas=document.getElementById('bg3d');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
  
  let time=0;
  const wedges=[];
  const networkLines=[];
  const particles=[];
  
  // WEDGE OBJECT - Floating glass shards
  class Wedge{
    constructor(){
      this.x=Math.random()*canvas.width;
      this.y=Math.random()*canvas.height;
      this.z=Math.random()*100;
      this.size=Math.random()*40+20;
      this.rotation=Math.random()*Math.PI*2;
      this.vx=(Math.random()-0.5)*1.5;
      this.vy=(Math.random()-0.5)*1.5;
      this.vz=(Math.random()-0.5)*0.8;
      this.rotationSpeed=(Math.random()-0.5)*0.03;
      this.hue=210+Math.random()*30; // blue-purple range
      this.lightness=Math.random()*30+50;
    }
    update(){
      this.x+=this.vx;
      this.y+=this.vy;
      this.z+=this.vz;
      this.rotation+=this.rotationSpeed;
      if(this.x<-this.size)this.x=canvas.width+this.size;
      if(this.x>canvas.width+this.size)this.x=-this.size;
      if(this.y<-this.size)this.y=canvas.height+this.size;
      if(this.y>canvas.height+this.size)this.y=-this.size;
      if(this.z<0||this.z>100)this.z=Math.abs(this.z)%100;
    }
    draw(){
      ctx.save();
      ctx.translate(this.x,this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha=0.7+Math.sin(time*0.01+this.z)*0.2;
      const gradient=ctx.createLinearGradient(-this.size,-this.size,this.size,this.size);
      gradient.addColorStop(0,`hsla(${this.hue},100%,70%,0.6)`);
      gradient.addColorStop(0.5,`hsla(${this.hue},80%,${this.lightness}%,0.3)`);
      gradient.addColorStop(1,`hsla(${this.hue},100%,60%,0.5)`);
      ctx.fillStyle=gradient;
      ctx.beginPath();
      ctx.moveTo(-this.size,-this.size*0.5);
      ctx.lineTo(this.size*0.7,-this.size);
      ctx.lineTo(this.size,this.size);
      ctx.lineTo(-this.size*0.8,this.size*0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle=`hsla(${this.hue},100%,70%,${0.8+Math.sin(time*0.02)*0.2})`;
      ctx.lineWidth=1.5+Math.sin(time*0.03)*0.5;
      ctx.stroke();
      ctx.shadowColor=`hsla(${this.hue},100%,50%,0.7)`;
      ctx.shadowBlur=20+Math.sin(time*0.01)*10;
      ctx.globalAlpha=1;
      ctx.restore();
    }
  }
  
  // NETWORK LINE - Fiber optic connections
  class NetworkLine{
    constructor(w1,w2){
      this.start=w1;
      this.end=w2;
      this.pulsePos=0;
    }
    update(){
      this.pulsePos=(this.pulsePos+0.02)%1;
    }
    draw(){
      const x1=this.start.x;
      const y1=this.start.y;
      const x2=this.end.x;
      const y2=this.end.y;
      ctx.strokeStyle=`hsla(200,100%,50%,0.15)`;
      ctx.lineWidth=0.8;
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();
      const px=x1+((x2-x1)*this.pulsePos);
      const py=y1+((y2-y1)*this.pulsePos);
      ctx.fillStyle=`hsla(200,100%,${60+Math.sin(time*0.05)*20}%,0.8)`;
      ctx.beginPath();
      ctx.arc(px,py,3+Math.sin(time*0.05)*2,0,Math.PI*2);
      ctx.fill();
    }
  }
  
  // PARTICLE - Floating digital specks
  class Particle{
    constructor(){
      this.x=Math.random()*canvas.width;
      this.y=Math.random()*canvas.height;
      this.vx=(Math.random()-0.5)*0.5;
      this.vy=(Math.random()-0.5)*0.5;
      this.size=Math.random()*1.5+0.5;
      this.opacity=Math.random()*0.5+0.2;
    }
    update(){
      this.x+=this.vx;
      this.y+=this.vy;
      if(this.x<0||this.x>canvas.width)this.vx*=-1;
      if(this.y<0||this.y>canvas.height)this.vy*=-1;
      this.opacity+=Math.sin(time*0.02)*0.02;
      if(this.opacity>0.7)this.opacity=0.7;
      if(this.opacity<0.1)this.opacity=0.1;
    }
    draw(){
      ctx.globalAlpha=this.opacity;
      ctx.fillStyle=`hsla(200,100%,70%,1)`;
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
      ctx.fill();
    }
  }
  
  // Initialize all elements
  function init(){
    for(let i=0;i<12;i++)wedges.push(new Wedge());
    for(let i=0;i<wedges.length-1;i++){
      networkLines.push(new NetworkLine(wedges[i],wedges[i+1]));
    }
    for(let i=0;i<40;i++)particles.push(new Particle());
  }
  
  // Main animation loop
  function animate(){
    // Dark obsidian void background
    const bgGradient=ctx.createRadialGradient(canvas.width/2,canvas.height/2,0,canvas.width/2,canvas.height/2,Math.max(canvas.width,canvas.height));
    bgGradient.addColorStop(0,'#0a0e27');
    bgGradient.addColorStop(0.5,'#05080f');
    bgGradient.addColorStop(1,'#000814');
    ctx.fillStyle=bgGradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    // Subtle animated background texture
    ctx.globalAlpha=0.03+Math.sin(time*0.001)*0.02;
    for(let i=0;i<canvas.width;i+=100){
      for(let j=0;j<canvas.height;j+=100){
        ctx.strokeStyle=`hsla(200,100%,50%,0.3)`;
        ctx.lineWidth=0.5;
        ctx.strokeRect(i+Math.sin(time*0.001+i)*5,j+Math.cos(time*0.001+j)*5,95,95);
      }
    }
    ctx.globalAlpha=1;
    
    // Update and draw network lines
    for(const line of networkLines){
      line.update();
      line.draw();
    }
    
    // Update and draw wedges
    for(const wedge of wedges){
      wedge.update();
      wedge.draw();
    }
    
    // Update and draw particles
    for(const particle of particles){
      particle.update();
      particle.draw();
    }
    
    // Cinematic light rays effect
    ctx.globalAlpha=0.08;
    for(let i=0;i<3;i++){
      const rayX=canvas.width*(0.3+i*0.2);
      const rayGradient=ctx.createLinearGradient(rayX,0,rayX+100,canvas.height);
      rayGradient.addColorStop(0,`hsla(260,100%,50%,0)`);
      rayGradient.addColorStop(0.5,`hsla(260,100%,50%,1)`);
      rayGradient.addColorStop(1,`hsla(260,100%,50%,0)`);
      ctx.fillStyle=rayGradient;
      ctx.fillRect(rayX+Math.sin(time*0.002+i)*20,0,150,canvas.height);
    }
    ctx.globalAlpha=1;
    
    time++;
    requestAnimationFrame(animate);
  }
  
  init();
  animate();
  
  // Resize handler
  window.addEventListener('resize',()=>{
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
  });
}

// Initialize the background
initGlassyWedgesBackground();

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
    navbar.style.background='rgba(0,8,20,0.85)';
    navbar.style.backdropFilter='blur(15px)';
    navbar.style.boxShadow='0 4px 30px rgba(0,0,0,0.6)';
  }else{
    navbar.style.background='rgba(15,23,42,0.8)';
    navbar.style.backdropFilter='blur(10px)';
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

console.log('🎨 Advanced 3D Glassy Wedges Background Engine Loaded!');
console.log('✨ Featuring: Glassmorphism + Fiber-optic Network + 8K Ready');
