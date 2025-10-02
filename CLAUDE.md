# Claude Development Guide

This document contains important patterns, solutions, and gotchas for Claude when working with this codebase.

## 🛡️ **FUTURE-PROOF RENDERING SYSTEM**

**📖 Full Documentation**: See `RENDERING_PATTERNS.md` for comprehensive patterns
**🔧 Utilities**: Use `apps/web/src/utils/renderingUtils.js` for all new components

### **🎯 Core Principle**: Never Re-render, Always Update
- **Click a button** → only that button changes
- **Change a dropdown** → only related UI updates
- **Type in a field** → only data updates
- **Zero re-renders** for simple interactions
- **Smooth animations** for structural changes

### **✅ New Component Pattern**
```javascript
import { queueSave, updateElementState, setupEventDelegation } from '@/utils/renderingUtils.js';

// 1. Use event delegation
const actionHandlers = {
    click: {
        'toggle-feature': (e) => updateElementState(e.target, !e.target.classList.contains('active')),
        'save-data': (e) => queueSave(`save-${Date.now()}`, () => saveToDatabase())
    },
    change: {
        'update-dropdown': (e) => handleDropdownChange(e.target, e.target.value, updateData)
    }
};

setupEventDelegation(container, actionHandlers);
```

### **🚫 Anti-Patterns - NEVER Do This**
- ❌ `actions.onUpdate()` in click/change handlers (causes re-renders)
- ❌ `hostEl.cloneNode()` + `replaceChild()` (destroys event listeners)
- ❌ `setTimeout(() => re-render(), 0)` (still causes re-render)
- ❌ Full page/component re-renders for simple state changes

## UI Update & Event Handling Patterns

### ⚠️ CRITICAL: Dropdown Disappearing Issue

**Problem**: Dropdowns disappear instantly when clicked due to immediate re-rendering.

**Cause**: Calling `actions.onUpdateQuestion()` immediately in click handlers triggers a re-render, which destroys and recreates DOM elements.

**Solution**: Use the debounced input pattern instead of immediate click handlers.

### 🚨 CRITICAL: Dynamic Element Event Listener Bug

**Problem**: Buttons created dynamically (via `insertAdjacentHTML`, `appendChild`, etc.) have NO event listeners and clicking them does nothing.

**Symptoms**:
- Console shows "Found 0 buttons" when buttons are visible
- No console logs when clicking buttons that should have handlers
- Buttons appear to work but nothing happens

**Root Cause**: Event listeners are attached at modal creation time, but dynamic elements are created later.

**Solution**: **ALWAYS** attach event listeners immediately after creating dynamic elements:

```javascript
// ✅ CORRECT - Attach listeners after dynamic creation
container.insertAdjacentHTML('beforeend', newHTML);

// CRITICAL: Attach listeners to newly created elements
setTimeout(() => {
    const newButtons = container.querySelectorAll('.my-button');
    newButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Handle click
        });
    });
}, 100);
```

**Examples in Codebase**:
- Group management Add buttons (editorPanel.js:630-663)
- Any modal with dynamically generated content

**Prevention Checklist**:
1. ✅ Does your code use `insertAdjacentHTML` or `appendChild`?
2. ✅ Do the inserted elements have buttons/inputs that need event handlers?
3. ✅ Did you attach event listeners AFTER insertion?
4. ✅ Did you test clicking the buttons in browser dev tools?

### ✅ Correct Pattern for Form Elements

When adding new form controls (dropdowns, inputs, etc.) in editorPanel.js:

