# 📖 Pokédex — PokeAPI Project
 
Mini proyecto personal de una **Pokédex interactiva** construida con JavaScript Vanilla consumiendo la [PokéAPI](https://pokeapi.co/).
 
> 🔧 **Proyecto a mejorar** — funcional en su estado actual, con bastante margen para seguir creciendo.
 
---
 
## 📋 Descripción
 
Aplicación web que consume la PokéAPI para mostrar información de los Pokémon: imágenes, tipos, estadísticas y más. Todo el contenido del DOM es generado dinámicamente desde JavaScript, sin frameworks. Utiliza SweetAlert2 para los modales y notificaciones al usuario.
 
---
 
## ✨ Funcionalidades actuales
 
- ⚡ Consumo de la **PokéAPI** con `fetch` y `async/await`
- 🃏 Renderizado dinámico de tarjetas de Pokémon generadas desde JS
- 🎨 Estilos visuales diferenciados según el tipo de Pokémon
- 🔔 Alertas y modales con **SweetAlert2**
- 📱 Diseño responsive
 
---
 
## 🛠️ Tecnologías utilizadas
 
| Tecnología | Uso |
|---|---|
| HTML5 | Estructura base mínima |
| CSS3 | Estilos visuales y responsive |
| JavaScript (Vanilla) | Lógica, fetch a la API y renderizado del DOM |
| [PokéAPI](https://pokeapi.co/) | Fuente de datos de los Pokémon (REST, sin auth) |
| [SweetAlert2](https://sweetalert2.github.io/) v11 | Popups y alertas visuales (CDN) |
 
---
 
## 🌐 Sobre la PokéAPI
 
Este proyecto usa la [PokéAPI](https://pokeapi.co/), una API REST pública y gratuita con datos de todos los Pokémon de la franquicia.
 
Endpoints principales utilizados:
 
```
GET https://pokeapi.co/api/v2/pokemon/{id o nombre}
GET https://pokeapi.co/api/v2/pokemon?limit={n}&offset={n}
```
 
No requiere API key ni autenticación de ningún tipo.
 
---
 
## 📁 Estructura del proyecto
 
```
Proyecto-PokeAPI-POKEDEX/
├── index.html
├── style.css
└── js/
    └── poke.js
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
 
- [ ] Buscador por nombre o número de Pokémon
- [ ] Filtros por tipo (fuego, agua, planta, etc.)
- [ ] Vista de detalle individual con estadísticas completas (HP, ATK, DEF, etc.)
- [ ] Animaciones en las tarjetas al hover
- [ ] Soporte para formas alternativas y mega evoluciones
- [ ] Modo oscuro / claro
- [ ] Guardado de favoritos con `localStorage`
 
---
 
## 📌 Estado del proyecto
 
🔵 **Funcional, en proceso de mejora** — mini proyecto personal con intención de crecer.
 
---
 
## 👤 Autor
 
**Agustín Brave**
- GitHub: [@agusbrave52](https://github.com/agusbrave52)
 
---
 
## 📄 Recursos
 
- [PokéAPI Docs](https://pokeapi.co/docs/v2)
- [SweetAlert2 Docs](https://sweetalert2.github.io/)