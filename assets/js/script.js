const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const yearElement = document.getElementById("year");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");
const loginButton = document.querySelector(".btn-login");
const contactForm = document.getElementById("contactForm");
const reservationForm = document.getElementById("reservationForm");
const formMessage = document.getElementById("formMessage");
const reservationMessage = document.getElementById("reservationMessage");
const serviceToggles = document.querySelectorAll(".service-toggle");
const storeSearch = document.getElementById("storeSearch");
const storePriceMax = document.getElementById("storePriceMax");
const storePriceValue = document.getElementById("storePriceValue");
const storeEmptyState = document.getElementById("storeEmptyState");
const storeTypeFilters = document.querySelectorAll(".store-filter-type");
const storeBrandFilters = document.querySelectorAll(".store-filter-brand");
const storeItems = document.querySelectorAll(".store-item");
const productDetail = document.getElementById("productDetail");
const productNotFound = document.getElementById("productNotFound");
const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");
const productSpecs = document.getElementById("productSpecs");
const productMainImage = document.getElementById("productMainImage");
const productThumbs = document.getElementById("productThumbs");
const productQty = document.getElementById("productQty");
const productTotal = document.getElementById("productTotal");
const productReserveLink = document.getElementById("productReserveLink");
const productReservationForm = document.getElementById("productReservationForm");
const productReservationMessage = document.getElementById("productReservationMessage");
const productReservationSummary = document.getElementById("productReservationSummary");
const productReservationQty = document.getElementById("productReservationQty");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

// Base de datos FixLab (Supabase)
const FixLabDB = {
  collections: {
    USERS: 'fixlab_db_users',
    RESERVATIONS: 'fixlab_db_reservations',
    SESSION: 'fixlab_db_session',
    SETTINGS: 'fixlab_db_settings'
  },

  // Operadores de consulta soportados
  _operators: {
    $eq: (val, target) => val === target,
    $ne: (val, target) => val !== target,
    $gt: (val, target) => val > target,
    $gte: (val, target) => val >= target,
    $lt: (val, target) => val < target,
    $lte: (val, target) => val <= target,
    $in: (val, arr) => arr.includes(val),
    $nin: (val, arr) => !arr.includes(val),
    $regex: (val, pattern) => new RegExp(pattern).test(val),
    $exists: (val, exists) => (exists ? val !== undefined : val === undefined)
  },

  // Evaluar si un documento cumple una condición (soporta operadores)
  _matches: (doc, condition) => {
    if (condition === null || condition === undefined) return doc === condition;
    if (typeof condition !== 'object' || condition === null) return doc === condition;

    return Object.keys(condition).every(key => {
      const val = doc[key];
      const cond = condition[key];

      if (key.startsWith('$')) return true;

      if (cond !== null && typeof cond === 'object' && !Array.isArray(cond)) {
        return Object.keys(cond).every(op => {
          const opFn = FixLabDB._operators[op];
          return opFn ? opFn(val, cond[op]) : true;
        });
      }
      return val === cond;
    });
  },

  // Simulación de hash de contraseña (básico)
  hashPassword: (password) => {
    let hash = '';
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash += String.fromCharCode(((char * 7 + 13) % 94) + 33);
    }
    return btoa(hash + '_' + password.length);
  },

  // Verificar contraseña
  verifyPassword: (input, storedHash) => {
    try {
      const decoded = atob(storedHash).split('_');
      const length = parseInt(decoded[1]);
      return FixLabDB.hashPassword(input) === storedHash && input.length === length;
    } catch {
      return false;
    }
  },

  // Simulación de cifrado para proteger el localStorage
  _encrypt: (data) => {
    try {
      const str = JSON.stringify(data);
      let res = "";
      for (let i = 0; i < str.length; i++) {
        res += String.fromCharCode(str.charCodeAt(i) ^ 0x0F);
      }
      return btoa(res);
    } catch (e) { return ""; }
  },

  _decrypt: (str) => {
    try {
      const decoded = atob(str);
      let res = "";
      for (let i = 0; i < decoded.length; i++) {
        res += String.fromCharCode(decoded.charCodeAt(i) ^ 0x0F);
      }
      return JSON.parse(res);
    } catch (e) { return null; }
  },

  // Obtener colección
  getCollection: (collectionName) => {
    return window.FixLabSupabaseDB
      ? window.FixLabSupabaseDB.getCollectionSync(collectionName)
      : [];
  },

  // Guardar colección
  saveCollection: (collectionName, data) => {
    if (window.FixLabSupabaseDB) {
      window.FixLabSupabaseDB.saveCollection(collectionName, data);
    }
  },

  // Insertar documento
  insert: (collectionName, document) => {
    const collection = FixLabDB.getCollection(collectionName);
    document._id = 'fl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    document.createdAt = new Date().toISOString();
    collection.push(document);
    FixLabDB.saveCollection(collectionName, collection);
    return document;
  },

  // Insertar múltiples documentos
  insertMany: (collectionName, documents) => {
    const collection = FixLabDB.getCollection(collectionName);
    const inserted = documents.map(doc => {
      doc._id = 'fl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      doc.createdAt = new Date().toISOString();
      return doc;
    });
    FixLabDB.saveCollection(collectionName, [...collection, ...inserted]);
    return inserted;
  },

  // Buscar documentos con opciones: sort, skip, limit
  find: (collectionName, query = {}, options = {}) => {
    const collection = FixLabDB.getCollection(collectionName);
    let results = collection.filter(item => FixLabDB._matches(item, query));

    if (options.sort) {
      const [field, order] = Array.isArray(options.sort) ? options.sort : [options.sort, 1];
      results.sort((a, b) => {
        if (a[field] < b[field]) return -1 * order;
        if (a[field] > b[field]) return 1 * order;
        return 0;
      });
    }

    if (options.skip) results = results.slice(options.skip);
    if (options.limit) results = results.slice(0, options.limit);

    return results;
  },

  // Encontrar un documento
  findOne: (collectionName, query = {}, options = {}) => {
    return FixLabDB.find(collectionName, query, { ...options, limit: 1 })[0] || null;
  },

  // Contar documentos
  count: (collectionName, query = {}) => {
    return FixLabDB.find(collectionName, query).length;
  },

  // Actualizar documentos (soporta $set, $inc, $push)
  update: (collectionName, query, updates, options = {}) => {
    const collection = FixLabDB.getCollection(collectionName);
    let updated = 0;
    const newCollection = collection.map(item => {
      if (!FixLabDB._matches(item, query)) return item;
      updated++;
      const updatedItem = { ...item, updatedAt: new Date().toISOString() };

      if (updates.$set) Object.assign(updatedItem, updates.$set);
      else if (updates.$inc) {
        Object.keys(updates.$inc).forEach(k => {
          updatedItem[k] = (updatedItem[k] || 0) + updates.$inc[k];
        });
      } else if (updates.$push) {
        Object.keys(updates.$push).forEach(k => {
          updatedItem[k] = [...(updatedItem[k] || []), updates.$push[k]];
        });
      } else {
        Object.assign(updatedItem, updates);
      }

      return updatedItem;
    });
    if (updated) FixLabDB.saveCollection(collectionName, newCollection);
    return options.multi ? updated : (updated > 0 ? 1 : 0);
  },

  // Actualizar un documento
  updateOne: (collectionName, query, updates) => {
    return FixLabDB.update(collectionName, query, updates, { multi: false });
  },

  // Eliminar documentos
  remove: (collectionName, query) => {
    const collection = FixLabDB.getCollection(collectionName);
    const newCollection = collection.filter(item => !FixLabDB._matches(item, query));
    const removed = collection.length - newCollection.length;
    if (removed) FixLabDB.saveCollection(collectionName, newCollection);
    return removed;
  },

  // Eliminar un documento
  removeOne: (collectionName, query) => {
    const collection = FixLabDB.getCollection(collectionName);
    const idx = collection.findIndex(item => FixLabDB._matches(item, query));
    if (idx === -1) return 0;
    collection.splice(idx, 1);
    FixLabDB.saveCollection(collectionName, collection);
    return 1;
  },

  // Vaciar colección
  clear: (collectionName) => {
    const collection = FixLabDB.getCollection(collectionName);
    const count = collection.length;
    FixLabDB.saveCollection(collectionName, []);
    return count;
  },

  // Exportar colección a JSON
  exportCollection: (collectionName) => {
    return JSON.stringify(FixLabDB.getCollection(collectionName));
  },

  // Importar JSON a colección (reemplaza existentes)
  importCollection: (collectionName, jsonString, merge = false) => {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data)) return false;
      if (merge) {
        const existing = FixLabDB.getCollection(collectionName);
        FixLabDB.saveCollection(collectionName, [...existing, ...data]);
      } else {
        FixLabDB.saveCollection(collectionName, data);
      }
      return true;
    } catch {
      return false;
    }
  },

  // Exportar toda la base de datos
  exportAll: () => {
    const data = {};
    Object.values(FixLabDB.collections).forEach(key => {
      data[key] = FixLabDB.getCollection(key);
    });
    return JSON.stringify(data);
  },

  // Hacer backup en Supabase
  backup: (label = 'auto') => {
    console.warn('Los backups locales se han desactivado al usar Supabase.');
    return 'supabase';
  },

  // Inicializar base de datos: espera a que Supabase cargue todos los datos
  // antes de que la UI intente leerlos, evitando la página vacía inicial.
  init: async () => {
    if (!window.FixLabSupabaseDB) return;

    // Helpers para sincronizar la splash screen con la carga real
    const setSplashProgress = (pct) => {
      const bar = document.getElementById('splashProgress');
      if (bar) bar.style.width = pct + '%';
    };
    const setSplashText = (text) => {
      const txt = document.getElementById('splashText');
      if (txt) txt.textContent = text;
    };

    setSplashProgress(30);
    setSplashText('CONECTANDO CON SUPABASE...');

    try {
      await window.FixLabSupabaseDB.ready;
      setSplashProgress(100);
      setSplashText('LISTO');
    } catch (e) {
      console.error('[FixLabDB] Error al cargar datos remotos:', e);
      setSplashProgress(100);
      setSplashText('MODO OFFLINE');
    }

    // Señal para que el resto del código (y la splash) sepan que el DB está listo
    FixLabDB._ready = true;
    document.dispatchEvent(new CustomEvent('fixlab:db:ready'));
  }
};

// Inicializar BD y re-pintar UI dependiente de sesión una vez que Supabase responda.
// Necesario porque rawSession (línea siguiente) se evalúa en tiempo de parse
// con el cache vacío, por lo que currentSessionUser siempre arranca como null.
FixLabDB.init().then(() => {

  // Re-leer sesión desde el cache ya cargado
  const freshRaw = FixLabDB.getCollection(FixLabDB.collections.SESSION);
  const freshSession = Array.isArray(freshRaw) ? freshRaw[0] : freshRaw;
  const freshUser = freshSession?.email || null;

  if (freshUser) {
    // ── Re-pintar botón de header ──────────────────────────────────────────
    const btn = document.querySelector('.btn-login');
    if (btn) {
      btn.textContent = 'Cerrar sesión';
      btn.setAttribute('href', '#');
      // Clonar para limpiar listeners "Iniciar sesión" ya adjuntados
      const freshBtn = btn.cloneNode(true);
      freshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        FixLabDB.saveCollection(FixLabDB.collections.SESSION, []);
        window.location.href = 'index.html';
      });
      btn.replaceWith(freshBtn);
    }

    // ── Re-pintar enlace de nav móvil ──────────────────────────────────────
    const authLink = document.querySelector('.nav-auth-item a');
    if (authLink) {
      authLink.textContent = 'Cerrar sesión';
      authLink.setAttribute('href', '#');
      const freshLink = authLink.cloneNode(true);
      freshLink.addEventListener('click', (e) => {
        e.preventDefault();
        FixLabDB.saveCollection(FixLabDB.collections.SESSION, []);
        window.location.href = 'index.html';
      });
      authLink.replaceWith(freshLink);
    }

    // ── Mostrar email en seguimiento si aplica ─────────────────────────────
    const trackingEmailEl = document.getElementById('trackingEmail');
    if (trackingEmailEl) trackingEmailEl.textContent = freshUser;

    // ── Pre-rellenar código en seguimiento si hay reservas del usuario ─────
    if (trackingForm) {
      const storedTickets = FixLabDB.getCollection(FixLabDB.collections.RESERVATIONS);
      if (storedTickets.length > 0) {
        const latestTicket = storedTickets.find(t => t.email === freshUser) || storedTickets[0];
        const codeInput = trackingForm.querySelector('#trackingCode');
        if (codeInput instanceof HTMLInputElement && latestTicket?.orderNumber) {
          codeInput.value = latestTicket.orderNumber;
        }
      }
    }
  }

  // ── Re-lanzar auto-fill del formulario de reserva ──────────────────────
  // DOMContentLoaded ya habrá disparado sin datos; lo re-ejecutamos ahora.
  if (document.getElementById('reservationForm') && typeof autoFillUserData === 'function') {
    autoFillUserData();
  }

  // ── Si estamos en seguimiento.html y NO hay sesión, redirigir ahora ────
  // (La comprobación original en línea 807 se ejecutó antes de cargar la sesión)
  if (getCurrentPageFileName() === 'seguimiento.html' && !freshUser) {
    window.location.href = 'login.html?redirect=seguimiento.html';
  }

});

