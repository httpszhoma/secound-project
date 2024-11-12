const apiKey = 'db65d8b6a9b1e743db5416d169d58edf';
const searchInput = document.getElementById('searchInput');
const searchDropdown = document.getElementById('searchDropdown');
const navbarToggle = document.querySelector('.navbar-toggle');
const navbarMenu = document.querySelector('.navbar-menu');


async function fetchUrl(url) {
    const response = await fetch(url);
    return await response.json();
}


async function parseMovies(data, grid) {
    data.results.forEach(movie => {
        const movieItem = document.createElement('article');
        movieItem.classList.add('movie-item');
        const ratingOutOfFive = Math.round(movie.vote_average / 2);
        let stars = '';

        for (let i = 0; i < 5; i++) {
            stars += i < ratingOutOfFive ? '★' : '☆';
        }

        movieItem.innerHTML = `
            <div class="movie-image-wrapper">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} cover" class="movie-image">
                <p class="rating">${stars}</p>
            </div>
            <h3 class="movie-title">${movie.title}</h3>
        `;
        movieItem.addEventListener('click', () => {
            window.location.href = `detail.html?id=${movie.id}`;
        });
        grid.appendChild(movieItem);
    });
}

navbarToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
    navbarToggle.classList.toggle('active');
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


async function searchMovies(query) {
    searchDropdown.innerHTML = '';
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${query}&page=1&include_adult=false`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results.length > 0) {
        data.results.forEach(movie => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('search-result-item');
            resultItem.textContent = movie.title;
            resultItem.addEventListener('click', () => {
                window.location.href = `detail.html?id=${movie.id}`;
            });
            searchDropdown.appendChild(resultItem);
        });
        searchDropdown.style.display = 'block';
    } else {
        searchDropdown.style.display = 'none';
    }
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
        searchMovies(query);
    } else {
        searchDropdown.style.display = 'none';
    }
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.style.display = 'none';
    }
});