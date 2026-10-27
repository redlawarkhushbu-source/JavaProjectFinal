package com.shetsamarthan.controller;

import com.shetsamarthan.model.Supplier;
import com.shetsamarthan.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class SupplierController {

    @Autowired
    private SupplierRepository supplierRepository;

    @GetMapping
    public ResponseEntity<List<Supplier>> getSuppliers(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query
    ) {
        if (query != null && !query.trim().isEmpty()) {
            return ResponseEntity.ok(supplierRepository.findByNameContainingIgnoreCase(query));
        }
        if (category != null && !category.equalsIgnoreCase("all")) {
            return ResponseEntity.ok(supplierRepository.findByCategory(category.toLowerCase()));
        }
        return ResponseEntity.ok(supplierRepository.findAll());
    }
}
