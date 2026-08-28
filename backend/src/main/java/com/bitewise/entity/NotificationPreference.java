package com.bitewise.entity;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name="notification_preferences")
public class NotificationPreference {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @OneToOne(fetch=FetchType.LAZY) @JoinColumn(name="business_id",nullable=false,unique=true) private Business business;
    private boolean dailySummary, weeklyReport, monthlyReport, quarterlyReport, annualReport, emailEnabled;
    private LocalTime preferredReportTime=LocalTime.of(21,30);

    public NotificationPreference(){}
    public NotificationPreference(Business b){business=b;}
    public Business getBusiness(){return business;}
    public boolean isDailySummary(){return dailySummary;}
    public boolean isWeeklyReport(){return weeklyReport;}
    public boolean isMonthlyReport(){return monthlyReport;}
    public boolean isQuarterlyReport(){return quarterlyReport;}
    public boolean isAnnualReport(){return annualReport;}
    public boolean isEmailEnabled(){return emailEnabled;}
    public LocalTime getPreferredReportTime(){return preferredReportTime;}
    public void update(boolean d,boolean w,boolean m,boolean q,boolean a,boolean e,LocalTime t){
        dailySummary=d; weeklyReport=w; monthlyReport=m; quarterlyReport=q; annualReport=a; emailEnabled=e; preferredReportTime=t;
    }
}