```javascript
// ❌ WRONG - Don't do this (causes dropdown disappearing)
case 'update-my-field':
    question.myField = e.target.value;
    actions.onUpdateQuestion(questionIndex, 'myField', question.myField); // Immediate re-render!
    break;

// ✅ CORRECT - Use this pattern instead
// 1. In the HTML template:
<select class="form-control" data-action="update-my-object" data-key="field_name">

// 2. In the input event handler:
} else if (action === 'update-my-object') {
    const key = target.dataset.key;
    const value = target.value;

    // Update data immediately (no re-render)
    if (!question.myObject) question.myObject = {};
    question.myObject[key] = value;

    // For critical changes that need immediate UI updates
    if (key === 'source_field') {
        console.log('Critical field changed, triggering preview update');
        setTimeout(() => {
            actions.onUpdateQuestion(questionIndex, 'myObject', question.myObject);
        }, 0);
    } else {
        // Debounce save operation for other fields (2 second delay)
        const timeoutKey = `myObject-${key}`;
        if (optionUpdateTimeouts[timeoutKey]) {
            clearTimeout(optionUpdateTimeouts[timeoutKey]);
        }
        optionUpdateTimeouts[timeoutKey] = setTimeout(() => {
            actions.onUpdateQuestion(questionIndex, 'myObject', question.myObject);
            delete optionUpdateTimeouts[timeoutKey];
        }, 2000);
    }
}
```

### Key Points:

1. **Update data immediately** - Always update the question object immediately to prevent data loss
2. **Debounce saves** - Use setTimeout to delay the re-rendering action
3. **Use input events** - Don't use click events for form changes
4. **Use data-key pattern** - This allows one handler to manage multiple fields
5. **Critical changes exception** - Some changes (like source dropdowns) need immediate preview updates

### Examples in Codebase:

- **update-open**: Open text field configuration
- **update-numeric**: Numeric field configuration
- **update-table-row/col**: Table grid management (added 2025-09-23)
- **update-repeated**: Repeated options configuration (added 2025-01-23)

## ⚠️ CRITICAL: Minimal Re-rendering Principles

**Rule**: Always render the **minimum** amount necessary. Never re-render the entire editor unless absolutely required.

### 🚫 **Anti-Patterns to Avoid:**

```javascript
// ❌ BAD - Triggers full editor re-render for simple data changes
case 'update-checkbox-value':
    question.values.push(newValue);
    actions.onUpdateQuestion(questionIndex, 'values', question.values); // FULL RE-RENDER!
    break;

// ❌ BAD - Unnecessary timeout that still triggers full re-render
setTimeout(() => {
    actions.onUpdateQuestion(questionIndex, 'conditions', question.conditions);
}, 500); // Still causes full re-render after delay
```

### ✅ **Correct Minimal Re-render Patterns:**

```javascript
// ✅ GOOD - Update data only, no re-render for checkbox changes
case 'update-checkbox-value':
    question.values.push(newValue);
    // Checkbox state is already updated in DOM, no re-render needed
    // Only save for persistence
    setTimeout(() => {
        window.saveQuestionToBackend?.(question, questionIndex);
    }, 2000);
    break;

// ✅ GOOD - Re-render only the specific component that needs updating
case 'update-dropdown-source':
    question.source = newSource;
    // Only re-render the conditional panel, not entire editor
    const conditionalPanel = hostEl.querySelector('#conditional-logic-container');
    if (conditionalPanel) {
        conditionalPanel.innerHTML = renderConditionalLogicPanel(question, questionIndex, onUpdate);
    }
    break;
```

### **When to Re-render What:**

1. **No re-render**: Checkbox/radio changes, text input updates
2. **Component re-render**: Dropdown source changes, mode switches
3. **Full re-render**: Only for structural changes (question type change, major layout shifts)

### **Smart Setup Fixed Examples (2025-09-23):**

- **update-smart-source**: Re-renders only conditional panel to show new options
- **update-smart-value**: No re-render - checkbox state is sufficient
- **switch-conditional-mode**: Re-renders only conditional panel, preserves layout state

## Question Type Implementation Checklist

When adding a new question type:

1. **Add to type selector** in editorPanel.js:
   ```javascript
   <option value="new_type" ${mode === 'new_type' ? 'selected' : ''}>🔥 New Type</option>
   ```

2. **Add mode template** in modeSpecificHTML:
   ```javascript
   'new_type': `<div class="new-type-content">...</div>`,
   ```

