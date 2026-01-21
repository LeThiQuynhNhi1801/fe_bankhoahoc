import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './components/Home.vue'
import CourseList from './components/CourseList.vue'
import CourseDetail from './components/CourseDetail.vue'
import Cart from './components/Cart.vue'
import Checkout from './components/Checkout.vue'
import OrderSuccess from './components/OrderSuccess.vue'
import Login from './components/Login.vue'
import Signup from './components/Signup.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import AdminUsers from './components/AdminUsers.vue'
import AdminOrders from './components/AdminOrders.vue'
import AdminCourses from './components/AdminCourses.vue'
import UploadDocument from './components/UploadDocument.vue'
import CreateCourse from './components/CreateCourse.vue'
import { useAuth } from './composables/useAuth'

const routes = [
  { path: '/', component: Home },
  { path: '/courses', component: CourseList },
  { path: '/course/:id', component: CourseDetail, props: true },
  { path: '/cart', component: Cart },
  { path: '/checkout', component: Checkout },
  { path: '/order-success', component: OrderSuccess },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { 
    path: '/admin', 
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin/users', 
    component: AdminUsers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin/orders', 
    component: AdminOrders,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin/courses', 
    component: AdminCourses,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin/create-course', 
    component: CreateCourse,
    meta: { requiresAuth: true, requiresAdminOrInstructor: true }
  },
  { 
    path: '/admin/upload', 
    component: UploadDocument,
    meta: { requiresAuth: true, requiresAdminOrInstructor: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // Kiểm tra nếu route yêu cầu authentication
  if (to.meta.requiresAuth) {
    if (!token) {
      console.log('[Router] No token, redirecting to login')
      next('/login')
      return
    }
    
    // Decode token để lấy role
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const role = payload.role
      
      console.log('[Router] Token role:', role)
      
      // Kiểm tra role nếu route yêu cầu admin
      if (to.meta.requiresAdmin) {
        const isAdminRole = role === 'ADMIN' || role === 'admin'
        if (!isAdminRole) {
          console.log('[Router] Not admin, redirecting to home. Role:', role)
          alert('Bạn không có quyền truy cập trang này! Chỉ ADMIN mới có quyền.')
          next('/')
          return
        }
      }
      
      // Kiểm tra role nếu route yêu cầu admin hoặc instructor
      if (to.meta.requiresAdminOrInstructor) {
        const isAdminRole = role === 'ADMIN' || role === 'admin'
        const isInstructorRole = role === 'INSTRUCTOR' || role === 'instructor'
        
        if (!isAdminRole && !isInstructorRole) {
          console.log('[Router] Not admin or instructor, redirecting to home. Role:', role)
          alert('Bạn không có quyền tạo khóa học! Chỉ ADMIN hoặc INSTRUCTOR mới có quyền này.')
          next('/')
          return
        }
      }
    } catch (error) {
      console.error('[Router] Failed to decode token:', error)
      // Nếu không decode được token, vẫn cho phép truy cập và để backend xử lý
    }
  }
  
  next()
})

const app = createApp(App)
app.use(router)
app.mount('#app')
