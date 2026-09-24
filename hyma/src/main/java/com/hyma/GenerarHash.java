package com.hyma;

import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

public class GenerarHash {

    public static void main(String[] args) {

        Argon2PasswordEncoder encoder = new Argon2PasswordEncoder(
                16,
                32,
                1,
                65536,
                3
        );

        String password = "Admin123!";

        String hash = encoder.encode(password);

        System.out.println("HASH:");
        System.out.println(hash);
    }
}