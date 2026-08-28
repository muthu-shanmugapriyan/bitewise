package com.bitewise.service;

import com.bitewise.dto.AnalyticsDtos.*;
import com.bitewise.entity.*;
import com.bitewise.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.*;
import java.time.*;
import java.util.*;

@Service
public class AnalyticsService {

    private final CurrentUserService current;
    private final SaleRepository sales;
    private final ExpenseRepository expenses;
    private final ProductRepository products;
    private final DailySummaryRepository summaries;

    public AnalyticsService(
            CurrentUserService c,
            SaleRepository s,
            ExpenseRepository e,
            ProductRepository p,
            DailySummaryRepository d
    ) {
        current = c;
        sales = s;
        expenses = e;
        products = p;
        summaries = d;
    }

    @Transactional
    public DailySummary refreshDailySummary(LocalDate date) {

        Business b = current.business();

        Sale sale = sales
                .findByBusinessIdAndSaleDate(b.getId(), date)
                .orElse(null);

        List<Expense> ex = expenses
                .findByBusinessIdAndExpenseDateBetween(
                        b.getId(),
                        date,
                        date
                );

        BigDecimal revenue = BigDecimal.ZERO;
        BigDecimal cost = BigDecimal.ZERO;

        int orders = 0;
        int units = 0;

        if (sale != null) {

            orders = sale.getOrderCount();

            for (SaleItem i : sale.getItems()) {

                units += i.getQuantity();

                revenue = revenue.add(
                        i.getSellingPrice()
                                .multiply(BigDecimal.valueOf(i.getQuantity()))
                );

                cost = cost.add(
                        i.getCostPrice()
                                .multiply(BigDecimal.valueOf(i.getQuantity()))
                );
            }
        }

        BigDecimal op = ex.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal gross = revenue.subtract(cost);

        BigDecimal net = gross.subtract(op);

        BigDecimal margin =
                revenue.signum() == 0
                        ? BigDecimal.ZERO
                        : net.multiply(BigDecimal.valueOf(100))
                                .divide(
                                        revenue,
                                        2,
                                        RoundingMode.HALF_UP
                                );

        DailySummary ds = summaries
                .findByBusinessIdAndSummaryDate(
                        b.getId(),
                        date
                )
                .orElseGet(() -> new DailySummary(b, date));

        ds.setValues(
                revenue,
                cost,
                op,
                gross,
                net,
                margin,
                orders,
                units
        );

        return summaries.save(ds);
    }

    @Transactional
    public Summary summary(LocalDate from, LocalDate to) {

        List<DailySummary> list =
                summaries.findByBusinessIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                        current.businessId(),
                        from,
                        to
                );

