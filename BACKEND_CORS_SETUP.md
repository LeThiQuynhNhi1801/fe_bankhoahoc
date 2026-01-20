# Hướng Dẫn Cấu Hình CORS cho Backend

Lỗi 403 thường xảy ra khi backend không cấu hình CORS đúng cách hoặc từ chối preflight requests.

## Cho Spring Boot (Java)

### Cách 1: Sử dụng @CrossOrigin annotation

```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
public class AuthController {
    // ...
}
```

### Cách 2: Global CORS Configuration

Tạo file `CorsConfig.java`:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Cho phép credentials
        config.setAllowCredentials(true);
        
        // Cho phép origin của frontend
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://localhost:3000");
        
        // Cho phép tất cả headers
        config.addAllowedHeader("*");
        
        // Cho phép tất cả methods
        config.addAllowedMethod("*");
        
        // Cho phép preflight requests
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

### Cách 3: WebMvcConfigurer

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## Quan trọng:

1. **Phải xử lý OPTIONS request** - Đây là preflight request
2. **Cho phép credentials** - Nếu dùng cookie/token
3. **Allowed Origins** - Phải match đúng origin của frontend
4. **Allowed Headers** - Phải cho phép `Content-Type`, `Authorization`

## Kiểm tra:

Mở browser console và kiểm tra:
- Request URL: `http://localhost:5173/api/auth/login`
- Preflight (OPTIONS) request có thành công không?
- Response headers có `Access-Control-Allow-Origin` không?

## Debug:

1. Kiểm tra backend có chạy ở port 8080 không?
2. Kiểm tra endpoint `/api/auth/login` có tồn tại không?
3. Thử call trực tiếp từ Postman/curl để xem backend có trả về đúng không?

```bash
# Test với curl
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```
