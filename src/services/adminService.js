import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const adminService = {
  async getStats() {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.STATS)
    } catch (error) {
      console.error('Get admin stats error:', error)
      throw error
    }
  },

  async createAdmin(userData) {
    try {
      return await httpClient.post(`${API_ENDPOINTS.AUTH.SIGNUP}?role=admin`, userData)
    } catch (error) {
      console.error('Create admin error:', error)
      throw error
    }
  }
}
