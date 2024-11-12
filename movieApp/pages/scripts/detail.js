const movieId = new URLSearchParams(window.location.search).get('id');

const movieTitle = document.getElementById('movie-title');
const movieGenres = document.getElementById('movie-genres');
const movieRating = document.getElementById('movie-rating');
const movieOverview = document.getElementById('movie-overview');
const moviePoster = document.getElementById('movie-poster');
const movieTrailer = document.getElementById('movie-trailer');
const movieCountry = document.getElementById('movie-country');
const movieReleaseDate = document.getElementById('movie-release-date');
const movieRuntime = document.getElementById('movie-runtime');
const recommendedMovies = document.getElementById('recommended-movies');

async function fetchMovieDetails() {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`;
    const response = await fetch(url);
    const movie = await response.json();

    movieTitle.textContent = movie.title;
    movieGenres.textContent = movie.genres.map(genre => genre.name).join(', ');
    movieRating.textContent = `Rating: ${movie.vote_average}`;
    movieOverview.textContent = movie.overview;
    moviePoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    movieCountry.textContent = movie.production_countries[0]?.name || 'Unknown';
    movieReleaseDate.textContent = movie.release_date || 'N/A';
    movieRuntime.textContent = `${movie.runtime} minutes`;

    await fetchMovieTrailer();
    await fetchRecommendedMovies();
}

async function fetchMovieTrailer() {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-US`;
    const data = await fetchUrl(url);
    movieTrailer.src = `https://www.youtube.com/embed/${data.results[0].key}`;
    console.log(movieTrailer.src);
}

async function fetchRecommendedMovies() {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${apiKey}&language=en-US&page=1`;
    const data = await fetchUrl(url);
    await parseMovies(data, recommendedMovies)
}

document.getElementById('save-to-list').addEventListener('click', () => {
    const movie = {
        id: movieId,
        title: document.getElementById('movie-title').textContent,
        poster: document.getElementById('movie-poster').src,
        genres: document.getElementById('movie-genres').textContent,
        rating: document.getElementById('movie-rating').textContent,
        overview: document.getElementById('movie-overview').textContent,
    };
    let myList = JSON.parse(localStorage.getItem('myList')) || [];
    myList.push(movie);
    localStorage.setItem('myList', JSON.stringify(myList));

    alert('Movie added to your list!');
});


fetchMovieDetails()