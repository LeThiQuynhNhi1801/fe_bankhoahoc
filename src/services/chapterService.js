import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const chapterService = {
  async getList(courseId) {
    try {
      return await httpClient.get(API_ENDPOINTS.CHAPTERS.LIST(courseId))
    } catch (error) {
      console.error('Get chapters list error:', error)
      throw error
    }
  },

  async getById(id) {
    try {
      return await httpClient.get(API_ENDPOINTS.CHAPTERS.GET(id))
    } catch (error) {
      console.error('Get chapter by id error:', error)
      throw error
    }
  },

  async create(chapterData) {
    try {
      // ChapterCreateDTO: courseId, title, orderIndex (required), description, isPublished
      return await httpClient.post(API_ENDPOINTS.CHAPTERS.CREATE, chapterData)
    } catch (error) {
      console.error('Create chapter error:', error)
      throw error
    }
  },

  async update(id, chapterData) {
    try {
      return await httpClient.put(API_ENDPOINTS.CHAPTERS.UPDATE(id), chapterData)
    } catch (error) {
      console.error('Update chapter error:', error)
      throw error
    }
  },

  async delete(id) {
    try {
      return await httpClient.delete(API_ENDPOINTS.CHAPTERS.DELETE(id))
    } catch (error) {
      console.error('Delete chapter error:', error)
      throw error
    }
  }
}
