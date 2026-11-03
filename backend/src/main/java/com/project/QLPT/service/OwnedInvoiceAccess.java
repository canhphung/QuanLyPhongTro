package com.project.QLPT.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import com.project.QLPT.entity.HoaDon;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.HoaDonRepository;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;

/** Mọi ghi hóa đơn/chi tiết khóa phòng → hợp đồng → hóa đơn. */
@Service
@RequiredArgsConstructor
public class OwnedInvoiceAccess {
    private final HoaDonRepository invoices;
    private final OwnedContractAccess contracts;
    private final CurrentAccountService currentAccount;
    @PersistenceContext private EntityManager entityManager;

    @Transactional(readOnly = true)
    public HoaDon get(Integer id) {
        return invoices.findByIdAndHopDong_Phong_NhaTro_ChuTro_Id(id, currentAccount.getChuTro().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn"));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public HoaDon lock(Integer id) {
        var invoice = get(id);
        contracts.lock(invoice.getHopDong().getId());
        invoice = invoices.findOwnedForUpdate(id, currentAccount.getChuTro().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn"));
        entityManager.refresh(invoice, LockModeType.PESSIMISTIC_WRITE);
        return invoice;
    }
}