// Sistema de gestión de contenido editable
const ContentManager = {
  CONTENT_KEY: 'fixlab_editable_content',
  STYLES_KEY: 'fixlab_editable_styles',

  // Obtener todo el contenido guardado
  getAllContent() {
    try {
      const saved = localStorage.getItem(this.CONTENT_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  },

  // Guardar contenido
  saveContent(pageId, content) {
    const all = this.getAllContent();
    all[pageId] = content;
    localStorage.setItem(this.CONTENT_KEY, JSON.stringify(all));
  },

  // Obtener contenido de una página
  getPageContent(pageId) {
    return this.getAllContent()[pageId] || {};
  },

  // Aplicar contenido a la página actual
  applyContent() {
    const pageId = this.getCurrentPageId();
    const content = this.getPageContent(pageId);

    Object.entries(content).forEach(([key, value]) => {
      const el = document.querySelector(`[data-editable="${key}"]`);
      if (el) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.value = value;
        } else {
          el.innerHTML = value;
        }
      }
    });

    // Aplicar estilos guardados
    this.applyStyles();
  },

  // Obtener ID de página actual
  getCurrentPageId() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1).replace('.html', '') || 'index';
  },

  // Recopilar contenido editable de la página
  collectContent() {
    const content = {};
    document.querySelectorAll('[data-editable]').forEach(el => {
      const key = el.getAttribute('data-editable');
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        content[key] = el.value;
      } else {
        content[key] = el.innerHTML;
      }
    });
    return content;
  },

  // Activar modo edición en la página
  enableEditMode() {
    document.querySelectorAll('[data-editable]').forEach(el => {
      el.setAttribute('contenteditable', 'true');
      el.style.outline = '2px dashed #3d63db';
      el.style.padding = '4px';
      el.style.borderRadius = '4px';
      el.style.backgroundColor = 'rgba(61, 99, 219, 0.05)';
    });

    // Activar edición de imágenes
    document.querySelectorAll('[data-editable-img]').forEach(el => {
      el.style.outline = '2px dashed #28a745';
      el.style.cursor = 'pointer';
      el.title = 'Click para cambiar imagen';
      el.addEventListener('click', this._handleImageClick);
    });

    // Activar edición de estilos
    document.querySelectorAll('[data-style]').forEach(el => {
      el.style.outline = '2px dashed #dc3545';
      el.style.cursor = 'pointer';
      el.title = 'Click para editar estilos';
      el.addEventListener('click', this._handleStyleClick);
    });

    this.isEditMode = true;
  },

  // Desactivar modo edición
  disableEditMode() {
    document.querySelectorAll('[data-editable]').forEach(el => {
      el.removeAttribute('contenteditable');
      el.style.outline = '';
      el.style.padding = '';
      el.style.borderRadius = '';
      el.style.backgroundColor = '';
    });

    document.querySelectorAll('[data-editable-img]').forEach(el => {
      el.style.outline = '';
      el.style.cursor = '';
      el.title = '';
      el.removeEventListener('click', this._handleImageClick);
    });

    document.querySelectorAll('[data-style]').forEach(el => {
      el.style.outline = '';
      el.style.cursor = '';
      el.title = '';
      el.removeEventListener('click', this._handleStyleClick);
    });

    this.isEditMode = false;
  },

  isEditMode: false,

  // Manejar click en imagen
  _handleImageClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.target;
    const currentSrc = el.src || el.getAttribute('src');
    const newSrc = prompt('Nueva URL de la imagen:', currentSrc);
    if (newSrc && newSrc !== currentSrc) {
      el.src = newSrc;
    }
  },

  // Manejar click en color
  _handleColorClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.target;
    const currentColor = el.style.color || getComputedStyle(el).color;
    const newColor = prompt('Nuevo color (hex, rgb, o nombre):', currentColor);
    if (newColor !== null) {
      if (newColor === '') {
        el.style.color = '';
      } else {
        el.style.color = newColor;
      }
    }
  },

  // Manejar click en icono
  _handleIconClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.target;
    const currentIcon = el.getAttribute('data-icon') || el.innerHTML;
    const newIcon = prompt('Nuevo icono (clase de Font Awesome o HTML):', currentIcon);
    if (newIcon !== null && newIcon !== currentIcon) {
      if (newIcon.startsWith('<')) {
        el.innerHTML = newIcon;
      } else {
        el.setAttribute('data-icon', newIcon);
        el.className = newIcon;
      }
    }
  },

  // Manejar click en efecto
  _handleEffectClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.target;
    const currentEffect = el.getAttribute('data-effect') || '';
    const newEffect = prompt('Efectos disponibles: shadow, glow, pulse, fade, slide\n\nEditar efectos (deja vacío para eliminar):', currentEffect);
    if (newEffect !== null) {
      if (newEffect === '') {
        el.removeAttribute('data-effect');
        el.style.boxShadow = '';
        el.style.animation = '';
      } else {
        el.setAttribute('data-effect', newEffect);
        // Aplicar efectos básicos
        if (newEffect.includes('shadow')) {
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }
        if (newEffect.includes('glow')) {
          el.style.boxShadow = '0 0 20px rgba(61,99,219,0.5)';
        }
        if (newEffect.includes('pulse')) {
          el.style.animation = 'pulse 2s infinite';
        }
        if (newEffect.includes('fade')) {
          el.style.animation = 'fadeIn 1s';
        }
        if (newEffect.includes('slide')) {
          el.style.animation = 'slideIn 0.5s';
        }
      }
    }
  },

  // Guardar estilos
  saveStyles(pageId, styles) {
    const all = this.getAllStyles();
    all[pageId] = styles;
    localStorage.setItem(this.STYLES_KEY, JSON.stringify(all));
  },

  // Obtener todos los estilos
  getAllStyles() {
    try {
      const saved = localStorage.getItem(this.STYLES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  },

  // Obtener estilos de una página
  getPageStyles(pageId) {
    return this.getAllStyles()[pageId] || {};
  },

  // Aplicar estilos a la página
  applyStyles() {
    const pageId = this.getCurrentPageId();
    const styles = this.getPageStyles(pageId);

    Object.entries(styles).forEach(([selector, styleRules]) => {
      const el = document.querySelector(selector);
      if (el) {
        Object.entries(styleRules).forEach(([prop, val]) => {
          el.style.setProperty(prop, val);
        });
      }
    });
  },

  // Recopilar estilos de la página
  collectStyles() {
    const styles = {};
    document.querySelectorAll('[data-style]').forEach(el => {
      const styleProps = el.getAttribute('data-style').split(',');
      const elStyles = {};
      styleProps.forEach(prop => {
        const value = el.style.getPropertyValue(prop.trim());
        if (value) {
          elStyles[prop.trim()] = value;
        }
      });
      if (Object.keys(elStyles).length > 0) {
        // Usar un selector único
        const key = el.getAttribute('data-style-key') || `style-${Math.random().toString(36).substr(2, 9)}`;
        el.setAttribute('data-style-key', key);
        styles[key] = elStyles;
      }
    });
    return styles;
  }
};

// Aplicar contenido al cargar la página
ContentManager.applyContent();

const SESSION_KEY = FixLabDB.collections.SESSION;
const USERS_KEY = FixLabDB.collections.USERS;
const RESERVATION_TICKETS_KEY = FixLabDB.collections.RESERVATIONS;
const EMAILJS_SERVICE_ID = "service_hzb1vrj";
const EMAILJS_TEMPLATE_ID = "template_wxzr0ri";
const FIXLAB_TARGET_EMAIL = "FixLabCyL@gmail.com";
const WEB3FORMS_ACCESS_KEY = "030271c2-e0d6-4f8c-97e1-6b3d78ffc154";
const WEB3FORMS_API_URL = "https://api.web3forms.com/submit";
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `FL-${year}-${rand}`;
};

const normalizePhoneValue = (value) => value.replace(/\D/g, "");

const getStoredReservationTickets = () => {
  return FixLabDB.getCollection(RESERVATION_TICKETS_KEY);
};

const saveStoredReservationTickets = (tickets) => {
  FixLabDB.saveCollection(RESERVATION_TICKETS_KEY, tickets);
};

const PRODUCT_CATALOG = {
  "iphone-12": {
    name: "iPhone 12 reacondicionado",
    price: 299,
    description: "iPhone revisado en 30 puntos, bateria optimizada y desbloqueado.",
    specs: "128GB · Pantalla OLED · Face ID · Garantia 12 meses",
    images: ["https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg"]
  },
  "iphone-14-pro": {
    name: "iPhone 14 Pro reacondicionado",
    price: 449,
    description: "Version premium reacondicionada con camaras y rendimiento de alta gama.",
    specs: "128GB · ProMotion 120Hz · Triple camara · Garantia 12 meses",
    images: ["https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg"]
  },
  "iphone-15": {
    name: "iPhone 15 reacondicionado",
    price: 579,
    description: "Modelo reciente con USB-C, excelente autonomia y estado impecable.",
    specs: "128GB · USB-C · Camara 48MP · Garantia 12 meses",
    images: ["https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg"]
  },
  "samsung-s23": {
    name: "Samsung Galaxy S23 reacondicionado",
    price: 289,
    description: "Movil equilibrado con pantalla AMOLED y gran rendimiento.",
    specs: "128GB · AMOLED 120Hz · Carga rapida · Garantia 12 meses",
    images: ["https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg"]
  },
  "samsung-s24-ultra": {
    name: "Samsung Galaxy S24 Ultra reacondicionado",
    price: 329,
    description: "Modelo premium reacondicionado y testeado por nuestros tecnicos.",
    specs: "256GB · AMOLED 120Hz · Triple camara · Garantia 12 meses",
    images: ["Imagenes%20tienda/Foto_s24.png"]
  },
  "xiaomi-13t": {
    name: "Xiaomi 13T reacondicionado",
    price: 269,
    description: "Gran potencia para juegos y fotografia con precio ajustado.",
    specs: "256GB · Pantalla 144Hz · Carga 67W · Garantia 12 meses",
    images: ["https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13t.jpg"]
  },
  "xiaomi-redmi-note": {
    name: "Xiaomi Redmi Note reacondicionado",
    price: 219,
    description: "Opcion muy completa para uso diario y multimedia.",
    specs: "128GB · Bateria larga duracion · Dual SIM · Garantia 12 meses",
    images: ["https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg"]
  },
  "fundas-antigolpes": {
    name: "Fundas antigolpes",
    price: 14.9,
    description: "Fundas resistentes para iPhone, Samsung y Xiaomi.",
    specs: "Material TPU + policarbonato · Varios colores",
    images: ["Imagenes%20tienda/Foto_funda_1.jpg", "Imagenes%20tienda/Foto_funda_2.jpg"]
  },
  "protector-templado": {
    name: "Protector de pantalla templado",
    price: 12,
    description: "Cristal templado 9H con colocacion profesional en tienda.",
    specs: "Cobertura completa · Resistente a golpes y arañazos",
    images: ["Imagenes%20tienda/foto_protector_pantalla_1.jpg", "Imagenes%20tienda/Foto_protector_pantalla_2.jpg"]
  },
  "cargador-20w": {
    name: "Cargador rapido 20W",
    price: 18.9,
    description: "Cargador compacto de carga rapida con proteccion de voltaje.",
    specs: "USB-C · Carga rapida · Cable incluido",
    images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80"]
  },
  "auriculares-tws": {
    name: "Auriculares Bluetooth TWS",
    price: 24.9,
    description: "Auriculares inalambricos con estuche de carga y microfono HD.",
    specs: "Bluetooth 5.3 · Cancelacion pasiva · Hasta 20h de autonomia",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80"]
  },
  "powerbank-10000": {
    name: "Power bank 10000mAh",
    price: 19.9,
    description: "Bateria externa ideal para viajes y jornada completa.",
    specs: "10000mAh · 2 puertos de salida · Carga segura",
    images: ["Imagenes%20tienda/Foto_powerbank.jpg"]
  },
  "soporte-coche-magnetico": {
    name: "Soporte coche magnetico",
    price: 11.9,
    description: "Soporte estable para rejilla del coche con giro 360 grados.",
    specs: "Iman reforzado · Instalacion rapida · Compatible universal",
    images: ["Imagenes%20tienda/soporte_coche.jpg"]
  }
};

window.requestAnimationFrame(() => {
  document.body.classList.add("page-ready");
});

const whatsappIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;

const ensureWhatsAppButtonVisible = () => {
  let whatsappButton = document.querySelector(".whatsapp-float");
  if (!whatsappButton) {
    whatsappButton = document.createElement("a");
    whatsappButton.className = "whatsapp-float";
    whatsappButton.href = "https://wa.me/34600000000?text=Hola%20FixLab%2C%20quiero%20informaci%C3%B3n%20sobre%20una%20reparaci%C3%B3n.";
    whatsappButton.target = "_blank";
    whatsappButton.rel = "noopener noreferrer";
    whatsappButton.setAttribute("aria-label", "Contactar por WhatsApp");
    whatsappButton.innerHTML = whatsappIconSVG;
    document.body.appendChild(whatsappButton);
  }

  whatsappButton.hidden = false;
  whatsappButton.style.position = "fixed";
  whatsappButton.style.right = "18px";
  whatsappButton.style.bottom = "18px";
  whatsappButton.style.left = "auto";
  whatsappButton.style.top = "auto";
  whatsappButton.style.zIndex = "10001";
  whatsappButton.style.display = "inline-flex";
  whatsappButton.style.visibility = "visible";
  whatsappButton.style.opacity = "1";

  document.body.appendChild(whatsappButton);
};

ensureWhatsAppButtonVisible();
const rawSession = FixLabDB.getCollection(FixLabDB.collections.SESSION);
const currentSession = Array.isArray(rawSession) ? rawSession[0] : rawSession;
const currentSessionUser = currentSession && currentSession.email ? currentSession.email : null;

const getCurrentPageFileName = () => (window.location.pathname.split("/").pop() || "").toLowerCase();

const getSafeInternalPath = (rawPath) => {
  if (!rawPath) {
    return "";
  }
  try {
    const candidate = new URL(rawPath, window.location.origin);
    if (candidate.origin !== window.location.origin) {
      return "";
    }
    return `${candidate.pathname}${candidate.search}${candidate.hash}`;
  } catch {
    return "";
  }
};

