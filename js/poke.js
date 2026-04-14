const CACHE_VERSION = "v2.8";
const PAGE_SIZE = 20;

const contenedor = document.querySelector(".contenedor");
const paginationEl = document.getElementById("pagination");
const darkModeToggle = document.getElementById("darkModeToggle");
let allPokemons = [];
let currentPage = 1;
let selectedFeatures = [];
const typeTranslations = {};
let allShapes = [];
let allGenerations = [];
let allAesthetics = [];


document.querySelectorAll('#typeFilter option').forEach(opt => {
    if (opt.value !== 'all') typeTranslations[opt.value] = opt.textContent;
});

function renderPokemones(pokemones) {
    const totalPages = Math.ceil(pokemones.length / PAGE_SIZE);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const slice = pokemones.slice(start, start + PAGE_SIZE);

    contenedor.innerHTML = slice.map(pokemon => `
        <div class="pokemon-card ${pokemon.legendary ? 'legendary' : ''}" data-id="${pokemon.id}">
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
        renderFilters(allPokemons);
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
        aesthetic: p.ai_analysis?.aesthetic || 'unknown',
        shiny: p.sprites.shiny || null,
        generation: p.generation || null,
        shape: p.official.shape_es || null,
        genus: p.official.genus_es || null,
        legendary: p.official.legendary === 'Sí' ? true : false,
        evolutionFrom: p.evolves_from || null,
        evolutionStage: p.evolution_stage || null,
    }));
    renderFilters(allPokemons);
    

    localStorage.setItem("pokemones", JSON.stringify(allPokemons));
    localStorage.setItem("pokemones_version", CACHE_VERSION);
    renderPokemones(allPokemons);
}
fetchPokemones();


function checkImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

function renderFilters(){
    allAesthetics = [...new Set(allPokemons.map(p => p.aesthetic))].filter(a => a !== 'unknown');
    allGenerations = [...new Set(allPokemons.map(p => p.generation))].filter(g => g !== null);
    allShapes = [...new Set(allPokemons.map(p => p.shape))].filter(s => s !== null);
    allGenerations = [...new Set(allPokemons.map(p => p.generation))].filter(g => g !== null);

    const aestheticFilter = document.getElementById('aestheticFilter');
    allAesthetics.forEach(a => {
        const option = document.createElement('option');
        option.value = a;
        option.textContent = a.charAt(0).toUpperCase() + a.slice(1);
        aestheticFilter.appendChild(option);
        
    });

    const generationFilter = document.getElementById('generationFilter');
    allGenerations.forEach(g => {
        const option = document.createElement('option');
        option.value = g;
        option.textContent = `Generación ${g}`;
        generationFilter.appendChild(option);
    });

    const shapeFilter = document.getElementById('shapeFilter');
    allShapes.forEach(s => {
        const option = document.createElement('option');
        option.value = s;
        option.textContent = s.charAt(0).toUpperCase() + s.slice(1);
        shapeFilter.appendChild(option);
    });
}

contenedor.addEventListener("click", async (event) => {
    const card = event.target.closest(".pokemon-card");
    if (!card) return;

    const id = parseInt(card.getAttribute("data-id"));
    const pokemon = allPokemons.find(p => p.id === id); // sin fetch, todo ya está en memoria
    const audio = new Audio(pokemon.cry);

    const gifExists = await checkImage(pokemon.gif);
    const imageUrl = gifExists ? pokemon.gif : pokemon.sprite;
    

    const cap = str => str.charAt(0).toUpperCase() + str.slice(1);
    Swal.fire({
        title: `#${pokemon.id} — ${cap(pokemon.name)}`,
        html: `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px 16px; text-align:left; font-size:1.2rem; margin-bottom:10px;">
                <div><span style="color:#888; font-size:1rem; font-weight:bold; display:block">TIPO</span>${pokemon.typesEs.join(', ')}</div>
                <div><span style="color:#888; font-size:1rem; font-weight:bold; display:block">GENERACIÓN</span>${pokemon.generation ?? 'Desconocida'}</div>
                <div><span style="color:#888; font-size:1rem; font-weight:bold; display:block">PESO</span>${pokemon.weight} kg</div>
                <div><span style="color:#888; font-size:1rem; font-weight:bold; display:block">ALTURA</span>${pokemon.height} m</div>
                <div><span style="color:#888; font-size:1rem; font-weight:bold; display:block">FORMA</span>${pokemon.shape ? cap(pokemon.shape) : 'Desconocida'}</div>
                <div><span style="color:#888; font-size:1rem; font-weight:bold; display:block">ESTÉTICA</span>${pokemon.aesthetic ? cap(pokemon.aesthetic) : 'Desconocida'}</div>
                <div><span style="color:#888; font-size:1rem; font-weight:bold; display:block">ETAPA EVOLUTIVA</span>${pokemon.evolutionStage ? `Etapa ${pokemon.evolutionStage}` : 'Desconocida'}</div>
                <div><span style="color:#888; font-size:1rem; font-weight:bold; display:block">EVOLUCIONA DE</span>${pokemon.evolutionFrom ? cap(pokemon.evolutionFrom) : 'Forma base'}</div>
            </div>
            <div style="text-align:left; font-size:1.2rem; margin-bottom:6px;">
                <span style="color:#888; font-size:1rem; font-weight:bold; display:block">GÉNERO</span>${pokemon.genus || 'Desconocido'}
            </div>
            <div style="text-align:left; font-size:0.8rem; color:#666; border-top:1px solid #eee; padding-top:8px; margin-top:4px; line-height:1.6">
                <span style="color:#888; font-size:1rem; font-weight:bold; display:block; margin-bottom:2px">CARACTERÍSTICAS</span>
                ${pokemon.features.map(f => `<span style="display:inline-block; background:#f2f2f2; border-radius:4px; padding:1px 6px; margin:2px">${f.replace(/_/g, ' ')}</span>`).join('')}
            </div>
        `,
        imageUrl,
        imageHeight: 200,
        imageAlt: `Imagen de ${pokemon.name}`,
    });
    console.log(pokemon);
    
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
    const aestheticFilter = document.getElementById("aestheticFilter").value;
    const generationFilter = document.getElementById("generationFilter").value;
    const shapeFilter = document.getElementById("shapeFilter").value;
    const evolutionStageFilter = document.getElementById("evolutionStageFilter").value;
    const legendaryFilter = document.getElementById("legendaryFilter").checked;

    const filtered = allPokemons.filter(pokemon => {
        const matchSearch = pokemon.name.includes(searchTerm);
        const matchType = typeFilter === "all" || pokemon.types.includes(typeFilter);
        const matchAesthetic = aestheticFilter === "all" || pokemon.aesthetic === aestheticFilter;
        const matchGeneration = generationFilter === "all" || pokemon.generation === generationFilter;
        const matchShape = shapeFilter === "all" || pokemon.shape === shapeFilter;
        const matchFeatures = selectedFeatures.length === 0 ||
            selectedFeatures.some(f => pokemon.features.includes(f));
        const matchEvolutionStage = evolutionStageFilter === "all" || pokemon.evolutionStage === parseInt(evolutionStageFilter);
        const matchLegendary = !legendaryFilter || pokemon.legendary;

        return matchSearch && matchType && matchAesthetic && matchGeneration && matchShape && matchFeatures && matchEvolutionStage && matchLegendary;
    });

    currentPage = 1;
    renderPokemones(filtered);
}

document.getElementById("searchInput").addEventListener("input", filteredPokemones);
document.getElementById("typeFilter").addEventListener("change", filteredPokemones);
document.getElementById("aestheticFilter").addEventListener("change", filteredPokemones);
document.getElementById("generationFilter").addEventListener("change", filteredPokemones);
document.getElementById("shapeFilter").addEventListener("change", filteredPokemones);
document.getElementById("evolutionStageFilter").addEventListener("change", filteredPokemones);
document.getElementById("legendaryFilter").addEventListener("change", filteredPokemones);
