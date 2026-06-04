/* -------------------------------------------------------------
   script.js – handles three things:
   1️⃣ Dark‑mode toggle (stores choice in localStorage)
   2️⃣ Inserts the current year into the footer
   3️⃣ Flip‑card click handling for the Skills section
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

    /* ---------- 3️⃣ Flip‑card handling ---------- */
    const flipCards = document.querySelectorAll('.card-inner');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('is-flipped');
        });
    });
});