const DETAIL_PAGE_PATTERN = /^(servicio-[^/]+|tienda-(?!s\.html)[^/]+)\.html$/i;

const attachReturnOriginToDetailLinks = () => {
  const detailLinks = document.querySelectorAll('a[href$=".html"]');
  if (detailLinks.length === 0) {
    return;
  }

  detailLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) {
      return;
    }
    if (href.startsWith("http") || href.startsWith("#")) {
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(href, window.location.href);
    } catch {
      return;
    }

    const fileName = (targetUrl.pathname.split("/").pop() || "").toLowerCase();
    if (!DETAIL_PAGE_PATTERN.test(fileName)) {
      return;
    }

    const parentSection = link.closest("section[id]");
    const sectionHash = parentSection ? `#${parentSection.id}` : "";
    const originPath = `${window.location.pathname}${window.location.search}${sectionHash || window.location.hash}`;
    targetUrl.searchParams.set("from", originPath);
    link.setAttribute("href", `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`);
  });
};

const setupSmartBackLinks = () => {
  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");
  if (!from) {
    return;
  }

  const backLinks = document.querySelectorAll('a[href="servicios.html"], a[href="tiendas.html"]');
  if (backLinks.length === 0) {
    return;
  }

  let safeBackUrl;
  try {
    safeBackUrl = new URL(from, window.location.origin);
  } catch {
    return;
  }

  if (safeBackUrl.origin !== window.location.origin) {
    return;
  }

  const relativeBackUrl = `${safeBackUrl.pathname}${safeBackUrl.search}${safeBackUrl.hash}`;
  backLinks.forEach((link) => {
    if (link.textContent && link.textContent.toLowerCase().includes("volver")) {
      link.setAttribute("href", relativeBackUrl);
    }
  });
};

attachReturnOriginToDetailLinks();
setupSmartBackLinks();

if (getCurrentPageFileName() === "seguimiento.html" && !currentSessionUser) {
  window.location.href = "login.html?redirect=seguimiento.html";
}

const brandTitle = document.querySelector(".brand span");
if (brandTitle && brandTitle.textContent) {
  brandTitle.setAttribute("data-glitch", "");
  brandTitle.setAttribute("data-text", brandTitle.textContent.trim());
}

const heroTitle = document.querySelector(".hero h1");
if (heroTitle && heroTitle.textContent) {
  heroTitle.setAttribute("data-glitch", "");
  heroTitle.setAttribute("data-text", heroTitle.textContent.trim());
}

const heroPhoneImage = document.getElementById("heroPhoneImage");
if (heroPhoneImage) {
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!reducedMotionQuery.matches) {
    const heroPhoneSequence = [
      {
        src: "Fotos/samsung.webp",
        alt: "Samsung Galaxy"
      },
      {
        src: "Fotos/xiaomi.png",
        alt: "Xiaomi"
      },
      {
        src: "Fotos/Iphone.png",
        alt: "iPhone"
      },
      {
        src: "Fotos/zflip.webp",
        alt: "Samsung Z Flip"
      },
      {
        src: "Fotos/zfold.webp",
        alt: "Samsung Z Fold"
      }
    ];

    let heroPhoneIndex = 0;
    const triggerHeroPhoneSwitch = () => {
      heroPhoneImage.classList.add("is-switching");
      const heroVisual = heroPhoneImage.closest(".hero-visual");
      if (heroVisual) heroVisual.classList.add("is-glitching");

      window.setTimeout(() => {
        heroPhoneIndex = (heroPhoneIndex + 1) % heroPhoneSequence.length;
        const nextPhone = heroPhoneSequence[heroPhoneIndex];
        heroPhoneImage.src = nextPhone.src;
        heroPhoneImage.alt = nextPhone.alt;
      }, 160);

      window.setTimeout(() => {
        heroPhoneImage.classList.remove("is-switching");
        const hv = heroPhoneImage.closest(".hero-visual");
        if (hv) hv.classList.remove("is-glitching");
      }, 420);

      const nextDelay = 4200 + Math.floor(Math.random() * 2800);
      window.setTimeout(triggerHeroPhoneSwitch, nextDelay);
    };

    window.setTimeout(triggerHeroPhoneSwitch, 3400);
  }
}

if (!reducedMotionQuery.matches) {
  const floatingItems = document.querySelectorAll(".card, .shop-card, .stat-card");
  floatingItems.forEach((item, index) => {
    item.style.animationDelay = `${(index % 6) * 0.18}s`;
  });
}

{
  const cursorQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!cursorQuery.matches && window.matchMedia("(pointer: fine)").matches && window.innerWidth > 980) {
    // Cursor personalizado deshabilitado en equipos lentos
  }
}

if (window.emailjs) {
  window.emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
  });
}

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

const normalizeSiteHeader = () => {
  const nav = document.querySelector(".site-header .nav");
  if (!nav) return;
  const navList = nav.querySelector("#navLinks");
  if (!navList) return;

  const navLabelMap = {
    "index.html": "Inicio",
    "servicios.html": "Servicios",
    "calculadora.html": "Presupuesto",
    "tiendas.html": "Tiendas físicas",
    "tienda.html": "Tienda",
    "reserva.html": "Reserva",
    "seguimiento-publico.html": "Seguimiento",
    "contacto.html": "Contacto"
  };

  Object.entries(navLabelMap).forEach(([href, label]) => {
    const link = nav.querySelector(`#navLinks a[href="${href}"]`);
    if (link) {
      link.textContent = label;
    }
  });

  // Mantener el header igual que index.html en todas las páginas
  const canonicalOrder = [
    "index.html",
    "servicios.html",
    "calculadora.html",
    "tiendas.html",
    "tienda.html",
    "reserva.html",
    "seguimiento-publico.html",
    "contacto.html"
  ];

  canonicalOrder.forEach((href) => {
    let link = navList.querySelector(`a[href="${href}"]`);
    if (!link) {
      const li = document.createElement("li");
      link = document.createElement("a");
      link.href = href;
      link.textContent = navLabelMap[href] || href;
      li.appendChild(link);
      navList.appendChild(li);
    }
  });

  canonicalOrder.forEach((href) => {
    const li = navList.querySelector(`a[href="${href}"]`)?.closest("li");
    if (li) navList.appendChild(li);
  });
  navList.classList.toggle("nav-links-extended", navList.querySelectorAll("li").length > 7);

  navList.querySelectorAll("a").forEach((link) => link.classList.remove("active"));
  const currentPage = getCurrentPageFileName();
  const sectionActiveMap = {
    "index.html": "index.html",
    "servicios.html": "servicios.html",
    "servicio-agua.html": "servicios.html",
    "servicio-bateria.html": "servicios.html",
    "servicio-camara.html": "servicios.html",
    "servicio-conector.html": "servicios.html",
    "servicio-pantalla.html": "servicios.html",
    "calculadora.html": "calculadora.html",
    "tiendas.html": "tiendas.html",
    "tienda-centro.html": "tiendas.html",
    "tienda-rio-shopping.html": "tiendas.html",
    "tienda-burgos.html": "tiendas.html",
    "tienda.html": "tienda.html",
    "producto.html": "tienda.html",
    "reacondicionados.html": "tienda.html",
    "reserva.html": "reserva.html",
    "reserva-producto.html": "reserva.html",
    "seguimiento-publico.html": "seguimiento-publico.html",
    "seguimiento.html": "seguimiento-publico.html",
    "contacto.html": "contacto.html"
  };
  const activeHref = sectionActiveMap[currentPage];
  if (activeHref) {
    navList.querySelector(`a[href="${activeHref}"]`)?.classList.add("active");
  }

  let actions = nav.querySelector(".nav-actions");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "nav-actions";
    nav.appendChild(actions);
  }

  // Remove any existing admin link
  const existingAdmin = actions.querySelector('a[href="panel_control.html"]') || nav.querySelector('a[href="panel_control.html"]');
  if (existingAdmin) existingAdmin.remove();

  let userLink = actions.querySelector('a[href="login.html"], a.btn-login') || nav.querySelector('a[href="login.html"], a.btn-login');
  if (!userLink) {
    userLink = document.createElement("a");
    userLink.href = "login.html";
  }
  userLink.className = "btn btn-login";
  userLink.textContent = "Iniciar sesión";

  actions.appendChild(userLink);
};

normalizeSiteHeader();

const headerLoginButton = document.querySelector(".btn-login");
if (headerLoginButton) {
  if (currentSessionUser) {
    headerLoginButton.textContent = "Cerrar sesión";
    headerLoginButton.setAttribute("href", "#");
    headerLoginButton.addEventListener("click", (event) => {
      event.preventDefault();
      FixLabDB.saveCollection(FixLabDB.collections.SESSION, []);
      window.location.href = "index.html";
    });
  } else {
    headerLoginButton.textContent = "Iniciar sesión";
    headerLoginButton.setAttribute("href", "login.html");
  }
}

if (navLinks && !navLinks.querySelector(".nav-auth-item")) {
  const authItem = document.createElement("li");
  authItem.className = "nav-auth-item";
  const authLink = document.createElement("a");
  authLink.href = currentSessionUser ? "#" : "login.html";
  authLink.textContent = currentSessionUser ? "Cerrar sesión" : "Iniciar sesión";

  if (currentSessionUser) {
    authLink.addEventListener("click", (event) => {
      event.preventDefault();
      FixLabDB.saveCollection(FixLabDB.collections.SESSION, []);
      window.location.href = "index.html";
    });
  }

  authItem.appendChild(authLink);
  navLinks.appendChild(authItem);
}

if (menuToggle && navLinks) {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-controls", "navLinks");

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle("show");
    menuToggle.setAttribute("aria-expanded", isOpen);

    if (isOpen) {
      navLinks.querySelector("a")?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("show");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!navLinks.contains(target) && !menuToggle.contains(target)) {
      navLinks.classList.remove("show");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("show")) {
      navLinks.classList.remove("show");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.focus();
      document.body.style.overflow = "";
    }
  });

  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 100 && navLinks.classList.contains("show")) {
      navLinks.classList.remove("show");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  }, { passive: true });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!navLinks.contains(target) && !menuToggle.contains(target)) {
      navLinks.classList.remove("show");
    }
  });
}

if (loginForm && loginMessage) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const email = (formData.get("email") || "").toString().trim().toLowerCase();
    const password = (formData.get("password") || "").toString().trim();

    if (!email || !password) {
      loginMessage.textContent = "Introduce tu email y contraseña.";
      loginMessage.style.color = "#b1416f";
      return;
    }

    // Check admin credentials using hash
    const ADMIN_CREDENTIALS = [
      { email: "Zml4bGFiY3lsQGdtYWlsLmNvbQ==", pass: "U2tpYmlkaTY3" },
      { email: "dGVzdEBnbWFpbC5jb20=", pass: "Rml4bGFiMTIz" }
    ];

    if (ADMIN_CREDENTIALS.some(c => btoa(email) === c.email && btoa(password) === c.pass)) {
      sessionStorage.setItem('fixlab_admin_session', 'true');
      loginMessage.textContent = "Acceso admin correcto. Redirigiendo al panel...";
      loginMessage.style.color = "#3d63db";
      window.setTimeout(() => {
        window.location.href = "panel_control.html";
      }, 600);
      return;
    }

    const user = FixLabDB.findOne(FixLabDB.collections.USERS, { email });
    if (!user || !user.passwordHash || !FixLabDB.verifyPassword(password, user.passwordHash)) {
      loginMessage.textContent = "Cuenta no encontrada o contraseña incorrecta. Regístrate primero.";
      loginMessage.style.color = "#b1416f";
      return;
    }

    FixLabDB.saveCollection(FixLabDB.collections.SESSION, [{ email, loggedInAt: new Date().toISOString() }]);
    loginMessage.textContent = "Inicio de sesión correcto. Redirigiendo...";
    loginMessage.style.color = "#3d63db";
    window.setTimeout(() => {
      const redirectFromQuery = new URLSearchParams(window.location.search).get("redirect");
      const safeRedirect = getSafeInternalPath(redirectFromQuery);
      window.location.href = safeRedirect || "index.html";
    }, 600);
  });
}

const trackingForm = document.getElementById("trackingForm");
const trackingMessage = document.getElementById("trackingMessage");
const trackingResult = document.getElementById("trackingResult");
const trackingEmail = document.getElementById("trackingEmail");
const TRACKING_STATES = [
  "Solicitud recibida",
  "Diagnóstico en curso",
  "Esperando repuesto",
  "Reparación en proceso",
  "Pruebas finales",
  "Lista para recoger"
];

if (trackingEmail && currentSessionUser) {
  trackingEmail.textContent = currentSessionUser;
}

