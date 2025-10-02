/**
 * SPSS Metadata Generator
 *
 * Generates a metadata file that maps SPSS column names to human-readable labels.
 * This creates a single source of truth that travels with the SPSS export.
 */

/**
 * Generate metadata JSON for SPSS export
 *
 * @param {Object} params
 * @param {string} params.projectId - Project UUID
 * @param {Array} params.questions - Array of question objects from database
 * @param {Object} params.supabase - Supabase client
 * @returns {Promise<Object>} Metadata object
 */
export async function generateSpssMetadata({ projectId, questions, supabase }) {
  console.log('🔄 Generating SPSS metadata for project:', projectId);

  const metadata = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    projectId: projectId,
    questions: {},
    columnMappings: {}
  };

  // Load all options for all questions
  const questionIds = questions.map(q => q.id);
  const { data: options, error } = await supabase
    .from('question_options')
    .select('question_id, option_code, option_label, order_index')
    .in('question_id', questionIds)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('❌ Error loading options:', error);
    throw new Error('Failed to load question options');
  }

  console.log(`✅ Loaded ${options?.length || 0} options`);

  // Build metadata for each question
  questions.forEach(question => {
    const questionCode = question.question_id;
    const questionOptions = options.filter(opt => opt.question_id === question.id);

    metadata.questions[questionCode] = {
      id: question.id,
      text: question.question_text,
      mode: question.question_mode,
      type: question.question_type,
      options: questionOptions.map(opt => ({
        code: opt.option_code,
        label: opt.option_label,
        orderIndex: opt.order_index
      }))
    };

    // Generate column mappings for multi-select and grid questions
    const isMultiOrGrid = ['multi', 'grid_single', 'grid_multi', 'table_single', 'table_multi', 'advanced_table'].includes(question.question_mode);

    if (isMultiOrGrid && questionOptions.length > 0) {
      questionOptions.forEach(opt => {
        // Multi-select columns: S7r1, S7r2, S7r10, etc.
        const columnName = `${questionCode}r${opt.option_code}`;
        metadata.columnMappings[columnName] = {
          questionId: questionCode,
          questionText: question.question_text,
          optionCode: opt.option_code,
          optionLabel: opt.option_label,
          questionMode: question.question_mode
        };
      });
    }
  });

  console.log(`✅ Generated metadata with ${Object.keys(metadata.columnMappings).length} column mappings`);

  return metadata;
}

/**
 * Export metadata as downloadable JSON file
 */
export function downloadMetadataFile(metadata, filename = 'spss_metadata.json') {
  const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse metadata JSON file
 */
export async function parseMetadataFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const metadata = JSON.parse(e.target.result);

        // Validate metadata structure
        if (!metadata.version || !metadata.projectId || !metadata.columnMappings) {
          reject(new Error('Invalid metadata file format'));
          return;
        }

        console.log('✅ Parsed metadata file:', {
          version: metadata.version,
          projectId: metadata.projectId,
          questions: Object.keys(metadata.questions).length,
          columnMappings: Object.keys(metadata.columnMappings).length
        });

        resolve(metadata);
      } catch (error) {
        reject(new Error('Failed to parse metadata file: ' + error.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read metadata file'));
    reader.readAsText(file);
  });
}

/**
 * Get human-readable label for SPSS column using metadata
 */
export function getColumnLabel(columnName, metadata) {
  if (!metadata || !metadata.columnMappings) {
    return columnName;
  }

  const mapping = metadata.columnMappings[columnName];
  if (mapping) {
    return mapping.optionLabel;
  }

  return columnName;
}

/**
 * Validate that SPSS data matches metadata
 */
export function validateSpssData(spssHeaders, metadata) {
  const warnings = [];
  const errors = [];

  // Check for columns in SPSS that aren't in metadata
  spssHeaders.forEach(header => {
    if (header.match(/^[SQ]\d+r\d+$/)) {
      // This is a multi-select/grid column
      if (!metadata.columnMappings[header]) {
        warnings.push(`SPSS column "${header}" not found in metadata`);
      }
    }
  });

  // Check for columns in metadata that aren't in SPSS
  Object.keys(metadata.columnMappings).forEach(columnName => {
    if (!spssHeaders.includes(columnName)) {
      warnings.push(`Metadata column "${columnName}" not found in SPSS data`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
