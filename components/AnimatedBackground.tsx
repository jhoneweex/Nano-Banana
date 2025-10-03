import React, { useRef, useEffect } from 'react';

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      canvasWidth: number;
      canvasHeight: number;
      ctx: CanvasRenderingContext2D;
      color: string;

      constructor(canvasWidth: number, canvasHeight: number, ctx: CanvasRenderingContext2D) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.ctx = ctx;
        this.x = Math.random() * this.canvasWidth;
        this.y = Math.random() * this.canvasHeight;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() * 0.4 - 0.2);
        this.speedY = (Math.random() * 0.4 - 0.2);
        this.color = `rgba(0, 191, 255, ${Math.random() * 0.5 + 0.3})`; // Deep sky blue with opacity
      }

      update() {
        if (this.x > this.canvasWidth || this.x < 0) this.speedX = -this.speedX;
        if (this.y > this.canvasHeight || this.y < 0) this.speedY = -this.speedY;
        this.x += this.speedX;
        this.y += this.speedY;
      }

      draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 60;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height, ctx));
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const connect = () => {
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let distance = Math.sqrt(
            Math.pow(particles[a].x - particles[b].x, 2) +
            Math.pow(particles[a].y - particles[b].y, 2)
          );
          if (distance < (canvas.width / 10)) {
            opacityValue = 1 - (distance / (canvas.width/10));
            const grad = ctx.createLinearGradient(particles[a].x, particles[a].y, particles[b].x, particles[b].y);
            grad.addColorStop(0, 'rgba(75, 0, 130, ' + opacityValue + ')'); // Indigo
            grad.addColorStop(1, 'rgba(0, 255, 255, ' + opacityValue + ')'); // Cyan/Neon Blue
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height));
      gradient.addColorStop(0, 'rgba(25, 0, 70, 0.2)'); // Center color - deep blue/purple
      gradient.addColorStop(1, 'rgba(10, 4, 28, 1)'); // Edge color - near black purple
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />;
};

export default AnimatedBackground;