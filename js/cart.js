try {
    document.addEventListener('alpine:init', () => {
        try {
            Alpine.store('cart', {
                items: [],

                init() {
                    console.log('Cart Store Initializing...');
                    // Load from localStorage
                    const saved = localStorage.getItem('chan_cart');
                    if (saved) {
                        try {
                            this.items = JSON.parse(saved);
                            console.log('Cart loaded:', this.items.length, 'items');
                        } catch (e) {
                            console.error('Error loading cart JSON', e);
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
                    try {
                        localStorage.setItem('chan_cart', JSON.stringify(this.items));
                    } catch (e) {
                        console.error('Error saving cart', e);
                    }
                },

                get count() {
                    return this.items.length;
                },

                get total() {
                    return this.items.reduce((sum, item) => sum + (item.price?.total || 0), 0);
                },

                // Format Helper
                formatPrice(price) {
                    return new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                        maximumFractionDigits: 0
                    }).format(price);
                },

                // --- CHECKOUT LOGIC ---
                async checkout(activeDraft = null, isTelegram = false) {
                    try {
                        const tg = window.Telegram?.WebApp;
                        const user = tg?.initDataUnsafe?.user || {};

                        // 1. Combine Items
                        const allItems = [...this.items];
                        if (activeDraft) {
                            allItems.push(activeDraft);
                        }

                        if (allItems.length === 0) {
                            alert('Корзина пуста!');
                            return false;
                        }

                        const grandTotal = allItems.reduce((sum, item) => sum + (item.price?.total || 0), 0);

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
                                price: item.price?.total || 0
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
                            textMessage += `*Позиция #${i + 1}* — ${this.formatPrice(item.price?.total || 0)}\n`;
                            textMessage += `🔹 ${item.ui_title}\n`;
                            textMessage += `   Размер: ${item.data?.size || '?'}\n`;
                            // Optional details
                            if (item.data?.stove) textMessage += `   Печь: ${item.data.stove}\n`;
                            if (item.data?.finish) textMessage += `   Отделка: ${item.data.finish}\n`;
                            textMessage += `------------------\n`;
                        });
                        textMessage += `\n💰 *ИТОГО: ${this.formatPrice(grandTotal)}*`;

                        // 4. Send Webhook
                        const webhookUrl = 'https://kuklin2022.app.n8n.cloud/webhook-test/test';

                        if (tg?.MainButton) tg.MainButton.showProgress();

                        await fetch(webhookUrl, {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: { 'Content-Type': 'text/plain' },
                            body: JSON.stringify(orderPayload)
                        });

                        if (tg?.MainButton) tg.MainButton.hideProgress();
                        console.log('Webhook sent');

                        // 5. Handle Success
                        const onSuccess = () => {
                            const url = `https://t.me/ivan_ural_chan?text=${encodeURIComponent(textMessage)}`;
                            if (isTelegram && window.Telegram?.WebApp?.openTelegramLink) {
                                window.Telegram.WebApp.openTelegramLink(url);
                            } else {
                                window.open(url, '_blank');
                            }
                            this.clear();
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

                        return true;

                    } catch (error) {
                        console.error('Checkout Error:', error);
                        alert(`Ошибка отправки: ${error.message}`);
                        return false;
                    }
                }
            });
            console.log('Cart Store Registered Successfully');
        } catch (innerError) {
            console.error('Error identifying Alpine', innerError);
            alert('Alpine Init Error: ' + innerError.message);
        }
    });
} catch (globalError) {
    alert('Global Cart Script Error: ' + globalError.message);
}
