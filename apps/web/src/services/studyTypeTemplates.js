/**
 * Study Type Templates - Smart banner generation based on project type
 *
 * This module provides intelligent banner templates based on the project_type field,
 * automatically detecting common patterns and suggesting appropriate banner structures.
 */

// Import banner services
import bannerSync from './bannerSync.js';

/**
 * Study Type Template Definitions
 * Based on analysis of real-world INFUSE and GLP-1 examples
 */
const STUDY_TYPE_TEMPLATES = {
  'Claims Test': {
    name: 'Claims Test',
    description: 'Brand comparison studies with competitive analysis',
    icon: '🏷️',
    priority: ['brand_comparison', 'usage_patterns', 'demographics'],
    autoDetect: {
      brandQuestion: ['S7', 'Q_Brand', 'brand', 'product'],
      usageQuestion: ['Q1', 'usage', 'hours', 'frequency'],
      satisfactionQuestions: ['Q2', 'Q4', 'satisfaction', 'recommend']
    },
    bannerStructure: {
      required: ['Total'],
      brandBased: true,
      crossSegments: ['usage_hours', 'gender', 'age_groups']
    }
  },

  'Brand Tracker': {
    name: 'Brand Tracker',
    description: 'Regular brand performance monitoring',
    icon: '📊',
    priority: ['brand_performance', 'demographics', 'temporal_analysis'],
    autoDetect: {
      brandQuestion: ['S7', 'current_brand', 'brand_use'],
      awarenessQuestions: ['awareness', 'consideration'],
      usageQuestions: ['frequency', 'duration']
    },
    bannerStructure: {
      required: ['Total'],
      brandBased: true,
      crossSegments: ['demographics', 'usage_patterns', 'brand_loyalty']
    }
  },

  'Ad Hoc': {
    name: 'Market Assessment',
    description: 'Simple demographic analysis with flexible structure',
    icon: '🔍',
    priority: ['demographics', 'primary_behavior', 'outcomes'],
    autoDetect: {
      primaryBehavior: ['S6', 'reason', 'primary', 'main_use'],
      demographics: ['S1', 'S2', 'age', 'gender'],
      outcomes: ['side_effects', 'satisfaction', 'experience']
    },
    bannerStructure: {
      required: ['Total'],
      brandBased: false,
      crossSegments: ['demographics', 'behavior_segments', 'outcome_groups']
    }
  },

  'Concept Test': {
    name: 'Concept Test',
    description: 'Product concept evaluation and optimization',
    icon: '🎯',
    priority: ['concept_exposure', 'appeal_metrics', 'demographics'],
    autoDetect: {
      conceptQuestions: ['concept', 'appeal', 'interest', 'purchase_intent'],
      exposurePattern: ['rotation', 'version', 'cell'],
      demographicSplits: ['age', 'gender', 'category_usage']
    },
    bannerStructure: {
      required: ['Total'],
      brandBased: false,
      crossSegments: ['concept_cells', 'appeal_segments', 'demographics']
    }
  },

  'UX Research': {
    name: 'UX Research',
    description: 'User experience and usability analysis',
    icon: '💻',
    priority: ['user_segments', 'experience_metrics', 'task_analysis'],
    autoDetect: {
      userTypes: ['user_type', 'experience_level', 'frequency'],
      taskMetrics: ['ease', 'satisfaction', 'completion'],
      deviceContext: ['device', 'platform', 'context']
    },
    bannerStructure: {
      required: ['Total'],
      brandBased: false,
      crossSegments: ['user_segments', 'experience_levels', 'device_types']
    }
  }
};

/**
 * Get template by project type
 */
export function getStudyTypeTemplate(projectType) {
  return STUDY_TYPE_TEMPLATES[projectType] || STUDY_TYPE_TEMPLATES['Ad Hoc'];
}

/**
 * Get all available templates
 */
export function getAllTemplates() {
  return Object.values(STUDY_TYPE_TEMPLATES);
}

/**
 * Auto-detect questions for banner building based on study type
 */
export function autoDetectBannerQuestions(projectType) {
  const template = getStudyTypeTemplate(projectType);
  const questions = bannerSync.getAvailableQuestions();

  const detected = {
    brandQuestion: null,
    demographicQuestions: [],
    behaviorQuestions: [],
    outcomeQuestions: [],
    suggestions: []
  };

  // Auto-detect based on template patterns
  for (const question of questions) {
    const qid = question.id.toLowerCase();
    const text = question.text.toLowerCase();

    // Brand question detection (for Claims Test, Brand Tracker)
    if (template.autoDetect.brandQuestion) {
      for (const pattern of template.autoDetect.brandQuestion) {
        if (qid.includes(pattern.toLowerCase()) || text.includes(pattern.toLowerCase())) {
          detected.brandQuestion = question;
          break;
        }
      }
    }

    // Demographic questions
    if (qid.match(/^s[1-3]$/) || text.includes('gender') || text.includes('age')) {
      detected.demographicQuestions.push(question);
    }

    // Behavior questions
    if (template.autoDetect.usageQuestion) {
      for (const pattern of template.autoDetect.usageQuestion) {
        if (qid.includes(pattern.toLowerCase()) || text.includes(pattern.toLowerCase())) {
          detected.behaviorQuestions.push(question);
          break;
        }
      }
    }

    // Outcome questions (satisfaction, recommendation, etc.)
    if (template.autoDetect.satisfactionQuestions) {
      for (const pattern of template.autoDetect.satisfactionQuestions) {
        if (text.includes(pattern.toLowerCase())) {
          detected.outcomeQuestions.push(question);
          break;
        }
      }
    }
  }

  return detected;
}

