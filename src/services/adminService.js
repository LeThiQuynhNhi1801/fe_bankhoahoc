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

  async getStatistics() {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.STATISTICS)
    } catch (error) {
      console.error('Get admin statistics error:', error)
      throw error
    }
  },

  // NOTE: Swagger hiện không có API tạo admin riêng phía FE.

  // Users management
  async getAllUsers() {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.USERS)
    } catch (error) {
      console.error('Get all users error:', error)
      throw error
    }
  },

  async getUserById(userId) {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.USER_DETAIL(userId))
    } catch (error) {
      console.error('Get user detail error:', error)
      throw error
    }
  },

  async deleteUser(userId) {
    try {
      return await httpClient.delete(API_ENDPOINTS.ADMIN.DELETE_USER(userId))
    } catch (error) {
      console.error('Delete user error:', error)
      throw error
    }
  },

  async toggleUserStatus(userId) {
    try {
      return await httpClient.put(API_ENDPOINTS.ADMIN.TOGGLE_USER_STATUS(userId))
    } catch (error) {
      console.error('Toggle user status error:', error)
      throw error
    }
  },

  async updateUserRole(userId, role) {
    try {
      // Swagger: PUT /admin/users/{userId}/role?role=...
      return await httpClient.put(`${API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(userId)}?role=${encodeURIComponent(role)}`)
    } catch (error) {
      console.error('Update user role error:', error)
      throw error
    }
  },

  // Orders management (Admin)
  async getAllOrders() {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.ORDERS)
    } catch (error) {
      console.error('Get all orders (admin) error:', error)
      throw error
    }
  },

  async getOrderById(orderId) {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.ORDER_DETAIL(orderId))
    } catch (error) {
      console.error('Get order detail (admin) error:', error)
      throw error
    }
  },

  async getOrdersByStatus(status) {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.ORDERS_BY_STATUS(status))
    } catch (error) {
      console.error('Get orders by status (admin) error:', error)
      throw error
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      // Swagger: PUT /admin/orders/{orderId}/status?status=...
      return await httpClient.put(`${API_ENDPOINTS.ADMIN.UPDATE_ORDER_STATUS(orderId)}?status=${encodeURIComponent(status)}`)
    } catch (error) {
      console.error('Update order status (admin) error:', error)
      throw error
    }
  },

  async confirmOrder(orderId) {
    try {
      return await httpClient.put(API_ENDPOINTS.ADMIN.CONFIRM_ORDER(orderId))
    } catch (error) {
      console.error('Confirm order (admin) error:', error)
      throw error
    }
  },

  async cancelOrder(orderId) {
    try {
      return await httpClient.put(API_ENDPOINTS.ADMIN.CANCEL_ORDER(orderId))
    } catch (error) {
      console.error('Cancel order (admin) error:', error)
      throw error
    }
  },

  // Courses management
  async getAllCourses() {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.COURSES)
    } catch (error) {
      console.error('Get all courses (admin) error:', error)
      throw error
    }
  },

  async deleteCourse(courseId) {
    try {
      return await httpClient.delete(API_ENDPOINTS.ADMIN.DELETE_COURSE(courseId))
    } catch (error) {
      console.error('Delete course error:', error)
      throw error
    }
  }
}
