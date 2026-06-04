/* -------------------------------------------------------------
   script.js – handles three things:
   1️⃣ Dark‑mode toggle (stores choice in localStorage)
   2️⃣ Inserts the current year into the footer
   3️⃣ Flip‑card interaction for the Skills section
   4️⃣ Modal contact form triggered by “Get in Touch”
------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    /* ---------- 1️⃣ Dark‑mode toggle ---------- */
    const toggleBtn = document.getElementById('theme-toggle');
    const htmlEl    = document.documentElement;

    // Load saved theme (if any)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlEl.setAttribute('data-theme', savedTheme);
        toggleBtn.innerHTML = savedTheme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }

    toggleBtn.addEventListener('click', () => {
        const newTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        toggleBtn.innerHTML = newTheme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    });

    /* ---------- 2️⃣ Footer year ---------- */
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    /* ---------- 3️⃣ Flip‑card handling (Skills) ---------- */
    const flipCards = document.querySelectorAll('.card-inner');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('is-flipped');
        });
    });

    /* ---------- 4️⃣ Modal contact form (Get in Touch) ---------- */
    const ctaBtn      = document.getElementById('cta-btn');
    const modal       = document.getElementById('cta-modal');
    const closeModal  = document.getElementById('close-modal');
    const ctaForm     = document.getElementById('cta-form');

    if (ctaBtn && modal) {
        ctaBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    }
    if (closeModal) {
        closeModal.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (ctaForm) {
        ctaForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Confirmation dialog
            const sure = confirm('Are you sure you want to send this message?');
            if (!sure) return;

            // Send to Formspree (replace YOUR_FORMSPREE_ID with your actual ID)
            const formData = new FormData(ctaForm);
            try {
                const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    alert('Thank you for being interested in me.');
                    ctaForm.reset();
                    modal.classList.add('hidden');
                } else {
                    alert('Oops! Something went wrong. Please try again later.');
                }
            } catch (err) {
                alert('Network error. Please try again later.');
            }
        });
    }
});
