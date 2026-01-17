document.addEventListener('alpine:init', () => {
    Alpine.data('calculator', () => ({
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
        showPriceModal: false,
        isVisualizerMinimized: false,

        // Инициализация
        init() {
            console.log('Калькулятор запущен.');

            window.addEventListener('scroll', () => {
                this.isVisualizerMinimized = window.scrollY > 50;
            });

            if (typeof appData !== 'undefined') {
                // НЕ выбираем ничего по умолчанию (чистый лист)
                // this.selectedSizeId = ... 

                this.preloadImages();

                // --- URL STATE SYNC START ---
                this.loadFromUrl();

                // Watchers for URL update
                this.$watch('selectedSizeId', () => this.updateUrl());
                // ... (rest of init remains similar, just skip auto-select)
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
            // Если ничего не выбрано, вернем null (в HTML обработаем вывод заглушки)
            if (!this.selectedSizeId) return null;

            // Если выбран размер, но не материал - покажем просто размер (если есть картинка размера)
            // Но у нас картинки привязаны к металлу скорее. 
            // Хотя в data.js: sizes имеет 'image'.

            // Логика:
            // 1. Если выбрана 430 - берем её картинку.
            // 2. Если 304 - её.
            // 3. Если ничего - берем картинку из selectedSize (если она есть).

            // В data.js у sizes есть image: '.../small.png'
            if (this.selectedSize && this.selectedSize.image) {
                // Но мы хотим overlay?
                // В старом коде было: <img :src="selectedSize.image"> как база.
                // Тогда getBaseImage мб и не нужен, если мы вернемся к слоям.
                // Оставим пока старую логику слоев в HTML.
                return null;
            }
            return null;
        },

        // ... preloadImages ...

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
            // Use currentMaterials helper if available, or finding manually
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

        // Цена со скидкой (оригинальная из data.js) - показываем внизу зеленым
        get discountedPrice() {
            return this.totalPrice;
        },

        // Оригинальная цена (завышенная на 30%) - показываем зачеркнутой
        get originalPrice() {
            return Math.round(this.totalPrice * 1.3);
        },

        // Отправка в Telegram
        sendToTelegram() {
            const extrasNames = this.selectedExtrasIds.map(id => {
                const e = appData.extras.find(ext => ext.id === id);
                return e ? e.name : '';
            }).filter(Boolean).join(', ');

            const sizeName = this.selectedSize.name;
            const materialName = this.selectedMaterial.name;
            const stoveName = this.selectedStove.name;
            const finishName = this.selectedFinish.name;
            const ladderName = this.selectedLadder ? this.selectedLadder.name : 'Не выбрано';
            const chimneyName = this.selectedChimney ? this.selectedChimney.name : 'Не выбрано';

            const text = `🔥 Новый заказ! (из 3D калькулятора)\n\n` +
                `📏 Размер: ${sizeName}\n` +
                `🛡 Материал: ${materialName}\n` +
                `🔥 Печь: ${stoveName}\n` +
                `✨ Отделка: ${finishName}\n` +
                `🪜 Лестница: ${ladderName}\n` +
                `💨 Дымоход: ${chimneyName}\n` +
                `➕ Дополнительно: ${extrasNames || 'Нет'}\n\n` +
                `💰 Сумма заказа: ${this.formatPrice(this.totalPrice)}`;

            // Если открыто в Telegram Mini App
            if (this.isTelegram) {
                // Открываем личку с менеджером с предзаполненным текстом
                const url = `https://t.me/ivan_ural_chan?text=${encodeURIComponent(text)}`;
                window.Telegram.WebApp.openTelegramLink(url);
            } else {
                // Fallback для браузера - копируем и открываем
                navigator.clipboard.writeText(text).then(() => {
                    alert('Заказ скопирован! Открываю чат с менеджером...');
                    window.open(`https://t.me/ivan_ural_chan?text=${encodeURIComponent(text)}`, '_blank');
                }).catch(() => {
                    window.open(`https://t.me/ivan_ural_chan?text=${encodeURIComponent(text)}`, '_blank');
                });
            }
        },

        updateUrl() {
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
            return window.location.href; // Return for sharing
        },

        loadFromUrl() {
            // 1. Попытка загрузить из Deep Link (start_param)
            let startParam = new URLSearchParams(window.location.search).get('tgWebAppStartParam');

            // Если есть в Telegram initData (надежнее внутри Telegram)
            if (window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
                startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
            }

            if (startParam) {
                try {
                    // Разбираем Base64 -> JSON
                    const jsonStr = atob(startParam);
                    const state = JSON.parse(jsonStr);

                    if (state.s) this.selectedSizeId = state.s;
                    if (state.m) this.selectedMaterialId = state.m;
                    if (state.st) this.selectedStoveId = state.st;
                    if (state.f) this.selectedFinishId = state.f;
                    if (state.l) this.selectedLadderId = state.l;
                    if (state.c) this.selectedChimneyId = state.c;
                    if (state.e) this.selectedExtrasIds = state.e;
                    return; // Успешно загрузили из Deep Link
                } catch (e) {
                    console.error('Ошибка разбора start_param:', e);
                }
            }

            // 2. Fallback: Обычные GET-параметры (для браузера)
            const params = new URLSearchParams(window.location.search);
            if (params.has('s')) this.selectedSizeId = params.get('s');
            if (params.has('m')) this.selectedMaterialId = params.get('m');
            if (params.has('st')) this.selectedStoveId = params.get('st');
            if (params.has('f')) this.selectedFinishId = params.get('f');
            if (params.has('l')) this.selectedLadderId = params.get('l');
            if (params.has('c')) this.selectedChimneyId = params.get('c');
            if (params.has('e')) this.selectedExtrasIds = params.get('e').split(',');
        },

        shareConfig() {
            // Формируем объект состояния для Deep Link
            const state = {
                s: this.selectedSizeId,
                m: this.selectedMaterialId,
                st: this.selectedStoveId,
                f: this.selectedFinishId,
                l: this.selectedLadderId,
                c: this.selectedChimneyId,
                e: this.selectedExtrasIds
            };

            // Кодируем в Base64 для передачи в startapp
            // btoa создает ASCII строку из бинарных данных. JSON.stringify выдает UTF-16, но наши ID на латинице/цифрах.
            // Если будут кириллические ID - надо будет encodeURIComponent перед btoa. Но у нас ID (aisi430, stairs...) - безопасные.
            const base64Str = btoa(JSON.stringify(state));

            // Формируем "Магическую ссылку" для Telegram кнопки
            // Используем 'app' как дефолтное shortname.
            const deepLink = `https://t.me/MySuperChan_bot/app?startapp=${base64Str}`;

            const title = 'Мой банный чан';
            const text = `Посмотри, какой чан я собрал(а): ${this.selectedSize.name}, ${this.selectedStove.name}`;

            if (navigator.share) {
                navigator.share({ title, text, url: deepLink })
                    .catch((error) => console.log('Error sharing', error));
            } else {
                navigator.clipboard.writeText(deepLink).then(() => {
                    alert('Магическая ссылка скопирована! Отправьте её в Telegram.');
                });
            }
        }
    }));
});
