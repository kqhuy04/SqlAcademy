package com.example.be;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.propertyeditors.ReaderEditor;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import com.example.be.service.AccessTokenBlocklistService;
import java.time.Instant;
import com.example.be.service.UserService;

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

        System.out.println("\n================ LẦN GỌI 2 ================");
        var list2 = userService.getLeaderboard();
        System.out.println("Lấy được: " + list2.size() + " học viên.");
    }
}
