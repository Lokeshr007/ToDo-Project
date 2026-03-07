package com.loki.todo.model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learning_path_milestones")
@Data
@NoArgsConstructor
public class LearningPathMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private Integer dayNumber;
    private String achievement;

    @ManyToOne
    private LearningPath learningPath;
}