package com.bitewise.service;

import com.bitewise.dto.SalesDtos.*;
import com.bitewise.entity.*;
import com.bitewise.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class SalesService {

    private final CurrentUserService current;
    private final SaleRepository sales;
    private final ProductRepository products;
    private final AnalyticsService analytics;
    private final AuditLogRepository audit;

    public SalesService(
            CurrentUserService current,
            SaleRepository sales,
            ProductRepository products,
            AnalyticsService analytics,
            AuditLogRepository audit
    ) {
        this.current = current;
        this.sales = sales;
        this.products = products;
        this.analytics = analytics;
        this.audit = audit;
    }

    @Transactional
    public DailySaleResponse save(DailySaleRequest request) {

        Business business = current.business();

        Sale sale = sales
                .findByBusinessIdAndSaleDate(
                        business.getId(),
                        request.date()
                )
                .orElseGet(() -> new Sale(business, request.date()));

        if (sale.isClosed()) {
            throw new IllegalStateException(
                    "Day is closed. Reopen/edit workflow is not enabled in MVP."
            );
        }

        sale.setOrderCount(request.orderCount());

        List<SaleItem> items = new ArrayList<>();
        java.util.Map<java.util.UUID, Integer> quantityMap = new java.util.LinkedHashMap<>();

        for (SaleItemRequest itemRequest : request.items()) {
            if (itemRequest.quantity() < 0) {
                throw new IllegalArgumentException(
                        "Quantity cannot be negative"
                );
            }
            java.util.UUID pid = itemRequest.productId();
            quantityMap.put(pid, quantityMap.getOrDefault(pid, 0) + itemRequest.quantity());
        }

        for (java.util.Map.Entry<java.util.UUID, Integer> entry : quantityMap.entrySet()) {
            java.util.UUID productId = entry.getKey();
            int qty = entry.getValue();

            Product product = products
                    .findByIdAndBusinessId(
                            productId,
                            business.getId()
                    )
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Product not found: "
                                            + productId
                            )
                    );

            items.add(
                    new SaleItem(
                            sale,
                            product,
                            qty
                    )
            );
        }

        sale.mergeItems(items);

        sale = sales.save(sale);

        audit.save(
                new AuditLog(
                        business,
                        current.user(),
                        "UPSERT",
                        "SALE",
                        sale.getId(),
                        "Daily sale updated for " + request.date()
                )
        );

        return map(sale);
    }

    @Transactional
    public DailySaleResponse close(LocalDate date) {

        Sale sale = sales
                .findByBusinessIdAndSaleDate(
                        current.businessId(),
                        date
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No daily sale exists for " + date
                        )
                );

        if (!sale.isClosed()) {
            sale.close();
            sales.save(sale);
        }

        analytics.refreshDailySummary(date);

        audit.save(
                new AuditLog(
                        current.business(),
                        current.user(),
                        "CLOSE",
                        "SALE",
                        sale.getId(),
                        "Day closed"
                )
        );

        return map(sale);
    }

    /*
     * IMPORTANT:
     *
     * The GET /api/sales/daily endpoint previously failed with:
     *
     * LazyInitializationException:
     * failed to lazily initialize a collection of role:
     * com.bitewise.entity.Sale.items
     *
     * Keeping this method transactional means Hibernate's session
     * remains open while map() accesses sale.items and product data.
     */
    @Transactional(readOnly = true)
    public DailySaleResponse get(LocalDate date) {

        return sales
                .findByBusinessIdAndSaleDate(
                        current.businessId(),
                        date
                )
                .map(this::map)
                .orElse(
                        new DailySaleResponse(
                                date,
                                0,
                                false,
                                List.of(),
                                new DailySaleResponse.Metrics(
                                        BigDecimal.ZERO,
                                        BigDecimal.ZERO,
                                        BigDecimal.ZERO
                                )
                        )
                );
    }

    private DailySaleResponse map(Sale sale) {

        BigDecimal revenue = BigDecimal.ZERO;
        BigDecimal cost = BigDecimal.ZERO;

        List<DailySaleResponse.Item> items = new ArrayList<>();

        for (SaleItem item : sale.getItems()) {

            BigDecimal itemRevenue =
                    item.getSellingPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            item.getQuantity()
                                    )
                            );

            BigDecimal itemCost =
                    item.getCostPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            item.getQuantity()
                                    )
                            );

            BigDecimal itemProfit =
                    itemRevenue.subtract(itemCost);

            revenue = revenue.add(itemRevenue);
            cost = cost.add(itemCost);

            items.add(
                    new DailySaleResponse.Item(
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            item.getQuantity(),
                            itemRevenue,
                            itemCost,
                            itemProfit
                    )
            );
        }

        BigDecimal grossProfit =
                revenue.subtract(cost);

        return new DailySaleResponse(
                sale.getSaleDate(),
                sale.getOrderCount(),
                sale.isClosed(),
                items,
                new DailySaleResponse.Metrics(
                        revenue,
                        cost,
                        grossProfit
                )
        );
    }
}