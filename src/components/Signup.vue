<template>
  <div class="signup-container">
    <div class="signup-box">
      <h2>Đăng Ký</h2>
      <form @submit.prevent="handleSignup">
        <div class="form-group">
          <label>Tên đăng nhập *</label>
          <input 
            v-model="formData.username" 
            type="text" 
            required 
            placeholder="Nhập tên đăng nhập (3-50 ký tự)"
            minlength="3"
            maxlength="50"
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
          <label>Mật khẩu *</label>
          <input 
            v-model="formData.password" 
            type="password" 
            required 
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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
          <label>Họ và Tên</label>
          <input 
            v-model="formData.fullName" 
            type="text" 
            placeholder="Nhập họ và tên (tùy chọn)"
          />
        </div>

        <div class="form-group">
          <label>Số điện thoại</label>
          <input 
            v-model="formData.phoneNumber" 
            type="tel" 
            placeholder="Nhập số điện thoại (tùy chọn)"
          />
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
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: ''
    })

    const handleSignup = async () => {
      error.value = ''

      // Validation
      if (formData.username.length < 3 || formData.username.length > 50) {
        error.value = 'Tên đăng nhập phải có từ 3 đến 50 ký tự!'
        return
      }

      if (formData.password !== formData.confirmPassword) {
        error.value = 'Mật khẩu xác nhận không khớp!'
        return
      }

      if (formData.password.length < 6) {
        error.value = 'Mật khẩu phải có ít nhất 6 ký tự!'
        return
      }

      // Chuẩn bị dữ liệu theo RegisterRequest
      const registerData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim() || null,
        phoneNumber: formData.phoneNumber.trim() || null
      }

      // Gọi API register
      try {
        const success = await signup(registerData)
        if (success) {
          router.push('/login')
        } else {
          error.value = 'Đăng ký thất bại. Tên đăng nhập hoặc email đã tồn tại!'
        }
      } catch (err) {
        error.value = err.data?.message || err.message || 'Đăng ký thất bại. Vui lòng thử lại!'
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
