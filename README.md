**CONQUI - Centro de Imagen (Proyecto)**

- **Descripción:**: Sitio web corporativo sencillo y componentizado para un Conqui imagen y diagnóstico. El proyecto está organizado como páginas estáticas que reutilizan fragmentos HTML (header/footer y secciones) y datos JSON para contenido dinámico (estudios, carrusel).

**Estructura principal**
- `index.html` — página principal (carga componentes desde `components/`).
- `estudios.html` — listado dinámico de estudios (buscador, categorías, paginación).
- `nosotros.html` — página Nosotros con carrusel de imágenes.
- `contacto.html` — formulario de contacto y mapa.
- `components/` — fragmentos reutilizables: `header.html`, `footer.html`, `hero.html`, `services.html`, `contacto.html`, etc.
- `assets/css/style.css` — estilos globales y utilidades.
- `assets/js/` — loaders y lógica por página: `main.js`, `estudios.js`, `nosotros.js`, `contacto.js`, `nav.js` (helper de navegación).
- `assets/data/` — JSON con datos: `studies.json`, `nosotros-images.json`, etc.

**Cómo ejecutar (local)**
- Copiar o dejar la carpeta `conqui` dentro del directorio público de tu servidor local (por ejemplo XAMPP: `htdocs/conqui`).
- Abrir en el navegador: `http://localhost/conqui/` y navegar a `estudios.html`, `nosotros.html`, `contacto.html`.

**Comportamiento y convenciones**
- Las páginas no contienen header/footer duplicados: se inyectan dinámicamente desde `components/` por cada loader JS.
- `assets/js/nav.js` gestiona el resaltado del enlace activo en la barra superior; los loaders garantizan que esté presente antes de invocarlo.
- `estudios.html` carga `assets/data/studies.json` y aplica búsqueda, filtrado por categoría, orden y paginación (6 por página).
- `nosotros.html` carga `assets/data/nosotros-images.json` para el carrusel; el carrusel soporta autoplay, indicadores, teclado y swipe.
- `contacto.html` incluye un formulario con validación mínima en `assets/js/contacto.js` (simula envío) y un iframe de Google Maps con coordenadas configurables.

**Cómo añadir una nueva sección/component**
1. Crear `components/<nombre>.html` (sin `html`, head o body completos).
2. Añadir un placeholder en la página (por ejemplo `contacto.html` usa `<div id="component-contacto"></div>`).
3. Añadir o actualizar el loader JS correspondiente (`assets/js/<pagina>.js`) para `loadComponentTo('component-contacto','components/<nombre>.html')`.

**Notas para desarrolladores**
- Mantener consistencia en clases Tailwind y en `tailwind.config` por página para evitar diferencias de apariencia.
- Si necesitas persistencia real para formularios o edición de JSON, añade un endpoint server-side o un pequeño panel de administración.

Si quieres, puedo:
- Añadir un script de build (postcss/tailwind) o un `package.json` con tareas.
- Crear un pequeño panel para editar los JSON (`assets/data/*.json`) desde el navegador.

Contacto: indica qué prefieres que haga a continuación (tests visuales, ajustes de accesibilidad, optimización de imágenes, etc.).
