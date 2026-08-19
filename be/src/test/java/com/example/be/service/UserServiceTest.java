import com.example.be.service.UserService;
import com.example.be.dto.request.RegisterRequest;
import com.example.be.dto.response.RegisterReponse;
import com.example.be.entity.User;
import com.example.be.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.Mockito.*;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    UserService userService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void shouldCreateUser_whenUserIsNotFound_inRegister() {
        RegisterRequest registerRequest = new RegisterRequest("huy125634", "Huy@2004");
        when(userRepository.existsByUsername(registerRequest.username())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(User.builder().username("huy1234").passwordHash("Huy@2004").build());
        when(passwordEncoder.encode(anyString())).thenReturn("Huy@2004");
        RegisterReponse registerReponse = userService.createUser(registerRequest);
        verify(userRepository, times(1)).save(any(User.class));
        assertEquals("huy1234", registerReponse.username());
    }

    @Test
    void readUser() {
    }

    @Test
    void changePassword() {
    }
}