package com.mmcoe.assettracking.repository;

import com.mmcoe.assettracking.model.DisposalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisposalRequestRepository extends JpaRepository<DisposalRequest, Integer> {
    List<DisposalRequest> findAllByOrderByRequestDateDesc();
    List<DisposalRequest> findByStatusOrderByRequestDateDesc(String status);
    long countByStatusIgnoreCase(String status);

    @Query("SELECT d.status, COUNT(d) FROM DisposalRequest d GROUP BY d.status")
    List<Object[]> countByStatusGroup();
}
