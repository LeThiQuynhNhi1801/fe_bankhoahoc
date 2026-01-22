<template>
  <div class="my-courses">
    <div class="container">
      <div class="header">
        <h1>Khóa Học Của Tôi</h1>
        <p class="subtitle">Tiếp tục học tập và hoàn thành khóa học của bạn</p>
      </div>

      <div v-if="isLoading" class="loading">
        <p>Đang tải khóa học...</p>
      </div>

      <div v-else-if="error" class="error">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <p class="error-message">{{ error }}</p>
          <p v-if="errorDetails" class="error-details">{{ errorDetails }}</p>
          <div class="error-actions">
            <button @click="loadCourses" class="btn-retry">Thử lại</button>
            <router-link v-if="isAuthError" to="/login" class="btn-login">Đăng nhập lại</router-link>
          </div>
        </div>
      </div>

      <div v-else-if="enrollments.length === 0" class="no-courses">
        <div class="empty-state">
          <div class="empty-icon">📚</div>
          <h2>Bạn chưa có khóa học nào</h2>
          <p>Hãy khám phá và mua khóa học để bắt đầu học tập!</p>
          <router-link to="/courses" class="btn-explore">Khám phá khóa học</router-link>
        </div>
      </div>

      <div v-else class="courses-grid">
        <div 
          v-for="enrollment in enrollments" 
          :key="enrollment.id"
          class="course-card"
        >
          <div class="course-image">
            <img 
              :src="enrollment.course?.thumbnail || enrollment.course?.imageUrl || 'https://via.placeholder.com/300x200?text=Khóa+Học'" 
              :alt="enrollment.course?.title"
            />
            <div class="progress-overlay">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${enrollment.progress || 0}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ enrollment.progress || 0 }}% hoàn thành</span>
            </div>
          </div>
          <div class="course-info">
            <h3>{{ enrollment.course?.title || 'Khóa học' }}</h3>
            <p class="course-description">
              {{ enrollment.course?.description || 'Chưa có mô tả' }}
            </p>
            <div class="course-meta">
              <span class="meta-item">📅 Đăng ký: {{ formatDate(enrollment.enrolledAt) }}</span>
              <span v-if="enrollment.lastAccessedAt" class="meta-item">
                🕐 Truy cập lần cuối: {{ formatDate(enrollment.lastAccessedAt) }}
              </span>
            </div>
            <div class="course-actions">
              <template v-if="getCourseId(enrollment)">
                <router-link 
                  :to="`/learning/${getCourseId(enrollment)}`" 
                  class="btn-continue"
                >
                  {{ enrollment.progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học' }}
                </router-link>
                <router-link 
                  :to="`/course/${getCourseId(enrollment)}`" 
                  class="btn-view"
                >
                  Xem chi tiết
                </router-link>
              </template>
              <span v-else class="btn-disabled">Không có thông tin khóa học</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { enrollmentService } from '../services/enrollmentService'

export default {
  name: 'MyCourses',
  setup() {
    const enrollments = ref([])
    const isLoading = ref(false)
    const error = ref(null)
    const errorDetails = ref(null)
    const isAuthError = ref(false)

    const loadCourses = async () => {
      try {
        isLoading.value = true
        error.value = null
        console.log('Loading my enrollments...')
        const response = await enrollmentService.getMyEnrollments()
        console.log('Enrollments response:', response)
        
        // Handle different response formats
        let data = null
        if (Array.isArray(response)) {
          data = response
        } else if (response?.data) {
          data = Array.isArray(response.data) ? response.data : (response.data.content || [])
        } else if (response?.content) {
          data = Array.isArray(response.content) ? response.content : []
        } else {
          data = []
        }
        
        console.log('Processed enrollments data:', data)
        
        // Process enrollments - ensure we have courseId
        enrollments.value = (data || []).map(enrollment => {
          // Get courseId from either course.id or courseId field
          const courseId = enrollment.course?.id || enrollment.courseId
          
          // If we have courseId but no course object, add it
          if (courseId && !enrollment.course) {
            enrollment.course = { id: courseId }
          }
          
          // If we have course object but no id, try to get from courseId
          if (enrollment.course && !enrollment.course.id && enrollment.courseId) {
            enrollment.course.id = enrollment.courseId
          }
          
          return enrollment
        }).filter(enrollment => {
          // Filter out enrollments without valid courseId
          const courseId = enrollment.course?.id || enrollment.courseId
          const isValid = courseId && !isNaN(parseInt(courseId)) && parseInt(courseId) > 0
          if (!isValid) {
            console.warn('Invalid enrollment found (no valid courseId):', enrollment)
          }
          return isValid
        })
        
        // If enrollments have courseId but missing course details, load them in parallel
        const courseService = (await import('../services/courseService')).courseService
        const courseLoadPromises = enrollments.value.map(async (enrollment) => {
          const courseId = enrollment.course?.id || enrollment.courseId
          if (courseId && (!enrollment.course || !enrollment.course.title)) {
            try {
              const courseResponse = await courseService.getById(parseInt(courseId))
              const courseData = courseResponse?.data ?? courseResponse
              if (courseData) {
                enrollment.course = { ...enrollment.course, ...courseData, id: parseInt(courseId) }
              }
            } catch (err) {
              console.warn(`Could not load course ${courseId} details:`, err)
              // Keep enrollment but ensure course has id
              if (!enrollment.course) {
                enrollment.course = { id: parseInt(courseId) }
              }
            }
          }
        })
        
        // Wait for all course details to load
        await Promise.allSettled(courseLoadPromises)
        
        if (enrollments.value.length === 0) {
          console.log('No valid enrollments found')
        }
      } catch (err) {
        console.error('Load my courses error:', err)
        
        // Check for authentication errors
        if (err?.status === 401 || err?.status === 403) {
          isAuthError.value = true
          error.value = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
          errorDetails.value = 'Bạn cần đăng nhập để xem khóa học của mình.'
        } else {
          isAuthError.value = false
          const errorMessage = err?.data?.message || err?.message || 'Không thể tải danh sách khóa học. Vui lòng thử lại sau.'
          error.value = errorMessage
          
          // Add error details for debugging
          if (err?.status) {
            errorDetails.value = `Mã lỗi: ${err.status} - ${err.statusText || 'Unknown error'}`
          } else if (err?.message) {
            errorDetails.value = err.message
          }
        }
        
        // Log more details for debugging
        if (err?.status) {
          console.error('Error status:', err.status)
          console.error('Error statusText:', err.statusText)
        }
        if (err?.data) {
          console.error('Error data:', err.data)
        }
      } finally {
        isLoading.value = false
      }
    }

    const getCourseId = (enrollment) => {
      const courseId = enrollment.course?.id || enrollment.courseId
      if (!courseId) return null
      const id = parseInt(courseId)
      return (id && !isNaN(id) && id > 0) ? id : null
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    onMounted(() => {
      loadCourses()
    })

    return {
      enrollments,
      isLoading,
      error,
      errorDetails,
      isAuthError,
      loadCourses,
      getCourseId,
      formatDate
    }
  }
}
</script>

<style scoped>
.my-courses {
  padding: 2rem 0;
  min-height: calc(100vh - 200px);
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.loading, .error, .no-courses {
  text-align: center;
  padding: 3rem;
}

.error {
  color: #dc3545;
}

.error-content {
  max-width: 500px;
  margin: 0 auto;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.error-details {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-retry {
  padding: 0.5rem 1.5rem;
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-retry:hover {
  background: #4338CA;
}

.btn-login {
  padding: 0.5rem 1.5rem;
  background: #10b981;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  display: inline-block;
  transition: background 0.3s;
}

.btn-login:hover {
  background: #059669;
}

.empty-state {
  max-width: 500px;
  margin: 0 auto;
  padding: 3rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 2rem;
}

.btn-explore {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #4F46E5;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-explore:hover {
  background: #4338CA;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.course-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.course-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.progress-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 1rem;
  color: white;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.course-info {
  padding: 1.5rem;
}

.course-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.meta-item {
  color: #666;
  font-size: 0.875rem;
}

.course-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-continue {
  flex: 1;
  padding: 0.75rem;
  background: #4F46E5;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-continue:hover {
  background: #4338CA;
}

.btn-view {
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-view:hover {
  background: #e5e7eb;
}

.btn-disabled {
  flex: 1;
  padding: 0.75rem;
  background: #d1d5db;
  color: #6b7280;
  text-align: center;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: not-allowed;
}
</style>
