package com.project.QLPT.service.support;

import java.util.Set;
import java.util.function.Function;
import org.springframework.data.domain.*;
import com.project.QLPT.dto.response.PageResponse;
import com.project.QLPT.exception.BusinessException;

public final class PageSupport {
    private PageSupport() {}
    public static Pageable pageable(int page, int size, String sortBy, String direction,
            Set<String> allowed) {
        if (page < 0 || size < 1 || size > 100)
            throw new BusinessException("page từ 0; size từ 1 đến 100");
        if (sortBy == null || !allowed.contains(sortBy))
            throw new BusinessException("Trường sắp xếp không hợp lệ");
        if (!"asc".equalsIgnoreCase(direction) && !"desc".equalsIgnoreCase(direction))
            throw new BusinessException("Chiều sắp xếp phải là asc hoặc desc");
        var sort = Sort.by("desc".equalsIgnoreCase(direction)
            ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        if (!"id".equals(sortBy)) sort = sort.and(Sort.by("id"));
        return PageRequest.of(page, size, sort);
    }
    public static <E, R> PageResponse<R> response(Page<E> page, Function<E, R> mapper) {
        return new PageResponse<>(page.getContent().stream().map(mapper).toList(),
            page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(),
            page.isFirst(), page.isLast());
    }
}
