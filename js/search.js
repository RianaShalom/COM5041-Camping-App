document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const location = document.getElementById('location').value.trim();
    const results = document.getElementById('results');
    
    if (!location) return;
    
    results.innerHTML = 'Searching...';
    
    try {
        const res = await fetch(`${CONFIG.API_BASE}/search?place=${location}`);
        const data = await res.json();
        
        results.innerHTML = data?.length 
            ? data.map(c => `
                <div class="campsite">
                    <h3>${c.name}</h3>
                    <p>${c.address}</p>
                    <p><strong>Coordinates:</strong> ${c.latitude}, ${c.longitude}</p>
                    ${token ? `<button onclick="saveCampsite('${c.id}', '${c.name}', ${c.latitude}, ${c.longitude}, '${c.address}')">⭐ Save</button>` : '<p><em>Login to save campsites</em></p>'}
                </div>`).join('')
            : 'No results';
    } catch {
        results.innerHTML = 'Error';
    }
});

// Save campsite to favorites
async function saveCampsite(id, name, latitude, longitude, address) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        return;
    }
    
    try {
        const res = await fetch(`${CONFIG.API_BASE}/campsites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                campsite: [{
                    id,
                    name,
                    latitude,
                    longitude,
                    address
                }]
            })
        });
        
        if (res.ok) {
            alert(`✅ ${name} saved to favorites!`);
        } else {
            alert('Failed to save campsite');
        }
    } catch {
        alert('Something went wrong');
    }
}
