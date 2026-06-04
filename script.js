/* script.js ------------------------------------------------------------ */
/* 1️⃣ Theme toggle (light ↔ dark) */
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;

    // Load saved theme (if any)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlEl.setAttribute('data-theme', savedTheme);
        // Change icon accordingly
        toggleBtn.innerHTML = savedTheme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }

    // Click handler
    toggleBtn.addEventListener('click', () => {
        const current = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', current);
        localStorage.setItem('theme', current);
        toggleBtn.innerHTML = current === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    });

    /* 2️⃣ Insert current year into footer */
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

