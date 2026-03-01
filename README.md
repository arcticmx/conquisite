# CONQUI — Centro de Imagen

Sitio web corporativo para CONQUI, laboratorio de imagen y diagnóstico. Construido con HTML estático, Vanilla JS y Tailwind CSS CDN. Los componentes compartidos (header, footer, secciones) se inyectan dinámicamente via `fetch()` para evitar duplicación de código.

---

## Estructura del proyecto

```
conqui/
├── index.html                  # Página principal (Inicio)
│
├── pages/                      # Una carpeta por sección
│   ├── studies/
│   │   ├── index.html          # Listado de estudios
│   │   ├── detail.html         # Detalle de estudio (recibe ?id=)
│   │   ├── hero.html           # Componente hero local
│   │   ├── list.html           # Componente listado/buscador
│   │   └── studies.js          # Lógica: carga componentes, búsqueda, paginación
│   ├── pack/
│   │   ├── index.html          # Listado de paquetes
│   │   ├── detail.html         # Detalle de paquete (recibe ?id=)
│   │   ├── hero.html
│   │   ├── list.html
│   │   ├── pack.js             # Lógica: carga componentes, búsqueda, paginación
│   │   └── pack-detail.js      # Lógica de la página de detalle
│   ├── about/
│   │   ├── index.html          # Página Nosotros
│   │   ├── content.html        # Contenido con carrusel de imágenes
│   │   └── about.js
│   └── contact/
│       ├── index.html          # Página Contacto
│       ├── content.html        # Formulario + mapa
│       └── contact.js
│
├── components/                 # Fragmentos HTML compartidos (sin <html>/<head>)
│   ├── header.html             # Barra de navegación (desktop + menú móvil)
│   ├── footer.html
│   ├── hero.html               # Hero del inicio
│   ├── services.html           # Sección de servicios (inicio)
│   ├── pack.html               # Sección de paquetes destacados (inicio)
│   ├── about.html              # Sección sobre nosotros (inicio)
│   ├── branches.html           # Sección de sucursales
│   └── credentials.html        # Sección de credenciales/certificaciones
│
├── assets/
│   ├── css/
│   │   └── style.css           # Estilos globales y utilidades CSS
│   ├── js/
│   │   ├── main.js             # Loader del index (carga todos los componentes)
│   │   ├── nav.js              # Helpers de navegación (compartido por todas las páginas)
│   │   ├── shell.js            # Loader para páginas de detalle (usa data-base)
│   │   ├── study-card.js       # Factory de tarjetas de estudio
│   │   ├── pack-card.js        # Factory de tarjetas de paquete
│   │   ├── home-studies.js     # Renderiza estudios destacados en el inicio
│   │   └── home-pack.js        # Renderiza paquetes destacados en el inicio
│   └── data/
│       ├── studies.json        # Catálogo de estudios
│       ├── pack.json           # Catálogo de paquetes
│       └── nosotros-images.json # Imágenes del carrusel en Nosotros
```

---

## Cómo ejecutar (local)

1. Copiar la carpeta `conqui` dentro del directorio público del servidor local:
   - XAMPP: `htdocs/conqui/`
2. Abrir `http://localhost/conqui/` en el navegador.
3. Las demás secciones están en:
   - `http://localhost/conqui/pages/studies/`
   - `http://localhost/conqui/pages/pack/`
   - `http://localhost/conqui/pages/about/`
   - `http://localhost/conqui/pages/contact/`

> El proyecto funciona en cualquier subdirectorio — no hay rutas absolutas hardcodeadas.

---

## Convenciones y mecanismos clave

### Carga de componentes
Cada página tiene un `init()` async que hace `fetch()` de los fragmentos HTML y los inyecta con `element.innerHTML`. Los scripts inline dentro de los componentes **no se ejecutan** por esta razón; toda la lógica interactiva vive en archivos JS externos.

### Rutas portables (`data-href` + `data-root`)
Para que el sitio funcione en cualquier directorio sin hardcodear rutas:
- `<html data-root="">` en `index.html`, `data-root="../../"` en `pages/*/index.html`.
- Los enlaces del nav usan `data-href="pages/studies/"` (relativo a la raíz del sitio).
- `rewriteNavHrefs(root)` — definida en `nav.js` — convierte cada `data-href` en el `href` real tras inyectar el header.

### Resaltado del item activo (`data-page`)
- `<html data-page="studies">` en cada página.
- Los `<a>` del nav en `header.html` llevan `data-page="studies"` etc.
- `activateNavLinks()` — en `nav.js` — compara ambos atributos y añade `text-secondary font-bold` al enlace activo.

### Menú hamburguesa móvil
`setupMobileMenu()` — en `nav.js` — instala el toggle del botón `#mobile-menu-btn` y clona los enlaces de `#desktop-nav-links` al `#mobile-nav-list`. Se llama desde cada `init()` después de inyectar el header.

### Carga de `nav.js` en subpáginas
`nav.js` se incluye como `<script>` estático en cada `pages/*/index.html`, garantizando que `setupMobileMenu` y `activateNavLinks` estén disponibles cuando `init()` los invoca.

### Páginas de detalle (`shell.js`)
`detail.html` usa `<html data-base="../../">` y carga `assets/js/shell.js`, que inyecta header/footer y resuelve el parámetro `?id=` de la URL para mostrar el contenido correcto del JSON.

---

## Stack

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura de páginas y componentes |
| Vanilla JS (ES2017+) | Lógica de carga, renderizado y navegación |
| Tailwind CSS CDN | Estilos utilitarios |
| Roboto (Google Fonts) | Tipografía principal |
| Material Icons Outlined | Iconos de UI |
| Font Awesome 6.4 | Iconos de redes sociales |

---

## Añadir una nueva sección

1. Crear `pages/<nombre>/index.html` con `data-root="../../"` y `data-page="<nombre>"`.
2. Crear `pages/<nombre>/<nombre>.js` con `init()` que cargue `../../components/header.html`, el contenido local y `../../components/footer.html`.
3. Incluir `<script src="../../assets/js/nav.js"></script>` antes del JS de la página.
4. Añadir el enlace en `components/header.html` con `data-href="pages/<nombre>/"` y `data-page="<nombre>"`.

