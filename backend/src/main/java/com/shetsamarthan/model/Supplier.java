package com.shetsamarthan.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String nameMr;
    private String category;
    private String categoryLabel;
    private String categoryMr;
    private String address;
    private String addressMr;
    private String phone;
    private Double rating;
    private Integer reviewsCount;
    private Double distanceKm;
    private Double lat;
    private Double lng;
    private Boolean verified;
    private String licenseNo;
}
