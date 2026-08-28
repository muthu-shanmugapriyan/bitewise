package com.bitewise.dto;

import java.time.Instant;
import java.util.UUID;

public final class AuditLogDtos {
    public record AuditLogEntry(
            UUID id,
            String action,
            String entityType,
            String details,
            String actorName,
            Instant createdAt
    ) {}
}
