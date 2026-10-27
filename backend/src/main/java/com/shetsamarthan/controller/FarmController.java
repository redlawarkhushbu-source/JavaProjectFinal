package com.shetsamarthan.controller;

import com.shetsamarthan.model.Farm;
import com.shetsamarthan.repository.FarmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farms")
@CrossOrigin(origins = "*")
public class FarmController {

    @Autowired
    private FarmRepository farmRepository;

    @GetMapping
    public ResponseEntity<List<Farm>> getAllFarms(@RequestParam(required = false, defaultValue = "1") Long userId) {
        List<Farm> farms = farmRepository.findByUserId(userId);
        if (farms.isEmpty()) {
            Farm defaultFarm = Farm.builder()
                    .userId(userId)
                    .farmName("Shivaji Agricultural Farm")
                    .farmArea(2.4)
                    .cropType("Tomato & Sugarcane")
                    .soilType("Black Soil (Regur)")
                    .irrigationType("Drip Irrigation")
                    .healthScore(86)
                    .status("Healthy")
                    .build();
            farms = List.of(farmRepository.save(defaultFarm));
        }
        return ResponseEntity.ok(farms);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFarm(@PathVariable Long id, @RequestBody Farm updated) {
        return farmRepository.findById(id).map(farm -> {
            farm.setFarmArea(updated.getFarmArea() != null ? updated.getFarmArea() : farm.getFarmArea());
            farm.setCropType(updated.getCropType() != null ? updated.getCropType() : farm.getCropType());
            farm.setSoilType(updated.getSoilType() != null ? updated.getSoilType() : farm.getSoilType());
            farm.setIrrigationType(updated.getIrrigationType() != null ? updated.getIrrigationType() : farm.getIrrigationType());
            return ResponseEntity.ok(farmRepository.save(farm));
        }).orElse(ResponseEntity.notFound().build());
    }
}
