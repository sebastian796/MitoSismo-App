package com.mito.sismo.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mito.sismo.dto.entidades.CriaturaDTO;
import com.mito.sismo.dto.entidades.CriaturaDataDTO;
import com.mito.sismo.dto.request.CriaturaRequest;
import com.mito.sismo.entity.Criatura;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.entity.UsuarioCriatura;
import com.mito.sismo.entity.enums.Elemento;
import com.mito.sismo.exception.ResourceNotFoundException;
import com.mito.sismo.repository.CriaturaRepository;
import com.mito.sismo.repository.UsuarioCriaturaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Servicio para la gestión de criaturas mitológicas protectoras y el cálculo de
 * nivel y experiencia.
 */
@Service
@RequiredArgsConstructor
public class CriaturaService {

    private static final Integer NIVEL_MAXIMO = 50;
    private static final Double FACTOR = 10.0;

    private static Integer xpParaNivel(int nivel) {
        return (int) (nivel * nivel * FACTOR);
    }

    private final CriaturaRepository criaturaRepository;
    private final UsuarioCriaturaRepository userCriaturaRepository;

    private final UsuarioService userService;

    // Modificar datos de una criatura existente
    @Transactional
    public CriaturaDTO actualizarCriatura(Integer id, CriaturaRequest request) {
        Criatura existente = criaturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criatura no encontrada con ID: " + id));

        existente.setNombre(request.getNombre());
        existente.setTitulo(request.getTitulo());
        existente.setElemento(request.getElemento());
        existente.setDescripcion(request.getDescripcion());
        existente.setMitoLore(request.getMitoLore());
        existente.setImageUrl(request.getImageUrl());

        return CriaturaDTO.fromEntity(criaturaRepository.save(existente));
    }

    // Cálculo matemático de nivel a partir de los puntos de experiencia
    public Integer calcularNivel(Integer xpActual) {
        if (xpActual == null || xpActual <= 0)
            return 1;
        int nivel = (int) Math.sqrt(xpActual / FACTOR);
        return Math.max(1, Math.min(nivel, NIVEL_MAXIMO));
    }

    // Crear una nueva criatura en el catálogo
    @Transactional
    public CriaturaDTO crearCriatura(CriaturaRequest request) {
        Criatura criatura = Criatura.builder()
                .nombre(request.getNombre())
                .titulo(request.getTitulo())
                .elemento(request.getElemento())
                .descripcion(request.getDescripcion())
                .mitoLore(request.getMitoLore())
                .imageUrl(request.getImageUrl())
                .createdAt(Instant.now())
                .build();

        return CriaturaDTO.fromEntity(criaturaRepository.save(criatura));
    }

    // Eliminar una criatura del catálogo
    @Transactional
    public void eliminarCriatura(Integer id) {
        if (!criaturaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Criatura no encontrada con ID: " + id);
        }
        criaturaRepository.deleteById(id);
    }

    // Obtener entidad UsuarioCriatura asociada al usuario
    @Transactional(readOnly = true)
    public UsuarioCriatura getCriaturaUsuario(Long usuarioId) {
        return userCriaturaRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "El usuario con ID " + usuarioId + " no tiene criatura asignada."));
    }

    // Obtener criatura de prueba (público) de forma segura evitando
    // NoSuchElementException
    @Transactional(readOnly = true)
    public CriaturaDTO mostrarCriaturaPrueba() {
        // La mascota pública debe ser una criatura de Aire y estable entre consultas.
        // No sustituirla por otro elemento si el catálogo está incompleto.
        return criaturaRepository.findFirstByElementoOrderByIdAsc(Elemento.AIRE)
                .map(CriaturaDTO::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe una criatura pública de elemento Aire en el catálogo."));
    }

    // Listar criaturas disponibles para la elección al registrarse (público)
    @Transactional(readOnly = true)
    public List<CriaturaDTO> mostrarCriaturas() {
        List<Criatura> listCriatura = criaturaRepository.findAll();
        return listCriatura.stream()
                .filter(criatura -> criatura.getElemento() != Elemento.AIRE)
                .map(CriaturaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Obtener la criatura / mascota y nivel del usuario autenticado
    @Transactional(readOnly = true)
    public CriaturaDataDTO mostrarMyCriatura(String authHeader) {
        Usuario user = userService.extraerUsuarioEmailToken(authHeader);
        UsuarioCriatura criatura = userCriaturaRepository.findByUsuarioId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró una criatura vinculada al usuario: " + user.getId()));

        int[] xpData = progreso(criatura.getXpActual()); // [0]=Nivel, [1]=XpMinima, [2]=XpMaxima
        return CriaturaDataDTO.fromEntity(criatura, xpData[1], xpData[2]);
    }

    // Obtener criatura del catálogo por ID
    @Transactional(readOnly = true)
    public CriaturaDTO obtenerPorId(Integer id) {
        Criatura criatura = criaturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criatura no encontrada con ID: " + id));
        return CriaturaDTO.fromEntity(criatura);
    }

    public int[] progreso(Integer xpActual) {
        int xp = (xpActual != null) ? xpActual : 0;
        Integer nivel = calcularNivel(xp);
        Integer xpMin = xpParaNivel(nivel);
        Integer xpMax = xpParaNivel(Math.min(nivel + 1, NIVEL_MAXIMO));
        return new int[] { nivel, xp - xpMin, xpMax - xpMin };
    }

    // Recalcular la experiencia y subir nivel a la criatura tras completar misión
    @Transactional
    public UsuarioCriatura recalcularXpCriatura(UsuarioCriatura cria, Integer xpRecompensa) {
        int xpTotal = (cria.getXpActual() != null ? cria.getXpActual() : 0) + (xpRecompensa != null ? xpRecompensa : 0);
        int nuevoNivel = calcularNivel(xpTotal);

        cria.setXpActual(xpTotal);
        cria.setNivel(nuevoNivel);
        return userCriaturaRepository.save(cria);
    }
}
