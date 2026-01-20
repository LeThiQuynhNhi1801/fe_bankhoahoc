import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const categoryService = {
  async getList() {
    try {
      return await httpClient.get(API_ENDPOINTS.CATEGORIES.LIST)
    } catch (error) {
      console.error('Get categories list error:', error)
      throw error
    }
  }
}
