const CACHE_VERSION = "v2.8";
const PAGE_SIZE = 20;

const TYPE_COLORS = {
    normal: '#9da09e', fire: '#ff6b3d', water: '#5185f0', electric: '#f5c518',
    grass: '#5fae42', ice: '#74cec8', fighting: '#c13428', poison: '#9f40a0',
    ground: '#d4a830', flying: '#8b78e6', psychic: '#f5457b', bug: '#82a615',
    rock: '#a69028', ghost: '#6358aa', dragon: '#5a35f0', dark: '#5a4a44',
    steel: '#9898bb', fairy: '#e8749a',
};

const contenedor = document.querySelector(".contenedor");
const paginationEl = document.getElementById("pagination");
const darkModeToggle = document.getElementById("darkModeToggle");
let allPokemons = [];
let currentPage = 1;
let selectedFeatures = [];
const typeTranslations = {};

document.querySelectorAll('#typeFilter option').forEach(function(opt) {
    if (opt.value !== 'all') typeTranslations[opt.value] = opt.textContent;
});

function stripAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/* ── Features dropdown ────────────────────────────────── */

function setupFeaturesDropdown() {
    var list = document.getElementById('featureList');
    var toggle = document.getElementById('featureToggle');
    var dropdown = document.getElementById('featureDropdown');
    var searchInput = dropdown.querySelector('.multiselect-search');
    var clearBtn = document.getElementById('featureClear');

    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) searchInput.focus();
    });

    document.addEventListener('click', function() { dropdown.classList.add('hidden'); });
    dropdown.addEventListener('click', function(e) { e.stopPropagation(); });

    searchInput.addEventListener('input', function() {
        var term = stripAccents(searchInput.value).replace(/ /g, '_');
        list.querySelectorAll('.multiselect-item').forEach(function(item) {
            item.style.display = stripAccents(item.querySelector('input').value).includes(term) ? '' : 'none';
        });
    });

    list.addEventListener('change', function() {
        selectedFeatures = Array.from(list.querySelectorAll('input:checked')).map(function(i) { return i.value; });
        toggle.textContent = selectedFeatures.length === 0
            ? 'Todas'
            : selectedFeatures.length + ' seleccionada' + (selectedFeatures.length > 1 ? 's' : '');
        currentPage = 1;
        filteredPokemones();
    });

    clearBtn.addEventListener('click', function() {
        list.querySelectorAll('input:checked').forEach(function(i) { i.checked = false; });
        selectedFeatures = [];
        toggle.textContent = 'Todas';
        currentPage = 1;
        filteredPokemones();
    });
}

function populateFeaturesDropdown() {
    var featureSet = {};
    allPokemons.forEach(function(p) {
        p.features.forEach(function(f) {
            if (f && f.trim()) featureSet[f.trim()] = true;
        });
    });
    var features = Object.keys(featureSet).sort();
    var list = document.getElementById('featureList');
    list.innerHTML = features.map(function(f) {
        return '<label class="multiselect-item"><input type="checkbox" value="' + f + '"> ' + f.replace(/_/g, ' ') + '</label>';
    }).join('');
}

setupFeaturesDropdown();

/* ── Render ───────────────────────────────────────────── */

function renderPokemones(pokemones) {
    var totalPages = Math.ceil(pokemones.length / PAGE_SIZE);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

    var start = (currentPage - 1) * PAGE_SIZE;
    var slice = pokemones.slice(start, start + PAGE_SIZE);

    var resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = pokemones.length + ' Pokemon encontrados';
    }

    if (slice.length === 0) {
        contenedor.innerHTML = '<p class="empty-state">No se encontraron Pokemon con estos filtros.</p>';
        paginationEl.innerHTML = '';
        return;
    }

    contenedor.innerHTML = slice.map(function(pokemon) {
        var typeColor = TYPE_COLORS[pokemon.types[0]] || '#9da09e';
        var typeBadges = pokemon.types.map(function(t) {
            return '<span class="type-badge type-' + t + '">' + (typeTranslations[t] || t) + '</span>';
        }).join('');
        var star = pokemon.legendary ? '<span class="legendary-star">&#9733;</span>' : '';
        var legendaryClass = pokemon.legendary ? 'legendary' : '';
        var idStr = '#' + String(pokemon.id).padStart(3, '0');
        var genus = pokemon.genus || '';
        return '<div class="pokemon-card ' + legendaryClass + '" data-id="' + pokemon.id + '" style="--type-color:' + typeColor + '">' +
            '<div class="card-inner">' +
                '<div class="card-header">' +
                    '<span class="pokemon-name">' + pokemon.name.toUpperCase() + '</span>' +
                    star +
                    '<div class="card-types">' + typeBadges + '</div>' +
                '</div>' +
                '<div class="card-image-wrap">' +
                    '<img src="' + pokemon.sprite + '" alt="' + pokemon.name + '" loading="lazy">' +
                '</div>' +
                '<div class="card-footer">' +
                    '<span class="pokemon-id">' + idStr + '</span>' +
                    '<span class="pokemon-genus">' + genus + '</span>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');

    renderPagination(totalPages, pokemones);
}

