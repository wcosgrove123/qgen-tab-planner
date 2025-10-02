import supabase from '../lib/supa.js';
import { setStatus } from '../lib/status.js'; // Ensure setStatus is imported
import { logActivity, ACTIVITY_TYPES } from '../lib/activityLogger.js';

// Helper function to generate UUIDs
function uuid_generate_v4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * NEW: Saves the entire current project state to the database.
 * This is the modern replacement for the legacy autosaveNow function.
 * @param {object} state - The global state object containing the project, globals, and questions.
 * @param {object} ui_state - The global UI state object.
 */
export async function saveProject(state, ui_state) {
  try {
    if (!state.project?.id) {
      console.warn("No project to save");
      return;
    }

    const projectId = state.project.id;

    // 1. Handle organization (create if needed)
    let organizationId = ui_state.organization_id;
    if (!organizationId) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: 'Default Organization' })
        .select()
        .single();
      if (orgError) throw orgError;
      organizationId = org.id;
      ui_state.organization_id = organizationId;
    }

    // 2. Handle client reference
    let clientId = null;
    if (state.project.client) {
        // Try upsert, fallback to separate insert/select pattern if needed
        const { data: client, error } = await supabase
            .from('clients')
            .upsert({ organization_id: organizationId, name: state.project.client })
            .select()
            .single();

        if (error) {
            console.warn('Client upsert failed, trying insert/select pattern:', error);
            // Fallback: try to select existing first
            const { data: existingClient } = await supabase
                .from('clients')
                .select()
                .eq('organization_id', organizationId)
                .eq('name', state.project.client)
                .single();

            if (existingClient) {
                clientId = existingClient.id;
            } else {
                // Insert new client
                const { data: newClient } = await supabase
                    .from('clients')
                    .insert({ organization_id: organizationId, name: state.project.client })
                    .select()
                    .single();
                clientId = newClient?.id;
            }
        } else {
            clientId = client?.id;
        }
    }
    

    // 3. Upsert the main project record
    const projectData = {
      id: projectId,
      organization_id: organizationId,
      client_id: clientId,
      name: state.project.name || 'Untitled',
      version: state.project.version || '0.1.0',
      status: state.project.status || 'Draft',
      project_type: state.project.project_type,
      notes: state.project.notes,
      tags: state.project.tags || [],
      favorite: state.project.favorite || false,
      updated_at: new Date().toISOString(),
      created_at: state.project.created_at
    };
    const { error: projectError } = await supabase.from('projects').upsert(projectData);
    if (projectError) throw projectError;

    // 4. Handle People & Roles (delete and re-insert for simplicity)
    await supabase.from('project_roles').delete().eq('project_id', projectId);
    if (state.project.roles?.length) {
        for (const role of state.project.roles) {
            if (!role.person) continue;
            
            let personId = null;

            // --- THIS BLOCK IS THE FIX ---
            // First, try to find the person, but don't assume a single result
            const { data: existingPeople, error: findError } = await supabase
                .from('people')
                .select('id')
                .eq('organization_id', organizationId)
                .eq('name', role.person)
                .limit(1); // Get the first match if multiple exist

            if (findError) throw findError;

            if (existingPeople && existingPeople.length > 0) {
                personId = existingPeople[0].id;
            } else {
                // If not found, insert them
                const { data: newPerson, error: insertError } = await supabase
                    .from('people')
                    .insert({ organization_id: organizationId, name: role.person })
                    .select('id')
                    .single();
                
                if (insertError) throw insertError;
                personId = newPerson.id;
            }
            // --- END OF FIX ---

            // Now that we have a personId, insert the project role
            if (personId) {
                await supabase.from('project_roles').insert({ project_id: projectId, person_id: personId, role_name: role.role });
            }
        }
    }

    // 5. Handle Dates (delete and re-insert)
    await supabase.from('project_dates').delete().eq('project_id', projectId);
    if (state.project.important_dates?.length) {
        for (const date of state.project.important_dates) {
            let personId = null;
            if (date.who) {
                 const { data: person } = await supabase.from('people').select('id, name').eq('name', date.who).limit(1).single();
                 personId = person?.id;
            }
            await supabase.from('project_dates').insert({
                id: date.id || uuid_generate_v4(),
                project_id: projectId,
                person_id: personId,
                event_name: date.what,
                due_date: date.when,
                status: date.status || 'Not Started'
            });
        }
    }
    
    // 6. Handle Globals
    await supabase.from('project_globals').upsert({
        project_id: projectId,
        default_base_verbiage: state.globals.default_base_verbiage,
        default_base_definition: state.globals.default_base_definition, // ADD THIS MISSING FIELD!
        banners: state.globals.banners,
        scale_buckets: state.globals.scale_buckets,
        rules: state.globals.rules
    }, { onConflict: 'project_id' });

    // 7. Handle Questions and all sub-tables (options, statements, etc.)
    await supabase.from('questions').delete().eq('project_id', projectId);

    // Function to determine database-compatible question mode
    function getDatabaseMode(question) {
        // If not advanced_table, use the mode as-is
        if (question.mode !== 'advanced_table') {
            return question.mode;
        }

        // For advanced_table questions, determine specific database mode based on configuration
        if (question.advancedTable?.tableVariation) {
            const variation = question.advancedTable.tableVariation;
            if (variation === 'Agreement Scale') return 'likert_agreement';
            if (variation === 'Satisfaction Scale') return 'likert_sentiment';
            if (variation === 'Frequency Scale' || variation === 'Importance Scale') return 'likert_custom';
            if (variation === 'Dynamic Column Matrix') return 'dynamic_simple_columns';
            if (variation === 'Dynamic Selected Columns') return 'dynamic_selected_columns';
            if (variation === 'Dynamic Row Matrix') return 'dynamic_simple_rows';
            if (variation === 'Dynamic Selected Rows') return 'dynamic_selected_rows';
            if (variation === 'Multi-Select Table') return 'multi_matrix';
        }

        // Check grid configuration for dynamic sourcing
        if (question.grid?.columnSource) {
            if (question.grid.columnSource.mode === 'selected_only') {
                return 'dynamic_selected_columns';
            } else {
                return 'dynamic_simple_columns';
            }
        }

        if (question.grid?.rowSource || question.advancedTable?.rowSource) {
            const rowSource = question.grid?.rowSource || question.advancedTable?.rowSource;
            if (rowSource.mode === 'selected_only') {
                return 'dynamic_selected_rows';
            } else {
                return 'dynamic_simple_rows';
            }
        }

        // Default fallback for advanced tables
        return 'advanced_table';
    }

    if (state.questions?.length) {
        for (const [index, q] of state.questions.entries()) {
            const { data: savedQ, error: qError } = await supabase.from('questions').insert({
                project_id: projectId,
                question_id: q.id, // This is your S1, Q1 etc.
                question_text: q.text,
                question_type: q.question_type || q.type,
                question_mode: q.question_mode,
                table_type: q.table_type,
                order_index: index,
                notes: q.notes,
                is_required: q.is_required, // ADD THIS MISSING FIELD!
                // ... all other jsonb fields
                base: q.base, randomization: q.randomization, conditions: q.conditions,
                validation: q.validation, repeated_measures: q.repeated_measures,
                numeric_config: q.numeric, open_config: q.open, scale_config: q.scale,
                grid_config: q.grid, exports: q.exports, tab_plan: q.tab,
                termination_logic: q.terminationLogic || {},
                // New type-specific configurations
                advanced_table_config: q.advancedTable || {},
                list_config: {
                    ...(q.listConfig || {}),
                    globalTermination: q.globalTermination || {},
                    globalMustSelect: q.globalMustSelect || {}
                },
                numeric_enhanced_config: q.numericEnhanced || {},
                scale_enhanced_config: q.scaleEnhanced || {},
                conditional_config: q.conditionalConfig || {},
                ai_metadata: q.aiMetadata || {},
                validation_rules: q.validationRules || {}
            }).select().single();

            if (qError) throw qError;
            const newQuestionUUID = savedQ.id;

            // Batch insert options
            if (q.options?.length) {
                console.log('Saving options for question:', q.id, q.options.map(opt => ({ label: opt.label, medicationGroup: opt.medicationGroup })));
                const optionsData = q.options.map((opt, i) => ({
                    question_id: newQuestionUUID,
                    option_code: String(opt.code ?? (i + 1)),
                    option_label: opt.label,
                    order_index: i,
                    is_exclusive: opt.exclusive,
                    is_terminate: opt.terminate,
                    anchor_position: opt.anchor,
                    lock_randomize: opt.lock_randomize,
                    custom_code: opt.custom_code,
                    custom_label: opt.custom_label,
                    nested_dropdown: opt.nested_dropdown || {},
                    validation_range: opt.validation_range || {},
                    medication_group: opt.medicationGroup || null,
                    input_type: opt.input_type || 'number',
                    preferred_name: opt.preferredName || false
                }));
                await supabase.from('question_options').insert(optionsData);
            }
            // Batch insert statements
            if (q.statements?.length) {
                const statementsData = q.statements.map((stmt, i) => ({
                    question_id: newQuestionUUID,
                    statement_text: stmt,
                    order_index: i
                }));
                await supabase.from('question_statements').insert(statementsData);
            }

            // Groups are saved via option.medicationGroup field (SIMPLE APPROACH following CLAUDE.md)
            if (q.groups?.length) {
                console.log('Saving groups for question:', q.id, q.groups.length);
                // The actual group assignments are already saved in the medicationGroup field of each option
                // This was populated by the groups modal and will be loaded correctly
            }
        }
    }

    // Record the save time for dashboard tracking
    localStorage.setItem('qgen_last_save_time', Date.now().toString());

    // Log activity for the feed
    logActivity({
      ...ACTIVITY_TYPES.PROJECT_UPDATED,
      title: `Project "${state.project.name}" updated`,
      data: {
        projectId: state.project.id,
        projectName: state.project.name
      }
    });

    setStatus("Project saved.", true);
    
  } catch (error) {
    console.error("Save failed:", error);
    setStatus(`Save failed: ${error.message}`, false);
  }
}

