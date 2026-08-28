package com.bitewise.repository;

import com.bitewise.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductCategoryRepository
        extends JpaRepository<ProductCategory, UUID> {

    List<ProductCategory> findByBusinessIdOrderByName(UUID businessId);

    @Query("""
        SELECT c
        FROM ProductCategory c
        WHERE c.id = :categoryId
          AND c.business.id = :businessId
    """)
    Optional<ProductCategory> findByIdAndBusinessId(
            @Param("categoryId") UUID categoryId,
            @Param("businessId") UUID businessId
    );
}