// Đảm bảo mã chạy sau khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    const bookContainer = document.getElementById('book-container');

    // Dùng hàm fetch để đọc nội dung từ tệp books.txt
    fetch('./list.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải tệp list.txt!');
            }
            return response.text();
        })
        .then(text => {
            // Tách dữ liệu văn bản thành từng dòng
            const books = text.trim().split('\n');

            // Lặp qua mỗi dòng để tạo thẻ sách
            books.forEach(bookLine => {
                // Bỏ qua các dòng trống
                if (bookLine.trim() === '') return;

                // Tách tên sách và tác giả
                const parts = bookLine.split(' - ');
                const title = parts[0].trim();
                const author = parts[1].trim();
                const bookIdentifier = encodeURIComponent(`${title} - ${author}`);

                // Xác định typeOfMedia dựa trên đường dẫn
                const path = window.location.pathname;
                console.log(path);
                let typeOfMedia;
                if (path.includes('sach')) {
                    typeOfMedia = 'book';
                } else if (path.includes('tieu-thuyet')) {
                    typeOfMedia = 'novel';
                } else if (path.includes('phim-anh')) {
                    typeOfMedia = 'movie';
                } else {
                    console.error('Không xác định được typeOfMedia từ đường dẫn:', path);
                    bookContainer.innerHTML = `<p style="text-align: center; color: red;">Không thể xác định loại media. Vui lòng kiểm tra đường dẫn.</p>`;
                    return;
                }

                const coverUrl = `https://bunchaway.github.io/api/bia-sach/${bookIdentifier}.jpg`;
                const filePath = `https://bunchaway.github.io/api/decks/${typeOfMedia}/${bookIdentifier}.txt`; // Giả sử tệp từ vựng nằm trong thư mục vocabulary

                // Tạo một phần tử div mới cho thẻ sách
                const card = document.createElement('div');
                card.className = 'book-card';

                // Thêm nội dung HTML vào thẻ
                card.innerHTML = `
                    <img src="${coverUrl}" alt="Bìa sách ${title}" class="book-cover" onerror="this.onerror=null; this.src='/cover.png';">
                    <div class="book-info">
                        <h2 class="title">${title}</h2>
                        <p class="author">${author}</p>
                        <button class="view-more-button" id="viewMoreBtn" onclick="window.location.href='../details.html?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&file=${encodeURIComponent(filePath)}';">Vocabulary List</button>
                    </div>
                `;

                // Thêm thẻ vừa tạo vào vùng chứa
                bookContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Lỗi khi xử lý:', error);
            bookContainer.innerHTML = `<p style="text-align: center; color: red;">Đã xảy ra lỗi khi tải danh sách tác phẩm.</p>`;
        });
});