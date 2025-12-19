package com.example.ecommerce.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ecommerce.models.Order;
import com.example.ecommerce.models.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUserId(Long userId);
    
    List<Order> findByProductId(Long productId);
    
    List<Order> findByOrderStatus(OrderStatus orderStatus);
    
    List<Order> findByUserIdAndOrderStatus(Long userId, OrderStatus orderStatus);
}
