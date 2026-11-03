package com.project.QLPT.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TrangThaiPhongConverter implements AttributeConverter<TrangThaiPhong, String> {

    @Override
    public String convertToDatabaseColumn(TrangThaiPhong attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public TrangThaiPhong convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        String val = dbData.trim();
        try {
            return TrangThaiPhong.valueOf(val);
        } catch (IllegalArgumentException e) {
            String lower = val.toLowerCase();
            if (lower.contains("thu")) return TrangThaiPhong.DANG_THUE;
            if (lower.contains("tr") || lower.contains("còn") || lower.contains("con")) return TrangThaiPhong.TRONG;
            if (lower.contains("bảo") || lower.contains("bao") || lower.contains("tri")) return TrangThaiPhong.BAO_TRI;
            if (lower.contains("ngưng") || lower.contains("ngung")) return TrangThaiPhong.NGUNG_HOAT_DONG;
            return TrangThaiPhong.TRONG;
        }
    }
}
