// const apiKey = '2a8792f6e79743a8b9f48a3348e7a36b';
// const apiUrl = 'https://api.spoonacular.com/recipes';



const apiKey = '8e141a21473d46a1a7ce00c517ee6cc0';
const baseUrl = 'https://api.spoonacular.com/recipes/';
const apiUrl = `${baseUrl}complexSearch`;
const recipeGrid = document.getElementById('recipe-grid');
const searchButton = document.getElementById('search-button');
const foodNameInput = document.getElementById('food-name-input');
const ingredientInput = document.getElementById('ingredient-input');

// Create suggestions box for autocomplete
const suggestionsBox = document.createElement('div');
suggestionsBox.classList.add('suggestions-box');
document.body.appendChild(suggestionsBox);
foodNameInput.parentNode.insertBefore(suggestionsBox, foodNameInput.nextSibling);

// Event listener for the search button
searchButton.addEventListener('click', () => {
    const name = foodNameInput.value;
    const ingredients = ingredientInput.value;
    suggestionsBox.style.display = 'none';
    fetchRecipes(name, ingredients);
});

// Event listener for autocomplete suggestions
foodNameInput.addEventListener('input', () => {
    if (foodNameInput.value.length > 1) {
        suggestionsDisplay(foodNameInput.value);
    } else {
        suggestionsBox.innerHTML = '';
        suggestionsBox.classList.remove('show');
    }
});

// Fetch autocomplete suggestions from the Spoonacular API
async function suggestionsDisplay(query) {
    try {
        let response = await fetch(`${baseUrl}autocomplete?apiKey=${apiKey}&number=5&query=${query}`);
        const suggestions = await response.json();

        suggestionsBox.innerHTML = ''; 

        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.innerText = suggestion.title;

            // Set the clicked suggestion as the value for the input
            suggestionItem.addEventListener('click', () => {
                foodNameInput.value = suggestion.title;
                suggestionsBox.innerHTML = '';
                suggestionsBox.classList.remove('show'); 
            });

            suggestionsBox.appendChild(suggestionItem);
        });

        // Show suggestions box when there are results
        suggestionsBox.classList.add('show');
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

// Fetch recipes from Spoonacular API
async function fetchRecipes(name, ingredients) {
    if(name.length===0||ingredients===0)getRandomRecipe();
    try {
        const response = await fetch(
            `${apiUrl}?apiKey=${apiKey}&number=20&includeIngredients=${ingredients}&titleMatch=${name}`
        );
        const data = await response.json();
        displayRecipes(data.results); 
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
}

// Display recipes in the recipe grid
function displayRecipes(recipes) {
    recipeGrid.innerHTML = ''; 
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');

        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="Recipe Image">
            <div class="recipe-info">
                <h2>${recipe.title}</h2>
                <p class="prep-time">Prep Time: ${recipe.readyInMinutes || 'N/A'} mins</p>
            </div>
            <div class="recipe-actions">
                <button class="details-button" onclick="viewDetails(${recipe.id})">View Details</button>
                <button onclick = saveToFavorites(${recipe.id}) class="favorite-button">❤️ Save to Favorites</button>
            </div>
        `;
        recipeGrid.appendChild(recipeCard);
    });
}

// Fetch and display recipe details in a modal
async function viewDetails(recipeId) {
    try {
        const response = await fetch(`${baseUrl}${recipeId}/information?apiKey=${apiKey}`);
        const recipe = await response.json();
        showModal(recipe);
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
}

function showModal(recipe) {
    const modal = document.getElementById('recipe-modal');
    modal.querySelector('h2').innerText = recipe.title;
    modal.querySelector('img').src = recipe.image;

    const ingredientsList = modal.querySelector('ul');
    ingredientsList.innerHTML = '';
    recipe.extendedIngredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.innerText = `${ingredient.original}`;
        ingredientsList.appendChild(li);
    });

    const instructionsList = modal.querySelector('ol');
    instructionsList.innerHTML = '';
    recipe.analyzedInstructions.forEach(instruction => {
        instruction.steps.forEach(step => {
            const li = document.createElement('li');
            li.innerText = step.step;
            instructionsList.appendChild(li);
        });
    });

    modal.style.display = 'block';
}

document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('recipe-modal').style.display = 'none';
});


// Close the modal
document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('recipe-modal').style.display = 'none';
});
function getRandomRecipe() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (favorites.length === 0) {
        fetchRecipes('', 'salt'); 
    } else {
        displayFavorites(); 
    }
}

function saveToFavorites(recipeId) {
    fetch(`${baseUrl}${recipeId}/information?apiKey=${apiKey}`)
        .then(response => response.json())
        .then(recipe => {
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            favorites.push(recipe);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            alert('Recipe saved to favorites!');
        })
        .catch(error => console.error('Error saving recipe to favorites:', error));
}

function displayFavorites() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.length === 0) {
        alert('No favorites saved yet!');
        return;
    }

    recipeGrid.innerHTML = '';  

    favorites.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');

        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="Recipe Image">
            <div class="recipe-info">
                <h2>${recipe.title}</h2>
                <p class="prep-time">Prep Time: ${recipe.readyInMinutes || 'N/A'} mins</p>
            </div>
            <div class="recipe-actions">
                <button class="details-button" onclick="viewDetails(${recipe.id})">View Details</button>
                <button class="favorite-button" onclick="removeFromFavorites(${recipe.id})">❤️ Remove from Favorites</button>
            </div>
        `;
        recipeGrid.appendChild(recipeCard);
    });
}

function removeFromFavorites(recipeId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(recipe => recipe.id !== recipeId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();  
}

// Ensure getRandomRecipe is called when needed
getRandomRecipe();
