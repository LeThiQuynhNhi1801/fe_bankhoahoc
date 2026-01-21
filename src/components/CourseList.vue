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
          <select v-model="selectedCategory" class="filter-select" :disabled="isLoadingCategories">
            <option value="">Tất cả danh mục</option>
            <option 
              v-for="category in categories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </option>
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

      <div v-if="isLoading" class="loading">
        <p>Đang tải danh sách khóa học...</p>
      </div>

      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="loadCourses" class="btn btn-primary">Thử lại</button>
      </div>

      <div v-else-if="filteredCourses.length === 0" class="no-results">
        <p>Không tìm thấy khóa học nào phù hợp.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { courseService } from '../services/courseService'
import { categoryService } from '../services/categoryService'

export default {
  name: 'CourseList',
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const allCourses = ref([])
    const categories = ref([])
    const isLoading = ref(false)
    const isLoadingCategories = ref(false)
    const error = ref(null)

    const loadCourses = async () => {
      try {
        isLoading.value = true
        error.value = null
        
        // Nếu có category được chọn, load courses theo category
        const normalizeCourses = (response) => {
          if (Array.isArray(response)) return response
          return response?.data || response?.courses || response?.content || []
        }

        if (selectedCategory.value) {
          const response = await courseService.getByCategory(selectedCategory.value)
          console.log('[CourseList] getByCategory response:', response)
          allCourses.value = normalizeCourses(response)
        } else {
          const response = await courseService.getList()
          console.log('[CourseList] getList response:', response)
          allCourses.value = normalizeCourses(response)
        }

        console.log('[CourseList] loaded courses:', allCourses.value?.length)
      } catch (err) {
        console.error('Failed to load courses:', err)
        error.value = 'Không thể tải danh sách khóa học. Vui lòng thử lại sau.'
        allCourses.value = []
      } finally {
        isLoading.value = false
      }
    }

    const loadCategories = async () => {
      try {
        isLoadingCategories.value = true
        const response = await categoryService.getList()
        categories.value = Array.isArray(response) ? response : (response.data || [])
      } catch (err) {
        console.error('Failed to load categories:', err)
        categories.value = []
      } finally {
        isLoadingCategories.value = false
      }
    }

    onMounted(() => {
      loadCategories()
      loadCourses()
      // Listen for custom event when new course is created
      window.addEventListener('coursesUpdated', loadCourses)
    })

    // Watch category change để reload courses
    const filteredCourses = computed(() => {
      let filtered = allCourses.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(course =>
          course.title?.toLowerCase().includes(query) ||
          course.instructorName?.toLowerCase().includes(query) ||
          course.instructor?.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query)
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

    // Watch selectedCategory để reload courses khi category thay đổi
    watch(() => selectedCategory.value, () => {
      loadCourses()
    })

    return {
      searchQuery,
      selectedCategory,
      categories,
      filteredCourses,
      isLoading,
      isLoadingCategories,
      error,
      loadCourses,
      formatPrice,
      goToCourse
    }
  }
}
</script>
