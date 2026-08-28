package com.bitewise.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public final class NotificationDtos {
    public record PreferenceRequest(boolean dailySummary, boolean weeklyReport, boolean monthlyReport, boolean quarterlyReport, boolean annualReport, boolean emailEnabled, @NotNull LocalTime preferredReportTime){}
    public record PreferenceResponse(boolean dailySummary, boolean weeklyReport, boolean monthlyReport, boolean quarterlyReport, boolean annualReport, boolean emailEnabled, LocalTime preferredReportTime){}
}
