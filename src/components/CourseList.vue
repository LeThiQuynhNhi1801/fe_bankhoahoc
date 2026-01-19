<template>
  <div class="course-list">
    <div class="container">
      <div class="page-header">
        <h1>Tất Cả Khóa Học</h1>
        <div class="search-filter">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm kiếm khóa học..."
            class="search-input"
          >
          <select v-model="selectedCategory" class="filter-select">
            <option value="">Tất cả danh mục</option>
            <option value="web">Lập trình Web</option>
            <option value="mobile">Lập trình Mobile</option>
            <option value="design">Thiết kế</option>
            <option value="data">Khoa học Dữ liệu</option>
          </select>
        </div>
      </div>

      <div class="courses-grid">
        <div 
          v-for="course in filteredCourses" 
          :key="course.id"
          class="course-card"
          @click="goToCourse(course.id)"
        >
          <div class="course-image">
            <img :src="course.image" :alt="course.title">
            <span class="course-price">{{ formatPrice(course.price) }}</span>
          </div>
          <div class="course-info">
            <span class="course-category">{{ course.category }}</span>
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-instructor">{{ course.instructor }}</p>
            <p class="course-description">{{ course.description }}</p>
            <div class="course-meta">
              <span>⭐ {{ course.rating }}</span>
              <span>👥 {{ course.students }} học viên</span>
              <span>⏱️ {{ course.duration }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredCourses.length === 0" class="no-results">
        <p>Không tìm thấy khóa học nào phù hợp.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'CourseList',
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const selectedCategory = ref('')

    const defaultCourses = [
      {
        id: 1,
        title: 'Lập Trình Web với Vue.js',
        instructor: 'Nguyễn Văn A',
        price: 499000,
        rating: 4.8,
        students: 1250,
        duration: '12 giờ',
        category: 'Lập trình Web',
        image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Vue.js',
        description: 'Học Vue.js từ cơ bản đến nâng cao, xây dựng ứng dụng web hiện đại'
      },
      {
        id: 2,
        title: 'Python Cho Người Mới Bắt Đầu',
        instructor: 'Trần Thị B',
        price: 399000,
        rating: 4.9,
        students: 2100,
        duration: '15 giờ',
        category: 'Lập trình Web',
        image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Python',
        description: 'Khóa học Python toàn diện cho người mới bắt đầu'
      },
      {
        id: 3,
        title: 'Thiết Kế UI/UX Chuyên Nghiệp',
        instructor: 'Lê Văn C',
        price: 599000,
        rating: 4.7,
        students: 890,
        duration: '20 giờ',
        category: 'Thiết kế',
        image: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=UI/UX',
        description: 'Học thiết kế giao diện người dùng chuyên nghiệp'
      },
      {
        id: 4,
        title: 'JavaScript Nâng Cao',
        instructor: 'Phạm Thị D',
        price: 549000,
        rating: 4.9,
        students: 1650,
        duration: '18 giờ',
        category: 'Lập trình Web',
        image: 'https://via.placeholder.com/300x200/EF4444/FFFFFF?text=JavaScript',
        description: 'Nắm vững JavaScript ES6+ và các kỹ thuật nâng cao'
      },
      {
        id: 5,
        title: 'React Native Cho Mobile',
        instructor: 'Hoàng Văn E',
        price: 649000,
        rating: 4.8,
        students: 980,
        duration: '25 giờ',
        category: 'Lập trình Mobile',
        image: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=React+Native',
        description: 'Xây dựng ứng dụng mobile với React Native'
      },
      {
        id: 6,
        title: 'Data Science với Python',
        instructor: 'Võ Thị F',
        price: 799000,
        rating: 4.9,
        students: 750,
        duration: '30 giờ',
        category: 'Khoa học Dữ liệu',
        image: 'https://via.placeholder.com/300x200/06B6D4/FFFFFF?text=Data+Science',
        description: 'Phân tích dữ liệu và machine learning với Python'
      }
    ]

    const allCourses = ref([...defaultCourses])

    const loadCourses = () => {
      const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      // Merge saved courses với default, ưu tiên saved courses
      const courseMap = new Map()
      
      // Thêm default courses
      defaultCourses.forEach(course => {
        courseMap.set(course.id, course)
      })
      
      // Override với saved courses
      savedCourses.forEach(course => {
        courseMap.set(course.id, course)
      })
      
      allCourses.value = Array.from(courseMap.values())
    }

    onMounted(() => {
      loadCourses()
      // Listen for custom event when new course is created
      window.addEventListener('coursesUpdated', loadCourses)
    })

    const filteredCourses = computed(() => {
      let filtered = allCourses.value

      if (selectedCategory.value) {
        const categoryMap = {
          'web': 'Lập trình Web',
          'mobile': 'Lập trình Mobile',
          'design': 'Thiết kế',
          'data': 'Khoa học Dữ liệu'
        }
        filtered = filtered.filter(course => 
          course.category === categoryMap[selectedCategory.value]
        )
      }

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(course =>
          course.title.toLowerCase().includes(query) ||
          course.instructor.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
        )
      }

      return filtered
    })

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
      searchQuery,
      selectedCategory,
      filteredCourses,
      formatPrice,
      goToCourse
    }
  }
}
</script>