function renderPagination(totalPages, pokemones) {
    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }

    var pages = [];
    if (totalPages <= 5) {
        for (var i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        var s = Math.max(2, currentPage - 1);
        var e = Math.min(totalPages - 1, currentPage + 1);
        pages = [1];
        if (s > 2) pages.push('...');
        for (var j = s; j <= e; j++) pages.push(j);
        if (e < totalPages - 1) pages.push('...');
        pages.push(totalPages);
    }

    var btnPrev = '<button ' + (currentPage === 1 ? 'disabled' : '') + ' data-page="' + (currentPage - 1) + '">&lt;</button>';
    var btnNext = '<button ' + (currentPage === totalPages ? 'disabled' : '') + ' data-page="' + (currentPage + 1) + '">&gt;</button>';
    var pageButtons = pages.map(function(p) {
        if (p === '...') return '<span>...</span>';
        return '<button class="' + (p === currentPage ? 'active' : '') + '" data-page="' + p + '">' + p + '</button>';
    }).join('');

    paginationEl.innerHTML = btnPrev + pageButtons + btnNext;

    paginationEl.querySelectorAll('button:not(:disabled)').forEach(function(btn) {
        btn.addEventListener('click', function() {
            currentPage = parseInt(btn.dataset.page);
            renderPokemones(pokemones);
        });
    });
}

/* ── Filters ──────────────────────────────────────────── */

function renderFilters() {
    var allAesthetics = allPokemons.map(function(p) { return p.aesthetic; })
        .filter(function(a, i, arr) { return a && a !== 'unknown' && arr.indexOf(a) === i; });
    var allGenerations = allPokemons.map(function(p) { return p.generation; })
        .filter(function(g, i, arr) { return g !== null && g !== undefined && arr.indexOf(g) === i; })
        .sort(function(a, b) { return a - b; });
    var allShapes = allPokemons.map(function(p) { return p.shape; })
        .filter(function(s, i, arr) { return s && arr.indexOf(s) === i; });

    var aestheticFilter = document.getElementById('aestheticFilter');
    allAesthetics.forEach(function(a) {
        var option = document.createElement('option');
        option.value = a;
        option.textContent = a.charAt(0).toUpperCase() + a.slice(1);
        aestheticFilter.appendChild(option);
    });

    var generationFilter = document.getElementById('generationFilter');
    allGenerations.forEach(function(g) {
        var option = document.createElement('option');
        option.value = g;
        option.textContent = 'Generacion ' + g;
        generationFilter.appendChild(option);
    });

    var shapeFilter = document.getElementById('shapeFilter');
    allShapes.forEach(function(s) {
        var option = document.createElement('option');
        option.value = s;
        option.textContent = s.charAt(0).toUpperCase() + s.slice(1);
        shapeFilter.appendChild(option);
    });
}

/* ── Data loading ─────────────────────────────────────── */

async function fetchPokemones() {
    var cachedVersion = localStorage.getItem("pokemones_version");
    if (cachedVersion !== CACHE_VERSION) {
        localStorage.removeItem("pokemones");
        localStorage.removeItem("pokemones_version");
    }

    var cached = localStorage.getItem("pokemones");
    if (cached) {
        try {
            allPokemons = JSON.parse(cached);
            renderFilters();
            populateFeaturesDropdown();
            renderPokemones(allPokemons);
            return;
        } catch (e) {
            localStorage.removeItem("pokemones");
            localStorage.removeItem("pokemones_version");
        }
    }

    try {
        var data = await fetch('./data/pokemon_1-1025.json').then(function(res) { return res.json(); });

        allPokemons = data.map(function(p) {
            var official = p.official || {};
            return {
                id: p.id,
                name: p.name,
                weight: p.weight_kg,
                height: p.height_m,
                types: p.types || [],
                typesEs: (p.types || []).map(function(t) { return typeTranslations[t] || t; }),
                sprite: p.sprites ? p.sprites.front : '',
                gif: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/' + p.id + '.gif',
                cry: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/' + p.id + '.ogg',
                features: p.ai_analysis && p.ai_analysis.features ? p.ai_analysis.features.split(',').map(function(f) { return f.trim(); }) : [],
                aesthetic: (p.ai_analysis && p.ai_analysis.aesthetic) || 'unknown',
                shiny: p.sprites ? p.sprites.shiny || null : null,
                generation: p.generation || null,
                shape: official.shape_es || null,
                genus: official.genus_es || null,
                legendary: official.legendary === 'Si' || official.legendary === 'Sí',
                evolutionFrom: p.evolves_from || null,
                evolutionStage: p.evolution_stage || null,
            };
        });

        renderFilters();
        populateFeaturesDropdown();
        localStorage.setItem("pokemones", JSON.stringify(allPokemons));
        localStorage.setItem("pokemones_version", CACHE_VERSION);
        renderPokemones(allPokemons);
    } catch (err) {
        contenedor.innerHTML = '<p class="empty-state">Error cargando datos: ' + err.message + '</p>';
    }
}

fetchPokemones();

/* ── Card click → modal ───────────────────────────────── */

function checkImage(url) {
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() { resolve(true); };
        img.onerror = function() { resolve(false); };
        img.src = url;
    });
}

