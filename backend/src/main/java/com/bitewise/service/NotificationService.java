package com.bitewise.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Notification abstraction used for every outbound message BiteWise sends
 * (password resets, and daily/weekly/monthly/quarterly/annual reports).
 *
 * Email is optional: if no SMTP host is configured (MAIL_HOST env var),
 * every message is still logged in full so the whole app remains usable
 * and testable without real mail credentials. A misbehaving mail server
 * is also never allowed to break the calling flow -- failures are logged,
 * not thrown.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${bitewise.mail.from:no-reply@bitewise.local}")
    private String fromAddress;

    public NotificationService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    public void sendDailySummary(String destination, String message) {
        send(destination, "Your BiteWise daily summary", message, "DAILY");
    }

    public void sendWeeklyReport(String destination, String message) {
        send(destination, "Your BiteWise weekly report", message, "WEEKLY");
    }

    public void sendMonthlyReport(String destination, String message) {
        send(destination, "Your BiteWise monthly report", message, "MONTHLY");
    }

    public void sendQuarterlyReport(String destination, String message) {
        send(destination, "Your BiteWise quarterly report", message, "QUARTERLY");
    }

    public void sendAnnualReport(String destination, String message) {
        send(destination, "Your BiteWise annual report", message, "ANNUAL");
    }

    public void sendPasswordReset(String destination, String resetLink) {
        String body = "We received a request to reset your BiteWise password.\n\n"
                + "Reset it here (this link is valid for 30 minutes):\n" + resetLink + "\n\n"
                + "If you didn't request this, you can safely ignore this email.";
        send(destination, "Reset your BiteWise password", body, "PASSWORD_RESET");
    }

    private void send(String destination, String subject, String body, String kind) {

    log.info("[EMAIL:{}] to={} subject=\"{}\"\n{}", kind, destination, subject, body);

    JavaMailSender sender = mailSenderProvider.getIfAvailable();

    if (sender == null) {
        log.error(
                "[EMAIL:{}] JavaMailSender bean is NOT available. Check spring.mail configuration.",
                kind
        );
        return;
    }

    try {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(fromAddress);
        mail.setTo(destination);
        mail.setSubject(subject);
        mail.setText(body);

        log.info("[EMAIL:{}] Attempting SMTP send...", kind);

        sender.send(mail);

        log.info("[EMAIL:{}] SMTP send completed successfully to {}", kind, destination);

    } catch (Exception e) {
        log.error("[EMAIL:{}] FAILED to send to {}", kind, destination, e);
    }
}
}
