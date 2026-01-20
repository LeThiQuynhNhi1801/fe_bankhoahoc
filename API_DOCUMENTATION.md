# API Documentation

Tài liệu mô tả các API endpoints mà frontend cần để hoạt động.

## Base URL
- Development: `http://localhost:8080`
- Test: `https://api-test.example.com`
- Production: `https://api.example.com`

## Authentication

### POST /api/auth/login
Đăng nhập
```json
Request:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "name": "string",
    "username": "string",
    "email": "string",
    "role": "admin|teacher|user"
  }
}
```

### POST /api/auth/signup
Đăng ký
```json
Request:
{
  "name": "string",
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user|teacher"
}

Response:
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "name": "string",
    "username": "string",
    "email": "string",
    "role": "user|teacher"
  }
}
```

### POST /api/auth/logout
Đăng xuất
Headers: `Authorization: Bearer {token}`

### GET /api/auth/profile
Lấy thông tin user hiện tại
Headers: `Authorization: Bearer {token}`
Response: User object

---

## Courses

### GET /api/courses
Lấy danh sách khóa học
Response: `Array<Course>` hoặc `{ data: Array<Course> }`

### GET /api/courses/:id
Lấy chi tiết khóa học
Response: Course object

### POST /api/courses
Tạo khóa học mới (Admin/Teacher)
Headers: `Authorization: Bearer {token}`
```json
Request:
{
  "title": "string",
  "description": "string",
  "instructor": "string",
  "category": "string",
  "price": number,
  "originalPrice": number,
  "image": "string (url)",
  "duration": "string",
  "learningPoints": ["string"],
  "requirements": ["string"],
  "chapters": [
    {
      "title": "string",
      "lessons": [
        {
          "title": "string",
          "duration": "string"
        }
      ]
    }
  ]
}
```

### PUT /api/courses/:id
Cập nhật khóa học (Admin/Teacher)
Headers: `Authorization: Bearer {token}`

### DELETE /api/courses/:id
Xóa khóa học (Admin)
Headers: `Authorization: Bearer {token}`

---

## Chapters

### GET /api/courses/:courseId/chapters
Lấy danh sách chương của khóa học
Response: `Array<Chapter>`

### POST /api/courses/:courseId/chapters
Tạo chương mới (Admin/Teacher)
Headers: `Authorization: Bearer {token}`
```json
Request:
{
  "title": "string",
  "lessons": [
    {
      "title": "string",
      "duration": "string"
    }
  ]
}
```

### PUT /api/courses/:courseId/chapters/:chapterId
Cập nhật chương
Headers: `Authorization: Bearer {token}`

### DELETE /api/courses/:courseId/chapters/:chapterId
Xóa chương
Headers: `Authorization: Bearer {token}`

---

## Documents

### POST /api/courses/:courseId/chapters/:chapterId/documents
Upload tài liệu (Admin/Teacher)
Headers: `Authorization: Bearer {token}`
Content-Type: `multipart/form-data`
```form-data
file: File
type: "word|excel|pdf|video"
```

### DELETE /api/courses/:courseId/chapters/:chapterId/documents/:docId
Xóa tài liệu
Headers: `Authorization: Bearer {token}`

### GET /api/courses/:courseId/chapters/:chapterId/documents/:docId/download
Tải tài liệu
Headers: `Authorization: Bearer {token}`
Response: File download

---

## Cart

### GET /api/cart
Lấy giỏ hàng
Headers: `Authorization: Bearer {token}`
Response: `{ items: Array<CartItem> }`

### POST /api/cart/add
Thêm vào giỏ hàng
Headers: `Authorization: Bearer {token}`
```json
Request:
{
  "courseId": number
}
```

### POST /api/cart/remove
Xóa khỏi giỏ hàng
Headers: `Authorization: Bearer {token}`
```json
Request:
{
  "courseId": number
}
```

### POST /api/cart/clear
Xóa toàn bộ giỏ hàng
Headers: `Authorization: Bearer {token}`

---

## Orders

### GET /api/orders
Lấy danh sách đơn hàng
Headers: `Authorization: Bearer {token}`
Response: `Array<Order>`

### POST /api/orders
Tạo đơn hàng
Headers: `Authorization: Bearer {token}`
```json
Request:
{
  "items": [
    {
      "courseId": number,
      "quantity": number,
      "price": number
    }
  ],
  "customerInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string"
  },
  "paymentMethod": "string"
}
```

### GET /api/orders/:id
Lấy chi tiết đơn hàng
Headers: `Authorization: Bearer {token}`

### PUT /api/orders/:id
Cập nhật đơn hàng (Admin)
Headers: `Authorization: Bearer {token}`
```json
Request:
{
  "status": "pending|completed|cancelled"
}
```

---

## Admin

### GET /api/admin/stats
Lấy thống kê (Admin)
Headers: `Authorization: Bearer {token}`
Response:
```json
{
  "totalCourses": number,
  "totalStudents": number,
  "totalRevenue": number,
  "newOrders": number,
  "recentOrders": Array<Order>
}
```

---

## Data Models

### Course
```json
{
  "id": number,
  "title": "string",
  "description": "string",
  "instructor": "string",
  "category": "string",
  "price": number,
  "originalPrice": number,
  "image": "string",
  "duration": "string",
  "rating": number,
  "reviews": number,
  "students": number,
  "learningPoints": ["string"],
  "requirements": ["string"],
  "chapters": [Chapter],
  "reviewsList": [Review],
  "lastUpdated": "string"
}
```

### Chapter
```json
{
  "id": number,
  "title": "string",
  "lessons": [Lesson],
  "documents": [Document],
  "videos": [Video]
}
```

### Document
```json
{
  "id": number,
  "name": "string",
  "type": "word|excel|pdf",
  "size": "string",
  "url": "string"
}
```

### Video
```json
{
  "id": number,
  "name": "string",
  "duration": "string",
  "size": "string",
  "url": "string"
}
```

---

## Error Response

Tất cả API trả về lỗi theo format:
```json
{
  "error": "string",
  "message": "string",
  "statusCode": number
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
