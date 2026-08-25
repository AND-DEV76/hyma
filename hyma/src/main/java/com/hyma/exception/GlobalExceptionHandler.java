package com.hyma.exception;

import com.hyma.recepcion.service.AlergiaNotFoundException;
import com.hyma.recepcion.service.ColaAtencionNotFoundException;
import com.hyma.recepcion.service.PacienteNotFoundException;
import com.hyma.recepcion.service.PacienteYaEnColaException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.validation.FieldError;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * ==========================================================
     * ERRORES DE VALIDACIÓN
     * ==========================================================
     *
     * Captura errores producidos por @Valid en los DTOs.
     *
     * Ejemplo:
     *
     * @NotBlank
     * @NotNull
     * @Size
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex
    ) {

        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getAllErrors()
                .forEach(error -> {

                    String fieldName =
                            ((FieldError) error).getField();

                    String errorMessage =
                            error.getDefaultMessage();

                    errors.put(fieldName, errorMessage);
                });

        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Error de Validación");
        response.put("errors", errors);

        return new ResponseEntity<>(
                response,
                HttpStatus.BAD_REQUEST
        );
    }


    /*
     * ==========================================================
     * PACIENTE NO ENCONTRADO
     * ==========================================================
     */
    @ExceptionHandler(PacienteNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handlePacienteNotFound(
            PacienteNotFoundException ex
    ) {

        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
    }


    /*
     * ==========================================================
     * ALERGIA NO ENCONTRADA
     * ==========================================================
     */
    @ExceptionHandler(AlergiaNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleAlergiaNotFound(
            AlergiaNotFoundException ex
    ) {

        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
    }


    /*
     * ==========================================================
     * COLA NO ENCONTRADA
     * ==========================================================
     */
    @ExceptionHandler(ColaAtencionNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleColaNotFound(
            ColaAtencionNotFoundException ex
    ) {

        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
    }


    /*
     * ==========================================================
     * PACIENTE YA ESTÁ EN COLA
     * ==========================================================
     *
     * Esto devuelve HTTP 409 Conflict.
     */
    @ExceptionHandler(PacienteYaEnColaException.class)
    public ResponseEntity<Map<String, Object>> handlePacienteYaEnCola(
            PacienteYaEnColaException ex
    ) {

        return buildErrorResponse(
                HttpStatus.CONFLICT,
                ex.getMessage()
        );
    }


    /*
     * ==========================================================
     * VALIDACIONES DE CONSTRAINT
     * ==========================================================
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(
            ConstraintViolationException ex
    ) {

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
    }


    /*
     * ==========================================================
     * CUALQUIER RuntimeException NO CONTROLADA
     * ==========================================================
     *
     * Este es el "último recurso".
     *
     * Las excepciones específicas anteriores tienen prioridad.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex
    ) {

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
    }


    /*
     * ==========================================================
     * MÉTODO AUXILIAR
     * ==========================================================
     */
    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status,
            String message
    ) {

        Map<String, Object> response = new HashMap<>();

        response.put("timestamp", LocalDateTime.now());
        response.put("status", status.value());
        response.put("error", status.getReasonPhrase());
        response.put("message", message);

        return new ResponseEntity<>(
                response,
                status
        );
    }
}