// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\utils\advancedPlanParser.js
import { extractTextFromFile } from './fileUtils';

export const advancedPlanParser = {
  /**
   * Analyze file content and extract structured information
   */
  analyzeFile: async (file) => {
    const text = await extractTextFromFile(file);
    
    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.name.split('.').pop(),
      ...advancedPlanParser.analyzeText(text)
    };
  },

  /**
   * Analyze text content
   */
  analyzeText: (text) => {
    const lines = text.split('\n');
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);

    return {
      characterCount: text.length,
      wordCount: words.length,
      lineCount: lines.length,
      paragraphCount: paragraphs.length,
      hasHeadings: advancedPlanParser.detectHeadings(text),
      hasBulletPoints: advancedPlanParser.detectBulletPoints(text),
      hasNumberedLists: advancedPlanParser.detectNumberedLists(text),
      hasTables: advancedPlanParser.detectTables(text),
      estimatedReadingTimeMinutes: Math.ceil(words.length / 200),
      complexity: advancedPlanParser.assessComplexity(text),
      topics: advancedPlanParser.extractTopics(text),
      hasDates: advancedPlanParser.detectDates(text),
      dates: advancedPlanParser.extractDates(text),
      structure: advancedPlanParser.analyzeStructure(text)
    };
  },

  /**
   * Detect headings in text
   */
  detectHeadings: (text) => {
    const headingPatterns = [
      /^#{1,6}\s+.+$/gm,  // Markdown headings
      /^[A-Z][A-Z\s]+$/gm,  // ALL CAPS lines
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/gm,  // Title Case lines
      /^\d+\.\s+[A-Z].+$/gm  // Numbered titles
    ];
    
    return headingPatterns.some(pattern => pattern.test(text));
  },

  /**
   * Detect bullet points
   */
  detectBulletPoints: (text) => {
    const bulletPatterns = [
      /^[\s]*[•\-*]\s+.+$/gm,
      /^[\s]*○\s+.+$/gm,
      /^[\s]*▪\s+.+$/gm
    ];
    
    return bulletPatterns.some(pattern => pattern.test(text));
  },

  /**
   * Detect numbered lists
   */
  detectNumberedLists: (text) => {
    const numberedPatterns = [
      /^\s*\d+\.\s+.+$/gm,
      /^\s*\d+\)\s+.+$/gm,
      /^\s*\(\d+\)\s+.+$/gm
    ];
    
    return numberedPatterns.some(pattern => pattern.test(text));
  },

  /**
   * Detect tables
   */
  detectTables: (text) => {
    const tablePatterns = [
      /\|.+\|.+\|/gm,  // Markdown tables
      /\+[-+]+\+[-+]+\+/gm,  // ASCII tables
      /^[\s]*[-]+\s+[-]+\s+[-]+/gm  // Simple tabular data
    ];
    
    return tablePatterns.some(pattern => pattern.test(text));
  },

  /**
   * Detect dates and time references
   */
  detectDates: (text) => {
    const datePatterns = [
      /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/g,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi,
      /\b\d{1,2}(?:st|nd|rd|th)? (?:day|week|month)\b/gi,
      /\b(?:day|week) \d+\b/gi,
      /\b\d{1,2}-day\b/gi
    ];
    
    return datePatterns.some(pattern => pattern.test(text));
  },

  /**
   * Extract all dates from text
   */
  extractDates: (text) => {
    const dates = [];
    const patterns = [
      /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/g,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi,
      /\bday \d+\b/gi,
      /\bweek \d+\b/gi,
      /\bmonth \d+\b/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        dates.push(...matches);
      }
    });
    
    return [...new Set(dates)]; // Remove duplicates
  },

  /**
   * Assess text complexity
   */
  assessComplexity: (text) => {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) return 'SIMPLE';
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    
    if (avgWordsPerSentence < 15 && avgWordLength < 5) return 'SIMPLE';
    if (avgWordsPerSentence < 25 && avgWordLength < 7) return 'MODERATE';
    return 'COMPLEX';
  },

  /**
   * Extract main topics from text
   */
  extractTopics: (text) => {
    const topics = new Set();
    const lines = text.split('\n');
    
    // Look for headings and emphasized text
    lines.forEach(line => {
      line = line.trim();
      
      // Markdown headings
      if (line.startsWith('#')) {
        topics.add(line.replace(/^#+\s*/, '').toLowerCase());
      }
      // ALL CAPS lines
      else if (line.match(/^[A-Z][A-Z\s]+$/) && line.length > 3) {
        topics.add(line.toLowerCase());
      }
      // Numbered sections
      else if (line.match(/^\d+\.\s+[A-Z]/)) {
        topics.add(line.replace(/^\d+\.\s*/, '').toLowerCase());
      }
      // Bold/important terms
      else if (line.includes('**') || line.includes('__')) {
        const matches = line.match(/\*\*([^*]+)\*\*|__([^_]+)__/g);
        if (matches) {
          matches.forEach(m => {
            topics.add(m.replace(/\*\*|__/g, '').toLowerCase());
          });
        }
      }
    });
    
    // Also look for common topic indicators
    const commonTopics = [
      'introduction', 'overview', 'fundamentals', 'basics',
      'advanced', 'expert', 'beginner', 'intermediate',
      'chapter', 'section', 'part', 'module',
      'lesson', 'topic', 'concept', 'principle'
    ];
    
    commonTopics.forEach(topic => {
      if (text.toLowerCase().includes(topic)) {
        topics.add(topic);
      }
    });
    
    return Array.from(topics).slice(0, 10); // Limit to 10 topics
  },

  /**
   * Analyze document structure
   */
  analyzeStructure: (text) => {
    const lines = text.split('\n');
    let currentSection = null;
    const sections = [];
    const structure = {
      hasTOC: false,
      hasIntroduction: false,
      hasConclusion: false,
      hasChapters: false,
      sections: []
    };
    
    lines.forEach((line, index) => {
      line = line.trim();
      
      // Detect table of contents
      if (line.toLowerCase().includes('table of contents') || 
          line.toLowerCase().includes('contents')) {
        structure.hasTOC = true;
      }
      
      // Detect introduction
      if (line.toLowerCase().includes('introduction')) {
        structure.hasIntroduction = true;
        currentSection = { title: 'Introduction', startLine: index, type: 'introduction' };
      }
      
      // Detect conclusion
      if (line.toLowerCase().includes('conclusion') || 
          line.toLowerCase().includes('summary')) {
        structure.hasConclusion = true;
        if (currentSection) {
          currentSection.endLine = index - 1;
          sections.push(currentSection);
        }
        currentSection = { title: 'Conclusion', startLine: index, type: 'conclusion' };
      }
      
      // Detect chapter headings
      if (line.match(/^chapter\s+\d+/i) || line.match(/^part\s+\d+/i)) {
        structure.hasChapters = true;
        if (currentSection) {
          currentSection.endLine = index - 1;
          sections.push(currentSection);
        }
        currentSection = { 
          title: line, 
          startLine: index, 
          type: line.toLowerCase().includes('chapter') ? 'chapter' : 'part'
        };
      }
    });
    
    // Close last section
    if (currentSection) {
      currentSection.endLine = lines.length - 1;
      sections.push(currentSection);
    }
    
    structure.sections = sections;
    return structure;
  },

  /**
   * Parse the document into a structured learning plan
   */
  parseToLearningPlan: (text, analysis) => {
    const plan = {
      title: advancedPlanParser.extractTitle(text),
      description: advancedPlanParser.extractDescription(text),
      duration: advancedPlanParser.extractDuration(text),
      topics: analysis.topics,
      sections: [],
      milestones: [],
      prerequisites: [],
      resources: []
    };
    
    // Extract sections
    const lines = text.split('\n');
    let currentSection = null;
    
    lines.forEach(line => {
      line = line.trim();
      
      // Check for section headers
      if (line.match(/^#{1,3}\s+/)) {
        if (currentSection) {
          plan.sections.push(currentSection);
        }
        currentSection = {
          title: line.replace(/^#+\s*/, ''),
          content: [],
          type: 'section'
        };
      } 
      // Check for milestones
      else if (line.toLowerCase().includes('milestone') || 
               line.toLowerCase().includes('goal')) {
        plan.milestones.push({
          description: line,
          type: line.toLowerCase().includes('milestone') ? 'milestone' : 'goal'
        });
      }
      // Check for prerequisites
      else if (line.toLowerCase().includes('prerequisite') || 
               line.toLowerCase().includes('requirements')) {
        // Next lines might contain prerequisites
      }
      // Add content to current section
      else if (currentSection && line.length > 0) {
        currentSection.content.push(line);
      }
    });
    
    // Add last section
    if (currentSection) {
      plan.sections.push(currentSection);
    }
    
    return plan;
  },

  /**
   * Extract title from document
   */
  extractTitle: (text) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    
    // First non-empty line might be the title
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      
      // Check if it looks like a title (not too long, not a list item)
      if (firstLine.length < 100 && 
          !firstLine.match(/^[•\-*\d.]/) && 
          !firstLine.match(/^[A-Z\s]+$/)) {
        return firstLine;
      }
    }
    
    // Look for markdown heading
    const headingMatch = text.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1];
    }
    
    return 'Learning Plan';
  },

  /**
   * Extract description
   */
  extractDescription: (text) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    
    // Look for paragraph after title
    for (let i = 1; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 50 && !line.match(/^[•\-*\d.]/)) {
        return line;
      }
    }
    
    return 'A comprehensive learning plan';
  },

  /**
   * Extract duration in days
   */
  extractDuration: (text) => {
    const durationPatterns = [
      /(\d+)[\s-]day/i,
      /(\d+)[\s-]week/i,
      /(\d+)[\s-]month/i,
      /duration[:\s]+(\d+)/i
    ];
    
    for (const pattern of durationPatterns) {
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
   * Validate a parsed plan
   */
  validatePlan: (plan) => {
    const issues = [];
    const warnings = [];
    
    if (!plan.title || plan.title === 'Learning Plan') {
      warnings.push('Title might not be accurate');
    }
    
    if (!plan.duration || plan.duration < 7) {
      issues.push('Duration should be at least 7 days');
    }
    
    if (!plan.topics || plan.topics.length === 0) {
      issues.push('No topics detected');
    }
    
    if (!plan.sections || plan.sections.length === 0) {
      warnings.push('No clear sections found');
    }
    
    return {
      valid: issues.length === 0,
      issues,
      warnings
    };
  },

  /**
   * Calculate workload distribution
   */
  calculateWorkloadDistribution: (tasks) => {
    if (!tasks || tasks.length === 0) return {};
    
    const distribution = {
      byWeek: {},
      byDay: {},
      byCategory: {},
      total: tasks.length,
      totalHours: 0
    };
    
    tasks.forEach(task => {
      // By week
      if (task.weekNumber) {
        distribution.byWeek[task.weekNumber] = (distribution.byWeek[task.weekNumber] || 0) + 1;
      }
      
      // By day
      if (task.dayNumber) {
        distribution.byDay[task.dayNumber] = (distribution.byDay[task.dayNumber] || 0) + 1;
      }
      
      // By category
      if (task.category) {
        distribution.byCategory[task.category] = (distribution.byCategory[task.category] || 0) + 1;
      }
      
      // Hours
      if (task.estimatedHours) {
        distribution.totalHours += task.estimatedHours;
      }
    });
    
    return distribution;
  }
};