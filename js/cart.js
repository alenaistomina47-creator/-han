document.addEventListener('alpine:init', () => {
    Alpine.store('cart', {
        items: [],

        init() {
            // Load from localStorage
            const saved = localStorage.getItem('chan_cart');
            if (saved) {
                try {
                    this.items = JSON.parse(saved);
                } catch (e) {
                    console.error('Error loading cart', e);
                    this.items = [];
                }
            }
        },

        addItem(item) {
            this.items.push(item);
            this.save();
        },

        removeItem(index) {
            this.items.splice(index, 1);
            this.save();
        },

        clear() {
            this.items = [];
            this.save();
        },

        save() {
            localStorage.setItem('chan_cart', JSON.stringify(this.items));
        },

        get count() {
            return this.items.length;
        },

        get total() {
            return this.items.reduce((sum, item) => sum + item.price.total, 0);
        },

        // Format Helper (duplicated from utils or store, but useful here if self-contained)
        formatPrice(price) {
            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                maximumFractionDigits: 0
            }).format(price);
        },

        // --- CHECKOUT LOGIC ---
        // Accepts an optional "activeDraft" (the item currently in the calculator)
        // If activeDraft is provided, it is included in the order.
        async checkout(activeDraft = null, isTelegram = false) {
            const tg = window.Telegram?.WebApp;
            const user = tg?.initDataUnsafe?.user || {};

            // 1. Combine Items (Cart + Draft)
            const allItems = [...this.items];
            if (activeDraft) {
                allItems.push(activeDraft);
            }

            if (allItems.length === 0) {
                alert('Корзина пуста!');
                return;
            }

            const grandTotal = allItems.reduce((sum, item) => sum + item.price.total, 0);

            // 2. Prepare Payload
            const orderPayload = {
                type: 'full_order',
                order_id: `order_${Date.now()}`,
                timestamp: new Date().toISOString(),
                user: user,
                items: allItems.map((item, i) => ({
                    index: i + 1,
                    summary: item.ui_title,
                    details: item.data,
                    price: item.price.total
                })),
                total_price: {
                    value: grandTotal,
                    formatted: this.formatPrice(grandTotal)
                }
            };

            // 3. Generate Text Message
            let textMessage = `🛒 *НОВЫЙ ЗАКАЗ*\n`;
            textMessage += `👤 Клиент: ${user.first_name || 'Неизвестно'} ${user.username ? '@' + user.username : ''}\n\n`;

            allItems.forEach((item, i) => {
                textMessage += `*Позиция #${i + 1}* — ${this.formatPrice(item.price.total)}\n`;
                textMessage += `🔹 ${item.ui_title}\n`;
                textMessage += `   Размер: ${item.data.size}\n`;
                textMessage += `   Материал: ${item.data.material}\n`;
                textMessage += `   Печь: ${item.data.stove}\n`;
                textMessage += `   Отделка: ${item.data.finish}\n`;
                textMessage += `   Допы: ${item.data.extras || 'Нет'}\n`;
                textMessage += `------------------\n`;
            });
            textMessage += `\n💰 *ИТОГО: ${this.formatPrice(grandTotal)}*`;

            // 4. Send Webhook
            const webhookUrl = 'https://kuklin2022.app.n8n.cloud/webhook-test/test';

            try {
                if (tg?.MainButton) tg.MainButton.showProgress();

                await fetch(webhookUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(orderPayload)
                });

                if (tg?.MainButton) tg.MainButton.hideProgress();
                console.log('Webhook sent (cart module)');

                // 5. Handle Success / Clear Cart
                const onSuccess = () => {
                    const url = `https://t.me/ivan_ural_chan?text=${encodeURIComponent(textMessage)}`;
                    if (isTelegram) window.Telegram.WebApp.openTelegramLink(url);
                    else window.open(url, '_blank');

                    this.clear(); // Clear cart after success
                };

                if (tg && tg.showPopup) {
                    tg.showPopup({
                        title: 'Заказ оформлен!',
                        message: 'Данные отправлены. Перейдите в чат для подтверждения.',
                        buttons: [{ type: 'ok', id: 'ok' }]
                    }, () => onSuccess());
                } else {
                    alert('Заказ отправлен! Переходим в чат...');
                    onSuccess();
                }

                return true; // Signal success

            } catch (error) {
                console.error('Cart Checkout Error:', error);
                if (tg?.MainButton) tg.MainButton.hideProgress();
                alert(`Ошибка отправки: ${error.message}`);
                return false;
            }
        }
    });
});
