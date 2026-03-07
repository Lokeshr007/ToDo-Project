// D:\AllProjects\ToDoProject\backend-todo\src\main\java\com\loki\todo\model\AIColumnStructure.java
package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ai_column_structures")
@Data
@NoArgsConstructor
public class AIColumnStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 1000)
    private String columnName;
    private String columnType; // TODO, IN_PROGRESS, REVIEW, DONE, CUSTOM
    private String columnColor;
    private Integer orderIndex;
    private Integer wipLimit;

    @ManyToOne
    @JoinColumn(name = "board_structure_id")
    private AIBoardStructure boardStructure;

    private Long createdColumnId; // Reference to actual BoardColumn
}