// ---------- PROJECTS ----------


export async function getProjects(clientFilter = null) {
  try {
    console.log('🔍 Loading projects with client filter:', clientFilter);

    // Load ALL projects - no organization filtering
    let q = supabase
      .from('projects')
      .select(`
        id, name, status, created_at, updated_at, version, tags, favorite, organization_id, notes, project_type,
        clients ( id, name ),
        project_dates ( id, event_name, due_date, status ),
        project_roles ( role_name, people ( name ) )
      `)
      .order('updated_at', { ascending: false });

    // Apply client filter if specified
    if (clientFilter) {
      q = q.eq('clients.name', clientFilter);
    }

    const { data, error } = await q;
    if (error) throw error;

    console.log(`✅ Loaded ${data?.length || 0} projects from database`);

    // 3) Normalize for views
    return (data || []).map(p => ({
      id: p.id,
      name: p.name,
      status: p.status || 'Draft',
      updated_at: p.updated_at,
      version: p.version,
      tags: p.tags || [],
      favorite: !!p.favorite,
      client: p.clients?.name || null,
      notes: p.notes || '',
      project_type: p.project_type || '',
      roles: (p.project_roles || []).map(r => ({
        role: r.role_name,
        person: r.people?.name || ''
      })),
      important_dates: (p.project_dates || []).map(d => ({
        id: d.id,
        what: d.event_name,
        when: d.due_date,
        status: d.status || 'Not Started'
      }))
    }));
  } catch (err) {
    console.error('Failed to fetch projects:', err);
    setStatus?.('Could not load projects.', false);
    return [];
  }
}

