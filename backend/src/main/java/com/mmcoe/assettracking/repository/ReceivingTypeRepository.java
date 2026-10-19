package com.mmcoe.assettracking.repository;

import com.mmcoe.assettracking.model.ReceivingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReceivingTypeRepository extends JpaRepository<ReceivingType, Integer> {
    List<ReceivingType> findByIsActiveTrueOrderBySortOrderAsc();
}
