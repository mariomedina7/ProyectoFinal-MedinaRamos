const contendedorCards = document.getElementById('contenedor-cards');
const inputBusqueda = document.getElementById('inputBusqueda');
const btnAnterior = document.getElementById('btnAnterior');
const btnPosterior = document.getElementById('btnPosterior');
const btnFavoritos = document.getElementById('btnFavoritos');
const btnInicio = document.getElementById('btnInicio');
const switchTheme = document.getElementById('switchTheme');

let pagination = 1;
let totalPages = 1;
let favoritesMovies = [];
let allMovies = [];

const cardTemplate = (pelicula) => {
    const isFavorite = favoritesMovies.map(Number).includes(pelicula.id);
    const botonFavoritoTexto = isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos';
    const botonFavoritoIcon = isFavorite ? 'fa-trash-can' : 'fa-heart text-danger';

    return `
        <div class="card shadow-sm cardTemplate">
            <button class="bg-dark text-white btn-favorito noto-sans-heading" data-id="${pelicula.id}">${botonFavoritoTexto} <i class="fa-solid ${botonFavoritoIcon}"></i></button>
            <img src="https://image.tmdb.org/t/p/w500${pelicula.poster_path}" alt="${pelicula.title}" height="600">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <small class="noto-sans-heading">${pelicula.title}</small><br>
                        <small>${new Date(pelicula.release_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</small>
                    </div>
                    <button class="percentMovie">${pelicula.vote_average.toFixed(1)}%</button>
                </div>
            </div>
        </div>
    `;
};

const showResultsMovies = (peliculas) => {
    contendedorCards.innerHTML = '';
    const isFavoriteView = sessionStorage.getItem('isFavoritesView') === 'true';
    
    if (isFavoriteView) {
        if (peliculas.length === 0) {
            Toastify({
                text: "No se encontraron resultados.",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                style: {
                    background: "#ff4b5c",
                },
                stopOnFocus: true
            }).showToast();
            getFavoritesMovies();
        } else {
            peliculas.forEach(pelicula => {
                const card = document.createElement('div');
                card.className = 'col-3 mb-3';
                card.innerHTML = cardTemplate(pelicula);
                contendedorCards.appendChild(card);
            });

            buttonAddOrRemoveFavorite();
        }
    } else {
        if (peliculas.length === 0) {
            Toastify({
                text: "No se encontraron resultados.",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                style: {
                    background: "#ff4b5c",
                },
                stopOnFocus: true
            }).showToast();
            getMovies();   
        } else {
            peliculas.forEach(pelicula => {
                const card = document.createElement('div');
                card.className = 'col-3 mb-3';
                card.innerHTML = cardTemplate(pelicula);
                contendedorCards.appendChild(card);
            });

            buttonAddOrRemoveFavorite();
        }
    }
};

