package com.mmcoe.assettracking.repository;

import com.mmcoe.assettracking.model.MaintenanceTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, Integer> {
    List<MaintenanceTicket> findAllByOrderByCreatedAtDesc();
    Optional<MaintenanceTicket> findByTicketCode(String ticketCode);
    List<MaintenanceTicket> findByAsset_AssetIdOrderByCreatedAtDesc(Integer assetId);
}
