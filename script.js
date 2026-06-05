/* -------------------------------------------------------------
   script.js
   1. Theme toggle
   2. Footer year
   3. Flip cards
   4. Contact modal flow: form → confirm → success
   5. Messages stored in localStorage
   6. Admin login / dashboard / inbox
   7. Canvas hero background
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

    /* ── 4 & 5. Contact form flow ─────────────────────────────── */
    const ctaBtn      = document.getElementById('cta-btn');
    const ctaForm     = document.getElementById('cta-form');
    let pendingName   = '';
    let pendingEmail  = '';
    let pendingMsg    = '';

    ctaBtn?.addEventListener('click', () => openModal('cta-modal'));
    document.getElementById('close-modal')?.addEventListener('click', () => closeModal('cta-modal'));
    document.getElementById('cta-modal')?.addEventListener('click', e => {
        if (e.target.id === 'cta-modal') closeModal('cta-modal');
    });

    ctaForm?.addEventListener('submit', e => {
        e.preventDefault();
        pendingName  = document.getElementById('cta-name').value.trim();
        pendingEmail = document.getElementById('cta-email').value.trim();
        pendingMsg   = document.getElementById('cta-message').value.trim();
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
        updateAdminBadge();
    });

    document.getElementById('success-close')?.addEventListener('click', () => closeModal('success-modal'));
    document.getElementById('success-modal')?.addEventListener('click', e => {
        if (e.target.id === 'success-modal') closeModal('success-modal');
    });

    /* ── message storage ──────────────────────────────────────── */
    function getMessages() {
        try { return JSON.parse(localStorage.getItem('portfolio_messages') || '[]'); }
        catch { return []; }
    }

    function saveMessage(name, email, msg) {
        const msgs = getMessages();
        msgs.unshift({
            name, email, msg,
            time: new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
        });
        localStorage.setItem('portfolio_messages', JSON.stringify(msgs));
    }

    function updateAdminBadge() {
        const badge = document.getElementById('admin-badge');
        if (!badge) return;
        const count = getMessages().length;
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }

    updateAdminBadge();

    /* ── 6. Admin login ───────────────────────────────────────── */
    const ADMIN_USER = 'brix2016';
    const ADMIN_PASS = 'Hesoyam 123';
    let adminLoggedIn = false;

    // Inject badge span into admin button
    const adminNavBtn = document.getElementById('admin-login-btn');
    if (adminNavBtn) {
        const badge = document.createElement('span');
        badge.id = 'admin-badge';
        adminNavBtn.appendChild(badge);
        updateAdminBadge();
    }

    adminNavBtn?.addEventListener('click', () => {
        if (adminLoggedIn) {
            renderMessages();
            openModal('admin-dashboard');
        } else {
            openModal('admin-modal');
        }
    });

    document.getElementById('close-admin-modal')?.addEventListener('click', () => closeModal('admin-modal'));
    document.getElementById('admin-modal')?.addEventListener('click', e => {
        if (e.target.id === 'admin-modal') closeModal('admin-modal');
    });

    document.getElementById('admin-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const u = document.getElementById('admin-user').value;
        const p = document.getElementById('admin-pass').value;
        const errEl = document.getElementById('admin-error');

        if (u === ADMIN_USER && p === ADMIN_PASS) {
            adminLoggedIn = true;
            errEl.classList.add('hidden');
            document.getElementById('admin-form').reset();
            closeModal('admin-modal');
            renderMessages();
            openModal('admin-dashboard');
        } else {
            errEl.classList.remove('hidden');
        }
    });

    document.getElementById('close-dashboard')?.addEventListener('click', () => closeModal('admin-dashboard'));
    document.getElementById('admin-dashboard')?.addEventListener('click', e => {
        if (e.target.id === 'admin-dashboard') closeModal('admin-dashboard');
    });

    document.getElementById('admin-logout')?.addEventListener('click', () => {
        adminLoggedIn = false;
        closeModal('admin-dashboard');
    });

    function renderMessages() {
        const list = document.getElementById('messages-list');
        if (!list) return;
        const msgs = getMessages();
        if (msgs.length === 0) {
            list.innerHTML = '<p class="no-messages">No messages yet.</p>';
            return;
        }
        list.innerHTML = msgs.map(m => `
            <div class="message-item">
                <div class="message-item__meta">
                    <div>
                        <div class="message-item__name">${escHtml(m.name)}</div>
                        <div class="message-item__email">${escHtml(m.email)}</div>
                    </div>
                    <div class="message-item__time">${escHtml(m.time)}</div>
                </div>
                <div class="message-item__body">${escHtml(m.msg)}</div>
            </div>
        `).join('');
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* ── 7. Canvas hero background ───────────────────────────── */
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
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
            this.x += this.vx; this.y += this.vy;
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
        x: Math.random() * 2000, y: Math.random() * 2000,
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
