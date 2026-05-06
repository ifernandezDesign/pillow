# PILLOW — Arquitectura Frontend Reutilizable para E-commerce

> Ejemplo de referencia: cómo estructurar un frontend de e-commerce con separación de capas, estado reactivo, y UI orientada a conversión.

## 🏗️ Arquitectura

```
pillow/
├── index.html          → Estructura semántica (HTML5)
├── styles.css          → Sistema de diseño con CSS variables (tokens)
├── js/
│   ├── store.js        → Capa de DATOS y ESTADO (productos, carrito, localStorage)
│   ├── ui.js           → Capa de RENDERIZADO (DOM manipulation, templates)
│   └── app.js          → Capa de COORDINACIÓN (eventos, inicialización)
├── fotos/              → Assets estáticos
└── README.md           → Este archivo
```

## 🧠 Decisiones de Arquitectura

| Decisión | Por qué |
|----------|---------|
| Vanilla JS (sin framework) | Demuestra patrones sin dependencias. Migrable a React/Vue/Svelte. |
| Módulos IIFE (`Store`, `UI`) | Encapsulación sin bundler. En producción: ES modules + bundler. |
| CSS Custom Properties | Theming centralizado. Cambiar un token cambia todo el sistema. |
| BEM naming | Predecible, escalable, sin conflictos de especificidad. |
| Event delegation | Performance: un listener por contenedor, no por botón. |
| CustomEvents (pub/sub) | Desacoplamiento: Store no conoce UI, UI no conoce Store. |
| localStorage para carrito | Persistencia mínima sin backend. En producción: API + auth. |
| Mobile-first responsive | Diseño para el caso más restrictivo primero. |

## 📐 Capas

### `store.js` — Datos y Estado
- Fuente de verdad de productos (en producción: API)
- CRUD de carrito con persistencia en localStorage
- Emite `CustomEvent('cart:updated')` cuando cambia el estado
- Filtrado por categoría

### `ui.js` — Presentación
- Recibe datos, devuelve HTML (template strings)
- No tiene estado propio
- Funciones puras de renderizado
- Notificaciones toast

### `app.js` — Coordinación
- Conecta Store con UI
- Event delegation para clicks
- Inicialización y lifecycle
- Carrusel auto-advance

## 🎨 Sistema de Diseño

Tokens definidos en `:root` de `styles.css`:
- **Colores**: primary, accent, surfaces, text
- **Tipografía**: display (DM Serif Display) + body (Outfit)
- **Espaciado**: escala de 4px (xs → 3xl)
- **Sombras**: 4 niveles (sm, md, lg, xl)
- **Radios**: sm, md, lg, full
- **Transiciones**: fast, base, slow

## 🛒 Funcionalidad Implementada

- [x] Catálogo de productos renderizado desde datos
- [x] Filtros por categoría (reactivos)
- [x] Carrito: agregar productos
- [x] Persistencia en localStorage
- [x] Badge de carrito reactivo
- [x] Notificaciones toast
- [x] Carrusel hero con auto-advance
- [x] FAQ accordion
- [x] Responsive (mobile/tablet/desktop)

## 🚀 Para Escalar (no implementado)

- [ ] Carrito completo (quitar items, cambiar cantidad, checkout)
- [ ] Routing (SPA o MPA con páginas de producto)
- [ ] Búsqueda y filtros avanzados
- [ ] Auth y perfil de usuario
- [ ] Backend API (REST/GraphQL)
- [ ] Testing (unit + e2e)
- [ ] Build pipeline (bundler, minificación, tree-shaking)
- [ ] SSR/SSG para SEO

## 💡 Cómo Reutilizar

1. **Cambiar vertical**: Editar `store.js` con tus productos
2. **Cambiar estética**: Modificar variables en `:root`
3. **Agregar framework**: Reemplazar `ui.js` por componentes React/Vue
4. **Agregar backend**: Reemplazar localStorage en `store.js` por fetch a API

---

*Este proyecto es un ejemplo de arquitectura, no una tienda en producción.*
