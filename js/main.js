// main.js

// ======================
// تحميل بيانات SEO من data.json
// ======================
const API_URL = "https://mtamcpnael.shop/api.php"; 
async function loadSeoData() {
  try {
    // إظهار الـ Loader أثناء تحميل البيانات
    document.getElementById('loader').style.display = 'flex';

    const response = await fetch(API_URL);
    const data = await response.json();
    const setting = data.setting || {};

    if (!setting) return;

    // الميتا الأساسية
    document.title = setting.title || '';
    const metaTags = [
      { selector: 'meta[name="keywords"]', value: setting.keywords },
      { selector: 'meta[name="author"]', value: setting.author },
      { selector: 'meta[name="description"]', value: setting.description },
      { selector: 'meta[name="robots"]', value: setting.robots }
    ];

    metaTags.forEach(tag => {
      const el = document.querySelector(tag.selector);
      if (el && tag.value) el.setAttribute("content", tag.value);
    });

    // favicon
    if (setting.favicon_url) {
      let favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = setting.favicon_url;
      favicon.type = 'image/png';
      document.head.appendChild(favicon);
    }

    // اسم الموقع في الصفحة
    document.querySelectorAll('.site-name').forEach(el => {
      el.textContent = setting.site_name || '';
    });

    // Open Graph
    if (setting.og) {
      const ogTags = [
        { selector: 'meta[property="og:title"]', value: setting.og.title },
        { selector: 'meta[property="og:description"]', value: setting.og.description },
        { selector: 'meta[property="og:url"]', value: setting.og.url },
        { selector: 'meta[property="og:site_name"]', value: setting.og.site_name },
        { selector: 'meta[property="og:image"]', value: setting.og.image }
      ];
      ogTags.forEach(tag => {
        const el = document.querySelector(tag.selector);
        if (el && tag.value) el.setAttribute("content", tag.value);
      });
    }

    // Twitter
    if (setting.twitter) {
      const twitterTags = [
        { selector: 'meta[name="twitter:title"]', value: setting.twitter.title },
        { selector: 'meta[name="twitter:description"]', value: setting.twitter.description },
        { selector: 'meta[name="twitter:image"]', value: setting.twitter.image },
        { selector: 'meta[name="twitter:url"]', value: setting.twitter.url }
      ];
      twitterTags.forEach(tag => {
        const el = document.querySelector(tag.selector);
        if (el && tag.value) el.setAttribute("content", tag.value);
      });
    }

    // Schema JSON-LD
    if (setting.schema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(setting.schema);
      document.head.appendChild(script);
    }

    // بيانات إضافية
    if (setting.additional_metadata) {
      const meta = setting.additional_metadata;

      if (meta.sitemap) {
        const sitemapLink = document.createElement('link');
        sitemapLink.rel = 'sitemap';
        sitemapLink.type = 'application/xml';
        sitemapLink.href = meta.sitemap;
        document.head.appendChild(sitemapLink);
      }

      if (meta.apple_touch_icon) {
        const appleIconLink = document.createElement('link');
        appleIconLink.rel = 'apple-touch-icon';
        appleIconLink.sizes = '180x180';
        appleIconLink.href = meta.apple_touch_icon;
        document.head.appendChild(appleIconLink);
      }

      if (meta.meta_copyright) {
        const copyrightMeta = document.createElement('meta');
        copyrightMeta.name = 'copyright';
        copyrightMeta.content = meta.meta_copyright;
        document.head.appendChild(copyrightMeta);
      }
    }

  } catch (error) {
    console.error("خطأ في تحميل بيانات SEO:", error);
  } finally {
    // إخفاء الـ Loader بعد تحميل البيانات
    document.getElementById('loader').style.display = 'none';
  }
}

// ======================
// تحميل وعرض البيانات الرئيسية
// ======================
const dynamicContainer = document.getElementById("dynamicCategories");
let recentItems = [];

async function loadItems() {
  try {
    // إظهار الـ Loader أثناء تحميل البيانات
    document.getElementById('loader').style.display = 'flex';

    const response = await fetch(API_URL);
    const data = await response.json();

    // Carousel
    if (data.site_sections?.hero?.items && Array.isArray(data.site_sections.hero.items)) {
      displayCarousel(data.site_sections.hero.items);
    }

    // About
    if (data.site_sections?.about) displayAbout(data.site_sections.about);

    // Footer
    if (data.site_sections?.footer && data.site_sections?.contact) {
      displayFooter(data.site_sections.footer, data.site_sections.contact, data.categories || []);
    }

    // المنتجات
    if (Array.isArray(data.items)) {
      recentItems = data.items.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      displayCategories(recentItems);
      populateRecentFilter(recentItems);
      displayRecentItems(recentItems);
    }

  } catch (err) {
    console.error("خطأ في جلب البيانات:", err);
  } finally {
    // إخفاء الـ Loader بعد تحميل البيانات
    document.getElementById('loader').style.display = 'none';
  }
}