contenedor.addEventListener("click", async function(event) {
    var card = event.target.closest(".pokemon-card");
    if (!card) return;

    var id = parseInt(card.getAttribute("data-id"));
    var pokemon = allPokemons.find(function(p) { return p.id === id; });
    if (!pokemon) return;

    var audio = new Audio(pokemon.cry);
    var gifExists = await checkImage(pokemon.gif);
    var imageUrl = gifExists ? pokemon.gif : pokemon.sprite;

    function cap(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

    Swal.fire({
        title: '#' + pokemon.id + ' - ' + cap(pokemon.name),
        html:
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;text-align:left;font-size:1.1rem;margin-bottom:10px;">' +
                '<div><span style="color:#39ff14;font-size:0.78rem;display:block;letter-spacing:1px">TIPO</span>' + pokemon.typesEs.join(', ') + '</div>' +
                '<div><span style="color:#39ff14;font-size:0.78rem;display:block;letter-spacing:1px">GENERACION</span>' + (pokemon.generation != null ? pokemon.generation : '-') + '</div>' +
                '<div><span style="color:#39ff14;font-size:0.78rem;display:block;letter-spacing:1px">PESO</span>' + pokemon.weight + ' kg</div>' +
                '<div><span style="color:#39ff14;font-size:0.78rem;display:block;letter-spacing:1px">ALTURA</span>' + pokemon.height + ' m</div>' +
                '<div><span style="color:#39ff14;font-size:0.78rem;display:block;letter-spacing:1px">FORMA</span>' + (pokemon.shape ? cap(pokemon.shape) : '-') + '</div>' +
                '<div><span style="color:#39ff14;font-size:0.78rem;display:block;letter-spacing:1px">ESTETICA</span>' + (pokemon.aesthetic ? cap(pokemon.aesthetic) : '-') + '</div>' +
                '<div><span style="color:#39ff14;font-size:0.78rem;display:block;letter-spacing:1px">ETAPA EVOL.</span>' + (pokemon.evolutionStage ? 'Etapa ' + pokemon.evolutionStage : '-') + '</div>' +
                '<div><span style="color:#39ff14;font-size:0.78rem;display:block;letter-spacing:1px">EVOLUCIONA DE</span>' + (pokemon.evolutionFrom ? cap(pokemon.evolutionFrom) : 'Base') + '</div>' +
            '</div>' +
            '<div style="text-align:left;font-size:1.1rem;margin-bottom:6px;">' +
                '<span style="color:#39ff14;font-size:0.78rem;display:block;letter-spacing:1px">GENERO</span>' + (pokemon.genus || '-') +
            '</div>' +
            '<div style="text-align:left;font-size:0.82rem;border-top:1px solid #1a7a1a;padding-top:8px;margin-top:4px;line-height:1.7">' +
                '<span style="color:#39ff14;font-size:0.78rem;display:block;margin-bottom:4px;letter-spacing:1px">CARACTERISTICAS</span>' +
                pokemon.features.map(function(f) {
                    return '<span style="display:inline-block;border:1px solid #1a7a1a;padding:1px 7px;margin:2px;color:#22b80e">' + f.replace(/_/g, ' ') + '</span>';
                }).join('') +
            '</div>',
        imageUrl: imageUrl,
        imageHeight: 200,
        imageAlt: 'Imagen de ' + pokemon.name,
    });

    audio.volume = 0.1;
    audio.play();
});

/* ── Dark/Amber toggle ────────────────────────────────── */

darkModeToggle.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode-body");
    darkModeToggle.innerHTML = document.body.classList.contains("dark-mode-body")
        ? '<span>[GREEN]</span>'
        : '<span>[AMBER]</span>';
});

/* ── Filter logic ─────────────────────────────────────── */

function filteredPokemones() {
    var searchTerm = document.getElementById("searchInput").value.toLowerCase();
    var typeFilter = document.getElementById("typeFilter").value;
    var aestheticFilter = document.getElementById("aestheticFilter").value;
    var generationFilter = document.getElementById("generationFilter").value;
    var shapeFilter = document.getElementById("shapeFilter").value;
    var evolutionStageFilter = document.getElementById("evolutionStageFilter").value;
    var legendaryFilter = document.getElementById("legendaryFilter").checked;

    var filtered = allPokemons.filter(function(pokemon) {
        var matchSearch = pokemon.name.includes(searchTerm);
        var matchType = typeFilter === "all" || pokemon.types.includes(typeFilter);
        var matchAesthetic = aestheticFilter === "all" || pokemon.aesthetic === aestheticFilter;
        var matchGeneration = generationFilter === "all" || String(pokemon.generation) === generationFilter;
        var matchShape = shapeFilter === "all" || pokemon.shape === shapeFilter;
        var matchFeatures = selectedFeatures.length === 0 ||
            selectedFeatures.some(function(f) { return pokemon.features.includes(f); });
        var matchEvolutionStage = evolutionStageFilter === "all" || pokemon.evolutionStage === parseInt(evolutionStageFilter);
        var matchLegendary = !legendaryFilter || pokemon.legendary;
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
