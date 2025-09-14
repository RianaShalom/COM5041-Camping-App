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
            ? data.map(c => `<div class="campsite"><h3>${c.name}</h3><p>${c.address}</p></div>`).join('')
            : 'No results';
    } catch {
        results.innerHTML = 'Error';
    }
});
