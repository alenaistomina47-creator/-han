document.addEventListener('alpine:init', () => {
    Alpine.data('calculator', () => ({
        // Состояние
        selectedSizeId: 'small',
        selectedMaterialId: 'aisi430',
        selectedStoveId: null,
        selectedFinishId: null,
        selectedLadderId: null, // Будет установлено в init
        selectedChimneyId: null, // Будет установлено в init
        selectedExtrasIds: [], // Остальные допы
        isTelegram: false, // Флаг запуска внутри Telegram

        // Вкладки визуализации
        activeTab: 'outside', // 'outside', 'inside', 'desc'
        showPriceModal: false, // Модалка детализации цены
        isVisualizerMinimized: false, // Свернут ли визуализатор (для мобилок)

        // Инициализация
        init() {
            console.log('Калькулятор запущен.');

            // Авто-сворачивание визуализатора при скролле
            window.addEventListener('scroll', () => {
                // Если прокрутили больше 50px - сворачиваем, если вернулись наверх - разворачиваем
                this.isVisualizerMinimized = window.scrollY > 50;
            });

            if (typeof appData !== 'undefined') {
                if (appData.sizes?.length) this.selectedSizeId = appData.sizes[0].id;
                // if (appData.stoves?.length) this.selectedStoveId = appData.stoves[0].id;
                // if (appData.finishes?.length) this.selectedFinishId = appData.finishes[0].id;

                // Инициализация лестницы и дымохода - НЕ выбираем по умолчанию
                // this.selectedLadderId = null; 
                // this.selectedChimneyId = null;


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
                // --- URL STATE SYNC END ---

                // Инициализация Telegram Mini App
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
                    this.isTelegram = true;
                    const tg = window.Telegram.WebApp;
                    tg.ready();
                    tg.expand(); // На весь экран

                    // Настройка главной кнопки
                    tg.MainButton.setText(`ЗАФИКСИРОВАТЬ: 0 ₽`); // Начальный текст
                    tg.MainButton.setParams({
                        color: '#5fb856', // Наш зеленый цвет
                        text_color: '#ffffff'
                    });

                    // Показываем кнопку сразу
                    tg.MainButton.show();

                    // Обработка клика
                    tg.MainButton.onClick(() => {
                        this.sendToTelegram();
                    });

                    // Обновляем текст кнопки при изменении цены
                    this.$watch('totalPrice', (val) => {
                        tg.MainButton.setText(`ЗАФИКСИРОВАТЬ: ${this.formatPrice(val)}`);
                    });
                    // Инициализируем с корректной ценой
                    setTimeout(() => {
                        tg.MainButton.setText(`ЗАФИКСИРОВАТЬ: ${this.formatPrice(this.totalPrice)}`);
                    }, 500);
                }


                // Business Logic: Если выбрана сэндвич-труба, убираем защиту дымохода
                this.$watch('selectedChimneyId', (val) => {
                    if (val === 'pipe_sandwich') {
                        this.selectedExtrasIds = this.selectedExtrasIds.filter(id => id !== 'protection');
                    }
                });

                // Business Logic: Внешняя отделка несовместима с Деревянной лестницей и Термометром
                this.$watch('selectedExtrasIds', (val) => {
                    if (val.includes('rim_finish')) {
                        // Убираем термометр
                        if (val.includes('thermometer')) {
                            this.selectedExtrasIds = val.filter(id => id !== 'thermometer');
                        }
                        // Сбрасываем деревянную лестницу
                        if (this.selectedLadderId === 'stairs_wood') {
                            this.selectedLadderId = null;
                        }
                    }
                });

                // Watcher для лестницы (bidirectional check optional, but good for UI consistency)
                this.$watch('selectedLadderId', (val) => {
                    if (val === 'stairs_wood' && this.selectedExtrasIds.includes('rim_finish')) {
                        // Если выбрали деревянную лестницу, убираем внешнюю отделку? 
                        // Или запрещаем? User said "When Finish is selected, cannot select Ladder".
                        // Let's remove Finish to be safe/reactive
                        this.selectedExtrasIds = this.selectedExtrasIds.filter(id => id !== 'rim_finish');
                    }
                });


                // Business Logic: Джакузи и Внешняя отделка доступны только для печи с водяной рубашкой
                this.$watch('selectedStoveId', (val) => {
                    // Если выбрана НЕ водяная рубашка, убираем джакузи и внешнюю отделку
                    if (val && val !== 'jacket') {
                        this.selectedExtrasIds = this.selectedExtrasIds.filter(id => id !== 'jacuzzi' && id !== 'rim_finish');
                    }
                });
            }
        },

        // Геттеры сущностей
        get selectedSize() { return appData.sizes.find(s => s.id === this.selectedSizeId) || appData.sizes[0]; },
        get selectedStove() { return appData.stoves.find(s => s.id === this.selectedStoveId) || appData.stoves[0]; },
        get selectedFinish() { return appData.finishes.find(f => f.id === this.selectedFinishId) || appData.finishes[0]; },
        get selectedLadder() { return appData.extras.find(e => e.id === this.selectedLadderId) || null; },
        get selectedChimney() { return appData.extras.find(e => e.id === this.selectedChimneyId) || null; },

        // Списки для выпадающих списков
        get ladders() { return appData.extras.filter(e => e.type === 'stairs'); },
        get chimneys() { return appData.extras.filter(e => e.type === 'pipe'); },
        get otherExtras() { return appData.extras.filter(e => !e.type); }, // Те, у которых нет типа (остальные)

        // Материалы для текущего размера
        get currentMaterials() {
            const prices = appData.materials[this.selectedSizeId];
            if (!prices) return [];
            return [
                { id: 'aisi430', name: 'AISI 430 (Техническая)', price: prices.aisi430 },
                { id: 'aisi304', name: 'AISI 304 (Пищевая)', price: prices.aisi304 }
            ];
        },
        get selectedMaterial() {
            return this.currentMaterials.find(m => m.id === this.selectedMaterialId) || this.currentMaterials[0];
        },

        // Хелперы
        formatPrice(price) { return price.toLocaleString('ru-RU') + ' ₽'; },
        formatOriginalPrice(price) { return Math.round(price * 1.3).toLocaleString('ru-RU') + ' ₽'; },
        // Хелпер: картинка материала (наложение)
        getMaterialOverlay() {
            const materialId = this.selectedMaterialId;
            const sizeId = this.selectedSizeId;
            // Здесь мы используем imageOverlay из мапинга (если бы он был)
            // Но пока у нас структура простая. Предположим, что overlay зависит от материала.
            // В data.js у нас materials просто цены. А overlay картинка...
            // В прошлой итерации мы искали aisi430_result.webp. 
            // Давайте сделаем просто: вернем картинку по ID материала, если она есть.
            // Примечание: в текущем data.js нет mapping для overlay, но есть materialMetadata?
            // Проверим data.js
            if (appData.materialMetadata && appData.materialMetadata[materialId]) {
                return appData.materialMetadata[materialId].overlayImage || null;
            }
            return null;
        },

        getBaseImage() {
            const materialId = this.selectedMaterialId;
            const metadata = appData.materialMetadata ? appData.materialMetadata[materialId] : null;

            // Fallback if no metadata
            if (!metadata) return 'https://i.1.creatium.io/disk2/b7/67/b3/42079feb0e160e1182d325c2db6f527181/aysi304_result.webp';

            if (this.activeTab === 'inside') {
                return metadata.imageInside || metadata.image;
            }
            return metadata.image;
        },

        // Предзагрузка
        preloadImages() {
            const images = [];
            const pushImg = (url) => url && images.push(url);

            if (appData.materialMetadata) {
                Object.values(appData.materialMetadata).forEach(m => {
                    pushImg(m.image);
                    pushImg(m.imageInside);
                });
            }

            appData.stoves.forEach(i => pushImg(i.image));
            appData.finishes.forEach(i => pushImg(i.image));
            appData.extras.forEach(i => pushImg(i.image));
        },

        // Расчет цены
        get totalPrice() {
            let total = 0;

            // 1. Материал
            if (appData.materials[this.selectedSizeId]) {
                total += appData.materials[this.selectedSizeId][this.selectedMaterialId] || 0;
            }

            // 2. Печь
            if (this.selectedStove) {
                total += this.selectedStove.price || 0;
            }

            // 3. Отделка
            if (this.selectedFinish && this.selectedFinish.price) {
                if (typeof this.selectedFinish.price === 'object') {
                    total += this.selectedFinish.price[this.selectedSizeId] || 0;
                } else {
                    total += this.selectedFinish.price || 0;
                }
            }

            // 4. Лестница
            if (this.selectedLadder) total += this.selectedLadder.price || 0;

            // 5. Дымоход
            if (this.selectedChimney) total += this.selectedChimney.price || 0;

            // 6. Остальные допы
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
            const url = this.updateUrl(); // Ensure URL is latest
            const title = 'Мой банный чан';
            const text = `Посмотри, какой чан я собрал(а): ${this.selectedSize.name}, ${this.selectedStove.name}`;

            if (navigator.share) {
                navigator.share({ title, text, url })
                    .catch((error) => console.log('Error sharing', error));
            } else {
                navigator.clipboard.writeText(url).then(() => {
                    alert('Ссылка скопирована! Отправьте её другу.');
                });
            }
        }
    }));
});
