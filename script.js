/* -------------------------------------------------------------
   script.js
   1️⃣  Dark/light theme toggle
   2️⃣  Footer year
   3️⃣  Flip-card interactions
   4️⃣  Modal (Get in Touch)
   5️⃣  Animated canvas hero background
   ------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. Theme toggle ───────────────────────────────────────── */
    const toggleBtn = document.getElementById('theme-toggle');
    const htmlEl    = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlEl.setAttribute('data-theme', savedTheme);
    updateToggleIcon(savedTheme);

    toggleBtn.addEventListener('click', () => {
        const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateToggleIcon(next);
    });

    function updateToggleIcon(theme) {
        toggleBtn.innerHTML = theme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }

    /* ── 2. Footer year ─────────────────────────────────────────── */
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    /* ── 3. Flip cards ──────────────────────────────────────────── */
    document.querySelectorAll('.card-inner').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('is-flipped'));
    });

    /* ── 4. Modal ───────────────────────────────────────────────── */
    const ctaBtn     = document.getElementById('cta-btn');
    const modal      = document.getElementById('cta-modal');
    const closeModal = document.getElementById('close-modal');
    const ctaForm    = document.getElementById('cta-form');

    ctaBtn?.addEventListener('click', () => modal?.classList.remove('hidden'));
    closeModal?.addEventListener('click', () => modal?.classList.add('hidden'));
    modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

    ctaForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to send this message?')) return;

        const formData = new FormData(ctaForm);
        try {
            const res = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
                method: 'POST',
                body: formData,
                headers: { Accept: 'application/json' }
            });
            if (res.ok) {
                alert('Thank you for being interested in me.');
                ctaForm.reset();
                modal.classList.add('hidden');
            } else {
                alert('Oops! Something went wrong. Please try again later.');
            }
        } catch {
            alert('Network error. Please try again later.');
        }
    });

    /* ── 5. Canvas hero background ──────────────────────────────── */
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Colour palette (refreshed on theme change)
    function getPalette() {
        const dark = document.documentElement.getAttribute('data-theme') !== 'light';
        return dark
            ? { bg: '#08090c', a: '#7c6af7', b: '#f06a9a', c: '#3de8c0' }
            : { bg: '#f4f5fa', a: '#5b48e8', b: '#e8336e', c: '#0fb88e' };
    }

    let W, H, orbs = [];

    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* Floating gradient orbs */
    class Orb {
        constructor() { this.reset(true); }
        reset(init = false) {
            this.x  = Math.random() * W;
            this.y  = init ? Math.random() * H : H + 200;
            this.r  = 150 + Math.random() * 250;
            this.vx = (Math.random() - .5) * .35;
            this.vy = -(0.15 + Math.random() * .25);
            this.a  = .06 + Math.random() * .1;
            const pal = getPalette();
            const cols = [pal.a, pal.b, pal.c];
            this.color = cols[Math.floor(Math.random() * cols.length)];
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.y + this.r < -100) this.reset();
        }
        draw() {
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
            grad.addColorStop(0, hexToRgba(this.color, this.a));
            grad.addColorStop(1, hexToRgba(this.color, 0));
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    for (let i = 0; i < 9; i++) orbs.push(new Orb());

    /* Particle dots */
    const DOTS = 60;
    const dots = Array.from({ length: DOTS }, () => ({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        r: .5 + Math.random() * 1.2,
        vx: (Math.random() - .5) * .2,
        vy: (Math.random() - .5) * .2,
        a: .2 + Math.random() * .5
    }));

    function loop() {
        const pal = getPalette();
        ctx.clearRect(0, 0, W, H);

        // Background fill
        ctx.fillStyle = pal.bg;
        ctx.fillRect(0, 0, W, H);

        // Orbs
        orbs.forEach(o => { o.update(); o.draw(); });

        // Dots
        dots.forEach(d => {
            d.x = (d.x + d.vx + W) % W;
            d.y = (d.y + d.vy + H) % H;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(pal.a, d.a);
            ctx.fill();
        });

        // Grid lines (subtle)
        ctx.strokeStyle = hexToRgba(pal.a, .04);
        ctx.lineWidth = 1;
        const gapX = W / 10, gapY = H / 8;
        for (let x = 0; x < W; x += gapX) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += gapY) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        requestAnimationFrame(loop);
    }
    loop();

    /* Helper */
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${alpha})`;
    }
});
