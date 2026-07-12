package com.augmented.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import static org.mockito.Mockito.*;

class CorsConfigTest {

    @Test
    void addCorsMappings_ShouldConfigureRegistry() {
        CorsConfig corsConfig = new CorsConfig();
        CorsRegistry registry = mock(CorsRegistry.class, RETURNS_DEEP_STUBS);

        corsConfig.addCorsMappings(registry);

        verify(registry).addMapping("/**");
    }
}