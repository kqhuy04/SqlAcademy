package com.example.be;

import com.example.be.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;

@SpringBootTest
class BeApplicationTests {

    @Autowired
    private RedisTemplate redisTemplate;
    @Test
    void contextLoads() {
    }


    @Autowired
    private UserService userService;

    @Autowired
    private org.springframework.cache.CacheManager cacheManager;

    @Test
    void testCacheLeaderboard() {
        var lbKeys = redisTemplate.keys("leaderboard*");
        if (lbKeys != null && !lbKeys.isEmpty()) {
            redisTemplate.delete(lbKeys);
        }

        var list1 = userService.getLeaderboard();
        org.junit.jupiter.api.Assertions.assertNotNull(list1);
    }

    @Autowired
    private com.example.be.service.PremiumCaseService premiumCaseService;

    @Test
    void testSerializationPremiumCases() {
        var serializer = org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer.builder()
                .enableSpringCacheNullValueSupport()
                .enableUnsafeDefaultTyping()
                .build();
        var dto = com.example.be.dto.response.PremiumCaseDTO.builder()
                .id(1L)
                .title("Test")
                .build();
        var original = new com.example.be.dto.response.PremiumCaseListResponse(java.util.List.of(dto));
        byte[] bytes = serializer.serialize(original);
        System.out.println("JSON: " + new String(bytes));
        Object deserialized = serializer.deserialize(bytes);
        System.out.println("Deserialized type: " + deserialized.getClass().getName());
        org.junit.jupiter.api.Assertions.assertInstanceOf(com.example.be.dto.response.PremiumCaseListResponse.class, deserialized);
    }
}
