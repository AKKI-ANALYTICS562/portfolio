const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

reveals.forEach((reveal) => obs.observe(reveal));

const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');

let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;
let mouse = { x: W / 2, y: H / 2 };

window.addEventListener('resize', () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
});

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

const STAR_COUNT = 180;
const stars = [];

class Star {
  constructor() {
    this.reset(true);
  }

  reset(init = false) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : -5;
    this.size = Math.random() * 1.6 + 0.3;
    this.baseX = this.x;
    this.baseY = this.y;
    this.speed = Math.random() * 0.25 + 0.05;
    this.opacity = Math.random() * 0.7 + 0.2;
    this.twinkleSpeed = Math.random() * 0.02 + 0.005;
    this.twinkleOffset = Math.random() * Math.PI * 2;
    this.color = this.pickColor();
    this.driftX = (Math.random() - 0.5) * 0.15;
  }

  pickColor() {
    const palette = [
      'rgba(126,244,160,',
      'rgba(255,255,255,',
      'rgba(79,195,247,',
      'rgba(255,213,79,',
      'rgba(179,157,219,',
    ];
    const weights = [0.25, 0.45, 0.15, 0.08, 0.07];
    let r = Math.random();
    let cum = 0;
    for (let i = 0; i < palette.length; i += 1) {
      cum += weights[i];
      if (r < cum) {
        return palette[i];
      }
    }
    return palette[1];
  }

  update(t) {
    this.y += this.speed;
    this.x += this.driftX;

    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const repulseRadius = 120;

    if (dist < repulseRadius && dist > 0) {
      const force = (repulseRadius - dist) / repulseRadius;
      this.x += (dx / dist) * force * 2.5;
      this.y += (dy / dist) * force * 2.5;
    }

    const twinkle = Math.sin(t * this.twinkleSpeed * 60 + this.twinkleOffset);
    this.currentOpacity = this.opacity * (0.6 + 0.4 * twinkle);

    if (this.y > H + 10 || this.x < -20 || this.x > W + 20) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `${this.color}${this.currentOpacity})`;
    ctx.fill();

    if (this.size > 1.2) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.5);
      g.addColorStop(0, `${this.color}${this.currentOpacity * 0.3})`);
      g.addColorStop(1, `${this.color}0)`);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }
}

const sparks = [];

class Spark {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2.5;
    this.vy = (Math.random() - 0.5) * 2.5 - 1;
    this.life = 1;
    this.decay = Math.random() * 0.04 + 0.025;
    this.size = Math.random() * 2 + 0.5;
    this.color = ['rgba(126,244,160,', 'rgba(255,255,255,', 'rgba(79,195,247,'][Math.floor(Math.random() * 3)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.04;
    this.life -= this.decay;
  }

  draw() {
    const r = Math.max(0, this.size * this.life);
    if (r <= 0) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `${this.color}${this.life * 0.9})`;
    ctx.fill();
  }
}

window.addEventListener('mousemove', (e) => {
  if (Math.random() < 0.4) {
    sparks.push(new Spark(e.clientX, e.clientY));
  }
});

for (let i = 0; i < STAR_COUNT; i += 1) {
  stars.push(new Star());
}

function animate(ts) {
  const t = ts / 1000;
  ctx.clearRect(0, 0, W, H);

  stars.forEach((star) => {
    star.update(t);
    star.draw();
  });

  for (let i = sparks.length - 1; i >= 0; i -= 1) {
    sparks[i].update();
    sparks[i].draw();
    if (sparks[i].life <= 0) {
      sparks.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