        if (list.isEmpty()) {

            for (
                    LocalDate d = from;
                    !d.isAfter(to);
                    d = d.plusDays(1)
            ) {
                refreshDailySummary(d);
            }

            list =
                    summaries.findByBusinessIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                            current.businessId(),
                            from,
                            to
                    );
        }

        return summarize(list);
    }

    @Transactional
    public Dashboard dashboard() {

        LocalDate today = LocalDate.now();

        LocalDate from = today.minusDays(6);

        /*
         * The entire dashboard calculation now runs
         * inside one Hibernate transaction.
         *
         * This prevents LazyInitializationException
         * when accessing Sale.items.
         */
        for (
                LocalDate d = from;
                !d.isAfter(today);
                d = d.plusDays(1)
        ) {
            refreshDailySummary(d);
        }

        Summary t = summary(today, today);

        Summary p = summary(from, today);

        List<DailySummary> ds =
                summaries.findByBusinessIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                        current.businessId(),
                        from,
                        today
                );

        List<DailyPoint> trend =
                ds.stream()
                        .map(d ->
                                new DailyPoint(
                                        d.getSummaryDate(),
                                        d.getRevenue(),
                                        d.getOperatingExpenses(),
                                        d.getNetProfit(),
                                        d.getOrderCount(),
                                        d.getUnitsSold()
                                )
                        )
                        .toList();

        List<ProductPerformance> topProducts =
                productPerformance(from, today)
                        .stream()
                        .sorted(
                                Comparator.comparing(
                                        ProductPerformance::unitsSold
                                ).reversed()
                        )
                        .limit(5)
                        .toList();

        List<ExpenseBreakdown> expenseData =
                expenseBreakdown(from, today);

        List<String> insightData =
                insights(from, today);

        return new Dashboard(
                t,
                p,
                trend,
                topProducts,
                expenseData,
                insightData
        );
    }

    @Transactional
    public PeriodReport report(
            LocalDate from,
            LocalDate to
    ) {

        for (
                LocalDate d = from;
                !d.isAfter(to);
                d = d.plusDays(1)
        ) {
            refreshDailySummary(d);
        }

        List<DailySummary> ds =
                summaries.findByBusinessIdAndSummaryDateBetweenOrderBySummaryDateAsc(
                        current.businessId(),
                        from,
                        to
                );

        Summary s = summarize(ds);

        List<DailyPoint> trend =
                ds.stream()
                        .map(d ->
                                new DailyPoint(
                                        d.getSummaryDate(),
                                        d.getRevenue(),
                                        d.getOperatingExpenses(),
                                        d.getNetProfit(),
                                        d.getOrderCount(),
                                        d.getUnitsSold()
                                )
                        )
                        .toList();

        return new PeriodReport(
                from,
                to,
                s,
                trend,
                productPerformance(from, to),
                expenseBreakdown(from, to),
                insights(from, to)
        );
    }

    public List<ProductPerformance> productPerformance(
            LocalDate from,
            LocalDate to
    ) {

        List<Sale> ss =
                sales.findByBusinessIdAndSaleDateBetweenOrderBySaleDateAsc(
                        current.businessId(),
                        from,
                        to
                );

        Map<UUID, Long> qty = new HashMap<>();

        Map<UUID, BigDecimal> rev = new HashMap<>();

        Map<UUID, BigDecimal> cost = new HashMap<>();

        for (Sale s : ss) {

            for (SaleItem i : s.getItems()) {

                qty.merge(
                        i.getProduct().getId(),
                        (long) i.getQuantity(),
                        Long::sum
                );

                rev.merge(
                        i.getProduct().getId(),
                        i.getSellingPrice()
                                .multiply(
                                        BigDecimal.valueOf(
                                                i.getQuantity()
                                        )
                                ),
                        BigDecimal::add
                );

                cost.merge(
                        i.getProduct().getId(),
                        i.getCostPrice()
                                .multiply(
                                        BigDecimal.valueOf(
                                                i.getQuantity()
                                        )
                                ),
                        BigDecimal::add
                );
            }
        }

        BigDecimal total =
                rev.values()
                        .stream()
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return products
                .findByBusinessIdAndActiveTrueOrderByName(
                        current.businessId()
                )
                .stream()
                .filter(p -> qty.containsKey(p.getId()))
                .map(p -> {

                    BigDecimal r = rev.get(p.getId());

                    BigDecimal c = cost.get(p.getId());

                    BigDecimal profit =
                            r.subtract(c);

                    BigDecimal margin =
                            r.signum() == 0
                                    ? BigDecimal.ZERO
                                    : profit
                                            .multiply(
                                                    BigDecimal.valueOf(100)
                                            )
                                            .divide(
                                                    r,
                                                    2,
                                                    RoundingMode.HALF_UP
                                            );

                    BigDecimal share =
                            total.signum() == 0
                                    ? BigDecimal.ZERO
                                    : r
                                            .multiply(
                                                    BigDecimal.valueOf(100)
                                            )
                                            .divide(
                                                    total,
                                                    2,
                                                    RoundingMode.HALF_UP
                                            );

                    return new ProductPerformance(
                            p.getId(),
                            p.getName(),
                            qty.get(p.getId()).intValue(),
                            r,
                            c,
                            profit,
                            margin,
                            share
                    );
                })
                .sorted(
                        Comparator.comparing(
                                ProductPerformance::profit
                        ).reversed()
                )
                .toList();
    }

    public List<ExpenseBreakdown> expenseBreakdown(
            LocalDate from,
            LocalDate to
    ) {

        List<Expense> es =
                expenses.findByBusinessIdAndExpenseDateBetweenOrderByExpenseDateAsc(
                        current.businessId(),
                        from,
                        to
                );

        Map<String, BigDecimal> map =
                new HashMap<>();

        for (Expense e : es) {

            String category =
                    e.getCategory() == null
                            ? "Other"
                            : e.getCategory().getName();

            map.merge(
                    category,
                    e.getAmount(),
                    BigDecimal::add
            );
        }

        BigDecimal total =
                map.values()
                        .stream()
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return map.entrySet()
                .stream()
                .map(e -> {

                    BigDecimal share =
                            total.signum() == 0
                                    ? BigDecimal.ZERO
                                    : e.getValue()
                                            .multiply(
                                                    BigDecimal.valueOf(100)
                                            )
                                            .divide(
                                                    total,
                                                    2,
                                                    RoundingMode.HALF_UP
                                            );

                    return new ExpenseBreakdown(
                            e.getKey(),
                            e.getValue(),
                            share
                    );
                })
                .sorted(
                        Comparator.comparing(
                                ExpenseBreakdown::amount
                        ).reversed()
                )
                .toList();
    }

    public List<String> insights(
            LocalDate from,
            LocalDate to
    ) {

        List<String> out =
                new ArrayList<>();

        Summary s =
                summary(from, to);

        List<ProductPerformance> pp =
                productPerformance(from, to);

        if (!pp.isEmpty()) {

            ProductPerformance best =
                    pp.stream()
                            .max(
                                    Comparator.comparing(
                                            ProductPerformance::unitsSold
                                    )
                            )
                            .orElse(pp.getFirst());

            ProductPerformance profit =
                    pp.stream()
                            .max(
                                    Comparator.comparing(
                                            ProductPerformance::profit
                                    )
                            )
                            .orElse(pp.getFirst());

            out.add(
                    best.productName()
                            + " was your best-selling product with "
                            + best.unitsSold()
                            + " units."
            );

            out.add(
                    profit.productName()
                            + " generated the highest product profit at "
                            + profit.profit()
                            + "."
            );
        }

        List<ExpenseBreakdown> eb =
                expenseBreakdown(from, to);

        if (!eb.isEmpty()) {

            out.add(
                    eb.getFirst().category()
                            + " is your largest expense category at "
                            + eb.getFirst().share()
                            + "% of expenses."
            );
        }

        out.add(
                "Your average profit margin for this period is "
                        + s.margin()
                        + "%."
        );

        return out;
    }

    private Summary summarize(
            List<DailySummary> l
    ) {

        BigDecimal r =
                l.stream()
                        .map(DailySummary::getRevenue)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal e =
                l.stream()
                        .map(DailySummary::getOperatingExpenses)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal p =
                l.stream()
                        .map(DailySummary::getNetProfit)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        int o =
                l.stream()
                        .mapToInt(
                                DailySummary::getOrderCount
                        )
                        .sum();

        int u =
                l.stream()
                        .mapToInt(
                                DailySummary::getUnitsSold
                        )
                        .sum();

        BigDecimal m =
                r.signum() == 0
                        ? BigDecimal.ZERO
                        : p
                                .multiply(
                                        BigDecimal.valueOf(100)
                                )
                                .divide(
                                        r,
                                        2,
                                        RoundingMode.HALF_UP
                                );

        BigDecimal a =
                o == 0
                        ? BigDecimal.ZERO
                        : r.divide(
                                BigDecimal.valueOf(o),
                                2,
                                RoundingMode.HALF_UP
                        );

        return new Summary(
                r,
                e,
                p,
                m,
                o,
                u,
                a
        );
    }
}