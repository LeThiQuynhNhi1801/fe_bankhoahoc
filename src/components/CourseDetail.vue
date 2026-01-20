<template>
  <div class="course-detail" v-if="course">
    <div class="container">
      <div class="course-header">
        <div class="course-main-info">
          <span class="course-category">{{ course.category }}</span>
          <h1 class="course-title">{{ course.title }}</h1>
          <p class="course-instructor">Giảng viên: {{ course.instructor }}</p>
          <div class="course-stats">
            <span>⭐ {{ course.rating }} ({{ course.reviews }} đánh giá)</span>
            <span>👥 {{ course.students }} học viên</span>
            <span>⏱️ {{ course.duration }}</span>
            <span>📅 Cập nhật: {{ course.lastUpdated }}</span>
          </div>
        </div>
        <div class="course-sidebar">
          <div class="course-preview">
            <img :src="course.image" :alt="course.title">
          </div>
          <div class="course-purchase">
            <div class="price-section">
              <span class="price">{{ formatPrice(course.price) }}</span>
              <span v-if="course.originalPrice" class="original-price">
                {{ formatPrice(course.originalPrice) }}
              </span>
            </div>
            <button @click="addToCart" class="btn btn-primary btn-large">
              Thêm Vào Giỏ Hàng
            </button>
            <button @click="buyNow" class="btn btn-secondary btn-large">
              Mua Ngay
            </button>
            <div class="guarantee">
              <p>✅ 30 ngày hoàn tiền</p>
              <p>✅ Truy cập trọn đời</p>
              <p>✅ Chứng chỉ hoàn thành</p>
            </div>
          </div>

        </div>
      </div>

      <div class="course-content">
        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'overview'" class="tab-panel">
            <h2>Mô Tả Khóa Học</h2>
            <p>{{ course.description }}</p>
            <h3>Bạn Sẽ Học Được Gì?</h3>
            <ul class="learning-points">
              <li v-for="point in course.learningPoints" :key="point">
                {{ point }}
              </li>
            </ul>
            <h3>Yêu Cầu</h3>
            <ul class="requirements">
              <li v-for="req in course.requirements" :key="req">
                {{ req }}
              </li>
            </ul>
          </div>

          <div v-if="activeTab === 'curriculum'" class="tab-panel">
            <h2>Nội Dung Khóa Học</h2>
            <div class="curriculum">
              <div 
                v-for="(chapter, chapterIndex) in course.chapters" 
                :key="chapterIndex"
                class="curriculum-chapter"
              >
                <div class="chapter-header" @click="toggleChapter(chapterIndex)">
                  <h3>{{ chapter.title }}</h3>
                  <span class="chapter-toggle">{{ expandedChapters[chapterIndex] ? '▼' : '▶' }}</span>
                </div>
                
                <div v-if="expandedChapters[chapterIndex]" class="chapter-content">
                  <!-- Lessons/Bài học -->
                  <div v-if="chapter.lessons && chapter.lessons.length > 0" class="chapter-section">
                    <h4>📚 Bài Học</h4>
                    <div class="lessons">
                      <div 
                        v-for="(lesson, lessonIndex) in chapter.lessons" 
                        :key="lessonIndex"
                        class="lesson-item"
                      >
                        <span class="lesson-number">{{ lessonIndex + 1 }}</span>
                        <span class="lesson-title">{{ lesson.title }}</span>
                        <span class="lesson-duration">{{ lesson.duration }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Documents/Tài liệu -->
                  <div v-if="chapter.documents && chapter.documents.length > 0" class="chapter-section">
                    <h4>📄 Tài Liệu</h4>
                    <div class="documents-grid">
                      <div 
                        v-for="(doc, docIndex) in chapter.documents" 
                        :key="docIndex"
                        class="document-item"
                      >
                        <div class="document-icon">{{ getDocumentIcon(doc.type) }}</div>
                        <div class="document-info">
                          <p class="document-name">{{ doc.name }}</p>
                          <p class="document-meta">{{ doc.size }} • {{ doc.type.toUpperCase() }}</p>
                        </div>
                        <button @click="downloadDocument(doc)" class="btn-download">⬇ Tải xuống</button>
                      </div>
                    </div>
                  </div>

                  <!-- Videos -->
                  <div v-if="chapter.videos && chapter.videos.length > 0" class="chapter-section">
                    <h4>🎥 Video</h4>
                    <div class="videos-grid">
                      <div 
                        v-for="(video, videoIndex) in chapter.videos" 
                        :key="videoIndex"
                        class="video-item"
                      >
                        <div class="video-icon">🎥</div>
                        <div class="video-info">
                          <p class="video-name">{{ video.name }}</p>
                          <p class="video-meta">{{ video.duration }} • {{ video.size }}</p>
                        </div>
                        <button @click="playVideo(video)" class="btn-play">▶ Xem</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'reviews'" class="tab-panel">
            <h2>Đánh Giá</h2>
            <div class="reviews">
              <div 
                v-for="review in course.reviewsList" 
                :key="review.id"
                class="review-item"
              >
                <div class="review-header">
                  <strong>{{ review.user }}</strong>
                  <div class="review-rating">
                    ⭐ {{ review.rating }}/5
                  </div>
                </div>
                <p>{{ review.comment }}</p>
                <span class="review-date">{{ review.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="isLoading" class="loading">
    <p>Đang tải...</p>
  </div>
  <div v-else-if="error" class="error-message">
    <p>{{ error }}</p>
    <button @click="loadCourse" class="btn btn-primary">Thử lại</button>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { courseService } from '../services/courseService'
import { chapterService } from '../services/chapterService'

export default {
  name: 'CourseDetail',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['add-to-cart'],
  setup(props, { emit }) {
    const route = useRoute()
    const router = useRouter()
    const course = ref(null)
    const activeTab = ref('overview')
    const expandedChapters = reactive({})
    const isLoading = ref(false)
    const error = ref(null)

    const tabs = [
      { id: 'overview', label: 'Tổng Quan' },
      { id: 'curriculum', label: 'Nội Dung' },
      { id: 'reviews', label: 'Đánh Giá' }
    ]


    const loadCourse = async () => {
      try {
        isLoading.value = true
        error.value = null
        const courseId = parseInt(props.id)
        
        const courseData = await courseService.getById(courseId)
        
        // Load chapters if not included
        if (!courseData.chapters || courseData.chapters.length === 0) {
          try {
            const chapters = await chapterService.getList(courseId)
            courseData.chapters = chapters
          } catch (err) {
            console.warn('Could not load chapters:', err)
            courseData.chapters = []
          }
        }
        
        course.value = courseData
        
        // Mở rộng chapter đầu tiên mặc định
        if (course.value && course.value.chapters && course.value.chapters.length > 0) {
          expandedChapters[0] = true
        }
      } catch (err) {
        console.error('Failed to load course:', err)
        error.value = 'Không thể tải thông tin khóa học. Vui lòng thử lại sau.'
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      loadCourse()
    })

    const toggleChapter = (index) => {
      expandedChapters[index] = !expandedChapters[index]
    }

    const getDocumentIcon = (type) => {
      const icons = {
        pdf: '📕',
        word: '📄',
        excel: '📊',
        video: '🎥'
      }
      return icons[type] || '📁'
    }

    const downloadDocument = (doc) => {
      alert(`Đang tải xuống: ${doc.name}`)
      // Trong thực tế sẽ có logic download file
    }

    const playVideo = (video) => {
      alert(`Đang phát video: ${video.name}`)
      // Trong thực tế sẽ mở video player
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }

    const addToCart = async () => {
      try {
        const { cartService } = await import('../services/cartService')
        await cartService.addItem(course.value.id)
        emit('add-to-cart')
        alert('Đã thêm vào giỏ hàng!')
      } catch (error) {
        console.error('Failed to add to cart:', error)
        alert('Không thể thêm vào giỏ hàng. Vui lòng đăng nhập!')
      }
    }

    const buyNow = () => {
      addToCart()
      router.push('/checkout')
    }


    return {
      course,
      tabs,
      activeTab,
      expandedChapters,
      isLoading,
      error,
      loadCourse,
      toggleChapter,
      getDocumentIcon,
      downloadDocument,
      playVideo,
      formatPrice,
      addToCart,
      buyNow
    }
  }
}
</script>
