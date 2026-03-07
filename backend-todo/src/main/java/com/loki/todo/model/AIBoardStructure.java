// D:\AllProjects\ToDoProject\backend-todo\src\main\java\com\loki\todo\model\AIBoardStructure.java
package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_board_structures")
@Data
@NoArgsConstructor
public class AIBoardStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 1000)
    private String boardName;

    @Column(columnDefinition = "TEXT")
    private String boardDescription;
    private String boardColor;
    private Integer orderIndex;

    @ManyToOne
    @JoinColumn(name = "project_structure_id")
    private AIProjectStructure projectStructure;

    private Long createdBoardId; // Reference to actual Board

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "board_structure_id")
    private List<AIColumnStructure> columns = new ArrayList<>();
}