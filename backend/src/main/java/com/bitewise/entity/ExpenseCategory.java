package com.bitewise.entity;
import jakarta.persistence.*; import java.util.UUID;
@Entity @Table(name="expense_categories") public class ExpenseCategory { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="business_id",nullable=false) private Business business; @Column(nullable=false) private String name; public ExpenseCategory(){} public ExpenseCategory(Business b,String n){business=b;name=n;} public UUID getId(){return id;} public Business getBusiness(){return business;} public String getName(){return name;} }
