/**
 * ============================================================
 * UI.JS — Capa de renderizado
 * ============================================================
 * Responsabilidad: tomar datos del Store y pintar el DOM.
 * No conoce lógica de negocio, solo presenta.
 * 
 * Patrón: Template rendering con innerHTML controlado.
 * En producción: se reemplaza por componentes (React/Vue/Svelte).
 * ============================================================
 */

const UI = (() => {

  // ─── HELPERS ────────────────────────────────────────────────
  function formatPrice(num) {
    return '$' + num.toLocaleString('es-AR');
  }

  // ─── RENDER: PRODUCTOS ──────────────────────────────────────
  function renderProducts(container, products) {
    if (!container) return;
    
    container.innerHTML = products.map(product => `
      <article class="product-card" data-id="${product.id}">
        <div class="product-card__image-wrap">
          <img loading="lazy" src="${product.image}" alt="${product.name}" class="product-card__image" />
          ${product.badge ? `<span class="product-card__badge">${product.badge}</span>` : ''}
          ${product.discount ? `<span class="product-card__discount">${product.discount}% Off</span>` : ''}
        </div>
        <div class="product-card__info">
          <h3 class="product-card__name">${product.name}</h3>
          <p class="product-card__desc">${product.description}</p>
          <p class="product-card__price">${formatPrice(product.price)}</p>
          <p class="product-card__installments">${product.installments.count} cuotas de ${formatPrice(product.installments.amount)}</p>
          <button class="product-card__cta btn btn--primary" data-add-cart="${product.id}">
            Agregar al carrito
          </button>
        </div>
      </article>
    `).join('');
  }

  // ─── RENDER: FILTROS ────────────────────────────────────────
  function renderFilters(container, categories, activeCategory) {
    if (!container) return;

    const labels = {
      todos: 'Todos',
      colchones: 'Colchones',
      almohadas: 'Almohadas',
      sommiers: 'Sommiers',
      bases: 'Bases',
      accesorios: 'Accesorios'
    };

    container.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat === activeCategory ? 'filter-btn--active' : ''}" data-filter="${cat}">
        ${labels[cat] || cat}
      </button>
    `).join('');
  }

  // ─── RENDER: CARRITO BADGE ──────────────────────────────────
  function updateCartBadge(count) {
    const badge = document.querySelector('[data-cart-count]');
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  // ─── RENDER: NOTIFICACIÓN ──────────────────────────────────
  function showNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'notification';
    el.textContent = message;
    document.body.appendChild(el);

    requestAnimationFrame(() => el.classList.add('notification--visible'));
    setTimeout(() => {
      el.classList.remove('notification--visible');
      setTimeout(() => el.remove(), 300);
    }, 2000);
  }

  // ─── API PÚBLICA ────────────────────────────────────────────
  return {
    renderProducts,
    renderFilters,
    updateCartBadge,
    showNotification,
    formatPrice
  };
})();