3. **Add mode switching logic**:
   ```javascript
   // Clean up when switching away
   if (oldMode === 'new_type' && newMode !== 'new_type') {
       if (question.newTypeData) {
           question.newTypeData = {};
       }
   }

   // Initialize when switching to
   if (newMode === 'new_type' && !question.newTypeData) {
       question.newTypeData = { /* defaults */ };
   }
   ```

4. **Add validation** in questionList.js:
   ```javascript
   if (question.mode === 'new_type') {
       const data = question.newTypeData || {};
       if (!data.required_field) {
           return true;
       }
   }
   ```

5. **Add summary display** in questionList.js:
   ```javascript
   } else if (q.mode === 'new_type') {
       base = 'new_type';
   }

   const newTypeInfo = q.mode === 'new_type' && q.newTypeData
       ? ` • ${q.newTypeData.someCount} items`
       : '';

   return base + scal + opts + stm + num + tbl + newTypeInfo + open;
   ```

6. **Add render function** (if needed for previews):
   ```javascript
   function renderNewTypePreview(question, questionIndex) {
       // Implementation
   }
   ```

## ⚠️ CRITICAL: Event Handler Accumulation Fix

**Problem**: Event handlers were accumulating every time `renderEditorPanel()` was called, causing duplicate actions (e.g., clicking "Add Row" would add 2+ rows).

**Root Cause**: Event listeners were being added to the same `hostEl` element without removing previous ones during panel re-renders.

**Solution**: Implemented complete event listener cleanup using DOM element replacement:

```javascript
export function renderEditorPanel({ hostEl, question, questionIndex, activeTab, actions }) {
    // --- CLEANUP EXISTING EVENT LISTENERS ---
    // Remove all existing event listeners to prevent accumulation
    const newHostEl = hostEl.cloneNode(false);
    hostEl.parentNode.replaceChild(newHostEl, hostEl);
    hostEl = newHostEl; // Update reference to the new clean element

    // ... rest of function
}
```

**Impact**: This fixes duplicate event handling for the **entire editor**, not just specific components.

## Table/Grid Question Type Implementation

### Architecture (2025-09-23)

Table functionality has been fully migrated from legacy code into a modular system:

**Core Modules:**
- `apps/web/src/views/project/editor/modules/tableCore.js` - Core table functions
- `apps/web/src/views/project/editor/modules/tableActions.js` - All table action handlers
- `apps/web/src/views/project/editor/modules/tableValidation.js` - Table-specific validation

### Table Features

1. **Interactive Table Builder**: Compact UI with inline editing
   - Click into row/column cells to edit names directly
   - Add/delete buttons integrated into table preview
   - Real-time updates with debounced autosave (2-second delay)
   - No re-rendering during typing (prevents focus loss)

2. **Table Types Supported**:
   - `grid_single` - Single-select table (radio buttons)
   - `grid_multi` - Multi-select table (checkboxes)
   - `ranking` - Ranking table (dropdown numbers)

3. **Dynamic Column Sources**:
   - Columns can be sourced from other questions
   - Exclude specific options from source question
   - Live preview of resolved columns

4. **Table Validation**:
   - `force_per_column` - Require at least one answer per column
   - `sum_equals_qid` - Sum of responses must equal target question value
   - Structure validation (rows, columns, type checking)

### Data Structure

Tables use `question.grid` object:
```javascript
question.grid = {
    rows: ['Statement 1', 'Statement 2', ...],        // Row labels (statements)
    cols: ['Option 1', 'Option 2', ...],              // Column labels
    columnSource: {                                    // Optional dynamic columns
        qid: 'source_question_id',
        exclude: 'opt1,opt2'                          // Comma-separated exclusions
    }
}
```

### Table Actions Usage

```javascript
// Import table actions
import { getTableActions } from './modules/tableActions.js';

// Get table action handlers
const tableActions = getTableActions(onUpdateQuestion, queueAutosave, renderEditorPanel);

// Use in action handlers
case 'add-table-row': tableActions.onAddTableRow(questionIndex); break;
case 'add-table-col': tableActions.onAddTableCol(questionIndex); break;
case 'update-table-row': /* handled by input event with debounced pattern */
case 'update-table-col': /* handled by input event with debounced pattern */
```

