package com.project.QLPT.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import com.project.QLPT.entity.HopDong;
import com.project.QLPT.exception.ResourceNotFoundException;
import com.project.QLPT.repository.*;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;

/** Quyền sở hữu và thứ tự khóa chung cho hợp đồng/thành viên. */
@Service
@RequiredArgsConstructor
public class OwnedContractAccess {
    private final HopDongRepository contracts;
    private final PhongRepository rooms;
    private final CurrentAccountService currentAccount;
    @PersistenceContext private EntityManager entityManager;

    @Transactional(readOnly = true)
    public HopDong get(Integer id) {
        return contracts.findByIdAndPhong_NhaTro_ChuTro_Id(id, currentAccount.getChuTro().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hợp đồng"));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public HopDong lock(Integer id) {
        var ownerId = currentAccount.getChuTro().getId();
        var contract = contracts.findByIdAndPhong_NhaTro_ChuTro_Id(id, ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hợp đồng"));
        // Phòng của hợp đồng là bất biến. Mọi ghi HD/TV đều khóa phòng trước.
        var room = rooms.findOwnedForUpdate(contract.getPhong().getId(), ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng"));
        entityManager.refresh(room, LockModeType.PESSIMISTIC_WRITE);
        contract = contracts.findOwnedForUpdate(id, ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hợp đồng"));
        entityManager.refresh(contract, LockModeType.PESSIMISTIC_WRITE);
        return contract;
    }
}
