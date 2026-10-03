package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.CriaturaDTO;
import com.mito.sismo.dto.entidades.CriaturaDataDTO;
import com.mito.sismo.entity.Criatura;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.entity.UsuarioCriatura;
import com.mito.sismo.entity.UsuarioMision;
import com.mito.sismo.entity.enums.Elemento;
import com.mito.sismo.entity.enums.Estado;
import com.mito.sismo.exception.GeneralAuthException;
import com.mito.sismo.repository.CriaturaRepository;
import com.mito.sismo.repository.UsuarioCriaturaRepository;
import com.mito.sismo.repository.UsuarioMisionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CriaturaService {

    private static final Integer NIVEL_MAXIMO = 50;
    private static final Double FACTOR = 10.0;

    private final CriaturaRepository criaturaRepository;
    private final UsuarioCriaturaRepository userCriaturaRepository;
    private final UsuarioMisionRepository userMisionRepository;
    private final UsuarioService userService;

    // Extraer Criatura Electora (publico)
    @Transactional(readOnly = true)
    public List<CriaturaDTO> mostrarCriaturas(){
        List<Criatura> listCriatura = criaturaRepository.findAll();
        return listCriatura.stream()
                .filter(criatura -> criatura.getElemento() != Elemento.AIRE)
                .map(CriaturaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Extraer Criatura Prueba (publico)
    @Transactional(readOnly = true)
    public CriaturaDTO mostrarCriaturaPrueba(){
        Criatura criatura = criaturaRepository.findByElemento(Elemento.AIRE).getFirst();
        return CriaturaDTO.fromEntity(criatura);
    }

    // Extraer Criatura Usuario
    @Transactional(readOnly = true)
    public CriaturaDataDTO mostrarMyCriatura(
            String authHeader
    ){
        Usuario user = userService.extraerUsuarioEmailToken(authHeader);
        UsuarioCriatura criatura = userCriaturaRepository.findByUsuarioId(user.getId())
                .orElseThrow(()-> new GeneralAuthException(
                        "api/criatura/traerMyCriatura",
                        "Criatura No Existente",
                        "Usuario: "+ user.getId()
                ));
        int[] xpData = progreso(criatura.getXpActual()); // Nivel - XpMinima - XpMaxima
        return CriaturaDataDTO.fromEntity(criatura,xpData[1],xpData[2]);
    }

    // Traer la Criatura con Usuario
    @Transactional
    public UsuarioCriatura getCriaturaUsuario(Long usuarioId){
        return userCriaturaRepository.findByUsuarioId(usuarioId)
                .orElseThrow(()-> new GeneralAuthException(
                        "api/criatura/getCriaturaUsuario",
                        "Criatura No Existente",
                        "Usuario: "+usuarioId
                ));
    }


    // ReCalcular Experiencia de Criatura
    @Transactional
    public UsuarioCriatura recalcularXpCriatura(
            UsuarioCriatura cria,
            Integer xpRecompensa
    ){
        // Calcular la xp
        Integer xpActual = cria.getXpActual() + xpRecompensa;
        Integer dataXp = calcularNivel(xpActual);// calcular nivel-xp

        cria.setXpActual(xpActual); // Actualizar la Xp
        cria.setNivel(dataXp);

        // -Guardar los Datos
        return userCriaturaRepository.save(cria);
    }

    private static Integer xpParaNivel(int nivel) {
        return (int) (nivel * nivel * FACTOR);
    }

    public Integer calcularNivel(Integer xpActual) {
        int nivel = (int) Math.sqrt(xpActual / FACTOR);
        return Math.min(nivel, NIVEL_MAXIMO);
    }

    public int[] progreso(Integer xpActual) {
        Integer nivel = calcularNivel(xpActual);
        Integer xpMin = xpParaNivel(nivel);
        Integer xpMax = xpParaNivel(Math.min(nivel + 1, NIVEL_MAXIMO));
        return new int[]{nivel, xpActual - xpMin, xpMax - xpMin};
    }



}
