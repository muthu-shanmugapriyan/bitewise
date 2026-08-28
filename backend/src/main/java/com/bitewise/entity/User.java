package com.bitewise.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="users")
public class User {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false,unique=true) private String email;
 @Column(name="password_hash",nullable=false) private String passwordHash;
 @Column(name="owner_name",nullable=false) private String ownerName;
 private String phone;
 @Column(name="reset_token") private String resetToken;
 @Column(name="reset_token_expiry") private Instant resetTokenExpiry;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
 public User(){}
 public User(String email,String passwordHash,String ownerName,String phone){this.email=email;this.passwordHash=passwordHash;this.ownerName=ownerName;this.phone=phone;}
 public UUID getId(){return id;} public String getEmail(){return email;} public String getPasswordHash(){return passwordHash;} public String getOwnerName(){return ownerName;} public String getPhone(){return phone;}
 public String getResetToken(){return resetToken;} public Instant getResetTokenExpiry(){return resetTokenExpiry;}
 public void setPasswordHash(String hash){this.passwordHash=hash;}
 public void startPasswordReset(String token, Instant expiry){this.resetToken=token;this.resetTokenExpiry=expiry;}
 public void clearPasswordReset(){this.resetToken=null;this.resetTokenExpiry=null;}
}
