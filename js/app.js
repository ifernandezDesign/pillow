/**
 * ============================================================
 * APP.JS — Capa de inicialización, eventos y microinteracciones
 * ============================================================
 * Conecta Store (datos) con UI (presentación).
 * Maneja eventos del usuario y coordina flujos.
 *
 * Patrón: Event delegation en document para máxima cobertura.
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── ESTADO LOCAL ───────────────────────────────────────────
  let activeCategory = 'todos';
  let cartOpen = false;

  // ─── ELEMENTOS ──────────────────────────────────────────────
  const productGrid  = document.querySelector('[data-product-grid]');
  const filterBar    = document.querySelector('[data-filter-bar]');
  const cartBtn      = document.querySelector('.header__cart');
  const cartDrawer   = document.querySelector('[data-cart-drawer]');
  const cartOverlay  = document.querySelector('[data-cart-overlay]');
  const cartClose    = document.querySelector('[data-cart-close]');

  // ─── RENDER INICIAL ─────────────────────────────────────────
  function init() {
    UI.renderProducts(productGrid, Store.getProducts(activeCategory));
    UI.renderFilters(filterBar, Store.categories, activeCategory);
    UI.updateCartBadge(Store.getCartCount());
    UI.observeReveal();
    attachRipplesToStaticBtns();
  }

  init();

  // ─── RIPPLE EN BOTONES ESTÁTICOS ────────────────────────────
  function attachRipplesToStaticBtns() {
    document.querySelectorAll('.ripple-btn').forEach(btn => UI.attachRipple(btn));
  }

  // ─── EVENTOS: FILTROS ───────────────────────────────────────
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      activeCategory = btn.dataset.filter;
      UI.renderProducts(productGrid, Store.getProducts(activeCategory));
      UI.renderFilters(filterBar, Store.categories, activeCategory);
    });
  }

  // ─── EVENTOS: AGREGAR AL CARRITO ────────────────────────────
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-cart]');
    if (!btn) return;

    const productId = btn.dataset.addCart;
    const product = Store.getProductById(productId);
    if (!product) return;

    Store.addToCart(productId);
    UI.showNotification('\u2713 ' + product.name + ' agregado al carrito');

    // Feedback visual en el botón
    const textEl = btn.querySelector('.btn-text') || btn;
    const originalText = textEl.textContent;
    textEl.textContent = '\u2713 Agregado';
    btn.classList.add('btn--added');
    btn.disabled = true;
    setTimeout(() => {
      textEl.textContent = originalText;
      btn.classList.remove('btn--added');
      btn.disabled = false;
    }, 1600);
  });

  // ─── EVENTOS: CARRITO ACTUALIZADO (pub/sub) ─────────────────
  document.addEventListener('cart:updated', () => {
    UI.updateCartBadge(Store.getCartCount());
    if (cartOpen) UI.renderCartDrawer();
  });

  // ─── DRAWER DEL CARRITO ─────────────────────────────────────
  function openCart() {
    cartOpen = true;
    UI.renderCartDrawer();
    cartDrawer && cartDrawer.classList.add('cart-drawer--open');
    cartOverlay && cartOverlay.classList.add('cart-overlay--visible');
    document.body.style.overflow = 'hidden';
    cartDrawer && cartDrawer.querySelector('[data-cart-close]') &&
      cartDrawer.querySelector('[data-cart-close]').focus();
  }

  function closeCart() {
    cartOpen = false;
    cartDrawer && cartDrawer.classList.remove('cart-drawer--open');
    cartOverlay && cartOverlay.classList.remove('cart-overlay--visible');
    document.body.style.overflow = '';
    cartBtn && cartBtn.focus();
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartOpen) closeCart();
  });

  // ─── EVENTOS: CANTIDAD EN CARRITO ───────────────────────────
  document.addEventListener('click', (e) => {
    // Incrementar
    const incBtn = e.target.closest('[data-qty-inc]');
    if (incBtn) {
      Store.addToCart(incBtn.dataset.qtyInc);
      return;
    }
    // Decrementar
    const decBtn = e.target.closest('[data-qty-dec]');
    if (decBtn) {
      const id = decBtn.dataset.qtyDec;
      const cart = Store.getCart();
      const item = cart.find(i => i.id === id);
      if (item && item.qty > 1) {
        // Decrementar manualmente (Store no tiene decrementCart, lo hacemos aquí)
        item.qty -= 1;
        // Accedemos a saveCart via addToCart trick: usamos removeFromCart + re-add
        // Mejor: llamamos directamente al método interno via evento
        document.dispatchEvent(new CustomEvent('cart:decrement', { detail: { id, cart } }));
      } else {
        Store.removeFromCart(id);
      }
      return;
    }
    // Eliminar
    const removeBtn = e.target.closest('[data-remove-cart]');
    if (removeBtn) {
      const itemEl = removeBtn.closest('[data-cart-item]');
      if (itemEl) {
        itemEl.classList.add('cart-item--removing');
        setTimeout(() => Store.removeFromCart(removeBtn.dataset.removeCart), 250);
      } else {
        Store.removeFromCart(removeBtn.dataset.removeCart);
      }
    }
  });

  // Manejar decremento (Store no expone saveCart directamente)
  document.addEventListener('cart:decrement', (e) => {
    const { id, cart } = e.detail;
    localStorage.setItem('pillow_cart', JSON.stringify(cart));
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
  });

  // ─── CARRUSEL — auto-advance ─────────────────────────────────
  const slides = document.querySelectorAll('input[name="hero-slide"]');
  if (slides.length > 0) {
    let slideIndex = 0;
    setInterval(() => {
      slideIndex = (slideIndex + 1) % slides.length;
      slides[slideIndex].checked = true;
    }, 4000);
  }

  // ─── FAQ ACCORDION ──────────────────────────────────────────
  document.querySelectorAll('[data-faq-question]').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.closest('[data-faq-item]');
      const isOpen = item.classList.contains('faq-item--open');

      document.querySelectorAll('[data-faq-item]').forEach(i => {
        i.classList.remove('faq-item--open');
        i.querySelector('[data-faq-question]').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('faq-item--open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ─── HEADER SCROLL SHADOW ───────────────────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('site-header--scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ─── SCROLL REVEAL — secciones estáticas ────────────────────
  document.querySelectorAll('.trust-bar__item, .value-prop, .service-card, .faq-item').forEach(el => {
    el.classList.add('reveal-item');
  });
  UI.observeReveal();

});
