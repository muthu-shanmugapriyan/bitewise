package com.bitewise.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_summaries")
public class DailySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "summary_date", nullable = false)
    private LocalDate summaryDate;

    private BigDecimal revenue = BigDecimal.ZERO;
    private BigDecimal productCost = BigDecimal.ZERO;
    private BigDecimal operatingExpenses = BigDecimal.ZERO;
    private BigDecimal grossProfit = BigDecimal.ZERO;
    private BigDecimal netProfit = BigDecimal.ZERO;

    @Column(name = "profit_margin")
    private BigDecimal profitMargin = BigDecimal.ZERO;

    @Column(name = "order_count")
    private int orderCount;

    @Column(name = "units_sold")
    private int unitsSold;

    public DailySummary() {}

    public DailySummary(Business business, LocalDate summaryDate) {
        this.business = business;
        this.summaryDate = summaryDate;
    }

    public void setValues(
            BigDecimal revenue,
            BigDecimal productCost,
            BigDecimal operatingExpenses,
            BigDecimal grossProfit,
            BigDecimal netProfit,
            BigDecimal profitMargin,
            int orderCount,
            int unitsSold
    ) {
        this.revenue = revenue != null ? revenue : BigDecimal.ZERO;
        this.productCost = productCost != null ? productCost : BigDecimal.ZERO;
        this.operatingExpenses = operatingExpenses != null ? operatingExpenses : BigDecimal.ZERO;
        this.grossProfit = grossProfit != null ? grossProfit : BigDecimal.ZERO;
        this.netProfit = netProfit != null ? netProfit : BigDecimal.ZERO;
        this.profitMargin = profitMargin != null ? profitMargin : BigDecimal.ZERO;
        this.orderCount = orderCount;
        this.unitsSold = unitsSold;
    }

    public UUID getId() { return id; }
    public Business getBusiness() { return business; }
    public LocalDate getSummaryDate() { return summaryDate; }
    public BigDecimal getRevenue() { return revenue != null ? revenue : BigDecimal.ZERO; }
    public BigDecimal getProductCost() { return productCost != null ? productCost : BigDecimal.ZERO; }
    public BigDecimal getOperatingExpenses() { return operatingExpenses != null ? operatingExpenses : BigDecimal.ZERO; }
    public BigDecimal getGrossProfit() { return grossProfit != null ? grossProfit : BigDecimal.ZERO; }
    public BigDecimal getNetProfit() { return netProfit != null ? netProfit : BigDecimal.ZERO; }
    public BigDecimal getProfitMargin() { return profitMargin != null ? profitMargin : BigDecimal.ZERO; }
    public int getOrderCount() { return orderCount; }
    public int getUnitsSold() { return unitsSold; }
}
