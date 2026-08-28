package com.bitewise.dto;
import jakarta.validation.constraints.*; import java.time.LocalTime;
public final class BusinessDtos { public record BusinessRequest(@NotBlank String name,@NotBlank String businessType,String location,String currency,LocalTime openingTime,LocalTime closingTime,String operatingDays,String notificationMethod){} public record BusinessResponse(String name,String businessType,String location,String currency,LocalTime openingTime,LocalTime closingTime,String operatingDays,String notificationMethod){} }