### Legacy Compatibility

Table functions maintain backward compatibility through global helpers:
- `window._tb_addRow()`, `window._tb_delRow()`, `window._tb_updRow()`
- `window._tb_addCol()`, `window._tb_delCol()`, `window._tb_updCol()`
- `window.toggleColumnSource()`

## Recent Additions

### Universal Conditional Logic Mapper (2025-09-23)
- **Location**: `apps/web/src/lib/conditionalMapper.js`
- **Purpose**: **Simplified mapping for the most complex relationships**
- **Features**:
  - **Auto-Configuration**: 🤖 One-click setup for any question relationship
  - **Universal Type System**: Reduces all question types to 4 core types (choice, number, text, complex)
  - **Smart Operator Selection**: Automatically picks best operators for each relationship
  - **Complexity Reduction**: Handles ANY-to-ANY question relationships with minimal configuration
- **Usage**:
  ```javascript
  // One-liner evaluation
  evaluateRelationship(sourceQuestion, sourceResponse, operator, compareValue);

  // Auto-configure any relationship
  const config = autoConfigureConditional(sourceQuestion, targetQuestion);
  ```
- **Integration**: Works seamlessly with Supabase data, no schema changes needed

### Progressive Disclosure Conditional Logic (2025-09-23)
- **Problem Solved**: Overwhelming, intimidating interface for new users
- **Solution**: Three-tier progressive disclosure system
- **Fixed**: ⚠️ **CRITICAL** - Dropdown disappearing issue using debounced input pattern

#### **Level 1: Simple Mode (Default)**
```
┌─────────────────────────────────────────────────────────┐
│ Conditional Logic                            [Close]   │
│ Control when this question appears                     │
│                                                         │
│ ○ Always show this question                            │
│ ○ Show only if previous answers match                  │
│   └─ [🤖 Smart Setup] [⚙️ Advanced Rules]             │
└─────────────────────────────────────────────────────────┘
```
- Clean radio buttons, no complexity exposed
- Perfect for new users
- Guides to next level when needed

#### **Level 2: Smart Setup Mode (Guided)**
```
┌─────────────────────────────────────────────────────────┐
│ 🤖 Smart Setup                             [← Back]   │
│                                                         │
│ Show this question when:                                │
│ [Dropdown: Previous Questions with Icons]              │
│ [Checkboxes: Available Options Grid]                   │
│                                                         │
│ [Apply Rule] [⚙️ Advanced Rules]                       │
└─────────────────────────────────────────────────────────┘
```
- Guided workflow for 80% of use cases
- Visual feedback with previews
- One-click rule application

#### **Level 3: Advanced Mode (Power Users)**
- Full access to original complex interface
- All operators, multiple conditions, logical operators
- Auto-configure and optimize buttons preserved

#### **Enhanced Features**:
- Shows ALL question types from Supabase with support indicators:
  - 🔘 **Full Support**: Single, Multi, Scale, Grid (all operators)
  - 🔢 **Basic Support**: Numeric, Text, Open (core operators + type-specific)
  - 🥇 **Coming Soon**: Ranking, Matrix, Complex types (disabled but visible)
- **Auto-Configure Button**: 🤖 Automatically sets up optimal conditional logic
- **Actions**: `switch-conditional-mode`, `set-simple-mode`, `update-smart-source`, `apply-smart-setup`
- **Pattern**: Uses debounced input pattern, immediate data updates, 2-second autosave

### Table/Grid Question Type (2025-09-23)
- **Location**: `apps/web/src/views/project/editor/modules/` (modular architecture)
- **Features**: Interactive table builder, multiple table types, dynamic columns, validation
- **Actions**: `add-table-row`, `add-table-col`, `update-table-row`, `update-table-col`, etc.
- **Pattern**: Uses debounced input for inline editing, immediate data updates, 2-second autosave
- **Major Fix**: Solved event handler accumulation issue affecting entire editor

