import { ref, computed } from 'vue'

// Quản lý user/role state
const currentUser = ref(null)

// Khởi tạo từ localStorage nếu có
const initAuth = () => {
  const storedUser = localStorage.getItem('currentUser')
  if (storedUser) {
    currentUser.value = JSON.parse(storedUser)
  }
}

// Khởi tạo khi import
initAuth()

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null)
  const userRole = computed(() => currentUser.value?.role || 'guest')
  const isAdmin = computed(() => userRole.value === 'admin')
  const isTeacher = computed(() => userRole.value === 'teacher')
  const userName = computed(() => currentUser.value?.name || '')

  const login = (username, password) => {
    // Kiểm tra admin và teacher mặc định trước
    if (username === 'admin' && password === 'admin') {
      currentUser.value = {
        id: 1,
        name: 'Administrator',
        username: 'admin',
        role: 'admin',
        email: 'admin@example.com'
      }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      return true
    }
    
    if (username === 'teacher' && password === 'teacher') {
      currentUser.value = {
        id: 2,
        name: 'Giáo Viên',
        username: 'teacher',
        role: 'teacher',
        email: 'teacher@example.com'
      }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      return true
    }

    // Kiểm tra trong danh sách users đã đăng ký
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.username === username && u.password === password)
    
    if (user) {
      currentUser.value = {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        email: user.email
      }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      return true
    }
    
    return false
  }

  const signup = (userData) => {
    try {
      // Lưu user vào localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      
      // Kiểm tra username hoặc email đã tồn tại
      const existingUser = users.find(
        u => u.username === userData.username || u.email === userData.email
      )
      
      if (existingUser) {
        return false
      }

      // Tạo user mới
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: userData.password, // Trong thực tế nên hash password
        role: userData.role || 'user',
        createdAt: new Date().toISOString()
      }

      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))

      // Tự động đăng nhập sau khi đăng ký
      currentUser.value = {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        email: newUser.email
      }
      
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      
      return true
    } catch (error) {
      console.error('Signup error:', error)
      return false
    }
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  return {
    currentUser,
    isAuthenticated,
    userRole,
    isAdmin,
    isTeacher,
    userName,
    login,
    signup,
    logout
  }
}
