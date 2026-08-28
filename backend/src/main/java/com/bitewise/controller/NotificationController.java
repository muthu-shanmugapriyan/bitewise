package com.bitewise.controller;

import com.bitewise.dto.AnalyticsDtos.PeriodReport;
import com.bitewise.dto.AuthDtos.MessageResponse;
import com.bitewise.dto.NotificationDtos.*;
import com.bitewise.entity.*;
import com.bitewise.repository.NotificationPreferenceRepository;
import com.bitewise.service.AnalyticsService;
import com.bitewise.service.CurrentUserService;
import com.bitewise.service.NotificationService;
import com.bitewise.service.ScheduledJobs;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationPreferenceRepository repo;
    private final CurrentUserService current;
    private final AnalyticsService analytics;
    private final NotificationService notifications;
    private final ScheduledJobs scheduledJobs;

    public NotificationController(
            NotificationPreferenceRepository r,
            CurrentUserService c,
            AnalyticsService analytics,
            NotificationService notifications,
            ScheduledJobs scheduledJobs
    ) {
        this.repo = r;
        this.current = c;
        this.analytics = analytics;
        this.notifications = notifications;
        this.scheduledJobs = scheduledJobs;
    }

    @GetMapping("/preferences")
    public PreferenceResponse get() {
        NotificationPreference p = repo.findByBusinessId(current.businessId())
                .orElseGet(() -> repo.save(new NotificationPreference(current.business())));
        return map(p);
    }

    @PutMapping("/preferences")
    public PreferenceResponse update(@Valid @RequestBody PreferenceRequest r) {
        NotificationPreference p = repo.findByBusinessId(current.businessId())
                .orElseGet(() -> new NotificationPreference(current.business()));
        p.update(
                r.dailySummary(), r.weeklyReport(), r.monthlyReport(),
                r.quarterlyReport(), r.annualReport(), r.emailEnabled(),
                r.preferredReportTime()
        );
        return map(repo.save(p));
    }

    /**
     * Manually sends a report for the current business right now, using the
     * exact same report-building and email logic as the scheduled jobs.
     * Lets the whole notification pipeline (report content + email
     * delivery, or the console-log fallback if SMTP isn't configured) be
     * tested on demand instead of waiting for a cron schedule to fire.
     */
    @PostMapping("/send-test/{type}")
    public MessageResponse sendTest(@PathVariable String type) {

        Business business = current.business();
        LocalDate today = LocalDate.now();
        LocalDate from;
        LocalDate to;
        String label;

        switch (type.toLowerCase()) {
            case "daily" -> { from = today; to = today; label = "Daily Summary"; }
            case "weekly" -> { to = today; from = today.minusDays(6); label = "Weekly Report"; }
            case "monthly" -> {
                from = today.withDayOfMonth(1);
                to = today.withDayOfMonth(today.lengthOfMonth());
                label = "Monthly Report";
            }
            case "quarterly" -> {
                int qStartMonth = ((today.getMonthValue() - 1) / 3) * 3 + 1;
                from = LocalDate.of(today.getYear(), qStartMonth, 1);
                to = from.plusMonths(3).minusDays(1);
                label = "Quarterly Report";
            }
            case "annual" -> {
                from = LocalDate.of(today.getYear(), 1, 1);
                to = LocalDate.of(today.getYear(), 12, 31);
                label = "Annual Report";
            }
            default -> throw new IllegalArgumentException(
                    "Unknown report type: " + type
                            + " (expected daily, weekly, monthly, quarterly or annual)"
            );
        }

        PeriodReport report = analytics.report(from, to);
        String message = scheduledJobs.buildMessage(business, label, from, to, report);
        String destination = business.getUser().getEmail();

        switch (type.toLowerCase()) {
            case "daily" -> notifications.sendDailySummary(destination, message);
            case "weekly" -> notifications.sendWeeklyReport(destination, message);
            case "monthly" -> notifications.sendMonthlyReport(destination, message);
            case "quarterly" -> notifications.sendQuarterlyReport(destination, message);
            case "annual" -> notifications.sendAnnualReport(destination, message);
            default -> { /* unreachable, validated above */ }
        }

        return new MessageResponse(
                "Test " + label + " sent to " + destination
                        + " (check your inbox, or the server console/logs if SMTP isn't configured)."
        );
    }

    private PreferenceResponse map(NotificationPreference p) {
        return new PreferenceResponse(
                p.isDailySummary(), p.isWeeklyReport(), p.isMonthlyReport(),
                p.isQuarterlyReport(), p.isAnnualReport(), p.isEmailEnabled(),
                p.getPreferredReportTime()
        );
    }
}
