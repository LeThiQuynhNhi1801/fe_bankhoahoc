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
    LIST_BY_COURSE: (courseId) => getApiPath(`/api/courses/${courseId}/chapters`), // Alternative endpoint
    CREATE: getApiPath('/api/chapters'),
    CREATE_BY_COURSE: (courseId) => getApiPath(`/api/courses/${courseId}/chapters`), // Alternative endpoint
    GET: (id) => getApiPath(`/api/chapters/${id}`),
    UPDATE: (id) => getApiPath(`/api/chapters/${id}`),
    DELETE: (id) => getApiPath(`/api/chapters/${id}`)
  },
  
  // Documents API - riêng biệt với Videos
  // Documents được upload trực tiếp vào chapter (PDF, Word, Excel, etc.)
  DOCUMENTS: {
    UPLOAD: (chapterId) => getApiPath(`/api/chapters/${chapterId}/documents`),
    // Note: Có thể không có DELETE/DOWNLOAD endpoints riêng, cần kiểm tra Swagger
  },
  
  // Files API - để tải và xem file
  FILES: {
    DOWNLOAD: getApiPath('/api/files/download'), // Admin/Instructor only
    GET_CHAPTER_DOCUMENT: (chapterId) => getApiPath(`/api/files/chapters/${chapterId}/document`) // Student only
  },
  
  // Learning API - dành cho học viên
  LEARNING: {
    GET_COURSE_CHAPTERS: (courseId) => getApiPath(`/api/learning/courses/${courseId}/chapters`),
    GET_CHAPTER_DETAIL: (chapterId) => getApiPath(`/api/learning/chapters/${chapterId}`),
    GET_CHAPTER_CONTENTS: (chapterId) => getApiPath(`/api/learning/chapters/${chapterId}/contents`),
    GET_CONTENT_DETAIL: (contentId) => getApiPath(`/api/learning/contents/${contentId}`)
  },
  
  // Course Content API - quản lý nội dung (Admin/Instructor)
  COURSE_CONTENTS: {
    GET: (contentId) => getApiPath(`/api/course-contents/${contentId}`),
    GET_BY_CHAPTER: (chapterId) => getApiPath(`/api/course-contents/chapters/${chapterId}`),
    CREATE: (chapterId) => getApiPath(`/api/course-contents/chapters/${chapterId}`),
    UPDATE: (contentId) => getApiPath(`/api/course-contents/${contentId}`),
    DELETE: (contentId) => getApiPath(`/api/course-contents/${contentId}`)
  },
  
  // Videos API - riêng biệt với Documents
  // Videos được upload vào course-content (nội dung học tập)
  VIDEOS: {
    UPLOAD: (contentId) => getApiPath(`/api/course-contents/${contentId}/video`)
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
    STATS: getApiPath('/api/admin/stats'),
    STATISTICS: getApiPath('/api/admin/statistics'),
    // Users management
    USERS: getApiPath('/api/admin/users'),
    USER_DETAIL: (userId) => getApiPath(`/api/admin/users/${userId}`),
    DELETE_USER: (userId) => getApiPath(`/api/admin/users/${userId}`),
    TOGGLE_USER_STATUS: (userId) => getApiPath(`/api/admin/users/${userId}/toggle-status`),
    UPDATE_USER_ROLE: (userId) => getApiPath(`/api/admin/users/${userId}/role`),
    // Orders management
    ORDERS: getApiPath('/api/admin/orders'),
    ORDER_DETAIL: (orderId) => getApiPath(`/api/admin/orders/${orderId}`),
    ORDERS_BY_STATUS: (status) => getApiPath(`/api/admin/orders/status/${status}`),
    UPDATE_ORDER_STATUS: (orderId) => getApiPath(`/api/admin/orders/${orderId}/status`),
    CONFIRM_ORDER: (orderId) => getApiPath(`/api/admin/orders/${orderId}/confirm`),
    CANCEL_ORDER: (orderId) => getApiPath(`/api/admin/orders/${orderId}/cancel`),
    // Courses management
    COURSES: getApiPath('/api/admin/courses'),
    DELETE_COURSE: (courseId) => getApiPath(`/api/admin/courses/${courseId}`)
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
