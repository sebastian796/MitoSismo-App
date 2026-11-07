package com.mito.sismo.entity;

import java.text.Normalizer;
import java.util.Locale;

import com.mito.sismo.entity.enums.Pais;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Adapta los valores legibles del catálogo PostgreSQL a los códigos Pais del
 * backend.
 */
@Converter
public class PaisDbConverter implements AttributeConverter<Pais, String> {

    @Override
    public String convertToDatabaseColumn(Pais pais) {
        return pais == null ? null : pais.name();
    }

    @Override
    public Pais convertToEntityAttribute(String value) {
        if (value == null || value.isBlank())
            return null;

        String code = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .trim()
                .replaceAll("[\\s-]+", "_")
                .toUpperCase(Locale.ROOT);
        return Pais.valueOf(code);
    }
}
