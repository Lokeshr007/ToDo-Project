// com/loki/todo/service/BoardService.java
package com.loki.todo.service;

import com.loki.todo.dto.BoardDTO;
import com.loki.todo.model.*;
import com.loki.todo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepo;
    private final ProjectRepository projectRepo;
    private final MembershipRepository membershipRepo;
    private final UserRepository userRepo;
    private final TodosRepository todosRepo;
    private final BoardColumnRepository columnRepo;

    private Project validateProjectAccess(Long projectId, String email) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isMember = membershipRepo.existsByUserAndWorkspace(user, project.getWorkspace());
        if (!isMember) {
            throw new RuntimeException("You don't have access to this project");
        }

        return project;
    }

    private Board validateBoardAccess(Long boardId, String email) {
        Board board = boardRepo.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        validateProjectAccess(board.getProject().getId(), email);
        return board;
    }

    @Transactional
    public Board createBoard(Long projectId, String name, String description, String color, String email) {
        Project project = validateProjectAccess(projectId, email);

        if (boardRepo.existsByProjectAndName(project, name)) {
            throw new RuntimeException("A board with this name already exists in the project");
        }

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int nextOrder = boardRepo.findByProjectOrderByOrderIndex(project).size();

        Board board = new Board();
        board.setName(name);
        board.setDescription(description != null ? description : "");
        board.setColor(color != null ? color : "#6366f1");
        board.setProject(project);
        board.setCreatedBy(user);
        board.setOrderIndex(nextOrder);

        Board savedBoard = boardRepo.save(board);

        // Create default columns
        createDefaultColumns(savedBoard, user);

        log.info("Board created: {} in project: {} by user: {}", savedBoard.getId(), projectId, email);
        return savedBoard;
    }

    @Transactional
    public BoardColumn createColumn(BoardColumn column) {
        // Validate that the board exists and user has access
        Board board = column.getBoard();
        if (board == null) {
            throw new RuntimeException("Board must be specified for column");
        }

        // Set order index if not set
        if (column.getOrderIndex() == 0) {
            int maxOrder = columnRepo.findByBoardAndDeletedAtIsNullOrderByOrderIndex(board).size();
            column.setOrderIndex(maxOrder);
        }

        // Save the column
        return columnRepo.save(column);
    }

    // Add this method to BoardService.java
    public List<BoardColumn> getColumns(Long boardId) {
        Board board = boardRepo.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        return columnRepo.findByBoardAndDeletedAtIsNullOrderByOrderIndex(board);
    }

    // Also add this method to get columns for a board
    public List<BoardColumn> getBoardColumns(Long boardId) {
        Board board = boardRepo.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        return columnRepo.findByBoardAndDeletedAtIsNullOrderByOrderIndex(board);
    }

    private void createDefaultColumns(Board board, User user) {
        String[] columnNames = {"To Do", "In Progress", "Review", "Done"};
        BoardColumn.ColumnType[] types = {
                BoardColumn.ColumnType.TODO,
                BoardColumn.ColumnType.IN_PROGRESS,
                BoardColumn.ColumnType.REVIEW,
                BoardColumn.ColumnType.DONE
        };
        String[] colors = {"#6b7280", "#3b82f6", "#a855f7", "#22c55e"};

        for (int i = 0; i < columnNames.length; i++) {
            BoardColumn column = new BoardColumn();
            column.setName(columnNames[i]);
            column.setBoard(board);
            column.setOrderIndex(i);
            column.setCreatedBy(user);
            column.setType(types[i]);
            column.setColor(colors[i]);
            BoardColumn savedColumn = columnRepo.save(column);
            if (board.getColumns() != null) {
                board.getColumns().add(savedColumn);
            }
        }
    }

    @Transactional
    public Board updateBoard(Long boardId, String name, String description, String color, String email) {
        Board board = validateBoardAccess(boardId, email);

        if (name != null && !name.trim().isEmpty() && !name.equals(board.getName())) {
            if (boardRepo.existsByProjectAndName(board.getProject(), name)) {
                throw new RuntimeException("A board with this name already exists in the project");
            }
            board.setName(name);
        }

        if (description != null) {
            board.setDescription(description);
        }

        if (color != null) {
            board.setColor(color);
        }

        board.setUpdatedAt(LocalDateTime.now());
        Board updatedBoard = boardRepo.save(board);
        log.info("Board updated: {} by user: {}", boardId, email);
        return updatedBoard;
    }

    @Transactional
    public void deleteBoard(Long boardId, String email) {
        Board board = validateBoardAccess(boardId, email);

        long taskCount = todosRepo.countByBoardId(boardId);
        if (taskCount > 0) {
            throw new RuntimeException("Cannot delete board with existing tasks. Please move or delete all tasks first.");
        }

        boardRepo.delete(board);
        log.info("Board deleted: {} by user: {}", boardId, email);
    }

    public Board getBoard(Long boardId, String email) {
        return validateBoardAccess(boardId, email);
    }

    public List<Board> getBoards(Long projectId, String email) {
        Project project = validateProjectAccess(projectId, email);
        return boardRepo.findByProjectOrderByOrderIndex(project);
    }

    public long getTaskCount(Long boardId) {
        return todosRepo.countByBoardId(boardId);
    }

    public BoardDTO convertToDTO(Board board) {
        long taskCount = getTaskCount(board.getId());
        long completedTaskCount = todosRepo.countByBoardIdAndStatus(board.getId(), Todos.Status.COMPLETED);
        return BoardDTO.fromEntity(board, taskCount, completedTaskCount);
    }

    public List<BoardDTO> convertToDTOs(List<Board> boards) {
        return boards.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public Board duplicateBoard(Long boardId, String email) {
        Board sourceBoard = validateBoardAccess(boardId, email);
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Board newBoard = new Board();
        newBoard.setName(sourceBoard.getName() + " (Copy)");
        newBoard.setDescription(sourceBoard.getDescription());
        newBoard.setColor(sourceBoard.getColor());
        newBoard.setProject(sourceBoard.getProject());
        newBoard.setCreatedBy(user);
        newBoard.setOrderIndex(boardRepo.findByProjectOrderByOrderIndex(sourceBoard.getProject()).size());

        Board savedBoard = boardRepo.save(newBoard);

        List<BoardColumn> sourceColumns = columnRepo.findByBoardAndDeletedAtIsNullOrderByOrderIndex(sourceBoard);
        for (BoardColumn sourceCol : sourceColumns) {
            BoardColumn newCol = new BoardColumn();
            newCol.setName(sourceCol.getName());
            newCol.setDescription(sourceCol.getDescription());
            newCol.setType(sourceCol.getType());
            newCol.setWipLimit(sourceCol.getWipLimit());
            newCol.setColor(sourceCol.getColor());
            newCol.setBoard(savedBoard);
            newCol.setOrderIndex(sourceCol.getOrderIndex());
            newCol.setCreatedBy(user);
            columnRepo.save(newCol);
        }

        log.info("Board duplicated: {} -> {} by user: {}", boardId, savedBoard.getId(), email);
        return savedBoard;
    }

    @Transactional
    public void reorderBoards(List<Map<String, Long>> boardOrder, String email) {
        for (Map<String, Long> order : boardOrder) {
            Long boardId = order.get("boardId");
            Long orderIndex = order.get("orderIndex");

            Board board = boardRepo.findById(boardId)
                    .orElseThrow(() -> new RuntimeException("Board not found"));

            validateProjectAccess(board.getProject().getId(), email);
            board.setOrderIndex(orderIndex);
            boardRepo.save(board);
        }
        log.info("Boards reordered by user: {}", email);
    }
}