package com.bitewise.service;
import com.bitewise.dto.BusinessDtos.*; import com.bitewise.entity.*; import com.bitewise.repository.BusinessRepository; import com.bitewise.repository.AuditLogRepository; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
@Service public class BusinessService {
    private final CurrentUserService current;
    private final BusinessRepository repo;
    private final AuditLogRepository audit;
    public BusinessService(CurrentUserService c, BusinessRepository r, AuditLogRepository audit){current=c;repo=r;this.audit=audit;}
    public BusinessResponse get(){Business b=current.business();return map(b);}
    @Transactional
    public BusinessResponse update(BusinessRequest r){
        Business b=current.business();
        b.update(r.name(),r.businessType(),r.location(),r.currency()==null?"INR":r.currency(),r.openingTime(),r.closingTime(),r.operatingDays(),r.notificationMethod()==null?"NONE":r.notificationMethod());
        b=repo.save(b);
        audit.save(new AuditLog(b, current.user(), "UPDATE", "BUSINESS", b.getId(), "Updated business profile settings"));
        return map(b);
    }
    private BusinessResponse map(Business b){return new BusinessResponse(b.getName(),b.getBusinessType(),b.getLocation(),b.getCurrency(),b.getOpeningTime(),b.getClosingTime(),b.getOperatingDays(),b.getNotificationMethod());}
}
