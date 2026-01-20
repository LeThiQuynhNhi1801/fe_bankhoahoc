# Cấu hình Môi trường

Thư mục này chứa các file cấu hình cho các môi trường khác nhau (dev, test, prod).

## Files

- `env.js` - Cấu hình môi trường và biến môi trường
- `api.js` - Định nghĩa các API endpoints

## Cách sử dụng

### 1. Environment Variables

Tạo các file `.env.*` ở root của project:

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_BASE_URL=http://localhost:5173
VITE_ENABLE_DEBUG=true

# .env.test
VITE_API_BASE_URL=https://api-test.example.com
VITE_BASE_URL=https://test.example.com
VITE_ENABLE_DEBUG=true

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_BASE_URL=https://example.com
VITE_ENABLE_DEBUG=false
```

### 2. Import và sử dụng

```javascript
// Import config
import { API_BASE_URL, IS_DEVELOPMENT, ENABLE_DEBUG } from '@/config/env'
import { API_ENDPOINTS } from '@/config/api'
import { httpClient } from '@/utils/http'

// Sử dụng API endpoint
const response = await httpClient.get(API_ENDPOINTS.COURSES.LIST)

// Hoặc dùng trực tiếp
const response = await fetch(`${API_BASE_URL}/api/courses`)
```

### 3. Môi trường

- **Development**: Mặc định khi chạy `npm run dev`
- **Test**: Chạy với `npm run build --mode test`
- **Production**: Chạy với `npm run build`

## Proxy Configuration

Trong `vite.config.js` đã cấu hình proxy để forward các request `/api/*` đến backend:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

Vì vậy trong code có thể dùng relative path:

```javascript
// Trong development, sẽ tự động proxy đến http://localhost:8080
fetch('/api/courses')
```

## HTTP Client

Sử dụng `httpClient` từ `src/utils/http.js` để gọi API:

```javascript
import { httpClient } from '@/utils/http'

// GET
const courses = await httpClient.get('/api/courses')

// POST
const newCourse = await httpClient.post('/api/courses', { title: '...' })

// Upload file
const formData = new FormData()
formData.append('file', file)
const result = await httpClient.upload('/api/upload', formData)
```
