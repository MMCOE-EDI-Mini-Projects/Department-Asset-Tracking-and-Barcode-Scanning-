package com.mmcoe.assettracking.model;

import jakarta.persistence.*;

@Entity
@Table(name = "code_sequences")
public class CodeSequence {
    @Id
    @Column(name = "seq_key", length = 50)
    private String seqKey;

    @Column(name = "current_value", nullable = false)
    private Long currentValue = 1000L;

    public CodeSequence() {}

    public CodeSequence(String seqKey, Long currentValue) {
        this.seqKey = seqKey;
        this.currentValue = currentValue;
    }

    public String getSeqKey() { return seqKey; }
    public void setSeqKey(String seqKey) { this.seqKey = seqKey; }

    public Long getCurrentValue() { return currentValue; }
    public void setCurrentValue(Long currentValue) { this.currentValue = currentValue; }
}