// ======================
// توجيه المستخدم إلى صفحة السلة
// ======================
function goToCart() {
  window.location.href = 'cart.html';
}
// ======================
// عرض Carousel
// ======================
function displayCarousel(carouselItems) {
  const carouselInner = document.getElementById("carouselInner");
  const carouselIndicators = document.getElementById("carouselIndicators");
  carouselInner.innerHTML = "";
  carouselIndicators.innerHTML = "";

  carouselItems.forEach((slide, index) => {
    const imageSrc = slide.image && slide.image !== "#" ? slide.image : "img/placeholder.png";

    const item = document.createElement("div");
    item.className = "carousel-item" + (index === 0 ? " active" : "");
    item.innerHTML = `
      <img src="${imageSrc}" class="d-block w-100" alt="${slide.title || 'Slide'}">
      <div class="carousel-caption d-flex flex-column justify-content-center align-items-center text-center">
        <h1 class="fw-bold animate__animated animate__fadeInDown">${slide.title || ''}</h1>
        <p class="animate__animated animate__fadeInUp">${slide.subtitle || ''}</p>
        ${slide.button_text ? `<a href="${slide.button_url || '#'}" class="btn btn-main btn-lg animate__animated animate__zoomIn">${slide.button_text}</a>` : ''}
      </div>
    `;
    carouselInner.appendChild(item);

    const indicator = document.createElement("button");
    indicator.type = "button";
    indicator.setAttribute("data-bs-target", "#heroCarousel");
    indicator.setAttribute("data-bs-slide-to", index);
    if (index === 0) indicator.classList.add("active");
    carouselIndicators.appendChild(indicator);
  });
}

// ======================
// About Section
// ======================
function displayAbout(aboutData) {
  const container = document.getElementById("aboutContainer");
  container.innerHTML = `
    <h2 class="display-4 fw-bold mb-4">${aboutData.title}</h2>
    <p class="lead mb-4">${aboutData.description}</p>
    ${
      aboutData.image 
      ? `<div class="text-center">
           <img src="${aboutData.image}" 
                class="img-fluid rounded shadow-sm mb-4 about-img" 
                alt="About">
         </div>` 
      : ''
    }
    <a href="#dynamicCategories" class="btn btn-main btn-lg">استعرض قائمتنا</a>
  `;
}


// ======================
// Footer Section
// ======================
function displayFooter(footerData, contactData, categories = []) {
  const container = document.getElementById("footerContainer");
  let linksHtml = '';

  if (categories.length > 0) {
    linksHtml = '<ul class="list-unstyled">';
    categories.slice(0, 5).forEach(cat => {
      linksHtml += `<li><a href="categories.html?cat=${encodeURIComponent(cat.name)}" class="text-light text-decoration-none">${cat.name}</a></li>`;
    });
    linksHtml += '</ul>';
  }

  container.innerHTML = `
    <div class="row mb-4">
      <div class="col-md-3">
        <h5 class="fw-bold mb-3">${footerData.about_title}</h5>
        <p>${footerData.about_text}</p>
      </div>
      <div class="col-md-3">
        <h5 class="fw-bold mb-3">روابط سريعة</h5>
        ${linksHtml}
      </div>
      <div class="col-md-3">
        <h5 class="fw-bold mb-3">معلومات التواصل</h5>
        <ul class="list-unstyled">
          <li>الهاتف: ${contactData.phone}</li>
          <li>البريد الإلكتروني: ${contactData.email}</li>
          <li>واتساب: ${contactData.whatsapp_number || ''}</li>
          <li>Telegram: ${contactData.telegram || ''}</li>
        </ul>
      </div>
      <div class="col-md-3">
        <h5 class="fw-bold mb-3">الموقع</h5>
        <p>${contactData.address || ''}</p>
      </div>
    </div>
    <hr class="border-light">
    <p class="text-center mb-0">&copy; ${new Date().getFullYear()} ${footerData.copyright}</p>
  `;
}

