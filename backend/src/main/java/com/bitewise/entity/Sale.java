package com.bitewise.entity;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name="sales")
public class Sale {

    @Id
    @GeneratedValue(strategy=GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="business_id", nullable=false)
    private Business business;

    @Column(name="sale_date", nullable=false)
    private LocalDate saleDate;

    @Column(name="order_count", nullable=false)
    private int orderCount;

    @Column(nullable=false)
    private boolean closed;

    @Column(name="closed_at")
    private Instant closedAt;

    @Column(name="created_at", nullable=false)
    private Instant createdAt = Instant.now();

    @Column(name="updated_at", nullable=false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy="sale", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<SaleItem> items = new ArrayList<>();

    public Sale() {}

    public Sale(Business b, LocalDate d) {
        business = b;
        saleDate = d;
    }

    public UUID getId() { return id; }
    public Business getBusiness() { return business; }
    public LocalDate getSaleDate() { return saleDate; }
    public int getOrderCount() { return orderCount; }
    public boolean isClosed() { return closed; }
    public List<SaleItem> getItems() { return items; }

    public void setOrderCount(int n) {
        orderCount = n;
        updatedAt = Instant.now();
    }

    public void mergeItems(List<SaleItem> incoming) {
        Map<UUID, SaleItem> existingMap = items.stream()
            .collect(Collectors.toMap(i -> i.getProduct().getId(), i -> i));

        for (SaleItem incomingItem : incoming) {
            UUID productId = incomingItem.getProduct().getId();
            SaleItem existing = existingMap.get(productId);
            if (existing != null) {
                existing.setQuantity(incomingItem.getQuantity());
                existing.setSellingPrice(incomingItem.getSellingPrice());
                existing.setCostPrice(incomingItem.getCostPrice());
                existingMap.remove(productId);
            } else {
                items.add(incomingItem);
            }
        }

        for (SaleItem toRemove : existingMap.values()) {
            items.remove(toRemove);
        }

        updatedAt = Instant.now();
    }

    public void close() {
        closed = true;
        closedAt = Instant.now();
        updatedAt = Instant.now();
    }
}
