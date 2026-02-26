// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\utils\aiPromptTemplates.js

export const aiPromptTemplates = {
  /**
   * Template for parsing study plans
   */
  planParsing: (text, context = {}) => {
    return `You are an expert learning path architect. Analyze the following document and create a structured 60-day learning plan.

DOCUMENT CONTENT:
${text.substring(0, 3000)}${text.length > 3000 ? '...' : ''}

USER CONTEXT:
- Learning Style: ${context.learningStyle || 'VISUAL'}
- Attention Span: ${context.attentionSpan || 45} minutes
- Experience Level: ${context.experienceLevel || 'BEGINNER'}

TASK:
Extract and structure the following information:
1. Main subject and learning objectives
2. Core topics and subtopics
3. Any mentioned timeframes or milestones
4. Prerequisites and required resources
5. Difficulty progression

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "title": "Main title of the learning path",
  "description": "Brief overview",
  "durationDays": 60,
  "summary": "Comprehensive summary",
  "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
  "category": "DEVELOPMENT|LANGUAGE|BUSINESS|FITNESS|ACADEMIC",
  "estimatedTotalHours": 240,
  "recommendedDailyHours": 4,
  "confidenceScore": 85,
  "learningObjectives": ["objective1", "objective2"],
  "prerequisites": ["prereq1", "prereq2"],
  "resources": ["resource1", "resource2"],
  "weeklyBreakdown": {
    "week1": {
      "theme": "Foundations",
      "topics": ["topic1", "topic2"],
      "totalHours": 28
    }
  }
}`;
  },

  /**
   * Template for generating daily tasks
   */
  taskGeneration: (plan, context = {}) => {
    return `You are creating a detailed 60-day task list for a structured learning plan.

PLAN DETAILS:
Title: ${plan.title}
Description: ${plan.description}
Difficulty: ${plan.difficulty}
Category: ${plan.category}
Duration: ${plan.durationDays} days
Estimated Total Hours: ${plan.estimatedTotalHours}
Recommended Daily Hours: ${plan.recommendedDailyHours}

USER LEARNING STYLE:
Style: ${context.learningStyle || 'VISUAL'}
Attention Span: ${context.attentionSpan || 45} minutes

TASK GENERATION RULES:
1. Create 3-5 tasks for each day
2. Tasks should be specific and measurable
3. Include mix of: reading, practice, projects, review
4. Progress from fundamentals to advanced
5. Include review days every 7 days
6. Consider user's attention span
7. Add prerequisites where concepts build on each other
8. Include estimated hours for each task

OUTPUT FORMAT:
Return a JSON array with this structure:
[
  {
    "dayNumber": 1,
    "weekNumber": 1,
    "title": "Clear task title",
    "description": "Detailed description",
    "priority": "HIGH|MEDIUM|LOW",
    "estimatedHours": 1.5,
    "category": "Topic category",
    "subCategory": "Specific subtopic",
    "tags": ["tag1", "tag2"],
    "prerequisites": ["Concepts needed"],
    "resourceLinks": "[]",
    "deliverables": "What to produce",
    "orderIndex": 0
  }
]`;
  },

  /**
   * Template for chat conversations
   */
  chat: (message, context = {}, additionalContext = {}) => {
    return `You are an intelligent learning assistant helping a user with their 60-day learning journey.

CURRENT CONTEXT:
- User Name: ${context.userName || 'Learner'}
- Learning Style: ${context.learningStyle || 'VISUAL'}
- Attention Span: ${context.attentionSpan || 45} minutes
- Current Plan: ${context.currentPlan || 'Not specified'}
- Progress: ${context.progress || 0}%

${additionalContext.planSummary ? `Plan Summary: ${additionalContext.planSummary}` : ''}
${additionalContext.currentTask ? `Current Task: ${additionalContext.currentTask}` : ''}

USER MESSAGE:
${message}

RESPONSE GUIDELINES:
1. Be encouraging and supportive
2. Provide specific, actionable advice
3. Reference their learning style and progress
4. Suggest improvements if needed
5. Ask clarifying questions when necessary
6. Keep responses focused on their learning journey
7. Break down complex topics into manageable chunks
8. Suggest study techniques based on their learning style

RESPONSE FORMAT:
Provide a natural, conversational response that helps the user achieve their learning goals.`;
  },

  /**
   * Template for refining existing plans
   */
  refinement: (plan, tasks, instructions, context = {}) => {
    return `You are refining a 60-day learning plan based on user feedback.

CURRENT PLAN:
Title: ${plan.title}
Description: ${plan.description}
Duration: ${plan.durationDays} days

CURRENT TASKS (First 5):
${tasks.slice(0, 5).map(t => `- Day ${t.dayNumber}: ${t.title}`).join('\n')}
... and ${tasks.length - 5} more tasks

USER FEEDBACK/INSTRUCTIONS:
${instructions}

USER LEARNING STYLE:
Style: ${context.learningStyle || 'VISUAL'}
Attention Span: ${context.attentionSpan || 45} minutes

REFINEMENT TASK:
Based on the feedback, adjust the plan and tasks accordingly. Consider:
1. Adjusting difficulty levels
2. Changing task durations
3. Reordering topics
4. Adding or removing tasks
5. Modifying weekly themes
6. Incorporating user's learning style

OUTPUT FORMAT:
Return the complete updated task list in the same JSON format as before.`;
  },

  /**
   * Template for generating project structure
   */
  projectStructure: (plan, tasks) => {
    return `You are organizing a learning plan into a project structure with boards and columns.

PLAN DETAILS:
Title: ${plan.title}
Duration: ${plan.durationDays} days
Total Tasks: ${tasks.length}

TASKS GROUPED BY WEEK:
${Object.entries(
  tasks.reduce((acc, t) => {
    const week = t.weekNumber || Math.ceil(t.dayNumber / 7);
    if (!acc[week]) acc[week] = [];
    acc[week].push(t);
    return acc;
  }, {})
).map(([week, weekTasks]) => 
  `Week ${week}: ${weekTasks.length} tasks`
).join('\n')}

TASK:
Create an optimal project structure with:
1. A main project for the entire learning plan
2. Weekly boards for each week
3. Standard columns (To Do, In Progress, Review, Done)
4. Appropriate WIP limits for each column
5. Color schemes for different weeks/categories

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "projectName": "Project name",
  "projectDescription": "Description",
  "projectColor": "#hexcolor",
  "boards": [
    {
      "boardName": "Week 1 Board",
      "boardDescription": "Description",
      "boardColor": "#hexcolor",
      "orderIndex": 1,
      "columns": [
        {
          "columnName": "To Do",
          "columnType": "TODO",
          "columnColor": "#hexcolor",
          "orderIndex": 0,
          "wipLimit": 0
        }
      ]
    }
  ]
}`;
  },

  /**
   * Template for generating insights and recommendations
   */
  insights: (plan, tasks, progress = {}) => {
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return `You are analyzing a learner's progress and providing insights.

LEARNING PLAN:
Title: ${plan.title}
Duration: ${plan.durationDays} days
Total Tasks: ${tasks.length}

PROGRESS:
Completed: ${completedTasks} (${completionRate.toFixed(1)}%)
In Progress: ${inProgressTasks}
Remaining: ${tasks.length - completedTasks - inProgressTasks}

TASK DISTRIBUTION:
${Object.entries(
  tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {})
).map(([cat, count]) => `- ${cat}: ${count} tasks`).join('\n')}

TASK:
Generate insights and recommendations including:
1. Overall progress assessment
2. Strengths and areas for improvement
3. Pace recommendations
4. Study technique suggestions
5. Motivation tips
6. Potential roadblocks to watch for

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "summary": "Overall progress summary",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "recommendations": ["rec1", "rec2"],
  "pace": "ON_TRACK|BEHIND|AHEAD",
  "motivationTips": ["tip1", "tip2"],
  "nextMilestone": "Description of next major milestone",
  "estimatedCompletion": "Estimated completion date"
}`;
  },

  /**
   * Template for generating study tips based on learning style
   */
  studyTips: (learningStyle, topic, difficulty) => {
    const tips = {
      VISUAL: [
        "Create mind maps and diagrams",
        "Use color-coded notes",
        "Watch video tutorials",
        "Draw concept sketches",
        "Use flashcards with images"
      ],
      AUDITORY: [
        "Record and listen to lectures",
        "Discuss topics with others",
        "Use mnemonic devices",
        "Explain concepts out loud",
        "Listen to educational podcasts"
      ],
      READING: [
        "Take detailed written notes",
        "Read multiple sources",
        "Write summaries",
        "Create outlines",
        "Use textbooks and articles"
      ],
      KINESTHETIC: [
        "Build hands-on projects",
        "Use interactive tutorials",
        "Take frequent breaks to move",
        "Practice with exercises",
        "Create physical models"
      ]
    };

    return `You are providing personalized study tips.

LEARNER PROFILE:
Learning Style: ${learningStyle}
Current Topic: ${topic}
Difficulty Level: ${difficulty}

TASK:
Provide 3-5 specific, actionable study tips tailored to this learner's style and current topic.

RESPONSE FORMAT:
Return a JSON array of tips with this structure:
[
  {
    "tip": "Specific tip description",
    "why": "Why this helps",
    "how": "How to implement it"
  }
]`;
  }
};