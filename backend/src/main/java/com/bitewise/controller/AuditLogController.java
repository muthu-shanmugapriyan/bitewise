package com.bitewise.controller;

import com.bitewise.dto.AuditLogDtos.AuditLogEntry;
import com.bitewise.entity.AuditLog;
import com.bitewise.repository.AuditLogRepository;
import com.bitewise.service.CurrentUserService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-log")
public class AuditLogController {

    private final AuditLogRepository repo;
    private final CurrentUserService current;

    public AuditLogController(AuditLogRepository repo, CurrentUserService current) {
        this.repo = repo;
        this.current = current;
    }

    /**
     * Most recent 100 activity entries for the current business (product,
     * expense, business-profile and account changes). Reuses the existing
     * AuditLog entity/repository that was already in place but unused.
     */
    @GetMapping
    public List<AuditLogEntry> list() {
        return repo
                .findTop100ByBusinessIdOrderByCreatedAtDesc(current.businessId())
                .stream()
                .map(this::map)
                .toList();
    }

    private AuditLogEntry map(AuditLog log) {
        return new AuditLogEntry(
                log.getId(),
                log.getAction(),
                log.getEntityType(),
                log.getDetails(),
                log.getActor() == null ? "Unknown" : log.getActor().getOwnerName(),
                log.getCreatedAt()
        );
    }
}
