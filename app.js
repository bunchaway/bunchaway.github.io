document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsDiv = document.getElementById('results');

    const handleSearch = () => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            // Redirect to the main dictionary page (root) with the query
            window.location.href = `/?q=${encodeURIComponent(query)}`;
        } else if (resultsDiv) {
            resultsDiv.innerHTML = '<p style="text-align: center; opacity: 0.6; margin-top: 0.5rem;">Please enter a Vietnamese word or phrase to search.</p>';
        }
    };

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleSearch();
            }
        });
    }
});