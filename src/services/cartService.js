import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const cartService = {
  async getCart() {
    try {
      return await httpClient.get(API_ENDPOINTS.CART.GET)
    } catch (error) {
      console.error('Get cart error:', error)
      throw error
    }
  },

  async addItem(courseId) {
    try {
      return await httpClient.post(API_ENDPOINTS.CART.ADD, { courseId })
    } catch (error) {
      console.error('Add to cart error:', error)
      throw error
    }
  },

  async removeItem(courseId) {
    try {
      return await httpClient.post(API_ENDPOINTS.CART.REMOVE, { courseId })
    } catch (error) {
      console.error('Remove from cart error:', error)
      throw error
    }
  },

  async clearCart() {
    try {
      return await httpClient.post(API_ENDPOINTS.CART.CLEAR)
    } catch (error) {
      console.error('Clear cart error:', error)
      throw error
    }
  }
}
