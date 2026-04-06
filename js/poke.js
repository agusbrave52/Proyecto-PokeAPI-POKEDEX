let url = 'https://pokeapi.co/api/v2/pokemon-species?limit=100';
const contenedor = document.querySelector(".contenedor");

async function TraerPokemones() {
    let all = [];
    if (localStorage.getItem("pokemones")) {
        contenedor.innerHTML = JSON.parse(localStorage.getItem("pokemones"));
        return;
    }

    while (url) {
        const res = await fetch(url);
        const data = await res.json();
        contenedor.innerHTML += data.results.map(pokemon => `<div class="pokemon-card" data-id="${pokemon.url.split('/')[6]}">
        <h2>${pokemon.name.toUpperCase()}</h2>
        <p>ID: ${pokemon.url.split('/')[6]}</p>
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split('/')[6]}.png" alt="${pokemon.name}">
        </div>`).join('');
        all = all.concat(data.results);
        url = data.next;
    }
    console.log(all);
    const guardarContenedor = document.querySelector(".contenedor");
    localStorage.setItem("pokemones", JSON.stringify(guardarContenedor.innerHTML)); 
}
TraerPokemones();

const listaPokemones = document.querySelectorAll(".pokemon-card");
listaPokemones.forEach(pokemon => {
    pokemon.addEventListener("click", async () => {
        const id = pokemon.getAttribute("data-id");
        let pokemonSelect = await TraerInfoDePokemonSeleccionado(id);
        console.log(pokemonSelect);
        const pesoKg = (pokemonSelect.weight / 10).toFixed(1);
        const alturaM = (pokemonSelect.height / 10).toFixed(1);
        let imagenUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id + ".png";
        if(pokemonSelect.sprites.other["showdown"].front_default){
            imagenUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/" + id + ".gif";
        }

        Swal.fire({
            title: `${pokemon.querySelector("h2").textContent}`,
            text: `Peso: ${pesoKg}kg Altura: ${alturaM}m Tipo: ${pokemonSelect.types.map(type => type.type.name).join(', ')}`,// informacion del pokemon seleccionado, peso, altura, tipo, etc
            imageUrl: `${imagenUrl}`,
            imageWidth: 250,
            imageHeight: 250,
            imageAlt: `Imagen del Pokémon ID: ${id}`,
        });
    });
});

async function TraerInfoDePokemonSeleccionado(id){
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener la información del Pokémon:', error);
    }
}
