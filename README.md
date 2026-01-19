# Website Bán Khóa Học - Full Stack

Dự án full-stack website bán khóa học với Vue.js frontend và Spring Boot backend.

## Cấu Trúc Dự Án

```
demo/
├── frontend/          # Vue.js Frontend (thư mục gốc)
│   ├── src/
│   ├── package.json
│   └── ...
└── backend/           # Spring Boot Backend
    ├── src/
    ├── pom.xml
    └── ...
```

## Frontend (Vue.js)

### Tính Năng
- 🏠 Trang chủ với khóa học nổi bật
- 📚 Danh sách khóa học với tìm kiếm và lọc
- 📖 Chi tiết khóa học
- 🛒 Giỏ hàng
- 💳 Thanh toán với nhiều phương thức
- ✅ Xác nhận đơn hàng

### Chạy Frontend

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend chạy tại: http://localhost:3000

## Backend (Spring Boot)

### Tính Năng
- RESTful API cho khóa học
- RESTful API cho đơn hàng
- API xử lý thanh toán
- H2 in-memory database
- CORS configuration cho frontend

### Yêu Cầu
- Java 17+
- Maven 3.6+

### Chạy Backend

```bash
cd backend

# Cài đặt dependencies và build
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

Backend chạy tại: http://localhost:8080

### API Endpoints

#### Courses
- `GET /api/courses` - Lấy tất cả khóa học
- `GET /api/courses?search=...&category=...` - Tìm kiếm và lọc
- `GET /api/courses/featured` - Khóa học nổi bật
- `GET /api/courses/{id}` - Chi tiết khóa học
- `POST /api/courses` - Tạo khóa học mới
- `PUT /api/courses/{id}` - Cập nhật khóa học
- `DELETE /api/courses/{id}` - Xóa khóa học

#### Orders
- `GET /api/orders` - Lấy tất cả đơn hàng
- `GET /api/orders/{id}` - Chi tiết đơn hàng
- `GET /api/orders/code/{orderCode}` - Đơn hàng theo mã
- `POST /api/orders` - Tạo đơn hàng mới
- `PATCH /api/orders/{id}/status` - Cập nhật trạng thái

#### Payment
- `POST /api/payment/process` - Xử lý thanh toán

### H2 Console

Truy cập: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (để trống)

## Tích Hợp Frontend và Backend

Hiện tại frontend sử dụng localStorage. Để tích hợp với backend:

1. Cài đặt axios trong frontend:
```bash
npm install axios
```

2. Tạo service để gọi API:
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
})
```

3. Cập nhật các component để gọi API thay vì localStorage

## Công Nghệ

### Frontend
- Vue.js 3
- Vue Router
- Vite
- CSS3

### Backend
- Spring Boot 3.1.5
- Spring Data JPA
- H2 Database
- Maven
- Java 17

## Lưu Ý

- Backend sử dụng H2 in-memory database, dữ liệu sẽ mất khi restart
- Để production, nên chuyển sang MySQL/PostgreSQL
- Cần thêm authentication/authorization
- Payment processing hiện tại chỉ là demo

## Tác Giả

Dự án được tạo cho mục đích học tập và demo.
