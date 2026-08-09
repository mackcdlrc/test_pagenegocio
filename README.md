# Tap & Stock — control de venta de cervezas

App estática (HTML/CSS/JS puro, sin frameworks) para controlar el inventario,
punto de venta y finanzas de la venta de cervezas de Punto Escolar.
Los datos se guardan en `localStorage`, en el navegador donde se use.

## Módulos

- **`index.html`** — panel principal con resumen rápido y alertas de stock bajo.
- **`inventario.html`** — alta/edición/baja de productos: nombre, categoría, precio,
  costo, stock y stock mínimo. Puedes subir una foto del producto; el color de
  identificación (la "chapa") se sugiere automáticamente según el color dominante
  de la imagen, y puedes ajustarlo a mano.
- **`pos.html`** — punto de venta. Toca un producto para agregarlo a la venta,
  ajusta cantidades, cobra y se genera un ticket imprimible. El stock se descuenta
  automáticamente al cobrar, y se repone si anulas la venta desde Finanzas.
- **`finanzas.html`** — ingresos, ganancia, ticket promedio, producto más vendido,
  gráficos de ingresos por día, productos top y métodos de pago, e historial
  completo de ventas con opción de anular.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo y sube **todo el contenido de esta carpeta**
   manteniendo la estructura de subcarpetas `css/` y `js/` (no subas los
   archivos sueltos, deben quedar dentro de sus carpetas).
2. En el repositorio: **Settings → Pages → Source: main branch, carpeta `/root`**.
3. Guarda. GitHub te dará una URL tipo
   `https://tu-usuario.github.io/tu-repo/index.html`.

## Notas importantes

- Los datos viven en el navegador (localStorage). Si usas la app desde el
  celular y desde la laptop, cada uno tiene su propio inventario y ventas:
  **no se sincronizan solos entre dispositivos**.
- Usa el botón de **Configuración de respaldo** (o exporta manualmente el
  `localStorage`) si quieres mover los datos de un dispositivo a otro, o pídeme
  que te agregue un botón de exportar/importar JSON como en tu app de
  presupuesto familiar.
- Las fotos de producto se guardan como imagen embebida (base64) dentro del
  mismo `localStorage`; evita fotos muy pesadas para no llenar el límite de
  almacenamiento del navegador (~5-10 MB).
