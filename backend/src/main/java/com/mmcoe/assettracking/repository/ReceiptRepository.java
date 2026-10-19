package com.mmcoe.assettracking.repository;

import com.mmcoe.assettracking.model.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Integer> {
    Optional<Receipt> findByReceiptCode(String receiptCode);
    List<Receipt> findAllByOrderByCreatedAtDesc();
}
