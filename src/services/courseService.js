import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const courseService = {
  async getList() {
    try {
      return await httpClient.get(API_ENDPOINTS.COURSES.LIST)
    } catch (error) {
      console.error('Get courses list error:', error)
      throw error
    }
  },

  async getById(id) {
    try {
      return await httpClient.get(API_ENDPOINTS.COURSES.DETAIL(id))
    } catch (error) {
      console.error('Get course detail error:', error)
      throw error
    }
  },

  async create(courseData) {
    try {
      return await httpClient.post(API_ENDPOINTS.COURSES.CREATE, courseData)
    } catch (error) {
      console.error('Create course error:', error)
      throw error
    }
  },

  async update(id, courseData) {
    try {
      return await httpClient.put(API_ENDPOINTS.COURSES.UPDATE(id), courseData)
    } catch (error) {
      console.error('Update course error:', error)
      throw error
    }
  },

  async delete(id) {
    try {
      return await httpClient.delete(API_ENDPOINTS.COURSES.DELETE(id))
    } catch (error) {
      console.error('Delete course error:', error)
      throw error
    }
  },

  async getMyCourses() {
    try {
      return await httpClient.get(API_ENDPOINTS.COURSES.MY_COURSES)
    } catch (error) {
      console.error('Get my courses error:', error)
      throw error
    }
  },

  async getByCategory(categoryId) {
    try {
      return await httpClient.get(API_ENDPOINTS.COURSES.BY_CATEGORY(categoryId))
    } catch (error) {
      console.error('Get courses by category error:', error)
      throw error
    }
  }
}
