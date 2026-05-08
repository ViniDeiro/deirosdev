/* ==========================================
   DEIRO'S DEV — Scripts
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initMobileMenu();
    initScrollAnimations();
    initCountUp();
    initReviews();
    initFilters();
    initContactForm();
    initSmoothScroll();
    initConversionLayer();
    initCoreWebVitals();
    registerServiceWorker();
});

/* ── Navigation ── */
function initNav() {
    const nav = document.getElementById('nav');
    const links = document.querySelectorAll('.nav__link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);

        let current = '';
        sections.forEach(s => {
            if (window.scrollY >= s.offsetTop - 120) {
                current = s.getAttribute('id');
            }
        });
        links.forEach(l => {
            l.classList.toggle('active', l.dataset.section === current);
        });
    });
}

/* ── Mobile Menu ── */
function initMobileMenu() {
    const burger = document.getElementById('navBurger');
    const links = document.getElementById('navLinks');
    if (!burger || !links) return;

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        links.classList.toggle('active');
        const isOpen = links.classList.contains('active');
        burger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    links.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            links.classList.remove('active');
            burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !links.classList.contains('active')) return;
        burger.classList.remove('active');
        links.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        burger.focus();
    });
}

/* ── Scroll Animations ── */
function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-aos]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 80);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
}

/* ── Count Up ── */
function initCountUp() {
    const values = document.querySelectorAll('.metric__value');
    let done = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !done) {
                done = true;
                values.forEach(el => {
                    const target = parseInt(el.dataset.count);
                    animate(el, 0, target, 1800);
                });
            }
        });
    }, { threshold: 0.5 });

    const metrics = document.querySelector('.hero__metrics');
    if (metrics) observer.observe(metrics);

    function animate(el, from, to, duration) {
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(from + (to - from) * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }
}

/* ── Reviews Slider ── */
function initReviews() {
    const reviews = document.querySelectorAll('.review');
    const dots = document.querySelectorAll('.reviews__dot');
    const prev = document.getElementById('prevReview');
    const next = document.getElementById('nextReview');
    let idx = 0;
    let timer;

    function show(i) {
        reviews.forEach((r, j) => {
            r.classList.toggle('active', j === i);
            r.style.transform = j < i ? 'translateX(-40px)' : j > i ? 'translateX(40px)' : 'translateX(0)';
        });
        dots.forEach((d, j) => d.classList.toggle('active', j === i));
        idx = i;
    }

    function nextSlide() { show((idx + 1) % reviews.length); }
    function prevSlide() { show((idx - 1 + reviews.length) % reviews.length); }

    function resetTimer() {
        clearInterval(timer);
        timer = setInterval(nextSlide, 5000);
    }

    if (next) next.addEventListener('click', () => { nextSlide(); resetTimer(); });
    if (prev) prev.addEventListener('click', () => { prevSlide(); resetTimer(); });
    dots.forEach(d => d.addEventListener('click', () => { show(parseInt(d.dataset.idx)); resetTimer(); }));

    resetTimer();
}

/* ── Portfolio Filters ── */
function initFilters() {
    const btns = document.querySelectorAll('.work__filter');
    const cards = document.querySelectorAll('.project');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            cards.forEach((card, i) => {
                const cat = card.dataset.category;
                const show = filter === 'all' || cat === filter;

                if (show) {
                    card.style.display = '';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(16px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.35s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, i * 60);
                } else {
                    card.style.transition = 'all 0.25s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.97)';
                    setTimeout(() => { card.style.display = 'none'; }, 250);
                }
            });
        });
    });
}

/* ── Contact Form ── */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('formStatus');
    if (!form) return;

    // Phone mask
    const phone = document.getElementById('phone');
    if (phone) {
        phone.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '').slice(0, 11);
            if (v.length > 0) v = `(${v}`;
            if (v.length > 3) v = `${v.slice(0, 3)}) ${v.slice(3)}`;
            if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
            e.target.value = v;
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const original = btn.textContent;
        btn.textContent = 'enviando...';
        btn.disabled = true;
        btn.style.opacity = '0.6';
        if (status) status.textContent = 'Enviando mensagem.';

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !['true', true].includes(result.success)) {
                throw new Error(result.message || 'Falha ao enviar a mensagem.');
            }

            btn.textContent = '✔ mensagem enviada!';
            btn.style.opacity = '1';
            btn.style.background = '#255AE6';
            if (status) status.textContent = 'Mensagem enviada com sucesso.';
            form.reset();
            setTimeout(() => {
                btn.textContent = original;
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.background = '';
                if (status) status.textContent = '';
            }, 3000);
        } catch (error) {
            btn.textContent = 'Tentar novamente';
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.background = '';
            if (status) status.textContent = 'Nao foi possivel enviar agora. Tente novamente em instantes.';
            console.error(error);
        }
    });
}

/* ── Smooth Scroll ── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

/* ── Conversion Layer ── */
function initConversionLayer() {
    initSmartOffer();
}

function initSmartOffer() {
    const offer = document.getElementById('smartOffer');
    const close = document.getElementById('smartOfferClose');
    if (!offer || !close) return;

    const storageKey = 'deiros-smart-offer-dismissed';
    const dismissed = sessionStorage.getItem(storageKey) === 'true';
    if (dismissed) return;

    let shown = false;
    const showOffer = () => {
        if (shown) return;
        shown = true;
        offer.hidden = false;
    };

    const dismissOffer = () => {
        offer.hidden = true;
        sessionStorage.setItem(storageKey, 'true');
        document.removeEventListener('mouseout', handleExitIntent);
    };

    const delay = 18000;
    const timer = window.setTimeout(showOffer, delay);

    const handleExitIntent = (event) => {
        if (event.clientY > 12 || shown) return;
        window.clearTimeout(timer);
        showOffer();
    };

    close.addEventListener('click', dismissOffer);
    document.addEventListener('mouseout', handleExitIntent);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !offer.hidden) dismissOffer();
    });
}

/* ── Core Web Vitals ── */
function initCoreWebVitals() {
    if (!('PerformanceObserver' in window)) return;

    const metrics = {
        lcp: 0,
        cls: 0,
        fid: 0,
    };

    try {
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) metrics.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) metrics.cls += entry.value;
            }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        const fidObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                metrics.fid = entry.processingStart - entry.startTime;
            }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        window.addEventListener('load', () => {
            setTimeout(() => {
                window.__coreWebVitals = metrics;
                console.info('Core Web Vitals', {
                    LCP: `${Math.round(metrics.lcp)}ms`,
                    CLS: Number(metrics.cls.toFixed(3)),
                    FID: `${Math.round(metrics.fid)}ms`,
                });
            }, 0);
        });
    } catch (error) {
        console.warn('Core Web Vitals monitoring unavailable.', error);
    }
}

/* ── PWA ── */
function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' }).catch((error) => {
            console.warn('Service worker registration failed.', error);
        });
    });
}
