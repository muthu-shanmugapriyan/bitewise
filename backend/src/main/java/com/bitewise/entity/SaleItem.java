package com.bitewise.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name="sale_items")
public class SaleItem {

    @Id
    @GeneratedValue(strategy=GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="sale_id", nullable=false)
    private Sale sale;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="product_id", nullable=false)
    private Product product;

    @Column(nullable=false)
    private int quantity;

    @Column(name="selling_price", nullable=false)
    private BigDecimal sellingPrice;

    @Column(name="cost_price", nullable=false)
    private BigDecimal costPrice;

    public SaleItem() {}

    public SaleItem(Sale s, Product p, int q) {
        sale = s;
        product = p;
        quantity = q;
        sellingPrice = p.getSellingPrice();
        costPrice = p.getCostPrice();
    }

    public UUID getId() { return id; }
    public Sale getSale() { return sale; }
    public Product getProduct() { return product; }
    public int getQuantity() { return quantity; }
    public BigDecimal getSellingPrice() { return sellingPrice; }
    public BigDecimal getCostPrice() { return costPrice; }

    public void setQuantity(int quantity) { this.quantity = quantity; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }
}
