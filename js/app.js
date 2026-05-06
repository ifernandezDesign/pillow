/**
 * ============================================================
 * APP.JS — Capa de inicialización y eventos
 * ============================================================
 * Conecta Store (datos) con UI (presentación).
 * Maneja eventos del usuario y coordina flujos.
 * 
 * Patrón: Event delegation + pub/sub via CustomEvents.
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ─── ESTADO LOCAL ───────────────────────────────────────────
  let activeCategory = 'todos';

  // ─── ELEMENTOS ──────────────────────────────────────────────
  const productGrid = document.querySelector('[data-product-grid]');
  const filterBar = document.querySelector('[data-filter-bar]');

  // ─── RENDER INICIAL ─────────────────────────────────────────
  function init() {
    const products = Store.getProducts(activeCategory);
    UI.renderProducts(productGrid, products);
    UI.renderFilters(filterBar, Store.categories, activeCategory);
    UI.updateCartBadge(Store.getCartCount());
  }

  init();

  // ─── EVENTOS: FILTROS ───────────────────────────────────────
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      
      activeCategory = btn.dataset.filter;
      const products = Store.getProducts(activeCategory);
      UI.renderProducts(productGrid, products);
      UI.renderFilters(filterBar, Store.categories, activeCategory);
    });
  }

  // ─── EVENTOS: AGREGAR AL CARRITO ────────────────────────────
  if (productGrid) {
    productGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add-cart]');
      if (!btn) return;

      const productId = btn.dataset.addCart;
      Store.addToCart(productId);
      
      const product = Store.getProductById(productId);
      UI.showNotification(`✓ ${product.name} agregado al carrito`);
    });
  }

  // ─── EVENTOS: CARRITO ACTUALIZADO (pub/sub) ─────────────────
  document.addEventListener('cart:updated', (e) => {
    UI.updateCartBadge(Store.getCartCount());
  });

  // ─── CARRUSEL (CSS-only con auto-advance) ───────────────────
  const radios = document.querySelectorAll('input[name="hero-slide"]');
  if (radios.length > 0) {
    let slideIndex = 0;
    setInterval(() => {
      slideIndex = (slideIndex + 1) % radios.length;
      radios[slideIndex].checked = true;
    }, 4000);
  }

  // ─── FAQ ACCORDION ──────────────────────────────────────────
  document.querySelectorAll('[data-faq-question]').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.closest('[data-faq-item]');
      const isOpen = item.classList.contains('faq-item--open');
      
      // Cerrar todos
      document.querySelectorAll('[data-faq-item]').forEach(i => 
        i.classList.remove('faq-item--open')
      );
      
      // Toggle actual
      if (!isOpen) item.classList.add('faq-item--open');
    });
  });

});