if (trackingForm && trackingMessage && trackingResult) {
  const storedTickets = FixLabDB.getCollection(FixLabDB.collections.RESERVATIONS);
  if (storedTickets.length > 0) {
    const latestTicket = currentSessionUser
      ? storedTickets.find((ticket) => ticket.email === currentSessionUser) || storedTickets[0]
      : storedTickets[0];
    const codeInput = trackingForm.querySelector("#trackingCode");
    if (codeInput instanceof HTMLInputElement && latestTicket && latestTicket.orderNumber) {
      codeInput.value = latestTicket.orderNumber;
    }
  }

  trackingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(trackingForm);
    const code = (formData.get("trackingCode") || "").toString().trim().toUpperCase();
    const phone = (formData.get("trackingPhone") || "").toString().trim();
    const normalizedPhone = phone ? normalizePhoneValue(phone) : "";

    if (code.length < 4 || normalizedPhone.length === 0) {
      trackingMessage.textContent = "Introduce un código válido y un teléfono correcto.";
      trackingMessage.style.color = "#b1416f";
      trackingResult.hidden = true;
      return;
    }

    const ticket = FixLabDB.find(FixLabDB.collections.RESERVATIONS, {}).find((item) => {
      const storedCode = (item.code || item.orderNumber || "").toUpperCase();
      const storedPhone = item.phone ? normalizePhoneValue(item.phone) : "";
      if (normalizedPhone && storedPhone) {
        return storedCode === code && storedPhone === normalizedPhone;
      }
      return storedCode === code;
    })

    if (!ticket) {
      trackingMessage.textContent = "No encontramos una reserva con ese código y teléfono.";
      trackingMessage.style.color = "#b1416f";
      trackingResult.hidden = true;
      return;
    }

    const checksum = code.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const state = ticket.status || TRACKING_STATES[checksum % TRACKING_STATES.length];
    const estimatedDays = 1 + ((checksum + normalizedPhone.length) % 4);

    trackingResult.hidden = false;
    trackingResult.innerHTML = `
      <h3>Estado actual</h3>
      <p><strong>Código:</strong> ${code}</p>
      <p><strong>Servicio:</strong> ${ticket.service || "No disponible"}</p>
      <p><strong>Tienda:</strong> ${ticket.store || "No disponible"}</p>
      <p><strong>Estado:</strong> ${state}</p>
      <p><strong>Estimación:</strong> ${estimatedDays} día(s) para finalizar.</p>
    `;
    trackingMessage.textContent = "Seguimiento actualizado.";
    trackingMessage.style.color = "#3d63db";

    // Mostrar CTA de valoración tras consulta exitosa
    var ctaValoracion = document.getElementById("ctaValoracion");
    if (ctaValoracion) {
      ctaValoracion.classList.add("visible");
    }
  });
}

if (registerForm && registerMessage) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim().toLowerCase();
    const phone = (formData.get("phone") || "").toString().trim();
    const password = (formData.get("password") || "").toString().trim();
    const confirmPassword = (formData.get("confirmPassword") || "").toString().trim();

    if (!name || !email || !phone || password.length < 6) {
      registerMessage.textContent = "Completa todos los campos y usa una contraseña de al menos 6 caracteres.";
      registerMessage.style.color = "#b1416f";
      return;
    }

    if (password !== confirmPassword) {
      registerMessage.textContent = "Las contraseñas no coinciden.";
      registerMessage.style.color = "#b1416f";
      return;
    }

    const alreadyExists = FixLabDB.findOne(FixLabDB.collections.USERS, { email });
    if (alreadyExists) {
      registerMessage.textContent = "Ya existe una cuenta con ese email.";
      registerMessage.style.color = "#b1416f";
      return;
    }

    FixLabDB.insert(FixLabDB.collections.USERS, {
      name,
      email,
      phone,
      passwordHash: FixLabDB.hashPassword(password)
    });

    registerMessage.textContent = "Cuenta creada correctamente. Ahora puedes iniciar sesión.";
    registerMessage.style.color = "#3d63db";
    window.setTimeout(() => {
      window.location.href = "login.html";
    }, 700);
  });
}

if (contactForm && formMessage && window.emailjs) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const phone = (formData.get("phone") || "").toString().trim();
    const service = (formData.get("service") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();

    if (!name || !email || !phone || !service || !message) {
      formMessage.textContent = "Completa todos los campos antes de enviar.";
      formMessage.style.color = "#b1416f";
      return;
    }

    formMessage.textContent = "Enviando mensaje...";
    formMessage.style.color = "#3d63db";

    try {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: name,
        from_email: email,
        to_email: FIXLAB_TARGET_EMAIL,
        phone,
        service,
        message,
        form_type: "Contacto"
      });
      formMessage.textContent = "Mensaje enviado correctamente. Te responderemos pronto.";
      formMessage.style.color = "#3d63db";
      contactForm.reset();
    } catch (error) {
      const reason =
        (error && typeof error === "object" && "text" in error && error.text) ||
        (error && typeof error === "object" && "message" in error && error.message) ||
        "Error desconocido";
      formMessage.textContent = `No se pudo enviar el mensaje: ${reason}`;
      formMessage.style.color = "#b1416f";
    }
  });
}

// Pre-select service from URL parameter
if (reservationForm) {
  const params = new URLSearchParams(window.location.search);
  const serviceParam = params.get("service");
  if (serviceParam) {
    const serviceSelect = reservationForm.querySelector("#service");
    if (serviceSelect) {
      // Try to find matching option (case-insensitive)
      const options = Array.from(serviceSelect.options);
      const match = options.find(opt =>
        opt.value.toLowerCase() === serviceParam.toLowerCase() ||
        opt.text.toLowerCase().includes(serviceParam.toLowerCase())
      );
      if (match) {
        match.selected = true;
      } else {
        // If no exact match, add it as a new option
        const newOption = document.createElement("option");
        newOption.value = serviceParam;
        newOption.textContent = serviceParam;
        newOption.selected = true;
        serviceSelect.appendChild(newOption);
      }
    }
  }
}

if (reservationForm && reservationMessage) {
  reservationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(reservationForm);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const phone = (formData.get("phone") || "").toString().trim();
    const deviceBrand = (formData.get("deviceBrand") || "").toString().trim();
    const service = (formData.get("service") || "").toString().trim();
    const urgency = (formData.get("urgency") || "").toString().trim();
    const preferredStore = (formData.get("preferredStore") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();
    const orderNumber = generateOrderNumber();
    const serviceSummary = `${service} · ${deviceBrand} · ${urgency} · ${preferredStore}`;
    const cause = message || "Sin descripcion adicional.";

    if (!name || !email || !phone || !deviceBrand || !service || !urgency || !preferredStore || !message) {
      reservationMessage.textContent = "Completa todos los campos de la reserva.";
      reservationMessage.style.color = "#b1416f";
      return;
    }

    reservationMessage.textContent = "Guardando reserva...";
    reservationMessage.style.color = "#3d63db";

    // Guardar SIEMPRE en la base de datos local primero
    FixLabDB.insert(FixLabDB.collections.RESERVATIONS, {
      orderNumber,
      name,
      email,
      phone,
      deviceBrand,
      service,
      urgency,
      store: preferredStore,
      cause,
      status: "Solicitud recibida",
      createdAt: new Date().toISOString()
    });

    try {
      if (!WEB3FORMS_ACCESS_KEY) {
        reservationMessage.textContent = `Reserva guardada correctamente. Tu numero de reserva es ${orderNumber}. (Nota: Web3Forms no configurado)`;
        reservationMessage.style.color = "#3d63db";
        reservationForm.reset();
        return;
      }

      const formPayload = new FormData();
      formPayload.append("access_key", WEB3FORMS_ACCESS_KEY);
      formPayload.append("subject", `Nueva reserva ${orderNumber} - ${service}`);
      formPayload.append("from_name", "FixLab Web");
      formPayload.append("name", name);
      formPayload.append("email", email);
      formPayload.append("phone", phone);
      formPayload.append("service", serviceSummary);
      formPayload.append("cause", cause);
      formPayload.append("order_number", orderNumber);
      formPayload.append("message", `Nueva reserva recibida.\nPedido: ${orderNumber}\nCliente: ${name}\nEmail: ${email}\nTelefono: ${phone}\nServicio: ${serviceSummary}\nCausa: ${cause}`);
      formPayload.append("botcheck", "");
      formPayload.append("replyto", email);
      formPayload.append(
        "autoresponse",
        `Hola ${name}, hemos recibido tu solicitud. Tu ticket ${orderNumber} esta siendo procesado. Te contactaremos pronto.`
      );
      const response = await fetch(WEB3FORMS_API_URL, {
        method: "POST",
        body: formPayload
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error((result && result.message) || "No se pudo enviar el formulario.");
      }

      reservationMessage.textContent = `Reserva enviada correctamente. Tu numero de reserva es ${orderNumber}.`;
      reservationMessage.style.color = "#3d63db";
      reservationForm.reset();
    } catch (error) {
      const reason =
        (error && typeof error === "object" && "text" in error && error.text) ||
        (error && typeof error === "object" && "message" in error && error.message) ||
        "Error desconocido";
      reservationMessage.textContent = `Reserva guardada (${orderNumber}). Nota: No se pudo enviar email: ${reason}`;
      reservationMessage.style.color = "#3d63db";
      reservationForm.reset();
    }
  });
}

// --- LOGICA RESERVA HOME & POPUP ---
const homeReservationForm = document.getElementById("homeReservationForm");
const homeReservationMsg = document.getElementById("homeReservationMsg");
const confirmPopup = document.getElementById("confirmPopup");

if (homeReservationForm && homeReservationMsg && confirmPopup) {
  const popupCode = document.getElementById("popupCode");
  const popupClose = document.getElementById("popupClose");
  const popupCloseBottom = document.getElementById("popupCloseBottom");
  const copyCodeBtn = document.getElementById("copyCodeBtn");

  const openPopup = (code) => {
    popupCode.textContent = code;
    const trackBtn = document.getElementById("popupTrackBtn");
    if (trackBtn) trackBtn.href = `seguimiento-publico.html?ticket=${code}`;
    confirmPopup.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closePopup = () => {
    confirmPopup.classList.remove("active");
    document.body.style.overflow = "";
  };

  if (popupClose) popupClose.addEventListener("click", closePopup);
  if (popupCloseBottom) popupCloseBottom.addEventListener("click", closePopup);
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(popupCode.textContent).then(() => {
        copyCodeBtn.textContent = "¡Copiado!";
        setTimeout(() => copyCodeBtn.textContent = "Copiar", 2000);
      });
    });
  }

  homeReservationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("homeName").value.trim();
    const phone = document.getElementById("homePhone").value.trim();
    let email = document.getElementById("homeEmail") ? document.getElementById("homeEmail").value.trim() : "";

    // Auto-completar con sesión si no hay email manual
    if (!email) {
      const sessionData = FixLabDB.getCollection(FixLabDB.collections.SESSION);
      if (Array.isArray(sessionData) && sessionData.length > 0) email = sessionData[0].email || '';
    }

    const service = document.getElementById("homeService").value;
    const store = document.getElementById("homeStore").value;

    if (!name || !phone || !service || !store) {
      homeReservationMsg.textContent = "Por favor, rellena todos los campos.";
      homeReservationMsg.style.color = "var(--neon-pink)";
      return;
    }

    homeReservationMsg.textContent = "Procesando...";
    homeReservationMsg.style.color = "var(--neon-cyan)";

    const orderNumber = "FL-2026-" + Math.floor(1000 + Math.random() * 9000);

    // Guardar en la DB local
    FixLabDB.insert(FixLabDB.collections.RESERVATIONS, {
      orderNumber,
      name,
      phone,
      email: email || "",
      service,
      store,
      status: "Solicitud recibida",
      createdAt: new Date().toISOString()
    });

    homeReservationMsg.textContent = "";
    homeReservationForm.reset();
    openPopup(orderNumber);
  });
}

if (contactForm && formMessage && !window.emailjs) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formMessage.textContent = "EmailJS no está cargado. Revisa internet o bloqueo del navegador.";
    formMessage.style.color = "#b1416f";
  });
}

if (serviceToggles.length > 0) {
  serviceToggles.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      if (!targetId) {
        return;
      }
      const extraInfo = document.getElementById(targetId);
      if (!extraInfo) {
        return;
      }
      const isHidden = extraInfo.hasAttribute("hidden");
      if (isHidden) {
        extraInfo.removeAttribute("hidden");
        button.textContent = "Ocultar información";
      } else {
        extraInfo.setAttribute("hidden", "");
        button.textContent = "Ver más información";
      }
    });
  });
}

if (storeItems.length > 0 && storeSearch && storePriceMax && storePriceValue) {
  const applyStoreFilters = () => {
    const query = storeSearch.value.trim().toLowerCase();
    const maxPrice = Number(storePriceMax.value);
    const activeTypes = new Set(
      Array.from(storeTypeFilters)
        .filter((input) => input.checked)
        .map((input) => input.value)
    );
    const activeBrands = new Set(
      Array.from(storeBrandFilters)
        .filter((input) => input.checked)
        .map((input) => input.value)
    );

    let visibleCount = 0;
    storeItems.forEach((item) => {
      const text = item.textContent ? item.textContent.toLowerCase() : "";
      const type = item.getAttribute("data-type") || "";
      const brand = item.getAttribute("data-brand") || "";
      const price = Number(item.getAttribute("data-price") || "0");

      const matchesQuery = query.length === 0 || text.includes(query);
      const matchesType = activeTypes.size === 0 || activeTypes.has(type);
      const matchesBrand = activeBrands.size === 0 || activeBrands.has(brand);
      const matchesPrice = Number.isFinite(price) ? price <= maxPrice : true;
      const isVisible = matchesQuery && matchesType && matchesBrand && matchesPrice;

      item.style.display = isVisible ? "" : "none";
      if (isVisible) {
        visibleCount += 1;
      }
    });

    storePriceValue.textContent = String(maxPrice);
    if (storeEmptyState) {
      storeEmptyState.hidden = visibleCount !== 0;
    }
  };

  storeSearch.addEventListener("input", applyStoreFilters);
  storePriceMax.addEventListener("input", applyStoreFilters);
  storeTypeFilters.forEach((input) => input.addEventListener("change", applyStoreFilters));
  storeBrandFilters.forEach((input) => input.addEventListener("change", applyStoreFilters));
  applyStoreFilters();

  storeItems.forEach((item) => {
    const href = item.getAttribute("data-href");
    if (!href) {
      return;
    }
    item.addEventListener("click", () => {
      window.location.href = href;
    });
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = href;
      }
    });
  });
}

