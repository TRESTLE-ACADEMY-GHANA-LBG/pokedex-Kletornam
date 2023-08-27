const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

let page = 1; //Page counter
let limit = 16; //Card Limit count

const main_api = `https://pokeapi.co/api/v2/`; //API endpoint

// fecth all data from the API
function fetchPokemon(url) {
  return new Promise((res, rej) => {
    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        res(data);
      })
      .catch((err) => {
        rej(err);
      });
  });
}
// Select one pokemon from the returned data
function fetchPokemonItem(url) {
  return new Promise((res, rej) => {
    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        res(data);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

//UI Rendering Function
var loaderDiv = document.querySelector("#loader");
var mainDiv = document.querySelector("#main-grid");
function uiRender(itemName, itemSprite, itemId) {
  const cardLink = document.createElement("div");
  cardLink.id = itemId;

  const cardItem = document.createElement("div");
  cardItem.className = "item-card";

  const cardImg = document.createElement("img");
  cardImg.src = itemSprite;
  cardItem.appendChild(cardImg);

  const cardTitle = document.createElement("h4");
  cardTitle.innerHTML = itemName;
  cardTitle.className = "item-title";
  cardItem.appendChild(cardTitle);

  cardLink.appendChild(cardItem);

  mainDiv.appendChild(cardLink);
}

var _data = [];

//fetch All Data
async function fetchPokemons(url = `${main_api}pokemon`) {
  try {
    while (url !== null) {
      const response = await fetch(url);
      const data = await response.json();

      _data.push(data.results);

      url = data.next;
    }
  } catch (err) {
    console.log(err);
  }
}

fetchPokemons();

// Fetch cards on UI
function fetchCard(url = main_api) {
  showPrev(page);
  return fetchPokemon(
    `${url}pokemon?offset=${(page - 1) * limit}&limit=${limit}`
  )
    .then((data) => {
      data.results.map((k) => {
        fetchPokemonItem(k.url)
          .then((item) => {
            uiRender(item.name, item.sprites.back_default, item.id);
          })
          .catch((err) => console.log(err));
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

//fetchSelectedData
function fetchSelected(url, id) {
  fetchPokemonItem(`${url}pokemon/${id}`)
    .then((item) => {
      const selectedPokemon = {
        species: item.species.name,
        sprite: item.sprites.back_default,
        name: item.name,
        weight: item.weight,
        moves: item.moves,
        height: item.height,
        types: item.types,
        stats: item.stats,
      };
      renderSelected(selectedPokemon);
      return selectedPokemon;
    })
    .catch((err) => console.log(err));
}

//Searching Data
const searchFld = document.querySelector("#search");
searchFld.addEventListener("keyup", (e) => {
  e.preventDefault();
  mainDiv.innerHTML = "";
  let str = e.target.value;
  if (str !== "") {
    // fetchSearch(_data, str);
    fetchSearch(_data, str).map((k) => {
      fetchPokemonItem(k.url)
        .then((i) => {
          uiRender(i.name, i.sprites.back_default, i.id);
        })
        .catch((err) => console.log(err));
    });
  } else fetchCard();
});

// Fetch cards that are searched on UI
function fetchSearch(data, searchStr) {
  nextPage.style.display = "none";
  var searchResult = data
    .flatMap((subArray) =>
      subArray.filter((item) =>
        item.name.toLowerCase().includes(searchStr.toLowerCase())
      )
    ).slice(0, 20);

  return searchResult;
}

// render selected pokemon on UI
var displayImg = document.querySelector("#pokemon-img");
var displayName = document.querySelector("#pokemon-name");
var weight = document.querySelector("#weight");
var height = document.querySelector("#height");
var species = document.querySelector("#species");
var types = document.querySelector("#types");
var moves = document.querySelector("#moves");
var stats = document.querySelector("#stats");
function renderSelected(selectedPoke) {
  displayImg.src = selectedPoke.sprite;
  displayName.innerHTML = selectedPoke.name;
  weight.innerHTML = selectedPoke.weight;
  height.innerHTML = selectedPoke.height;
  species.innerHTML = selectedPoke.species;
  moves.innerHTML = selectedPoke.moves
    .map((k) => {
      return `<li>${k.move.name}<li/>`;
    })
    .join("");
  stats.innerHTML = selectedPoke.stats
    .map((k) => {
      return `<li>${k.stat.name}<li/>`;
    })
    .join("");
  types.innerHTML = selectedPoke.types
    .map((k) => {
      return `<li>${k.type.name}<li/>`;
    })
    .join("");
}

//fetch next page
const nextPage = document.querySelector("#next");
nextPage.addEventListener("click", () => {
  mainDiv.innerHTML = "";
  loaderUI();
  page += 1;
  fetchCard();
});

//fecth previous page
const prevPage = document.querySelector("#prev");
prevPage.addEventListener("click", () => {
  mainDiv.innerHTML = "";
  loaderUI();
  page -= 1;
  fetchCard();
});

// Show previous button
function showPrev(pageNo) {
  if (pageNo !== 1) prevPage.style.display = "block";
}

//Page loader animation
function loaderUI() {
  loaderDiv.style.display = "flex";
  setTimeout(() => {
    loaderDiv.style.display = "none";
  }, 5000);
}

//select one Pokemon
const selected = document.querySelector("#main-grid");
const overlay = document.querySelector("#overlay");
selected.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.closest(".item-card")) {
    const ab = e.target.closest(".item-card");
    fetchSelected(main_api, ab.parentElement.id);
    overlay.style.display = "flex";
  }
});

overlay.addEventListener("click", () => {
  overlay.style.display = "none";
});

loaderUI();
fetchCard();