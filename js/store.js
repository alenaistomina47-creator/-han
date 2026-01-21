try {
    document.addEventListener('alpine:init', () => {
        Alpine.data('calculator', () => {
            try {
                return {
                    // Состояние
                    selectedSizeId: '',
                    selectedMaterialId: '',
                    selectedStoveId: '',
                    selectedFinishId: '',
                    selectedLadderId: '',
                    selectedChimneyId: '',
                    selectedExtrasIds: [],
                    isTelegram: false,

                    // Вкладки визуализации
                    activeTab: 'outside',
                    currentView: 'calculator',
                    showPriceModal: false,
                    showCartModal: false,
                    isVisualizerMinimized: false,
                    isRestoringUrl: false,

                    // === ИНТЕГРАЦИЯ С КОРЗИНОЙ ===
                    // Safe Access: check if store exists to avoid crash
                    get cart() {
                        return (Alpine.store('cart')) ? Alpine.store('cart').items : [];
                    },
                    get cartTotal() {
                        return (Alpine.store('cart')) ? Alpine.store('cart').total : 0;
                    },

                    // Инициализация
                    init() {
                        console.log('Калькулятор запущен.');

                        // Загрузка корзины выполняется в cart.js (Alpine.store('cart').init())

                        window.addEventListener('scroll', () => {
                            this.isVisualizerMinimized = window.scrollY > 50;
                        });

                        if (typeof appData !== 'undefined') {
                            this.preloadImages();

                            // --- URL STATE SYNC START ---
                            this.loadFromUrl();

                            // Watchers for URL update
                            this.$watch('selectedSizeId', () => this.updateUrl());
                            this.$watch('selectedMaterialId', () => this.updateUrl());
                            this.$watch('selectedStoveId', () => this.updateUrl());
                            this.$watch('selectedFinishId', () => this.updateUrl());
                            this.$watch('selectedLadderId', () => this.updateUrl());
                            this.$watch('selectedChimneyId', () => this.updateUrl());
                            this.$watch('selectedExtrasIds', () => this.updateUrl());

                            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
                                this.isTelegram = true;
                                // ... (Telegram init logic)
                                const tg = window.Telegram.WebApp;
                                tg.ready();
                                tg.expand();

                                tg.MainButton.setText(`ЗАФИКСИРОВАТЬ: 0 ₽`);
                                tg.MainButton.setParams({ color: '#5fb856', text_color: '#ffffff' });
                                tg.MainButton.show();
                                tg.MainButton.onClick(() => { this.sendToTelegram(); });

                                // --- Back Button ---
                                tg.BackButton.onClick(() => {
                                    this.currentView = 'calculator';
                                });
                                this.$watch('currentView', (val) => {
                                    val === 'cart' ? tg.BackButton.show() : tg.BackButton.hide();
                                });

                                this.$watch('totalPrice', (val) => {
                                    tg.MainButton.setText(`ЗАФИКСИРОВАТЬ: ${this.formatPrice(val)}`);
                                });
                            }

                            // ... (Business Logic watchers remain)
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
                        } else {
                            console.warn('AppData is not defined!');
                        }
                    },

                    // Геттеры сущностей
                    get selectedSize() { return this.selectedSizeId ? appData.sizes.find(s => s.id === this.selectedSizeId) : null; },
                    get selectedStove() { return this.selectedStoveId ? appData.stoves.find(s => s.id === this.selectedStoveId) : null; },
                    get selectedFinish() { return this.selectedFinishId ? appData.finishes.find(f => f.id === this.selectedFinishId) : null; },
                    get selectedLadder() { return this.selectedLadderId ? appData.extras.find(e => e.id === this.selectedLadderId) : null; },
                    get selectedChimney() { return this.selectedChimneyId ? appData.extras.find(e => e.id === this.selectedChimneyId) : null; },

                    // Списки
                    get ladders() { return appData.extras.filter(e => e.type === 'stairs'); },
                    get chimneys() { return appData.extras.filter(e => e.type === 'pipe'); },
                    get otherExtras() { return appData.extras.filter(e => !e.type); },

                    // Материалы
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

                    getBaseImage() {
                        if (!this.selectedSizeId) return null;
                        if (this.selectedSize && this.selectedSize.image) {
                            return null;
                        }
                        return null;
                    },

                    preloadImages() {
                        // Implement if needed for heavy assets
                    },

                    get totalPrice() {
                        let total = 0;
                        // 1. Материал
                        if (this.selectedSizeId && this.selectedMaterialId && appData.materials[this.selectedSizeId]) {
                            total += appData.materials[this.selectedSizeId][this.selectedMaterialId] || 0;
                        }
                        // 2. Печь
                        if (this.selectedStove) total += this.selectedStove.price || 0;
                        // 3. Отделка
                        if (this.selectedFinish) {
                            if (typeof this.selectedFinish.price === 'object') {
                                total += this.selectedFinish.price[this.selectedSizeId] || 0;
                            } else {
                                total += this.selectedFinish.price || 0;
                            }
                        }
                        // ... ladders, chimneys, extras ...
                        if (this.selectedLadder) total += this.selectedLadder.price || 0;
                        if (this.selectedChimney) total += this.selectedChimney.price || 0;
                        this.selectedExtrasIds.forEach(id => {
                            const extra = appData.extras.find(e => e.id === id);
                            if (extra) total += extra.price || 0;
                        });
                        return total;
                    },

                    // Детализация цены (Смета)
                    get priceDetails() {
                        const details = [];

                        // 1. Чаша (Размер + Материал)
                        const size = appData.sizes.find(s => s.id === this.selectedSizeId);
                        const material = this.currentMaterials ? this.currentMaterials.find(m => m.id === this.selectedMaterialId) : null;

                        if (size && material) {
                            const basePrice = (appData.materials[this.selectedSizeId] && appData.materials[this.selectedSizeId][this.selectedMaterialId]) || 0;
                            details.push({
                                name: `Чан: ${size.name}, ${material.name}`,
                                price: basePrice
                            });
                        }

                        // 2. Печь
                        const stove = appData.stoves.find(s => s.id === this.selectedStoveId);
                        if (stove) {
                            details.push({ name: stove.name, price: stove.price || 0 });
                        }

                        // 3. Отделка
                        const finish = appData.finishes.find(f => f.id === this.selectedFinishId);
                        if (finish && finish.price) {
                            let finishPrice = 0;
                            if (typeof finish.price === 'object') {
                                finishPrice = finish.price[this.selectedSizeId] || 0;
                            } else {
                                finishPrice = finish.price || 0;
                            }
                            if (finishPrice > 0) {
                                details.push({ name: `Отделка: ${finish.name}`, price: finishPrice });
                            }
                        }

                        // 4. Лестница
                        const ladder = appData.extras.find(e => e.id === this.selectedLadderId);
                        if (ladder) {
                            details.push({ name: ladder.name, price: ladder.price || 0 });
                        }

                        // 5. Дымоход
                        const chimney = appData.extras.find(e => e.id === this.selectedChimneyId);
                        if (chimney) {
                            details.push({ name: chimney.name, price: chimney.price || 0 });
                        }

                        // 6. Дополнительные опции
                        this.selectedExtrasIds.forEach(id => {
                            const extra = appData.extras.find(e => e.id === id);
                            if (extra) {
                                details.push({ name: extra.name, price: extra.price || 0 });
                            }
                        });

                        return details;
                    },

                    get discountedPrice() {
                        return this.totalPrice;
                    },

                    get originalPrice() {
                        return Math.round(this.totalPrice * 1.3);
                    },

                    addToCart() {
                        if (!this.selectedSizeId || !this.selectedMaterialId) {
                            alert('Сначала выберите Размер и Материал!');
                            return;
                        }

                        const parts = [];
                        if (this.selectedSize) parts.push(this.selectedSize.name);
                        if (this.selectedMaterial) parts.push(this.selectedMaterial.name);
                        if (this.selectedStove) parts.push(`+ ${this.selectedStove.name}`);

                        const item = {
                            id: Date.now(),
                            ui_title: parts.join(', '),
                            price: {
                                total: this.totalPrice,
                                original: this.originalPrice
                            },
                            data: this.currentItemData // Используем геттер
                        };

                        Alpine.store('cart').addItem(item);
                    },

                    removeFromCart(index) {
                        Alpine.store('cart').removeItem(index);
                    },

                    saveCart() {
                        Alpine.store('cart').save();
                    },

                    get currentItemTitle() {
                        try {
                            if (!this.selectedSize || !this.selectedSize.name) return 'Чан не выбран';
                            const parts = [this.selectedSize.name];
                            if (this.selectedMaterial && this.selectedMaterial.name) parts.push(this.selectedMaterial.name);
                            if (this.selectedStove && this.selectedStove.name) parts.push(`+ ${this.selectedStove.name}`);
                            return parts.join(', ');
                        } catch (e) {
                            console.error('Error in currentItemTitle', e);
                            return 'Ошибка названия';
                        }
                    },

                    get currentItemData() {
                        try {
                            return {
                                size: this.selectedSize ? this.selectedSize.name : 'Не выбрано',
                                material: this.selectedMaterial ? this.selectedMaterial.name : 'Не выбрано',
                                stove: this.selectedStove ? this.selectedStove.name : 'Не выбрано',
                                finish: this.selectedFinish ? this.selectedFinish.name : 'Не выбрано',
                                ladder: this.selectedLadder ? this.selectedLadder.name : 'Не выбрано',
                                chimney: this.selectedChimney ? this.selectedChimney.name : 'Не выбрано',
                                extras: (this.selectedExtrasIds || []).map(id => {
                                    if (!appData?.extras) return '';
                                    const e = appData.extras.find(ext => ext.id === id);
                                    return e ? e.name : '';
                                }).filter(Boolean).join(', ')
                            };
                        } catch (e) {
                            console.error('Error in currentItemData', e);
                            return { size: 'Ошибка данных' };
                        }
                    },

                    get grandTotal() {
                        const draftPrice = this.selectedSizeId ? this.totalPrice : 0;
                        return Alpine.store('cart').total + draftPrice;
                    },

                    saveCurrentAndReset() {
                        if (!this.selectedSizeId) return;
                        this.addToCart(); // Добавляет в Cart Store

                        this.resetCalculator();
                        this.currentView = 'calculator';
                    },

                    resetCalculator() {
                        this.selectedSizeId = null;
                        this.selectedMaterialId = null;
                        this.selectedStoveId = null;
                        this.selectedFinishId = null;
                        this.selectedLadderId = null;
                        this.selectedChimneyId = null;
                        this.selectedExtrasIds = [];
                    },

                    async sendToTelegram() {
                        let activeDraft = null;
                        if (this.selectedSizeId) {
                            activeDraft = {
                                ui_title: this.currentItemTitle,
                                price: { total: this.totalPrice },
                                data: this.currentItemData
                            };
                        }

                        const success = await Alpine.store('cart').checkout(activeDraft, this.isTelegram);

                        if (success) {
                            this.resetCalculator();
                            this.currentView = 'calculator';
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

                        const newQuery = params.toString();
                        const newUrl = `${window.location.pathname}?${newQuery}`;
                        window.history.replaceState({}, '', newUrl);

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
                            } catch (e) {
                                console.error('Deep link error:', e);
                            }
                        }

                        const params = new URLSearchParams(window.location.search);
                        if (params.has('s')) {
                            this.selectedSizeId = params.get('s');
                        }

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

                    shareConfig() {
                        const url = this.updateUrl();
                        const title = 'Мой банный чан';
                        const sizeName = this.selectedSize ? this.selectedSize.name : 'Чан';
                        const text = `Посмотри, какой чан я собрал(а): ${sizeName}`;

                        if (navigator.share) {
                            navigator.share({ title, text, url })
                                .catch((error) => console.log('Error sharing', error));
                        } else {
                            navigator.clipboard.writeText(url).then(() => {
                                alert('Ссылка скопирована!\n' + url);
                            });
                        }
                    }
                };
            } catch (e) {
                alert('CRITICAL: Alpine Data Init Failed: ' + e.message);
                throw e; // Пробрасываем ошибку дальше в Alpine
            }
        });
    });
} catch (globalE) {
    alert('GLOBAL STORE ERROR: ' + globalE.message);
}
