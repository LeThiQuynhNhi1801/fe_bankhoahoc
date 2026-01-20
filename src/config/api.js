import { API_BASE_URL } from './env.js'

// Luôn dùng absolute URL trực tiếp đến backend (port 8080)
const getApiPath = (path) => {
  return `${API_BASE_URL}${path}`
}

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: getApiPath('/api/auth/login'),
    REGISTER: getApiPath('/api/auth/register'),
    // NOTE: Swagger hiện không có /auth/logout hoặc /auth/profile
  },
  
  // Courses
  COURSES: {
    LIST: getApiPath('/api/courses'), // All courses
    DETAIL: (id) => getApiPath(`/api/courses/${id}`), // Course detail
    CREATE: getApiPath('/api/courses'),
    UPDATE: (id) => getApiPath(`/api/courses/${id}`),
    DELETE: (id) => getApiPath(`/api/courses/${id}`),
    MY_COURSES: getApiPath('/api/courses/my-courses'),
    SEARCH: getApiPath('/api/courses/search'),
    BY_CATEGORY: (categoryId) => getApiPath(`/api/courses/category/${categoryId}`)
  },
  
  // Chapters
  CHAPTERS: {
    LIST: (courseId) => getApiPath(`/api/chapters/course/${courseId}`),
    CREATE: getApiPath('/api/chapters'),
    GET: (id) => getApiPath(`/api/chapters/${id}`),
    UPDATE: (id) => getApiPath(`/api/chapters/${id}`),
    DELETE: (id) => getApiPath(`/api/chapters/${id}`)
  },
  
  // Documents
  DOCUMENTS: {
    UPLOAD: (courseId, chapterId) => getApiPath(`/api/courses/${courseId}/chapters/${chapterId}/documents`),
    DELETE: (courseId, chapterId, docId) => getApiPath(`/api/courses/${courseId}/chapters/${chapterId}/documents/${docId}`),
    DOWNLOAD: (courseId, chapterId, docId) => getApiPath(`/api/courses/${courseId}/chapters/${chapterId}/documents/${docId}/download`)
  },
  
  // Orders
  ORDERS: {
    LIST: getApiPath('/api/orders/my-orders'),
    CREATE: getApiPath('/api/orders'),
    DETAIL: (id) => getApiPath(`/api/orders/${id}`),
    UPDATE_STATUS: (id) => getApiPath(`/api/orders/${id}/status`)
  },
  
  // Cart
  CART: {
    GET: getApiPath('/api/cart'),
    ADD: getApiPath('/api/cart/add'),
    REMOVE: getApiPath('/api/cart/remove'),
    CLEAR: getApiPath('/api/cart/clear')
  },
  
  // Users
  USERS: {
    LIST: getApiPath('/api/users'),
    DETAIL: (id) => getApiPath(`/api/users/${id}`),
    UPDATE: (id) => getApiPath(`/api/users/${id}`)
  },
  
  // Categories
  CATEGORIES: {
    LIST: getApiPath('/api/categories'),
    GET: (id) => getApiPath(`/api/categories/${id}`),
    CREATE: getApiPath('/api/categories'),
    UPDATE: (id) => getApiPath(`/api/categories/${id}`),
    DELETE: (id) => getApiPath(`/api/categories/${id}`)
  },
  
  // Admin
  ADMIN: {
    STATS: getApiPath('/api/admin/stats')
  },
  
  // Enrollments
  ENROLLMENTS: {
    MY_ENROLLMENTS: getApiPath('/api/enrollments/my-enrollments'),
    ENROLL: (courseId) => getApiPath(`/api/enrollments/enroll/${courseId}`),
    BY_COURSE: (courseId) => getApiPath(`/api/enrollments/course/${courseId}`),
    CHECK: getApiPath('/api/enrollments/check'),
    UPDATE_PROGRESS: (id) => getApiPath(`/api/enrollments/${id}/progress`)
  }
}

// Helper function để tạo API request
export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }
  
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  }
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

// Helper function để upload file
export const apiUpload = async (url, formData) => {
  const token = localStorage.getItem('token')
  
  const config = {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
      // Không set Content-Type để browser tự set với boundary cho multipart/form-data
    },
    body: formData
  }
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`Upload Error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Upload Error:', error)
    throw error
  }
}

export default API_ENDPOINTS
