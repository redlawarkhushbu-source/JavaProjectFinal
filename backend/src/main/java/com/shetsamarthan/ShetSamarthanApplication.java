package com.shetsamarthan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShetSamarthanApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShetSamarthanApplication.class, args);
        System.out.println("=================================================================");
        System.out.println("  शेत समर्थन (Shet Samarthan) Backend Server Started Successfully");
        System.out.println("  REST API Endpoint: http://localhost:8080/api                   ");
        System.out.println("  H2 In-Memory DB:  http://localhost:8080/h2-console             ");
        System.out.println("=================================================================");
    }
}
