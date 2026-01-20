// Debug helper để test API trực tiếp
import { API_ENDPOINTS } from '../config/api'

export const testLogin = async () => {
  const testUrl = 'http://localhost:8080/api/auth/login'
  
  console.log('Testing direct API call to:', testUrl)
  
  try {
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', [...response.headers.entries()])
    
    if (response.ok) {
      const data = await response.json()
      console.log('Response data:', data)
      return data
    } else {
      const text = await response.text()
      console.error('Error response:', text)
    }
  } catch (error) {
    console.error('Fetch error:', error)
  }
}

// Gọi trong browser console: window.testLogin()
