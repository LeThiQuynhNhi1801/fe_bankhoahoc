# Cấu hình Môi trường

## Tạo file .env

Tạo các file `.env.*` ở root của project:

### .env.development
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_BASE_URL=http://localhost:5173
VITE_ENABLE_DEBUG=true
```

### .env.test
```env
VITE_API_BASE_URL=https://api-test.example.com
VITE_BASE_URL=https://test.example.com
VITE_ENABLE_DEBUG=true
```

### .env.production
```env
VITE_API_BASE_URL=https://api.example.com
VITE_BASE_URL=https://example.com
VITE_ENABLE_DEBUG=false
```

## Cách sử dụng

### Development (Mặc định)
```bash
npm run dev
```
- Backend: http://localhost:8080
- Frontend: http://localhost:5173
- Proxy tự động forward `/api/*` đến backend

### Test
```bash
npm run dev:test
```

### Production Build
```bash
npm run build
npm run build:test  # Build cho test environment
```

## Sử dụng trong Code

```javascript
// Import config
import { API_BASE_URL, IS_DEVELOPMENT } from '@/config/env'
import { API_ENDPOINTS } from '@/config/api'
import { httpClient } from '@/utils/http'

// Ví dụ sử dụng
const courses = await httpClient.get(API_ENDPOINTS.COURSES.LIST)
```

## Proxy Configuration

Vite đã được cấu hình để proxy `/api/*` đến backend:
- Development: `http://localhost:8080`
- Có thể dùng relative path: `/api/courses`
