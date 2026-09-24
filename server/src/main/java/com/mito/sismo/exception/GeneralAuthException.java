package com.mito.sismo.exception;

import lombok.Data;
import lombok.EqualsAndHashCode;


public class GeneralAuthException extends RuntimeException {
    private final String endpoint;
    private final String detail;

    public GeneralAuthException(String message, String endpoint, String detail) {
        super(message);
        this.endpoint = endpoint;
        this.detail = detail;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public String getDetail() {
        return detail;
    }
}
