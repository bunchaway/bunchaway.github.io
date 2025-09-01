document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsDiv = document.getElementById('results');

    // Gắn sự kiện click cho nút tìm kiếm
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            // Chuyển hướng đến trang mới với query string
            window.location.href = `/tudien/tim-kiem.html?q=${encodeURIComponent(query)}`;
        } else {
            resultsDiv.innerHTML = '<p>Vui lòng nhập từ cần tra cứu.</p>';
        }
    });

    // Gắn sự kiện "Enter" cho ô nhập liệu
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                // Chuyển hướng đến trang mới với query string
                window.location.href = `/tudien/tim-kiem.html?q=${encodeURIComponent(query)}`;
            } else {
                resultsDiv.innerHTML = '<p>Vui lòng nhập từ cần tra cứu.</p>';
            }
        }
    });

});