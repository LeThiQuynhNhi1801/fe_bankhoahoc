<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Đăng Nhập</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Tên đăng nhập</label>
          <input 
            v-model="username" 
            type="text" 
            required 
            placeholder="Nhập tên đăng nhập"
          />
        </div>
        <div class="form-group">
          <label>Mật khẩu</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="Nhập mật khẩu"
          />
        </div>
        <div class="demo-credentials">
          <p><strong>Demo:</strong></p>
          <p>Admin: admin / admin</p>
          <p>Teacher: teacher / teacher</p>
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" class="btn btn-primary">Đăng Nhập</button>
        
        <div class="signup-link">
          <p>Chưa có tài khoản? <router-link to="/signup">Đăng ký ngay</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const { login } = useAuth()
    const username = ref('')
    const password = ref('')
    const error = ref('')

    const handleLogin = () => {
      error.value = ''
      if (!username.value || !password.value) {
        error.value = 'Vui lòng nhập đầy đủ thông tin!'
        return
      }
      
      if (login(username.value, password.value)) {
        router.push('/')
      } else {
        error.value = 'Tên đăng nhập hoặc mật khẩu không đúng!'
      }
    }

    return {
      username,
      password,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.login-box h2 {
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.demo-credentials {
  background: #f0f9ff;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.demo-credentials p {
  margin: 0.25rem 0;
}

.error-message {
  color: #ef4444;
  margin-top: 1rem;
  margin-bottom: 1rem;
  text-align: center;
  padding: 0.75rem;
  background: #fee2e2;
  border-radius: 4px;
}

.signup-link {
  margin-top: 1.5rem;
  text-align: center;
}

.signup-link p {
  color: #666;
  margin: 0;
}

.signup-link a {
  color: #4F46E5;
  text-decoration: none;
  font-weight: 600;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
