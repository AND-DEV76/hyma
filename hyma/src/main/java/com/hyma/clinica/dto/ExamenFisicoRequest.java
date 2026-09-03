package com.hyma.clinica.dto;

import lombok.Data;

@Data
public class ExamenFisicoRequest {
    private String piel;
    private String conciencia;
    private String cardiopulmonar;
    private String abdomen;
    private String soma;
}
