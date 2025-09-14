// Favorites management with view switching
let currentView = 'search';
let campsitesData = []; // Cache for current campsites
let currentWeatherFilter = ''; // Track current weather filter

// Toggle between search and favorites v// Handle campsite removal
async function handleRemoval(e) {
    const campsite = campsitesData[e.target.dataset.index];
    
    if (confirm(`Remove ${campsite.name} from favorites?`) && await deleteCampsite(campsite.id)) {
        alert(`✅ Removed ${campsite.name}`);
        loadFavorites();
    }
}

// Handle forecast toggle
function handleForecastToggle(e) {
    const index = e.target.dataset.index;
    const forecastDiv = document.getElementById(`forecast-${index}`);
    const button = e.target;
    
    if (forecastDiv.classList.contains('hidden')) {
        forecastDiv.classList.remove('hidden');
        button.textContent = 'Hide 7-Day Forecast';
    } else {
        forecastDiv.classList.add('hidden');
        button.textContent = 'Show 7-Day Forecast';
    }
}

document.getElementById('favoritesBtn').addEventListener('click', () => {
    currentView = currentView === 'search' ? 'favorites' : 'search';
    toggleView();
});

// Switch view and update UI
function toggleView() {
    const isSearch = currentView === 'search';
    const elements = {
        searchForm: document.getElementById('searchForm'),
        results: document.getElementById('results'),
        favorites: document.getElementById('favorites'),
        favBtn: document.getElementById('favoritesBtn')
    };
    
    elements.searchForm.classList.toggle('hidden', !isSearch);
    elements.results.classList.toggle('hidden', !isSearch);
    elements.favorites.classList.toggle('hidden', isSearch);
    elements.favBtn.textContent = isSearch ? 'My Favorites' : 'Back to Search';
    
    if (!isSearch) {
        currentWeatherFilter = '';
        const weatherFilter = document.getElementById('weatherFilter');
        if (weatherFilter) {
            weatherFilter.value = '';
            if (!weatherFilter.hasAttribute('data-listener-attached')) {
                weatherFilter.addEventListener('change', (e) => {
                    currentWeatherFilter = e.target.value;
                    loadFavorites(currentWeatherFilter);
                });
                weatherFilter.setAttribute('data-listener-attached', 'true');
            }
        }
        loadFavorites();
    }
}

// Categorize weather codes into groups
function getWeatherCategory(weatherCode) {
    if (weatherCode === undefined || weatherCode === null) return null;
    
    // Clear/Sunny (codes 0-3)
    if (weatherCode >= 0 && weatherCode <= 3) return 'clear';
    
    // Fog/Mist (codes 45, 48)
    if (weatherCode === 45 || weatherCode === 48) return 'fog';
    
    // Rainy/Drizzle (codes 51-55, 61-65, 80-82)
    if ((weatherCode >= 51 && weatherCode <= 55) || 
        (weatherCode >= 61 && weatherCode <= 65) || 
        (weatherCode >= 80 && weatherCode <= 82)) return 'rainy';
    
    // Snow/Sleet (codes 71-77, 85-86)
    if ((weatherCode >= 71 && weatherCode <= 77) || 
        (weatherCode >= 85 && weatherCode <= 86)) return 'snow';
    
    // Thunderstorms (codes 95-99)
    if (weatherCode >= 95 && weatherCode <= 99) return 'thunderstorm';
    
    // Default to cloudy for other codes
    return 'cloudy';
}

// Filter campsites by weather category
function filterCampsitesByWeather(campsites, weatherFilter) {
    if (!weatherFilter) return campsites;
    
    return campsites.filter(campsite => {
        const weatherCode = campsite.weather?.days[0]?.weatherCode;
        const category = getWeatherCategory(weatherCode);
        return category === weatherFilter;
    });
}

async function loadFavorites(weatherFilter = '') {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = 'Loading...';
    
    currentWeatherFilter = weatherFilter;
    
    try {
        // Always fetch all campsites, filter on frontend
        const url = `${CONFIG.API_BASE}/campsites`;
        
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const allCampsites = await res.json();
            campsitesData = filterCampsitesByWeather(allCampsites, weatherFilter);
            renderFavorites();
        } else {
            favoritesList.innerHTML = 'Failed to load favorites';
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        favoritesList.innerHTML = 'Something went wrong';
    }
}

