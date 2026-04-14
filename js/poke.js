const CACHE_VERSION = "v2.2";
const PAGE_SIZE = 20;

const contenedor = document.querySelector(".contenedor");
const paginationEl = document.getElementById("pagination");
const darkModeToggle = document.getElementById("darkModeToggle");
let allPokemons = [];
let currentPage = 1;
let selectedFeatures = [];
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

async function renderFeaturesOptions() {
    const features = await fetch('./data/pokemon_features.json').then(res => res.json());
    const list = document.getElementById('featureList');
    const toggle = document.getElementById('featureToggle');
    const dropdown = document.getElementById('featureDropdown');
    const searchInput = dropdown.querySelector('.multiselect-search');
    const clearBtn = document.getElementById('featureClear');

    list.innerHTML = features.map(f => `
        <label class="multiselect-item">
            <input type="checkbox" value="${f}"> ${f.replace(/_/g, ' ')}
        </label>
    `).join('');

    // Abrir/cerrar dropdown
    toggle.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) searchInput.focus();
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', () => dropdown.classList.add('hidden'));
    dropdown.addEventListener('click', e => e.stopPropagation());

    // Normalizar texto para búsqueda (ignorar acentos y mayúsculas)
    const normalize = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    // Buscar dentro del dropdown
    searchInput.addEventListener('input', () => {
        const term = normalize(searchInput.value).replace(/ /g, '_');
        list.querySelectorAll('.multiselect-item').forEach(item => {
            item.style.display = normalize(item.querySelector('input').value).includes(term) ? '' : 'none';
        });
    });

    // Filtrar al marcar/desmarcar
    list.addEventListener('change', () => {
        selectedFeatures = Array.from(list.querySelectorAll('input:checked')).map(i => i.value);
        toggle.textContent = selectedFeatures.length === 0
            ? 'Todas ▼'
            : `${selectedFeatures.length} seleccionada${selectedFeatures.length > 1 ? 's' : ''} ▼`;
        currentPage = 1;
        filteredPokemones();
    });

    // Limpiar selección
    clearBtn.addEventListener('click', () => {
        list.querySelectorAll('input:checked').forEach(i => i.checked = false);
        selectedFeatures = [];
        toggle.textContent = 'Todas ▼';
        currentPage = 1;
        filteredPokemones();
    });
}

renderFeaturesOptions();

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

    const data = await fetch('./data/pokemon_1-1025.json').then(res => res.json());

    allPokemons = data.map(p => ({
        id: p.id,
        name: p.name,
        weight: p.weight_kg,
        height: p.height_m,
        types: p.types,
        typesEs: p.types.map(t => typeTranslations[t] || t),
        sprite: p.sprites.front,
        gif: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${p.id}.gif`,
        cry: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${p.id}.ogg`,
        features: p.ai_analysis?.features ? p.ai_analysis.features.split(',') : [],
    }));

    localStorage.setItem("pokemones", JSON.stringify(allPokemons));
    localStorage.setItem("pokemones_version", CACHE_VERSION);
    renderPokemones(allPokemons);
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
        text: `Peso: ${pokemon.weight}kg  Altura: ${pokemon.height}m  Tipo: ${pokemon.typesEs.join(', ')}` + `\nCaracterísticas: ${pokemon.features.join(', ').replace(/_/g, ' ')}`,
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
        const matchFeatures = selectedFeatures.length === 0 ||
            selectedFeatures.some(f => pokemon.features.includes(f));
        return matchSearch && matchType && matchFeatures;
    });

    currentPage = 1;
    renderPokemones(filtered);
}

document.getElementById("searchInput").addEventListener("input", filteredPokemones);
document.getElementById("typeFilter").addEventListener("change", filteredPokemones);
