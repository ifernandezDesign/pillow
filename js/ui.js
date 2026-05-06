/**
 * ============================================================
 * UI.JS — Capa de renderizado + microinteracciones
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
    return '\u0024' + num.toLocaleString('es-AR');
  }

  // ─── RENDER: PRODUCTOS ──────────────────────────────────────
  function renderProducts(container, products) {
    if (!container) return;

    container.innerHTML = products.map(product => {
      const badge = product.badge
        ? `<span class="product-card__badge">${product.badge}</span>`
        : '';
      const discount = product.discount
        ? `<span class="product-card__discount">${product.discount}% Off</span>`
        : '';

      return `
        <article class="product-card reveal-item" data-id="${product.id}">
          <div class="product-card__image-wrap">
            <img loading="lazy" src="${product.image}" alt="${product.name}" class="product-card__image" />
            ${badge}
            ${discount}
            <div class="product-card__quick-view" aria-hidden="true">Ver detalle</div>
          </div>
          <div class="product-card__info">
            <h3 class="product-card__name">${product.name}</h3>
            <p class="product-card__desc">${product.description}</p>
            <div class="product-card__pricing">
              <p class="product-card__price">${formatPrice(product.price)}</p>
              <p class="product-card__installments">${product.installments.count} cuotas de ${formatPrice(product.installments.amount)}</p>
            </div>
            <button class="product-card__cta btn btn--primary ripple-btn" data-add-cart="${product.id}">
              <span class="btn-text">Agregar al carrito</span>
              <span class="btn-icon" aria-hidden="true">+</span>
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Activar reveal en las nuevas cards
    requestAnimationFrame(() => observeReveal());
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

    container.innerHTML = categories.map(cat => {
      const isActive = cat === activeCategory ? 'filter-btn--active' : '';
      return `<button class="filter-btn ${isActive}" data-filter="${cat}">${labels[cat] || cat}</button>`;
    }).join('');
  }

  // ─── RENDER: CARRITO BADGE ──────────────────────────────────
  function updateCartBadge(count) {
    const badge = document.querySelector('[data-cart-count]');
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';

    // Animación "pop" en el badge
    badge.classList.remove('badge-pop');
    void badge.offsetWidth; // reflow para reiniciar animación
    if (count > 0) badge.classList.add('badge-pop');
  }

  // ─── RENDER: DRAWER DEL CARRITO ─────────────────────────────
  function renderCartDrawer() {
    const cart = Store.getCart();
    const itemsEl = document.querySelector('[data-cart-items]');
    const totalEl = document.querySelector('[data-cart-total]');
    const emptyEl = document.querySelector('[data-cart-empty]');
    const footerEl = document.querySelector('[data-cart-footer]');

    if (!itemsEl) return;

    if (cart.length === 0) {
      itemsEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'flex';
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';

    itemsEl.innerHTML = cart.map(item => {
      const product = Store.getProductById(item.id);
      if (!product) return '';
      return `
        <div class="cart-item" data-cart-item="${item.id}">
          <img src="${product.image}" alt="${product.name}" class="cart-item__img" />
          <div class="cart-item__info">
            <p class="cart-item__name">${product.name}</p>
            <p class="cart-item__price">${formatPrice(product.price)}</p>
            <div class="cart-item__qty">
              <button class="qty-btn" data-qty-dec="${item.id}" aria-label="Quitar uno">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" data-qty-inc="${item.id}" aria-label="Agregar uno">+</button>
            </div>
          </div>
          <button class="cart-item__remove" data-remove-cart="${item.id}" aria-label="Eliminar ${product.name}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');

    if (totalEl) totalEl.textContent = formatPrice(Store.getCartTotal());
  }

  // ─── RENDER: NOTIFICACIÓN TOAST ─────────────────────────────
  function showNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'notification';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.textContent = message;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('notification--visible'));
    });

    setTimeout(() => {
      el.classList.remove('notification--visible');
      setTimeout(() => el.remove(), 350);
    }, 2200);
  }

  // ─── SCROLL REVEAL (Intersection Observer) ──────────────────
  let revealObserver = null;

  function observeReveal() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: mostrar todo sin animación
      document.querySelectorAll('.reveal-item').forEach(el => el.classList.add('revealed'));
      return;
    }

    if (revealObserver) revealObserver.disconnect();

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger delay basado en posición en el grid
          const delay = (i % 4) * 80;
          setTimeout(() => entry.target.classList.add('revealed'), delay);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-item:not(.revealed)').forEach(el => {
      revealObserver.observe(el);
    });
  }

  // ─── RIPPLE EFFECT ──────────────────────────────────────────
  function attachRipple(btn) {
    btn.addEventListener('click', function(e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  // ─── API PÚBLICA ────────────────────────────────────────────
  return {
    renderProducts,
    renderFilters,
    updateCartBadge,
    renderCartDrawer,
    showNotification,
    observeReveal,
    attachRipple,
    formatPrice
  };
})();