export async function bulkUpdateStatus(ids, status) {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids);
    if (error) throw error;
    setStatus?.(`Updated ${ids.length} projects to "${status}".`, true);
  } catch (err) {
    console.error('bulkUpdateStatus:', err);
    setStatus?.('Failed to update projects.', false);
  }
}

// In web/src/api/projects.js

// In web/src/api/projects.js

export async function openProjectById(id) {
  // --- FIX: Ensure function consistently returns true/false ---
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    console.error('Invalid project ID format provided to openProjectById');
    return false;
  }

  try {
    const { data: projectData, error } = await supabase
      .from('projects')
      .select(`
        *,
        clients (id, name),
        project_roles (role_name, people (id, name)),
        project_dates (*),
        project_globals (*),
        questions (
          *,
          question_options (*),
          question_statements (*),
          question_nets (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      setStatus?.(`Project not found: ${error.message}`, false);
      return false; // <-- Return false on error
    }

    console.log('=== PROJECT LOAD DEBUG ===');
    console.log('Raw project data from database:', projectData);
    console.log('Questions from database:', projectData.questions);
    console.log('Number of questions:', projectData.questions?.length || 0);

    if (!projectData) {
      console.error('No project data returned for id:', id);
      setStatus?.(`Project data for ${id} is empty.`, false);
      return false; // <-- Return false if no data
    }


    // --- (The entire state rebuilding logic remains the same) ---
    state.project = {
      id: projectData.id,
      name: projectData.name,
      version: projectData.version,
      status: projectData.status,
      project_type: projectData.project_type,
      notes: projectData.notes,
      tags: projectData.tags || [],
      favorite: projectData.favorite,
      created_at: projectData.created_at,
      updated_at: projectData.updated_at,
      client: projectData.clients?.name || null,
      roles: (projectData.project_roles || []).map(pr => ({
        role: pr.role_name,
        person: pr.people?.name || ''
      })),
      important_dates: (projectData.project_dates || []).map(pd => ({
        id: pd.id, what: pd.event_name, when: pd.due_date, who: pd.people?.name || null, status: pd.status
      }))
    };
    const globals = (projectData.project_globals || [])[0] || {};
    state.globals = {
      default_base_verbiage: globals.default_base_verbiage || 'Total (qualified respondents)',
      default_base_definition: globals.default_base_definition || '',
      scale_buckets: globals.scale_buckets || {},
      rules: globals.rules || {},
      banners: globals.banners || []
    };
    console.log('Processing questions...');
    console.log('Raw questions array:', projectData.questions);

    state.questions = (projectData.questions || [])
      .slice()
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map(q => {
        console.log('Processing question:', q.question_id, q.question_text?.substring(0, 50));
        console.log('  - Question type:', q.question_type, 'Question mode:', q.question_mode);
        console.log('  - Raw options from DB:', q.question_options?.length || 0, 'options');
        if (q.question_options?.length > 0) {
          console.log('  - First option:', q.question_options[0].option_code, q.question_options[0].option_label);
        }

        const options = (q.question_options || [])
          .slice()
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
          .map(opt => ({
            code: opt.option_code,
            label: opt.option_label,
            exclusive: opt.is_exclusive,
            terminate: opt.is_terminate,
            anchor: opt.anchor_position,
            lock_randomize: opt.lock_randomize,
            custom_code: opt.custom_code,
            custom_label: opt.custom_label,
            nested_dropdown: opt.nested_dropdown || {},
            validation_range: opt.validation_range || {},
            input_type: opt.input_type || 'number',
            medicationGroup: opt.medication_group || null,
            preferredName: opt.preferred_name || false
          }));
        const statements = (q.question_statements || [])
          .slice()
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
          .map(s => s.statement_text);
        const nets = (q.question_nets || []).map(net => {
          if (net.net_type === 'codes') {
            return { kind: 'codes', label: net.net_label, codes: net.net_config?.codes || [] };
          }
          if (net.net_type === 'range') {
            const cfg = net.net_config || {};
            return {
              kind: 'range',
              label: net.net_label,
              operator: cfg.operator || '-',
              value1: cfg.value1, value2: cfg.value2,
              min: cfg.min, max: cfg.max
            };
          }
          return net;
        });
        // Rebuild groups array from medicationGroup data (following CLAUDE.md patterns)
        const groups = [];
        const groupsMap = {};

        options.forEach(option => {
          if (option.medicationGroup) {
            if (!groupsMap[option.medicationGroup]) {
              groupsMap[option.medicationGroup] = {
                name: option.medicationGroup,
                options: [],
                created: new Date().toISOString() // Default timestamp since we don't store this
              };
              groups.push(groupsMap[option.medicationGroup]);
            }
            groupsMap[option.medicationGroup].options.push(option.label);
          }
        });

        // Use existing grid_config directly - no migration needed since advancedTable data
        // was never saved to database (it only existed in memory)
        let unifiedGrid = q.grid_config || {};

        // Helper functions for mapping database modes back to UI modes
        function getUIMode(databaseMode) {
            // List question modes should all map to 'list'
            const listModes = ['single', 'multi', 'list', 'single_likert', 'multi_likert'];
            if (listModes.includes(databaseMode)) {
                return 'list';
            }

            // Numeric question modes should map to 'numeric'
            const numericModes = ['numeric', 'numeric_simple', 'numeric_dropdown'];
            if (numericModes.includes(databaseMode)) {
                return 'numeric';
            }

            // Advanced table modes
            const advancedTableModes = [
                'dynamic_selected_rows', 'dynamic_selected_columns',
                'dynamic_simple_rows', 'dynamic_simple_columns',
                'likert_agreement', 'likert_sentiment', 'likert_custom',
                'multi_matrix',
                // NEW: Your 3-column system table modes
                'simple_table', 'likert', 'binary', 'advanced_table'
            ];
            if (advancedTableModes.includes(databaseMode)) {
                return 'advanced_table';
            }

            // Default: return as-is for other modes (text, open_end, etc.)
            return databaseMode;
        }

        function getDatabaseModeVariation(databaseMode) {
            const modeMap = {
                'dynamic_selected_rows': 'Dynamic Selected Rows',
                'dynamic_selected_columns': 'Dynamic Selected Columns',
                'dynamic_simple_rows': 'Dynamic Row Matrix',
                'dynamic_simple_columns': 'Dynamic Column Matrix',
                'likert_agreement': 'Agreement Scale',
                'likert_sentiment': 'Satisfaction Scale',
                'likert_custom': 'Custom Scale',
                'multi_matrix': 'Multi-Select Table'
            };
            return modeMap[databaseMode] || 'Table';
        }

        // Load advancedTable from dedicated column (new approach)
        let advancedTable = null;
        if (getUIMode(q.question_mode) === 'advanced_table') {
            // Use new advanced_table_config column if available, fallback to old reconstruction
            if (q.advanced_table_config && Object.keys(q.advanced_table_config).length > 0) {
                advancedTable = q.advanced_table_config;
            } else {
                // Fallback: reconstruct from old data for backward compatibility
                const variation = getDatabaseModeVariation(q.question_mode);
                advancedTable = {
                    rows: unifiedGrid.rows || ['Row 1', 'Row 2', 'Row 3'],
                    cols: unifiedGrid.cols || ['Column 1', 'Column 2', 'Column 3'],
                    tableVariation: variation,
                    rowSource: unifiedGrid.rowSource || null,
                    columnSource: unifiedGrid.columnSource || null
                };
            }
        }

        const uiMode = getUIMode(q.question_mode);

        const finalQuestion = {
          id: q.question_id,
          text: q.question_text,
          type: uiMode === 'list' ? q.question_mode : q.question_type, // For list questions, preserve single/multi in type
          mode: uiMode,
          question_type: q.question_type,
          question_mode: q.question_mode,
          table_type: q.table_type,
          notes: q.notes,
          is_required: q.is_required,
          base: q.base || {}, randomization: q.randomization || {},
          conditions: q.conditions || {}, validation: q.validation || {},
          repeated_measures: q.repeated_measures || {},
          numeric: q.numeric_config || {}, open: q.open_config || {},
          scale: q.scale_config || {}, grid: unifiedGrid,
          advancedTable: advancedTable,
          exports: q.exports || {}, tab: q.tab_plan || { nets },
          terminationLogic: q.termination_logic || {},
          // Global termination and must select from list_config
          globalTermination: q.list_config?.globalTermination || {},
          globalMustSelect: q.list_config?.globalMustSelect || {},
          options, statements, groups
        };

        console.log('  - Final question object:', {
          id: finalQuestion.id,
          type: finalQuestion.type,
          mode: finalQuestion.mode,
          optionsCount: finalQuestion.options?.length || 0,
          hasOptions: !!finalQuestion.options?.length
        });

        return finalQuestion;
      });
    // --- (End of state rebuilding logic) ---

    // Update UI state
    window.ui_state.active_project_id = id;
    window.ui_state.active_question_index = state.questions.length > 0 ? 0 : null;

    // Log activity for the feed
    logActivity({
      ...ACTIVITY_TYPES.PROJECT_OPENED,
      title: `Project "${window.state.project.name}" opened`,
      data: {
        projectId: id,
        projectName: window.state.project.name
      }
    });

    await setLastProjectId(id);
    setStatus?.('Project loaded.', true);
    
    return true; // <-- Return true on success

  } catch (err) {
    console.error('Fatal error in openProjectById:', err);
    setStatus?.(`Could not open project: ${err.message}`, false);
    return false; // <-- Return false on any other failure
  }
}

// --- FIX: Update closeProject to prevent recursive navigation ---
export async function closeProject(shouldNavigate = true) {
  if (window.ui_state) window.ui_state.active_project_id = null;
  
  try {
    await supabase.from('app_prefs').update({ last_project_id: null }).eq('id', true);
  } catch (err) {
    console.warn('Could not clear last_project_id preference:', err);
  }
  
  // Only navigate if requested (prevents loop when called from router)
  if (shouldNavigate) {
    if (typeof window.goto === 'function') {
      window.goto('#/projects');
    } else {
      location.hash = '#/projects';
    }
  }
}
/** Update project header row (no local snapshot) */
export async function touchCurrentIntoProjects() {
  try {
    const p = state.project || {};
    const { error } = await supabase
      .from('projects')
      .update({
        name: p.name || 'Untitled',
        version: p.version || '0.1.0',
        status: p.status || 'Draft',
        project_type: p.project_type || null,
        tags: p.tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', p.id);
    if (error) throw error;
    setStatus?.('Saved.', true);
  } catch (err) {
    console.error('touchCurrentIntoProjects:', err);
    setStatus?.('Save failed.', false);
  }
}

// ---------- PEOPLE ----------
// Returns an array of { id, name } from Supabase
export async function getPeople() {
  try {
    const { data: allPeople, error } = await supabase
      .from('people')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) throw error;

    // Manually deduplicate by name (keep first occurrence)
    const seen = new Map();
    const distinct = [];
    for (const person of allPeople || []) {
      if (!seen.has(person.name)) {
        seen.set(person.name, true);
        distinct.push(person);
      }
    }
    return distinct;
  } catch (e) {
    console.error('getPeople failed:', e);
    return [];
  }
}


export async function savePeople(peopleList) {
  const rows = (peopleList || []).map(n => ({ name: n }));
  const { error } = await supabase
    .from('people')
    .upsert(rows, { onConflict: 'lower(name)' });
  if (error) throw error;
}

// ---------- PREFS (no localStorage) ----------

export async function getLastProjectId() {
  const { data, error } = await supabase
    .from('app_prefs')
    .select('last_project_id')
    .single();
  if (error) return null;
  return data?.last_project_id || null;
}

export async function setLastProjectId(id) {
  const { error } = await supabase
    .from('app_prefs')
    .upsert({ id: true, last_project_id: id }, { onConflict: 'id' });
  if (error) console.warn('setLastProjectId:', error);
}

/**
 * Deletes a project and all related data
 */
export async function deleteProjectById(projectId) {
  try {
    // First get all question IDs for this project
    const { data: questions } = await supabase
      .from('questions')
      .select('id')
      .eq('project_id', projectId);

    const questionIds = (questions || []).map(q => q.id);

    // Delete question-related data using the question UUIDs
    if (questionIds.length > 0) {
      await supabase.from('question_options').delete().in('question_id', questionIds);
      await supabase.from('question_statements').delete().in('question_id', questionIds);
      await supabase.from('question_nets').delete().in('question_id', questionIds);
    }

    // Delete project-related data using project_id
    await supabase.from('questions').delete().eq('project_id', projectId);
    await supabase.from('project_roles').delete().eq('project_id', projectId);
    await supabase.from('project_dates').delete().eq('project_id', projectId);
    await supabase.from('project_globals').delete().eq('project_id', projectId);

    // Finally delete the project itself
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;

    setStatus?.('Project deleted successfully.', true);
  } catch (error) {
    console.error('Failed to delete project:', error);
    setStatus?.(`Failed to delete project: ${error.message}`, false);
    throw error;
  }
}

