package com.loki.todo.controller;

import com.loki.todo.model.Status;
import com.loki.todo.model.Todos;
import com.loki.todo.service.TodosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/todo")
@CrossOrigin(origins = "http://localhost:5173")
public class TodosController {

    @Autowired
    private TodosService ser;

    @GetMapping("/")
    public List<Todos> getTask(){
        return ser.getTask();
    }

    @PostMapping("/")
    public Todos addTask(@RequestBody Todos todos){
        todos.setStatus(Status.PENDING);
        return ser.addTask(todos);
    }

    @PutMapping("/{id}")
    public Todos updateTask(@PathVariable Long id,
                            @RequestBody Todos todos){

        return ser.update(id, todos.getItem());
    }

    @PutMapping("/status/{id}")
    public Todos udpateStatus(@PathVariable Long id){
        return ser.toggleStatus(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        ser.delete(id);
    }
}
