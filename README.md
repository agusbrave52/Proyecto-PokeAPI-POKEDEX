# 📖 Pokédex — PokeAPI Project

Mini proyecto personal de una **Pokédex interactiva** construida con JavaScript Vanilla consumiendo datos locales de la [PokéAPI](https://pokeapi.co/), con más de 1025 Pokémon.

---

## 📋 Descripción

Aplicación web que muestra información detallada de los Pokémon: imágenes, tipos, estadísticas, sonidos y más. Todo el contenido del DOM es generado dinámicamente desde JavaScript, sin frameworks. Los datos de los Pokémon se almacenan en un JSON local (generado a partir de la PokéAPI) y se cachean en `localStorage` para carga instantánea. Incluye análisis de características generado por IA.

---

## ✨ Funcionalidades

### 🃏 Listado y navegación
- Visualización de más de **1025 Pokémon** con tarjetas dinámicas
- **Color de tarjeta** según el tipo principal del Pokémon
- **Badge de legendario** en las tarjetas correspondientes
- **Paginación** de 20 Pokémon por página con navegación dinámica
- **Contador de resultados** actualizado en tiempo real

### 🔍 Búsqueda y filtros
- **Búsqueda por nombre** en tiempo real
- **Filtro por tipo** (18 tipos con nombres en español)
- **Filtro por generación** (Generación 1 a 9)
- **Filtro por forma** (bípedo, cuadrúpedo, serpiente, etc.)
- **Filtro por etapa evolutiva** (etapa 1, 2 o 3)
- **Filtro solo legendarios** (checkbox)
- **Filtro por estética** (categorías generadas por IA: cute, fierce, elegant, etc.)
- **Filtro por características físicas** (multiselect con buscador, etiquetas generadas por IA)
- **Filtro por peso** con slider de rango doble (mínimo y máximo en kg)
- **Filtro por altura** con slider de rango doble (mínimo y máximo en m)

### 📋 Vista de detalle
Al hacer clic en una tarjeta se abre un modal con:
- **Carrusel de sprites**: GIF animado normal, GIF animado shiny, sprite estático normal, sprite estático shiny
- Datos completos: tipo, generación, peso, altura, forma, estética, etapa evolutiva, Pokémon del que evoluciona y género
- **Características físicas** generadas por IA
- **Sonido del Pokémon** (cry) al abrir el detalle

### 🌙 Experiencia de usuario
- **Modo oscuro / claro** con toggle en la barra superior
- **Caché con versionado** en `localStorage` para carga instantánea tras la primera visita
- **Diseño responsive** adaptado a mobile y escritorio

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura base |
| CSS3 | Estilos visuales, responsive y modo oscuro |
| JavaScript (Vanilla) | Lógica, filtros, paginación y renderizado del DOM |
| JSON local | Dataset de 1025 Pokémon generado desde la PokéAPI |
| [PokéAPI](https://pokeapi.co/) | Fuente de datos original |
| [SweetAlert2](https://sweetalert2.github.io/) v11 | Modal de detalle del Pokémon |
| IA (análisis) | Generación de características físicas y estética de cada Pokémon |

---

## 📁 Estructura del proyecto

```
Proyecto-PokeAPI-POKEDEX/
├── index.html
├── style.css
├── js/
│   └── poke.js
└── data/
    ├── pokemon_1-1025.json     # Dataset completo de Pokémon
    └── pokemon_features.json   # Características físicas generadas por IA
```

---

## 🚀 Cómo usar

1. Cloná el repositorio:
   ```bash
   git clone https://github.com/agusbrave52/Proyecto-PokeAPI-POKEDEX.git
   ```
2. Abrí `index.html` directamente en el navegador.

> No requiere instalación de dependencias, servidor local ni Node.js. Funciona abriendo el archivo HTML.

---

## 🔮 Mejoras planeadas

- [ ] Soporte para formas alternativas y mega evoluciones
- [ ] Guardado de favoritos con `localStorage`
- [ ] Vista de cadena evolutiva completa

---

## 📌 Estado del proyecto

🟢 **Activo** — en constante mejora.

---

## 👤 Autor

**Agustín Bravo**
- GitHub: [@agusbrave52](https://github.com/agusbrave52)

---

## 📄 Recursos

- [PokéAPI Docs](https://pokeapi.co/docs/v2)
- [SweetAlert2 Docs](https://sweetalert2.github.io/)
