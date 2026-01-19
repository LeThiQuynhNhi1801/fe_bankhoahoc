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
  <div v-else class="loading">
    <p>Đang tải...</p>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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

    const tabs = [
      { id: 'overview', label: 'Tổng Quan' },
      { id: 'curriculum', label: 'Nội Dung' },
      { id: 'reviews', label: 'Đánh Giá' }
    ]

    const coursesData = {
      1: {
        id: 1,
        title: 'Lập Trình Web với Vue.js',
        instructor: 'Nguyễn Văn A',
        price: 499000,
        originalPrice: 699000,
        rating: 4.8,
        reviews: 245,
        students: 1250,
        duration: '12 giờ',
        category: 'Lập trình Web',
        image: 'https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Vue.js',
        description: 'Khóa học toàn diện về Vue.js, từ cơ bản đến nâng cao. Bạn sẽ học cách xây dựng ứng dụng web hiện đại, tương tác với Vue 3 Composition API, Vue Router, và Vuex.',
        learningPoints: [
          'Hiểu rõ về Vue.js và các khái niệm cơ bản',
          'Xây dựng component và quản lý state',
          'Sử dụng Vue Router cho routing',
          'Tích hợp API và xử lý dữ liệu',
          'Deploy ứng dụng lên production'
        ],
        requirements: [
          'Kiến thức cơ bản về HTML, CSS, JavaScript',
          'Máy tính có kết nối internet',
          'Tinh thần học hỏi và kiên trì'
        ],
        chapters: [
          {
            title: 'Chương 1: Giới Thiệu Vue.js',
            lessons: [
              { title: 'Vue.js là gì?', duration: '15 phút' },
              { title: 'Cài đặt môi trường', duration: '20 phút' },
              { title: 'Tạo project đầu tiên', duration: '25 phút' }
            ],
            documents: [
              { name: 'Bai-giang-chuong-1.pdf', type: 'pdf', size: '2.5 MB' },
              { name: 'Slide-chuong-1.docx', type: 'word', size: '1.2 MB' },
              { name: 'Bai-tap-chuong-1.xlsx', type: 'excel', size: '500 KB' }
            ],
            videos: [
              { name: 'Video 1: Giới thiệu Vue.js', duration: '15:30', size: '125 MB' },
              { name: 'Video 2: Cài đặt môi trường', duration: '20:15', size: '180 MB' }
            ]
          },
          {
            title: 'Chương 2: Vue.js Cơ Bản',
            lessons: [
              { title: 'Template và Data Binding', duration: '30 phút' },
              { title: 'Directives', duration: '25 phút' },
              { title: 'Events và Methods', duration: '30 phút' }
            ],
            documents: [
              { name: 'Bai-giang-chuong-2.pdf', type: 'pdf', size: '3.1 MB' },
              { name: 'Code-mau-chuong-2.docx', type: 'word', size: '800 KB' }
            ],
            videos: [
              { name: 'Video 3: Template và Data Binding', duration: '30:45', size: '250 MB' },
              { name: 'Video 4: Directives trong Vue.js', duration: '25:20', size: '200 MB' }
            ]
          },
          {
            title: 'Chương 3: Components',
            lessons: [
              { title: 'Tạo và sử dụng Components', duration: '35 phút' },
              { title: 'Props và Events', duration: '30 phút' },
              { title: 'Slots', duration: '25 phút' }
            ],
            documents: [
              { name: 'Bai-giang-chuong-3.pdf', type: 'pdf', size: '2.8 MB' },
              { name: 'Vi-du-components.xlsx', type: 'excel', size: '600 KB' }
            ],
            videos: [
              { name: 'Video 5: Components trong Vue.js', duration: '35:10', size: '280 MB' },
              { name: 'Video 6: Props và Events', duration: '30:50', size: '240 MB' }
            ]
          }
        ],
        reviewsList: [
          {
            id: 1,
            user: 'Trần Văn X',
            rating: 5,
            comment: 'Khóa học rất hay, giảng viên giải thích dễ hiểu. Tôi đã học được rất nhiều!',
            date: '2024-01-15'
          },
          {
            id: 2,
            user: 'Nguyễn Thị Y',
            rating: 4,
            comment: 'Nội dung tốt, nhưng có một số phần cần giải thích chi tiết hơn.',
            date: '2024-01-10'
          }
        ],
        lastUpdated: 'Tháng 1, 2024'
      }
    }

    const loadCourse = () => {
      const courseId = parseInt(props.id)
      
      // Tải từ localStorage trước (khóa học mới)
      const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const savedCourse = savedCourses.find(c => c.id === courseId)
      
      if (savedCourse) {
        course.value = savedCourse
      } else {
        // Fallback về dữ liệu mặc định
        course.value = coursesData[courseId] || coursesData[1]
      }
      
      // Mở rộng chapter đầu tiên mặc định
      if (course.value && course.value.chapters) {
        expandedChapters[0] = true
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

    const addToCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existingItem = cart.find(item => item.id === course.value.id)
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        cart.push({
          id: course.value.id,
          title: course.value.title,
          price: course.value.price,
          image: course.value.image,
          quantity: 1
        })
      }
      
      localStorage.setItem('cart', JSON.stringify(cart))
      emit('add-to-cart')
      alert('Đã thêm vào giỏ hàng!')
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
