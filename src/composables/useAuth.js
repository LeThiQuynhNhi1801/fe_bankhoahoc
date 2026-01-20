import { ref, computed, onMounted } from 'vue'
import { authService } from '../services/authService'

// Quản lý user/role state
const currentUser = ref(null)
const isLoading = ref(false)
let initAuthCalled = false // Flag để tránh gọi nhiều lần

// Khởi tạo từ API nếu có token
const initAuth = async () => {
  // Tránh gọi nhiều lần đồng thời
  if (initAuthCalled) {
    console.log('[initAuth] Already initializing, skipping...')
    return
  }
  
  const token = localStorage.getItem('token')
  if (!token) {
    console.log('[initAuth] No token found')
    currentUser.value = null
    return
  }
  
  // Nếu đã có currentUser và token, không cần init lại
  if (currentUser.value && token) {
    console.log('[initAuth] User already loaded, skipping...')
    return
  }
  
  initAuthCalled = true
  try {
    isLoading.value = true
    console.log('[initAuth] Starting auth initialization...')
    
    // Decode token để lấy thông tin user (vì /api/auth/profile không có trong Swagger)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      // Kiểm tra token expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('[initAuth] Token expired, clearing...')
        localStorage.removeItem('token')
        currentUser.value = null
        return
      }
      
      // Lấy thông tin từ token payload
      currentUser.value = {
        id: payload.sub || payload.id,
        username: payload.username || payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.username || payload.sub,
        fullName: payload.fullName || payload.username || payload.sub
      }
      
      console.log('[initAuth] User loaded from token:', currentUser.value)
      console.log('[initAuth] User role:', currentUser.value?.role)
    } catch (decodeError) {
      console.error('[initAuth] Failed to decode token:', decodeError)
      // Giữ token nhưng không set user
    }
  } catch (error) {
    console.error('[initAuth] Error:', error)
    // Không xóa token, để user có thể thử lại
  } finally {
    isLoading.value = false
    initAuthCalled = false
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null)
  const userRole = computed(() => {
    const role = currentUser.value?.role
    return role ? String(role).toLowerCase() : 'guest'
  })
  const isAdmin = computed(() => userRole.value === 'admin')
  const isTeacher = computed(() => userRole.value === 'instructor')
  const userName = computed(() => currentUser.value?.fullName || currentUser.value?.username || currentUser.value?.name || '')

  const login = async (username, password) => {
    try {
      isLoading.value = true
      const response = await authService.login(username, password)
      
      // JwtResponse: { token, type, id, username, email, role }
      console.log('Login response:', response)
      
      // Lưu token
      if (response.token) {
        localStorage.setItem('token', response.token)
        
        // JwtResponse đã có đủ thông tin: id, username, email, role
        // Không cần gọi getProfile vì endpoint này không có trong Swagger
        currentUser.value = {
          id: response.id,
          username: response.username,
          email: response.email,
          role: response.role,
          name: response.username,
          fullName: response.username
        }
        
        console.log('Current user after login:', currentUser.value)
        console.log('User role:', currentUser.value?.role)
      }
      
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const signup = async (userData) => {
    try {
      isLoading.value = true
      // Register trả về UserDTO, không có token
      const response = await authService.register(userData)
      
      // UserDTO: { id, username, email, fullName, phoneNumber, avatar, role, isActive, createdAt }
      currentUser.value = response
      
      console.log('Register response:', response)
      
      // Sau khi đăng ký thành công, cần đăng nhập để lấy token
      // Hoặc redirect về trang login
      return true
    } catch (error) {
      console.error('Signup failed:', error)
      throw error // Throw để component có thể xử lý error message
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      currentUser.value = null
      localStorage.removeItem('token')
    }
  }

  // Khởi tạo khi sử dụng - chỉ gọi một lần
  let mounted = false
  onMounted(() => {
    if (!mounted && !currentUser.value) {
      mounted = true
      initAuth()
    }
  })

  return {
    currentUser,
    isLoading,
    isAuthenticated,
    userRole,
    isAdmin,
    isTeacher,
    userName,
    login,
    signup,
    logout,
    initAuth
  }
}
