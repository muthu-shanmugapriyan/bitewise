package com.bitewise.service;

import com.bitewise.dto.ExpenseDtos.*;
import com.bitewise.entity.*;
import com.bitewise.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class ExpenseService {

    private final CurrentUserService current;
    private final ExpenseRepository expenses;
    private final ExpenseCategoryRepository categories;
    private final AuditLogRepository audit;

    public ExpenseService(
            CurrentUserService c,
            ExpenseRepository e,
            ExpenseCategoryRepository ec,
            AuditLogRepository audit
    ) {
        current = c;
        expenses = e;
        categories = ec;
        this.audit = audit;
    }

    public List<CategoryResponse> categories() {
        return categories
                .findByBusinessIdOrderByName(current.businessId())
                .stream()
                .map(c -> new CategoryResponse(
                        c.getId(),
                        c.getName()
                ))
                .toList();
    }

    @Transactional
    public CategoryResponse addCategory(CategoryRequest r) {

        ExpenseCategory c = categories.save(
                new ExpenseCategory(
                        current.business(),
                        r.name()
                )
        );

        return new CategoryResponse(
                c.getId(),
                c.getName()
        );
    }

    @Transactional
    public ExpenseResponse add(ExpenseRequest r) {

        ExpenseCategory c =
                r.categoryId() == null
                        ? null
                        : categories
                                .findByIdAndBusinessId(
                                        r.categoryId(),
                                        current.businessId()
                                )
                                .orElseThrow(() ->
                                        new IllegalArgumentException(
                                                "Category not found"
                                        )
                                );

        Expense e = expenses.save(
                new Expense(
                        current.business(),
                        c,
                        r.date(),
                        r.description(),
                        r.amount(),
                        r.expenseType(),
                        r.recurring()
                )
        );

        audit.save(new AuditLog(
                current.business(),
                current.user(),
                "CREATE",
                "EXPENSE",
                e.getId(),
                "Logged expense \"" + (e.getDescription() == null ? e.getExpenseType() : e.getDescription())
                        + "\" for " + e.getAmount()
        ));

        return map(e);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> list(
            LocalDate from,
            LocalDate to
    ) {

        return expenses
                .findByBusinessIdAndExpenseDateBetweenOrderByExpenseDateAsc(
                        current.businessId(),
                        from,
                        to
                )
                .stream()
                .map(this::map)
                .toList();
    }

    private ExpenseResponse map(Expense e) {

        return new ExpenseResponse(
                e.getId(),
                e.getExpenseDate(),
                e.getCategory() == null
                        ? null
                        : e.getCategory().getId(),
                e.getCategory() == null
                        ? null
                        : e.getCategory().getName(),
                e.getDescription(),
                e.getAmount(),
                e.getExpenseType(),
                e.isRecurring()
        );
    }
}