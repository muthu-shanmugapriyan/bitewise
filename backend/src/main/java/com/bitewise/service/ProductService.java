package com.bitewise.service;

import com.bitewise.dto.ProductDtos.*;
import com.bitewise.entity.*;
import com.bitewise.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final CurrentUserService current;
    private final ProductRepository products;
    private final ProductCategoryRepository categories;
    private final AuditLogRepository audit;

    public ProductService(
            CurrentUserService current,
            ProductRepository products,
            ProductCategoryRepository categories,
            AuditLogRepository audit
    ) {
        this.current = current;
        this.products = products;
        this.categories = categories;
        this.audit = audit;
    }

    // =========================
    // CATEGORIES
    // =========================

    @Transactional(readOnly = true)
    public List<CategoryResponse> categories() {

        UUID businessId = current.businessId();

        return categories
                .findByBusinessIdOrderByName(businessId)
                .stream()
                .map(c -> new CategoryResponse(
                        c.getId(),
                        c.getName(),
                        c.getIconKey()
                ))
                .toList();
    }

    @Transactional
    public CategoryResponse addCategory(CategoryRequest r) {

        Business business = current.business();

        ProductCategory c = new ProductCategory(
                business,
                r.name(),
                r.iconKey()
        );

        c = categories.save(c);

        return new CategoryResponse(
                c.getId(),
                c.getName(),
                c.getIconKey()
        );
    }

    // =========================
    // PRODUCTS
    // =========================

    @Transactional(readOnly = true)
    public List<ProductResponse> products() {

        UUID businessId = current.businessId();

        return products
                .findByBusinessIdAndActiveTrueOrderByName(businessId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Transactional
    public ProductResponse add(ProductRequest r) {

        Business business = current.business();

        ProductCategory category = null;

        if (r.categoryId() != null) {

            category = categories
                    .findById(r.categoryId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Category not found: " + r.categoryId()
                            )
                    );

            // Explicit business ownership check
            if (!category.getBusiness().getId().equals(business.getId())) {

                throw new IllegalArgumentException(
                        "Category belongs to a different business. "
                        + "Category business: "
                        + category.getBusiness().getId()
                        + ", Current business: "
                        + business.getId()
                );
            }
        }

        Product p = new Product(
                business,
                category,
                r.name(),
                r.iconKey(),
                r.sellingPrice(),
                r.costPrice()
        );

        p = products.save(p);

        audit.save(new AuditLog(
                business,
                current.user(),
                "CREATE",
                "PRODUCT",
                p.getId(),
                "Added product \"" + p.getName() + "\""
        ));

        return map(p);
    }

    @Transactional
    public ProductResponse update(UUID id, ProductRequest r) {

        Business business = current.business();

        // Find product belonging to current business
        Product p = products
                .findByIdAndBusinessId(id, business.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Product not found: " + id
                        )
                );

        ProductCategory category = null;

        if (r.categoryId() != null) {

            category = categories
                    .findById(r.categoryId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Category not found: "
                                    + r.categoryId()
                            )
                    );

            // Explicit business ownership check
            if (!category.getBusiness().getId().equals(business.getId())) {

                throw new IllegalArgumentException(
                        "Category belongs to a different business. "
                        + "Category business: "
                        + category.getBusiness().getId()
                        + ", Current business: "
                        + business.getId()
                );
            }
        }

        p.update(
                category,
                r.name(),
                r.iconKey(),
                r.sellingPrice(),
                r.costPrice(),
                r.active() == null || r.active()
        );

        p = products.save(p);

        audit.save(new AuditLog(
                business,
                current.user(),
                "UPDATE",
                "PRODUCT",
                p.getId(),
                "Updated product \"" + p.getName() + "\""
        ));

        return map(p);
    }

    @Transactional
    public void delete(UUID id) {

        Business business = current.business();

        Product p = products
                .findByIdAndBusinessId(id, business.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Product not found: " + id
                        )
                );

        p.update(
                p.getCategory(),
                p.getName(),
                p.getIconKey(),
                p.getSellingPrice(),
                p.getCostPrice(),
                false
        );

        products.save(p);

        audit.save(new AuditLog(
                business,
                current.user(),
                "DELETE",
                "PRODUCT",
                p.getId(),
                "Removed product \"" + p.getName() + "\" from the menu"
        ));
    }

    // =========================
    // RESPONSE MAPPING
    // =========================

    private ProductResponse map(Product p) {

        BigDecimal profit =
                p.getSellingPrice()
                        .subtract(p.getCostPrice());

        BigDecimal margin =
                p.getSellingPrice().signum() == 0
                        ? BigDecimal.ZERO
                        : profit
                                .multiply(BigDecimal.valueOf(100))
                                .divide(
                                        p.getSellingPrice(),
                                        2,
                                        RoundingMode.HALF_UP
                                );

        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getCategory() == null
                        ? null
                        : p.getCategory().getId(),
                p.getCategory() == null
                        ? null
                        : p.getCategory().getName(),
                p.getIconKey(),
                p.getSellingPrice(),
                p.getCostPrice(),
                profit,
                margin,
                p.isActive()
        );
    }
}