// Helper function to get weather icon based on weather code
function getWeatherIcon(weatherCode) {
    const weatherCodeMap = {
        0: 'clear',                          // Clear sky
        1: 'mostly-clear',                   // Mainly clear
        2: 'partly-cloudy',                  // Partly cloudy
        3: 'overcast',                       // Overcast
        45: 'fog',                           // Fog
        48: 'rime-fog',                      // Depositing rime fog
        51: 'light-drizzle',                 // Drizzle: Light intensity
        53: 'moderate-drizzle',              // Drizzle: Moderate intensity
        55: 'dense-drizzle',                 // Drizzle: Dense intensity
        56: 'light-freezing-drizzle',        // Freezing Drizzle: Light intensity
        57: 'dense-freezing-drizzle',        // Freezing Drizzle: Dense intensity
        61: 'light-rain',                    // Rain: Slight intensity
        63: 'moderate-rain',                 // Rain: Moderate intensity
        65: 'heavy-rain',                    // Rain: Heavy intensity
        66: 'light-freezing-rain',           // Freezing Rain: Light intensity
        67: 'heavy-freezing-rain',           // Freezing Rain: Heavy intensity
        71: 'slight-snowfall',               // Snow fall: Slight intensity
        73: 'moderate-snowfall',             // Snow fall: Moderate intensity
        75: 'heavy-snowfall',                // Snow fall: Heavy intensity
        77: 'snowflake',                     // Snow grains
        80: 'light-rain',                    // Rain showers: Slight
        81: 'moderate-rain',                 // Rain showers: Moderate
        82: 'heavy-rain',                    // Rain showers: Violent
        85: 'slight-snowfall',               // Snow showers: Slight
        86: 'heavy-snowfall',                // Snow showers: Heavy
        95: 'thunderstorm',                  // Thunderstorm: Slight or moderate
        96: 'thunderstorm-with-hail',        // Thunderstorm with slight hail
        99: 'thunderstorm-with-hail'         // Thunderstorm with heavy hail
    };
    
    return weatherCodeMap[weatherCode] || 'clear';
}

// Helper function to get weather description
function getWeatherDescription(weatherCode) {
    const weatherDescriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    
    return weatherDescriptions[weatherCode] || 'Unknown weather';
}

// Render favorites list with rating dropdowns and remove buttons
function renderFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    
    if (campsitesData.length === 0) {
        favoritesList.innerHTML = '<p><em>No favorites yet. Search and save some campsites!</em></p>';
        return;
    }
    
    favoritesList.innerHTML = campsitesData.map((c, i) => {
        let weatherDisplay = '';
        
        if (c.weather?.days?.[0]) {
            const today = c.weather.days[0];
            const weatherDesc = getWeatherDescription(today.weatherCode);
            const iconName = getWeatherIcon(today.weatherCode);
            weatherDisplay = `
                <p><strong>Weather:</strong> <img src="icons/${iconName}@4x.png" alt="${weatherDesc}" class="weather-icon"> ${weatherDesc} (${today.tempMin} - ${today.tempMax}) <small class="weather-code">Code: ${today.weatherCode}</small></p>
                <button class="forecast-toggle" data-index="${i}">Show 7-Day Forecast</button>
                <div class="extended-forecast hidden" id="forecast-${i}">
                    ${c.weather.days.slice(1, 7).map((day, dayIndex) => `
                        <div class="forecast-day">
                            <span class="forecast-date">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <img src="icons/${getWeatherIcon(day.weatherCode)}@4x.png" alt="${getWeatherDescription(day.weatherCode)}" class="forecast-icon">
                            <span class="forecast-temps">${day.tempMin} - ${day.tempMax}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            weatherDisplay = `<p><strong>Weather:</strong> No data available</p>`;
        }
        
        return `
            <div class="campsite">
                <h3>${c.name}</h3>
                <p>${c.address}</p>
                <p><strong>Coordinates:</strong> ${c.latitude}, ${c.longitude}</p>
                <p><strong>Rating:</strong> ${c.rating ? '⭐'.repeat(c.rating) : 'Not rated'}</p>
                ${weatherDisplay}
                <div class="campsite-actions">
                    <select class="rating-select" data-index="${i}">
                        <option value="">Rate (1-5)</option>
                        ${[1,2,3,4,5].map(n => `<option value="${n}" ${c.rating === n ? 'selected' : ''}>${'⭐'.repeat(n)} ${n}</option>`).join('')}
                    </select>
                    <button class="remove-btn" data-index="${i}">Remove</button>
                </div>
            </div>
        `;
    }).join('');
    
    attachEventListeners();
}

// Attach event listeners to rating selects and remove buttons
function attachEventListeners() {
    document.querySelectorAll('.rating-select').forEach(select => {
        select.addEventListener('change', handleRating);
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', handleRemoval);
    });
    
    document.querySelectorAll('.forecast-toggle').forEach(btn => {
        btn.addEventListener('click', handleForecastToggle);
    });
}

// Handle rating change from dropdown
async function handleRating(e) {
    if (!e.target.value) return;
    
    const campsite = campsitesData[e.target.dataset.index];
    const rating = parseInt(e.target.value);
    
    if (await updateRating(campsite.id, rating)) {
        campsite.rating = rating; // Update local cache
        alert(`✅ Rated ${campsite.name} ${rating} stars!`);
    }
}

// Handle campsite removal
async function handleRemoval(e) {
    const campsite = campsitesData[e.target.dataset.index];
    
    if (confirm(`Remove ${campsite.name} from favorites?`) && await deleteCampsite(campsite.id)) {
        alert(`✅ Removed ${campsite.name}`);
        loadFavorites(); // Refresh list
    }
}

// API call to update campsite rating
async function updateRating(id, rating) {
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${CONFIG.API_BASE}/campsites`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: id,
                rating: parseInt(rating)
            })
        });
        
        if (!res.ok) {
            alert('Rating failed');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error updating rating:', error);
        alert('Rating failed: Network error');
        return false;
    }
}

// API call to delete campsite from favorites
async function deleteCampsite(id) {
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${CONFIG.API_BASE}/campsites?id=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        return res.ok;
    } catch (error) {
        console.error('Error deleting campsite:', error);
        alert('Removal failed');
        return false;
    }
}
