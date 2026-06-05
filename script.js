/* -------------------------------------------------------------
   script.js — fixed admin login + editable about sections
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

    /* ── 5. Load saved Work Experience ───────────────────────── */
    const DEFAULT_EXP = [
        {
            icon: 'fas fa-briefcase',
            title: 'HR Associate',
            company: 'Sample Company',
            date: '2022 – Present',
            desc: 'Managed employee records, onboarding processes, and HR documentation.'
        }
    ];

    function getExperiences() {
        try {
            const saved = localStorage.getItem('portfolio_exp');
            return saved ? JSON.parse(saved) : DEFAULT_EXP;
        } catch { return DEFAULT_EXP; }
    }

    function renderExperienceList() {
        const list = document.getElementById('experience-list');
        if (!list) return;
        const exps = getExperiences();
        if (exps.length === 0) {
            list.innerHTML = '<p class="exp-empty">No experience entries yet.</p>';
            return;
        }
        list.innerHTML = exps.map((e, i) => `
            <div class="exp-item" style="animation-delay:${i * 0.1}s">
                <div class="exp-dot"><i class="${escHtml(e.icon || 'fas fa-briefcase')}"></i></div>
                <div class="exp-body">
                    <div class="exp-header">
                        <span class="exp-title">${escHtml(e.title)}</span>
                        <span class="exp-date">${escHtml(e.date)}</span>
                    </div>
                    <div class="exp-company">${escHtml(e.company)}</div>
                    <p class="exp-desc">${escHtml(e.desc)}</p>
                </div>
            </div>
        `).join('');
    }
    renderExperienceList();

    /* ── 6. Contact form flow ─────────────────────────────────── */
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

    /* ── 7. Message storage ───────────────────────────────────── */
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

    /* ── 8. Admin login ───────────────────────────────────────── */
    const ADMIN_USER = 'brix2016';
    const ADMIN_PASS = 'Hesoyam 123';
    let adminLoggedIn = true;

    const adminNavBtn = document.getElementById('admin-login-btn');

    adminNavBtn?.addEventListener('click', () => {
        if (adminLoggedIn) {
            openDashboard();
        } else {
            // Clear fields and error on open
            document.getElementById('admin-user').value = '';
            document.getElementById('admin-pass').value = '';
            document.getElementById('admin-error').classList.add('hidden');
            openModal('admin-modal');
        }
    });

    document.getElementById('close-admin-modal')?.addEventListener('click', () => closeModal('admin-modal'));
    document.getElementById('admin-modal')?.addEventListener('click', e => {
        if (e.target.id === 'admin-modal') closeModal('admin-modal');
    });

    /* ── FIX: use click on submit button, not form submit ── */
    document.getElementById('admin-submit')?.addEventListener('click', () => {
        const u = document.getElementById('admin-user').value.trim();
        const p = document.getElementById('admin-pass').value;
        const errEl = document.getElementById('admin-error');

        if (u === ADMIN_USER && p === ADMIN_PASS) {
            adminLoggedIn = true;
            errEl.classList.add('hidden');
            closeModal('admin-modal');
            openDashboard();
        } else {
            errEl.classList.remove('hidden');
        }
    });

    // Also allow Enter key in password field
    document.getElementById('admin-pass')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('admin-submit')?.click();
    });

    document.getElementById('close-dashboard')?.addEventListener('click', () => closeModal('admin-dashboard'));
    document.getElementById('admin-dashboard')?.addEventListener('click', e => {
        if (e.target.id === 'admin-dashboard') closeModal('admin-dashboard');
    });

    document.getElementById('admin-logout')?.addEventListener('click', () => {
        adminLoggedIn = false;
        closeModal('admin-dashboard');
    });

    function openDashboard() {
        renderMessages();
        populateAboutEditor();
        renderExpEditor();
        // activate inbox tab by default
        switchTab('inbox');
        openModal('admin-dashboard');
    }

    /* ── 9. Dashboard tabs ────────────────────────────────────── */
    document.querySelectorAll('.dash-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    function switchTab(name) {
        document.querySelectorAll('.dash-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
        document.querySelectorAll('.dash-panel').forEach(p => p.classList.add('hidden'));
        document.getElementById(`tab-${name}`)?.classList.remove('hidden');
    }

    /* ── 10. Render inbox ─────────────────────────────────────── */
    function renderMessages() {
        const list = document.getElementById('messages-list');
        const countEl = document.getElementById('inbox-count');
        if (!list) return;
        const msgs = getMessages();
        if (countEl) countEl.textContent = msgs.length || '';
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

    /* ── 11. Edit About tab ───────────────────────────────────── */
    function populateAboutEditor() {
        const p1 = document.getElementById('edit-about-p1');
        const p2 = document.getElementById('edit-about-p2');
        if (p1) p1.value = localStorage.getItem('about_p1') || document.getElementById('about-p1')?.textContent || '';
        if (p2) p2.value = localStorage.getItem('about_p2') || document.getElementById('about-p2')?.textContent || '';
    }

    document.getElementById('save-about')?.addEventListener('click', () => {
        const p1Val = document.getElementById('edit-about-p1').value.trim();
        const p2Val = document.getElementById('edit-about-p2').value.trim();
        localStorage.setItem('about_p1', p1Val);
        localStorage.setItem('about_p2', p2Val);
        const p1El = document.getElementById('about-p1');
        const p2El = document.getElementById('about-p2');
        if (p1El) p1El.textContent = p1Val;
        if (p2El) p2El.textContent = p2Val;
        const saved = document.getElementById('about-saved');
        saved.classList.remove('hidden');
        setTimeout(() => saved.classList.add('hidden'), 2500);
    });

    /* ── 12. Edit Experience tab ──────────────────────────────── */
    function renderExpEditor() {
        const container = document.getElementById('exp-editor');
        if (!container) return;
        const exps = getExperiences();
        container.innerHTML = exps.map((e, i) => `
            <div class="exp-editor-row" data-index="${i}">
                <button class="exp-row-del" data-index="${i}"><i class="fas fa-trash"></i> Remove</button>
                <div class="exp-row-grid">
                    <input type="text" placeholder="Job Title" class="exp-field-title" value="${escHtml(e.title)}">
                    <input type="text" placeholder="Company" class="exp-field-company" value="${escHtml(e.company)}">
                </div>
                <input type="text" placeholder="Date (e.g. 2022 – Present)" class="exp-field-date" value="${escHtml(e.date)}">
                <textarea rows="2" placeholder="Description" class="exp-field-desc">${escHtml(e.desc)}</textarea>
            </div>
        `).join('');

        container.querySelectorAll('.exp-row-del').forEach(btn => {
            btn.addEventListener('click', () => {
                const exps = getExperiences();
                exps.splice(parseInt(btn.dataset.index), 1);
                localStorage.setItem('portfolio_exp', JSON.stringify(exps));
                renderExpEditor();
                renderExperienceList();
            });
        });
    }

    document.getElementById('add-exp')?.addEventListener('click', () => {
        const exps = getExperiences();
        exps.push({ icon: 'fas fa-briefcase', title: '', company: '', date: '', desc: '' });
        localStorage.setItem('portfolio_exp', JSON.stringify(exps));
        renderExpEditor();
    });

    document.getElementById('save-exp')?.addEventListener('click', () => {
        const rows = document.querySelectorAll('.exp-editor-row');
        const updated = [];
        rows.forEach(row => {
            updated.push({
                icon: 'fas fa-briefcase',
                title:   row.querySelector('.exp-field-title')?.value.trim() || '',
                company: row.querySelector('.exp-field-company')?.value.trim() || '',
                date:    row.querySelector('.exp-field-date')?.value.trim() || '',
                desc:    row.querySelector('.exp-field-desc')?.value.trim() || ''
            });
        });
        localStorage.setItem('portfolio_exp', JSON.stringify(updated));
        renderExperienceList();
        const saved = document.getElementById('exp-saved');
        saved.classList.remove('hidden');
        setTimeout(() => saved.classList.add('hidden'), 2500);
    });

    /* ── 13. Canvas hero background ──────────────────────────── */
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
