package com.bitewise.repository;

import com.bitewise.entity.Sale;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SaleRepository extends JpaRepository<Sale, UUID> {

    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<Sale> findByBusinessIdAndSaleDate(UUID businessId, LocalDate date);

    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Sale> findByBusinessIdAndSaleDateBetweenOrderBySaleDateAsc(
            UUID businessId,
            LocalDate from,
            LocalDate to
    );
}
