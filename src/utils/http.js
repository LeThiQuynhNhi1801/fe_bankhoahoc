import { API_BASE_URL, ENABLE_DEBUG } from '../config/env.js'

// HTTP Client wrapper
class HttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  async request(url, options = {}) {
    const token = localStorage.getItem('token')
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    }

    // Nếu URL là absolute URL (bắt đầu bằng http) thì dùng trực tiếp
    // Ngược lại thì thêm baseURL
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url.startsWith('/') ? url : '/' + url}`

    // Log token info (không log toàn bộ token vì bảo mật)
    if (token) {
      console.log(`[API] ${config.method || 'GET'} ${fullUrl}`)
      console.log('[API] Token exists:', !!token, 'Token preview:', token.substring(0, 20) + '...')
      // Decode token để xem role
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('[API] Token payload:', { 
          role: payload.role, 
          username: payload.username || payload.sub,
          exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A'
        })
      } catch (e) {
        console.warn('[API] Could not decode token:', e)
      }
    } else {
      console.warn(`[API] ${config.method || 'GET'} ${fullUrl} - NO TOKEN!`)
    }

    if (ENABLE_DEBUG) {
      console.log(`[API] Request config:`, { ...config, headers: { ...config.headers, Authorization: config.headers.Authorization ? 'Bearer ***' : undefined } })
    }

    try {
      const response = await fetch(fullUrl, config)
      
      // Parse response
      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch (e) {
          // Nếu không parse được JSON, đọc text
          data = await response.text()
        }
      } else {
        data = await response.text()
      }

      // Xử lý lỗi authentication/authorization
      if (response.status === 401) {
        console.error('[API] 401 Unauthorized:', {
          url: fullUrl,
          method: config.method,
          message: 'Token không hợp lệ hoặc đã hết hạn'
        })
        // KHÔNG tự động xóa token ở đây, để component tự quyết định
        // Chỉ throw error để component xử lý
      }
      
      if (response.status === 403) {
        console.error('[API] 403 Forbidden:', {
          url: fullUrl,
          method: config.method,
          headers: config.headers,
          responseHeaders: [...response.headers.entries()],
          message: 'Không có quyền truy cập'
        })
        // KHÔNG tự động xóa token ở đây
      }

      if (!response.ok) {
        const error = {
          status: response.status,
          statusText: response.statusText,
          data,
          response: {
            status: response.status,
            statusText: response.statusText,
            data
          }
        }
        // Add message if available
        if (data?.message) {
          error.message = data.message
        } else if (typeof data === 'string') {
          error.message = data
        } else {
          error.message = `HTTP ${response.status}: ${response.statusText}`
        }
        throw error
      }

      if (ENABLE_DEBUG) {
        console.log(`[API] Response:`, data)
      }

      return data
    } catch (error) {
      if (ENABLE_DEBUG) {
        console.error(`[API] Error:`, error)
      }
      throw error
    }
  }

  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' })
  }

  post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' })
  }

  // Upload file
  async upload(url, formData, options = {}) {
    const token = localStorage.getItem('token')
    
    const config = {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
        // Không set Content-Type để browser tự set với boundary
      },
      body: formData,
      ...options
    }

    // Nếu URL là absolute URL thì dùng trực tiếp, ngược lại thêm baseURL
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url.startsWith('/') ? url : '/' + url}`

    if (ENABLE_DEBUG) {
      console.log(`[API] UPLOAD ${fullUrl}`, formData)
    }

    try {
      const response = await fetch(fullUrl, config)
      const data = await response.json()

      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          data
        }
      }

      if (ENABLE_DEBUG) {
        console.log(`[API] Upload Response:`, data)
      }

      return data
    } catch (error) {
      if (ENABLE_DEBUG) {
        console.error(`[API] Upload Error:`, error)
      }
      throw error
    }
  }
}

// Export singleton instance
export const httpClient = new HttpClient(API_BASE_URL)

// Export class để có thể tạo instance khác nếu cần
export default HttpClient