if (
  productDetail &&
  productName &&
  productDescription &&
  productPrice &&
  productSpecs &&
  productMainImage &&
  productThumbs &&
  productQty &&
  productTotal &&
  productReserveLink
) {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id") || "";
  const product = PRODUCT_CATALOG[productId];

  if (!product) {
    if (productNotFound) {
      productNotFound.hidden = false;
    }
  } else {
    productDetail.hidden = false;
    productName.textContent = product.name;
    productDescription.textContent = product.description;
    productSpecs.textContent = product.specs;
    productPrice.textContent = `Precio unitario: ${product.price.toFixed(2)} EUR`;

    const setMainImage = (src, index) => {
      productMainImage.src = src;
      productMainImage.alt = `${product.name} foto ${index + 1}`;
    };

    setMainImage(product.images[0], 0);
    productThumbs.innerHTML = "";
    product.images.forEach((src, index) => {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "product-thumb";
      thumb.innerHTML = `<img src="${src}" alt="${product.name} miniatura ${index + 1}">`;
      thumb.addEventListener("click", () => setMainImage(src, index));
      productThumbs.appendChild(thumb);
    });

    const updateTotal = () => {
      const qty = Math.max(1, Number(productQty.value) || 1);
      productQty.value = String(qty);
      const total = qty * product.price;
      productTotal.textContent = `${total.toFixed(2)} EUR`;
      const params = new URLSearchParams({
        id: productId,
        qty: String(qty)
      });
      productReserveLink.href = `reserva-producto.html?${params.toString()}`;
    };

    productQty.addEventListener("input", updateTotal);
    updateTotal();
  }
}

if (productReservationForm && productReservationMessage && productReservationSummary && productReservationQty) {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id") || "";
  const initialQty = Math.max(1, Number(params.get("qty") || "1"));
  const product = PRODUCT_CATALOG[productId];

  if (!product) {
    productReservationSummary.textContent = "Producto no encontrado. Vuelve a tienda para seleccionar uno válido.";
  } else {
    const updateSummary = () => {
      const qty = Math.max(1, Number(productReservationQty.value) || 1);
      productReservationQty.value = String(qty);
      const total = qty * product.price;
      productReservationSummary.textContent = `${product.name} · Precio unitario ${product.price.toFixed(2)} EUR · Total ${total.toFixed(2)} EUR`;
    };

    productReservationQty.value = String(initialQty);
    updateSummary();
    productReservationQty.addEventListener("input", updateSummary);
  }

  productReservationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!product) {
      productReservationMessage.textContent = "No se puede reservar: producto no válido.";
      productReservationMessage.style.color = "#b1416f";
      return;
    }

    const formData = new FormData(productReservationForm);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const phone = (formData.get("phone") || "").toString().trim();
    const qty = Math.max(1, Number(formData.get("qty") || "1"));
    const message = (formData.get("message") || "").toString().trim();
    const total = qty * product.price;

    if (!name || !email || !phone) {
      productReservationMessage.textContent = "Completa nombre, email y teléfono.";
      productReservationMessage.style.color = "#b1416f";
      return;
    }

    if (window.emailjs) {
      productReservationMessage.textContent = "Enviando reserva...";
      productReservationMessage.style.color = "#3d63db";
      try {
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name: name,
          from_email: email,
          to_email: FIXLAB_TARGET_EMAIL,
          phone,
          service: `Reserva de producto: ${product.name}`,
          message: `Cantidad: ${qty}. Total estimado: ${total.toFixed(2)} EUR. ${message || ""}`.trim(),
          form_type: "Reserva producto"
        });
        productReservationMessage.textContent = "Reserva enviada correctamente. Te contactaremos para confirmar.";
        productReservationMessage.style.color = "#3d63db";
        productReservationForm.reset();
      } catch (error) {
        productReservationMessage.textContent = "No se pudo enviar la reserva. Inténtalo de nuevo.";
        productReservationMessage.style.color = "#b1416f";
      }
    } else {
      productReservationMessage.textContent = "EmailJS no está cargado. Revisa internet o bloqueo del navegador.";
      productReservationMessage.style.color = "#b1416f";
    }
  });
}

const revealItems = document.querySelectorAll(".reveal");
if (revealItems.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);

          // Contadores animados en stats-strip
          if (entry.target.classList.contains("stats-strip")) {
            animateCounters();
          }
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}

// ── Contadores animados ─────────────────────────────────────────────────────
function animateCounters() {
  if (reducedMotionQuery.matches) return;

  const counters = [
    { el: document.querySelector('[data-editable="stat-1-value"]'), target: 4500, prefix: "+", suffix: "" },
    { el: document.querySelector('[data-editable="stat-3-value"]'), target: 12, prefix: "", suffix: " meses" },
  ];

  counters.forEach(({ el, target, prefix, suffix }) => {
    if (!el) return;
    const duration = 1600;
    const start = performance.now();
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Easing out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = prefix + value.toLocaleString("es-ES") + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

// ── Stagger de cards al hacer scroll ──────────────────────────────────────
{
  const cardSections = document.querySelectorAll(".cards-grid, .shop-grid");
  cardSections.forEach((grid) => {
    const cards = grid.querySelectorAll(".card, .shop-card");
    cards.forEach((card) => card.classList.add("card-stagger"));

    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll(".card-stagger");
          cards.forEach((card, i) => {
            window.setTimeout(() => card.classList.add("in"), i * 100);
          });
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    cardObserver.observe(grid);
  });
}

/* Auto-fill user data in reservation form */
const autoFillUserData = () => {
  const sessionData = FixLabDB.getCollection(SESSION_KEY);
  const currentUser = Array.isArray(sessionData) && sessionData.length > 0 ? sessionData[0].email : '';
  if (!currentUser) return;

  const users = FixLabDB.getCollection(USERS_KEY);
  const user = users.find((u) => u.email === currentUser);
  if (!user) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");

  if (nameInput && user.name) {
    nameInput.value = user.name;
    nameInput.parentElement?.querySelector("label")?.setAttribute("data-filled", "true");
  }
  if (emailInput && user.email) {
    emailInput.value = user.email;
    emailInput.parentElement?.querySelector("label")?.setAttribute("data-filled", "true");
  }
  if (phoneInput && user.phone) {
    phoneInput.value = user.phone;
    phoneInput.parentElement?.querySelector("label")?.setAttribute("data-filled", "true");
  }
};

/* Run on reserva.html */
if (document.getElementById("reservationForm")) {
  window.addEventListener("DOMContentLoaded", autoFillUserData);
}

/* Save user phone when registering */
const enhanceRegistration = () => {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  registerForm.addEventListener("submit", (event) => {
    const formData = new FormData(registerForm);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim().toLowerCase();
    const password = (formData.get("password") || "").toString().trim();

    if (!name || !email || !password) return;

    const existing = FixLabDB.findOne(FixLabDB.collections.USERS, { email });
    if (existing) {
      FixLabDB.updateOne(FixLabDB.collections.USERS, { email }, { $set: { name, passwordHash: FixLabDB.hashPassword(password) } });
    } else {
      FixLabDB.insert(FixLabDB.collections.USERS, {
        name,
        email,
        passwordHash: FixLabDB.hashPassword(password)
      });
    }

    // Hacer FixLabDB accesible globalmente
    window.FixLabDB = FixLabDB;
  });
};

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href) {
      return;
    }
    const isExternal = link.target === "_blank" || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
    const isAnchor = href.startsWith("#");
    const isDownload = link.hasAttribute("download");
    if (isExternal || isAnchor || isDownload || event.defaultPrevented) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("page-leaving");
    window.setTimeout(() => {
      window.location.href = href;
    }, 85);
  });
});

/* ==================== Admin Database Page ==================== */
const ADMIN_CREDENTIALS = [
  { email: 'fixlabcyl@gmail.com', password: 'Skibidi67' },
  { email: 'test@gmail.com', password: 'Fixlab123' }
];
const ADMIN_SESSION_KEY = 'fixlab_admin_session';

const adminLoginSection = document.getElementById('adminLoginSection');
const adminPanel = document.getElementById('adminPanel');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginMessage = document.getElementById('adminLoginMessage');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const dbStats = document.getElementById('dbStats');
const dbCollections = document.getElementById('dbCollections');

const isAdminPage = adminLoginForm !== null;

if (isAdminPage) {
  // Si ya hay sesión de admin activa
  if (sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
    showAdminPanel();
  }

  adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(adminLoginForm);
    const email = (formData.get('email') || '').toString().trim().toLowerCase();
    const password = (formData.get('password') || '').toString();

    if (ADMIN_CREDENTIALS.some(c => email === c.email && password === c.password)) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      showAdminPanel();
    } else {
      adminLoginMessage.textContent = 'Credenciales incorrectas.';
      adminLoginMessage.style.color = '#b1416f';
    }
  });

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      adminPanel.style.display = 'none';
      adminLoginSection.style.display = 'block';
      adminLoginForm.reset();
    });
  }
}

function showAdminPanel() {
  if (!adminLoginSection || !adminPanel) return;
  adminLoginSection.style.display = 'none';
  adminPanel.style.display = 'block';
  renderDatabase();
}

function renderDatabase() {
  if (!dbStats || !dbCollections) return;

  const collections = FixLabDB.collections;
  const icons = { USERS: '👤', SESSION: '🔐', RESERVATIONS: '🎫', TICKETS: '📋' };

  // Estadísticas
  let statsHTML = '';
  Object.entries(collections).forEach(([name, key]) => {
    const data = FixLabDB.getCollection(key);
    const label = name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const icon = icons[name] || '📄';
    statsHTML += `<div class="stat">
      <div class="icon">${icon}</div>
      <div class="info"><strong>${data.length}</strong><span>${label}</span></div>
    </div>`;
  });
  dbStats.innerHTML = statsHTML;

  // Colecciones en tablas
  let html = '';
  Object.entries(collections).forEach(([name, key]) => {
    const data = FixLabDB.getCollection(key);
    const label = name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const icon = icons[name] || '📄';

    if (data.length === 0) {
      html += `<div class="db-collection">
        <h3>${icon} ${label} <span class="count">0 registros</span></h3>
        <div class="empty-collection">No hay datos en esta colección</div>
      </div>`;
      return;
    }

    // Obtener todas las claves únicas de todos los objetos
    const allKeys = new Set();
    data.forEach(item => Object.keys(item).forEach(k => allKeys.add(k)));
    const headers = Array.from(allKeys);

    let tableHTML = `<div class="table-wrapper"><table>
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${data.map(item => `<tr>${headers.map(h => {
      let val = item[h];
      if (val === undefined || val === null) return '<td>-</td>';
      if (typeof val === 'object') val = JSON.stringify(val);
      if (typeof val === 'string' && val.length > 50) val = val.substring(0, 50) + '...';
      return `<td title="${item[h] !== null && item[h] !== undefined ? String(item[h]) : ''}">${val}</td>`;
    }).join('')}</tr>`).join('')}</tbody>
    </table></div>`;

    html += `<div class="db-collection">
      <h3>${icon} ${label} <span class="count">${data.length} registros</span></h3>
      ${tableHTML}
    </div>`;
  });
  dbCollections.innerHTML = html;
}

// Botones de administración
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');

if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    renderDatabase();
  });
}

if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    const data = {};
    Object.values(FixLabDB.collections).forEach(key => {
      data[key] = FixLabDB.getCollection(key);
    });
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fixlab_db_export.json';
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Navegación por tabs en admin
const tabBtns = document.querySelectorAll('.tab-btn');
const tabDb = document.getElementById('tab-db');
const tabPages = document.getElementById('tab-pages');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => {
      b.style.color = '#666';
      b.style.borderBottomColor = 'transparent';
    });
    btn.style.color = '#3d63db';
    btn.style.borderBottomColor = '#3d63db';

    const tab = btn.getAttribute('data-tab');
    if (tab === 'db') {
      tabDb.style.display = 'block';
      tabPages.style.display = 'none';
      renderDatabase();
    } else {
      tabDb.style.display = 'none';
      tabPages.style.display = 'block';
    }
  });
});

// Editor de páginas
const pageSelector = document.getElementById('pageSelector');
const loadPageBtn = document.getElementById('loadPageBtn');
const toggleEditBtn = document.getElementById('toggleEditBtn');
const savePageBtn = document.getElementById('savePageBtn');
const resetPageBtn = document.getElementById('resetPageBtn');
const pagePreview = document.getElementById('pagePreview');
const pageEditorStatus = document.getElementById('pageEditorStatus');
let currentEditPage = null;
let editModeActive = false;

if (loadPageBtn) {
  loadPageBtn.addEventListener('click', () => {
    const page = pageSelector.value;
    if (!page) return;
    currentEditPage = page;
    editModeActive = false;
    pagePreview.src = page;
    toggleEditBtn.style.display = 'inline-block';
    toggleEditBtn.textContent = 'Activar Edición';
    toggleEditBtn.disabled = false;
    savePageBtn.style.display = 'none';
    pageEditorStatus.style.display = 'block';
    pageEditorStatus.style.background = '#d4edda';
    pageEditorStatus.style.color = '#155724';
    pageEditorStatus.textContent = 'Página cargada. Haz clic en "Activar Edición" para empezar.';
    setTimeout(() => {
      if (!editModeActive) pageEditorStatus.style.display = 'none';
    }, 3000);
  });
}

if (toggleEditBtn) {
  toggleEditBtn.addEventListener('click', () => {
    if (!currentEditPage) return;

    if (!editModeActive) {
      // Enviar mensaje al iframe para activar edición
      pagePreview.contentWindow.postMessage({
        type: 'enableEditMode',
        pageId: currentEditPage.replace('.html', '')
      }, '*');

      editModeActive = true;
      toggleEditBtn.textContent = 'Desactivar Edición';
      savePageBtn.style.display = 'inline-block';

      pageEditorStatus.style.display = 'block';
      pageEditorStatus.style.background = '#d4edda';
      pageEditorStatus.style.color = '#155724';
      pageEditorStatus.textContent = 'Modo edición activado. Edita los campos resaltados en azul.';
    } else {
      // Desactivar edición
      pagePreview.contentWindow.postMessage({
        type: 'disableEditMode'
      }, '*');

      editModeActive = false;
      toggleEditBtn.textContent = 'Activar Edición';
      savePageBtn.style.display = 'none';
      pageEditorStatus.style.display = 'none';
    }
  });
}

