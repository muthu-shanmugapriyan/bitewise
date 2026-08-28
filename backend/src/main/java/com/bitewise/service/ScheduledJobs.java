package com.bitewise.service;

import com.bitewise.dto.AnalyticsDtos.*;
import com.bitewise.entity.Business;
import com.bitewise.entity.NotificationPreference;
import com.bitewise.repository.NotificationPreferenceRepository;
import com.bitewise.security.UserDetailsServiceImpl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Generates and emails BiteWise's scheduled reports.
 *
 * AnalyticsService/CurrentUserService are tenant-scoped through Spring
 * Security's SecurityContextHolder (they always operate on "the current
 * business"), which only exists during a real HTTP request. To reuse that
 * exact same tenant-scoped logic here -- rather than duplicating it -- each
 * job briefly authenticates as the business owner it's currently
 * processing, on this job's own background thread, then clears that
 * context immediately after. This never touches or interferes with any
 * concurrent web request's security context.
 */
@Component
public class ScheduledJobs {

    private static final Logger log = LoggerFactory.getLogger(ScheduledJobs.class);

    private final NotificationPreferenceRepository prefs;
    private final UserDetailsServiceImpl userDetailsService;
    private final AnalyticsService analytics;
    private final NotificationService notifications;

    public ScheduledJobs(
            NotificationPreferenceRepository prefs,
            UserDetailsServiceImpl userDetailsService,
            AnalyticsService analytics,
            NotificationService notifications
    ) {
        this.prefs = prefs;
        this.userDetailsService = userDetailsService;
        this.analytics = analytics;
        this.notifications = notifications;
    }

    /** Every day at 9:30 PM -- same-day summary. */
    @Scheduled(cron = "0 30 21 * * *")
    public void dailySummaryJob() {
        LocalDate today = LocalDate.now();
        runForEachBusiness(
                prefs.findByDailySummaryTrue(),
                today,
                today,
                "Daily Summary",
                notifications::sendDailySummary
        );
    }

    /** Every Monday at 9:00 AM -- the 7 days just finished. */
    @Scheduled(cron = "0 0 9 * * MON")
    public void weeklyReportJob() {
        LocalDate to = LocalDate.now().minusDays(1);
        LocalDate from = to.minusDays(6);
        runForEachBusiness(
                prefs.findByWeeklyReportTrue(),
                from,
                to,
                "Weekly Report",
                notifications::sendWeeklyReport
        );
    }

    /** 1st of every month at 8:00 AM -- the month that just ended. */
    @Scheduled(cron = "0 0 8 1 * *")
    public void monthlyReportJob() {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        LocalDate from = lastMonth.withDayOfMonth(1);
        LocalDate to = lastMonth.withDayOfMonth(lastMonth.lengthOfMonth());
        runForEachBusiness(
                prefs.findByMonthlyReportTrue(),
                from,
                to,
                "Monthly Report",
                notifications::sendMonthlyReport
        );
    }

    /** 1st of Jan/Apr/Jul/Oct at 8:00 AM -- the quarter that just ended. */
    @Scheduled(cron = "0 0 8 1 1,4,7,10 *")
    public void quarterlyReportJob() {
        LocalDate now = LocalDate.now();
        int currentQuarterStartMonth = ((now.getMonthValue() - 1) / 3) * 3 + 1;
        LocalDate thisQuarterStart = LocalDate.of(now.getYear(), currentQuarterStartMonth, 1);
        LocalDate to = thisQuarterStart.minusDays(1);
        LocalDate from = to.withDayOfMonth(1).minusMonths(2);
        runForEachBusiness(
                prefs.findByQuarterlyReportTrue(),
                from,
                to,
                "Quarterly Report",
                notifications::sendQuarterlyReport
        );
    }

    /** Jan 1st at 8:00 AM -- the year that just ended. */
    @Scheduled(cron = "0 0 8 1 1 *")
    public void annualReportJob() {
        int lastYear = LocalDate.now().getYear() - 1;
        LocalDate from = LocalDate.of(lastYear, 1, 1);
        LocalDate to = LocalDate.of(lastYear, 12, 31);
        runForEachBusiness(
                prefs.findByAnnualReportTrue(),
                from,
                to,
                "Annual Report",
                notifications::sendAnnualReport
        );
    }

    private void runForEachBusiness(
            List<NotificationPreference> applicable,
            LocalDate from,
            LocalDate to,
            String label,
            java.util.function.BiConsumer<String, String> sender
    ) {
        for (NotificationPreference pref : applicable) {
            Business business = pref.getBusiness();
            if (!pref.isEmailEnabled()) {
                continue;
            }
            try {
                impersonate(business);
                PeriodReport report = analytics.report(from, to);
                String message = buildMessage(business, label, from, to, report);
                sender.accept(business.getUser().getEmail(), message);
            } catch (Exception e) {
                log.warn(
                        "Failed to generate {} for business {}: {}",
                        label, business.getId(), e.getMessage()
                );
            } finally {
                SecurityContextHolder.clearContext();
            }
        }
    }

    private void impersonate(Business business) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(business.getUser().getEmail());
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    public String buildMessage(
            Business business,
            String label,
            LocalDate from,
            LocalDate to,
            PeriodReport report
    ) {
        Summary s = report.summary();
        StringBuilder sb = new StringBuilder();

        sb.append(business.getName()).append(" -- ").append(label).append("\n");
        sb.append(from).append(" to ").append(to).append("\n\n");
        sb.append("Revenue: ").append(money(s.revenue(), business)).append("\n");
        sb.append("Expenses: ").append(money(s.expenses(), business)).append("\n");
        sb.append("Net Profit: ").append(money(s.profit(), business)).append("\n");
        sb.append("Profit Margin: ").append(s.margin()).append("%\n");
        sb.append("Orders: ").append(s.orders()).append("\n");
        sb.append("Units Sold: ").append(s.unitsSold()).append("\n");

        List<ProductPerformance> products = report.products();
        if (!products.isEmpty()) {
            ProductPerformance top = products.get(0);
            sb.append("\nTop Product: ").append(top.productName())
                    .append(" (").append(money(top.profit(), business)).append(" profit)\n");
        }

        List<ExpenseBreakdown> expenses = report.expenses();
        if (!expenses.isEmpty()) {
            sb.append("\nTop Expense Category: ").append(expenses.get(0).category())
                    .append(" (").append(money(expenses.get(0).amount(), business)).append(")\n");
        }

        if (!report.insights().isEmpty()) {
            sb.append("\nInsights:\n");
            for (String insight : report.insights()) {
                sb.append("- ").append(insight).append("\n");
            }
        }

        return sb.toString();
    }

    private String money(BigDecimal amount, Business business) {
        String currency = business.getCurrency() == null ? "INR" : business.getCurrency();
        String symbol = "INR".equals(currency) ? "\u20B9" : currency + " ";
        return symbol + (amount == null ? BigDecimal.ZERO : amount);
    }
}
