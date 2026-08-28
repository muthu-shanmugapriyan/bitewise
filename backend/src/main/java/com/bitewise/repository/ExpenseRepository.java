package com.bitewise.repository;

import com.bitewise.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByBusinessIdAndExpenseDateBetween(
            UUID businessId,
            LocalDate from,
            LocalDate to
    );

    List<Expense> findByBusinessIdAndExpenseDateBetweenOrderByExpenseDateAsc(
            UUID businessId,
            LocalDate from,
            LocalDate to
    );
}