if (savePageBtn) {
  savePageBtn.addEventListener('click', () => {
    if (!currentEditPage) return;

    // Pedir contenido al iframe
    pagePreview.contentWindow.postMessage({
      type: 'saveContent',
      pageId: currentEditPage.replace('.html', '')
    }, '*');
  });
}

// Escuchar respuestas del iframe
window.addEventListener('message', (event) => {
  if (event.data.type === 'contentSaved') {
    pageEditorStatus.style.display = 'block';
    pageEditorStatus.style.background = '#d4edda';
    pageEditorStatus.style.color = '#155724';
    pageEditorStatus.textContent = 'Cambios guardados correctamente.';
    setTimeout(() => { pageEditorStatus.style.display = 'none'; }, 3000);
  } else if (event.data.type === 'saveError') {
    pageEditorStatus.style.display = 'block';
    pageEditorStatus.style.background = '#f8d7da';
    pageEditorStatus.style.color = '#721c24';
    pageEditorStatus.textContent = 'Error al guardar los cambios.';
  }
});

if (resetPageBtn) {
  resetPageBtn.addEventListener('click', () => {
    if (!currentEditPage) return;
    const pageId = currentEditPage.replace('.html', '');
    const all = ContentManager.getAllContent();
    delete all[pageId];
    localStorage.setItem('fixlab_editable_content', JSON.stringify(all));

    pagePreview.src = pagePreview.src;

    pageEditorStatus.style.display = 'block';
    pageEditorStatus.style.background = '#d4edda';
    pageEditorStatus.style.color = '#155724';
    pageEditorStatus.textContent = 'Página restaurada al contenido original.';
    setTimeout(() => { pageEditorStatus.style.display = 'none'; }, 3000);
  });
}

// Escuchar mensajes del padre (para edición de páginas)
window.addEventListener('message', (event) => {
  if (event.data.type === 'enableEditMode') {
    // Aplicar contenido guardado
    const savedContent = ContentManager.getPageContent(event.data.pageId);
    Object.entries(savedContent).forEach(([key, value]) => {
      const el = document.querySelector(`[data-editable="${key}"]`);
      if (el) el.innerHTML = value;
    });

    // Activar modo edición
    document.querySelectorAll('[data-editable]').forEach(el => {
      el.setAttribute('contenteditable', 'true');
      el.style.outline = '2px dashed #3d63db';
      el.style.padding = '4px';
      el.style.backgroundColor = 'rgba(61,99,219,0.05)';
    });

    // Activar edición de imágenes
    document.querySelectorAll('[data-editable-img]').forEach(el => {
      el.style.outline = '2px dashed #28a745';
      el.style.cursor = 'pointer';
      el.title = 'Click para cambiar imagen';
      el.addEventListener('click', ContentManager._handleImageClick);
    });

    // Activar edición de estilos
    document.querySelectorAll('[data-style]').forEach(el => {
      el.style.outline = '2px dashed #dc3545';
      el.style.cursor = 'pointer';
      el.title = 'Click para editar estilos';
      el.addEventListener('click', ContentManager._handleStyleClick);
    });

  } else if (event.data.type === 'disableEditMode') {
    // Desactivar modo edición
    document.querySelectorAll('[data-editable]').forEach(el => {
      el.removeAttribute('contenteditable');
      el.style.outline = '';
      el.style.padding = '';
      el.style.backgroundColor = '';
    });

    document.querySelectorAll('[data-editable-img]').forEach(el => {
      el.style.outline = '';
      el.style.cursor = '';
      el.title = '';
      el.removeEventListener('click', ContentManager._handleImageClick);
    });

    document.querySelectorAll('[data-style]').forEach(el => {
      el.style.outline = '';
      el.style.cursor = '';
      el.title = '';
      el.removeEventListener('click', ContentManager._handleStyleClick);
    });

  } else if (event.data.type === 'saveContent') {
    // Guardar contenido
    try {
      const content = {};
      document.querySelectorAll('[data-editable]').forEach(el => {
        content[el.getAttribute('data-editable')] = el.innerHTML;
      });
      ContentManager.saveContent(event.data.pageId, content);

      // Guardar estilos
      const styles = ContentManager.collectStyles();
      if (Object.keys(styles).length > 0) {
        ContentManager.saveStyles(event.data.pageId, styles);
      }

      window.parent.postMessage({ type: 'contentSaved' }, '*');
    } catch (e) {
      window.parent.postMessage({ type: 'saveError' }, '*');
    }

  } else if (event.data.type === 'enableColorEdit') {
    // Activar edición de colores
    document.querySelectorAll('[data-color]').forEach(el => {
      el.style.outline = '2px dashed #ffc107';
      el.style.cursor = 'pointer';
      el.title = 'Click para cambiar color';
      el.addEventListener('click', ContentManager._handleColorClick);
    });
    alert('Modo edición de colores activado. Haz click en los elementos resaltados en amarillo.');

  } else if (event.data.type === 'enableImageEdit') {
    // Activar edición de imágenes
    document.querySelectorAll('img, [data-editable-img]').forEach(el => {
      el.style.outline = '2px dashed #28a745';
      el.style.cursor = 'pointer';
      el.title = 'Click para cambiar imagen';
      el.addEventListener('click', ContentManager._handleImageClick);
    });
    alert('Modo edición de imágenes activado. Haz click en las imágenes resaltadas en verde.');

  } else if (event.data.type === 'enableIconEdit') {
    // Activar edición de iconos
    document.querySelectorAll('[data-icon]').forEach(el => {
      el.style.outline = '2px dashed #17a2b8';
      el.style.cursor = 'pointer';
      el.title = 'Click para cambiar icono';
      el.addEventListener('click', ContentManager._handleIconClick);
    });
    alert('Modo edición de iconos activado. Haz click en los iconos resaltados en cyan.');

  } else if (event.data.type === 'enableEffectsEdit') {
    // Activar edición de efectos
    document.querySelectorAll('[data-effect]').forEach(el => {
      el.style.outline = '2px dashed #e83e8c';
      el.style.cursor = 'pointer';
      el.title = 'Click para editar efectos';
      el.addEventListener('click', ContentManager._handleEffectClick);
    });
    alert('Modo edición de efectos activado. Haz click en los elementos resaltados en rosa.');
  }
});

// Botones de edición visual en admin
const editColorsBtn = document.getElementById('editColorsBtn');
const editImagesBtn = document.getElementById('editImagesBtn');
const editIconsBtn = document.getElementById('editIconsBtn');
const editEffectsBtn = document.getElementById('editEffectsBtn');

if (editColorsBtn) {
  editColorsBtn.addEventListener('click', () => {
    if (!currentEditPage) return;
    pagePreview.contentWindow.postMessage({
      type: 'enableColorEdit',
      pageId: currentEditPage.replace('.html', '')
    }, '*');
  });
}

if (editImagesBtn) {
  editImagesBtn.addEventListener('click', () => {
    if (!currentEditPage) return;
    pagePreview.contentWindow.postMessage({
      type: 'enableImageEdit',
      pageId: currentEditPage.replace('.html', '')
    }, '*');
  });
}

if (editIconsBtn) {
  editIconsBtn.addEventListener('click', () => {
    if (!currentEditPage) return;
    pagePreview.contentWindow.postMessage({
      type: 'enableIconEdit',
      pageId: currentEditPage.replace('.html', '')
    }, '*');
  });
}

if (editEffectsBtn) {
  editEffectsBtn.addEventListener('click', () => {
    if (!currentEditPage) return;
    pagePreview.contentWindow.postMessage({
      type: 'enableEffectsEdit',
      pageId: currentEditPage.replace('.html', '')
    }, '*');
  });
}

// Nuevo panel de administración WordPress-like
const loginWrapper = document.getElementById('loginWrapper');
const adminWrapper = document.getElementById('adminWrapper');
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const topbarTitle = document.getElementById('topbarTitle');
const contentFrame = document.getElementById('contentFrame');
const btnRefresh = document.getElementById('btnRefresh');
const btnSave = document.getElementById('btnSave');
const btnLogout = document.getElementById('btnLogout');
const contextMenu = document.getElementById('contextMenu');
const modalOverlay = document.getElementById('modalOverlay');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

let currentSection = 'dashboard';
let currentAction = null;
let selectedElement = null;
let isEditMode = false;

// Login
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(adminLoginForm);
    const email = (formData.get('email') || '').toString().trim().toLowerCase();
    const password = (formData.get('password') || '').toString();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      loginWrapper.style.display = 'none';
      adminWrapper.style.display = 'flex';
      loadDashboard();
    } else {
      adminLoginMessage.textContent = 'Credenciales incorrectas.';
      adminLoginMessage.style.color = '#b1416f';
    }
  });
}

// Logout
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    adminWrapper.style.display = 'none';
    loginWrapper.style.display = 'flex';
    adminLoginForm.reset();
  });
}

// Toggle sidebar
if (toggleSidebarBtn) {
  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
}

// Nav items
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    const section = item.getAttribute('data-section');
    const action = item.getAttribute('data-action');

    if (section) {
      currentSection = section;
      topbarTitle.textContent = item.textContent.trim();

      if (section === 'dashboard') {
        loadDashboard();
      } else if (section === 'pages') {
        topbarTitle.textContent = 'Seleccionar Página';
        contentFrame.src = 'about:blank';
        showPageSelector();
      } else if (section === 'database') {
        topbarTitle.textContent = 'Base de Datos';
        loadDatabase();
      }
    }

    if (action) {
      currentAction = action;
      topbarTitle.textContent = item.textContent.trim();
      handleAction(action);
    }
  });
});

// Cargar dashboard
function loadDashboard() {
  btnSave.style.display = 'none';
  contentFrame.src = 'index.html';
}

// Cargar base de datos
function loadDatabase() {
  btnSave.style.display = 'none';
  // Mostrar vista de base de datos
  const html = `
    <div style="padding:2rem; overflow-y:auto; height:100%;">
      <h2 style="color:#1e293b; margin-top:0;">Base de Datos</h2>
      <div id="dbStats" style="display:flex; gap:1.5rem; flex-wrap:wrap; margin-bottom:2rem;"></div>
      <div id="dbCollections"></div>
    </div>
  `;
  contentFrame.onload = null;
  contentFrame.srcdoc = html;
  setTimeout(() => {
    renderDatabase();
  }, 100);
}

// Mostrar selector de página
function showPageSelector() {
  const pageSelectorOverlay = document.getElementById('pageSelectorOverlay');
  const pageGrid = document.getElementById('pageGrid');

  const pages = [
    { file: 'index.html', name: 'Inicio' },
    { file: 'servicios.html', name: 'Servicios' },
    { file: 'tiendas.html', name: 'Tiendas' },
    { file: 'tienda.html', name: 'Tienda' },
    { file: 'contacto.html', name: 'Contacto' },
    { file: 'servicio-pantalla.html', name: 'Servicio - Pantalla' },
    { file: 'servicio-bateria.html', name: 'Servicio - Batería' },
    { file: 'servicio-camara.html', name: 'Servicio - Cámara' },
    { file: 'servicio-conector.html', name: 'Servicio - Conector' },
    { file: 'servicio-agua.html', name: 'Servicio - Agua' },
    { file: 'tienda-rio-shopping.html', name: 'Tienda - Río Shopping' },
    { file: 'tienda-centro.html', name: 'Tienda - Centro' },
    { file: 'tienda-burgos.html', name: 'Tienda - Burgos' },
    { file: 'aviso-legal.html', name: 'Aviso Legal' },
    { file: 'politica-privacidad.html', name: 'Política Privacidad' },
    { file: 'politica-cookies.html', name: 'Política Cookies' }
  ];

  pageGrid.innerHTML = pages.map(p => `
    <div onclick="selectPage('${p.file}')" style="background:#fff; padding:1.5rem; border-radius:8px; cursor:pointer; border:1px solid #e2e8f0; transition:all 0.2s; hover:border-color:#3d63db; hover:box-shadow:0 4px 12px rgba(61,99,219,0.1);">
      <div style="font-size:1.1rem; font-weight:600; color:#1e293b; margin-bottom:0.5rem;">${p.name}</div>
      <div style="font-size:0.85rem; color:#64748b;">${p.file}</div>
    </div>
  `).join('');

  pageSelectorOverlay.classList.add('show');
}

// Cerrar selector
document.addEventListener('click', (e) => {
  const overlay = document.getElementById('pageSelectorOverlay');
  if (e.target === overlay) {
    overlay.classList.remove('show');
  }
});

// Seleccionar página
window.selectPage = function (page) {
  const overlay = document.getElementById('pageSelectorOverlay');
  overlay.classList.remove('show');

  if (contentFrame) {
    contentFrame.src = page;
    topbarTitle.textContent = 'Editando: ' + page;
    if (btnSave) btnSave.style.display = 'inline-block';
    isEditMode = false;

    // Esperar a que cargue
    contentFrame.onload = () => {
      // Inyectar ContentManager si no existe
      try {
        const iframeDoc = contentFrame.contentDocument || contentFrame.contentWindow.document;
        if (iframeDoc && !iframeDoc.defaultView.ContentManager) {
          const script = iframeDoc.createElement('script');
          script.src = 'assets/js/script.js';
          iframeDoc.body.appendChild(script);
        }
      } catch (e) { }
    };
  }
};

