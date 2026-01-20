import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const authService = {
  async login(username, password) {
    try {
      console.log('Login attempt:', { username, endpoint: API_ENDPOINTS.AUTH.LOGIN })
      const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        username,
        password
      })
      
      console.log('Login response:', response)
      
      // Lưu token
      if (response.token) {
        localStorage.setItem('token', response.token)
      }
      
      return response
    } catch (error) {
      console.error('Login error details:', {
        error,
        status: error.status,
        message: error.message,
        data: error.data
      })
      throw error
    }
  },

  async register(userData) {
    try {
      // RegisterRequest: username, email, password, fullName (optional), phoneNumber (optional)
      const response = await httpClient.post(API_ENDPOINTS.AUTH.REGISTER, userData)
      
      // Response là UserDTO, không có token trong register
      return response
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  },

  // Alias for backward compatibility
  async signup(userData) {
    return this.register(userData)
  },

  async logout() {
    try {
      // Swagger không có endpoint logout; FE chỉ cần xóa token local
      return true
    } catch (error) {
      console.error('Logout error:', error)
      return false
    } finally {
      localStorage.removeItem('token')
    }
  },

  // Swagger không có /auth/profile
}
