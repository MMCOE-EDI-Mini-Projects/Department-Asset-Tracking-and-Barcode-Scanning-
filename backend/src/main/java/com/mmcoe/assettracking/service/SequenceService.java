package com.mmcoe.assettracking.service;

import com.mmcoe.assettracking.model.CodeSequence;
import com.mmcoe.assettracking.repository.CodeSequenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
public class SequenceService {
    private final CodeSequenceRepository codeSequenceRepository;

    public SequenceService(CodeSequenceRepository codeSequenceRepository) {
        this.codeSequenceRepository = codeSequenceRepository;
    }

    @Transactional
    public String nextCode(String seqKey, String prefix) {
        CodeSequence seq = codeSequenceRepository.findBySeqKeyForUpdate(seqKey)
                .orElseGet(() -> new CodeSequence(seqKey, 1000L));

        long nextVal = seq.getCurrentValue() + 1;
        seq.setCurrentValue(nextVal);
        codeSequenceRepository.save(seq);

        int year = Year.now().getValue();
        return String.format("%s-%d-%06d", prefix, year, nextVal);
    }
}
