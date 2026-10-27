package com.shetsamarthan.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "farms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String farmName;
    private Double farmArea;
    private String cropType;
    private String soilType;
    private String irrigationType;
    private Integer healthScore;
    private String status;
}
