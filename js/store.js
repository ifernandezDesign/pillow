/**
 * ============================================================
 * STORE.JS — Capa de datos y estado
 * ============================================================
 * Arquitectura: Separación de datos del DOM.
 * Los productos viven aquí como fuente de verdad.
 * El carrito usa localStorage para persistencia básica.
 * 
 * En producción: esto se reemplaza por una API REST/GraphQL.
 * ============================================================
 */

const Store = (() => {
  // ─── PRODUCTOS (fuente de verdad) ───────────────────────────
  const products = [
    {
      id: 'colchon-nucleo-solido',
      name: 'Núcleo Sólido',
      category: 'colchones',
      price: 347150,
      installments: { count: 12, amount: 28929 },
      discount: 15,
      image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/d26924524560b40876fd8dfb7e75cc0eb8a1cd6424621d20631d1eeb611790a4?placeholderIfAbsent=true&apiKey=7272386c89b946b6a42435875d754373',
      badge: 'Más vendido',
      description: 'Soporte firme con capas de confort premium'
    },
    {
      id: 'base-chocolate',
      name: 'Base Chocolate',
      category: 'bases',
      price: 240000,
      installments: { count: 12, amount: 20000 },
      discount: 10,
      image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/d95bbc78d762d39a692385f0b1791ef87a422431239ca2e1b945a547b848dccc?placeholderIfAbsent=true&apiKey=7272386c89b946b6a42435875d754373',
      badge: null,
      description: 'Base reforzada con diseño minimalista'
    },
    {
      id: 'almohada-liviana',
      name: 'Almohada Liviana',
      category: 'almohadas',
      price: 50000,
      installments: { count: 6, amount: 8333 },
      discount: 10,
      image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/5ac38690fa7faafb63332f5498dfc71dd29619c7bd75bd35026f7143d99f9615?placeholderIfAbsent=true&apiKey=7272386c89b946b6a42435875d754373',
      badge: '2x1',
      description: 'Relleno hipoalergénico, funda lavable'
    },
    {
      id: 'sommier-premium',
      name: 'Sommier Premium',
      category: 'sommiers',
      price: 280000,
      installments: { count: 12, amount: 23333 },
      discount: 10,
      image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/1dcb801a4880704a3c0c55d65b249040329e868ea7b623afbae4814804ea35c8?placeholderIfAbsent=true&apiKey=7272386c89b946b6a42435875d754373',
      badge: null,
      description: 'Estructura de acero con resortes independientes'
    },
    {
      id: 'sabanas-premium',
      name: 'Juego de Sábanas',
      category: 'accesorios',
      price: 80000,
      installments: { count: 6, amount: 13333 },
      discount: 10,
      image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/b7a3e51ae5959dc098b51dd577fa532fb7c0884b7a57c7f39ee77c44f0e32e8b?placeholderIfAbsent=true&apiKey=7272386c89b946b6a42435875d754373',
      badge: null,
      description: 'Algodón 400 hilos, suavidad garantizada'
    }
  ];

  // ─── CATEGORÍAS ─────────────────────────────────────────────
  const categories = ['todos', 'colchones', 'almohadas', 'sommiers', 'bases', 'accesorios'];

  // ─── CARRITO (estado + persistencia) ────────────────────────
  const CART_KEY = 'pillow_cart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
  }

  function addToCart(productId) {
    const cart = getCart();
    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: productId, qty: 1 });
    }
    saveCart(cart);
  }

  function removeFromCart(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
  }

  function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.id);
      return total + (product ? product.price * item.qty : 0);
    }, 0);
  }

  // ─── FILTROS ────────────────────────────────────────────────
  function getProducts(category = 'todos') {
    if (category === 'todos') return [...products];
    return products.filter(p => p.category === category);
  }

  function getProductById(id) {
    return products.find(p => p.id === id) || null;
  }

  // ─── API PÚBLICA ────────────────────────────────────────────
  return {
    products,
    categories,
    getProducts,
    getProductById,
    getCart,
    addToCart,
    removeFromCart,
    getCartCount,
    getCartTotal
  };
})();
