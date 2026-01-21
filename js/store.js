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
        currentView: 'calculator', // 'calculator' | 'cart'
        showPriceModal: false,
        showCartModal: false, // Legacy (can remove later if fully replaced)
        cart: [], // Корзина товаров
        isVisualizerMinimized: false,
        isRestoringUrl: false,

        // Инициализация
        init() {
            console.log('Калькулятор запущен.');

            // Загрузка корзины
            const savedCart = localStorage.getItem('chan_cart');
            if (savedCart) {
                try {
                    this.cart = JSON.parse(savedCart);
                } catch (e) {
                    console.error('Error loading cart', e);
                }
            }

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

        get cartTotal() {
            return this.cart.reduce((sum, item) => sum + (item.price?.total || 0), 0);
        },

        addToCart() {
            if (!this.selectedSizeId || !this.selectedMaterialId) {
                alert('Сначала выберите Размер и Материал!');
                return;
            }

            // Формируем описание для списка
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
                // Сохраняем "сырые" ID чтобы потом можно было (в теории) восстановить или отправить ID
                // Но для отправки текста проще сохранить готовые названия тут, или генерировать их снова.
                // Сохраним снапшот данных для генерации текста заказа
                data: {
                    size: this.selectedSize ? this.selectedSize.name : 'Не выбрано',
                    material: this.selectedMaterial ? this.selectedMaterial.name : 'Не выбрано',
                    stove: this.selectedStove ? this.selectedStove.name : 'Не выбрано',
                    finish: this.selectedFinish ? this.selectedFinish.name : 'Не выбрано',
                    ladder: this.selectedLadder ? this.selectedLadder.name : 'Не выбрано',
                    chimney: this.selectedChimney ? this.selectedChimney.name : 'Не выбрано',
                    extras: this.selectedExtrasIds.map(id => {
                        const e = appData.extras.find(ext => ext.id === id);
                        return e ? e.name : '';
                    }).filter(Boolean).join(', ')
                }
            };

            this.cart.push(item);
            this.saveCart();

            // UIfif
            if (window.Telegram?.WebApp?.showPopup) {
                window.Telegram.WebApp.showPopup({
                    title: 'Готово',
                    message: 'Товар добавлен в смету',
                    buttons: [{ type: 'ok' }]
                });
            } else {
                alert('Добавлено в смету!');
            }
        },

        removeFromCart(index) {
            this.cart.splice(index, 1);
            this.saveCart();
            if (this.cart.length === 0) {
                this.showCartModal = false;
            }
        },

        saveCart() {
            localStorage.setItem('chan_cart', JSON.stringify(this.cart));
        },

        // Отправка в Telegram
        async sendToTelegram(fromCart = false) {
            // 1. Сбор данных пользователя Telegram
            const tg = window.Telegram?.WebApp;
            const user = tg?.initDataUnsafe?.user || {};

            // 2. Сбор данных для отправки
            let orderPayload = {};
            let textMessage = '';

            if (fromCart) {
                // --- ОТПРАВКА КОРЗИНЫ ---
                if (this.cart.length === 0) return;

                const items = this.cart.map((item, index) => ({
                    index: index + 1,
                    summary: item.ui_title,
                    details: item.data,
                    price: item.price.total
                }));

                orderPayload = {
                    type: 'cart_order',
                    order_id: `cart_${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    user: user,
                    items: items,
                    total_price: {
                        value: this.cartTotal,
                        formatted: this.formatPrice(this.cartTotal)
                    }
                };

                // Генерация текста для чата
                textMessage = `🛒 *НОВЫЙ ЗАКАЗ (СМЕТА)*\n`;
                textMessage += `👤 Клиент: ${user.first_name || 'Неизвестно'} ${user.username ? '@' + user.username : ''}\n\n`;

                this.cart.forEach((item, i) => {
                    textMessage += `*Позиция #${i + 1}* — ${this.formatPrice(item.price.total)}\n`;
                    textMessage += `🔹 ${item.ui_title}\n`;
                    textMessage += `   Размер: ${item.data.size}\n`;
                    textMessage += `   Материал: ${item.data.material}\n`;
                    textMessage += `   Печь: ${item.data.stove}\n`;
                    textMessage += `   Отделка: ${item.data.finish}\n`;
                    textMessage += `   Допы: ${item.data.extras || 'Нет'}\n`;
                    textMessage += `------------------\n`;
                });

                textMessage += `\n💰 *ИТОГО К ОПЛАТЕ: ${this.formatPrice(this.cartTotal)}*`;

            } else {
                // --- ОТПРАВКА ТЕКУЩЕГО КОНСТРУКТОРА (ОДИНОЧНЫЙ) ---
                orderPayload = {
                    type: 'single_order',
                    order_id: `order_${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    user: {
                        id: user.id || null,
                        username: user.username || null,
                        first_name: user.first_name || null,
                        last_name: user.last_name || null,
                        language_code: user.language_code || null,
                        platform: tg?.platform || 'unknown'
                    },
                    calculator: {
                        size: this.selectedSize ? this.selectedSize.name : null,
                        material: this.selectedMaterial ? this.selectedMaterial.name : null,
                        stove: this.selectedStove ? this.selectedStove.name : null,
                        finish: this.selectedFinish ? this.selectedFinish.name : null,
                        ladder: this.selectedLadder ? this.selectedLadder.name : null,
                        chimney: this.selectedChimney ? this.selectedChimney.name : null,
                        extras: this.selectedExtrasIds.map(id => {
                            const e = appData.extras.find(ext => ext.id === id);
                            return e ? e.name : id;
                        }),
                        raw_ids: {
                            size: this.selectedSizeId,
                            material: this.selectedMaterialId,
                            stove: this.selectedStoveId,
                            finish: this.selectedFinishId,
                            ladder: this.selectedLadderId,
                            chimney: this.selectedChimneyId,
                            extras: this.selectedExtrasIds
                        }
                    },
                    price: {
                        total: this.totalPrice,
                        original: this.originalPrice,
                        currency: 'RUB',
                        formatted: this.formatPrice(this.totalPrice)
                    }
                };

                // Генерация текста (старая логика)
                const extrasNames = this.selectedExtrasIds.map(id => {
                    const e = appData.extras.find(ext => ext.id === id);
                    return e ? e.name : '';
                }).filter(Boolean).join(', ');

                const sizeName = this.selectedSize ? this.selectedSize.name : 'Не выбрано';
                const materialName = this.selectedMaterial ? this.selectedMaterial.name : 'Не выбрано';
                const stoveName = this.selectedStove ? this.selectedStove.name : 'Не выбрано';
                const finishName = this.selectedFinish ? this.selectedFinish.name : 'Не выбрано';
                const ladderName = this.selectedLadder ? this.selectedLadder.name : 'Не выбрано';
                const chimneyName = this.selectedChimney ? this.selectedChimney.name : 'Не выбрано';

                textMessage = `🔥 Новый заказ! (из 3D калькулятора)\n\n` +
                    `📏 Размер: ${sizeName}\n` +
                    `🛡 Материал: ${materialName}\n` +
                    `🔥 Печь: ${stoveName}\n` +
                    `✨ Отделка: ${finishName}\n` +
                    `🪜 Лестница: ${ladderName}\n` +
                    `💨 Дымоход: ${chimneyName}\n` +
                    `➕ Дополнительно: ${extrasNames || 'Нет'}\n\n` +
                    `💰 Сумма заказа: ${this.formatPrice(this.totalPrice)}`;
            }


            // 3. Отправка на Webhook
            const webhookUrl = 'https://kuklin2022.app.n8n.cloud/webhook-test/test';

            try {
                // Показываем лоадер
                if (tg?.MainButton) tg.MainButton.showProgress();

                // ИСПОЛЬЗУЕМ mode: 'no-cors' для обхода ошибки "Load failed" (CORS)
                await fetch(webhookUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(orderPayload)
                });

                if (tg?.MainButton) tg.MainButton.hideProgress();

                console.log('Webhook sent (no-cors mode)');

                // --- ЛОГИКА ОТКРЫТИЯ ЧАТА (ДУБЛИРОВАНИЕ) ---
                if (tg && tg.showPopup) {
                    tg.showPopup({
                        title: 'Расчет готов! 🔥',
                        message: 'Данные сохранены. Нажмите OK, чтобы перейти в чат и подтвердить заказ менеджеру.',
                        buttons: [{ type: 'ok', id: 'ok' }]
                    }, (buttonId) => {
                        // После нажатия ОК открываем чат
                        if (this.isTelegram) {
                            const url = `https://t.me/ivan_ural_chan?text=${encodeURIComponent(textMessage)}`;
                            window.Telegram.WebApp.openTelegramLink(url);
                        } else {
                            window.open(`https://t.me/ivan_ural_chan?text=${encodeURIComponent(textMessage)}`, '_blank');
                        }

                        // Если это была корзина - очищаем её после заказа
                        if (fromCart) {
                            this.cart = [];
                            this.saveCart();
                            this.showCartModal = false;
                        }
                    });
                } else {
                    alert('Расчет сохранен! Переходим в чат для оформления...');
                    window.open(`https://t.me/ivan_ural_chan?text=${encodeURIComponent(textMessage)}`, '_blank');
                    if (fromCart) {
                        this.cart = [];
                        this.saveCart();
                        this.showCartModal = false;
                    }
                }

            } catch (error) {
                console.error('Webhook Error:', error);
                if (tg?.MainButton) tg.MainButton.hideProgress();

                // Показываем полные технические детали (как просил пользователь)
                alert(`⚠️ Ошибка отправки!\n\nName: ${error.name}\nMessage: ${error.message}\n\nПожалуйста, сделайте скриншот и отправьте разработчику.`);
            }
        },

        updateUrl() {
            if (this.isRestoringUrl) return; // Не обновляем URL пока восстанавливаемся

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

            // Возвращаем полный абсолютный URL для копирования
            return `${window.location.origin}${newUrl}`;
        },

        loadFromUrl() {
            this.isRestoringUrl = true; // Блокируем обновление URL
            alert('Debug: Start Loading URL. Search: ' + window.location.search); // DEBUG

            // 1. Попытка загрузить из Deep Link (start_param) - для поддержки старых ссылок
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
                    return; // Успех
                } catch (e) {
                    console.error('Deep link error:', e);
                }
            }

            // 2. Fallback: Обычные GET-параметры (s, m, st...)
            const params = new URLSearchParams(window.location.search);
            // Считываем параметры
            if (params.has('s')) {
                alert('Debug: Found Size ' + params.get('s')); // DEBUG
                this.selectedSizeId = params.get('s');
            }

            // Если есть размер, считываем остальное
            if (this.selectedSizeId) {
                if (params.has('m')) this.selectedMaterialId = params.get('m');
                if (params.has('st')) this.selectedStoveId = params.get('st');
                if (params.has('f')) this.selectedFinishId = params.get('f');
                if (params.has('l')) this.selectedLadderId = params.get('l');
                if (params.has('c')) this.selectedChimneyId = params.get('c');
                if (params.has('e')) this.selectedExtrasIds = params.get('e').split(',');
            }
            this.isRestoringUrl = false; // Разблокируем обновление
        },

        shareConfig() {
            const url = this.updateUrl(); // Обновляем и берем текущую ссылку
            const title = 'Мой банный чан';
            // Безопасная проверка на наличие selectedSize (вдруг share нажали на заглушке)
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
    }));
});
