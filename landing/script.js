document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Sticky header state ---------- */
    const header = document.getElementById('siteHeader');
    const onScroll = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---------- Mobile navigation ---------- */
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');

    const closeMobileNav = () => {
        hamburgerBtn.classList.remove('is-open');
        mobileNav.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    };

    hamburgerBtn.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('is-open');
        hamburgerBtn.classList.toggle('is-open', isOpen);
        hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMobileNav);
    });

    /* ---------- Smooth scroll for in-page anchors ---------- */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId.length < 2) return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    });

    /* ---------- Animate rate bars into view ---------- */
    const rateBars = document.querySelectorAll('.rate-bar-fill');

    if ('IntersectionObserver' in window && rateBars.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.4 }
        );
        rateBars.forEach((bar) => observer.observe(bar));
    } else {
        rateBars.forEach((bar) => bar.classList.add('is-visible'));
    }

    /* ---------- Subtle hover lift on best-rate card ---------- */
    const bestCard = document.querySelector('.provider-card.is-best');
    if (bestCard && !prefersReducedMotion) {
        bestCard.addEventListener('mouseenter', () => {
            bestCard.style.boxShadow = '0 12px 30px -14px rgba(0, 230, 118, 0.45)';
        });
        bestCard.addEventListener('mouseleave', () => {
            bestCard.style.boxShadow = '';
        });
    }

    /* ---------- Waitlist form — submits to Formspree ---------- */
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const form = document.getElementById('notifyFormHero');
    const note = document.getElementById('formNoteHero');

    if (form) {
        const input = form.querySelector('input[type="email"]');
        const button = form.querySelector('button[type="submit"]');
        const originalButtonText = button.textContent;
        const originalNoteHTML = note ? note.innerHTML : '';

        input.addEventListener('input', () => input.classList.remove('is-invalid'));

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = input.value.trim();

            if (!isValidEmail(email)) {
                input.classList.add('is-invalid');
                input.focus();
                return;
            }

            input.classList.remove('is-invalid');
            button.disabled = true;
            button.textContent = 'Sending...';
            if (note) {
                note.classList.remove('is-error');
                note.textContent = '';
            }

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (!response.ok) throw new Error('Form submission failed');

                form.innerHTML = `
                    <div class="success-message">
                        <span>✓</span> You're on the list — we'll email you at launch.
                    </div>
                `;
                if (note) {
                    note.innerHTML = 'Or <a href="https://t.me/fxchange_updates" target="_blank" rel="noopener">follow updates on Telegram</a>.';
                }
            } catch (error) {
                button.disabled = false;
                button.textContent = originalButtonText;
                if (note) {
                    note.textContent = 'Something went wrong — please try again.';
                    note.classList.add('is-error');
                } else {
                    alert('Something went wrong — please try again.');
                }
            }
        });
    }
});
