package com.shetsamarthan.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "diagnosis_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosisReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String crop;
    private String diseaseName;
    private String diseaseNameMr;
    private Double confidence;
    private String severity;
    private String imageUrl;

    @Column(length = 2000)
    private String cause;

    @Column(length = 2000)
    private String organicTreatment;

    @Column(length = 2000)
    private String chemicalTreatment;

    @Column(length = 2000)
    private String prevention;

    private LocalDateTime createdAt;
}
