package com.bitewise.controller;
import com.bitewise.dto.BusinessDtos.*; import com.bitewise.service.BusinessService; import jakarta.validation.Valid; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/business") public class BusinessController {private final BusinessService service; public BusinessController(BusinessService s){service=s;} @GetMapping public BusinessResponse get(){return service.get();} @PutMapping public BusinessResponse update(@Valid @RequestBody BusinessRequest r){return service.update(r);} }
