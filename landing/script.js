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

    /* ---------- Waitlist forms (client-side only, no backend yet) ---------- */
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const setupNotifyForm = (formId, noteId) => {
        const form = document.getElementById(formId);
        const note = document.getElementById(noteId);
        if (!form || !note) return;

        const input = form.querySelector('input[type="email"]');
        const button = form.querySelector('button');
        const originalNote = note.innerHTML;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = input.value.trim();

            if (!isValidEmail(email)) {
                input.classList.add('is-invalid');
                input.focus();
                return;
            }

            input.classList.remove('is-invalid');
            button.disabled = true;
            button.textContent = 'Added';

            note.textContent = "You're on the list — we'll email you at launch.";
            note.classList.add('is-success');
            form.reset();

            // Placeholder: no backend yet. Replace with a real submit
            document.addEventListener('DOMContentLoaded', () => {
                const form = document.getElementById('notifyFormHero');

                if (form) {
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();

                        const button = form.querySelector('button[type="submit"]');
                        const input = form.querySelector('input[type="email"]');
                        const originalBtnText = button.textContent;

                        // Показываем состояние загрузки
                        button.disabled = true;
                        button.textContent = 'Sending...';

                        try {
                            const response = await fetch(form.action, {
                                method: 'POST',
                                body: new FormData(form),
                                headers: {
                                    'Accept': 'application/json'
                                }
                            });

                            if (response.ok) {
                                // Успешная отправка
                                form.innerHTML = `
            <div class="success-message">
              <span>✓</span> You're on the list! We'll notify you when FxChange launches.
            </div>
          `;
                            } else {
                                throw new Error('Form submission failed');
                            }
                        } catch (error) {
                            // Ошибка отправки
                            button.disabled = false;
                            button.textContent = originalBtnText;
                            alert('Oops! There was a problem submitting your email. Please try again.');
                        }
                    });
                }
            });
            // (fetch to your waitlist endpoint) once FxChange has one.
            setTimeout(() => {
                button.disabled = false;
                button.textContent = form === document.getElementById('notifyFormFooter')
                    ? 'Join Waitlist'
                    : 'Notify Me';
            }, 4000);
        });

        input.addEventListener('input', () => input.classList.remove('is-invalid'));
    };

    setupNotifyForm('notifyFormHero', 'formNoteHero');
    setupNotifyForm('notifyFormFooter', 'formNoteFooter');
});