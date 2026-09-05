// Состояние выбранного фильтра по вместимости ('small', 'medium', 'large')
let currentCapacityFilter = 'medium';

// Карточки для категории "Малые чаны (2–3 человека)"
const SMALL_PRODUCTS = [
  {
    id: 'small-1',
    name: 'Комплект «УЧ-1» AISI 430',
    category: 'small',
    steel: 'AISI 430',
    stock: 3,
    totalStock: 6,
    oldPrice: 162626,
    newPrice: 133300,
    warranty: '7 лет',
    lifetime: '15 лет',
    gift: 'Тканевый чехол + подсветка в подарок 🎁',
    badge: '🔥 Эконом вариант',
    image: 'assets/chan_small_uch1_render.png?v=26',
    imageInterior: null,
    livePhotos: [
      'assets/chan_uch1_spec_wind.png',
      'assets/chan_uch1_spec_trim.png'
    ],
    hotspots: [],
    stove: 'Ветрозащита (без дна)',
    hideEquipmentHighlight: true,
    specs: [
      { name: 'Материал чаши', value: 'Нержавеющая сталь AISI 430' },
      { name: 'Толщина металла', value: 'Стенки 2 мм, дно 3 мм' },
      { name: 'Внутренняя отделка', value: 'Сибирская лиственница' },
      { name: 'Диаметр чаши', value: '180 см' },
      { name: 'Вместимость', value: 'На 3 человека' },
      { name: 'Тип подогрева', value: 'Ветрозащита (без дна)' },
      { name: 'Рабочий объем', value: '950 литров' },
      { name: 'Глубина чаши', value: '85 см' },
      { name: 'Срок службы', value: '15 лет' },
      { name: 'Опции комплекта', value: 'Без лестницы; Без дымохода' }
    ]
  },
  {
    id: 'small-2',
    name: 'Комплект «УЧ-2» AISI 430',
    category: 'small',
    steel: 'AISI 430',
    stock: 4,
    totalStock: 7,
    oldPrice: 183000,
    newPrice: 150000,
    warranty: '7 лет',
    lifetime: '15 лет',
    gift: 'Тканевый чехол + подсветка в подарок 🎁',
    badge: '⭐ Оптимальный выбор',
    image: 'assets/chan_small_uch2_render.png?v=31',
    imageInterior: null,
    livePhotos: [
      'assets/chan_uch2_spec_stove.png?v=11',
      'assets/chan_uch2_spec_trim.png?v=11',
      'assets/chan_uch2_spec_ladder.png?v=11',
      'assets/chan_uch2_spec_chimney.png?v=11'
    ],
    hotspots: [],
    ladder: 'Приставная деревянная лестница',
    stove: 'Печь-подставка с металлическим дном',
    hideEquipmentHighlight: true,
    specs: [
      { name: 'Материал чаши', value: 'Нержавеющая сталь AISI 430' },
      { name: 'Толщина металла', value: 'Стенки 2 мм, дно 3 мм' },
      { name: 'Внутренняя отделка', value: 'Сибирская лиственница' },
      { name: 'Диаметр чаши', value: '180 см' },
      { name: 'Вместимость', value: 'На 3 человека' },
      { name: 'Тип подогрева', value: 'Печь-подставка' },
      { name: 'Рабочий объем', value: '950 литров' },
      { name: 'Глубина чаши', value: '85 см' },
      { name: 'Срок службы', value: '15 лет' },
      { name: 'Опции комплекта', value: 'Деревянная лестница, Комплект дымохода 2.5м' }
    ]
  }
];

// Заявочные карточки и товары для категории Премиум SPA
const PREMIUM_PRODUCTS = [
  {
    id: 'premium-1',
    name: 'Комплект «УЧ-8» AISI 304',
    category: 'large',
    capacityText: 'до 6 чел.',
    steel: 'AISI 304',
    stock: 2,
    totalStock: 5,
    oldPrice: 573461,
    newPrice: 470050,
    warranty: '15 лет',
    lifetime: '30 лет',
    stoveTag: 'Печь с водяной рубашкой',
    gift: 'Тканевый чехол + подсветка в подарок 🎁',
    badge: '👑 Премиум SPA',
    image: 'assets/chan_uch7_render.png?v=35',
    imageInterior: null,
    livePhotos: [
      'assets/chan_uch8_spec_water_jacket.png',
      'assets/chan_uch8_spec_trim.png',
      'assets/chan_uch8_spec_table.png',
      'assets/chan_uch8_spec_ladder.png',
      'assets/chan_uch8_spec_chimney_sandwich.png',
      'assets/chan_uch8_spec_jacuzzi.png',
      'assets/chan_uch8_spec_lighting.png',
      'assets/chan_uch8_spec_exterior_trim.png',
      'assets/chan_uch8_spec_cover.png'
    ],
    hotspots: [],
    ladder: 'Металлическая лестница с площадкой и поручнем',
    stove: 'Печь с водяной рубашкой',
    hideEquipmentHighlight: true,
    specs: [
      { name: 'Материал чаши', value: 'Нержавеющая сталь AISI 304' },
      { name: 'Толщина металла', value: 'Стенки 2 мм, дно 3 мм' },
      { name: 'Внутренняя отделка', value: 'Сибирская лиственница' },
      { name: 'Диаметр чаши', value: '200 см' },
      { name: 'Вместимость', value: 'До 6 человек' },
      { name: 'Тип подогрева', value: 'Печь с водяной рубашкой' },
      { name: 'Рабочий объем', value: '1250 литров' },
      { name: 'Глубина чаши', value: '97 см' },
      { name: 'Срок службы', value: '30 лет' },
      { name: 'Опции комплекта', value: 'Термокрышка, Внутренняя подсветка, Центральный столик, Комплект джакузи, Внешняя отделка, Дымоход из сэндвич трубы 3 м, Металлическая лестница' }
    ]
  }
];

