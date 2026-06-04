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
    initPricingModal();
    initPromoCountdown();
    initContactForm();
    initSmoothScroll();
    initSectionRoutes();
    initConversionLayer();
    initCoreWebVitals();
    registerServiceWorker();
});

const SECTION_ROUTES = {
    '/': 'home',
    '/servicos/': 'services',
    '/portfolio/': 'work',
    '/portifolio/': 'work',
    '/precos/': 'pricing',
    '/sobre/': 'about',
    '/contato/': 'contact',
};

function normalizePath(pathname) {
    if (!pathname || pathname === '/index.html') return '/';
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function scrollToSection(sectionId, behavior = 'smooth') {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior, block: 'start' });
}

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
    const cards = Array.from(document.querySelectorAll('.project'));
    const pagination = document.getElementById('workPagination');
    const perPage = 6;
    let currentFilter = 'all';
    let currentPage = 1;

    const getFilteredCards = () => cards.filter((card) => {
        const cat = card.dataset.category;
        return currentFilter === 'all' || cat === currentFilter;
    });

    const renderPagination = (totalPages) => {
        if (!pagination) return;
        pagination.innerHTML = '';
        pagination.hidden = totalPages <= 1;
        if (totalPages <= 1) return;

        const createButton = (label, page, options = {}) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'work__page';
            button.textContent = label;
            if (options.active) button.classList.add('active');
            if (options.disabled) button.disabled = true;
            button.addEventListener('click', () => {
                if (button.disabled || currentPage === page) return;
                currentPage = page;
                renderProjects();
                document.getElementById('work')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            return button;
        };

        pagination.appendChild(createButton('←', Math.max(1, currentPage - 1), { disabled: currentPage === 1 }));
        for (let page = 1; page <= totalPages; page += 1) {
            pagination.appendChild(createButton(String(page), page, { active: page === currentPage }));
        }
        pagination.appendChild(createButton('→', Math.min(totalPages, currentPage + 1), { disabled: currentPage === totalPages }));
    };

    const renderProjects = () => {
        const filteredCards = getFilteredCards();
        const totalPages = Math.max(1, Math.ceil(filteredCards.length / perPage));
        currentPage = Math.min(currentPage, totalPages);
        const start = (currentPage - 1) * perPage;
        const visibleCards = new Set(filteredCards.slice(start, start + perPage));

        cards.forEach((card, i) => {
            const show = visibleCards.has(card);

            if (show) {
                card.style.display = '';
                card.style.opacity = '0';
                card.style.transform = 'translateY(16px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.35s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, i * 35);
            } else {
                card.style.transition = 'all 0.2s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.97)';
                setTimeout(() => { card.style.display = 'none'; }, 200);
            }
        });

        renderPagination(totalPages);
    };

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            renderProjects();
        });
    });

    renderProjects();
}

/* ── Contact Form ── */
function initPricingModal() {
    const modal = document.getElementById('pricingModal');
    const openers = document.querySelectorAll('[data-pricing-modal]');
    const closers = document.querySelectorAll('[data-pricing-close]');
    const planTitle = document.getElementById('pricingPlanTitle');
    const planDesc = document.getElementById('pricingPlanDesc');
    if (!modal || !openers.length) return;

    let lastFocus = null;

    const openModal = (trigger) => {
        lastFocus = trigger;
        if (planTitle) planTitle.textContent = trigger.dataset.planTitle || 'Detalhes do pacote';
        if (planDesc) planDesc.textContent = trigger.dataset.planDesc || '';
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        const close = modal.querySelector('.pricing-modal__close');
        if (close) close.focus();
    };

    const closeModal = () => {
        modal.hidden = true;
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
    };

    openers.forEach((button) => {
        button.addEventListener('click', () => openModal(button));
    });

    closers.forEach((button) => {
        button.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
}

function initPromoCountdown() {
    const countdowns = document.querySelectorAll('[data-promo-countdown]');
    if (!countdowns.length) return;

    const storageKey = 'deiros-promo-june-2026-ends-at';
    const duration = 24 * 60 * 60 * 1000;
    const now = Date.now();
    let endsAt = Number(localStorage.getItem(storageKey));

    if (!Number.isFinite(endsAt) || endsAt <= now) {
        endsAt = now + duration;
        localStorage.setItem(storageKey, String(endsAt));
    }

    const format = (value) => String(value).padStart(2, '0');
    const render = () => {
        const remaining = Math.max(0, endsAt - Date.now());
        const totalSeconds = Math.floor(remaining / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const markup = `<span>${format(hours)}</span><b>:</b><span>${format(minutes)}</span><b>:</b><span>${format(seconds)}</span>`;

        countdowns.forEach((countdown) => {
            countdown.innerHTML = markup;
        });

        if (remaining <= 0) {
            endsAt = Date.now() + duration;
            localStorage.setItem(storageKey, String(endsAt));
        }
    };

    render();
    window.setInterval(render, 1000);
}

/* ── Contact Form ── */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('formStatus');
    if (!form) return;

    const setStatus = (message, type = '') => {
        if (!status) return;
        status.textContent = message;
        status.classList.toggle('is-success', type === 'success');
        status.classList.toggle('is-error', type === 'error');
    };

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
        btn.textContent = 'enviando...';
        btn.disabled = true;
        btn.style.opacity = '0.6';
        setStatus('Enviando mensagem.');

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });

            const contentType = response.headers.get('content-type') || '';
            const result = contentType.includes('application/json') ? await response.json() : {};

            if (!response.ok || (contentType.includes('application/json') && !['true', true].includes(result.success))) {
                throw new Error(result.message || 'Falha ao enviar a mensagem.');
            }

            btn.textContent = '✔ mensagem enviada!';
            btn.style.opacity = '1';
            btn.style.background = '#255AE6';
            setStatus('Mensagem enviada com sucesso. Vou te responder em breve.', 'success');
            form.reset();
            window.location.href = '/obrigado';
        } catch (error) {
            btn.textContent = 'Tentar novamente';
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.background = '';
            setStatus('Nao foi possivel enviar agora. Tente novamente em instantes ou fale pelo WhatsApp.', 'error');
            console.error(error);
        }
    });
}

/* ── Smooth Scroll ── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"], a[href^="/"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href.startsWith('#')) {
                const sectionId = href.slice(1);
                if (!sectionId) return;

                e.preventDefault();
                scrollToSection(sectionId);
                return;
            }

            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin) return;

            const routePath = normalizePath(url.pathname);
            const sectionId = SECTION_ROUTES[routePath];
            if (!sectionId) return;

            e.preventDefault();
            scrollToSection(sectionId);
            window.history.pushState({ sectionId }, '', routePath);
        });
    });
}

function initSectionRoutes() {
    const path = normalizePath(window.location.pathname);
    const sectionId = SECTION_ROUTES[path];
    if (sectionId && sectionId !== 'home') {
        window.setTimeout(() => scrollToSection(sectionId, 'auto'), 80);
    }

    window.addEventListener('popstate', () => {
        const nextSectionId = SECTION_ROUTES[normalizePath(window.location.pathname)] || 'home';
        scrollToSection(nextSectionId);
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

    const delay = 9000;
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
        navigator.serviceWorker.register('./service-worker.js?v=20260522-section-routes', { updateViaCache: 'none' }).catch((error) => {
            console.warn('Service worker registration failed.', error);
        });
    });
}
