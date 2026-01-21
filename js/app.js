// --- 2. ЛОГИКА (Alpine Store) ---
document.addEventListener('alpine:init', () => {
    Alpine.data('calculator', () => ({
        // Состояние конфигуратора
        selectedSizeId: '',
        selectedMaterialId: '',
        selectedStoveId: '',
        selectedFinishId: '',
        selectedLadderId: '',
        selectedChimneyId: '',
        selectedExtrasIds: [],

        // Состояние приложения
        isTelegram: false,
        activeTab: 'outside',
        showPriceModal: false,
        isVisualizerMinimized: false,
        isRestoringUrl: false,

        // Корзина
        cart: [],
        isCartOpen: false,

        // Инициализация
        init() {
            console.log('Калькулятор запущен.');

            window.addEventListener('scroll', () => {
                this.isVisualizerMinimized = window.scrollY > 50;
            });

            // Восстановление корзины
            const savedCart = localStorage.getItem('chan_cart');
            if (savedCart) {
                try {
                    this.cart = JSON.parse(savedCart);
                } catch (e) {
                    console.error('Error loading cart', e);
                }
            }

            if (typeof appData !== 'undefined') {
                this.preloadImages();
                this.loadFromUrl();

                // Watchers for URL update
                this.$watch('selectedSizeId', () => this.updateUrl());
                this.$watch('selectedMaterialId', () => this.updateUrl());
                this.$watch('selectedStoveId', () => this.updateUrl());
                this.$watch('selectedFinishId', () => this.updateUrl());
                this.$watch('selectedLadderId', () => this.updateUrl());
                this.$watch('selectedChimneyId', () => this.updateUrl());
                this.$watch('selectedExtrasIds', () => this.updateUrl());

                // Watcher for Cart
                this.$watch('cart', (val) => {
                    localStorage.setItem('chan_cart', JSON.stringify(val));
                    // Update Telegram Button if needed
                    if (this.isTelegram && window.Telegram && window.Telegram.WebApp) {
                        const tg = window.Telegram.WebApp;
                        if (val.length > 0) {
                            tg.MainButton.setText(`ОФОРМИТЬ (${this.formatPrice(this.cartTotal)})`);
                            tg.MainButton.show();
                        } else {
                            tg.MainButton.hide();
                        }
                    }
                });

                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
                    this.isTelegram = true;
                    const tg = window.Telegram.WebApp;
                    tg.ready();
                    tg.expand();
                    tg.MainButton.setParams({ color: '#5fb856', text_color: '#ffffff' });
                    tg.MainButton.onClick(() => { this.sendCartToTelegram(); });
                }

                // Business Logic watchers
                this.$watch('selectedChimneyId', (val) => {
                    if (val === 'pipe_sandwich') {
                        this.selectedExtrasIds = this.selectedExtrasIds.filter(id => id !== 'protection');
                    }
                });

                this.$watch('selectedExtrasIds', (val) => {
                    if (val.includes('rim_finish')) {
                        if (val.includes('thermometer')) this.selectedExtrasIds = val.filter(id => id !== 'thermometer');
                        if (this.selectedLadderId === 'stairs_wood') this.selectedLadderId = '';
                    }
                });

                this.$watch('selectedLadderId', (val) => {
                    if (val === 'stairs_wood' && this.selectedExtrasIds.includes('rim_finish')) {
                        this.selectedExtrasIds = this.selectedExtrasIds.filter(id => id !== 'rim_finish');
                    }
                });

                this.$watch('selectedStoveId', (val) => {
                    if (val && val !== 'jacket') {
                        this.selectedExtrasIds = this.selectedExtrasIds.filter(id => id !== 'jacuzzi' && id !== 'rim_finish');
                    }
                });
            }
        },

        // Геттеры сущностей (для текущего выбора)
        get selectedSize() { return this.selectedSizeId ? appData.sizes.find(s => s.id === this.selectedSizeId) : null; },
        get selectedStove() { return this.selectedStoveId ? appData.stoves.find(s => s.id === this.selectedStoveId) : null; },
        get selectedFinish() { return this.selectedFinishId ? appData.finishes.find(f => f.id === this.selectedFinishId) : null; },
        get selectedLadder() { return this.selectedLadderId ? appData.extras.find(e => e.id === this.selectedLadderId) : null; },
        get selectedChimney() { return this.selectedChimneyId ? appData.extras.find(e => e.id === this.selectedChimneyId) : null; },

        get ladders() { return appData.extras.filter(e => e.type === 'stairs'); },
        get chimneys() { return appData.extras.filter(e => e.type === 'pipe'); },
        get otherExtras() { return appData.extras.filter(e => !e.type); },

        get currentMaterials() {
            if (!this.selectedSizeId) return [];
            const prices = appData.materials[this.selectedSizeId];
            if (!prices) return [];
            return [
                { id: 'aisi430', price: prices.aisi430, ...appData.materialMetadata.aisi430 },
                { id: 'aisi304', price: prices.aisi304, ...appData.materialMetadata.aisi304 }
            ];
        },
        get selectedMaterial() {
            return this.selectedMaterialId ? this.currentMaterials.find(m => m.id === this.selectedMaterialId) : null;
        },

        formatPrice(price) { return price.toLocaleString('ru-RU') + ' ₽'; },
        formatOriginalPrice(price) { return Math.round(price * 1.3).toLocaleString('ru-RU') + ' ₽'; },

        getMaterialOverlay() {
            if (!this.selectedMaterialId) return null;
            if (appData.materialMetadata && appData.materialMetadata[this.selectedMaterialId]) {
                return appData.materialMetadata[this.selectedMaterialId].overlayImage || null;
            }
            return null;
        },

        get totalPrice() {
            let total = 0;
            if (this.selectedSizeId && this.selectedMaterialId && appData.materials[this.selectedSizeId]) {
                total += appData.materials[this.selectedSizeId][this.selectedMaterialId] || 0;
            }
            if (this.selectedStove) total += this.selectedStove.price || 0;
            if (this.selectedFinish) {
                if (typeof this.selectedFinish.price === 'object') {
                    total += this.selectedFinish.price[this.selectedSizeId] || 0;
                } else {
                    total += this.selectedFinish.price || 0;
                }
            }
            if (this.selectedLadder) total += this.selectedLadder.price || 0;
            if (this.selectedChimney) total += this.selectedChimney.price || 0;
            this.selectedExtrasIds.forEach(id => {
                const extra = appData.extras.find(e => e.id === id);
                if (extra) total += extra.price || 0;
            });
            return total;
        },

        get originalPrice() {
            return Math.round(this.totalPrice * 1.3);
        },

        get priceDetails() {
            const details = [];
            const size = appData.sizes.find(s => s.id === this.selectedSizeId);
            const material = this.currentMaterials ? this.currentMaterials.find(m => m.id === this.selectedMaterialId) : null;

            if (size && material) {
                const basePrice = (appData.materials[this.selectedSizeId] && appData.materials[this.selectedSizeId][this.selectedMaterialId]) || 0;
                details.push({
                    name: `Чан: ${size.name}, ${material.name}`,
                    price: basePrice
                });
            }
            if (this.selectedStove) details.push({ name: this.selectedStove.name, price: this.selectedStove.price || 0 });

            const finish = appData.finishes.find(f => f.id === this.selectedFinishId);
            if (finish && finish.price) {
                let finishPrice = (typeof finish.price === 'object') ? (finish.price[this.selectedSizeId] || 0) : finish.price;
                if (finishPrice > 0) details.push({ name: `Отделка: ${finish.name}`, price: finishPrice });
            }

            if (this.selectedLadder) details.push({ name: this.selectedLadder.name, price: this.selectedLadder.price || 0 });
            if (this.selectedChimney) details.push({ name: this.selectedChimney.name, price: this.selectedChimney.price || 0 });
            this.selectedExtrasIds.forEach(id => {
                const extra = appData.extras.find(e => e.id === id);
                if (extra) details.push({ name: extra.name, price: extra.price || 0 });
            });
            return details;
        },

        // --- ЛОГИКА КОРЗИНЫ ---

        addToCart() {
            if (!this.selectedSizeId || !this.selectedMaterialId) {
                alert('Пожалуйста, выберите размер и материал чана.');
                return;
            }

            const sizeName = this.selectedSize ? this.selectedSize.name : 'Чан';
            const materialName = this.selectedMaterial ? this.selectedMaterial.name : '';
            const tags = [];
            if (this.selectedStove) tags.push(this.selectedStove.name);
            if (this.selectedFinish) tags.push(this.selectedFinish.name);
            if (this.selectedLadder) tags.push(this.selectedLadder.name);
            this.selectedExtrasIds.forEach(id => {
                const e = appData.extras.find(ext => ext.id === id);
                if (e) tags.push(e.name);
            });

            const newItem = {
                id: Date.now(),
                title: `${sizeName} (${materialName})`,
                summary: tags.join(', '),
                tags: tags,
                price: this.totalPrice,
                details: JSON.parse(JSON.stringify(this.priceDetails))
            };

            this.cart.push(newItem);
            this.isCartOpen = true;
        },

        removeFromCart(index) {
            this.cart.splice(index, 1);
        },

        get cartTotal() {
            return this.cart.reduce((sum, item) => sum + item.price, 0);
        },

        sendCartToTelegram() {
            if (this.cart.length === 0) return;

            let text = `🛒 *НОВЫЙ ЗАКАЗ* (${this.cart.length} поз.)\n\n`;

            this.cart.forEach((item, index) => {
                text += `*Позиция #${index + 1}*\n`;
                text += `📦 ${item.title}\n`;
                text += `🔧 ${item.summary}\n`;
                text += `💰 ${this.formatPrice(item.price)}\n\n`;
            });

            text += `----------------\n`;
            text += `💳 *ИТОГО: ${this.formatPrice(this.cartTotal)}*`;

            if (this.isTelegram) {
                const url = `https://t.me/ivan_ural_chan?text=${encodeURIComponent(text)}`;
                window.Telegram.WebApp.openTelegramLink(url);
            } else {
                navigator.clipboard.writeText(text).then(() => {
                    alert('Заказ скопирован! Открываю чат...');
                    window.open(`https://t.me/ivan_ural_chan?text=${encodeURIComponent(text)}`, '_blank');
                }).catch(() => {
                    window.open(`https://t.me/ivan_ural_chan?text=${encodeURIComponent(text)}`, '_blank');
                });
            }
        },

        updateUrl() {
            if (this.isRestoringUrl) return;
            const params = new URLSearchParams();
            if (this.selectedSizeId) params.set('s', this.selectedSizeId);
            if (this.selectedMaterialId) params.set('m', this.selectedMaterialId);
            if (this.selectedStoveId) params.set('st', this.selectedStoveId);
            if (this.selectedFinishId) params.set('f', this.selectedFinishId);
            if (this.selectedLadderId) params.set('l', this.selectedLadderId);
            if (this.selectedChimneyId) params.set('c', this.selectedChimneyId);
            if (this.selectedExtrasIds.length) params.set('e', this.selectedExtrasIds.join(','));

            const newUrl = `${window.location.pathname}?${params.toString()}`;

            try {
                window.history.replaceState({}, '', newUrl);
            } catch (e) {
                console.log('History API not available in this environment');
            }
            return `${window.location.origin}${newUrl}`;
        },

        loadFromUrl() {
            this.isRestoringUrl = true;
            let startParam = new URLSearchParams(window.location.search).get('tgWebAppStartParam');
            if (window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
                startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
            }

            if (startParam) {
                try {
                    const jsonStr = atob(startParam);
                    const state = JSON.parse(jsonStr);
                    if (state.s) this.selectedSizeId = state.s;
                    if (state.m) this.selectedMaterialId = state.m;
                    if (state.st) this.selectedStoveId = state.st;
                    if (state.f) this.selectedFinishId = state.f;
                    if (state.l) this.selectedLadderId = state.l;
                    if (state.c) this.selectedChimneyId = state.c;
                    if (state.e) this.selectedExtrasIds = state.e;
                    this.isRestoringUrl = false;
                    return;
                } catch (e) { console.error(e); }
            }

            const params = new URLSearchParams(window.location.search);
            if (params.has('s')) this.selectedSizeId = params.get('s');
            if (this.selectedSizeId) {
                if (params.has('m')) this.selectedMaterialId = params.get('m');
                if (params.has('st')) this.selectedStoveId = params.get('st');
                if (params.has('f')) this.selectedFinishId = params.get('f');
                if (params.has('l')) this.selectedLadderId = params.get('l');
                if (params.has('c')) this.selectedChimneyId = params.get('c');
                if (params.has('e')) this.selectedExtrasIds = params.get('e').split(',');
            }
            this.isRestoringUrl = false;
        },

        preloadImages() {
            // Logic to preload images if needed
        }
    }));
});
