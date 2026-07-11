package com.augmented.backend;

import com.augmented.backend.model.User;
import com.augmented.backend.repository.UserRepository;
import com.augmented.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@SpringBootTest
class UserControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    private MockMvc mockMvc;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        userService = new UserService(userRepository);
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void shouldCreateAndListUsers() throws Exception {
        String payload = "{\"name\":\"Ana\",\"email\":\"ana@example.com\"}";

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Ana"))
            .andExpect(jsonPath("$.email").value("ana@example.com"));

        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].name").value("Ana"));
    }

    @Test
    void shouldUpdateAndDeleteUser() throws Exception {
        String createPayload = "{\"name\":\"Luis\",\"email\":\"luis@example.com\"}";

        String response = mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createPayload))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

        Long userId = Long.parseLong(response.split("\"id\":")[1].split(",")[0]);

        String updatePayload = "{\"name\":\"Luis Updated\",\"email\":\"luis.updated@example.com\"}";

        mockMvc.perform(put("/api/users/{id}", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatePayload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Luis Updated"))
            .andExpect(jsonPath("$.email").value("luis.updated@example.com"));

        mockMvc.perform(delete("/api/users/{id}", userId))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void shouldHandleMissingUserEndpoints() throws Exception {
        String payload = "{\"name\":\"Maria\",\"email\":\"maria@example.com\"}";

        String response = mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

        Long userId = Long.parseLong(response.split("\"id\":")[1].split(",")[0]);

        mockMvc.perform(get("/api/users/{id}", userId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Maria"));

        mockMvc.perform(get("/api/users/{id}", 999L))
            .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/users/{id}", 999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Nope\",\"email\":\"nope@example.com\"}"))
            .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/users/{id}", 999L))
            .andExpect(status().isNotFound());
    }

    @Test
    void shouldCoverUserServiceAndModelEdgeCases() {
        UserService service = new UserService(userRepository);

        User created = service.create(new User(null, "Pedro", "pedro@example.com"));
        assertTrue(service.findById(created.getId()).isPresent());
        assertFalse(service.findById(999L).isPresent());
        assertTrue(service.update(created.getId(), new User(null, "Pedro Updated", "pedro.updated@example.com")).isPresent());
        assertFalse(service.update(999L, new User(null, "Missing", "missing@example.com")).isPresent());
        assertTrue(service.delete(created.getId()));
        assertFalse(service.delete(999L));

        User user = new User();
        user.setId(10L);
        user.setName("Ana");
        user.setEmail("ana@example.com");

        assertEquals(10L, user.getId());
        assertEquals("Ana", user.getName());
        assertEquals("ana@example.com", user.getEmail());

        User userWithConstructor = new User(11L, "Luis", "luis@example.com");
        assertEquals(11L, userWithConstructor.getId());
        assertEquals("Luis", userWithConstructor.getName());
        assertEquals("luis@example.com", userWithConstructor.getEmail());
    }

    @Test
    void shouldClearAllUsers() {
        UserService service = new UserService(userRepository);
        service.create(new User(null, "Pedro", "pedro@example.com"));

        service.clear();

        assertTrue(service.findAll().isEmpty());
    }

    @Test
    void shouldExposeAsyncUserOperations() {
        UserService service = new UserService(userRepository);

        CompletableFuture<User> created = service.createAsync(new User(null, "Async", "async@example.com"));
        CompletableFuture<List<User>> users = service.findAllAsync();

        User savedUser = created.join();
        List<User> allUsers = users.join();

        assertEquals("Async", savedUser.getName());
        assertEquals(1, allUsers.size());
    }
}
