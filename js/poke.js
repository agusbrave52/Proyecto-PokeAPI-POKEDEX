const CACHE_VERSION = "v1.5";
const PAGE_SIZE = 20;

const contenedor = document.querySelector(".contenedor");
const paginationEl = document.getElementById("pagination");
const darkModeToggle = document.getElementById("darkModeToggle");
let allPokemons = [];
let currentPage = 1;
const typeTranslations = {};


document.querySelectorAll('#typeFilter option').forEach(opt => {
    if (opt.value !== 'all') typeTranslations[opt.value] = opt.textContent;
});

function renderPokemones(pokemones) {
    const totalPages = Math.ceil(pokemones.length / PAGE_SIZE);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const slice = pokemones.slice(start, start + PAGE_SIZE);

    contenedor.innerHTML = slice.map(pokemon => `
        <div class="pokemon-card" data-id="${pokemon.id}">
            <h2>${pokemon.name.toUpperCase()}</h2>
            <p>ID: ${pokemon.id}</p>
            <img src="${pokemon.sprite}" alt="${pokemon.name}">
        </div>
    `).join('');

    renderPagination(totalPages, pokemones);
}

function renderPagination(totalPages, pokemones) {
    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }

    let pages = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);
        pages = [1];
        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
    }

    const btnPrev = `<button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">&lt;</button>`;
    const btnNext = `<button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">&gt;</button>`;
    const pageButtons = pages.map(p =>
        p === '...'
            ? `<span>...</span>`
            : `<button class="${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`
    ).join('');

    paginationEl.innerHTML = btnPrev + pageButtons + btnNext;

    paginationEl.querySelectorAll('button:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            renderPokemones(pokemones);
            /* window.scrollTo({ top: 0, behavior: 'smooth' }); */
        });
    });
}

async function fetchPokemones() {
    const cachedVersion = localStorage.getItem("pokemones_version");
    if (cachedVersion !== CACHE_VERSION) {
        localStorage.removeItem("pokemones");
        localStorage.removeItem("pokemones_version");
    }

    const cached = localStorage.getItem("pokemones");
    if (cached) {
        allPokemons = JSON.parse(cached);
        renderPokemones(allPokemons);
        return;
    }

    // 1. Traer la lista completa de especies (solo name + url)
    let allSpecies = [];
    let nextUrl = 'https://pokeapi.co/api/v2/pokemon-species?limit=100';
    while (nextUrl) {
        const res = await fetch(nextUrl);
        const data = await res.json();
        allSpecies = allSpecies.concat(data.results);
        nextUrl = data.next;
    }

    // 2. Traer el detalle de cada pokemon en lotes de 20
    const BATCH_SIZE = 20;
    for (let i = 0; i < allSpecies.length; i += BATCH_SIZE) {
        const lote = allSpecies.slice(i, i + BATCH_SIZE);
        const detalle = await Promise.all(
            lote.map(p => fetch(`https://pokeapi.co/api/v2/pokemon/${p.url.split('/')[6]}`).then(r => r.json()))
        );

        // 3. Armar el formato custom
        const formateado = detalle.map(p => ({
            id: p.id,
            name: p.name,
            weight: parseFloat((p.weight / 10).toFixed(1)),
            height: parseFloat((p.height / 10).toFixed(1)),
            types: p.types.map(t => t.type.name),                              // inglés → para filtrar
            typesEs: p.types.map(t => typeTranslations[t.type.name] || t.type.name), // español → para mostrar
            sprite: p.sprites.front_default,
            gif: p.sprites.other?.showdown?.front_default || null,
            cry: p.cries.latest || null,
        }));

        allPokemons = allPokemons.concat(formateado);
        renderPokemones(allPokemons); // actualiza la UI a medida que llegan lotes
    }

    localStorage.setItem("pokemones", JSON.stringify(allPokemons));
    localStorage.setItem("pokemones_version", CACHE_VERSION);
}
fetchPokemones();


contenedor.addEventListener("click", (event) => {
    const card = event.target.closest(".pokemon-card");
    if (!card) return;

    const id = parseInt(card.getAttribute("data-id"));
    const pokemon = allPokemons.find(p => p.id === id); // sin fetch, todo ya está en memoria
    const audio = new Audio(pokemon.cry);

    Swal.fire({
        title: pokemon.name.toUpperCase(),
        text: `Peso: ${pokemon.weight}kg  Altura: ${pokemon.height}m  Tipo: ${pokemon.typesEs.join(', ')}`,
        imageUrl: pokemon.gif || pokemon.sprite,
        imageHeight: 250,
        imageAlt: `Imagen de ${pokemon.name}`,
    });
    audio.volume = 0.1;
    audio.play();
});


darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode-body");
    if (document.body.classList.contains("dark-mode-body")) {
        darkModeToggle.textContent = "Light Mode";
        darkModeToggle.style.backgroundColor = "#fff";
        darkModeToggle.style.color = "#333";
    } else {
        darkModeToggle.textContent = "Dark Mode";
        darkModeToggle.style.backgroundColor = "#333";
        darkModeToggle.style.color = "#fff";
    }
});


function filteredPokemones() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const typeFilter = document.getElementById("typeFilter").value;

    const filtered = allPokemons.filter(pokemon => {
        const matchSearch = pokemon.name.includes(searchTerm);
        const matchType = typeFilter === "all" || pokemon.types.includes(typeFilter);
        return matchSearch && matchType;
    });

    currentPage = 1;
    renderPokemones(filtered);
}

document.getElementById("searchInput").addEventListener("input", filteredPokemones);
document.getElementById("typeFilter").addEventListener("change", filteredPokemones);
