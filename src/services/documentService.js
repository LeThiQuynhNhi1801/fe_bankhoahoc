import { httpClient } from '../utils/http'
import { API_ENDPOINTS } from '../config/api'

export const documentService = {
  async upload(courseId, chapterId, formData) {
    try {
      return await httpClient.upload(API_ENDPOINTS.DOCUMENTS.UPLOAD(courseId, chapterId), formData)
    } catch (error) {
      console.error('Upload document error:', error)
      // Nếu 404 thì báo rõ API chưa có trong backend/Swagger
      if (error.status === 404) {
        throw { ...error, message: 'API upload tài liệu chưa có trong backend/Swagger (404)' }
      }
      throw error
    }
  },

  async delete(courseId, chapterId, docId) {
    try {
      return await httpClient.delete(API_ENDPOINTS.DOCUMENTS.DELETE(courseId, chapterId, docId))
    } catch (error) {
      console.error('Delete document error:', error)
      throw error
    }
  },

  async download(courseId, chapterId, docId) {
    try {
      const url = API_ENDPOINTS.DOCUMENTS.DOWNLOAD(courseId, chapterId, docId)
      const token = localStorage.getItem('token')
      
      const response = await fetch(url, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = docId
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      
      return true
    } catch (error) {
      console.error('Download document error:', error)
      throw error
    }
  }
}
