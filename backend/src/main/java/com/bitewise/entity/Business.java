package com.bitewise.entity;

import jakarta.persistence.*; import java.time.*; import java.util.UUID;
@Entity @Table(name="businesses")
public class Business {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @OneToOne(optional=false,fetch=FetchType.LAZY) @JoinColumn(name="user_id",nullable=false,unique=true) private User user;
 @Column(nullable=false) private String name; @Column(name="business_type",nullable=false) private String businessType; private String location;
 @Column(nullable=false) private String currency="INR"; @Column(name="opening_time") private LocalTime openingTime; @Column(name="closing_time") private LocalTime closingTime; @Column(name="operating_days") private String operatingDays; @Column(name="notification_method") private String notificationMethod="NONE";
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now(); @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
 public Business(){} public Business(User user,String name,String businessType,String location,String currency){this.user=user;this.name=name;this.businessType=businessType;this.location=location;this.currency=currency==null?"INR":currency;}
 public UUID getId(){return id;} public User getUser(){return user;} public String getName(){return name;} public String getBusinessType(){return businessType;} public String getLocation(){return location;} public String getCurrency(){return currency;} public LocalTime getOpeningTime(){return openingTime;} public LocalTime getClosingTime(){return closingTime;} public String getOperatingDays(){return operatingDays;} public String getNotificationMethod(){return notificationMethod;}
 public void update(String name,String type,String location,String currency,LocalTime open,LocalTime close,String days,String method){this.name=name;this.businessType=type;this.location=location;this.currency=currency;this.openingTime=open;this.closingTime=close;this.operatingDays=days;this.notificationMethod=method;this.updatedAt=Instant.now();}
}