const searchMovies = (query, pagination = 1) => {
    const isFavoriteView = sessionStorage.getItem('isFavoritesView') === 'true';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYjdiMjQxM2IwN2I1MTE4OTc2YmQ0YjM2MWI3ZTczYSIsIm5iZiI6MTcyMzkyNjU3OS44NTQ3NDcsInN1YiI6IjY2YzEwNDEwYTE5NTI0MmNkMTkyMWFjYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.69RlkSp5z70Dq2xOzXlteHt4QJ6rfYn3O57MDjDPXuk'
        }
    };

    let url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=es-UY&page=${pagination}`;
    
    if (isFavoriteView) {
        url = 'https://api.themoviedb.org/3/account/21450256/favorite/movies?language=es-UY&page=1&sort_by=created_at.asc';
    }

    fetch(url, options)
        .then(response => response.json())
        .then(response => {
            if (isFavoriteView) {
                const favoriteMovies = response.results.filter(movie => movie.title.toLowerCase().includes(query.toLowerCase()));
                showResultsMovies(favoriteMovies);
            } else {
                totalPages = response.total_pages;
                allMovies = response.results;
                showResultsMovies(allMovies);
            }
            updatePagination();
        })
        .catch(err => console.error(err));
};

inputBusqueda.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        doSearch();
    }
});

const doSearch = () => {
    const query = inputBusqueda.value.trim();
    const isFavoriteView = sessionStorage.getItem('isFavoritesView') === 'true';
    
    if (query !== '') {
        searchMovies(query, pagination);
    } else {
        if (isFavoriteView) {
            getFavoritesMovies(pagination);
        } else {
            getMovies(pagination);
        }
    }
};

const addFavoriteMovie = (movieId) => {
    const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYjdiMjQxM2IwN2I1MTE4OTc2YmQ0YjM2MWI3ZTczYSIsIm5iZiI6MTcyMzkyNjU3OS44NTQ3NDcsInN1YiI6IjY2YzEwNDEwYTE5NTI0MmNkMTkyMWFjYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.69RlkSp5z70Dq2xOzXlteHt4QJ6rfYn3O57MDjDPXuk'
        },
        body: JSON.stringify({media_type: 'movie', media_id: movieId, favorite: true})
      };
      
      fetch('https://api.themoviedb.org/3/account/21450256/favorite', options)
        .then(response => response.json())
        .then(response => {
            favoritesMovies.push(movieId);
            localStorage.setItem('favoriteMovies', JSON.stringify(favoritesMovies));
            updateButtonFavorite();
            Toastify({
                text: "Película agregada con éxito!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                },
                stopOnFocus: true
            }).showToast();
        })
        .catch(err => console.error(err));
}

const removeFavoriteMovie = (movieId) => {
    const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYjdiMjQxM2IwN2I1MTE4OTc2YmQ0YjM2MWI3ZTczYSIsIm5iZiI6MTcyMzkyNjU3OS44NTQ3NDcsInN1YiI6IjY2YzEwNDEwYTE5NTI0MmNkMTkyMWFjYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.69RlkSp5z70Dq2xOzXlteHt4QJ6rfYn3O57MDjDPXuk'
        },
        body: JSON.stringify({media_type: 'movie', media_id: movieId, favorite: false})
      };
      
      fetch('https://api.themoviedb.org/3/account/21450256/favorite', options)
        .then(response => response.json())
        .then(response => {
            favoritesMovies = favoritesMovies.filter(id => id !== movieId);
            localStorage.setItem('favoriteMovies', JSON.stringify(favoritesMovies));
            updateButtonFavorite();
        
            Toastify({
                text: "Película eliminada con éxito!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                style: {
                    background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                },
                stopOnFocus: true
            }).showToast();

            const isFavoritesView = sessionStorage.getItem('isFavoritesView') === 'true';

            if (isFavoritesView) {
                document.querySelector(`[data-id="${movieId}"]`).closest('.card').remove();
                if (favoritesMovies.length === 0) {
                    getMovies();
                    sessionStorage.setItem('isFavoritesView', 'false');
                }
                getFavoritesMovies(pagination);
            }
        })
        .catch(err => console.error(err));
};


const buttonAddOrRemoveFavorite = () => {
    document.querySelectorAll('.btn-favorito').forEach((btn) => {
        btn.addEventListener('click', () => {
            const movieId = btn.getAttribute('data-id');
            favoritesMovies.includes(movieId) ? removeFavoriteMovie(movieId) : addFavoriteMovie(movieId);
        })
    })
}

const updateButtonFavorite = () => {
    document.querySelectorAll('.btn-favorito').forEach((btn) => {
        const movieId = btn.getAttribute('data-id');
        favoritesMovies.includes(movieId) ? btn.innerHTML = 'Quitar de Favoritos <i class="fa-solid fa-trash-can"></i>' : btn.innerHTML = 'Agregar a Favoritos <i class="fa-solid fa-heart text-danger"></i>';
    })
}

const getFavoritesMovies = () => {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYjdiMjQxM2IwN2I1MTE4OTc2YmQ0YjM2MWI3ZTczYSIsIm5iZiI6MTcyMzkyNjU3OS44NTQ3NDcsInN1YiI6IjY2YzEwNDEwYTE5NTI0MmNkMTkyMWFjYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.69RlkSp5z70Dq2xOzXlteHt4QJ6rfYn3O57MDjDPXuk'
        }
    };

    fetch(`https://api.themoviedb.org/3/account/21450256/favorite/movies?language=es-UY&page=${pagination}&sort_by=created_at.asc`, options)
        .then(response => response.json())
        .then(response => {
            const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies'));
            const isFavoritesView = sessionStorage.getItem('isFavoritesView') === 'true';
            totalPages = response.total_pages;

            if (response.results.length > 0) {
                showResultsMovies(response.results);
                sessionStorage.setItem('isFavoritesView', 'true');
            } else if (isFavoritesView) {
                if(favoriteMovies) 
                {
                    getFavoritesMovies(pagination = 1);
                }
            } else {
                Toastify({
                    text: "No tienes películas favoritas.",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "#ff4b5c",
                    },
                    stopOnFocus: true
                }).showToast();
                sessionStorage.setItem('isFavoritesView', 'false');
                getMovies();
            }
            updatePagination();
        })
        .catch(err => console.error(err));
}

