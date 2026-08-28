package com.bitewise.controller;
import com.bitewise.dto.AnalyticsDtos.PeriodReport; import com.bitewise.service.AnalyticsService; import org.springframework.web.bind.annotation.*; import java.time.LocalDate;
@RestController @RequestMapping("/api/reports") public class ReportController {
    private final AnalyticsService s;
    public ReportController(AnalyticsService s){this.s=s;}

    @GetMapping("/daily") public PeriodReport daily(@RequestParam LocalDate date){return s.report(date,date);}

    @GetMapping("/weekly") public PeriodReport weekly(@RequestParam LocalDate end){return s.report(end.minusDays(6),end);}

    @GetMapping("/monthly") public PeriodReport monthly(@RequestParam int year,@RequestParam int month){
        LocalDate from=LocalDate.of(year,month,1);
        return s.report(from,from.withDayOfMonth(from.lengthOfMonth()));
    }

    @GetMapping("/quarterly") public PeriodReport quarterly(@RequestParam int year,@RequestParam int quarter){
        if (quarter < 1 || quarter > 4) {
            throw new IllegalArgumentException("Quarter must be between 1 and 4");
        }
        int startMonth = (quarter - 1) * 3 + 1;
        LocalDate from = LocalDate.of(year, startMonth, 1);
        LocalDate to = from.plusMonths(3).minusDays(1);
        return s.report(from, to);
    }

    @GetMapping("/annual") public PeriodReport annual(@RequestParam int year){
        return s.report(LocalDate.of(year,1,1), LocalDate.of(year,12,31));
    }

    @GetMapping("/custom") public PeriodReport custom(@RequestParam LocalDate from,@RequestParam LocalDate to){return s.report(from,to);}
}
