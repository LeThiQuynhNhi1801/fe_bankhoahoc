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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const { isAuthenticated, isAdmin, isTeacher, userName, logout } = useAuth()
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

    onMounted(() => {
      loadCart()
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
