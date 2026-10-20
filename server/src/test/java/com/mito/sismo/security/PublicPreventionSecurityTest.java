package com.mito.sismo.security;

import com.mito.sismo.config.SecurityConfig;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mock.web.MockServletContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import static org.mockito.Mockito.mock;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Contexto MVC aislado: usa la seguridad real sin iniciar Spring Boot, JPA ni conexiones.
class PublicPreventionSecurityTest {
    private AnnotationConfigWebApplicationContext context;
    private MockMvc mvc;

    @BeforeEach
    void setup() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(SecurityConfig.class, TestConfig.class);
        context.refresh();
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @AfterEach
    void close() { context.close(); }

    @Test
    void preventionReadsArePublic() throws Exception {
        for (String phase : new String[]{"antes", "durante", "despues"}) {
            mvc.perform(get("/api/prevencion/" + phase)).andExpect(status().isOk());
        }
    }

    @Test
    void preventionWritesAndPrivateReadsRemainProtected() throws Exception {
        mvc.perform(post("/api/prevencion/antes")).andExpect(status().is4xxClientError());
        mvc.perform(get("/api/criatura/myCriatura")).andExpect(status().is4xxClientError());
        mvc.perform(get("/api/usuario/getDatosUsuario")).andExpect(status().is4xxClientError());
    }

    @Configuration
    @EnableWebMvc
    static class TestConfig {
        @Bean JwtFilter jwtFilter() { return new JwtFilter(mock(JwtUtil.class)); }
        @Bean Routes routes() { return new Routes(); }
    }

    @RestController
    static class Routes {
        @GetMapping({"/api/prevencion/antes", "/api/prevencion/durante", "/api/prevencion/despues",
                "/api/criatura/myCriatura", "/api/usuario/getDatosUsuario"})
        String read() { return "[]"; }
        @PostMapping("/api/prevencion/antes")
        String write() { return "ok"; }
    }
}
