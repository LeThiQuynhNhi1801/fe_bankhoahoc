import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const orderService = {
  async getList() {
    try {
      return await httpClient.get(API_ENDPOINTS.ORDERS.LIST)
    } catch (error) {
      console.error('Get orders list error:', error)
      throw error
    }
  },

  async create(orderData) {
    try {
      return await httpClient.post(API_ENDPOINTS.ORDERS.CREATE, orderData)
    } catch (error) {
      console.error('Create order error:', error)
      throw error
    }
  },

  async getById(id) {
    try {
      return await httpClient.get(API_ENDPOINTS.ORDERS.DETAIL(id))
    } catch (error) {
      console.error('Get order detail error:', error)
      throw error
    }
  },

  async updateStatus(id, status) {
    try {
      return await httpClient.put(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id) + `?status=${status}`)
    } catch (error) {
      console.error('Update order status error:', error)
      throw error
    }
  },

  // NOTE: Admin order APIs dùng `adminService` (src/services/adminService.js)
}
