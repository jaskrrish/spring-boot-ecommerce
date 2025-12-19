package com.example.ecommerce.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecommerce.dto.OrderDTO;
import com.example.ecommerce.exceptions.InsufficientStockException;
import com.example.ecommerce.exceptions.ResourceNotFoundException;
import com.example.ecommerce.models.Order;
import com.example.ecommerce.models.OrderStatus;
import com.example.ecommerce.models.Product;
import com.example.ecommerce.models.User;
import com.example.ecommerce.repositories.OrderRepository;
import com.example.ecommerce.repositories.ProductRepository;
import com.example.ecommerce.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return convertToDTO(order);
    }

    public List<OrderDTO> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByOrderStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByUserIdAndStatus(Long userId, OrderStatus status) {
        return orderRepository.findByUserIdAndOrderStatus(userId, status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO createOrder(OrderDTO orderDTO) {
        // Validate user exists
        User user = userRepository.findById(orderDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + orderDTO.getUserId()));
        
        // Validate product exists and has sufficient stock
        Product product = productRepository.findById(orderDTO.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + orderDTO.getProductId()));
        
        int requestedQuantity = orderDTO.getQuantity() != null ? orderDTO.getQuantity() : 1;
        
        if (product.getQuantity() < requestedQuantity) {
            throw new InsufficientStockException("Insufficient stock. Available: " + product.getQuantity() + ", Requested: " + requestedQuantity);
        }
        
        // Reduce product quantity
        product.setQuantity(product.getQuantity() - requestedQuantity);
        productRepository.save(product);
        
        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setProduct(product);
        order.setQuantity(requestedQuantity);
        order.setOrderStatus(OrderStatus.PENDING);
        
        Order savedOrder = orderRepository.save(order);
        return convertToDTO(savedOrder);
    }

    public OrderDTO updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        
        // If order is being cancelled, restore the product quantity
        if (status == OrderStatus.CANCELLED && order.getOrderStatus() != OrderStatus.CANCELLED) {
            Product product = order.getProduct();
            product.setQuantity(product.getQuantity() + order.getQuantity());
            productRepository.save(product);
        }
        
        order.setOrderStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        
        // Restore product quantity if order is not already cancelled
        if (order.getOrderStatus() != OrderStatus.CANCELLED) {
            Product product = order.getProduct();
            product.setQuantity(product.getQuantity() + order.getQuantity());
            productRepository.save(product);
        }
        
        orderRepository.delete(order);
    }

    // Helper method
    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setProductId(order.getProduct().getId());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setQuantity(order.getQuantity());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUserName(order.getUser().getName());
        dto.setProductName(order.getProduct().getProductName());
        return dto;
    }
}
