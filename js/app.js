/**
 * ============================================================
 * APP.JS — Capa de inicialización y eventos
 * ============================================================
 * Conecta Store (datos) con UI (presentación).
 * Maneja eventos del usuario y coordina flujos.
 *
 * Patrón: Event delegation en document para máxima cobertura.
 * Esto permite capturar botones tanto en el grid dinámico
 * como en secciones estáticas (featured product, etc.)
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── ESTADO LOCAL ───────────────────────────────────────────
  let activeCategory = 'todos';

  // ─── ELEMENTOS ──────────────────────────────────────────────
  const productGrid = document.querySelector('[data-product-grid]');
  const filterBar   = document.querySelector('[data-filter-bar]');

  // ─── RENDER INICIAL ─────────────────────────────────────────
  function init() {
    UI.renderProducts(productGrid, Store.getProducts(activeCategory));
    UI.renderFilters(filterBar, Store.categories, activeCategory);
    UI.updateCartBadge(Store.getCartCount());
  }

  init();

  // ─── EVENTOS: FILTROS ───────────────────────────────────────
  // Delegación en filterBar (se re-renderiza, no en botones individuales)
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
  // Delegación en document: captura TODOS los [data-add-cart]
  // incluyendo el featured product estático y el grid dinámico
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-cart]');
    if (!btn) return;

    const productId = btn.dataset.addCart;
    const product = Store.getProductById(productId);
    if (!product) return;

    Store.addToCart(productId);
    UI.showNotification(`✓ ${product.name} agregado al carrito`);

    // Feedback visual en el botón
    btn.textContent = '¡Agregado!';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Agregar al carrito';
      btn.disabled = false;
    }, 1500);
  });

  // ─── EVENTOS: CARRITO ACTUALIZADO (pub/sub) ─────────────────
  document.addEventListener('cart:updated', () => {
    UI.updateCartBadge(Store.getCartCount());
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

      // Cerrar todos primero
      document.querySelectorAll('[data-faq-item]').forEach(i => {
        i.classList.remove('faq-item--open');
        i.querySelector('[data-faq-question]').setAttribute('aria-expanded', 'false');
      });

      // Abrir el clickeado si estaba cerrado
      if (!isOpen) {
        item.classList.add('faq-item--open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

});
