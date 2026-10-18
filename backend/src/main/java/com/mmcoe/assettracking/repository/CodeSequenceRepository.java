package com.mmcoe.assettracking.repository;

import com.mmcoe.assettracking.model.CodeSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodeSequenceRepository extends JpaRepository<CodeSequence, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT cs FROM CodeSequence cs WHERE cs.seqKey = :key")
    Optional<CodeSequence> findBySeqKeyForUpdate(@Param("key") String key);
}
