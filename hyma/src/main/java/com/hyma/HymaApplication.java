package com.hyma;

import jakarta.annotation.PostConstruct;
import java.security.Security;
import java.util.TimeZone;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HymaApplication {

	@PostConstruct
	public void init() {
		TimeZone.setDefault(TimeZone.getTimeZone("America/Guatemala"));
	}

	public static void main(String[] args) {
		System.setProperty("user.timezone", "America/Guatemala");
		TimeZone.setDefault(TimeZone.getTimeZone("America/Guatemala"));

		if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
			Security.addProvider(new BouncyCastleProvider());
		}
		SpringApplication.run(HymaApplication.class, args);
	}
}