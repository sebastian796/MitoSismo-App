package com.mito.sismo.service;

import com.mito.sismo.entity.ConsejoPrevencion;
import com.mito.sismo.entity.FasePrevencion;
import com.mito.sismo.entity.enums.ClaveFase;
import com.mito.sismo.repository.ConsejoPrevencionRepository;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

// Pruebas aisladas de la selección por fase: no usan Spring Boot ni la base compartida.
class ConsejoPrevencionServiceTest {
    @Test
    void preservesTextAndPhaseFromRepository() {
        var repository = mock(ConsejoPrevencionRepository.class);
        var service = new ConsejoPrevencionService(repository);
        var rows = List.of(row(ClaveFase.ANTES), row(ClaveFase.DURANTE), row(ClaveFase.DESPUES));
        when(repository.findAll()).thenReturn(rows);

        var before = service.listConsejoAntes();
        var during = service.listConsejoDurante();
        var after = service.listConsejoDespues();
        for (var pair : List.of(before, during, after)) assertEquals(1, pair.size());
        assertEquals(ClaveFase.ANTES, before.getFirst().getFase().getClave());
        assertEquals(ClaveFase.DURANTE, during.getFirst().getFase().getClave());
        assertEquals(ClaveFase.DESPUES, after.getFirst().getFase().getClave());
        assertEquals(rows.getFirst().getConsejo(), before.getFirst().getConsejo());
        assertEquals(3, service.listConsejos().size());
    }

    @Test
    void emptyRepositoryReturnsEmptyListsWithoutInventedContent() {
        var repository = mock(ConsejoPrevencionRepository.class);
        when(repository.findAll()).thenReturn(List.of());
        var service = new ConsejoPrevencionService(repository);
        assertTrue(service.listConsejoAntes().isEmpty());
        assertTrue(service.listConsejoDurante().isEmpty());
        assertTrue(service.listConsejoDespues().isEmpty());
        verify(repository, times(3)).findAll();
    }

    private ConsejoPrevencion row(ClaveFase phase) {
        return ConsejoPrevencion.builder()
                .fase(FasePrevencion.builder().clave(phase).titulo(phase.name()).build())
                .consejo("Contenido del repositorio para " + phase.name())
                .build();
    }
}
