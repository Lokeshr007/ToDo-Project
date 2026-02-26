package com.loki.todo.service;

import com.loki.todo.dto.TimeBlockDTO;
import com.loki.todo.exception.ResourceNotFoundException;
import com.loki.todo.model.TimeBlock;
import com.loki.todo.model.User;
import com.loki.todo.model.Workspace;
import com.loki.todo.repository.TimeBlockRepository;
import com.loki.todo.repository.TodosRepository;
import com.loki.todo.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeBlockService {

    private final TimeBlockRepository timeBlockRepository;
    private final TodosRepository todosRepository;
    private final WorkspaceRepository workspaceRepository;

    @Transactional
    public TimeBlockDTO createTimeBlock(TimeBlockDTO dto, User user) {
        TimeBlock block = new TimeBlock();
        mapDtoToEntity(dto, block);
        block.setUser(user);

        if (dto.getWorkspaceId() != null) {
            Workspace workspace = workspaceRepository.findById(dto.getWorkspaceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
            block.setWorkspace(workspace);
        }

        // Set date from startTime
        block.setDate(dto.getStartTime().toLocalDate());

        TimeBlock savedBlock = timeBlockRepository.save(block);
        return mapEntityToDto(savedBlock);
    }

    public List<TimeBlockDTO> getTimeBlocks(LocalDate startDate, LocalDate endDate, User user) {
        return timeBlockRepository.findByUserAndDateBetweenOrderByStartTimeAsc(user, startDate, endDate)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    public List<TimeBlockDTO> getTimeBlocks(LocalDate startDate, LocalDate endDate, User user, Long workspaceId) {
        if (workspaceId != null) {
            Workspace workspace = workspaceRepository.findById(workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
            return timeBlockRepository.findByUserAndWorkspaceAndDateBetweenOrderByStartTimeAsc(
                            user, workspace, startDate, endDate)
                    .stream()
                    .map(this::mapEntityToDto)
                    .collect(Collectors.toList());
        }
        return getTimeBlocks(startDate, endDate, user);
    }

    @Transactional
    public TimeBlockDTO updateTimeBlock(Long id, TimeBlockDTO dto, User user) {
        TimeBlock block = findTimeBlockByIdAndUser(id, user);
        mapDtoToEntity(dto, block);
        block.setDate(dto.getStartTime().toLocalDate());
        TimeBlock updatedBlock = timeBlockRepository.save(block);
        return mapEntityToDto(updatedBlock);
    }

    @Transactional
    public void deleteTimeBlock(Long id, User user) {
        TimeBlock block = findTimeBlockByIdAndUser(id, user);
        timeBlockRepository.delete(block);
    }

    @Transactional
    public void reorderTimeBlocks(List<TimeBlockDTO> blocks, User user) {
        for (int i = 0; i < blocks.size(); i++) {
            TimeBlockDTO dto = blocks.get(i);
            TimeBlock block = findTimeBlockByIdAndUser(dto.getId(), user);
            block.setOrderIndex(i);
            timeBlockRepository.save(block);
        }
    }

    @Transactional
    public void completeTimeBlock(Long id, User user) {
        TimeBlock block = findTimeBlockByIdAndUser(id, user);
        block.setCompleted(true);
        block.setCompletedAt(LocalDateTime.now());
        timeBlockRepository.save(block);
    }

    public Long getTotalFocusTime(LocalDate date, User user) {
        List<TimeBlock> completedBlocks = timeBlockRepository.findCompletedBlocksForDay(user.getId(), date);

        return completedBlocks.stream()
                .mapToLong(block -> Duration.between(block.getStartTime(), block.getEndTime()).toMinutes())
                .sum();
    }

    private TimeBlock findTimeBlockByIdAndUser(Long id, User user) {
        return timeBlockRepository.findById(id)
                .filter(block -> block.getUser().equals(user))
                .orElseThrow(() -> new ResourceNotFoundException("Time block not found"));
    }

    private void mapDtoToEntity(TimeBlockDTO dto, TimeBlock entity) {
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setCategory(dto.getCategory());
        entity.setColor(dto.getColor());
        entity.setTodoId(dto.getTodoId());
        entity.setCompleted(dto.getCompleted() != null ? dto.getCompleted() : false);
        entity.setCompletedAt(dto.getCompletedAt());
        entity.setRecurring(dto.getRecurring());
        entity.setRecurringType(dto.getRecurringType());
        entity.setOrderIndex(dto.getOrderIndex());
    }

    private TimeBlockDTO mapEntityToDto(TimeBlock entity) {
        TimeBlockDTO dto = new TimeBlockDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setDate(entity.getDate());
        dto.setCategory(entity.getCategory());
        dto.setColor(entity.getColor());
        dto.setTodoId(entity.getTodoId());
        dto.setCompleted(entity.getCompleted());
        dto.setCompletedAt(entity.getCompletedAt());
        dto.setRecurring(entity.getRecurring());
        dto.setRecurringType(entity.getRecurringType());
        dto.setOrderIndex(entity.getOrderIndex());
        dto.setUserId(entity.getUser().getId());
        if (entity.getWorkspace() != null) {
            dto.setWorkspaceId(entity.getWorkspace().getId());
        }
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}