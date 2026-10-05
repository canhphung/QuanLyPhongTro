package com.project.QLPT.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.QLPT.entity.Phong;

public interface PhongRepository
        extends JpaRepository<Phong, Integer> {
}