/* -------------------------------------------------------------
   script.js — now without admin login / dashboard
   ------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. Theme toggle ──────────────────────────────────────── */
    const toggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlEl.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    toggleBtn.addEventListener('click', () => {
        const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });

    function updateThemeIcon(t) {
        toggleBtn.innerHTML = t === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    /* ── 2. Footer year ───────────────────────────────────────── */
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    /* ── 3. Flip cards ────────────────────────────────────────── */
    document.querySelectorAll('.card-inner').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('is-flipped'));
    });

    /* ── helpers ──────────────────────────────────────────────── */
    function openModal(id)  { document.getElementById(id)?.classList.remove('hidden'); }
    function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

    function escHtml(str) {
        return String(str)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* ── 4. Load saved About content ─────────────────────────── */
    function loadAboutContent() {
        const p1El = document.getElementById('about-p1');
        const p2El = document.getElementById('about-p2');
        const savedP1 = localStorage.getItem('about_p1');
        const savedP2 = localStorage.getItem('about_p2');
        if (savedP1 && p1El) p1El.textContent = savedP1;
        if (savedP2 && p2El) p2El.textContent = savedP2;
    }
    loadAboutContent();

    /* ── 5. Contact form flow (basic validation) ────────────── */
    const ctaBtn  = document.getElementById('cta-btn');
    const ctaForm = document.getElementById('cta-form');
    let pendingName = '';
    let pendingEmail = '';
    let pendingMsg = '';

    ctaBtn?.addEventListener('click', () => openModal('cta-modal'));
    document.getElementById('close-modal')?.addEventListener('click', () => closeModal('cta-modal'));
    document.getElementById('cta-modal')?.addEventListener('click', e => {
        if (e.target.id === 'cta-modal') closeModal('cta-modal');
    });

    ctaForm?.addEventListener('submit', e => {
        e.preventDefault();
        const name  = document.getElementById('cta-name').value.trim();
        const email = document.getElementById('cta-email').value.trim();
        const msg   = document.getElementById('cta-message').value.trim();

        if (!name || !email || !msg) {
            alert('Please fill out all fields before sending.');
            return;
        }

        pendingName  = name;
        pendingEmail = email;
        pendingMsg   = msg;

        closeModal('cta-modal');
        openModal('confirm-modal');
    });

    document.getElementById('confirm-no')?.addEventListener('click', () => {
        closeModal('confirm-modal');
        openModal('cta-modal');
    });

    document.getElementById('confirm-yes')?.addEventListener('click', () => {
        saveMessage(pendingName, pendingEmail, pendingMsg);
        ctaForm.reset();
        closeModal('confirm-modal');
        openModal('success-modal');
    });

    document.getElementById('success-close')?.addEventListener('click', () => closeModal('success-modal'));
    document.getElementById('success-modal')?.addEventListener('click', e => {
        if (e.target.id === 'success-modal') closeModal('success-modal');
    });

    /* ── 6. Message storage (kept for possible future use) ──── */
    function getMessages() {
        try { return JSON.parse(localStorage.getItem('portfolio_messages') || '[]'); }
        catch { return []; }
    }

    function saveMessage(name, email, msg) {
        const msgs = getMessages();
        msgs.unshift({
            name,
            email,
            msg,
            time: new Date().toLocaleString('en-PH', {
                dateStyle: 'medium',
                timeStyle: 'short'
            })
        });
        localStorage.setItem('portfolio_messages', JSON.stringify(msgs));
    }

    /* ── 7. Canvas hero background ──────────────────────────── */
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;                // safety guard
    const ctx = canvas.getContext('2d');

    function getPalette() {
        const dark = document.documentElement.getAttribute('data-theme') !== 'light';
        return dark
            ? { bg: '#08090c', a: '#7c6af7', b: '#f06a9a', c: '#3de8c0' }
            : { bg: '#f4f5fa', a: '#5b48e8', b: '#e8336e', c: '#0fb88e' };
    }

    let W, H;
    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Orb {
        constructor() { this.reset(true); }
        reset(init = false) {
            this.x  = Math.random() * W;
            this.y  = init ? Math.random() * H : H + 200;
            this.r  = 150 + Math.random() * 260;
            this.vx = (Math.random() - .5) * .35;
            this.vy = -(0.15 + Math.random() * .25);
            this.a  = .06 + Math.random() * .1;
            const p = getPalette();
            this.color = [p.a, p.b, p.c][Math.floor(Math.random() * 3)];
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.y + this.r < -100) this.reset();
        }
        draw() {
            const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
            g.addColorStop(0, hexRgba(this.color, this.a));
            g.addColorStop(1, hexRgba(this.color, 0));
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
        }
    }

    const orbs = Array.from({ length: 9 }, () => new Orb());
    const dots = Array.from({ length: 60 }, () => ({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        r: .5 + Math.random() * 1.2,
        vx: (Math.random() - .5) * .2,
        vy: (Math.random() - .5) * .2,
        a: .2 + Math.random() * .5
    }));

    function loop() {
        const p = getPalette();
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = p.bg;
        ctx.fillRect(0, 0, W, H);
        orbs.forEach(o => { o.update(); o.draw(); });
        dots.forEach(d => {
            d.x = (d.x + d.vx + W) % W;
            d.y = (d.y + d.vy + H) % H;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = hexRgba(p.a, d.a);
            ctx.fill();
        });
        ctx.strokeStyle = hexRgba(p.a, .04);
        ctx.lineWidth = 1;
        const gX = W / 10, gY = H / 8;
        for (let x = 0; x < W; x += gX) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
        for (let y = 0; y < H; y += gY) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
        requestAnimationFrame(loop);
    }
    loop();

    function hexRgba(hex, a) {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${a})`;
    }
});
