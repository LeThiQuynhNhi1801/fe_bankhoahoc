<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <router-link to="/" class="logo">
            <h1>🎓 Học Online</h1>
          </router-link>
          <nav class="nav">
            <router-link to="/">Trang Chủ</router-link>
            <router-link to="/courses">Khóa Học</router-link>
            <router-link v-if="isAuthenticated" to="/my-courses">Khóa Học Của Tôi</router-link>
            <router-link to="/cart" class="cart-link">
              Giỏ Hàng
              <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
            </router-link>
            
            <!-- Menu cho Admin -->
            <template v-if="isAdmin">
              <router-link to="/admin">Quản Trị</router-link>
              <router-link to="/admin/create-course">Tạo Khóa Học</router-link>
              <router-link to="/admin/upload">Upload Tài Liệu</router-link>
            </template>

            <!-- Menu cho Teacher -->
            <template v-if="isTeacher">
              <router-link to="/admin/upload">Upload Tài Liệu</router-link>
            </template>

            <!-- User Menu -->
            <div v-if="isAuthenticated" class="user-menu">
              <span class="user-name">{{ userName }}</span>
              <button @click="handleLogout" class="btn-logout">Đăng Xuất</button>
            </div>
            <router-link v-else to="/login" class="btn-login">Đăng Nhập</router-link>
          </nav>
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view :key="$route.path" @add-to-cart="handleAddToCart" />
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 Học Online. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const { isAuthenticated, isAdmin, isTeacher, userName, logout, initAuth, currentUser } = useAuth()
    const cartCount = ref(0)

    const loadCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      cartCount.value = cart.reduce((sum, item) => sum + item.quantity, 0)
    }

    const handleAddToCart = () => {
      loadCart()
    }

    const handleLogout = () => {
      logout()
      router.push('/')
    }

    // Watch để debug
    watch(() => currentUser.value, (newUser) => {
      console.log('App.vue - Current user changed:', newUser)
      console.log('App.vue - User role:', newUser?.role)
      console.log('App.vue - Is admin:', newUser?.role === 'admin')
    }, { immediate: true, deep: true })

    watch(() => isAdmin.value, (newValue) => {
      console.log('App.vue - isAdmin changed:', newValue)
    }, { immediate: true })

    onMounted(() => {
      loadCart()
      // initAuth sẽ được gọi tự động từ useAuth composable
      // Không cần gọi lại ở đây để tránh conflict
    })

    return {
      cartCount,
      isAuthenticated,
      isAdmin,
      isTeacher,
      userName,
      handleAddToCart,
      handleLogout
    }
  }
}
</script>