// Manejar acciones
function handleAction(action) {
  if (!contentFrame.src || contentFrame.src === 'about:blank') {
    alert('Selecciona una página primero');
    return;
  }

  if (action === 'edit-content') {
    enableContentEdit();
  } else if (action === 'edit-colors') {
    enableColorEdit();
  } else if (action === 'edit-images') {
    enableImageEdit();
  } else if (action === 'edit-icons') {
    enableIconEdit();
  } else if (action === 'edit-effects') {
    enableEffectsEdit();
  } else if (action === 'export-json') {
    exportToJSON();
  } else if (action === 'import-json') {
    importFromJSON();
  }
}

// Habilitar edición de contenido
function enableContentEdit() {
  try {
    const iframeDoc = contentFrame.contentDocument || contentFrame.contentWindow.document;
    iframeDoc.querySelectorAll('[data-editable]').forEach(el => {
      el.setAttribute('contenteditable', 'true');
      el.style.outline = '2px dashed #3d63db';
      el.style.padding = '4px';
      el.style.backgroundColor = 'rgba(61,99,219,0.05)';
    });
    isEditMode = 'content';
    alert('Modo edición activado. Los campos editables están resaltados en azul.');
  } catch (e) {
    alert('Error al activar edición: ' + e.message);
  }
}

