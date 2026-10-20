# Red de Noticias

Noticiero virtual con las últimas noticias de Costa Rica. Junta varios medios, los ordena por secciones y permite
leer cada nota completa dentro de la app, buscar y guardar.

## Fuentes de datos

| Dato                   | API                                                    |
| ---------------------- | ------------------------------------------------------ |
| Diario Extra           | `https://www.diarioextra.com/wp-json/wp/v2/posts`      |
| Semanario Universidad  | `https://semanariouniversidad.com/wp-json/wp/v2/posts` |
| Voz de Guanacaste      | `https://www.vozdeguanacaste.com/wp-json/wp/v2/posts`  |
| Surcos Digital         | `https://www.surcosdigital.com/wp-json/wp/v2/posts`    |
| UNA Comunica           | `https://www.una.ac.cr/wp-json/wp/v2/posts`            |
| Clima (San José)       | Open-Meteo                                             |
| Tipo de cambio USD     | `https://api.hacienda.go.cr/indicadores/tc/dolar`      |

Todos los medios usan la API REST de WordPress y permiten CORS, así que se consumen directo desde el navegador.
Los nombres de categorías y etiquetas se piden aparte (`/categories`, `/tags`): incrustarlos con `_embed=wp:term`
hace que algunas respuestas pesen ~2 MB. Los publirreportajes se excluyen (`EXCLUDED_CATEGORIES`).
Si un medio no responde se oculta del filtro y la página sigue con los demás.

## Vistas

La app tiene dos vistas y un router por hash (`src/js/router.js`):

| URL                          | Vista   |
| ---------------------------- | ------- |
| `#/`, `#seccion-…`, vacío    | Portada |
| `#/noticia/<medio>/<id>`     | Nota    |

**Portada**: cinta de última hora, indicadores (clima, tipo de cambio, resumen), filtro por medio, nota principal
con dos secundarias y "Lo último", secciones por categoría (Nacionales, Sucesos, Educación, Ambiente, Salud,
Deportes, Mundo, Economía, Cultura y entretenimiento, Opinión), "Por medio" y "Más noticias" con "Cargar más".

**Nota**: al tocar cualquier noticia se abre dentro de la app (no se sale al medio original). Muestra:

- Titular, bajada, autor, tiempo de lectura y foto con pie de foto.
- El texto completo, limpiado con una lista blanca (`src/js/lib/sanitize.js`): sin scripts, anuncios ni estilos del
  medio; los videos de YouTube se cargan en modo privacidad (`youtube-nocookie.com`).
- Ficha de la nota: medio, autor, sección, categorías, fecha de publicación y de actualización, extensión.
- Etiquetas (al tocarlas se busca ese tema), notas relacionadas y "Lo último" del mismo medio.
- **Fuente original**: el único lugar con enlace externo ("Ver en …" arriba y el recuadro "Ir a la nota original").
- Guardar, compartir, tamaño de letra ajustable y barra de progreso de lectura.

El enlace de una nota se puede compartir o recargar: la vista la pide directamente a la API del medio.

## Funcionalidades generales

- Barra de navegación fija con enlaces a cada sección.
- Búsqueda entre las noticias cargadas (botón 🔍, tecla `/` o `Ctrl+K`).
- Notas guardadas para leer después (se guardan en el navegador).
- Aviso de "noticias nuevas": revisa cada 5 minutos sin recargar la página.
- Modo claro/oscuro, horas relativas que se actualizan solas, botón para volver arriba.
- Animaciones de entrada al hacer scroll; respetan la opción "reducir movimiento" del sistema.

## Ejecutar

El JavaScript usa módulos ES, así que hay que servir el proyecto por HTTP (no se puede abrir `index.html` con doble clic):

- VS Code: extensión **Live Server** → "Open with Live Server" (puerto 5501, ver `.vscode/settings.json`).
- O desde la terminal: `npx serve .` / `python -m http.server`.

## Agregar otro medio

Si el medio usa WordPress y permite CORS en `/wp-json/wp/v2/posts`, basta con agregarlo en
`src/js/config/sources.js`:

```js
{ id: "mimedio", name: "Mi Medio", type: "wordpress", baseUrl: "https://mimedio.cr" }
```

Si sus categorías tienen otros nombres, sumarlos al `match` de la sección que corresponda en
`src/js/config/sections.js`. Para una API con otro formato, crear un adaptador en `src/js/services/` con las
funciones `list` y `article` (ver `wordpress.js`) y registrarlo en `adapters` dentro de `services/news.js`.

## Estructura

```
├── index.html                  # Esqueleto: encabezado, barra, vista portada, vista nota, pie y diálogos
├── assets/img/                 # Favicon y fondo del modo oscuro
└── src/
    ├── js/
    │   ├── main.js             # Entrada: inicia módulos, cambia de vista según la ruta, acciones globales
    │   ├── router.js           # Rutas por hash y enlaces internos a cada nota
    │   ├── config/
    │   │   ├── settings.js     # Constantes generales (límites, tiempos, clima, tipo de cambio)
    │   │   ├── sources.js      # Medios de noticias
    │   │   └── sections.js     # Secciones y cómo se mapean las categorías de cada medio
    │   ├── lib/                # Utilidades puras, sin DOM de la app
    │   │   ├── html.js         # Escape de HTML, entidades, URLs seguras
    │   │   ├── sanitize.js     # Limpieza del HTML de los artículos
    │   │   ├── format.js       # Fechas, horas relativas, tiempo de lectura
    │   │   └── text.js         # Normalizar texto, debounce, contar palabras
    │   ├── services/           # Acceso a APIs
    │   │   ├── http.js         # fetch de JSON con tiempo límite
    │   │   ├── news.js         # Junta los medios, caché, manejo de fallos, nota completa
    │   │   ├── wordpress.js    # Adaptador WordPress (lista y nota)
    │   │   ├── classify.js     # Asigna sección y etiqueta a cada nota
    │   │   └── indicators.js   # Clima y tipo de cambio
    │   ├── store/
    │   │   ├── saved.js        # Notas guardadas (localStorage)
    │   │   └── stories.js      # Registro en memoria de notas mostradas
    │   ├── components/         # Piezas de interfaz compartidas
    │   │   ├── story.js        # Plantillas de nota (tarjeta, lista, destacada, compacta…)
    │   │   ├── states.js       # Placeholders de carga, errores, listas vacías
    │   │   ├── toast.js        # Notificaciones breves
    │   │   └── effects.js      # Animación al hacer scroll, barra fija, horas relativas
    │   ├── features/           # Funciones transversales
    │   │   ├── theme.js        # Modo claro/oscuro
    │   │   ├── search.js       # Diálogo de búsqueda
    │   │   └── saved-panel.js  # Panel lateral de guardados
    │   └── views/
    │       ├── home/           # Portada
    │       │   ├── home.js     # Carga, filtro por medio, pintado, "Cargar más", noticias nuevas
    │       │   ├── layout.js   # Reparte las notas en las zonas de la portada
    │       │   ├── templates.js# Plantillas propias (secciones, opinión, por medio, cinta)
    │       │   └── indicators.js
    │       └── article/        # Vista de una nota
    │           ├── article.js  # Carga, relacionadas, tamaño de letra, progreso de lectura
    │           └── templates.js
    └── styles/
        ├── main.css            # Importa el resto en orden
        ├── base/               # tokens.css (variables y temas), reset.css, animations.css
        ├── layout/             # header.css (barra superior, cabecera, navegación), page.css (contenedor, secciones, pie)
        ├── components/         # buttons.css, story.css, feedback.css, overlays.css
        └── views/              # home.css, article.css
```
