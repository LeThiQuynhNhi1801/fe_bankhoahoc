<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Học Tập Mọi Lúc, Mọi Nơi</h1>
          <p class="hero-subtitle">Khám phá hàng ngàn khóa học chất lượng cao từ các giảng viên hàng đầu</p>
          <router-link to="/courses" class="btn btn-primary">Khám Phá Ngay</router-link>
        </div>
      </div>
    </section>

    <section class="featured-courses">
      <div class="container">
        <h2 class="section-title">Khóa Học Nổi Bật</h2>
        <div v-if="isLoading" class="loading">
          <p>Đang tải khóa học...</p>
        </div>
        <div v-else-if="featuredCourses.length === 0" class="no-courses">
          <p>Chưa có khóa học nào.</p>
        </div>
        <div v-else class="courses-grid">
          <div 
            v-for="course in featuredCourses" 
            :key="course.id"
            class="course-card"
            @click="goToCourse(course.id)"
          >
            <div class="course-image">
              <img :src="course.image" :alt="course.title">
              <span class="course-price">{{ formatPrice(course.price) }}</span>
            </div>
            <div class="course-info">
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="course-instructor">{{ course.instructor }}</p>
              <div class="course-meta">
                <span>⭐ {{ course.rating }}</span>
                <span>👥 {{ course.students }} học viên</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">📚</div>
            <h3>Nội Dung Chất Lượng</h3>
            <p>Khóa học được biên soạn bởi các chuyên gia hàng đầu</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎯</div>
            <h3>Học Mọi Lúc</h3>
            <p>Truy cập khóa học bất cứ lúc nào, ở bất cứ đâu</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💼</div>
            <h3>Chứng Chỉ</h3>
            <p>Nhận chứng chỉ sau khi hoàn thành khóa học</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { courseService } from '../services/courseService'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const featuredCourses = ref([])
    const isLoading = ref(false)
    
    const loadFeaturedCourses = async () => {
      try {
        isLoading.value = true
        const response = await courseService.getList()
        // Lấy 4 khóa học đầu tiên làm featured
        const courses = Array.isArray(response) ? response : (response.data || response.courses || [])
        featuredCourses.value = courses.slice(0, 4).map(course => ({
          id: course.id,
          title: course.title,
          instructor: course.instructorName || course.instructor || 'N/A',
          price: course.price || 0,
          rating: course.rating || 0,
          students: course.studentCount || 0,
          image: course.thumbnail || course.image || 'https://via.placeholder.com/300x200'
        }))
      } catch (error) {
        console.error('Failed to load featured courses:', error)
        featuredCourses.value = []
      } finally {
        isLoading.value = false
      }
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }

    const goToCourse = (id) => {
      router.push(`/course/${id}`)
    }

    onMounted(() => {
      loadFeaturedCourses()
    })

    return {
      featuredCourses,
      isLoading,
      formatPrice,
      goToCourse
    }
  }
}
</script>