// ======================
// عرض Categories
// ======================
function displayCategories(items) {
  dynamicContainer.innerHTML = "";

  const categoriesMap = {};
  items.forEach(item => {
    const cat = item.category?.trim() || 'غير مصنف';
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(item);
  });

  Object.keys(categoriesMap).forEach(cat => {
    const section = document.createElement("div");
    section.className = "category-section mb-5";

    const header = document.createElement("div");
    header.className = "category-header d-flex justify-content-between align-items-center mb-3";
    header.innerHTML = `
      <h5><i class="bi bi-tags"></i> ${cat}</h5>
      <a href="categories.html?cat=${encodeURIComponent(cat)}" class="btn btn-main btn-sm">عرض الكل</a>
    `;
    section.appendChild(header);

    const content = document.createElement("div");
    content.className = "d-flex flex-wrap gap-3";

    const itemsOfCat = categoriesMap[cat].slice(0, 6);
    itemsOfCat.forEach(item => {
      const card = document.createElement("div");
      card.className = "category-card";
      const shortDesc = item.description ? (item.description.length > 20 ? item.description.substring(0, 20) + "..." : item.description) : "";
      const imgSrc = item.images || 'img/placeholder.png';

      card.innerHTML = `
        <div class="product-card h-100 d-flex flex-column">
          <img src="${imgSrc}" class="product-img" alt="${item.food_name || 'منتج'}">
          <div class="product-body flex-grow-1 d-flex flex-column justify-content-between">
            <div>
              <h5>${item.food_name || 'منتج'}</h5>
              <p>${shortDesc}</p>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <span class="price">${item.price || 0} <img src="img/ryal.png" style="width:25px;height:25px;vertical-align:middle;margin-left:5px;"></span>
              <div class="d-flex gap-2">
                <a href="details.html?fId=${item.id}" class="btn btn-sm btn-outline-secondary">التفاصيل</a>
                <button class="btn btn-sm btn-cart" onclick='addToCart(${encodeURIComponent(JSON.stringify(item))})'>
                  <i class="bi bi-cart-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      content.appendChild(card);
    });

    section.appendChild(content);
    dynamicContainer.appendChild(section);
  });
}

// ======================
// المنتجات الحديثة & الفلترة
// ======================
const contentContainer = document.getElementById("recentContent");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

function populateRecentFilter(items) {
  const categories = ["", "all", ...new Set(items.map(item => item.category?.trim()).filter(c => c))];
  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat === "" ? "اختيار فئة" : cat === "all" ? "كل الفئات" : cat;
    categoryFilter.appendChild(option);
  });
}

function createRecentCard(item) {
  const card = document.createElement("div");
  card.className = "category-card";
  const shortDesc = item.description ? (item.description.length > 50 ? item.description.substring(0,50) + "..." : item.description) : "";
  card.innerHTML = `
    <div class="product-card h-100 d-flex flex-column">
      <img src="${item.images}" class="product-img" alt="${item.food_name}">
      <div class="product-body flex-grow-1 d-flex flex-column justify-content-between">
        <div>
          <h5>${item.food_name}</h5>
          <p>${shortDesc}</p>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <span class="price">${item.price} <img src="img/ryal.png" style="width:25px;height:25px;vertical-align:middle;margin-left:5px;"></span>
          <div class="d-flex gap-2">
            <a href="details.html?fId=${item.id}" class="btn btn-sm btn-outline-secondary">التفاصيل</a>
            <button class="btn btn-sm btn-cart" onclick='addToCart(${JSON.stringify(item)})'>
              <i class="bi bi-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  contentContainer.appendChild(card);
}

function displayRecentItems(items, limitRandom = 6) {
  contentContainer.innerHTML = "";
  if (items.length === 0) {
    contentContainer.innerHTML = "<p>لا توجد عناصر مطابقة.</p>";
    return;
  }

  const selectedCategory = categoryFilter.value?.trim();
  let displayItems = [];

  if (!selectedCategory) {
    displayItems = [...items].sort(() => 0.5 - Math.random()).slice(0, limitRandom);
  } else if (selectedCategory === "all") {
    displayItems = items;
  } else {
    displayItems = items.filter(item => item.category?.trim() === selectedCategory);
  }

  displayItems.forEach(item => createRecentCard(item));
}

function filterItems() {
  const searchText = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value?.trim();
  let filtered = recentItems.filter(item => item.food_name.toLowerCase().includes(searchText));
  if (selectedCategory && selectedCategory !== "all") {
    filtered = filtered.filter(item => item.category?.trim() === selectedCategory);
  }
  displayRecentItems(filtered);
}

searchInput.addEventListener("input", filterItems);
categoryFilter.addEventListener("change", filterItems);

// ======================
// إدارة السلة
// ======================
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(product) {
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  let cartCount = document.getElementById('cartCount');
  if(cartCount) cartCount.textContent = cart.length;
}

document.addEventListener('DOMContentLoaded', updateCartCount);

// ======================
// قوائم الأصناف في Navbar
// ======================
async function loadCategoriesForNavbar() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    if (Array.isArray(data.items)) {
      const categories = [...new Set(data.items.map(item => item.category?.trim()))];
      const menu = document.getElementById("categoriesMenu");
      categories.forEach(cat => {
        let li = document.createElement("li");
        li.innerHTML = `<a class="dropdown-item" href="categories.html?cat=${encodeURIComponent(cat)}">${cat}</a>`;
        menu.appendChild(li);
      });
    }
  } catch (err) {
    console.error("خطأ في تحميل الفئات:", err);
  }
}

// ======================
// عند التحميل الكامل للصفحة
// ======================
window.addEventListener('DOMContentLoaded', () => {
  loadCategoriesForNavbar();
  loadSeoData();
  loadItems();
  categoryFilter.value = "";
});