// Habilitar edición de colores
function enableColorEdit() {
  try {
    const iframeDoc = contentFrame.contentDocument || contentFrame.contentWindow.document;
    iframeDoc.querySelectorAll('[data-color], [style*="color"], [class*="color"], [class*="bg-"]').forEach(el => {
      el.style.outline = '2px dashed #ffc107';
      el.style.cursor = 'pointer';
      el.addEventListener('click', handleColorClick);
    });
    isEditMode = 'color';
    alert('Modo edición de colores activado. Haz click en los elementos resaltados en amarillo.');
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

function handleColorClick(e) {
  e.preventDefault();
  const el = e.target;
  const currentColor = el.style.color || getComputedStyle(el).color;
  const newColor = prompt('Nuevo color:', currentColor);
  if (newColor !== null) {
    el.style.color = newColor;
  }
}

// Habilitar edición de imágenes
function enableImageEdit() {
  try {
    const iframeDoc = contentFrame.contentDocument || contentFrame.contentWindow.document;
    iframeDoc.querySelectorAll('img').forEach(el => {
      el.style.outline = '2px dashed #28a745';
      el.style.cursor = 'pointer';
      el.addEventListener('click', handleImageClick);
    });
    isEditMode = 'image';
    alert('Modo edición de imágenes activado. Haz click en las imágenes resaltadas en verde.');
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

function handleImageClick(e) {
  e.preventDefault();
  const el = e.target;
  const currentSrc = el.src;
  const newSrc = prompt('Nueva URL de imagen:', currentSrc);
  if (newSrc && newSrc !== currentSrc) {
    el.src = newSrc;
  }
}

// Habilitar edición de iconos
function enableIconEdit() {
  try {
    const iframeDoc = contentFrame.contentDocument || contentFrame.contentWindow.document;
    iframeDoc.querySelectorAll('[class*="fa"], [class*="icon"], svg').forEach(el => {
      el.style.outline = '2px dashed #17a2b8';
      el.style.cursor = 'pointer';
      el.addEventListener('click', handleIconClick);
    });
    isEditMode = 'icon';
    alert('Modo edición de iconos activado. Haz click en los iconos resaltados en cyan.');
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

function handleIconClick(e) {
  e.preventDefault();
  const el = e.target;
  const newIcon = prompt('Nuevo icono (clase CSS o HTML):', el.className || el.outerHTML);
  if (newIcon) {
    if (newIcon.startsWith('<')) {
      el.outerHTML = newIcon;
    } else {
      el.className = newIcon;
    }
  }
}

// Habilitar edición de efectos
function enableEffectsEdit() {
  try {
    const iframeDoc = contentFrame.contentDocument || contentFrame.contentWindow.document;
    iframeDoc.querySelectorAll('[data-effect], [class*="shadow"], [class*="glow"], [class*="animate"]').forEach(el => {
      el.style.outline = '2px dashed #e83e8c';
      el.style.cursor = 'pointer';
      el.addEventListener('click', handleEffectClick);
    });
    isEditMode = 'effect';
    alert('Modo edición de efectos activado. Haz click en los elementos resaltados en rosa.');
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

function handleEffectClick(e) {
  e.preventDefault();
  const el = e.target;
  const currentEffect = el.getAttribute('data-effect') || el.style.boxShadow || el.style.animation;
  const newEffect = prompt('Efecto (shadow, glow, pulse, fade, slide):', currentEffect);
  if (newEffect !== null) {
    if (newEffect === '') {
      el.style.boxShadow = '';
      el.style.animation = '';
      el.removeAttribute('data-effect');
    } else {
      el.setAttribute('data-effect', newEffect);
      if (newEffect.includes('shadow')) el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      if (newEffect.includes('glow')) el.style.boxShadow = '0 0 20px rgba(61,99,219,0.5)';
      if (newEffect.includes('pulse')) el.style.animation = 'pulse 2s infinite';
      if (newEffect.includes('fade')) el.style.animation = 'fadeIn 1s';
      if (newEffect.includes('slide')) el.style.animation = 'slideIn 0.5s';
    }
  }
}

// Context menu
contentFrame.addEventListener('load', () => {
  try {
    const iframeDoc = contentFrame.contentDocument || contentFrame.contentWindow.document;
    iframeDoc.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      selectedElement = e.target;

      // Posicionar menú
      contextMenu.style.top = e.clientY + 'px';
      contextMenu.style.left = e.clientX + 'px';
      contextMenu.classList.add('show');

      return false;
    });

    // Cerrar menú al hacer click
    iframeDoc.addEventListener('click', () => {
      contextMenu.classList.remove('show');
    });
  } catch (e) { }
});

// Acciones del context menu
document.querySelectorAll('.context-item').forEach(item => {
  item.addEventListener('click', () => {
    const action = item.getAttribute('data-action');
    contextMenu.classList.remove('show');

    if (!selectedElement) return;

    if (action === 'edit-text') {
      selectedElement.setAttribute('contenteditable', 'true');
      selectedElement.focus();
    } else if (action === 'edit-html') {
      showModal('Editar HTML', `<textarea style="width:100%; height:200px; font-family:monospace;">${selectedElement.outerHTML}</textarea>`, () => {
        const textarea = modalContent.querySelector('textarea');
        if (textarea && textarea.value) {
          try {
            const temp = document.createElement('div');
            temp.innerHTML = textarea.value;
            selectedElement.outerHTML = temp.innerHTML;
          } catch (e) {
            alert('Error: HTML inválido');
          }
        }
      });
    } else if (action === 'edit-style') {
      const computed = getComputedStyle(selectedElement);
      const styles = ['color', 'backgroundColor', 'fontSize', 'margin', 'padding', 'border', 'boxShadow'];
      let html = '';
      styles.forEach(s => {
        html += `<div class="modal-field">
          <label>${s}:</label>
          <input value="${computed[s] || ''}" data-style="${s}">
        </div>`;
      });
      showModal('Editar Estilos', html, () => {
        modalContent.querySelectorAll('input[data-style]').forEach(input => {
          selectedElement.style[input.getAttribute('data-style')] = input.value;
        });
      });
    } else if (action === 'change-image') {
      const newSrc = prompt('Nueva URL:', selectedElement.src || '');
      if (newSrc) selectedElement.src = newSrc;
    } else if (action === 'edit-link') {
      const newHref = prompt('Nuevo enlace:', selectedElement.href || selectedElement.getAttribute('href') || '');
      if (newHref) selectedElement.href = newHref;
    } else if (action === 'change-color') {
      const newColor = prompt('Nuevo color:', getComputedStyle(selectedElement).color);
      if (newColor) selectedElement.style.color = newColor;
    } else if (action === 'delete-element') {
      if (confirm('¿Estás seguro de eliminar este elemento?')) {
        selectedElement.remove();
      }
    }
  });
});

// Cerrar context menu al hacer click fuera
document.addEventListener('click', (e) => {
  if (!contextMenu.contains(e.target)) {
    contextMenu.classList.remove('show');
  }
});

// Modal
function showModal(title, content, onConfirm) {
  modalTitle.textContent = title;
  modalContent.innerHTML = content;
  modalOverlay.classList.add('show');

  modalConfirm.onclick = () => {
    if (onConfirm) onConfirm();
    modalOverlay.classList.remove('show');
  };

  modalCancel.onclick = () => {
    modalOverlay.classList.remove('show');
  };
}

// Guardar cambios
if (btnSave) {
  btnSave.addEventListener('click', () => {
    try {
      const iframeDoc = contentFrame.contentDocument || contentFrame.contentWindow.document;
      const pageId = contentFrame.src.split('/').pop().replace('.html', '');

      // Guardar contenido editable
      const content = {};
      iframeDoc.querySelectorAll('[data-editable]').forEach(el => {
        content[el.getAttribute('data-editable')] = el.innerHTML;
      });
      if (Object.keys(content).length > 0) {
        ContentManager.saveContent(pageId, content);
      }

      // Guardar estilos
      ContentManager.saveStyles(pageId, {});

      alert('Cambios guardados correctamente.');
    } catch (e) {
      alert('Error al guardar: ' + e.message);
    }
  });
}

// Refrescar
if (btnRefresh) {
  btnRefresh.addEventListener('click', () => {
    contentFrame.src = contentFrame.src;
  });
}

// Exportar JSON
function exportToJSON() {
  const data = ContentManager.getAllContent();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fixlab_content.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Importar JSON
function importFromJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        localStorage.setItem('fixlab_editable_content', JSON.stringify(data));
        alert('Contenido importado correctamente.');
      } catch (e) {
        alert('Error: Archivo JSON inválido');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}



/* ── CALCULADORA DE PRESUPUESTO ─────────────────────────── */
const REPAIR_PRICES = {
  pantalla: { base: 69, multiplier: 1.4, time: "30-60 min", stock: "Stock disponible" },
  bateria: { base: 49, multiplier: 1.2, time: "30-45 min", stock: "Stock disponible" },
  camara: { base: 55, multiplier: 1.3, time: "30-60 min", stock: "Stock disponible" },
  agua: { base: 59, multiplier: 1.0, time: "24-48h", stock: "Bajo pedido 24-48h" },
  conector: { base: 45, multiplier: 1.2, time: "30-45 min", stock: "Stock disponible" },
  botones: { base: 39, multiplier: 1.1, time: "30-45 min", stock: "Stock disponible" },
  altavoz: { base: 35, multiplier: 1.1, time: "30-45 min", stock: "Stock disponible" },
  microfono: { base: 35, multiplier: 1.1, time: "30-45 min", stock: "Stock disponible" }
};

const HIGH_END_MODELS = [
  "iPhone 12 Pro", "iPhone 13 Pro", "iPhone 14 Pro", "iPhone 15 Pro",
  "Samsung Galaxy S21", "Samsung Galaxy S22", "Samsung Galaxy S23", "Samsung Galaxy S24"
];

const calcModel = document.getElementById("calcModel");
const calcModelSearch = document.getElementById("calcModelSearch");
const calcIssue = document.getElementById("calcIssue");
const calcResult = document.getElementById("calcResult");
const calcResultModel = document.getElementById("calcResultModel");
const calcResultIssue = document.getElementById("calcResultIssue");
const calcResultPrice = document.getElementById("calcResultPrice");
const calcResultTime = document.getElementById("calcResultTime");
const calcResultStock = document.getElementById("calcResultStock");
const calcReserveBtn = document.getElementById("calcReserveBtn");

const updateCalcResult = () => {
  const model = calcModel ? calcModel.value : "";
  const issue = calcIssue ? calcIssue.value : "";

  if (!calcResult) return;

  if (!model || !issue) {
    calcResultModel.textContent = "Selecciona modelo y avería";
    calcResultIssue.textContent = "";
    calcResultPrice.textContent = "";
    calcResultTime.textContent = "";
    calcResultStock.textContent = "";
    calcResult.hidden = false;
    return;
  }

  const repair = REPAIR_PRICES[issue];
  if (!repair) return;

  const isHighEnd = HIGH_END_MODELS.includes(model);
  const price = Math.round(repair.base * (isHighEnd ? repair.multiplier : 1));
  const priceMax = Math.round(price * 1.3);

  calcResultModel.textContent = model;
  calcResultIssue.textContent = issue.charAt(0).toUpperCase() + issue.slice(1);
  calcResultPrice.textContent = price === priceMax ? `${price}€` : `${price}€ - ${priceMax}€`;
  calcResultTime.textContent = repair.time;
  calcResultStock.textContent = repair.stock;
  calcResult.hidden = false;

  if (calcReserveBtn) {
    calcReserveBtn.href = `reserva.html?service=${encodeURIComponent(issue)}&model=${encodeURIComponent(model)}`;
  }
};

window.updateCalcResult = updateCalcResult;

const calcBtn = document.getElementById("calcBtn");

if (calcBtn) {
  calcBtn.addEventListener("click", updateCalcResult);
}
if (calcModel) {
  calcModel.addEventListener("change", updateCalcResult);
}
if (calcIssue) {
  calcIssue.addEventListener("change", updateCalcResult);
}

// Filtro de búsqueda de modelos
if (calcModelSearch && calcModel) {
  calcModelSearch.addEventListener("input", () => {
    const query = calcModelSearch.value.toLowerCase();
    const options = calcModel.querySelectorAll("option");
    const optgroups = calcModel.querySelectorAll("optgroup");

    options.forEach(opt => {
      if (opt.value === "") return;
      const text = opt.textContent.toLowerCase();
      opt.style.display = text.includes(query) ? "" : "none";
    });

    optgroups.forEach(group => {
      const visibleOptions = Array.from(group.querySelectorAll("option")).filter(o => o.style.display !== "none" && o.value !== "");
      group.style.display = visibleOptions.length > 0 ? "" : "none";
    });
  });
}

/* ── SEGUIMIENTO PÚBLICO ─────────────────────────── */
const publicTrackingForm = document.getElementById("publicTrackingForm");
const ticketNumberInput = document.getElementById("ticketNumber");
const publicTrackingMessage = document.getElementById("trackingMessage");
const publicTrackingResult = document.getElementById("trackingResult");
const trackingNotFound = document.getElementById("trackingNotFound");
const trackService = document.getElementById("trackService");
const trackOrderNumber = document.getElementById("trackOrderNumber");
const trackModel = document.getElementById("trackModel");
const trackStore = document.getElementById("trackStore");
const trackStatus = document.getElementById("trackStatus");
const trackDate = document.getElementById("trackDate");
const stepper = document.getElementById("stepper");

const TRACKING_STEPS = [
  "Recibido",
  "En diagnóstico",
  "Reparando",
  "Listo para recoger",
  "Entregado"
];

function getPublicTrackingStepIndex(status) {
  if (!status) return 0;
  const normalized = status.toString().toLowerCase();
  if (normalized.includes("entregado")) return 4;
  if (normalized.includes("listo")) return 3;
  if (normalized.includes("reparando") || normalized.includes("reparaci")) return 2;
  if (normalized.includes("diagn")) return 1;
  return 0;
}

function normalizePublicTicket(value) {
  return (value || "").toString().replace("#", "").trim().toUpperCase();
}

function readPublicTrackingCollection(key) {
  try {
    if (key === FixLabDB.collections.RESERVATIONS) {
      return FixLabDB.getCollection(FixLabDB.collections.RESERVATIONS);
    }

    return [];
  } catch {
    return [];
  }
}

function pickBestPublicTrackingReservation(current, next) {
  if (!current) return next;

  const currentTime = Date.parse(current.updatedAt || current.createdAt || current.date || "");
  const nextTime = Date.parse(next.updatedAt || next.createdAt || next.date || "");
  if (!Number.isNaN(nextTime) && (Number.isNaN(currentTime) || nextTime > currentTime)) {
    return next;
  }

  if (getPublicTrackingStepIndex(next.status) > getPublicTrackingStepIndex(current.status)) {
    return next;
  }

  return current;
}

function getPublicTrackingReservations() {
  const primary = readPublicTrackingCollection(FixLabDB.collections.RESERVATIONS);
  const byTicket = new Map();

  primary.forEach((item) => {
    const id = normalizePublicTicket(item.orderNumber || item.code || item._id);
    if (!id) return;
    byTicket.set(id, pickBestPublicTrackingReservation(byTicket.get(id), item));
  });

  return Array.from(byTicket.values());
}

if (publicTrackingForm && ticketNumberInput) {
  publicTrackingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const ticket = ticketNumberInput.value.trim().toUpperCase();

    if (!/^FL-\d{4}-\d{4}$/.test(ticket)) {
      if (publicTrackingMessage) {
        publicTrackingMessage.textContent = "Formato inválido. Usa: FL-YYYY-XXXX";
        publicTrackingMessage.style.color = "#b1416f";
        publicTrackingMessage.hidden = false;
      }
      if (publicTrackingResult) publicTrackingResult.hidden = true;
      if (trackingNotFound) trackingNotFound.hidden = true;
      return;
    }

    const reservations = getPublicTrackingReservations();
    const found = reservations.find((r) => {
      const reservationCode = normalizePublicTicket(r.orderNumber || r.code);
      return reservationCode === ticket;
    });

    if (!found) {
      if (publicTrackingMessage) publicTrackingMessage.hidden = true;
      if (publicTrackingResult) publicTrackingResult.hidden = true;
      if (trackingNotFound) trackingNotFound.hidden = false;
      return;
    }

    if (trackingNotFound) trackingNotFound.hidden = true;
    if (publicTrackingMessage) publicTrackingMessage.hidden = true;
    if (publicTrackingResult) publicTrackingResult.hidden = false;

    if (trackService) trackService.textContent = found.service || "Reparación";
    if (trackOrderNumber) trackOrderNumber.textContent = ticket;
    if (trackModel) trackModel.textContent = (found.service || "").split("·")[0]?.trim() || "N/A";
    if (trackStore) trackStore.textContent = found.store || "N/A";

    const checksum = ticket.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const stepIndex = found.status ? getPublicTrackingStepIndex(found.status) : checksum % TRACKING_STEPS.length;
    const status = found.status || TRACKING_STEPS[stepIndex];
    if (trackStatus) trackStatus.textContent = status;

    const today = new Date();
    const estDays = 1 + ((checksum + (found.phone ? normalizePhoneValue(found.phone).length : 0)) % 4);
    const estDate = new Date(today);
    estDate.setDate(today.getDate() + estDays);
    if (trackDate) trackDate.textContent = estDate.toLocaleDateString("es-ES", { day: "numeric", month: "long" });

    if (stepper) {
      const steps = stepper.querySelectorAll(".stepper-step");
      const lines = stepper.querySelectorAll(".stepper-line");

      steps.forEach((step, i) => {
        step.classList.remove("completed", "active");
        if (i < stepIndex) step.classList.add("completed");
        if (i === stepIndex) step.classList.add("active");
      });

      lines.forEach((line, i) => {
        line.classList.toggle("completed", i < stepIndex);
      });
    }
  });
}

// Pre-llenar desde query params en reserva.html
if (getCurrentPageFileName() === "reserva.html") {
  const params = new URLSearchParams(window.location.search);
  const serviceParam = params.get("service");
  const modelParam = params.get("model");

  if (serviceParam) {
    const serviceSelect = document.getElementById("service");
    if (serviceSelect) {
      const match = Array.from(serviceSelect.options).find(opt =>
        opt.value.toLowerCase() === serviceParam.toLowerCase() ||
        opt.text.toLowerCase().includes(serviceParam.toLowerCase())
      );
      if (match) match.selected = true;
      else {
        const newOpt = document.createElement("option");
        newOpt.value = serviceParam;
        newOpt.textContent = serviceParam;
        newOpt.selected = true;
        serviceSelect.appendChild(newOpt);
      }
    }
  }

  if (modelParam) {
    const brandSelect = document.getElementById("deviceBrand");
    if (brandSelect) {
      const match = Array.from(brandSelect.options).find(opt =>
        opt.value.toLowerCase() === modelParam.toLowerCase() ||
        opt.text.toLowerCase().includes(modelParam.toLowerCase())
      );
      if (match) match.selected = true;
    }
  }
}



function calcularPresupuesto() {
  const model = document.getElementById("calcModel")?.value || "";
  const issue = document.getElementById("calcIssue")?.value || "";
  const result = document.getElementById("calcResult");
  if (!result) return;

  if (!model || !issue) {
    const modelResult = document.getElementById("calcResultModel");
    if (modelResult) modelResult.textContent = "Selecciona modelo y avería";
    result.hidden = false;
    return;
  }

  const precios = {
    pantalla: { base: 69, mult: 1.4, time: "30-60 min", stock: "Stock disponible" },
    bateria: { base: 49, mult: 1.2, time: "30-45 min", stock: "Stock disponible" },
    camara: { base: 55, mult: 1.3, time: "30-60 min", stock: "Stock disponible" },
    agua: { base: 59, mult: 1.0, time: "24-48h", stock: "Bajo pedido 24-48h" },
    conector: { base: 45, mult: 1.2, time: "30-45 min", stock: "Stock disponible" },
    botones: { base: 39, mult: 1.1, time: "30-45 min", stock: "Stock disponible" },
    altavoz: { base: 35, mult: 1.1, time: "30-45 min", stock: "Stock disponible" },
    microfono: { base: 35, mult: 1.1, time: "30-45 min", stock: "Stock disponible" }
  };

  const premium = ["iPhone 12 Pro", "iPhone 13 Pro", "iPhone 14 Pro", "iPhone 15 Pro", "Samsung Galaxy S21", "Samsung Galaxy S22", "Samsung Galaxy S23", "Samsung Galaxy S24"];

  const repair = precios[issue];
  if (!repair) return;

  const isPremium = premium.includes(model);
  const price = Math.round(repair.base * (isPremium ? repair.mult : 1));
  const priceMax = Math.round(price * 1.3);

  const resModel = document.getElementById("calcResultModel");
  const resIssue = document.getElementById("calcResultIssue");
  const resPrice = document.getElementById("calcResultPrice");
  const resTime = document.getElementById("calcResultTime");
  const resStock = document.getElementById("calcResultStock");

  if (resModel) resModel.textContent = model;
  if (resIssue) resIssue.textContent = issue.charAt(0).toUpperCase() + issue.slice(1);
  if (resPrice) resPrice.textContent = price === priceMax ? price + "€" : price + "€ - " + priceMax + "€";
  if (resTime) resTime.textContent = repair.time;
  if (resStock) resStock.textContent = repair.stock;
  result.hidden = false;

  const btn = document.getElementById("calcReserveBtn");
  if (btn) btn.href = "reserva.html?service=" + encodeURIComponent(issue) + "&model=" + encodeURIComponent(model);
}

/* ═════════════════════════════════════════════════════════
   ══ FIXLAB PREMIUM EXPERIENCE LOGIC (CONSOLIDATED) ══
   ═════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {

  // 1. CYBER MARQUEE (Noticias)
  const marqueeContainer = document.querySelector(".cyber-marquee");
  if (!marqueeContainer) {
    const marquee = document.createElement("div");
    marquee.className = "cyber-marquee";
    const news = [
      "SISTEMAS OPERATIVOS: ONLINE", "REPARACIÓN EN 45 MINUTOS",
      "IPHONE 15 REACONDICIONADOS DISPONIBLES", "SOPORTE 24/7 WHATSAPP"
    ];
    marquee.innerHTML = `<div class="marquee-content">${news.map(n => `<div class="marquee-item"><span class="marquee-dot"></span>${n}</div>`).join('')}${news.map(n => `<div class="marquee-item"><span class="marquee-dot"></span>${n}</div>`).join('')}</div>`;
    document.body.prepend(marquee);
  }

  // 2. CURSOR GLOW (Optimized with RAF)
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;
  let isAnimatingGlow = false;

  function animateGlow() {
    const easing = 0.15;
    const dx = mouseX - currentX;
    const dy = mouseY - currentY;
    
    currentX += dx * easing;
    currentY += dy * easing;
    
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
    
    // Si la distancia es pequeña, dejamos de animar para ahorrar CPU
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      requestAnimationFrame(animateGlow);
    } else {
      isAnimatingGlow = false;
    }
  }

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!isAnimatingGlow) {
      isAnimatingGlow = true;
      requestAnimationFrame(animateGlow);
    }
  }, { passive: true });

  // 3. SPLASH SCREEN — se mantiene hasta que FixLabDB confirme que Supabase cargó
  const splash = document.querySelector(".splash-screen");
  if (!splash) {
    const s = document.createElement("div");
    s.className = "splash-screen";
    s.innerHTML = `<img src="Fotos/FixLab_Logo.png" class="splash-logo"><div class="splash-loader-bar"><div class="splash-progress" id="splashProgress"></div></div><div class="splash-text" id="splashText">INITIALIZING...</div>`;
    document.body.prepend(s);

    const closeSplash = () => {
      setTimeout(() => { s.classList.add("hidden"); setTimeout(() => s.remove(), 600); }, 400);
    };

    if (FixLabDB._ready) {
      // DB ya cargó antes de que llegara DOMContentLoaded (raro pero posible)
      document.getElementById("splashProgress").style.width = "100%";
      closeSplash();
    } else {
      // Animación de progreso hasta el 85% mientras esperamos a Supabase
      let p = 0;
      const interval = setInterval(() => {
        p = Math.min(p + 12, 85);
        const bar = document.getElementById("splashProgress");
        if (bar) bar.style.width = p + "%";
        if (p >= 85) clearInterval(interval);
      }, 100);

      // Cuando el DB esté listo, completar y cerrar
      document.addEventListener("fixlab:db:ready", () => {
        clearInterval(interval);
        const bar = document.getElementById("splashProgress");
        if (bar) bar.style.width = "100%";
        closeSplash();
      }, { once: true });

      // Timeout de seguridad: si Supabase tarda más de 3s, cerrar igualmente
      setTimeout(() => {
        if (!FixLabDB._ready) closeSplash();
      }, 3000);
    }
  }

  // 5. LIVE ACTIVITY TOASTS
  const activityContainer = document.getElementById("activityToasts");
  if (activityContainer) {
    const showToast = () => {
      const acts = [
        { t: "Nuevo pedido: <b>iPhone 14</b>", i: "🛒" },
        { t: "Reparación: <b>Samsung S23</b>", i: "🔧" },
        { t: "Nueva reseña ⭐⭐⭐⭐⭐", i: "⭐" }
      ];
      const a = acts[Math.floor(Math.random() * acts.length)];
      const toast = document.createElement("div");
      toast.className = "activity-toast";
      toast.innerHTML = `<div class="toast-icon">${a.i}</div><div class="toast-content">${a.t}<br><small>hace un momento</small></div>`;
      activityContainer.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
    };
    setInterval(() => { if (Math.random() > 0.5) showToast(); }, 15000);
  }

  // 7. SCROLL REVEAL (3D EFFECTS)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, { threshold: 0.05 }); // Umbral más bajo para activación inmediata

  document.querySelectorAll(".reveal, .section, .card, .glass-card").forEach(el => {
    if (!el.classList.contains("reveal")) el.classList.add("reveal");
    revealObserver.observe(el);
  });

});
