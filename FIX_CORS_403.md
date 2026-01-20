# Fix Lỗi 403 khi Login từ Browser (nhưng Swagger OK)

## Vấn đề:
- Login từ Swagger ✅ OK
- Login từ Browser ❌ 403 Forbidden

## Nguyên nhân:
Đây là lỗi **CORS preflight**. Khi browser gửi request từ `localhost:5173` đến `localhost:8080`, nó phải:
1. Gửi OPTIONS request trước (preflight)
2. Nhận OK từ OPTIONS
3. Mới gửi POST request thực sự

Nếu OPTIONS request bị 403 → Không thể gửi POST

## Giải pháp cho Backend (Spring Boot):

### Cách 1: Thêm vào Controller (Nhanh nhất)

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
public class AuthController {
    
    // Xử lý preflight OPTIONS
    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // ... your code
    }
}
```

### Cách 2: Global CORS Configuration (Tốt nhất)

Tạo file `CorsConfig.java`:

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // QUAN TRỌNG: Cho phép credentials
        config.setAllowCredentials(true);
        
        // Cho phép origin của frontend
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://localhost:3000");
        
        // QUAN TRỌNG: Cho phép OPTIONS method
        config.addAllowedMethod("OPTIONS");
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("PATCH");
        
        // Cho phép tất cả headers
        config.addAllowedHeader("*");
        
        // Max age cho preflight
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

### Cách 3: Security Filter (Nếu dùng Spring Security)

Nếu bạn dùng Spring Security, thêm vào `SecurityConfig`:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // Tạm thời disable nếu chưa cần
            // ... other config
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

## Kiểm tra:

1. **Restart backend sau khi sửa**

2. **Test với curl:**
```bash
# Test OPTIONS (preflight)
curl -X OPTIONS http://localhost:8080/api/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Phải trả về 200 OK và có headers:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Methods: POST
# Access-Control-Allow-Headers: Content-Type
```

3. **Kiểm tra trong Browser Network tab:**
   - Xem có OPTIONS request không?
   - OPTIONS có trả về 200 không?
   - Có header `Access-Control-Allow-Origin` không?

## Lưu ý:

- **QUAN TRỌNG**: Phải xử lý **OPTIONS method** cho preflight
- **allowCredentials(true)** nếu dùng token/cookie
- **allowedOrigins** phải match chính xác origin của frontend
- Nếu có Spring Security, phải config CORS ở đó
