/* ============================================================
   Tap & Stock — capa de datos compartida (localStorage)
   Todas las páginas leen/escriben las mismas claves para
   mantenerse sincronizadas (incluso entre pestañas).
   ============================================================ */

const DB_KEYS = {
  PRODUCTOS: 'tapstock_productos',
  VENTAS: 'tapstock_ventas',
  CONFIG: 'tapstock_config'
};

const Store = {
  // ---------- Productos ----------
  getProductos() {
    return JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTOS) || '[]');
  },
  saveProductos(lista) {
    localStorage.setItem(DB_KEYS.PRODUCTOS, JSON.stringify(lista));
  },
  getProducto(id) {
    return this.getProductos().find(p => p.id === id);
  },
  upsertProducto(producto) {
    const lista = this.getProductos();
    const i = lista.findIndex(p => p.id === producto.id);
    if (i >= 0) lista[i] = producto; else lista.push(producto);
    this.saveProductos(lista);
  },
  eliminarProducto(id) {
    this.saveProductos(this.getProductos().filter(p => p.id !== id));
  },
  ajustarStock(id, delta) {
    const lista = this.getProductos();
    const p = lista.find(x => x.id === id);
    if (!p) return false;
    p.stock = Math.max(0, (p.stock || 0) + delta);
    this.saveProductos(lista);
    return true;
  },

  // ---------- Ventas ----------
  getVentas() {
    return JSON.parse(localStorage.getItem(DB_KEYS.VENTAS) || '[]');
  },
  saveVentas(lista) {
    localStorage.setItem(DB_KEYS.VENTAS, JSON.stringify(lista));
  },
  registrarVenta(venta) {
    const lista = this.getVentas();
    lista.push(venta);
    this.saveVentas(lista);
  },
  actualizarVenta(ventaActualizada) {
    const lista = this.getVentas();
    const i = lista.findIndex(v => v.id === ventaActualizada.id);
    if (i < 0) return false;
    lista[i] = ventaActualizada;
    this.saveVentas(lista);
    return true;
  },
  anularVenta(id) {
    const lista = this.getVentas();
    const venta = lista.find(v => v.id === id);
    if (!venta || venta.estado === 'anulado') return false;
    venta.estado = 'anulado';
    venta.items.forEach(it => Store.ajustarStock(it.productoId, it.cantidad)); // repone stock
    this.saveVentas(lista);
    return true;
  },

  // ---------- Config ----------
  getConfig() {
    return JSON.parse(localStorage.getItem(DB_KEYS.CONFIG) || '{}');
  },
  saveConfig(cfg) {
    localStorage.setItem(DB_KEYS.CONFIG, JSON.stringify(cfg));
  },
  siguienteNumeroTicket() {
    const cfg = this.getConfig();
    cfg.ultimoTicket = (cfg.ultimoTicket || 0) + 1;
    this.saveConfig(cfg);
    return cfg.ultimoTicket;
  },

  // ---------- Respaldo completo ----------
  exportarTodo() {
    return {
      version: 1,
      exportado: new Date().toISOString(),
      productos: this.getProductos(),
      ventas: this.getVentas(),
      config: this.getConfig()
    };
  },
  importarTodo(datos) {
    if (!datos || typeof datos !== 'object') return false;
    if (Array.isArray(datos.productos)) this.saveProductos(datos.productos);
    if (Array.isArray(datos.ventas)) this.saveVentas(datos.ventas);
    if (datos.config && typeof datos.config === 'object') this.saveConfig(datos.config);
    return true;
  },

  // ---------- utilidades ----------
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },
  formatMoney(n) {
    return 'S/ ' + (Number(n) || 0).toFixed(2);
  },
  formatFecha(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
};

/* Notifica a otras pestañas cuando cambian los datos (se apoya
   en el evento nativo 'storage' que el navegador ya dispara). */
function onDatosCambiaron(callback) {
  window.addEventListener('storage', (e) => {
    if (Object.values(DB_KEYS).includes(e.key)) callback(e);
  });
}

/* ============================================================
   Tapa de botella (chapa) como identificador visual de color.
   Genera un SVG con borde festoneado, como una chapa real.
   ============================================================ */
function capSVG(color, size = 56) {
  const teeth = 20;
  const cx = 50, cy = 50, rOuter = 48, rInner = 40;
  let points = [];
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (Math.PI * i) / teeth;
    const r = i % 2 === 0 ? rOuter : rInner;
    points.push([cx + r * Math.sin(angle), cy - r * Math.cos(angle)]);
  }
  const pathPoints = points.map(p => p.join(',')).join(' ');
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="cap-svg">
      <polygon points="${pathPoints}" fill="${color}" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="33" fill="${color}" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
      <circle cx="38" cy="38" r="8" fill="rgba(255,255,255,.22)"/>
    </svg>`;
}

/* Calcula el color dominante de una imagen (para sugerir el
   color de identificación automáticamente al subir una foto). */
function colorDominante(imgEl) {
  const canvas = document.createElement('canvas');
  const w = canvas.width = 24, h = canvas.height = 24;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgEl, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 100) continue;
    r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
  }
  if (!n) return '#C1682F';
  r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
