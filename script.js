const products = [
  {
    id: 2,
    name: "فستان يومي بقصة مريحة",
    category: "نساء",
    price: 520,
    rating: "4.8",
    badge: "جديد",
    image: "photo-1539008835657-9e8e9680c956",
    alt: "فستان نسائي أنيق بلون فاتح",
  },
  {
    id: 3,
    name: "حقيبة كتف بتفاصيل ناعمة",
    category: "أحذية",
    price: 780,
    oldPrice: 950,
    rating: "4.7",
    badge: "خصم 18%",
    image: "photo-1584917865442-de89df76afd3",
    alt: "حقيبة يد بلون بني",
  },
  {
    id: 4,
    name: "طقم إكسسوارات يومي",
    category: "إكسسوارات",
    price: 350,
    rating: "4.9",
    badge: "اختيارنا",
    image: "photo-1611652022419-a9419f74343d",
    alt: "إكسسوارات ذهبية بتصميم بسيط",
  },
  {
    id: 6,
    name: "سنيكرز مريح طول اليوم",
    category: "أحذية",
    price: 720,
    oldPrice: 880,
    rating: "4.6",
    badge: "خصم 18%",
    image: "photo-1542291026-7eec264c27ff",
    alt: "حذاء رياضي مريح",
  },
  {
    id: 7,
    name: "جاكيت خفيف للمشاوير",
    category: "نساء",
    price: 890,
    rating: "4.8",
    badge: "جديد",
    image: "photo-1548624149-f61c0a5f8d43",
    alt: "إطلالة نسائية مع جاكيت خفيف",
  },
  {
    id: 8,
    name: "نظارة شمس بإطار عصري",
    category: "إكسسوارات",
    price: 440,
    oldPrice: 520,
    rating: "4.8",
    badge: "خصم 15%",
    image: "photo-1511499767150-a48a237f0083",
    alt: "نظارة شمسية بإطار أنيق",
  },
];

const money = new Intl.NumberFormat("ar-EG");
const cart = new Map();
const favorites = new Set();
let activeCategory = "الكل";
let searchQuery = "";
let favoritesOnly = false;
let toastTimeout;

const productGrid = document.querySelector("#product-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search-input");
const cartCount = document.querySelector("#cart-count");
const cartDrawer = document.querySelector("#cart-drawer");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartFooter = document.querySelector("#cart-footer");
const cartTotal = document.querySelector("#cart-total");
const overlay = document.querySelector("#overlay");
const toast = document.querySelector("#toast");

