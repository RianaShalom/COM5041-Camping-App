// Favorites management with view switching
let currentView = 'search';
let campsitesData = []; // Cache for current campsites

// Toggle between search and favorites views
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
    
    if (!isSearch) loadFavorites();
}

// Fetch and display user's saved campsites
async function loadFavorites() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = 'Loading...';
    
    try {
        const res = await fetch(`${CONFIG.API_BASE}/campsites`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            campsitesData = await res.json();
            renderFavorites();
        } else {
            favoritesList.innerHTML = 'Failed to load favorites';
        }
    } catch {
        favoritesList.innerHTML = 'Something went wrong';
    }
}

// Render favorites list with rating dropdowns and remove buttons
function renderFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    
    if (campsitesData.length === 0) {
        favoritesList.innerHTML = '<p><em>No favorites yet. Search and save some campsites!</em></p>';
        return;
    }
    
    favoritesList.innerHTML = campsitesData.map((c, i) => `
        <div class="campsite">
            <h3>${c.name}</h3>
            <p>${c.address}</p>
            <p><strong>Coordinates:</strong> ${c.latitude}, ${c.longitude}</p>
            <p><strong>Rating:</strong> ${c.rating ? '⭐'.repeat(c.rating) : 'Not rated'}</p>
            ${c.weather?.days?.[0] ? `<p><strong>Today:</strong> ${c.weather.days[0].tempMin} - ${c.weather.days[0].tempMax}</p>` : ''}
            <div class="campsite-actions">
                <select class="rating-select" data-index="${i}">
                    <option value="">Rate (1-5)</option>
                    ${[1,2,3,4,5].map(n => `<option value="${n}" ${c.rating === n ? 'selected' : ''}>${'⭐'.repeat(n)} ${n}</option>`).join('')}
                </select>
                <button class="remove-btn" data-index="${i}" style="background: #dc3545;">Remove</button>
            </div>
        </div>
    `).join('');
    
    // Attach event listeners for rating and removal
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
    } catch {
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
    } catch {
        alert('Removal failed');
        return false;
    }
}
