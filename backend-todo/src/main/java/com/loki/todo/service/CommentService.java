package com.loki.todo.service;

import com.loki.todo.model.Comment;
import com.loki.todo.model.Todos;
import com.loki.todo.model.User;
import com.loki.todo.model.BoardActivity;
import com.loki.todo.repository.CommentRepository;
import com.loki.todo.repository.TodosRepository;
import com.loki.todo.repository.UserRepository;
import com.loki.todo.repository.BoardActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepo;
    private final TodosRepository todoRepo;
    private final UserRepository userRepo;
    private final BoardActivityRepository activityRepo;

    @Transactional
    public Comment addComment(Long todoId, String content, String email) {
        User user = getUserByEmail(email);
        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setTodo(todo);
        comment.setAuthor(user);

        Comment saved = commentRepo.save(comment);

        // Record activity
        if (todo.getBoard() != null) {
            BoardActivity activity = BoardActivity.commentAdded(todo, saved, user);
            activityRepo.save(activity);
        }

        log.info("Comment added to task: {} by user: {}", todoId, email);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Comment> getComments(Long todoId) {
        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        return commentRepo.findByTodoOrderByCreatedAtDesc(todo);
    }

    @Transactional
    public void deleteByTodo(Todos todo) {
        commentRepo.deleteByTodo(todo);
    }

    private User getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
