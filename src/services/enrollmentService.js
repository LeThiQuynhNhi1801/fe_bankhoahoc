import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const enrollmentService = {
  async getMyEnrollments() {
    try {
      return await httpClient.get(API_ENDPOINTS.ENROLLMENTS.MY_ENROLLMENTS)
    } catch (error) {
      console.error('Get my enrollments error:', error)
      throw error
    }
  },

  async enroll(courseId) {
    try {
      return await httpClient.post(API_ENDPOINTS.ENROLLMENTS.ENROLL(courseId))
    } catch (error) {
      console.error('Enroll in course error:', error)
      throw error
    }
  },

  async getByCourse(courseId) {
    try {
      return await httpClient.get(API_ENDPOINTS.ENROLLMENTS.BY_COURSE(courseId))
    } catch (error) {
      console.error('Get enrollments by course error:', error)
      throw error
    }
  },

  async checkEnrollment(courseId) {
    try {
      return await httpClient.get(API_ENDPOINTS.ENROLLMENTS.CHECK + `?courseId=${courseId}`)
    } catch (error) {
      console.error('Check enrollment error:', error)
      throw error
    }
  },

  async updateProgress(id, progress) {
    try {
      return await httpClient.put(API_ENDPOINTS.ENROLLMENTS.UPDATE_PROGRESS(id) + `?progress=${progress}`)
    } catch (error) {
      console.error('Update enrollment progress error:', error)
      throw error
    }
  }
}
