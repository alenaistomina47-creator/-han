document.addEventListener('alpine:init', () => {
    Alpine.data('calculator', () => ({
        // ==========================================
        // 1. СОСТОЯНИЕ (STATE)
        // ==========================================
        currentTab: 1, // 1 = Конструктор, 2 = Смета
        isVisualizerMinimized: false,
        activeTab: 'outside',
        showPriceModal: false,
        isRestoringUrl: false,
        isTelegram: false,

        // Выбранные ID
        selectedSizeId: '',
        selectedMaterialId: '',
        selectedStoveId: '',
        selectedFinishId: '',
        selectedLadderId: '',
        selectedChimneyId: '',
        selectedExtrasIds: [],

        // ВАЖНО: Это теперь обычный массив, а не геттер.
        // Он физически хранит список товаров, поэтому он не может быть пустым, если цена есть.
        cartItems: [], 

        // ==========================================
        // 2. ИНИЦИАЛИЗАЦИЯ
        // ==========================================
        init() {
            console.log('Калькулятор запущен. Режим массива (v2.0).');

            // Следим за скроллом
            window.addEventListener('scroll', () => {
                this.isVisualizerMinimized = window.scrollY > 50;
            });

            // Отправка вебхука при переходе в корзину
            this.$watch('currentTab', (val) => {
                if (val === 2) this.sendToWebhook();
            });

            // Проверяем, загрузились ли данные из data.js
            if (typeof appData !== 'undefined') {
                this.preloadImages();
                this.loadFromUrl();

                // При любом изменении параметров — обновляем URL
                this.$watch('selectedSizeId', () => this.updateUrl());
                this.$watch('selectedMaterialId', () => this.updateUrl());
                this.$watch('selectedStoveId', () => this.updateUrl());
                this.$watch('selectedFinishId', () => this.updateUrl());
                this.$watch('selectedLadderId', () => this.updateUrl());
                this.$watch('selectedChimneyId', () => this.updateUrl());
                this.$watch('selectedExtrasIds', () => this.updateUrl());

                // Telegram инициализация
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
                    this.isTelegram = true;
                    const tg = window.Telegram.WebApp;
                    tg.ready();
                    tg.expand();
                    
                    tg.MainButton.setText(`ЗАФИКСИРОВАТЬ: 0 ₽`);
                    tg.MainButton.setParams({ color: '#5fb856', text_color: '#ffffff' });
                    tg.MainButton.show();
                    tg.MainButton.onClick(() => { this.sendToTelegram(); });

                    this.$watch('totalPrice', (val) => {
                        tg.MainButton.setText(`ЗАФИКСИРОВАТЬ: ${this.formatPrice(val)}`);
                    });
                }

                // Логика исключения несовместимых опций
                this.$watch('selectedChimneyId', (val) => {
                    if (val === 'pipe_sandwich') this.selectedExtrasIds = this.selectedExtrasIds.filter(id => id !== 'protection');
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

                // MAGIC FIX: Принудительное обновление корзины
                // Эта команда следит за всеми переменными внутри updateCartList
                // и запускает пересчет списка автоматически.
                this.$effect(() => {
                    this.updateCartList();
                });
            }
        },

        // ==========================================
        // 3. ВСПОМОГАТЕЛЬНЫЕ ГЕТТЕРЫ (HELPERS)
        // ==========================================
        get selectedSize() { return this.selectedSizeId ? appData.sizes.find(s => s.id === this.selectedSizeId) : null; },
        get selectedStove() { return this.selectedStoveId ? appData.stoves.find(s => s.id === this.selectedStoveId) : null; },
        get selectedFinish() { return this.selectedFinishId ? appData.finishes.find(f => f.id === this.selectedFinishId) : null; },
        get selectedLadder() { return this.selectedLadderId ? appData.extras.find(e => e.id === this.selectedLadderId) : null; },
        get selectedChimney() { return this.selectedChimneyId ? appData.extras.find(e => e.id === this.selectedChimneyId) : null; },
        get selectedMaterial() { return this.selectedMaterialId ? this.currentMaterials.find(m => m.id === this.selectedMaterialId) : null; },

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

        // ==========================================
        // 4. ЛОГИКА КОРЗИНЫ (МАССИВ)
        // ==========================================
        updateCartList() {
            try {
                // Если данные еще не загрузились - выходим, чтобы не было ошибок
                if (typeof appData === 'undefined') return;

                const items = [];

                // 1. Чан (Размер + Материал)
                if (this.selectedSizeId && this.selectedMaterialId && appData.materials[this.selectedSizeId]) {
                    const price = appData.materials[this.selectedSizeId][this.selectedMaterialId] || 0;
                    const sizeName = this.selectedSize ? this.selectedSize.name : 'Чан';
                    const matName = this.selectedMaterial ? this.selectedMaterial.name : 'Материал';
                    items.push({ name: `Чан: ${sizeName}, ${matName}`, price: price });
                }

                // 2. Печь
                if (this.selectedStove) {
                    items.push({ name: this.selectedStove.name, price: this.selectedStove.price || 0 });
                }

                // 3. Отделка
                if (this.selectedFinish) {
                    let finishPrice = 0;
                    if (typeof this.selectedFinish.price === 'object') {
                        finishPrice = this.selectedFinish.price[this.selectedSizeId] || 0;
                    } else {
                        finishPrice = this.selectedFinish.price || 0;
                    }
                    if (finishPrice > 0) {
                        items.push({ name: `Отделка: ${this.selectedFinish.name}`, price: finishPrice });
                    }
                }

                // 4. Лестница
                if (this.selectedLadder) {
                    items.push({ name: this.selectedLadder.name, price: this.selectedLadder.price || 0 });
                }

                // 5. Дымоход
                if (this.selectedChimney) {
                    items.push({ name: this.selectedChimney.name, price: this.selectedChimney.price || 0 });
                }

                // 6. Допы (Чекбоксы)
                this.selectedExtrasIds.forEach(id => {
                    const extra = appData.extras.find(e => e.id === id);
                    if (extra) {
                        items.push({ name: extra.name, price: extra.price || 0 });
                    }
                });

                // ВОТ ОНО: Принудительно кладем товары в массив.
                // Теперь HTML просто читает этот массив, ему не нужно ничего считать.
                this.cartItems = items;

            } catch (e) {
                console.error("Ошибка обновления корзины:", e);
                this.cartItems = [{ name: "Ошибка расчета", price: 0 }];
            }
        },

        // Итоговая цена теперь просто сумма товаров в списке.
        // Это гарантирует, что ЦЕНА и СПИСОК всегда совпадают.
        get totalPrice() {
            return this.cartItems.reduce((sum, item) => sum + item.price, 0);
        },

        // Для совместимости с модалкой
        get priceDetails() {
            return this.cartItems;
        },

        // ==========================================
        // 5. УТИЛИТЫ И ЭКШЕНЫ
        // ==========================================
        formatPrice(price) { return price.toLocaleString('ru-RU') + ' ₽'; },
        formatOriginalPrice(price) { return Math.round(price * 1.3).toLocaleString('ru-RU') + ' ₽'; },

        getMaterialOverlay() {
            if (!this.selectedMaterialId || !appData.materialMetadata) return null;
            const meta = appData.materialMetadata[this.selectedMaterialId];
            return meta ? meta.image : null;
        },

        preloadImages() {
            if (appData.sizes) appData.sizes.forEach(s => { new Image().src = s.image; });
        },

        // Отправка в Telegram
        sendToTelegram() {
            const itemsText = this.cartItems.map(i => `- ${i.name}`).join('\n');
            const text = `🔥 Новый заказ!\n\n${itemsText}\n\n💰 Итого: ${this.formatPrice(this.totalPrice)}`;

            if (this.isTelegram) {
                window.Telegram.WebApp.sendData(JSON.stringify({ items: this.cartItems, total: this.totalPrice }));
            } else {
                // Если открыто в браузере — копируем и переходим в тг
                const url = `https://t.me/ivan_ural_chan?text=${encodeURIComponent(text)}`;
                
                // Пробуем скопировать, но не блокируем переход, если не выйдет
                try {
                    navigator.clipboard.writeText(text);
                } catch (e) {}
                
                window.open(url, '_blank');
            }
        },

        sendToWebhook() {
            // Место для отправки данных в CRM
            // const data = { ... };
            // fetch(...)
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
            window.history.replaceState({}, '', newUrl);
        },

        loadFromUrl() {
            this.isRestoringUrl = true;
            const params = new URLSearchParams(window.location.search);
            if (params.has('s')) this.selectedSizeId = params.get('s');
            
            // Загружаем остальное только если выбран размер
            if (this.selectedSizeId) {
                if (params.has('m')) this.selectedMaterialId = params.get('m');
                if (params.has('st')) this.selectedStoveId = params.get('st');
                if (params.has('f')) this.selectedFinishId = params.get('f');
                if (params.has('l')) this.selectedLadderId = params.get('l');
                if (params.has('c')) this.selectedChimneyId = params.get('c');
                if (params.has('e')) this.selectedExtrasIds = params.get('e').split(',');
            }
            this.isRestoringUrl = false;
        }
    }));
});