### Repeated Options Question Type (2025-01-23)
- **Location**: `apps/web/src/views/project/editor/editorPanel.js`
- **Features**: Dynamic rows from source question, static columns, live preview
- **Uses**: `update-repeated` action with debounced input pattern
- **Validation**: Checks for source_qid and columns
- **Summary**: Shows column count and source question ID

### Text Question Type (2025-09-24)
- **Location**: `apps/web/src/views/project/editor/editorSidebar.js`, `apps/web/src/views/project/editor.js`
- **Features**: Text-only questions for informational content (consent, welcome messages, notes)
- **Types**: `TXT_1` (main), `STXT_1` (screener) based on sidebar selection
- **Mode**: Uses 'text' mode (added to database constraint)
- **UI**: Simple text editor with Insert Pipe functionality, no answer options
- **Locked Mode**: Cannot be changed to other question types

## Important Documentation References

### 📊 Table System Architecture
See **[tableInstructions.md](./tableInstructions.md)** for comprehensive documentation of:
- All 7 table types and their database schemas
- Dynamic sourcing and multi-matrix configurations
- Enterprise-level conditional logic plans
- SPSS integration requirements
- Development roadmap for table reconstruction

### ⚠️ CRITICAL DATABASE FIX: Supabase Query Hanging (2025-09-29)

**Problem**: H2 banner creation worked for first H1 but hung silently on second H1 categories.

**Root Cause**: Supabase queries could hang indefinitely after multiple operations, leaving the system unresponsive.

**Solution Implemented**:
- **File**: `bannerManager.js` `lookupQuestionUUID()` function
- **Fix 1**: Added 10-second timeout using `Promise.race()`
- **Fix 2**: Added preliminary connection test before main query
- **Fix 3**: Enhanced debugging throughout UUID lookup chain

**Critical Code Pattern**:
```javascript
// NEVER remove this timeout pattern
const queryPromise = supabase.from('questions').select().eq().single();
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
});
const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
```

**Files Modified**:
- `apps/web/src/services/bannerManager.js` - Added timeout and connection testing
- `apps/web/src/views/project/banner/simpleBannerPage.js` - Added UUID lookup debugging

**DO NOT REMOVE**: The timeout and connection testing are essential for system reliability.

### 🔢 NUMERIC QUESTION INEQUALITY BUILDER (2025-09-29)

**Feature**: Professional inequality builder for numeric questions in banner creation.

**Problem Solved**: Numeric questions (`numeric_simple`, `numeric_dropdown`) couldn't create banner logic - they tried to load "nets" from database instead of allowing custom equations.

**Solution Implemented**:
- **Interface**: Clean 3-column layout (Question | Operator | Value) with live preview
- **Operators**: Equals, Not Equals, Greater Than, Less Than, Greater/Equal, Less/Equal
- **Validation**: Real-time validation with disabled state until complete
- **Integration**: Custom equations (e.g., `Q1>5`) passed through to banner creation

**Files Modified**:
- `questionPicker.js` - Added `renderNumericInequalityBuilder()` and `attachInequalityEventListeners()`
- `questionPickerStyles.css` - Added professional styling for inequality builder
- `simpleBannerPage.js` - Enhanced equation handling to support custom numeric equations

**Usage Example**:
1. Click "Add H2" on any H1 category
2. Select numeric question (Q1: "Hours per day wearing contacts")
3. Set operator ">" and value "5"
4. Enter banner label "Heavy Users"
5. Creates equation: `Q1>5` with banner column "Heavy Users"

**Pattern for Custom Equations**:
```javascript
const selectedOption = {
  code: value,           // Numeric value entered
  label: bannerLabel,    // Column header text
  equation: customEq,    // Full equation like "Q1>5"
  operator: operator,    // Operator like ">", "<=", "="
  value: value,          // Numeric value
  questionCode: qCode    // Question ID like "Q1"
};
```

