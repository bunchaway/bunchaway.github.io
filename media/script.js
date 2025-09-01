// Đảm bảo mã chạy sau khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    const bookContainer = document.getElementById('book-container');

    // Dùng hàm fetch để đọc nội dung từ tệp books.txt
    fetch('books.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải file books.txt!');
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

                // Tạo URL cho ảnh bìa theo định dạng API
                // encodeURIComponent để xử lý các ký tự đặc biệt trong tên sách/tác giả
                const bookIdentifier = encodeURIComponent(`${title} - ${author}`);
                const coverUrl = `/api/bookcover/${bookIdentifier}.jpg`;
                
                // Tạo một phần tử div mới cho thẻ sách
                const card = document.createElement('div');
                card.className = 'book-card';

                // Thêm nội dung HTML vào thẻ
                card.innerHTML = `
                    <img src="${coverUrl}" alt="Bìa sách ${title}" class="book-cover" onerror="this.src='https://via.placeholder.com/300x400.png?text=Image+Not+Found'">
                    <div class="book-info">
                        <h2 class="title">${title}</h2>
                        <p class="author">${author}</p>
                        <button class="view-more-button">Xem thêm</button>
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