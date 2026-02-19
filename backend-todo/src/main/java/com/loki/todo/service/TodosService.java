package com.loki.todo.service;

import com.loki.todo.model.Status;
import com.loki.todo.model.Todos;
import com.loki.todo.repository.TodosRepository;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TodosService {

    @Autowired
    private  TodosRepository repo;

    public  List<Todos> getTask() {
        return repo.findAll();
    }

    public Todos addTask(Todos todos)
    {
        return repo.save(todos);
    }


    public Todos update(Long id,String item) {
        Todos todo = repo.findById(id).orElseThrow(()->new RuntimeException("Wrong ID"));
        todo.setItem(item);

        return repo.save(todo);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public Todos toggleStatus(Long id) {
        Todos t = repo.findById(id).orElseThrow();

        if(t.getStatus().equals(Status.PENDING)){
            t.setStatus(Status.COMPLETED);
        }
        else{
            t.setStatus(Status.PENDING);
        }

        return repo.save(t);
    }
}
