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
        // 'calculator' | 'cart'
        currentView: 'calculator',
        isVisualizerMinimized: false,
        isRestoringUrl: false,

        // Синхронизация (Abandoned Cart)
        syncTimeout: null,
        isSyncing: false,
        isLoading: true, // Состояние загрузки изображений

        // WEBHOOK URL
        webhookUrl: 'https://kuklin2022.app.n8n.cloud/webhook/save-cart',


        // Инициализация
        init() {
            console.log('Калькулятор запущен.');

            window.addEventListener('scroll', () => {
                this.isVisualizerMinimized = window.scrollY > 50;
            });

            if (typeof appData !== 'undefined') {
                this.preloadImages();

                // 1. Попытка восстановить из LocalStorage
                if (window.location.search.length < 2) {
                    this.loadFromLocalStorage();
                }

                // 2. Затем из URL (приоритет URL выше)
                this.loadFromUrl();

                // Watchers for URL update & Sync & LocalStorage
                const logChange = (field) => console.log(`[Store] Changed: ${field}, triggering sync...`);

                this.$watch('selectedSizeId', () => { logChange('size'); this.updateUrl(); this.triggerSync(); this.saveToLocalStorage(); });
                this.$watch('selectedMaterialId', () => { this.updateUrl(); this.triggerSync(); this.saveToLocalStorage(); });
                this.$watch('selectedStoveId', () => { this.updateUrl(); this.triggerSync(); this.saveToLocalStorage(); });
                this.$watch('selectedFinishId', () => { this.updateUrl(); this.triggerSync(); this.saveToLocalStorage(); });
                this.$watch('selectedLadderId', () => { this.updateUrl(); this.triggerSync(); this.saveToLocalStorage(); });
                this.$watch('selectedChimneyId', () => { this.updateUrl(); this.triggerSync(); this.saveToLocalStorage(); });
                this.$watch('selectedExtrasIds', () => { this.updateUrl(); this.triggerSync(); this.saveToLocalStorage(); });

                // Scroll to top on view change
                this.$watch('currentView', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

                // Telegram Init
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
                    this.isTelegram = true;
                    const tg = window.Telegram.WebApp;
                    tg.ready();
                    tg.expand();

                    // Explicitly hide native button
                    tg.MainButton.hide();
                    tg.MainButton.isVisible = false;

                    // Analytics: App Open
                    this.sendAppOpenEvent();
                }

                // Business Logic Watchers
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
            if (!this.selectedSizeId) return null;
            if (this.selectedSize && this.selectedSize.image) {
                return null;
            }
            return null;
        },

        async preloadImages() {
            this.isLoading = true;
            const images = [];

            appData.sizes.forEach(s => { if (s.image) images.push(s.image); if (s.imageInside) images.push(s.imageInside); });
            appData.stoves.forEach(s => { if (s.image) images.push(s.image); });
            appData.finishes.forEach(s => { if (s.image) images.push(s.image); if (s.imageInside) images.push(s.imageInside); });
            appData.extras.forEach(s => { if (s.image) images.push(s.image); if (s.imageInside) images.push(s.imageInside); });
            Object.values(appData.materialMetadata).forEach(m => { if (m.overlayImage) images.push(m.overlayImage); });

            const promises = images.map(src => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            });

            await Promise.all(promises);
            this.isLoading = false;
            console.log('Images preloaded');
        },

        saveToLocalStorage() {
            const state = {
                s: this.selectedSizeId,
                m: this.selectedMaterialId,
                st: this.selectedStoveId,
                f: this.selectedFinishId,
                l: this.selectedLadderId,
                c: this.selectedChimneyId,
                e: this.selectedExtrasIds
            };
            localStorage.setItem('chan_config', JSON.stringify(state));
        },

        loadFromLocalStorage() {
            const saved = localStorage.getItem('chan_config');
            if (saved) {
                try {
                    const state = JSON.parse(saved);
                    if (state.s) this.selectedSizeId = state.s;
                    if (state.m) this.selectedMaterialId = state.m;
                    if (state.st) this.selectedStoveId = state.st;
                    if (state.f) this.selectedFinishId = state.f;
                    if (state.l) this.selectedLadderId = state.l;
                    if (state.c) this.selectedChimneyId = state.c;
                    if (state.e) this.selectedExtrasIds = state.e;
                    console.log('Restored from LocalStorage');
                } catch (e) {
                    console.error('LS Error', e);
                }
            }
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
            // Extras
            if (this.selectedLadder) total += this.selectedLadder.price || 0;
            if (this.selectedChimney) total += this.selectedChimney.price || 0;
            this.selectedExtrasIds.forEach(id => {
                const extra = appData.extras.find(e => e.id === id);
                if (extra) total += extra.price || 0;
            });
            return total;
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

            const stove = appData.stoves.find(s => s.id === this.selectedStoveId);
            if (stove) details.push({ name: stove.name, price: stove.price || 0 });

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

            const ladder = appData.extras.find(e => e.id === this.selectedLadderId);
            if (ladder) details.push({ name: ladder.name, price: ladder.price || 0 });

            const chimney = appData.extras.find(e => e.id === this.selectedChimneyId);
            if (chimney) details.push({ name: chimney.name, price: chimney.price || 0 });

            this.selectedExtrasIds.forEach(id => {
                const extra = appData.extras.find(e => e.id === id);
                if (extra) details.push({ name: extra.name, price: extra.price || 0 });
            });

            return details;
        },

        get discountedPrice() { return this.totalPrice; },
        get originalPrice() { return Math.round(this.totalPrice * 1.3); },

        sendToTelegram() {
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

            const text = `🔥 Новый заказ! (из 3D калькулятора)\n\n` +
                `📏 Размер: ${sizeName}\n` +
                `🛡 Материал: ${materialName}\n` +
                `🔥 Печь: ${stoveName}\n` +
                `✨ Отделка: ${finishName}\n` +
                `🪜 Лестница: ${ladderName}\n` +
                `💨 Дымоход: ${chimneyName}\n` +
                `➕ Дополнительно: ${extrasNames || 'Нет'}\n\n` +
                `💰 Сумма заказа: ${this.formatPrice(this.totalPrice)}`;

            if (this.isTelegram) {
                // Fix: Use tg://resolve for reliable in-app chat opening
                const tgUrl = `tg://resolve?domain=ivan_ural_chan&text=${encodeURIComponent(text)}`;
                try {
                    window.Telegram.WebApp.openTelegramLink(tgUrl);
                } catch (e) {
                    console.error('TG Link Error:', e);
                    window.open(`https://t.me/ivan_ural_chan?text=${encodeURIComponent(text)}`, '_blank');
                }
            } else {
                navigator.clipboard.writeText(text).then(() => {
                    alert('Заказ скопирован! Открываю чат с менеджером...');
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
                } catch (e) { console.error('Deep link error:', e); }
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
        },

        // --- AUTOSAVE CART ---
        triggerSync() {
            console.log('[Store] triggerSync called. Size:', this.selectedSizeId);
            if (!this.selectedSizeId) {
                console.log('[Store] No size selected, skipping.');
                return;
            }

            if (this.syncTimeout) clearTimeout(this.syncTimeout);

            this.syncTimeout = setTimeout(() => {
                console.log('[Store] Debounce passed. Sending...');
                this.sendToWebhook();
            }, 2000);
        },

        sendToWebhook() {
            if (!this.webhookUrl) {
                console.error('[Store] Webhook URL missing!');
                return;
            }

            console.log('[Store] Preparing data...');
            const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'unknown';

            const sizeName = this.selectedSize ? this.selectedSize.name : '';
            const materialName = this.selectedMaterial ? this.selectedMaterial.name : '';
            const stoveName = this.selectedStove ? this.selectedStove.name : '';
            const finishName = this.selectedFinish ? this.selectedFinish.name : '';
            const ladderName = this.selectedLadder ? this.selectedLadder.name : '';
            const chimneyName = this.selectedChimney ? this.selectedChimney.name : '';

            const extrasNames = this.selectedExtrasIds.map(id => {
                const e = appData.extras.find(ext => ext.id === id);
                return e ? e.name : '';
            }).filter(Boolean).join(', ');

            const parts = [
                sizeName ? `Чан: ${sizeName} (${materialName})` : '',
                stoveName ? `Печь: ${stoveName}` : '',
                finishName ? `Отделка: ${finishName}` : '',
                ladderName ? `Лестница: ${ladderName}` : '',
                chimneyName ? `Дымоход: ${chimneyName}` : '',
                extrasNames ? `Допы: ${extrasNames}` : ''
            ].filter(Boolean);

            const cartContent = parts.join(' + ');

            const data = {
                telegram_id: telegramId,
                cart_content: cartContent,
                total_price: this.totalPrice
            };

            console.log('[Store] POST:', data);

            fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(res => {
                    if (res.ok) console.log('[Store] Autosave OK');
                    else console.error('[Store] Autosave Error:', res.status);
                })
                .catch(err => console.error('[Store] Fetch Error:', err));
        },

        sendAppOpenEvent() {
            const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            if (!userId) return;

            const url = 'https://kuklin2022.app.n8n.cloud/webhook/app-open';
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: userId, action: 'app_open' })
            }).catch(err => console.error('Analytics error:', err));
        }

    }));
});
