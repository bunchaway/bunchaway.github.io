document.addEventListener('DOMContentLoaded', () => {
    // Lấy từ khóa từ URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsDiv = document.getElementById('results');

    
    if (query) {
        // Cập nhật giá trị cho ô input
        document.getElementById('searchInput').value = query;
        // Bắt đầu quá trình tìm kiếm tự động
        searchDictionary(query);
    }


    // Cập nhật lại logic chuyển trang cho nút tìm kiếm trên trang kết quả
    searchBtn.addEventListener('click', () => {
        const newQuery = searchInput.value.trim();
        if (newQuery.length > 0) {
            window.location.href = `/tudien/tim-kiem.html?q=${encodeURIComponent(newQuery)}`;
        }
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const newQuery = searchInput.value.trim();
            if (newQuery.length > 0) {
                window.location.href = `/tudien/tim-kiem.html?q=${encodeURIComponent(newQuery)}`;
            }
        }
    });

    // Hàm lấy tổ hợp chữ cái đầu tiên giống logic trong chương trình Rust
    function getFirstSyllableCombo(word) {
        if (!word) {
            return null;
        }

        const s_lower = word.toLowerCase();

        // Danh sách các phụ âm kép và các trường hợp đặc biệt
        const complex_consonants = ["ngh", "ng", "tr", "ch", "gh", "kh", "nh", "ph", "qu", "th", "gi"];
        const special_words = ["sự", "bộ", "máy"];

        // 1. Kiểm tra các từ đặc biệt
        for (const specialWord of special_words) {
            if (s_lower.startsWith(specialWord)) {
                if (s_lower.length === specialWord.length) {
                    return specialWord;
                }
                const rest = s_lower.substring(specialWord.length).trim();
                if (rest.length > 0) {
                    return `${specialWord}_${rest[0]}`;
                }
                return specialWord;
            }
        }

        // 2. Kiểm tra phụ âm kép
        for (const combo of complex_consonants) {
            if (s_lower.startsWith(combo)) {
                if (s_lower.length > combo.length) {
                    return `${combo}${s_lower.charAt(combo.length)}`;
                }
                return combo;
            }
        }
        
        // 3. Lấy 2 ký tự đầu tiên nếu có
        if (s_lower.length >= 2) {
            return s_lower.substring(0, 2);
        }

        // 4. Lấy 1 ký tự đầu tiên
        return s_lower.charAt(0);
    }
    
    // Hàm tìm kiếm và hiển thị kết quả
    async function searchDictionary(query) {
        resultsDiv.innerHTML = ''; // Xóa kết quả cũ

        if (query.length === 0) {
            resultsDiv.innerHTML = '<p>Vui lòng nhập từ cần tra cứu.</p>';
            return;
        }

        const combo = getFirstSyllableCombo(query);
        if (!combo) {
            resultsDiv.innerHTML = '<p>Không tìm thấy từ.</p>';
            return;
        }

        const apiUrl = `https://bunchaway.github.io/tudien_api/api/${combo}.json`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 404) {
                    resultsDiv.innerHTML = '<p>Không tìm thấy từ này trong từ điển.</p>';
                } else {
                    resultsDiv.innerHTML = '<p>Đã xảy ra lỗi khi tải dữ liệu.</p>';
                }
                return;
            }

            const data = await response.json();
            
            // Tìm từ chính xác trong danh sách
            const foundEntry = data.find(entry => entry.word.toLowerCase() === query.toLowerCase());

            if (foundEntry) {
                displayResults(foundEntry);
            } else {
                resultsDiv.innerHTML = '<p>Không tìm thấy từ này trong từ điển.</p>';
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            resultsDiv.innerHTML = '<p>Đã xảy ra lỗi khi kết nối với API.</p>';
        }
    }
    
    // Hàm hiển thị kết quả ra giao diện
    function displayResults(entry) {
    let html = `
        <div class="word-entry">
            <div class="word-title">${entry.word}</div>
            <ul class="definition-list">
    `;
    
    entry.definitions.forEach(def => {
        // Thay thế ký tự xuống dòng '\n' bằng thẻ <br>
        const formattedDefinition = def.dict_definition.replace(/\n/g, '<br>');

        html += `
            <li class="definition-item">
                <div class="dict-name">Từ điển: ${def.dict_name}</div>
                <div class="dict-text">${formattedDefinition}</div>
            </li>
        `;
    });

    html += `
            </ul>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
    }

    // // Gắn sự kiện click cho nút tìm kiếm
    // searchBtn.addEventListener('click', searchDictionary);

    // // Gắn sự kiện "Enter" cho ô nhập liệu
    // searchInput.addEventListener('keypress', (event) => {
    //     if (event.key === 'Enter') {
    //         searchDictionary();
    //     }
    // });
});