/**
 * Generate smart banner suggestions based on detected questions
 */
export function generateBannerSuggestions(projectType, detectedQuestions) {
  const template = getStudyTypeTemplate(projectType);
  const suggestions = [];

  // Always include Total
  suggestions.push({
    type: 'total',
    name: 'Total',
    description: 'All respondents',
    logic: 'ALL',
    priority: 1
  });

  // Brand-based banners for Claims Test and Brand Tracker
  if (template.brandBased && detectedQuestions.brandQuestion) {
    const brandQ = detectedQuestions.brandQuestion;

    // Add individual brand options as banners
    if (brandQ.options && brandQ.options.length > 0) {
      brandQ.options.slice(0, 4).forEach((option, index) => {
        suggestions.push({
          type: 'brand_segment',
          name: option.label,
          description: `${brandQ.text} = ${option.label}`,
          logic: `${brandQ.id}=${option.code}`,
          priority: 2 + index,
          questionId: brandQ.id,
          optionCode: option.code
        });
      });
    }
  }

  // Demographic banners
  detectedQuestions.demographicQuestions.forEach((question, index) => {
    if (question.id.toLowerCase().includes('gender') || question.text.toLowerCase().includes('gender')) {
      suggestions.push({
        type: 'demographic',
        name: 'Gender Segments',
        description: `Split by ${question.text}`,
        logic: `${question.id}=*`,
        priority: 10 + index,
        questionId: question.id,
        splitType: 'gender'
      });
    }

    if (question.id.toLowerCase().includes('age') || question.text.toLowerCase().includes('age')) {
      suggestions.push({
        type: 'demographic',
        name: 'Age Groups',
        description: `Split by ${question.text}`,
        logic: `${question.id}=*`,
        priority: 11 + index,
        questionId: question.id,
        splitType: 'age'
      });
    }
  });

  // Behavior-based banners
  detectedQuestions.behaviorQuestions.forEach((question, index) => {
    suggestions.push({
      type: 'behavior',
      name: `${question.text} Segments`,
      description: `Split by usage patterns`,
      logic: `${question.id}=*`,
      priority: 20 + index,
      questionId: question.id,
      splitType: 'usage'
    });
  });

  return suggestions.sort((a, b) => a.priority - b.priority);
}

/**
 * Create complex banner logic combinations
 * Example: S7=5 AND (S6=2 OR S6=3) AND S10=14
 */
export function createComplexBannerLogic(conditions) {
  const logicParts = [];

  conditions.forEach(condition => {
    if (condition.operator === 'OR' && condition.values.length > 1) {
      const orParts = condition.values.map(val => `${condition.questionId}=${val}`);
      logicParts.push(`(${orParts.join(' OR ')})`);
    } else {
      logicParts.push(`${condition.questionId}=${condition.value}`);
    }
  });

  return logicParts.join(' AND ');
}

/**
 * Get recommended cross-tabulation structure for study type
 */
export function getRecommendedCrossTabs(projectType, detectedQuestions) {
  const template = getStudyTypeTemplate(projectType);
  const crossTabs = [];

  // Primary business splits
  if (template.brandBased && detectedQuestions.brandQuestion) {
    crossTabs.push({
      type: 'primary',
      name: 'Brand Comparison',
      description: 'Compare performance across brands',
      questions: [detectedQuestions.brandQuestion.id]
    });
  }

  // Secondary demographic splits
  if (detectedQuestions.demographicQuestions.length > 0) {
    crossTabs.push({
      type: 'demographic',
      name: 'Demographic Analysis',
      description: 'Standard demographic breakouts',
      questions: detectedQuestions.demographicQuestions.map(q => q.id)
    });
  }

  // Behavioral splits
  if (detectedQuestions.behaviorQuestions.length > 0) {
    crossTabs.push({
      type: 'behavioral',
      name: 'Usage Patterns',
      description: 'Behavioral segmentation',
      questions: detectedQuestions.behaviorQuestions.map(q => q.id)
    });
  }

  return crossTabs;
}

export default {
  getStudyTypeTemplate,
  getAllTemplates,
  autoDetectBannerQuestions,
  generateBannerSuggestions,
  createComplexBannerLogic,
  getRecommendedCrossTabs
};