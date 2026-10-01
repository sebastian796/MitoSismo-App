package com.mito.sismo.dto.entidades;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RotateAccesTokenDTO {
    private String accessToken;
    private String refreshToken;
}
