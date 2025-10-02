/**
 * LEGACY CODE
 * This file contains all the JavaScript functions from your original index.html.
 * It is loaded once by main.js to make functions like `renderEditor` globally available,
 * allowing the new modular code to interact with it during the refactoring process.
 */
export function loadLegacyCode() {
  
  // --- Start of Pasted Legacy Code ---

  /* --- guard: nuke any legacy globals if a stale file injected them --- */
  for (const k of ["ensureRules","renderEditorPanel","renderRules","renderEditor","renderPreview","renderDashboard"]) {
    try { delete window[k]; } catch {}
  }

  /************* SUPABASE SETUP *************/
  // NOTE: Supabase is already initialized in /src/lib/supa.js and available globally.
  // This legacy setup is no longer needed but kept for reference during refactor.
  // const SUPABASE_URL = 'http://127.0.0.1:54321';
  // const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  // const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  /* =========================
    LIKERT PRESET CATALOG
    ========================= */
  window.LIKERT_PRESETS = {
    agreement: {
      label: "Agreement",
      byPoints: {
        3: ["Disagree","Neither","Agree"],
        5: ["Strongly disagree","Disagree","Neither","Agree","Strongly agree"],
        7: ["Strongly disagree","Disagree","Somewhat disagree","Neither","Somewhat agree","Agree","Strongly agree"],
        10: ["1","2","3","4","5","6","7","8","9","10"]
      }
    },
    applicability: {
      label: "Applicability",
      byPoints: {
        3: ["Not applicable","Somewhat applicable","Fully applicable"],
        5: ["Not at all applicable","Slightly applicable","Moderately applicable","Very applicable","Extremely applicable"],
        7: ["Not at all","Slightly","Somewhat","Moderately","Very","Highly","Extremely"],
        10: ["1","2","3","4","5","6","7","8","9","10"]
      }
    },
    consideration: {
      label: "Consideration",
      byPoints: {
        3: ["Would not consider","Might consider","Would consider"],
        5: ["Definitely would not","Probably would not","Might or might not","Probably would","Definitely would"],
        7: ["Definitely not","Probably not","Somewhat not","Unsure","Somewhat would","Probably would","Definitely would"],
        10: ["1","2","3","4","5","6","7","8","9","10"]
      }
    },
    likelihood: {
      label: "Likelihood",
      byPoints: {
        3: ["Unlikely","Neither","Likely"],
        5: ["Very unlikely","Unlikely","Neither","Likely","Very likely"],
        7: ["Extremely unlikely","Very unlikely","Unlikely","Neither","Likely","Very likely","Extremely likely"],
        10:["Not at all likely","2","3","4","5","6","7","8","9","Extremely likely"]
      }
    },
    satisfaction: {
      label: "Satisfaction",
      byPoints: {
        3: ["Dissatisfied","Neutral","Satisfied"],
        5: ["Very dissatisfied","Dissatisfied","Neutral","Satisfied","Very satisfied"],
        7: ["Extremely dissatisfied","Very dissatisfied","Dissatisfied","Neutral","Satisfied","Very satisfied","Extremely satisfied"],
        10:["1","2","3","4","5","6","7","8","9","10"]
      }
    }
  };

  /* Build the mini UI for picking a preset (renders inside a host div) */
  window.openPresetPicker = function(i){
    // ... (All of your legacy JavaScript functions will go here)
    // For brevity, I am not pasting all 1000+ lines, but you should
    // copy everything from inside the <script> tag of old.index.html
    // and paste it right here.
  };


  // Example of another function from your old file
  window.applyThemeName = function(name){
    document.documentElement.setAttribute("data-theme", name);
    document.body.classList.toggle("gold-all", name === "cue-gold");
    // ... rest of the function
  };

  // ... PASTE ALL OTHER LEGACY JAVASCRIPT FUNCTIONS HERE ...
  
  // This is the last function from your old script file
  window.buildMockResponses = function() {
    const mockResponses = {};
    
    state.questions.forEach((q, index) => {
      if (q.id) {
        if (q.id.match(/S6_\\d/)) {
          mockResponses[q.id] = Math.floor(Math.random() * 3) + 1;
        } else if (Array.isArray(q.options) && q.options.length > 0) {
          mockResponses[q.id] = q.options[0].code || '1';
        } else if (isNumericQuestion(q)) {
          mockResponses[q.id] = '25';
        } else {
          mockResponses[q.id] = 'Sample response';
        }
      }
    });
    
    mockResponses['S6_2'] = 0;
    mockResponses['S6_3'] = 2;
    mockResponses['S6_4'] = 1;
    
    return mockResponses;
  }


  console.log("Legacy code has been loaded and is available on the window object.");
}

