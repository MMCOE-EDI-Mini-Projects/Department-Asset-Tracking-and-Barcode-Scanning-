package com.mmcoe.assettracking.repository;

import com.mmcoe.assettracking.model.AssetTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetTransferRepository extends JpaRepository<AssetTransfer, Integer> {
    List<AssetTransfer> findByAsset_AssetIdOrderByTransferDateDesc(Integer assetId);
    List<AssetTransfer> findAllByOrderByCreatedAtDesc();
}
