// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\utils\planParser.js

export const planParser = {
  /**
   * Parse raw text into a structured plan
   */
  parsePlan: (text) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    
    const plan = {
      title: planParser.extractTitle(lines),
      description: planParser.extractDescription(lines),
      duration: planParser.extractDuration(text),
      topics: planParser.extractTopics(text),
      dailyGoals: planParser.extractDailyGoals(text),
      milestones: planParser.extractMilestones(text),
      prerequisites: planParser.extractPrerequisites(text),
      resources: planParser.extractResources(text)
    };
    
    return plan;
  },

  /**
   * Extract title from lines
   */
  extractTitle: (lines) => {
    // First non-empty line might be the title
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // Title shouldn't be too long or look like a list item
      if (firstLine.length < 100 && !firstLine.match(/^[•\-*\d.]/)) {
        return firstLine;
      }
    }
    
    // Look for common title indicators
    for (const line of lines.slice(0, 5)) {
      if (line.match(/^#\s+/)) { // Markdown heading
        return line.replace(/^#+\s*/, '');
      }
      if (line.match(/^[A-Z][A-Z\s]+$/)) { // ALL CAPS
        return line;
      }
    }
    
    return 'Learning Plan';
  },

  /**
   * Extract description
   */
  extractDescription: (lines) => {
    // Look for paragraph after title
    for (let i = 1; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 50 && !line.match(/^[•\-*\d.]/)) {
        return line;
      }
    }
    
    // Look for introduction section
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('introduction')) {
        if (i + 1 < lines.length) {
          return lines[i + 1].trim();
        }
      }
    }
    
    return '';
  },

  /**
   * Extract duration in days
   */
  extractDuration: (text) => {
    const patterns = [
      /(\d+)[\s-]day/i,
      /(\d+)[\s-]week/i,
      /(\d+)[\s-]month/i,
      /duration[:\s]+(\d+)/i,
      /(\d+)[\s-]day plan/i,
      /(\d+)[\s-]week course/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseInt(match[1]);
        if (pattern.toString().includes('week')) return value * 7;
        if (pattern.toString().includes('month')) return value * 30;
        return value;
      }
    }
    
    return 60; // Default to 60 days
  },

  /**
   * Extract main topics
   */
  extractTopics: (text) => {
    const topics = new Set();
    const lines = text.split('\n');
    
    const topicIndicators = [
      /^#{1,3}\s+(.+)$/gm,  // Markdown headings
      /^[A-Z][A-Z\s]+$/gm,  // ALL CAPS lines
      /^\d+\.\s+([A-Z][^.\n]+)/gm,  // Numbered sections
      /^[•\-*]\s+([A-Z][^.\n]+)/gm,  // Bullet points
      /^topic[s]?[:\s]+(.+)$/gmi,  // "Topics:" lines
      /^subject[s]?[:\s]+(.+)$/gmi,  // "Subjects:" lines
      /^chapter[s]?[:\s]+(.+)$/gmi,  // "Chapters:" lines
      /^module[s]?[:\s]+(.+)$/gmi  // "Modules:" lines
    ];
    
    topicIndicators.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const topic = match[1] || match[0];
        // Clean up the topic
        const cleanTopic = topic
          .replace(/^[•\-*\d.\s]+/, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleanTopic.length > 3 && cleanTopic.length < 50) {
          topics.add(cleanTopic);
        }
      }
    });
    
    // Also look for common topic keywords
    const commonTopics = [
      'introduction', 'basics', 'fundamentals', 'advanced',
      'beginner', 'intermediate', 'expert', 'core',
      'essential', 'important', 'key', 'main'
    ];
    
    commonTopics.forEach(topic => {
      if (text.toLowerCase().includes(topic)) {
        topics.add(topic.charAt(0).toUpperCase() + topic.slice(1));
      }
    });
    
    return Array.from(topics).slice(0, 15);
  },

  /**
   * Extract daily goals
   */
  extractDailyGoals: (text) => {
    const goals = [];
    const lines = text.split('\n');
    
    let currentDay = null;
    let dayPattern = /day\s+(\d+)/i;
    
    lines.forEach(line => {
      line = line.trim();
      
      // Check for day marker
      const dayMatch = line.match(dayPattern);
      if (dayMatch) {
        if (currentDay) {
          goals.push(currentDay);
        }
        currentDay = {
          day: parseInt(dayMatch[1]),
          topics: [],
          tasks: [],
          hours: 2
        };
      }
      // Add topics/tasks to current day
      else if (currentDay) {
        if (line.match(/^[•\-*]\s+/)) {
          const item = line.replace(/^[•\-*]\s+/, '');
          
          // Check if it's a topic or task
          if (item.toLowerCase().includes('topic') || 
              item.toLowerCase().includes('subject') ||
              item.length < 30) {
            currentDay.topics.push(item);
          } else {
            currentDay.tasks.push(item);
          }
        }
        
        // Check for hours
        const hoursMatch = line.match(/(\d+)\s*hours?/i);
        if (hoursMatch) {
          currentDay.hours = parseInt(hoursMatch[1]);
        }
      }
    });
    
    // Add last day
    if (currentDay) {
      goals.push(currentDay);
    }
    
    return goals;
  },

  /**
   * Extract milestones
   */
  extractMilestones: (text) => {
    const milestones = [];
    const lines = text.split('\n');
    
    const milestonePatterns = [
      /milestone[\s:]+(.+)$/i,
      /goal[\s:]+(.+)$/i,
      /achieve[\s:]+(.+)$/i,
      /complete[\s:]+(.+)$/i,
      /finish[\s:]+(.+)$/i,
      /^by\s+day\s+(\d+)[:\s]+(.+)$/i,
      /^day\s+(\d+)[:\s]+(.+)$/i
    ];
    
    lines.forEach(line => {
      line = line.trim();
      
      for (const pattern of milestonePatterns) {
        const match = line.match(pattern);
        if (match) {
          milestones.push({
            day: match[1] ? parseInt(match[1]) : milestones.length * 10 + 10,
            description: match[2] || match[1] || line,
            achieved: false
          });
          break;
        }
      }
    });
    
    // If no milestones found, create default ones
    if (milestones.length === 0) {
      milestones.push(
        { day: 15, description: 'Complete first quarter', achieved: false },
        { day: 30, description: 'Halfway point - Review all material', achieved: false },
        { day: 45, description: 'Three quarters complete', achieved: false },
        { day: 60, description: 'Final review and completion', achieved: false }
      );
    }
    
    return milestones;
  },

  /**
   * Extract prerequisites
   */
  extractPrerequisites: (text) => {
    const prerequisites = [];
    const lines = text.split('\n');
    
    let inPrereqSection = false;
    
    lines.forEach(line => {
      line = line.trim().toLowerCase();
      
      // Check for prerequisites section
      if (line.includes('prerequisite') || 
          line.includes('requirements') || 
          line.includes('you need') ||
          line.includes('before you begin')) {
        inPrereqSection = true;
        return;
      }
      
      // If in prerequisites section, collect bullet points
      if (inPrereqSection) {
        if (line.match(/^[•\-*\d.]\s+/)) {
          prerequisites.push(line.replace(/^[•\-*\d.]\s+/, ''));
        } else if (line.length === 0) {
          inPrereqSection = false;
        } else if (line.length > 0 && !line.match(/^(next|then|after|section|chapter)/)) {
          prerequisites.push(line);
        }
      }
    });
    
    return prerequisites;
  },

  /**
   * Extract resources
   */
  extractResources: (text) => {
    const resources = [];
    const lines = text.split('\n');
    
    const resourceIndicators = [
      'resource', 'material', 'book', 'video', 'course',
      'tutorial', 'guide', 'reference', 'documentation',
      'link', 'url', 'website', 'tool', 'software'
    ];
    
    let inResourceSection = false;
    
    lines.forEach(line => {
      line = line.trim();
      
      // Check for resources section
      if (resourceIndicators.some(ind => line.toLowerCase().includes(ind))) {
        inResourceSection = true;
        return;
      }
      
      // If in resources section, collect items
      if (inResourceSection) {
        if (line.match(/^[•\-*\d.]\s+/)) {
          resources.push(line.replace(/^[•\-*\d.]\s+/, ''));
        } else if (line.match(/^https?:\/\//)) {
          resources.push(line);
        } else if (line.length === 0) {
          inResourceSection = false;
        }
      }
    });
    
    return resources;
  },

  /**
   * Convert parsed plan to tasks
   */
  planToTasks: (plan) => {
    const tasks = [];
    const totalDays = plan.duration || 60;
    
    // If we have daily goals, use them
    if (plan.dailyGoals && plan.dailyGoals.length > 0) {
      plan.dailyGoals.forEach(day => {
        const dayTasks = day.tasks.map((task, index) => ({
          dayNumber: day.day,
          weekNumber: Math.ceil(day.day / 7),
          title: task.length > 50 ? task.substring(0, 50) + '...' : task,
          description: task,
          priority: 'MEDIUM',
          estimatedHours: day.hours / Math.max(day.tasks.length, 1),
          category: plan.topics[0] || 'General',
          tags: day.topics || []
        }));
        tasks.push(...dayTasks);
      });
    } else {
      // Generate default tasks based on topics
      plan.topics.forEach((topic, topicIndex) => {
        const startDay = Math.floor(topicIndex * totalDays / plan.topics.length) + 1;
        const endDay = Math.floor((topicIndex + 1) * totalDays / plan.topics.length);
        
        for (let day = startDay; day <= endDay; day++) {
          tasks.push({
            dayNumber: day,
            weekNumber: Math.ceil(day / 7),
            title: `Study ${topic} - Day ${day}`,
            description: `Continue learning about ${topic}`,
            priority: day % 7 === 0 ? 'LOW' : 'MEDIUM',
            estimatedHours: 2,
            category: topic,
            tags: [topic, 'study']
          });
        }
      });
    }
    
    return tasks;
  },

  /**
   * Validate plan structure
   */
  validate: (plan) => {
    const errors = [];
    const warnings = [];
    
    if (!plan.title || plan.title === 'Learning Plan') {
      warnings.push('Title may not be accurate');
    }
    
    if (!plan.duration || plan.duration < 7) {
      errors.push('Duration should be at least 7 days');
    }
    
    if (!plan.topics || plan.topics.length === 0) {
      errors.push('No topics detected');
    }
    
    if (plan.dailyGoals && plan.dailyGoals.length === 0) {
      warnings.push('No daily goals specified');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
};