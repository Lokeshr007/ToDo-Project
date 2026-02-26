package com.loki.todo.infrastructure.persistence;

import com.loki.todo.domain.repository.TodosDomainRepository;
import com.loki.todo.model.Todos;
import com.loki.todo.model.Workspace;
import com.loki.todo.repository.TodosRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class JpaTodosRepositoryAdapter implements TodosDomainRepository {

    private final TodosRepository jpaRepo;

    public JpaTodosRepositoryAdapter(TodosRepository jpaRepo){
        this.jpaRepo = jpaRepo;
    }

    @Override
    public Todos save(Todos todo){
        return jpaRepo.save(todo);
    }

    @Override
    public Optional<Todos> findById(Long id){
        return jpaRepo.findById(id);
    }

    @Override
    public List<Todos> findByWorkspace(Workspace workspace){
        return jpaRepo.findByWorkspace(workspace);
    }

    @Override
    public void delete(Todos todo){
        jpaRepo.delete(todo);
    }
}
