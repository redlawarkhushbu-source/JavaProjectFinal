package com.shetsamarthan.repository;

import com.shetsamarthan.model.DiagnosisReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DiagnosisReportRepository extends JpaRepository<DiagnosisReport, Long> {
    List<DiagnosisReport> findByUserIdOrderByCreatedAtDesc(Long userId);
}
