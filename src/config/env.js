// Cấu hình môi trường
const env = import.meta.env.MODE || 'development'

// Lấy từ environment variables hoặc dùng giá trị mặc định
const getEnvVar = (key, defaultValue) => {
  return import.meta.env[key] || defaultValue
}

const config = {
  development: {
    name: 'Development',
    apiUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8080'),
    baseUrl: getEnvVar('VITE_BASE_URL', 'http://localhost:5173'),
    enableDebug: getEnvVar('VITE_ENABLE_DEBUG', 'true') === 'true'
  },
  test: {
    name: 'Test',
    apiUrl: getEnvVar('VITE_API_BASE_URL', 'https://api-test.example.com'),
    baseUrl: getEnvVar('VITE_BASE_URL', 'https://test.example.com'),
    enableDebug: getEnvVar('VITE_ENABLE_DEBUG', 'true') === 'true'
  },
  production: {
    name: 'Production',
    apiUrl: getEnvVar('VITE_API_BASE_URL', 'https://api.example.com'),
    baseUrl: getEnvVar('VITE_BASE_URL', 'https://example.com'),
    enableDebug: getEnvVar('VITE_ENABLE_DEBUG', 'false') === 'true'
  }
}

// Lấy config theo môi trường hiện tại
const currentConfig = config[env] || config.development

// API Endpoints
export const API_BASE_URL = currentConfig.apiUrl
export const BASE_URL = currentConfig.baseUrl
export const IS_DEVELOPMENT = env === 'development'
export const IS_PRODUCTION = env === 'production'
export const IS_TEST = env === 'test'
export const ENV_NAME = currentConfig.name
export const ENABLE_DEBUG = currentConfig.enableDebug

// Export full config để dùng khi cần
export default {
  ...currentConfig,
  env,
  API_BASE_URL,
  BASE_URL,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_TEST,
  ENV_NAME,
  ENABLE_DEBUG
}
