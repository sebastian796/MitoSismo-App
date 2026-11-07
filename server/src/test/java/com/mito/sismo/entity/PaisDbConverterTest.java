package com.mito.sismo.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import com.mito.sismo.entity.enums.Pais;

class PaisDbConverterTest {
    private final PaisDbConverter converter = new PaisDbConverter();

    @Test
    void readsDatabaseCountryLabelAndEnumCode() {
        assertEquals(Pais.PERU, converter.convertToEntityAttribute("Perú"));
        assertEquals(Pais.PERU, converter.convertToEntityAttribute("PERU"));
    }

    @Test
    void writesTheEnumCodeUsedByTheDtoAndSeed() {
        assertEquals("PERU", converter.convertToDatabaseColumn(Pais.PERU));
    }
}
