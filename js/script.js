tailwind.config = {
    darkMode: 'false',
    theme: {
        extend: {
            colors: {
                primary: "#F97316",
                "background-light": "#FFFFFF",
                "background-dark": "#FFFFFF",
                "card-light": "#F9FAFB",
                "card-dark": "#F9FAFB",
                "price-green": "#22C55E",
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
                heading: ["Oswald", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.5rem",
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'glow': '0 0 15px rgba(249, 115, 22, 0.3)',
            }
        },
    },
};

// Logic for interactivity
document.addEventListener('DOMContentLoaded', () => {
    // Price Logic
    const prices = {
        0: { current: "245 000 ₽", old: "310 000 ₽" },
        1: { current: "295 000 ₽", old: "380 000 ₽" },
        2: { current: "345 000 ₽", old: "450 000 ₽" }
    };
    const select = document.getElementById('size-select');
    const priceMain = document.getElementById('price-main');
    const priceOld = document.getElementById('price-old');

    if (select && priceMain && priceOld) {
        select.addEventListener('change', (e) => {
            const idx = e.target.selectedIndex;
            const p = prices[idx] || prices[0];
            priceMain.textContent = p.current;
            priceOld.textContent = p.old;

            // Pop animation
            priceMain.classList.remove('scale-100');
            priceMain.classList.add('scale-110');
            setTimeout(() => {
                priceMain.classList.remove('scale-110');
                priceMain.classList.add('scale-100');
            }, 200);
        });
    }

    // Tabs Logic
    const tabsContainer = document.getElementById('view-tabs');
    if (tabsContainer) {
        const tabs = tabsContainer.querySelectorAll('button');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => {
                    t.className = "flex-1 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all";
                });
                tab.className = "flex-1 py-2 bg-white dark:bg-card-dark text-gray-900 dark:text-white rounded-lg shadow-sm transition-all";
            });
        });
    }

    // Teaser & Sticky CTA Logic
    window.addEventListener('scroll', () => {
        const cta = document.getElementById('sticky-cta');
        if (window.scrollY > 300) {
            cta.classList.remove('translate-y-full', 'opacity-0');
        } else {
            cta.classList.add('translate-y-full', 'opacity-0');
        }
    });

    // Redirect on Teaser Click
    document.querySelectorAll('.teaser-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Полная конфигурация доступна в калькуляторе!');
            // window.location.href = '...'; 
        });
    });
});