// БАЗА ДАННЫХ
const PRODUCTS = [
  {
    id: 1,
    name: 'Комплект «УЧ-3» AISI 430',
    category: 'summer',
    steel: 'AISI 430',
    stock: 3,
    totalStock: 6,
    oldPrice: 197640,
    newPrice: 162000,
    warranty: '7 лет',
    lifetime: '15 лет',
    gift: 'Тканевый чехол + подсветка в подарок 🎁',
    badge: '🔥🔥 Популярность',
    image: 'assets/chan_uch3_render.png?v=30',
    imageInterior: null,
    livePhotos: [
      'assets/chan_uch2_spec_stove.png?v=11',
      'assets/chan_uch2_spec_trim.png?v=11',
      'assets/chan_uch2_spec_ladder.png?v=11',
      'assets/chan_uch2_spec_chimney.png?v=11'
    ],
    hotspots: [],
    ladder: 'Приставная лестница из лиственницы с поручнями',
    stove: 'Печь-подставка с металлическим дном',
    hideEquipmentHighlight: true,
    specs: [
      { name: 'Материал чаши', value: 'Нержавеющая сталь AISI 430' },
      { name: 'Толщина металла', value: 'Стенки 2 мм, дно 3 мм' },
      { name: 'Внутренняя отделка', value: 'Сибирская лиственница' },
      { name: 'Диаметр чаши', value: '200 см' },
      { name: 'Вместимость', value: 'До 6 человек' },
      { name: 'Тип подогрева', value: 'Печь-подставка' },
      { name: 'Рабочий объем', value: '1250 литров' },
      { name: 'Глубина чаши', value: '97 см' },
      { name: 'Срок службы', value: '15 лет' },
      { name: 'Опции комплекта', value: 'Деревянная лестница, Дымоход 2.5м' }
    ]
  },
  {
    id: 2,
    name: 'Комплект «УЧ-4» AISI 304',
    category: 'summer',
    steel: 'AISI 304',
    stock: 1,
    totalStock: 5,
    oldPrice: 228750,
    newPrice: 187500,
    warranty: '15 лет',
    lifetime: '30 лет',
    gift: 'Тканевый чехол + подсветка в подарок 🎁',
    badge: '🔥🔥 Популярность',
    image: 'assets/chan_uch3_render.png?v=30',
    imageInterior: null,
    livePhotos: [
      'assets/chan_uch2_spec_stove.png?v=11',
      'assets/chan_uch2_spec_trim.png?v=11',
      'assets/chan_uch2_spec_ladder.png?v=11',
      'assets/chan_uch2_spec_chimney.png?v=11'
    ],
    hotspots: [],
    ladder: 'Приставная лестница из лиственницы с поручнями',
    stove: 'Печь-подставка с металлическим дном',
    hideEquipmentHighlight: true,
    specs: [
      { name: 'Материал чаши', value: 'Нержавеющая сталь AISI 304' },
      { name: 'Толщина металла', value: 'Стенки 2 мм, дно 3 мм' },
      { name: 'Внутренняя отделка', value: 'Сибирская лиственница' },
      { name: 'Диаметр чаши', value: '200 см' },
      { name: 'Вместимость', value: 'До 6 человек' },
      { name: 'Тип подогрева', value: 'Печь-подставка' },
      { name: 'Рабочий объем', value: '1250 литров' },
      { name: 'Глубина чаши', value: '97 см' },
      { name: 'Срок службы', value: '30 лет' },
      { name: 'Опции комплекта', value: 'Деревянная лестница, Дымоход 2.5м' }
    ]
  },
  {
    id: 4,
    name: 'Комплект «УЧ-5» AISI 430',
    category: 'summer',
    steel: 'AISI 430',
    stock: 2,
    totalStock: 5,
    oldPrice: 223626,
    newPrice: 183300,
    warranty: '7 лет',
    lifetime: '15 лет',
    gift: 'Тканевый чехол + подсветка в подарок 🎁',
    badge: '🔥🔥🔥 Хит сезона',
    image: 'assets/chan_uch6_render.png',
    imageInterior: null,
    livePhotos: [
      'assets/chan_uch2_spec_stove.png?v=11',
      'assets/chan_uch2_spec_trim.png?v=11',
      'assets/chan_uch5_spec_table.png?v=12',
      'assets/chan_uch5_spec_metal_ladder.png?v=11',
      'assets/chan_uch2_spec_chimney.png?v=11',
      'assets/chan_uch7_spec_chimney_guard.png'
    ],
    hotspots: [],
    ladder: 'Металлическая лестница с площадкой и поручнем',
    stove: 'Печь-подставка с металлическим дном',
    hideEquipmentHighlight: true,
    specs: [
      { name: 'Материал чаши', value: 'Нержавеющая сталь AISI 430' },
      { name: 'Толщина металла', value: 'Стенки 2 мм, дно 3 мм' },
      { name: 'Внутренняя отделка', value: 'Сибирская лиственница' },
      { name: 'Диаметр чаши', value: '200 см' },
      { name: 'Вместимость', value: 'До 6 человек' },
      { name: 'Тип подогрева', value: 'Печь-подставка' },
      { name: 'Рабочий объем', value: '1250 литров' },
      { name: 'Глубина чаши', value: '97 см' },
      { name: 'Срок службы', value: '15 лет' },
      { name: 'Опции комплекта', value: 'Металлическая лестница с подиумом, Дымоход 2.5м, Защита дымохода, Центральный столик' }
    ]
  },
  {
    id: 5,
    name: 'Комплект «УЧ-6» AISI 304',
    category: 'summer',
    steel: 'AISI 304',
    stock: 3,
    totalStock: 6,
    oldPrice: 254736,
    newPrice: 208800,
    warranty: '15 лет',
    lifetime: '30 лет',
    gift: 'Тканевый чехол + подсветка в подарок 🎁',
    badge: '🔥🔥🔥 Хит сезона',
    image: 'assets/chan_uch6_render.png',
    imageInterior: null,
    livePhotos: [
      'assets/chan_uch2_spec_stove.png?v=11',
      'assets/chan_uch2_spec_trim.png?v=11',
      'assets/chan_uch5_spec_table.png?v=12',
      'assets/chan_uch5_spec_metal_ladder.png?v=11',
      'assets/chan_uch2_spec_chimney.png?v=11',
      'assets/chan_uch7_spec_chimney_guard.png'
    ],
    hotspots: [],
    ladder: 'Металлическая лестница с площадкой и поручнем',
    stove: 'Печь-подставка с металлическим дном',
    hideEquipmentHighlight: true,
    specs: [
      { name: 'Материал чаши', value: 'Нержавеющая сталь AISI 304' },
      { name: 'Толщина металла', value: 'Стенки 2 мм, дно 3 мм' },
      { name: 'Внутренняя отделка', value: 'Сибирская лиственница' },
      { name: 'Диаметр чаши', value: '200 см' },
      { name: 'Вместимость', value: 'До 6 человек' },
      { name: 'Тип подогрева', value: 'Печь-подставка' },
      { name: 'Рабочий объем', value: '1250 литров' },
      { name: 'Глубина чаши', value: '97 см' },
      { name: 'Срок службы', value: '30 лет' },
      { name: 'Опции комплекта', value: 'Металлическая лестница с подиумом, Дымоход 2.5м, Защита дымохода, Центральный столик' }
    ]
  },
  {
    id: 6,
    name: 'Комплект «УЧ-7» AISI 304',
    category: 'summer',
    steel: 'AISI 304',
    stock: 2,
    totalStock: 5,
    oldPrice: 308904,
    newPrice: 253200,
    warranty: '15 лет',
    lifetime: '30 лет',
    stoveTag: 'Печь с водяной рубашкой',
    gift: 'Тканевый чехол + подсветка в подарок 🎁',
    badge: '🔥🔥🔥 Хит сезона',
    image: 'assets/chan_uch7_main_render.png',
    imageInterior: null,
    livePhotos: [
      'assets/chan_uch8_spec_water_jacket.png',
      'assets/chan_uch8_spec_trim.png',
      'assets/chan_uch8_spec_table.png',
      'assets/chan_uch8_spec_ladder.png',
      'assets/chan_uch2_spec_chimney.png?v=11',
      'assets/chan_uch7_spec_chimney_guard.png'
    ],
    hotspots: [],
    ladder: 'Металлическая лестница с площадкой и поручнем',
    stove: 'Печь с водяной рубашкой',
    hideEquipmentHighlight: true,
    specs: [
      { name: 'Материал чаши', value: 'Нержавеющая сталь AISI 304' },
      { name: 'Толщина металла', value: 'Стенки 2 мм, дно 3 мм' },
      { name: 'Внутренняя отделка', value: 'Сибирская лиственница' },
      { name: 'Диаметр чаши', value: '200 см' },
      { name: 'Вместимость', value: 'До 6 человек' },
      { name: 'Тип подогрева', value: 'Печь с водяной рубашкой' },
      { name: 'Рабочий объем', value: '1250 литров' },
      { name: 'Глубина чаши', value: '97 см' },
      { name: 'Срок службы', value: '30 лет' },
      { name: 'Опции комплекта', value: 'Металлическая лестница с подиумом, Дымоход 2.5м, Защита дымохода, Центральный столик' }
    ]
  }
];