### 🛡️ CRITICAL DATA INTEGRITY FIX: Question Data Protection (2025-09-29)

**Problem**: Banner tool was sharing direct references to original question objects, causing data corruption where banner operations would overwrite question_mode values in the main questionnaire editor.

**Root Cause**: Banner tools were using `this.questions = window.state?.questions` which created shared references instead of isolated copies.

**Solution Implemented**: All banner tools now use deep copies of question data to ensure read-only access:
```javascript
// BEFORE (DANGEROUS - shared references):
this.questions = window.state?.questions || [];

// AFTER (SAFE - isolated copies):
const originalQuestions = window.state?.questions || [];
this.questions = JSON.parse(JSON.stringify(originalQuestions));
```

**Files Protected**:
- `simpleBannerPage.js` - Main banner interface
- `questionPicker.js` - Question selection modal
- `equationBuilder.js` - Equation building modal

**Critical Pattern**: **ALL** banner tools must use deep copies when accessing question data. Never modify original question objects.

**DO NOT REMOVE**: Deep copying is essential to prevent data corruption between banner tool and questionnaire editor.

### 🔢 NUMERIC QUESTION SUPPORT IN EQUATION BUILDER (2025-09-29)

**Feature**: Enhanced conditional equation builder to support numeric questions with proper input types.

**Problem Solved**: Equation builder showed "Select Value..." dropdown for numeric questions instead of allowing direct numeric input with inequality operators.

**Solution Implemented**:
- **Automatic Detection**: Identifies `numeric_simple` and `numeric_dropdown` questions
- **Smart Input Type**: Shows number input instead of dropdown for numeric questions
- **Visual Indicators**: Question dropdown shows "(numeric)" label for numeric questions
- **All Operators**: Full support for =, !=, >, <, >=, <= operators
- **Auto-Switching**: Automatically switches input type when changing question selection

**Files Modified**:
- `equationBuilder.js` - Enhanced `renderValueInput()` method with numeric question detection
- `equationBuilderStyles.css` - Added monospace styling for numeric inputs

**Usage Example**:
1. Open equation builder from H2 banner column
2. Select Q1 (numeric question) - shows "(numeric)" in dropdown
3. Choose operator like ">" or "<="
4. Enter numeric value directly in number input field
5. Creates equations like "Q1>5" or "Q1<=2"

**Technical Implementation**:
```javascript
const isNumericQuestion = ['numeric_simple', 'numeric_dropdown'].includes(mode);
if (isNumericQuestion) {
  return `<input type="number" class="numeric-value-input" ... />`;
}
```

---

*Last updated: 2025-09-29*
- memorize the rendering patterns. make sure to reread those files every time before you create ANY rendering functions or anything that woudl go against what we just established
- there are a ton of really annoying bugs that i can't exlain well. for instance, when i added a second H1 row, i had to run through it twice. and then wehen i refreshed, it didn't save. when i deleted some rows, it wouldn't let me til i refreshed and then it wouldn't render anything. then i refreshed again and it was a clean slate. i'm building up towards w:\local-ai-dev\apps\qgen-tab-planner\apps\web\examples . do you know what i'm trying to do? You see those eqations in the left column like S7=2. I'd like to be able to choose an H1 lable, and when i go to add an H2 lable, then i want to be able to add it based on an equation formula like that. conditional variations. and maybe i need to restructure the sourcing question saving in supabase because that's going to be important when i want to manipulate data using an spss file. once my tab banner shells are made, we're going to be able to turn them into our own data tables. and the data tables are based on tab sheet (each row is it's own table, sometimes rows might have more tables (like any with extra TB/BB summaries for multiple statements). but the banners are how each subgroup will be examined. so on the data tables, the banners will be the columns. and that's what i'm trying to recognize and automate in this new system. the UI should be extremely easy, straightforward, and simple - but most importantly *professional*. my team are not coders, we're market researchers. so i need to make sure that we're doing it right. please #memorize this