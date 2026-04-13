const CACHE_VERSION = "v1.2";

const contenedor = document.querySelector(".contenedor");
const darkModeToggle = document.getElementById("darkModeToggle");
let allPokemons = [];

function renderPokemones(pokemones) {
    contenedor.innerHTML = pokemones.map(pokemon => `
        <div class="pokemon-card" data-id="${pokemon.id}">
            <h2>${pokemon.name.toUpperCase()}</h2>
            <p>ID: ${pokemon.id}</p>
            <img src="${pokemon.sprite}" alt="${pokemon.name}">
        </div>
    `).join('');
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
            types: p.types.map(t => t.type.name),
            sprite: p.sprites.front_default,
            gif: p.sprites.other?.showdown?.front_default || null,
            cry: p.id === 25 ? p.cries.legacy : p.cries.latest || null, // Pikachu tiene un cry especial
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
        text: `Peso: ${pokemon.weight}kg  Altura: ${pokemon.height}m  Tipo: ${pokemon.types.join(', ')}`,
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

    renderPokemones(filtered);
}

document.getElementById("searchInput").addEventListener("input", filteredPokemones);
document.getElementById("typeFilter").addEventListener("change", filteredPokemones);
