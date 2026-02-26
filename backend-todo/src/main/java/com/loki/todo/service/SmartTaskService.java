package com.loki.todo.service;

import com.loki.todo.model.Board;
import com.loki.todo.model.SmartTask;
import com.loki.todo.repository.BoardRepository;
import com.loki.todo.repository.SmartTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SmartTaskService {

    @Autowired
    private SmartTaskRepository repo;

    @Autowired
    private BoardRepository boardRepository;

    public SmartTask create(Long boardId,
                            String title,
                            String description){
        Board board = boardRepository.findById(boardId).orElseThrow();

        SmartTask task = new SmartTask();

        task.setTitle(title);
        task.setDescription(description);
        task.setPriority(SmartTask.Priority.MEDIUM);
        task.setStatus(SmartTask.Status.TODO);
        task.setProgress(0);

        task.setBoard(board);

        return repo.save(task);

    }

    public List<SmartTask> getBoardTasks(Long boardId){
        return repo.findByBoardId(boardId);
    }
}