const getMovies = () => {
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYjdiMjQxM2IwN2I1MTE4OTc2YmQ0YjM2MWI3ZTczYSIsIm5iZiI6MTcyMzkyNjU3OS44NTQ3NDcsInN1YiI6IjY2YzEwNDEwYTE5NTI0MmNkMTkyMWFjYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.69RlkSp5z70Dq2xOzXlteHt4QJ6rfYn3O57MDjDPXuk'
        }
      };
      
      fetch(`https://api.themoviedb.org/3/movie/top_rated?language=es-UY&page=${pagination}`, options)
        .then(response => response.json())
        .then(response => {
            totalPages = response.total_pages;
            allMovies = response.results;
            showResultsMovies(allMovies);
            updatePagination();
        })
        .catch(err => console.error(err));
};

btnPosterior.addEventListener('click', () => {
    const isFavoriteView = sessionStorage.getItem('isFavoritesView') === 'true';

    if (pagination < totalPages) {
        pagination++;
        if (isFavoriteView) {
            getFavoritesMovies(pagination);
        } else {
            const query = inputBusqueda.value.trim();
            query !== '' ? searchMovies(query, pagination) : getMovies();
        }
    }
});

btnAnterior.addEventListener('click', () => {
    if (pagination > 1) {
        pagination--;
        const query = inputBusqueda.value.trim();
        query !== '' ? searchMovies(query, pagination) : getMovies();
    }
});

btnFavoritos.addEventListener('click', () => {
    getFavoritesMovies(pagination = 1);
    document.getElementById('inputBusqueda').value = '';
});

btnInicio.addEventListener('click', () => {
    pagination = 1;
    getMovies();
    document.getElementById('inputBusqueda').value = '';
    sessionStorage.setItem('isFavoritesView', 'false');
});

const updatePagination = () => {
    btnPosterior.disabled = pagination === totalPages;
    btnAnterior.disabled = pagination === 1;
};

function updateTheme() {
    if (switchTheme.checked) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        document.querySelector('.moviesHeader').classList.add('dark-theme');
        document.querySelector('.moviesHeader').classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        document.querySelector('.moviesHeader').classList.add('light-theme');
        document.querySelector('.moviesHeader').classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const storedFavorites = localStorage.getItem('favoriteMovies');
    if (storedFavorites) {
        favoritesMovies = JSON.parse(storedFavorites);
    }
    
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
        switchTheme.checked = true;
    } else {
        switchTheme.checked = false;
    }
    updateTheme();
    getMovies();
});
        
switchTheme.addEventListener('change', updateTheme);

window.addEventListener('load', () => {
    sessionStorage.removeItem('isFavoritesView');
});

