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
        System.out.println("UserService class: " + userService.getClass().getName());
        System.out.println("CacheManager class: " + cacheManager.getClass().getName());
        var cache = cacheManager.getCache("leaderboard");
        var entryBefore = (cache != null && cache.get("top50") != null) ? cache.get("top50").get() : "null";
        System.out.println("Cache entry before: " + entryBefore);

        System.out.println("================ LẦN GỌI 1 ================");
        var list1 = userService.getLeaderboard();
        System.out.println("Lấy được: " + list1.size() + " học viên.");
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
