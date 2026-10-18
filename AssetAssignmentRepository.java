package com.mmcoe.assettracking.repository;

import com.mmcoe.assettracking.model.AssetAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Integer> {
    List<AssetAssignment> findByAsset_AssetIdOrderByAssignedDateDesc(Integer assetId);
    List<AssetAssignment> findByAssignmentStatusOrderByAssignedDateDesc(String status);
}
