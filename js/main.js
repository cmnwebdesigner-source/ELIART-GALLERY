let historyStack = ['home'];
let intersectionObserver = null;

function handleMissingImage(img) {
    if (!img || img.dataset.fallbackApplied === 'true') return;
    img.dataset.fallbackApplied = 'true';

    const wrapper = img.closest('.artwork-card-img') || img.closest('.postcard-image') || img.parentElement;
    if (wrapper) {
        wrapper.classList.add('image-missing-box');

        if (!wrapper.querySelector('.image-missing-message')) {
            const message = document.createElement('div');
            message.className = 'image-missing-message';
            message.innerHTML = `<span>${(window.uiText && window.uiText[currentLanguage || 'ro'] && window.uiText[currentLanguage || 'ro'].missingImageTitle) || 'Imagine lipsă'}</span><small>${(window.uiText && window.uiText[currentLanguage || 'ro'] && window.uiText[currentLanguage || 'ro'].missingImageSub) || 'Verifică assets/images'}</small>`;
            wrapper.appendChild(message);
        }
    }

    img.style.opacity = '0';
}

function applyImageFallbacks() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => handleMissingImage(img));

        if (img.complete && img.naturalWidth === 0) {
            handleMissingImage(img);
        }
    });
}

window.addEventListener('error', event => {
    if (event.target && event.target.tagName === 'IMG') {
        handleMissingImage(event.target);
    }
}, true);

function initApp() {
    if (typeof renderArtworkCards === 'function') {
        renderArtworkCards();
    }
    if (typeof initLanguage === 'function') {
        initLanguage();
    }

    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    applyImageFallbacks();
    setupAnimations();
    navigateTo('home', true);

    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden-loader');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 650);
        }, 1000);
    }
}

function setupAnimations() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal-up').forEach(el => {
            el.classList.add('is-visible');
        });
        return;
    }

    intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                intersectionObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.1
    });
}

function resetAnimationsForTab(tabId) {
    const tab = document.getElementById(tabId);
    if (!tab) return;

    const elements = tab.querySelectorAll('.reveal-up');
    elements.forEach(el => {
        el.classList.remove('is-visible');

        if (intersectionObserver) {
            intersectionObserver.observe(el);
        } else {
            el.classList.add('is-visible');
        }
    });

    requestAnimationFrame(() => {
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('is-visible');
                if (intersectionObserver) intersectionObserver.unobserve(el);
            }
        });
    });
}

function navigateTo(tabId, skipHistory = false) {
    const target = document.getElementById(tabId);
    if (!target) return;

    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active-nav');

        const onClickValue = link.getAttribute('onclick') || '';
        if (onClickValue.includes("'" + tabId + "'")) {
            link.classList.add('active-nav');
        }
    });

    target.classList.remove('hidden');

    requestAnimationFrame(() => {
        target.classList.add('active');
        resetAnimationsForTab(tabId);
    });

    if (!skipHistory && historyStack[historyStack.length - 1] !== tabId) {
        historyStack.push(tabId);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMobileMenu();
}

function goBack() {
    if (historyStack.length > 1) {
        historyStack.pop();
        navigateTo(historyStack[historyStack.length - 1], true);
        return;
    }

    navigateTo('home', true);
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;

    if (mobileMenu.classList.contains('translate-x-full')) {
        openMobileMenu();
    } else {
        closeMobileMenu();
    }
}

function openMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
    if (!mobileMenu || !overlay) return;

    mobileMenu.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');

    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
    });

    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
    if (!mobileMenu || !overlay) return;

    mobileMenu.classList.add('translate-x-full');
    overlay.classList.add('opacity-0');

    setTimeout(() => {
        if (mobileMenu.classList.contains('translate-x-full')) {
            overlay.classList.add('hidden');
        }
    }, 300);

    document.body.style.overflow = '';
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeMobileMenu();
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth >= 1280) {
        closeMobileMenu();
    }
});

window.initApp = initApp;
window.navigateTo = navigateTo;
window.goBack = goBack;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
