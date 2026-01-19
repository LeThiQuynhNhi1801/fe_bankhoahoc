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
        <div class="courses-grid">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    
    const featuredCourses = ref([
      {
        id: 1,
        title: 'Lập Trình Web với Vue.js',
        instructor: 'Nguyễn Văn A',
        price: 499000,
        rating: 4.8,
        students: 1250,
        image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Vue.js'
      },
      {
        id: 2,
        title: 'Python Cho Người Mới Bắt Đầu',
        instructor: 'Trần Thị B',
        price: 399000,
        rating: 4.9,
        students: 2100,
        image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Python'
      },
      {
        id: 3,
        title: 'Thiết Kế UI/UX Chuyên Nghiệp',
        instructor: 'Lê Văn C',
        price: 599000,
        rating: 4.7,
        students: 890,
        image: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=UI/UX'
      },
      {
        id: 4,
        title: 'JavaScript Nâng Cao',
        instructor: 'Phạm Thị D',
        price: 549000,
        rating: 4.9,
        students: 1650,
        image: 'https://via.placeholder.com/300x200/EF4444/FFFFFF?text=JavaScript'
      }
    ])

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }

    const goToCourse = (id) => {
      router.push(`/course/${id}`)
    }

    return {
      featuredCourses,
      formatPrice,
      goToCourse
    }
  }
}
</script>
