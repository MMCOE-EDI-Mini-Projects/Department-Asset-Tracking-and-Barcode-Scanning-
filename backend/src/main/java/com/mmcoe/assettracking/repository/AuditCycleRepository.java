package com.mmcoe.assettracking.repository;

import com.mmcoe.assettracking.model.AuditCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditCycleRepository extends JpaRepository<AuditCycle, Integer> {
    List<AuditCycle> findAllByOrderByCreatedAtDesc();
}
