package com.example.ecommerce.repositories;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ecommerce.models.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByProductNameContainingIgnoreCase(String productName);
    
    List<Product> findByCostLessThanEqual(BigDecimal maxCost);
    
    List<Product> findByQuantityGreaterThan(Integer quantity);
}
