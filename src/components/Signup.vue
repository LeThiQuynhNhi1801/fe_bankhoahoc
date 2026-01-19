<template>
  <div class="signup-container">
    <div class="signup-box">
      <h2>Đăng Ký</h2>
      <form @submit.prevent="handleSignup">
        <div class="form-group">
          <label>Họ và Tên *</label>
          <input 
            v-model="formData.name" 
            type="text" 
            required 
            placeholder="Nhập họ và tên"
          />
        </div>

        <div class="form-group">
          <label>Email *</label>
          <input 
            v-model="formData.email" 
            type="email" 
            required 
            placeholder="Nhập email"
          />
        </div>

        <div class="form-group">
          <label>Tên đăng nhập *</label>
          <input 
            v-model="formData.username" 
            type="text" 
            required 
            placeholder="Nhập tên đăng nhập"
          />
        </div>

        <div class="form-group">
          <label>Mật khẩu *</label>
          <input 
            v-model="formData.password" 
            type="password" 
            required 
            placeholder="Nhập mật khẩu"
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label>Xác nhận mật khẩu *</label>
          <input 
            v-model="formData.confirmPassword" 
            type="password" 
            required 
            placeholder="Nhập lại mật khẩu"
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label>Vai trò</label>
          <select v-model="formData.role" class="form-select">
            <option value="user">Học viên</option>
            <option value="teacher">Giáo viên</option>
          </select>
          <small class="form-hint">Chọn vai trò của bạn trong hệ thống</small>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" class="btn btn-primary">Đăng Ký</button>
        
        <div class="login-link">
          <p>Đã có tài khoản? <router-link to="/login">Đăng nhập ngay</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

export default {
  name: 'Signup',
  setup() {
    const router = useRouter()
    const { signup } = useAuth()
    const error = ref('')

    const formData = reactive({
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'user'
    })

    const handleSignup = () => {
      error.value = ''

      // Validation
      if (formData.password !== formData.confirmPassword) {
        error.value = 'Mật khẩu xác nhận không khớp!'
        return
      }

      if (formData.password.length < 6) {
        error.value = 'Mật khẩu phải có ít nhất 6 ký tự!'
        return
      }

      // Kiểm tra username đã tồn tại chưa
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const existingUser = users.find(u => u.username === formData.username || u.email === formData.email)
      
      if (existingUser) {
        error.value = 'Tên đăng nhập hoặc email đã tồn tại!'
        return
      }

      // Gọi hàm signup
      if (signup(formData)) {
        router.push('/')
      } else {
        error.value = 'Đăng ký thất bại. Vui lòng thử lại!'
      }
    }

    return {
      formData,
      error,
      handleSignup
    }
  }
}
</script>

<style scoped>
.signup-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.signup-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.signup-box h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4F46E5;
}

.form-select {
  background: white;
  cursor: pointer;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #666;
}

.error-message {
  color: #ef4444;
  margin-bottom: 1rem;
  text-align: center;
  padding: 0.75rem;
  background: #fee2e2;
  border-radius: 4px;
}

.login-link {
  margin-top: 1.5rem;
  text-align: center;
}

.login-link p {
  color: #666;
  margin: 0;
}

.login-link a {
  color: #4F46E5;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

.btn {
  width: 100%;
}
</style>
