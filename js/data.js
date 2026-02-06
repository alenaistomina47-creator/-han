// Все данные калькулятора (Data-Driven подход)
const appData = {
    sizes: [
        { id: 'small', name: 'Малый (170 см)', people: '2-4 чел', image: 'https://i.1.creatium.io/disk2/b7/67/b3/42079feb0e160e1182d325c2db6f527181/aysi304_result.webp', imageInside: 'https://i.1.creatium.io/disk2/ea/63/72/53ba66df206714cb5682424a35405569a4/vverh_aysi304_result.webp' },
        { id: 'medium', name: 'Средний (200 см)', people: '4-6 чел', image: 'https://i.1.creatium.io/disk2/b7/67/b3/42079feb0e160e1182d325c2db6f527181/aysi304_result.webp', imageInside: 'https://i.1.creatium.io/disk2/ea/63/72/53ba66df206714cb5682424a35405569a4/vverh_aysi304_result.webp' },
        { id: 'large', name: 'Большой (230 см)', people: '6-10 чел', image: 'https://i.1.creatium.io/disk2/b7/67/b3/42079feb0e160e1182d325c2db6f527181/aysi304_result.webp', imageInside: 'https://i.1.creatium.io/disk2/ea/63/72/53ba66df206714cb5682424a35405569a4/vverh_aysi304_result.webp' }
    ],
    // Метаданные материалов (картинки)
    materialMetadata: {
        aisi430: {
            name: 'AISI 430 (Техническая)',
            image: 'https://i.1.creatium.io/disk2/b7/67/b3/42079feb0e160e1182d325c2db6f527181/aysi304_result.webp',
            imageInside: 'https://i.1.creatium.io/disk2/ea/63/72/53ba66df206714cb5682424a35405569a4/vverh_aysi304_result.webp',
            description: 'Чан из этой стали надежен и прослужит до 15 лет. Требует обработки швов минимум 1 раз в два месяца.',
            life: 'СРОК СЛУЖБЫ 15 ЛЕТ'
        },
        aisi304: {
            name: 'AISI 304 (Пищевая)',
            image: 'https://i.1.creatium.io/disk2/b7/67/b3/42079feb0e160e1182d325c2db6f527181/aysi304_result.webp',
            imageInside: 'https://i.1.creatium.io/disk2/ea/63/72/53ba66df206714cb5682424a35405569a4/vverh_aysi304_result.webp',
            description: 'Чан из этой нержавеющей стали прослужит более 30 лет. Он не требует специального ухода и не подвержен коррозии.',
            life: 'СРОК СЛУЖБЫ 30+ ЛЕТ'
        }
    },
    // Цены материалов (зависят от размера)
    materials: {
        small: { aisi430: 69000, aisi304: 93000 },
        medium: { aisi430: 80500, aisi304: 107950 },
        large: { aisi430: 116000, aisi304: 150500 }
    },
    stoves: [
        { id: 'stand', name: 'Подставка (без печи)', price: 10200, image: 'https://i.1.creatium.io/disk2/77/b3/d8/353e905bc23d7489b1d1399842f5a7c48f/podstavka_result.webp', zIndex: 5 },
        { id: 'wind', name: 'Ветрозащита', price: 26300, image: 'https://i.1.creatium.io/disk2/09/8e/c1/538b956b9f526cf7bf80898a5d815bbfd6/vindgard_result.webp', zIndex: 5 },
        { id: 'simple', name: 'Печь-подставка', price: 38950, image: 'https://i.1.creatium.io/disk2/b4/31/61/bd99e3a713ad36d9d5f537b0e90c447853/pech_podstavka_result.webp', zIndex: 5 },
        { id: 'welded_430', name: 'Печь приварная (AISI 430)', price: 48000, image: 'https://i.1.creatium.io/disk2/89/f1/c6/e8339e162a5e77541df28eab6fae9bafa7/vodyanaya_result.webp', zIndex: 5 },
        { id: 'welded_304', name: 'Печь приварная (AISI 304)', price: 57200, image: 'https://i.1.creatium.io/disk2/89/f1/c6/e8339e162a5e77541df28eab6fae9bafa7/vodyanaya_result.webp', zIndex: 5 },
        { id: 'jacket', name: 'С водяной рубашкой', price: 97450, image: 'https://i.1.creatium.io/disk2/89/f1/c6/e8339e162a5e77541df28eab6fae9bafa7/vodyanaya_result.webp', zIndex: 5 }
    ],
    finishes: [
        { id: 'min', name: 'Минимум', price: { small: 19400, medium: 19400, large: 24000 }, image: 'https://i.1.creatium.io/disk2/89/cd/95/30c96399ab24a35874c4c9e5efd305795e/otdelka_minimum_result.webp', imageInside: 'https://i.1.creatium.io/disk2/02/13/08/5bb366dcaccb9f7066864ab224e360185d/vverh_minimum_result.webp', zIndex: 15 },
        { id: 'std', name: 'Стандарт', price: { small: 27450, medium: 27450, large: 33200 }, image: 'https://i.1.creatium.io/disk2/32/79/90/04cabe0cc0e3be78c1814fe5e723453d6e/otdelka_srednyaya_result.webp', imageInside: 'https://i.1.creatium.io/disk2/36/8e/c4/8d2b3383f58194b2ab6e7cd033b6e6b692/vverh_standart_result.webp', zIndex: 15 },
        { id: 'max', name: 'Максимум', price: { small: 38950, medium: 38950, large: 49300 }, image: 'https://i.1.creatium.io/disk2/42/ae/47/8124e9442d699a01dc439962ec3f1d0607/otdelka_maksimum_result.webp', imageInside: 'https://i.1.creatium.io/disk2/96/9b/f4/4a0fa0db35a35941ca508020dcc87f286e/vverh_maksimum_result.webp', zIndex: 15 }
    ],
    extras: [
        { id: 'stairs_wood', name: 'Лестница дерево', price: 10200, image: 'https://i.1.creatium.io/disk2/e0/0b/3f/6d68b442326ca542ea325b9e367a6622a2/lestnica_derevo_result.webp', type: 'stairs', zIndex: 30 },
        { id: 'stairs_metal', name: 'Лестница металл', price: 18250, image: 'https://i.1.creatium.io/disk2/b4/47/90/bc71b75a0b49f60c88ba8226c1ba45e573/lestnica_s_ploshadkoy_result.webp', type: 'stairs', zIndex: 8 },
        { id: 'lid', name: 'Крышка чана', price: 19400, image: 'https://i.1.creatium.io/disk2/48/ed/a5/4b90aa9d0cfbc75e06d394990323c172ec/krishka_result.webp', imageInside: 'https://i.1.creatium.io/disk2/e3/d5/33/a24bec5770dd3e9554eb1ec0b2565e279f/vverh_krishka_result.webp', zIndex: 50 },
        { id: 'pipe', name: 'Труба простая', price: 10000, image: 'https://i.1.creatium.io/disk2/a5/2d/c0/b5417b7c7ce47d64d8935a9bfc47619313/truba_obichnaya_result.webp', type: 'pipe', zIndex: 1 },
        { id: 'pipe_sandwich', name: 'Труба сэндвич', price: 23000, image: 'https://i.1.creatium.io/disk2/66/8f/94/65ea8886a969e77cd2f9800eea459de49a/truba_sendvich_result.webp', type: 'pipe', zIndex: 1 },
        { id: 'protection', name: 'Защита дымохода', price: 3450, image: 'https://i.1.creatium.io/disk2/4e/3f/1c/7d733b24ca08f23acd488a3e9de1f168c3/zashita_trubi_result.webp', zIndex: 25 },
        { id: 'table_central', name: 'Центральный столик', price: 8500, image: 'https://i.1.creatium.io/disk2/6b/d4/03/5e1b82338f81a1b2c22242bb7fc37cd769/centralniy_stolik_result.webp', imageInside: 'https://i.1.creatium.io/disk2/f2/b6/68/10684600f9e1b967af7c35a737abac03a2/vverh_stol_centr_result.webp', zIndex: 35 },
        { id: 'table_side', name: 'Боковой столик', price: 6900, image: 'https://i.1.creatium.io/disk2/39/00/f8/8bae7451b67202e023ea2b18db5ecde1c2/stol_bokovoy_result.webp', zIndex: 35 },
        { id: 'light', name: 'Подсветка (LED)', price: 35500, image: 'https://i.1.creatium.io/disk2/f3/31/b1/f5f7dc8367bd44671c007465af094546ff/effekt_osveshennosti_result.webp', zIndex: 40 },
        { id: 'jacuzzi', name: 'Джакузи', price: 100000, image: 'https://i.1.creatium.io/disk2/3d/b8/d5/030e509716dfdac4c454b4f0befb81c984/djakuzi_result.webp', imageInside: 'https://i.1.creatium.io/disk2/63/2f/10/59b5e3e0e7208302646571f84dbbddc4c5/vverh_djakuzi_result.webp', zIndex: 26 },
        { id: 'rim_finish', name: 'Внешняя отделка', price: 40000, image: 'https://i.1.creatium.io/disk2/c7/df/2c/caf07544b68c2c06b933718764f7a2d434/vneshnyaya_otdelka_vverh_result.webp', zIndex: 45 },
        { id: 'thermometer', name: 'Водяной термометр', price: 5750, image: 'https://i.1.creatium.io/disk2/00/e2/46/7f9ee3b743b6d97127417b489d7f1af079/termometr.png', zIndex: 70 }
    ]
};
