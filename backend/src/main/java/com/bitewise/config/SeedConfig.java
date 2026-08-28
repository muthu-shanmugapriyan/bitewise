package com.bitewise.config;
import com.bitewise.entity.*; import com.bitewise.repository.*; import org.springframework.boot.CommandLineRunner; import org.springframework.context.annotation.*; import org.springframework.security.crypto.password.PasswordEncoder; import java.util.*;
@Configuration public class SeedConfig { @Bean CommandLineRunner seedDefaults(ExpenseCategoryRepository er,ProductCategoryRepository pr){return args->{/* Categories are created per business by setup; no global tenant data. */};} }