function formatPrice(number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

function getSlideChipTitle(imgSrc, index) {
  if (index === 0) return '3D Вид';
  const src = imgSrc.toLowerCase();
  if (src.includes('water_jacket')) return 'Печь';
  if (src.includes('stove')) return 'Печь';
  if (src.includes('chimney_sandwich')) return 'Сэндвич';
  if (src.includes('chimney_guard')) return 'Защита';
  if (src.includes('chimney')) return 'Дымоход';
  if (src.includes('trim') && !src.includes('exterior')) return 'Отделка';
  if (src.includes('exterior_trim')) return 'Внеш. отделка';
  if (src.includes('table')) return 'Столик';
  if (src.includes('ladder')) return 'Лестница';
  if (src.includes('jacuzzi')) return 'Джакузи';
  if (src.includes('lighting')) return 'Подсветка';
  if (src.includes('cover')) return 'Термокрышка';
  return `Фото ${index + 1}`;
}

function buildChecklistItemsHtml(product) {
  const items = [];
  
  if (product.stoveTag) {
    items.push(`<strong>${product.stoveTag}</strong>`);
  } else if (product.stove) {
    items.push(`<strong>${product.stove}</strong>`);
  }
  
  if (product.ladder) {
    items.push(`<strong>${product.ladder}</strong>`);
  }
  
  const optionsSpec = product.specs ? product.specs.find(s => s.name === 'Опции комплекта') : null;
  if (optionsSpec && optionsSpec.value) {
    const opts = optionsSpec.value.split(/[,;]/).map(o => o.trim()).filter(Boolean);
    opts.forEach(opt => {
      const lower = opt.toLowerCase();
      if (lower.startsWith('без ')) return;
      if (lower.includes('печь') || lower.includes('лестниц')) return;
      if (!lower.includes('защита') && lower.includes('дым') && items.some(i => i.toLowerCase().includes('дым') && !i.toLowerCase().includes('защита'))) return;
      if (items.some(i => i.toLowerCase().includes(lower))) return;
      items.push(opt);
    });
  }

  return items.map(item => `
    <li>
      <i class="fa-solid fa-check check-ico"></i>
      <span>${item}</span>
    </li>
  `).join('');
}

// РЕНДЕРИНГ КАРТОЧЕК ТОВАРОВ
function renderProducts() {
  const container = document.getElementById('products-feed');
  if (!container) return;

  container.innerHTML = '';

  // Определяем массив товаров для отрисовки в зависимости от активного фильтра
  let productsToRender = [];
  if (currentCapacityFilter === 'small') {
    productsToRender = SMALL_PRODUCTS;
  } else if (currentCapacityFilter === 'large') {
    productsToRender = PREMIUM_PRODUCTS;
  } else {
    productsToRender = PRODUCTS;
  }

  productsToRender.forEach(product => {
    const discount = product.oldPrice - product.newPrice;
    
    // Формируем массив всех слайдов для галереи
    const slides = [
      product.image,
      ...(product.imageInterior ? [product.imageInterior] : []),
      ...(product.livePhotos || [])
    ];
    
    // Генерация HTML слайдов
    const slidesHtml = slides.map((imgSrc, index) => {
      const cleanPath = imgSrc.toLowerCase().split('?')[0];
      const isRender = cleanPath.endsWith('.png') && !cleanPath.includes('banner') && !cleanPath.includes('title') && !cleanPath.includes('spec');
      const isSafety = imgSrc.includes('safety_banner');
      const isThermal = imgSrc.includes('thermal_banner') || imgSrc.includes('hotel_banner') || imgSrc.includes('spa_banner') || imgSrc.includes('pine_banner') || imgSrc.includes('delivery_banner') || imgSrc.includes('cover_banner') || imgSrc.includes('bright_banner');
      const slideClass = isRender ? 'gallery-slide is-render' : (isSafety ? 'gallery-slide is-safety' : (isThermal ? 'gallery-slide is-thermal' : 'gallery-slide'));
      const imgClass = isRender ? 'card-image is-render' : (isSafety ? 'card-image is-safety' : (isThermal ? 'card-image is-thermal' : 'card-image'));
      return `
        <div class="${slideClass}">
          <img src="${imgSrc}" alt="${product.name} (фото ${index + 1})" class="${imgClass}" loading="lazy">
        </div>
      `;
    }).join('');
    
    // Генерация точек-индикаторов (только если слайдов больше 1)
    const dotsHtml = slides.length > 1 ? slides.map((_, index) => `
      <span class="indicator-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>
    `).join('') : '';

    // Генерация чипов быстрой навигации
    const chipsHtml = slides.length > 1 ? slides.map((imgSrc, index) => `
      <button type="button" class="quick-chip-btn ${index === 0 ? 'active' : ''}" data-slide="${index}">
        ${getSlideChipTitle(imgSrc, index)}
      </button>
    `).join('') : '';

    // Разметка характеристик
    const specsHtml = product.specs.map(spec => {
      let specValue = spec.value;
      if (spec.name === 'Материал чаши') {
        specValue += ` <span class="steel-compare-link" data-target="faq-steel">(В чем различие?)</span>`;
      }
      return `
        <div class="spec-row">
          <span class="spec-name">${spec.name}</span>
          <span class="spec-val">${specValue}</span>
        </div>
      `;
    }).join('');

    // Генерация хотспотов
    let hotspotsHtml = '';
    if (product.hotspots) {
      hotspotsHtml = product.hotspots.map(hotspot => `
        <div class="hotspot" id="hotspot-${product.id}-${hotspot.id}" style="left: ${hotspot.x}%; top: ${hotspot.y}%;" data-slide="${hotspot.slideIndex}" data-base-x="${hotspot.x}">
          <button class="hotspot-btn" aria-label="Показать детали">
            <i class="fa-solid fa-plus"></i>
          </button>
          <div class="hotspot-popup ${hotspot.align || 'center'}">
            <div class="hotspot-popup-arrow"></div>
            <button class="hotspot-popup-close" aria-label="Закрыть"><i class="fa-solid fa-xmark"></i></button>
            <img src="${hotspot.image}" alt="${hotspot.title}" class="hotspot-popup-img" loading="lazy">
            <h4 class="hotspot-popup-title">${hotspot.title}</h4>
            <p class="hotspot-popup-text">${hotspot.text}</p>
          </div>
        </div>
      `).join('');
    }

    let capacityBadgeText = product.capacityText || 'до 6 чел.';
    if (!product.capacityText) {
      if (product.category === 'small' || (product.id && product.id.toString().startsWith('small'))) {
        capacityBadgeText = 'на 3 чел.';
      } else if (product.category === 'large' || (product.id && product.id.toString().startsWith('large'))) {
        capacityBadgeText = 'до 10 чел.';
      }
    }

    const card = document.createElement('article');
    card.className = product.isPlaceholder ? 'product-card placeholder-card' : 'product-card';
    card.id = `product-card-${product.id}`;
    
    card.innerHTML = `
      <div class="card-image-container">
        <!-- Слайдер изображений (свайпы) -->
        <div class="card-gallery" id="gallery-${product.id}">
          ${slidesHtml}
        </div>
        
        ${slides.length > 1 ? `
          <!-- Индикаторы свайпа (точки) -->
          <div class="gallery-indicators">
            ${dotsHtml}
          </div>
          
          <!-- Подсказка о свайпе -->
          <div class="swipe-hint">
            <i class="fa-solid fa-left-right"></i>
            <span class="swipe-hint-desktop">Проведите, чтобы увидеть больше фото</span>
            <span class="swipe-hint-mobile">Проведите</span>
          </div>
        ` : ''}

        ${product.badge ? `<span class="card-badge">${product.badge}</span>` : ''}
        
        <!-- Хотспоты (интерактивные точки) -->
        ${hotspotsHtml}
        
        <div class="card-badges-absolute">
          <span class="badge-item capacity"><i class="fa-solid fa-users"></i> ${capacityBadgeText}</span>
          <span class="badge-item warranty"><i class="fa-solid fa-shield-halved"></i> ${product.warranty} гарантии</span>
          <span class="badge-item lifetime"><i class="fa-solid fa-hourglass-half"></i> ${product.lifetime} службы</span>
        </div>
      </div>
      
      <div class="card-body">
        ${product.isPlaceholder ? `
          <div class="placeholder-notice">
            <i class="fa-solid fa-circle-info"></i>
            <div>
              <strong>Индивидуальный заказ и расчёт!</strong><br>
              ${product.description}
            </div>
          </div>
        ` : ''}
        ${product.urgentNotice ? `
          <div class="urgent-notice-box">
            <div class="urgent-notice-icon">🚨</div>
            <div class="urgent-notice-content">
              <div class="urgent-notice-title">${product.urgentNotice.title}</div>
              <div class="urgent-notice-text">${product.urgentNotice.text}</div>
            </div>
          </div>
        ` : ''}
        <h3 class="card-title">${product.name}</h3>
        ${product.stoveTag ? `
          <div class="card-stove-tag">
            <i class="fa-solid fa-fire-flame-curved"></i> <span>Тип подогрева: <strong>${product.stoveTag}</strong></span>
          </div>
        ` : ''}
        
        <div class="card-gift-box">
          <div class="gift-icon">
            <i class="fa-solid fa-gift pulse"></i>
          </div>
          <div class="gift-text">
            <strong>ПОДАРОК:</strong> ${product.gift} <span class="gift-view-link">(Посмотреть фото 📷)</span>
          </div>
        </div>
        
        <div class="card-price-block">
          <div class="price-row">
            <div class="price-old">
              <span class="price-label">Старая цена:</span>
              <span class="price-val-old">${formatPrice(product.oldPrice)}</span>
            </div>
            <div class="price-new">
              <span class="price-label">${product.isPlaceholder ? 'ОРИЕНТИРОВОЧНО:' : 'ЦЕНА СО СКИДКОЙ:'}</span>
              <span class="price-val-new">${formatPrice(product.newPrice)}</span>
            </div>
          </div>
          <div class="price-discount">
            <i class="fa-solid fa-circle-check"></i> Ваша экономия: <strong>${formatPrice(discount)}</strong>
          </div>
          ${product.stock ? `
            <div class="price-stock">
              <div class="stock-info">
                <span class="stock-label"><i class="fa-solid fa-fire-flame-curved icon-pulse-red"></i> Осталось по акции:</span>
                <span class="stock-val"><strong>${product.stock} шт.</strong></span>
              </div>
              <div class="stock-bar-track">
                <div class="stock-bar-fill" style="width: ${Math.min(100, Math.max(15, (product.stock / (product.totalStock || 5)) * 100))}%;"></div>
              </div>
              <div class="live-viewers-box">
                <span class="live-dot"></span>
                <span>Сейчас этот комплект смотрят <strong class="viewers-num">${5 + (String(product.id).charCodeAt(0) % 4)} человек</strong></span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Чек-лист входящих опций -->
        <div class="package-checklist-box">
          <div class="checklist-header">
            <i class="fa-solid fa-square-check"></i>
            <span><strong>В этот комплект уже входит:</strong></span>
          </div>
          <ul class="checklist-list">
            ${buildChecklistItemsHtml(product)}
          </ul>
        </div>

        <!-- Details Accordion -->
        <details class="card-details" id="details-${product.id}">
          <summary class="details-summary">
            <span><i class="fa-solid fa-list-check"></i> Комплектация и параметры</span>
            <i class="fa-solid fa-chevron-down arrow-icon"></i>
          </summary>
          <div class="details-content">
            ${!product.hideEquipmentHighlight && (product.ladder || product.stove) ? `
              <div class="equipment-highlight">
                ${product.ladder ? `<p><strong><i class="fa-solid fa-stairs"></i> Лестница:</strong> ${product.ladder}</p>` : ''}
                ${product.stove ? `<p><strong><i class="fa-solid fa-fire-burner"></i> Тип подогрева:</strong> ${product.stove}</p>` : ''}
              </div>
            ` : ''}
            <div class="specs-table">
              ${specsHtml}
            </div>
          </div>
        </details>
        
        <div class="card-actions">
          <button class="btn-copy-title ${product.isPlaceholder ? 'btn-request-calc' : ''}" data-title="${product.name}" id="copy-btn-${product.id}">
            <i class="fa-regular fa-copy"></i> ${product.isPlaceholder ? 'Запросить расчёт под этот размер (скопировать)' : 'Выбрать этот комплект (скопировать)'}
          </button>
          <span class="copy-hint-text">Название скопируется в буфер. Просто вставьте его в наш диалог.</span>
        </div>
      </div>
    `;
    
    container.appendChild(card);

    // Логика отслеживания свайпа для обновления точек
    setTimeout(() => {
      const gallery = document.getElementById(`gallery-${product.id}`);
      if (gallery) {
        const dots = gallery.parentElement.querySelectorAll('.indicator-dot');
        const hotspotElements = gallery.parentElement.querySelectorAll('.hotspot');
        
        // Функция динамического позиционирования хотспотов для эффекта прокрутки вместе с фото
        const updateHotspotPositions = () => {
          const width = gallery.clientWidth;
          const scrollLeft = gallery.scrollLeft;
          
          hotspotElements.forEach(hotspot => {
            const slideIndex = parseInt(hotspot.getAttribute('data-slide'));
            const baseXPercent = parseFloat(hotspot.getAttribute('data-base-x'));
            
            // Вычисляем смещение слайда относительно текущего scrollLeft
            const slideOffset = (slideIndex * width) - scrollLeft;
            const baseX = (baseXPercent / 100) * width;
            const currentLeft = baseX + slideOffset;
            
            hotspot.style.left = `${currentLeft}px`;
            
            // Точка видна только тогда, когда её слайд в зоне видимости
            if (currentLeft >= -20 && currentLeft <= width + 20) {
              hotspot.classList.add('visible');
              
              // Закрываем открытый поп-ап, если пользователь прокрутил слайд в сторону на 30% и более
              if (Math.abs(slideOffset) > width * 0.3) {
                hotspot.classList.remove('active');
              }
            } else {
              hotspot.classList.remove('visible');
              hotspot.classList.remove('active');
            }
          });
        };

        const chips = gallery.parentElement.querySelectorAll('.quick-chip-btn');
        const chipsContainer = gallery.parentElement.querySelector('.gallery-quick-chips');

        // Переключение по точкам при клике
        dots.forEach((dot, index) => {
          dot.addEventListener('click', () => {
            const width = gallery.clientWidth;
            gallery.scrollTo({
              left: index * width,
              behavior: 'smooth'
            });
          });
        });

        // Переключение по кнопочкам-чипам при клике
        chips.forEach((chip, index) => {
          chip.addEventListener('click', () => {
            const width = gallery.clientWidth;
            gallery.scrollTo({
              left: index * width,
              behavior: 'smooth'
            });
          });
        });

        // Отслеживание скролла (свайпа)
        gallery.addEventListener('scroll', () => {
          const width = gallery.clientWidth;
          const scrollLeft = gallery.scrollLeft;
          const activeIndex = Math.round(scrollLeft / width);
          
          dots.forEach((dot, idx) => {
            if (idx === activeIndex) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });

          chips.forEach((chip, idx) => {
            if (idx === activeIndex) {
              chip.classList.add('active');
              if (chipsContainer) {
                const chipLeft = chip.offsetLeft;
                const chipW = chip.clientWidth;
                const contW = chipsContainer.clientWidth;
                chipsContainer.scrollTo({
                  left: chipLeft - (contW / 2) + (chipW / 2),
                  behavior: 'smooth'
                });
              }
            } else {
              chip.classList.remove('active');
            }
          });

          updateHotspotPositions();
        }, { passive: true });

        // Поддержка изменения размеров экрана и поворота устройства
        window.addEventListener('resize', updateHotspotPositions, { passive: true });

        // Обработка кликов по хотспотам
        hotspotElements.forEach(hotspot => {
          const btn = hotspot.querySelector('.hotspot-btn');
          const closeBtn = hotspot.querySelector('.hotspot-popup-close');
          
          if (btn) {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              // Закрываем все остальные открытые хотспоты на этой карточке
              hotspotElements.forEach(h => {
                if (h !== hotspot) h.classList.remove('active');
              });
              hotspot.classList.toggle('active');
            });
          }
          
          if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              hotspot.classList.remove('active');
            });
          }
          
          // Закрытие при клике по самому документу
          document.addEventListener('click', (e) => {
            if (!hotspot.contains(e.target)) {
              hotspot.classList.remove('active');
            }
          });
        });

        // Первичная инициализация позиций хотспотов
        updateHotspotPositions();
      }
    }, 100);
  });
}

// ТАЙМЕР ОБРАТНОГО ОТСЧЕТА ДО КОНЦА НЕДЕЛИ
function initCountdownTimer() {
  function updateTimer() {
    const now = new Date();
    const nextSunday = new Date();
    const currentDay = now.getDay();
    const daysToSunday = currentDay === 0 ? 0 : 7 - currentDay;
    
    nextSunday.setDate(now.getDate() + daysToSunday);
    nextSunday.setHours(23, 59, 59, 999);
    
    const diff = nextSunday - now;
    
    if (diff <= 0) {
      const expiredHtml = "<span class='timer-expired'>Скидки продлены! Успейте заказать!</span>";
      const countdownEl = document.getElementById('countdown');
      if (countdownEl) countdownEl.innerHTML = expiredHtml;
      
      const hCountdownEl = document.querySelector('.header-timer-countdown');
      if (hCountdownEl) hCountdownEl.textContent = "Скидки продлены!";
      return;
    }
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    
    const dStr = d.toString().padStart(2, '0');
    const hStr = h.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');
    
    // Обновляем элементы основного таймера
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.textContent = dStr;
    if (hoursEl) hoursEl.textContent = hStr;
    if (minutesEl) minutesEl.textContent = mStr;
    if (secondsEl) secondsEl.textContent = sStr;

    // Обновляем элементы мини-таймера в шапке
    const hDaysEl = document.getElementById('h-days');
    const hHoursEl = document.getElementById('h-hours');
    const hMinutesEl = document.getElementById('h-minutes');
    const hSecondsEl = document.getElementById('h-seconds');

    if (hDaysEl) hDaysEl.textContent = dStr;
    if (hHoursEl) hHoursEl.textContent = hStr;
    if (hMinutesEl) hMinutesEl.textContent = mStr;
    if (hSecondsEl) hSecondsEl.textContent = sStr;
  }
  
  updateTimer();
  setInterval(updateTimer, 1000);

  // Следим за скроллом для липкого таймера в шапке
  const mainHeader = document.getElementById('main-header');
  const timerContainer = document.getElementById('timer-container');

  if (mainHeader && timerContainer) {
    window.addEventListener('scroll', () => {
      const rect = timerContainer.getBoundingClientRect();
      const headerHeight = mainHeader.offsetHeight || 60;
      
      // Если нижняя граница основного таймера скрывается под шапкой
      if (rect.bottom < headerHeight) {
        mainHeader.classList.add('show-mini-timer');
      } else {
        mainHeader.classList.remove('show-mini-timer');
      }
    }, { passive: true });
  }
}

function initVideoPlayer() {
  const cover = document.getElementById('video-cover');
  const playBtn = document.getElementById('video-play-btn');
  const iframeContainer = document.getElementById('video-iframe-container');
  
  if (!cover || !iframeContainer) return;
  
  const startVideo = () => {
    // Вставляем iframe с видео из VK
    const videoUrl = 'https://vk.com/video_ext.php?oid=-229886352&id=456239017&hash=21f06a7ad90fc4be&autoplay=1';
    
    iframeContainer.innerHTML = `
      <iframe 
        src="${videoUrl}" 
        width="100%" 
        height="100%" 
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture;" 
        frameborder="0" 
        allowfullscreen
      ></iframe>
    `;
    
    // Скрываем обложку с анимацией
    cover.style.opacity = '0';
    setTimeout(() => {
      cover.style.display = 'none';
    }, 400);
  };
  
  cover.addEventListener('click', startVideo);
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startVideo();
  });
}

// ЛИПКАЯ И УМЕНЬШЕННАЯ ПЛАШКА ВМЕСТИМОСТИ ПРИ СКРОЛЛЕ
function initStickyCapacityFilter() {
  const mainHeader = document.getElementById('main-header');
  const capacitySection = document.getElementById('capacity-filter-section');
  const sentinel = document.getElementById('capacity-sentinel');

  if (!capacitySection) return;

  const updateHeaderOffset = () => {
    if (mainHeader && capacitySection) {
      const headerHeight = mainHeader.offsetHeight || 56;
      capacitySection.style.top = `${headerHeight}px`;
    }
  };

  updateHeaderOffset();
  window.addEventListener('resize', updateHeaderOffset, { passive: true });

  const handleStickyScroll = () => {
    const headerHeight = mainHeader ? (mainHeader.offsetHeight || 56) : 56;
    if (sentinel) {
      const rect = sentinel.getBoundingClientRect();
      if (rect.top <= headerHeight) {
        capacitySection.classList.add('is-sticky');
      } else {
        capacitySection.classList.remove('is-sticky');
      }
    } else {
      const rect = capacitySection.getBoundingClientRect();
      if (rect.top <= headerHeight + 2) {
        capacitySection.classList.add('is-sticky');
      } else {
        capacitySection.classList.remove('is-sticky');
      }
    }
  };

  window.addEventListener('scroll', handleStickyScroll, { passive: true });
  handleStickyScroll();
}

// ИНИЦИАЛИЗАЦИЯ ПЕРЕКЛЮЧАТЕЛЯ ВМЕСТИМОСТИ
function initCapacityFilter() {
  const tabButtons = document.querySelectorAll('.capacity-tab-btn');
  if (!tabButtons || tabButtons.length === 0) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCapacity = btn.getAttribute('data-capacity');
      if (!selectedCapacity || selectedCapacity === currentCapacityFilter) return;

      currentCapacityFilter = selectedCapacity;

      // Обновляем визуальный активный статус кнопок
      tabButtons.forEach(b => {
        const isSelected = (b === btn);
        b.classList.toggle('active', isSelected);
        b.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });

      // Перерисовываем карточки
      renderProducts();

      // Плавная прокрутка к началу каталога товаров при переключении
      const feedSection = document.getElementById('products-feed');
      const capacitySection = document.getElementById('capacity-filter-section');
      const mainHeader = document.getElementById('main-header');

      if (capacitySection && feedSection) {
        const isSticky = capacitySection.classList.contains('is-sticky');
        const headerHeight = mainHeader ? (mainHeader.offsetHeight || 56) : 56;
        
        if (isSticky) {
          const stickyBarHeight = capacitySection.offsetHeight || 50;
          const targetY = feedSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - stickyBarHeight;
          window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        } else {
          const rect = capacitySection.getBoundingClientRect();
          if (rect.top < 0) {
            const targetY = rect.top + window.pageYOffset - headerHeight;
            window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
          }
        }
      }
    });
  });
}

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
  initCountdownTimer();
  renderProducts();
  initCapacityFilter();
  initStickyCapacityFilter();
  initVideoPlayer();

  // Инициализация полноэкранного просмотра фото (Lightbox)
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = lightboxModal ? lightboxModal.querySelector('.lightbox-close') : null;
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let activeGalleryImages = [];
  let activeImageIndex = 0;

  function updateLightboxImage() {
    if (activeGalleryImages.length === 0) return;
    const currentSrc = activeGalleryImages[activeImageIndex];
    if (currentSrc.toLowerCase().endsWith('.png') && !currentSrc.includes('banner')) {
      lightboxImg.classList.add('is-render');
    } else {
      lightboxImg.classList.remove('is-render');
    }
    lightboxImg.style.opacity = '0.3';
    lightboxImg.src = currentSrc;
    lightboxImg.onload = () => {
      lightboxImg.style.opacity = '1';
    };
  }

  function showNextImage() {
    if (activeGalleryImages.length <= 1) return;
    activeImageIndex = (activeImageIndex + 1) % activeGalleryImages.length;
    updateLightboxImage();
  }

  function showPrevImage() {
    if (activeGalleryImages.length <= 1) return;
    activeImageIndex = (activeImageIndex - 1 + activeGalleryImages.length) % activeGalleryImages.length;
    updateLightboxImage();
  }

  if (lightboxModal && lightboxImg) {
    // Открытие при клике на картинку
    document.addEventListener('click', (e) => {
      const cardImg = e.target.closest('.card-gallery .card-image');
      const certImg = e.target.closest('.certificate-card .cert-image');
      
      if (cardImg) {
        const productCard = cardImg.closest('.product-card');
        if (productCard) {
          const productIdRaw = productCard.id.replace('product-card-', '');
          const allProducts = [...PRODUCTS, PLACEHOLDER_PRODUCTS.small, PLACEHOLDER_PRODUCTS.large];
          const product = allProducts.find(p => String(p.id) === String(productIdRaw));
          if (product) {
            // Формируем массив всех слайдов точно так же, как при рендере
            activeGalleryImages = [
              product.image,
              product.imageInterior,
              ...(product.livePhotos || [])
            ];
            
            // Находим индекс кликнутой картинки по относительному пути src
            const clickedSrc = cardImg.getAttribute('src');
            activeImageIndex = activeGalleryImages.indexOf(clickedSrc);
            if (activeImageIndex === -1) activeImageIndex = 0;

            updateLightboxImage();
            lightboxModal.classList.add('active');
            document.body.classList.add('lightbox-open');
          }
        }
      } else if (certImg) {
        // Загружаем все 4 сертификата в галерею лайтбокса
        activeGalleryImages = [
          'assets/cert_3.jpg',
          'assets/cert_4.jpg',
          'assets/cert_1.jpg',
          'assets/cert_2.jpg'
        ];
        
        const clickedSrc = certImg.getAttribute('src');
        activeImageIndex = activeGalleryImages.indexOf(clickedSrc);
        if (activeImageIndex === -1) activeImageIndex = 0;

        updateLightboxImage();
        lightboxModal.classList.add('active');
        document.body.classList.add('lightbox-open');
      }
    });

    // Закрытие при клике на крестик
    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightboxModal.classList.remove('active');
        document.body.classList.remove('lightbox-open');
        lightboxImg.classList.remove('is-render');
        activeGalleryImages = [];
      });
    }

    // Навигация по стрелкам
    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
      });
    }

    // Закрытие при клике на фон
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal || e.target.classList.contains('lightbox-content')) {
        lightboxModal.classList.remove('active');
        document.body.classList.remove('lightbox-open');
        lightboxImg.classList.remove('is-render');
        activeGalleryImages = [];
      }
    });

    // Закрытие по кнопке Escape и навигация клавиатурой
    document.addEventListener('keydown', (e) => {
      if (!lightboxModal.classList.contains('active')) return;
      
      if (e.key === 'Escape') {
        lightboxModal.classList.remove('active');
        document.body.classList.remove('lightbox-open');
        lightboxImg.classList.remove('is-render');
        activeGalleryImages = [];
      } else if (e.key === 'ArrowRight') {
        showNextImage();
      } else if (e.key === 'ArrowLeft') {
        showPrevImage();
      }
    });

    // Свайпы на мобильных устройствах
    let touchStartX = 0;
    let touchEndX = 0;

    lightboxModal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxModal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        showNextImage(); // Свайп влево
      } else if (touchEndX > touchStartX + swipeThreshold) {
        showPrevImage(); // Свайп вправо
      }
    }, { passive: true });
  }
  
  // Клик копирования названия
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-copy-title');
    if (btn) {
      const title = btn.getAttribute('data-title');
      navigator.clipboard.writeText(title).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Скопировано! Вставьте в чат';
        btn.classList.add('copied');
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('copied');
        }, 3000);
      }).catch(err => {
        console.error('Ошибка копирования:', err);
        const area = document.createElement('textarea');
        area.value = title;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
        
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Скопировано! Вставьте в чат';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('copied');
        }, 3000);
      });
    }
  });

  // Инициализация слайдера сертификатов
  const certSlider = document.getElementById('certificates-slider');
  const certDots = document.querySelectorAll('.cert-dot');
  const certPrevBtn = document.querySelector('.cert-prev');
  const certNextBtn = document.querySelector('.cert-next');
  const certCards = document.querySelectorAll('.certificate-card');

  if (certSlider && certCards.length > 0) {
    let activeCertIndex = 0;

    function scrollToCert(index) {
      if (index < 0 || index >= certCards.length) return;
      activeCertIndex = index;
      const cardWidth = certCards[0].offsetWidth;
      const gap = 16; // соответствует gap: 16px в CSS
      certSlider.scrollTo({
        left: index * (cardWidth + gap),
        behavior: 'smooth'
      });
      updateCertDots(index);
    }

    function updateCertDots(index) {
      certDots.forEach((dot, idx) => {
        if (idx === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    if (certPrevBtn) {
      certPrevBtn.addEventListener('click', () => {
        let prevIndex = activeCertIndex - 1;
        if (prevIndex < 0) prevIndex = certCards.length - 1; // Зацикливание
        scrollToCert(prevIndex);
      });
    }

    if (certNextBtn) {
      certNextBtn.addEventListener('click', () => {
        let nextIndex = activeCertIndex + 1;
        if (nextIndex >= certCards.length) nextIndex = 0; // Зацикливание
        scrollToCert(nextIndex);
      });
    }

    // Клик по точкам
    certDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'));
        scrollToCert(index);
      });
    });

    // Отслеживание скролла (для свайпов на мобильных устройствах)
    let scrollTimeout;
    certSlider.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const cardWidth = certCards[0].offsetWidth;
        const gap = 16;
        const scrollLeft = certSlider.scrollLeft;
        const currentFloat = scrollLeft / (cardWidth + gap);
        const index = Math.round(currentFloat);
        if (index >= 0 && index < certCards.length && index !== activeCertIndex) {
          activeCertIndex = index;
          updateCertDots(index);
        }
      }, 100);
    }, { passive: true });
  }

  // Обработка клика по ссылке сравнения стали
  document.addEventListener('click', (e) => {
    const compareLink = e.target.closest('.steel-compare-link');
    if (compareLink) {
      const targetId = compareLink.getAttribute('data-target');
      const targetAccordion = document.getElementById(targetId);
      if (targetAccordion) {
        // Раскрываем аккордеон
        targetAccordion.setAttribute('open', '');
        
        // Плавно скроллим к нему
        targetAccordion.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        // Добавляем эффект временной подсветки
        targetAccordion.classList.remove('flash-highlight');
        void targetAccordion.offsetWidth; // Триггер reflow для перезапуска CSS-анимации
        targetAccordion.classList.add('flash-highlight');
        
        // Удаляем класс после завершения анимации
        setTimeout(() => {
          targetAccordion.classList.remove('flash-highlight');
        }, 2500);
      }
    }
  });

  // Инициализация модального окна подарков
  const giftsModal = document.getElementById('gifts-modal');
  if (giftsModal) {
    const closeBtn = giftsModal.querySelector('.gifts-modal-close');
    const okBtn = giftsModal.querySelector('.gifts-modal-btn');

    function openGiftsModal() {
      giftsModal.classList.add('active');
      giftsModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open'); // Блокируем скролл фона
    }

    function closeGiftsModal() {
      giftsModal.classList.remove('active');
      giftsModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
    }

    // Слушаем клики по ссылкам просмотра подарков
    document.addEventListener('click', (e) => {
      if (e.target.closest('.gift-view-link')) {
        openGiftsModal();
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeGiftsModal);
    if (okBtn) okBtn.addEventListener('click', closeGiftsModal);

    // Закрытие при клике по фону
    giftsModal.addEventListener('click', (e) => {
      if (e.target === giftsModal) {
        closeGiftsModal();
      }
    });

    // Закрытие по кнопке Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && giftsModal.classList.contains('active')) {
        closeGiftsModal();
      }
    });
  }

  // Динамика числа зрителей в реальном времени
  setInterval(() => {
    document.querySelectorAll('.viewers-num').forEach(el => {
      const current = parseInt(el.textContent) || 6;
      const delta = (Math.random() > 0.5 ? 1 : -1);
      let next = current + delta;
      if (next < 4) next = 5;
      if (next > 9) next = 8;
      
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '0.3';
      setTimeout(() => {
        el.textContent = `${next} человек`;
        el.style.opacity = '1';
      }, 300);
    });
  }, 6000);
});