function imageUrl(image, width = 600) {
  return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=80`;
}

function formatPrice(price) {
  return `${money.format(price)} جنيه`;
}

function renderProducts() {
  const visibleProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "الكل" ||
      activeCategory === "العروض" ||
      product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category}`
      .toLocaleLowerCase("ar")
      .includes(searchQuery.toLocaleLowerCase("ar"));
    const isOnSale = activeCategory !== "العروض" || product.oldPrice;
    const isFavorite = !favoritesOnly || favorites.has(product.id);
    return matchesCategory && matchesSearch && isOnSale && isFavorite;
  });

  productGrid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-photo">
            <img src="${imageUrl(product.image)}" alt="${product.alt}" loading="lazy" />
            ${product.badge ? `<span class="product-badge ${product.oldPrice ? "sale" : ""}">${product.badge}</span>` : ""}
            <button
              class="favorite-button ${favorites.has(product.id) ? "is-favorite" : ""}"
              type="button"
              data-favorite="${product.id}"
              aria-label="${favorites.has(product.id) ? "إزالة من" : "إضافة إلى"} المفضلة"
              aria-pressed="${favorites.has(product.id)}"
            >${favorites.has(product.id) ? "♥" : "♡"}</button>
          </div>
          <div class="product-info">
            <span class="product-category">${product.category}</span>
            <span class="product-name">${product.name}</span>
            <div class="product-meta">
              <span class="product-price">${formatPrice(product.price)}${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ""}</span>
              <span class="product-rating" aria-label="التقييم ${product.rating} من 5">★ ${product.rating}</span>
            </div>
            <button class="add-button" type="button" data-add="${product.id}">أضيفي للسلة +</button>
          </div>
        </article>
      `,
    )
    .join("");

  emptyState.hidden = visibleProducts.length > 0;
}

function updateCart() {
  const items = [...cart.entries()];
  const quantity = items.reduce((sum, [, count]) => sum + count, 0);
  const total = items.reduce((sum, [id, count]) => {
    const product = products.find((item) => item.id === id);
    return sum + product.price * count;
  }, 0);

  cartCount.textContent = money.format(quantity);
  cartItems.innerHTML = items
    .map(([id, count]) => {
      const product = products.find((item) => item.id === id);
      return `
        <article class="cart-item">
          <img src="${imageUrl(product.image, 180)}" alt="${product.alt}" />
          <div>
            <h3>${product.name}</h3>
            <p>${formatPrice(product.price)}</p>
            <div class="quantity-control" aria-label="الكمية">
              <button type="button" data-quantity="${id}" data-change="-1" aria-label="تقليل الكمية">−</button>
              <span>${money.format(count)}</span>
              <button type="button" data-quantity="${id}" data-change="1" aria-label="زيادة الكمية">+</button>
            </div>
          </div>
          <button class="remove-item" type="button" data-remove="${id}" aria-label="حذف ${product.name}">×</button>
        </article>
      `;
    })
    .join("");

  cartEmpty.hidden = quantity > 0;
  cartFooter.hidden = quantity === 0;
  cartTotal.textContent = formatPrice(total);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("show"), 2300);
}

function setCategory(category) {
  activeCategory = category;
  favoritesOnly = false;
  document.querySelectorAll(".filter-chip").forEach((button) => {
    const selected = button.dataset.filter === category;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  renderProducts();
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  document.body.classList.add("drawer-open");
  document.querySelector("#cart-close").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
  document.body.classList.remove("drawer-open");
  document.querySelector("#cart-open").focus();
}

document.querySelector(".search").addEventListener("submit", (event) => {
  event.preventDefault();
  searchQuery = searchInput.value.trim();
  renderProducts();
  document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
});

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim();
  renderProducts();
});

document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => setCategory(button.dataset.filter));
});

document.querySelectorAll("[data-category], [data-nav-category]").forEach((button) => {
  button.addEventListener("click", () => {
    setCategory(button.dataset.category || button.dataset.navCategory);
    document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector("#clear-filter").addEventListener("click", (event) => {
  event.preventDefault();
  searchInput.value = "";
  searchQuery = "";
  setCategory("الكل");
});

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest("[data-favorite]");

  if (addButton) {
    const id = Number(addButton.dataset.add);
    cart.set(id, (cart.get(id) || 0) + 1);
    updateCart();
    showToast("اتضافت للسلة بنجاح ♡");
  }

  if (favoriteButton) {
    const id = Number(favoriteButton.dataset.favorite);
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    renderProducts();
  }
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    const id = Number(quantityButton.dataset.quantity);
    const nextQuantity = (cart.get(id) || 0) + Number(quantityButton.dataset.change);
    if (nextQuantity <= 0) cart.delete(id);
    else cart.set(id, nextQuantity);
    updateCart();
  }

  if (removeButton) {
    cart.delete(Number(removeButton.dataset.remove));
    updateCart();
  }
});

document.querySelector("#cart-open").addEventListener("click", openCart);
document.querySelector("#cart-close").addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) closeCart();
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  const items = [...cart.entries()].map(([id, count]) => {
    const product = products.find((item) => item.id === id);
    return `- ${product.name} × ${money.format(count)}: ${formatPrice(product.price * count)}`;
  });
  const total = [...cart.entries()].reduce((sum, [id, count]) => {
    const product = products.find((item) => item.id === id);
    return sum + product.price * count;
  }, 0);
  const message = [
    "مرحبًا، أريد إتمام الطلب من menna store:",
    ...items,
    `الإجمالي: ${formatPrice(total)}`,
  ].join("\n");
  const whatsappUrl = `https://wa.me/201224836685?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.reset();
  showToast("شكرًا لاشتراكك، استني جديدنا ♡");
});

document.querySelector(".favorite-shortcut").addEventListener("click", () => {
  if (favorites.size === 0) {
    showToast("لسه ما ضفتيش حاجة للمفضلة");
    return;
  }
  activeCategory = "الكل";
  favoritesOnly = true;
  document.querySelectorAll(".filter-chip").forEach((button) => {
    const selected = button.dataset.filter === "الكل";
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  searchInput.value = "";
  searchQuery = "";
  renderProducts();
  showToast("دي منتجاتك المفضلة ♡");
  document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
});

renderProducts();
updateCart();
