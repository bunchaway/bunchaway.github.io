// Đảm bảo mã chạy sau khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Lấy tham số từ URL
    const params = new URLSearchParams(window.location.search);
    const title = decodeURIComponent(params.get('title') || '');
    const author = decodeURIComponent(params.get('author') || '');
    const file = decodeURIComponent(params.get('file') || '');

    if (!title || !author || !file) {
        document.body.innerHTML = '<p style="text-align: center; color: red;">Thiếu thông tin sách. Vui lòng quay lại trang chính.</p>';
        return;
    }

    const downloadButton = document.getElementById('download-deck');
    downloadButton.addEventListener('click', () => {
        if (file) {
            // Tạo một liên kết tạm thời để tải tệp
            const link = document.createElement('a');
            link.href = file;
            link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.error('Không có tệp để tải xuống.');
        }
    });


    // Thêm sự kiện cho nút "Add this deck" với kiểm tra trùng lặp
    const addButton = document.getElementById('add-deck');
    addButton.addEventListener('click', () => {
        if (file) {
            fetch(file)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Không thể tải file từ vựng để thêm vào deck!');
                    }
                    return response.text();
                })
                .then(text => {
                    const lines = text.trim().split('\n').filter(line => line.trim() !== '');
                    const newDeckData = lines.map(line => {
                        const parts = line.split(' : ');
                        return {
                            term: parts[0].trim(),
                            definition: parts.slice(1).join(' : ').trim()
                        };
                    });

                    // Lấy danh sách deck hiện tại từ localStorage
                    let allFlashcardDecks = JSON.parse(localStorage.getItem('bunchawayDecks') || '{}');

                    // Tạo tập hợp các cặp term-definition đã tồn tại
                    const existingPairs = new Set();
                    for (const deckName in allFlashcardDecks) {
                        allFlashcardDecks[deckName].forEach(item => {
                            existingPairs.add(`${item.term}-${item.definition}`);
                        });
                    }

                    // Lọc các cặp mới không trùng lặp
                    const uniqueDeckData = newDeckData.filter(item => {
                        const pair = `${item.term}-${item.definition}`;
                        return !existingPairs.has(pair);
                    });

                    // Nếu có cặp mới, thêm vào deck hiện tại
                    if (uniqueDeckData.length > 0) {
                        const fileName = `${title}`;
                        if (!allFlashcardDecks[fileName]) {
                            allFlashcardDecks[fileName] = [];
                        }
                        allFlashcardDecks[fileName] = [...allFlashcardDecks[fileName], ...uniqueDeckData];
                        localStorage.setItem('bunchawayDecks', JSON.stringify(allFlashcardDecks));
                    }

                    // Chuyển hướng đến /decks/
                    window.location.href = '/decks/';
                })
                .catch(error => {
                    console.error('Lỗi khi thêm deck:', error);
                });
        } else {
            console.error('Không có tệp để thêm vào deck.');
        }
    });


    // Cập nhật tiêu đề và tác giả
    document.getElementById('book-title').textContent = title;
    document.getElementById('book-author').textContent = `Author: ${author}`;
    // Fetch tệp từ vựng
    fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải file từ vựng!');
            }
            return response.text();
        })
        .then(text => {
            // Tách dữ liệu thành từng dòng
            const lines = text.trim().split('\n').filter(line => line.trim() !== '');

            // Tính số từ độc đáo (số dòng)
            const uniqueWordsCount = lines.length;
            document.getElementById('unique-words').textContent = `Unique words: ${uniqueWordsCount}`;

            // Parse thành danh sách từ vựng
            const vocabulary = lines.map(line => {
                const parts = line.split(' : ');
                const term = parts[0].trim();
                const definition = parts.slice(1).join(' : ').trim(); // Để xử lý nếu có ':' trong definition
                return { term, definition };
            });

            const itemsPerPage = 50;
            let currentPage = 1;
            const totalPages = Math.ceil(vocabulary.length / itemsPerPage);

            const vocabularyList = document.getElementById('vocabulary-list');
            const pagination = document.getElementById('pagination');

            function displayPage(page) {
                currentPage = page;
                vocabularyList.innerHTML = '';
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const pageItems = vocabulary.slice(start, end);

                pageItems.forEach(item => {
                    const box = document.createElement('div');
                    box.className = 'vocab-box';
                    box.innerHTML = `
                        <span class="vocab-term">${item.term}</span>
                        <span class="vocab-definition">${item.definition}</span>
                    `;
                    vocabularyList.appendChild(box);
                });

                pagination.innerHTML = '';
                if (totalPages > 1) {
                    const prevButton = document.createElement('button');
                    prevButton.textContent = 'Before';
                    prevButton.disabled = page === 1;
                    prevButton.onclick = () => {
                        if (page > 1) displayPage(page - 1);
                    };
                    pagination.appendChild(prevButton);

                    // Tính toán các trang cần hiển thị
                    const maxPagesToShow = 5;
                    let startPage, endPage;

                    if (totalPages <= maxPagesToShow) {
                        startPage = 1;
                        endPage = totalPages;
                    } else {
                        const sidePages = Math.floor((maxPagesToShow - 3) / 2); // Trang đầu, cuối, và hiện tại luôn hiển thị
                        startPage = Math.max(2, page - sidePages);
                        endPage = Math.min(totalPages - 1, page + sidePages);

                        // Điều chỉnh nếu gần đầu hoặc cuối
                        if (page <= sidePages + 2) {
                            endPage = maxPagesToShow - 1;
                        } else if (page >= totalPages - sidePages - 1) {
                            startPage = totalPages - maxPagesToShow + 2;
                        }
                    }

                    // Nút trang 1
                    const firstPage = document.createElement('button');
                    firstPage.textContent = '1';
                    firstPage.className = page === 1 ? 'active' : '';
                    firstPage.onclick = () => displayPage(1);
                    pagination.appendChild(firstPage);

                    // Dấu "..." nếu startPage > 2
                    if (startPage > 2) {
                        const ellipsisStart = document.createElement('span');
                        ellipsisStart.textContent = '...';
                        pagination.appendChild(ellipsisStart);
                    }

                    // Các trang giữa
                    for (let i = startPage; i <= endPage; i++) {
                        const pageButton = document.createElement('button');
                        pageButton.textContent = i;
                        pageButton.className = i === page ? 'active' : '';
                        pageButton.onclick = () => displayPage(i);
                        pagination.appendChild(pageButton);
                    }

                    // Dấu "..." nếu endPage < totalPages - 1
                    if (endPage < totalPages - 1) {
                        const ellipsisEnd = document.createElement('span');
                        ellipsisEnd.textContent = '...';
                        pagination.appendChild(ellipsisEnd);
                    }

                    // Nút trang cuối
                    if (totalPages > 1) {
                        const lastPage = document.createElement('button');
                        lastPage.textContent = totalPages;
                        lastPage.className = page === totalPages ? 'active' : '';
                        lastPage.onclick = () => displayPage(totalPages);
                        pagination.appendChild(lastPage);
                    }


                    // Thêm input để nhập số trang
                    const pageInputContainer = document.createElement('span');
                    pageInputContainer.className = 'page-input-container';
                    pageInputContainer.innerHTML = `
                                <input type="number" min="1" max="${totalPages}" value="${page}" class="page-input" placeholder="Trang">
                                <button class="go-button">Move</button>
                            `;
                    pagination.appendChild(pageInputContainer);

                    const pageInput = pageInputContainer.querySelector('.page-input');
                    const goButton = pageInputContainer.querySelector('.go-button');
                    goButton.onclick = () => {
                        let inputPage = parseInt(pageInput.value);
                        if (isNaN(inputPage) || inputPage < 1) {
                            inputPage = 1;
                        } else if (inputPage > totalPages) {
                            inputPage = totalPages;
                        }
                        displayPage(inputPage);
                        pageInput.value = inputPage; // Cập nhật giá trị input
                    };

                    // Nút Sau
                    const nextButton = document.createElement('button');
                    nextButton.textContent = 'After';
                    nextButton.disabled = page === totalPages;
                    nextButton.onclick = () => {
                        if (page < totalPages) displayPage(page + 1);
                    };
                    pagination.appendChild(nextButton);
                }
            }

            displayPage(currentPage);
        })
        .catch(error => {
            console.error('Lỗi khi xử lý:', error);
            document.getElementById('vocabulary-section').innerHTML = `<p style="text-align: center; color: red;">Đã xảy ra lỗi khi tải danh sách từ vựng.</p>`;
        });
});