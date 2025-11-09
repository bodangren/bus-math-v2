"use client"

import React from 'react'

interface ReadingLevelAdjusterProps {
  content: string
  level: 'basic' | 'intermediate' | 'advanced'
  language: 'en' | 'zh'
  className?: string
}

/**
 * Content adaptations for different reading levels and languages
 * Maps common educational phrases to their basic/intermediate/advanced equivalents
 */
const contentAdaptations: Record<string, {
  basic: { en: string; zh: string };
  intermediate: { en: string; zh: string };
  advanced: { en: string; zh: string };
}> = {
  "Engaging opener to capture student interest": {
    basic: {
      en: "Fun start to get students excited about learning",
      zh: "有趣的开始，让学生对学习感到兴奋"
    },
    intermediate: {
      en: "Engaging opener to capture student interest",
      zh: "引人入胜的开场，吸引学生的兴趣"
    },
    advanced: {
      en: "Strategic pedagogical engagement mechanism designed to optimize cognitive receptivity",
      zh: "旨在优化认知接受能力的战略性教学参与机制"
    }
  },
  "Introduce key concepts and vocabulary": {
    basic: {
      en: "Learn important business words and ideas",
      zh: "学习重要的商业词汇和概念"
    },
    intermediate: {
      en: "Introduce key concepts and vocabulary",
      zh: "介绍关键概念和词汇"
    },
    advanced: {
      en: "Systematic exposition of fundamental theoretical constructs and specialized terminology",
      zh: "系统阐述基础理论构念和专业术语"
    }
  },
  "Teacher-led practice activities": {
    basic: {
      en: "Practice with teacher help",
      zh: "在老师帮助下练习"
    },
    intermediate: {
      en: "Teacher-led practice activities",
      zh: "教师指导的练习活动"
    },
    advanced: {
      en: "Structured pedagogical scaffolding through guided application exercises",
      zh: "通过指导性应用练习进行结构化教学支架"
    }
  },
  "Student-led practice and exploration": {
    basic: {
      en: "Practice on your own and explore",
      zh: "独立练习和探索"
    },
    intermediate: {
      en: "Student-led practice and exploration",
      zh: "学生主导的练习和探索"
    },
    advanced: {
      en: "Autonomous learning engagement with self-directed investigative methodologies",
      zh: "自主学习参与和自我导向的研究方法"
    }
  },
  "Check for understanding": {
    basic: {
      en: "See what you learned",
      zh: "检查你学到了什么"
    },
    intermediate: {
      en: "Check for understanding",
      zh: "检查理解程度"
    },
    advanced: {
      en: "Formative assessment of cognitive assimilation and comprehension levels",
      zh: "认知同化和理解水平的形成性评估"
    }
  },
  "Wrap up and preview next lesson": {
    basic: {
      en: "Finish today and see what's next",
      zh: "总结今天并预览下一课"
    },
    intermediate: {
      en: "Wrap up and preview next lesson",
      zh: "总结并预览下一课"
    },
    advanced: {
      en: "Synthesize learning outcomes and establish cognitive bridges to subsequent instruction",
      zh: "综合学习成果并建立与后续教学的认知桥梁"
    }
  }
};

/**
 * ReadingLevelAdjuster component
 *
 * Adapts content complexity based on reading level and language preference.
 * Uses predefined adaptations for common phrases and applies general
 * simplification rules for other content.
 *
 * @param content - Text content to adapt
 * @param level - Reading level (basic, intermediate, advanced)
 * @param language - Language preference (en, zh)
 * @param className - Optional CSS classes
 */
export function ReadingLevelAdjuster({
  content,
  level,
  language,
  className = ''
}: ReadingLevelAdjusterProps) {
  // Check if we have adapted content for this text
  const adaptation = contentAdaptations[content];

  if (adaptation) {
    return (
      <span className={className} lang={language === 'en' ? 'en' : 'zh-CN'}>
        {adaptation[level][language]}
      </span>
    );
  }

  // If no specific adaptation exists, apply general simplification rules
  let adaptedContent = content;

  if (level === 'basic') {
    // Simplify complex sentences
    adaptedContent = content
      .replace(/utilize/g, 'use')
      .replace(/facilitate/g, 'help')
      .replace(/demonstrate/g, 'show')
      .replace(/implement/g, 'do')
      .replace(/analyze/g, 'look at')
      .replace(/comprehensive/g, 'complete')
      .replace(/fundamental/g, 'basic')
      .replace(/methodology/g, 'method')
      .replace(/subsequently/g, 'next')
      .replace(/therefore/g, 'so');
  } else if (level === 'advanced') {
    // Add more sophisticated vocabulary where appropriate
    adaptedContent = content
      .replace(/help/g, 'facilitate')
      .replace(/show/g, 'demonstrate')
      .replace(/use/g, 'utilize')
      .replace(/basic/g, 'fundamental')
      .replace(/method/g, 'methodology');
  }

  return (
    <span className={className} lang={language === 'en' ? 'en' : 'zh-CN'}>
      {adaptedContent}
    </span>
  );
}
