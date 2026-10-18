package com.mmcoe.assettracking.repository;

import com.mmcoe.assettracking.model.AuditItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditItemRepository extends JpaRepository<AuditItem, Integer> {
    List<AuditItem> findByAuditCycle_AuditId(Integer auditId);
}
