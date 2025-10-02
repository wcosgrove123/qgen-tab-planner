<!doctype html>
<html lang="en" data-theme="cue-light">
<head>
  <meta charset="utf-8" />
  <title>Q-Gen -- Questionnaire & Tab Plan</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/assets/images/Cue_logo/Cue Logo 2.png" type="image/png" sizes="24x24">
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>


  <style>
  /* ===================================================================
      Q-GEN STYLESHEET (REORGANIZED)
      ===================================================================
      This stylesheet has been refactored for clarity and organization.
      It follows a logical progression from foundational settings to
      specific component styles.

      -- CONTENTS --
      1.  Design Tokens (Brand Colors, Theme Variables, etc.)
      2.  Global Styles (Resets, Typography, Base Body Layout)
      3.  Generic Utilities (Helpers like .is-hidden, .muted, etc.)
      4.  Layout Primitives (Containers like .app-grid, .stack, etc.)
      5.  Base Element Styles (Default styles for button, input, etc.)
      6.  App Chrome (Header, Main Navigation, Sidebar)
      7.  Core Components (Cards, Modals, Pills, Menus, etc.)
      8.  Page-Specific Styles (Dashboard, Project Manager, Editor)
      9.  Legacy or Feature-Specific Styles (Preview & Banner Builder)
      10. Accessibility & Overrides
    =================================================================== */

  /* ===================================================================
    1. DESIGN TOKENS
    - Brand Palette (Stable Base)
    - Theme Variables (Light, Dark, Gold)
    - Sizing & Spacing
    =================================================================== */

  /* --- Brand Palette (Core Colors) --- */
  :root {
    --brand-primary:   #212161;  /* deep navy */
    --brand-secondary: #F2B800;  /* gold */
    --brand-yellow:    #F4E412;
    --brand-blue-1:    #3F6AB7;
    --brand-blue-2:    #335899;
    --brand-accent-1:  #A7B5DB;  /* soft periwinkle */
    --brand-accent-2:  #8197D0;
    --brand-accent-3:  #E3EAF7;  /* light panel */
    --danger:          #C62828;
  }

  /* --- Sizing & Spacing Tokens --- */
  :root {
    --radius-sm: 8px;
    --radius-md: 10px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --space-1: 6px;
    --space-2: 8px;
    --space-3: 10px;
    --space-4: 12px;
    --space-5: 14px;
    --space-6: 16px;
  }

  /* --- Theme: Cue Light (Default) --- */
  :root,
  :root[data-theme="cue-light"] {
    --accent:       var(--brand-primary);
    --accent-weak:  #3b3b7d;
    --cta:          var(--brand-secondary);
    --cta-text:     #1a1a1a;
    --bg:           #EEF2FB;
    --surface-3:    #F1F4FB;
    --surface-2:    #F6F8FD;
    --surface-1:    #FFFFFF;
    --fg:           #0F172A;
    --muted:        #637189;
    --line:         #D9E0EF;
    --ring:         rgba(51, 88, 153, .35);
    --shadow:       0 8px 24px rgba(15, 23, 42, .06);
  }

  /* --- Theme: Cue Dark --- */
  :root[data-theme="cue-dark"] {
    --accent:       #A7B5DB;
    --accent-weak:  #8ea1da;
    --cta:          var(--brand-secondary);
    --cta-text:     #101010;
    --bg:           #0A0F24;
    --surface-3:    #101631;
    --surface-2:    #131A35;
    --surface-1:    #151F41;
    --fg:           #E7ECFF;
    --muted:        #A8B2CC;
    --line:         rgba(231, 236, 255, .10);
    --ring:         rgba(167, 181, 219, .45);
    --shadow:       0 10px 28px rgba(0, 0, 0, .35);
  }

  /* --- Theme: Cue Gold --- */
  :root[data-theme="cue-gold"] {
    --cta:        var(--brand-secondary);
    --cta-text:   #1a1a1a;
  }


  /* ===================================================================
    2. GLOBAL STYLES
    - CSS Resets
    - Body & Typography Defaults
    =================================================================== */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    overflow-x: hidden;
  }

  body {
    margin: 0;
    font: 14px/1.45 'Aptos', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    color: var(--fg);
    background: var(--bg);
    display: flex;
    flex-direction: column;
    padding-bottom: 70px; /* A little extra space */
  }

  /* Special body class for the Gold theme to override buttons */
  body.gold-all button:not(.danger) {
    background: var(--cta) !important;
    border-color: var(--cta) !important;
    color: var(--cta-text) !important;
  }

  /* ADD THIS to make your new editor look like a text field */
  [contenteditable="true"].form-control {
    border: 1px solid var(--line);
    transition: box-shadow .15s, border-color .15s, background .15s;
    padding: 16px;
  }

  /* ADD THIS to simulate placeholder text */
  [contenteditable="true"].form-control:empty::before {
    content: 'Enter question text...';
    color: var(--muted);
    pointer-events: none; /* Allows you to click "through" the placeholder */
  }

  .modern-footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: #2c3e50; /* A dark slate blue - adjust to your brand */
    color: white;
    padding: 15px 0;
    font-family: 'Segoe UI', Tahoma, sans-serif; /* A modern font */
  }

  .modern-footer .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px; /* Adjust max-width as needed */
      margin: 0 auto;
      padding: 0 25px;
  }

  .modern-footer .app-name {
      font-weight: bold;
      font-size: 1.1em;
  }

  .modern-footer .company-link a {
      color: #ffffff;
      text-decoration: none;
      opacity: 0.8;
      transition: opacity 0.2s ease-in-out;
  }

  .modern-footer .company-link a:hover {
      opacity: 1;
  }

  .comprehensive-footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: #ffffff; /* Clean white background */
    color: #555555; /* Soft black text */
    padding: 10px 0;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    border-top: 1px solid #ddd;
    font-size: 0.85em;
  }

  .comprehensive-footer .footer-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 25px;
  }

  .comprehensive-footer .footer-left a {
      color: #005A9C; /* Your brand's accent color */
      text-decoration: none;
      font-weight: 600;
  }

  .comprehensive-footer .footer-left a:hover {
      text-decoration: underline;
  }

  .comprehensive-footer .footer-right {
      display: flex;
      align-items: center;
  }

  .comprehensive-footer .social-icon {
      margin-left: 15px;
      color: #555555;
      opacity: 0.7;
      transition: opacity 0.2s ease-in-out;
  }

  .comprehensive-footer .social-icon:hover {
      opacity: 1;
  }

  .app-footer-zoned {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 15px 25px;
    background-color: #FFFFFF;
    border-top: 1px solid #EAECF0;
    color: #6C757D;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 13px;
  }

  .app-footer-zoned .footer-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1600px; /* Adjust to your app's max width */
      margin: 0 auto;
  }

  .app-footer-zoned a {
      color: #6C757D;
      text-decoration: none;
  }

  .app-footer-zoned a:hover {
      color: #4A5A94; /* Accent color on hover */
      text-decoration: underline;
  }

  .app-footer-zoned .footer-left a {
      color: #4A5A94;
      font-weight: 500;
  }

  .app-footer-zoned .footer-right {
      display: flex;
      align-items: center;
      gap: 20px; /* Creates space between the links */
  }


  /* ===================================================================
    3. GENERIC UTILITIES
    - Common helper classes for visibility, color, etc.
    =================================================================== */
  .is-hidden {
    display: none !important;
  }

  .muted {
    color: var(--muted);
  }

  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  .content-blur {
    filter: blur(4px);
    transition: filter .2s ease-out;
  }

  .ok {
    color: #16a34a;
    font-size: 12px;
  }

  .error {
    margin: 16px;
    white-space: pre-wrap;
    color: #7f1d1d;
    background: #fef2f2;
    border: 1px solid #fecaca;
    padding: 10px;
    border-radius: 8px;
  }


  /* ===================================================================
    4. LAYOUT PRIMITIVES
    - Reusable layout containers like grids and stacks.
    =================================================================== */
  main#view-root {
    flex: 1;
    overflow: auto;
    padding-top: 8px; /* Breathing room below sticky bars */
  }

  /* Main 2-column layout for the editor */
  .app-grid {
    display: grid;
    grid-template-columns: 360px minmax(0, 1fr);
    gap: 16px;
    padding: 16px;
    flex-grow: 1;
    overflow: hidden;
  }

  .left-panel,
  .right-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .left-panel {
    flex: 0 0 360px; /* Explicit size for left panel */
    background: var(--surface-2);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 12px;
    box-shadow: var(--shadow);
  }

  .right-panel-content {
    flex-grow: 1;
  }

  /* General purpose flexbox row */
  .stack {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  /* General purpose grid for cards, etc. */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }

  /* For simple key-value rows in the editor */
  .row {
    display: grid;
    grid-template-columns: 140px minmax(0, 1fr);
    gap: 10px;
    margin: 10px 0;
    align-items: start;
  }


  /* ===================================================================
    5. BASE ELEMENT STYLES
    - Default styling for forms, buttons, etc.
    =================================================================== */
  input,
  select,
  textarea {
    width: 100%;
    max-width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--surface-1);
    color: var(--fg);
    outline: none;
    font-family: inherit;
    font-size: 14px;
    transition: box-shadow .15s, border-color .15s, background .15s;
  }

  input:focus,
  select:focus,
  textarea:focus {
    box-shadow: 0 0 0 3px var(--ring);
    border-color: transparent;
  }

  textarea {
    min-height: 70px;
    resize: vertical;
  }

  button {
    font-family: inherit;
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: var(--surface-1);
    color: var(--fg);
    cursor: pointer;
    transition: filter .12s, background .12s, border-color .12s;
    max-width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  button:hover {
    filter: brightness(0.98);
  }

  button.primary,
  .btn.primary {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  button.danger,
  .btn.danger {
    border-color: var(--danger);
    color: var(--danger);
  }

  .btn.ghost {
    background: transparent;
  }

  .icon-btn {
    all: unset;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }


  /* ===================================================================
    6. APP CHROME
    - Header, Main Navigation, Sidebar/Drawer
    =================================================================== */

  /* --- Main Header --- */
  header {
    background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-blue-2) 50%, var(--brand-blue-1) 100%);
    border-bottom: 3px solid var(--brand-secondary);
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    box-shadow: 0 6px 20px rgba(33, 33, 97, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 101; /* Above sidebar backdrop */
    min-height: 72px;
  }

  header .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 22px;
    font-weight: 700;
    color: white;
    text-decoration: none;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  header .logo:hover {
    transform: translateY(-1px);
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  }

  header .logo img {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
  }

  header .logo:hover img {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: scale(1.05);
  }

  header .project-inputs {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  header .project-inputs .icon-btn {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 12px;
    border-radius: 10px;
    backdrop-filter: blur(10px);
    transition: all 0.2s ease;
    font-size: 16px;
    font-weight: bold;
  }

  header .project-inputs .icon-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  header .actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  header .actions .status-msg {
    color: white;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    backdrop-filter: blur(5px);
  }

  header .actions .project-indicator {
    color: white;
    font-weight: 600;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    backdrop-filter: blur(10px);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  header .actions .more-menu {
    position: relative;
  }

  header .actions .more-menu .icon-btn {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 12px;
    border-radius: 10px;
    backdrop-filter: blur(10px);
    transition: all 0.2s ease;
  }

  header .actions .more-menu .icon-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  /* --- Main Navigation (Legacy, centered pill buttons) --- */
  nav.app-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--surface-2);
    border-bottom: 1px solid var(--line);
    padding: 12px 0;
  }
  .app-nav .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .nav-btn {
    padding: 8px 14px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface-1);
    color: var(--muted);
    font-weight: 600;
    transition: box-shadow .15s, transform .05s;
  }
  .nav-btn:hover {
    transform: translateY(-1px);
  }
  .nav-btn.active {
    color: var(--fg);
    box-shadow: 0 0 0 2px var(--ring);
  }

  /* --- Project Shell Navigation (Tabs below header) --- */
  .project-shell-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--surface-2);
    border-bottom: 1px solid var(--line);
    padding: 0 16px;
  }
  .project-shell-nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
  }
  .shell-tab {
    padding: 14px 16px;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--muted);
    font-weight: 600;
    cursor: pointer;
  }
  .shell-tab.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }

  /* --- Sidebar / Drawer --- */
  .side-drawer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1000;
  }
  .side-drawer .sd-panel {
    position: absolute;
    transform: none !important;
    width: 280px;
    max-height: min(70vh, 560px);
    overflow: auto;
    background: var(--surface-1);
    border: 1px solid var(--line);
    border-radius: 14px;
    box-shadow: var(--shadow);
    pointer-events: auto;
    display: none;
    padding: 10px;
  }
  body.sidebar-open .side-drawer .sd-panel {
    display: block;
  }
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(2px);
    z-index: 99;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease-out;
  }
  body.sidebar-open .sidebar-backdrop {
    opacity: 1;
    pointer-events: auto;
  }
  .sd-title {
    margin: 8px 8px 4px;
    font-weight: 600;
    color: var(--muted);
    font-size: 12px;
    text-transform: uppercase;
  }
  .sd-link {
    display: flex;
    align-items: center;
    padding: 12px 14px;
    margin: 2px 0;
    border-radius: 10px;
    width: 100%;
    text-align: left;
  }
  .sd-link:hover {
    background: rgba(33, 33, 97, .06);
  }
  .sd-link.active {
    background: rgba(33, 33, 97, .10);
    color: var(--brand-primary);
    font-weight: 600;
  }
  .sd-link .icon {
    margin-right: 8px;
    flex-shrink: 0;
  }
  .sd-panel hr {
    border: 0;
    border-top: 1px solid var(--line);
    margin: 8px 0;
  }
  @media (max-width: 900px) {
    .side-drawer .sd-panel { width: 80vw; }
  }


  /* ===================================================================
    7. CORE COMPONENTS
    - Cards, Modals, Pills, Menus, etc.
    =================================================================== */

  /* --- Cards --- */
  .card {
    background: var(--surface-1);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
  }
  .card-header {
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .card-content {
    padding: 14px;
  }

  /* --- Modals --- */
  .modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
  }
  .modal-panel {
    width: min(720px, 92vw);
    background: var(--surface-1);
    border: 1px solid var(--line);
    border-radius: 16px;
    box-shadow: var(--shadow);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 85vh;
    animation: modalIn .18s ease-out;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(-16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .modal-header {
    padding: 16px 20px;
    background: var(--surface-2);
    border-bottom: 1px solid var(--line);
    flex-shrink: 0;
  }
  .modal-header h3 { margin: 0; }
  .modal-body {
    padding: 16px 20px;
    display: grid;
    gap: 12px;
    overflow-y: auto;
  }
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 20px 16px;
    background: var(--surface-2);
    border-top: 1px solid var(--line);
    flex-shrink: 0;
  }
  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, .35);
    backdrop-filter: blur(2px);
    z-index: -1;
  }

  /* --- Pills & Tags --- */
  .pill {
    padding: 2px 8px;
    border: 1px solid var(--line);
    border-radius: 999px;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
  }
  .tag {
    background: rgba(167, 181, 219, .25);
    color: var(--accent-weak);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
  }

  /* --- Dropdown Menus --- */
  .more-menu {
    position: relative;
  }
  .more-menu-content {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--surface-1);
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow);
    min-width: 200px;
    padding: 8px;
    z-index: 51;
  }
  .more-menu:hover .more-menu-content {
    display: block;
  }
  .more-menu-item {
    display: flex;
    align-items: center;
    width: 100%;
    text-align: left;
    padding: 10px 12px;
    border-radius: 8px;
    font-weight: 500;
    transition: background-color 0.15s ease-out;
  }
  .more-menu-item:hover {
    background: var(--surface-3);
    color: var(--fg);
  }
  .more-menu-content hr {
    border: 0;
    height: 1px;
    background-color: var(--line);
    margin: 8px 0;
  }

  /* --- Input Groups --- */
  .input-group {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    overflow: hidden;
  }
  .input-group label {
    padding: 8px 14px;
    background-color: var(--surface-2);
    color: var(--muted);
    font-weight: 500;
    border-right: 1px solid var(--line);
    white-space: nowrap;
  }
  .input-group select {
    border: none;
    border-radius: 0;
  }
  .input-group:focus-within {
    box-shadow: 0 0 0 3px var(--ring);
    border-color: transparent;
  }
  .input-group:focus-within select {
    box-shadow: none;
  }

  /* --- Toasts --- */
  #toastHost {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2000;
    pointer-events: none;
  }
  #toastHost .toast {
    pointer-events: auto;
  }
  .toast {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--surface-1);
    box-shadow: var(--shadow);
    max-width: min(520px, 92vw);
  }
  .toast button {
    padding: 6px 10px;
    border-radius: 10px;
  }


  /* ===================================================================
    8. PAGE-SPECIFIC STYLES
    - Dashboard, Project Manager, Editor, Validator, etc.
    =================================================================== */

  /* --- Project Manager & Dashboard Cards --- */
  .project-card {
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease-out;
    border-left: 4px solid grey; /* Default color */
  }
  .project-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow);
  }
  .project-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: var(--space-5) var(--space-6);
    border-bottom: 1px solid var(--line);
  }
  .project-title-group {
    display: flex;
    flex-direction: column;
  }
  .project-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--fg);
  }
  .project-version {
    font-size: 0.8rem;
  }
  .project-favorite-btn:hover {
    background-color: var(--surface-3);
  }
  .project-card-content {
    flex-grow: 1;
    padding: var(--space-5) var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .project-meta-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--muted);
  }
  .project-meta-item svg {
    flex-shrink: 0;
    stroke-width: 2px;
    opacity: 0.8;
  }
  .project-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding-top: var(--space-3);
  }
  .project-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4) var(--space-6);
    background-color: var(--surface-2);
    border-top: 1px solid var(--line);
    border-bottom-left-radius: var(--radius-lg);
    border-bottom-right-radius: var(--radius-lg);
  }

  /* Status dropdown styling to look like a pill */
  .status-selector-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  .status-selector-wrapper::after {
    content: '▾';
    position: absolute;
    right: 12px;
    pointer-events: none;
    color: var(--muted);
  }
  .status-selector {
    -webkit-appearance: none;
    -moz-appearance: none;  /* fix */
    appearance: none;
    background-color: var(--surface-1);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 6px 32px 6px 14px;
    font-weight: 500;
    cursor: pointer;
  }
  .status-selector:focus {
    outline: none;
    box-shadow: 0 0 0 3px var(--ring);
    border-color: transparent;
  }
  .project-indicator, .project-selector-dropdown {
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .project-indicator {
    display: flex;
    align-items: center;
    padding: 4px 12px;
    background-color: var(--surface-3);
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    font-weight: 500;
    color: var(--muted);
  }
  .project-indicator:not(:empty) {
    border-color: var(--brand-secondary);
    color: var(--fg);
  }

  /* --- Workbench Container --- */
  .workbench {
    max-width: 1000px;
    margin: 24px auto; /* 24px top/bottom, auto left/right for centering */
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* --- Editor --- */
  #question-list .q-item {
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--surface-1);
    cursor: grab;
    transition: border-color .12s, background .12s, box-shadow .12s;
    max-width: 100%;
  }
  #question-list .q-item + .q-item { margin-top: 8px; }
  #question-list .q-item:hover { border-color: var(--accent-weak); }
  #question-list .q-item.active {
    background: var(--surface-3);
    border-color: var(--accent-weak);
    box-shadow: 0 0 0 1px var(--accent-weak) inset;
  }
  #question-list .q-item .text {
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #question-list .q-item .summary {
    font-size: 12px;
    color: var(--muted);
    margin-top: 4px;
  }
  .editor-tabs {
    display: flex;
    gap: 6px;
    border-bottom: 1px solid var(--line);
    padding: 0 14px;
    background: var(--surface-1);
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
  .editor-tabs .tab {
    padding: 8px 12px;
    border: 1px solid transparent;
    border-bottom: 0;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    color: var(--muted);
    font-weight: 600;
  }
  .editor-tabs .tab.active {
    background: var(--surface-1);
    border-color: var(--line);
    color: var(--fg);
  }
  .editor-widget-bar {
      background: var(--surface-2);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      padding: var(--space-2) var(--space-4); /* 8px 12px */
      margin-bottom: -1px; /* Neatly sits on top of the text area */
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
  }
  .editor-toolbar-container {
      border: 1px solid var(--line);
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      background: var(--surface-2);
      margin-bottom: -1px; /* Sits flush on top of the textarea */
  }

  .toolbar-toggle-bar {
      padding: var(--space-2) var(--space-4); /* 8px 12px */
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--muted);
      font-weight: 600;
      font-size: 13px;
  }

  .toolbar-toggle-bar:hover {
      color: var(--fg);
  }

  .editor-toolbar {
    /* Styles for the collapsible area */
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 var(--space-4); /* No top/bottom padding when closed */
    max-height: 0;
    overflow: hidden;
    transition: all 0.25s ease-out;
  }
  .editor-toolbar.is-open {
    max-height: 80px; /* Animate to this height */
    padding-top: var(--space-3); /* 10px */
    padding-bottom: var(--space-3); /* 10px */
    border-top: 1px solid var(--line);
    margin-top: var(--space-2); /* 8px */
  }
  .editor-toolbar .form-control,
  .editor-toolbar .btn {
    padding-top: 4px;
    padding-bottom: 4px;
  }
  .editor-toolbar select.form-control {
    width: 100px; /* Makes the font size selector smaller */
  }


  .tab-content { display: none; }
  .tab-content.active { display: block; }
  #editor-panel:empty::before {
    content: "Select a question from the left to edit it, or add a new one.";
    color: var(--muted);
    background: var(--surface-1);
    border: 2px dashed var(--line);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 20px;
  }
  .option-editor-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: nowrap;
    margin-bottom: var(--space-2);
  }
  .option-editor-row input[placeholder="Label"] { flex: 1 1 auto; min-width: 0; }
  .option-editor-row input[placeholder="Code"] { flex: 0 0 70px; }
  .option-editor-row input { padding-top: 8px; padding-bottom: 8px; }

  .advanced-options .stack {
    background: var(--surface-3);
    padding: var(--space-4);
    border-radius: var(--radius-sm);
    border: 1px solid var(--line);
  }

  /* ==========================================================
   NEW ACCORDION SIDEBAR STYLES
   ========================================================== */
  /* The new single container for the whole sidebar */
/* ==========================================================
   POLISHED ACCORDION SIDEBAR STYLES
   ========================================================== */

  /* The new single container for the whole sidebar */
  .accordion-panel {
      background: var(--surface-1);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      overflow: hidden;
  }

  /* The inner container for the items */
  .accordion-sidebar {
      display: flex;
      flex-direction: column;
  }

  /* Individual accordion items no longer have their own borders or shadows */
  .accordion-item {
      border-top: 1px solid var(--line);
      transition: background-color 0.2s ease-out;
  }
  .accordion-item:first-child {
      border-top: none; /* Remove divider for the very first item */
  }

  .accordion-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      cursor: pointer;
      user-select: none;
      position: relative; /* For the active indicator */
  }

  /* Improved Hover State */
  .accordion-header:hover {
      background: var(--surface-3);
  }

  /* Clearer Active State */
  .accordion-item.active > .accordion-header {
      background-color: var(--brand-accent-3); /* A light blue/purple tint */
  }
  /* This is the key change: the colored left border */
  .accordion-item.active > .accordion-header::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: var(--accent);
  }

  .accordion-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--fg);
  }

  .active .accordion-title {
      color: var(--accent); /* Keep the text color change */
  }

  .accordion-toggle-icon {
      transition: transform 0.25s ease-out;
      color: var(--muted);
  }
  .accordion-item.active .accordion-toggle-icon {
      color: var(--accent);
  }

  .is-expanded .accordion-toggle-icon {
      transform: rotate(180deg);
  }

  .accordion-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out, padding 0.3s ease-out;
      padding: 0 16px; /* Use slightly less padding */
      background: var(--surface-2); /* A slightly darker background to contain the content */
  }

  .is-expanded .accordion-content {
      max-height: 1000px; 
      padding: 16px 16px 20px;
      border-top: 1px solid var(--line);
  }

  /* --- Cleanup for Content INSIDE the accordion --- */
  /* These rules simplify the "Add Questions" and "Question List" cards */
  .is-expanded .sidebar-header-card,
  .is-expanded .question-list-card {
      border: none;
      box-shadow: none;
      background: transparent;
      padding: 0;
  }
  .is-expanded .question-list-header {
      background: transparent;
      padding: 0 0 12px 0;
  }

  /* START: Gantt Chart Styles */
  .gantt-chart-container {
    padding: 16px;
    overflow-x: auto;
  }
  .gantt-row {
    display: grid;
    grid-template-columns: 250px 1fr;
    border-bottom: 1px solid var(--line);
    align-items: center;
  }
  .gantt-row:first-of-type {
    border-top: 1px solid var(--line);
  }
  .gantt-header {
    font-weight: 600;
    background-color: var(--surface-2);
  }
  .gantt-label-cell {
    padding: 12px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-right: 1px solid var(--line);
  }
  .gantt-timeline-cell {
    position: relative;
    padding: 12px 0;
    display: grid;
    grid-template-columns: repeat(12, 1fr); /* 12 months */
    border-right: 1px solid var(--line);
  }
  .gantt-month-marker {
    text-align: center;
    font-size: 12px;
    color: var(--muted);
    border-right: 1px solid var(--line);
    padding: 4px 0;
  }
  .gantt-month-marker:last-child {
    border-right: none;
  }
  .gantt-bar {
    position: absolute;
    height: 24px;
    background-color: var(--brand-blue-1);
    border-radius: 4px;
    border: 1px solid var(--brand-blue-2);
    color: white;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 2px 8px;
    cursor: pointer;
    transition: filter 0.2s;
  }
  .gantt-bar:hover {
    filter: brightness(1.05);
  }



  /* START: Workload View Styles */
  .workload-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 16px;
    padding: 16px;
  }
  .workload-person-lane {
    background-color: var(--surface-1);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
  }
  .workload-person-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--line);
    background-color: var(--surface-2);
  }
  .workload-person-header h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  .workload-cards-container {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-grow: 1; /* Allows the container to fill space */
  }
  .workload-card {
    background-color: var(--surface-2);
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    padding: 12px;
    cursor: pointer;
    transition: box-shadow 0.2s;
  }
  .workload-card:hover {
    box-shadow: var(--shadow);
    border-color: var(--accent);
  }
  .workload-card-title {
    font-weight: 600;
    margin-bottom: 8px;
  }
  .workload-card-meta {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  /* END: Workload View Styles */
  /* ===================================================================
    9. LEGACY / FEATURE-SPECIFIC STYLES
    - Preview and Banner Builder styles are complex and scoped here.
    - They use some hardcoded colors and may not be fully theme-aware.
    =================================================================== */

  /* --- Preview Scaffolding (General) --- */
  .pv-wrap { padding: 16px 20px 28px; }
  .pv-header h2 { margin: 0; font-size: 20px; }
  .pv-sub { color: #666; margin-top: 2px; }
  .pv-sec { margin-top: 18px; }
  .pv-sec > h3 { margin: 12px 0 8px; font-size: 16px; }
  .pv-empty {
    padding: 10px 12px;
    color: #777;
    background: #f7f7fb;
    border: 1px solid #eee;
    border-radius: 8px;
  }
  .pv-row {
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 10px 14px;
    padding: 10px 12px;
    border: 1px solid #e5e8f1;
    border-radius: 12px;
    margin: 8px 0;
    background: #fff;
  }
  .pv-qid { font-weight: 600; color: #212161; align-self: start; }
  .pv-body { display: flex; flex-direction: column; gap: 6px; }
  .pv-title { font-weight: 600; }
  .pv-meta { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; }
  .pv-chip {
    display: inline-block;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 999px;
    background: #E3EAF7;
    color: #335899;
    border: 1px solid #A7B5DB;
  }
  .pv-tabs { display: flex; gap: 6px; margin: 12px 0; padding-left: 6px; }
  .pv-tab {
    padding: 8px 12px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface-1);
    color: var(--muted);
    font-weight: 600;
    cursor: pointer;
  }
  .pv-tab.active { color: var(--fg); box-shadow: 0 0 0 2px var(--ring); }
  .pv-panel { display: none; }
  .pv-panel.active { display: block; }
  .pv-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .pv-table th, .pv-table td { border: 1px solid #e5e8f1; padding: 6px 8px; text-align: left; }

  /* --- Banner Builder Grid --- */
  .pv-banner-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .pv-banner-grid {
    --pv-col-min: 160px;
    --pv-col-add: 60px;
    --pv-surface-1: #fff;
    --pv-border: #d9dbe0;
    --pv-h1-bg: #f6f7fb;
    --pv-stats-bg: #fafbfe;
    --pv-accent: #222;
    position: relative;
    display: grid;
    grid-auto-rows: auto;
  }
  .pv-banner-h1, .pv-banner-h2, .pv-banner-stats {
    display: contents !important;
  }
  .pv-banner-block {
    z-index: 0;
    pointer-events: none;
    background: var(--pv-surface-1);
    border-top: 1px solid var(--pv-border);
    border-bottom: 1px solid var(--pv-border);
    border-radius: 8px;
  }
  .pv-banner-cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 12px;
    background: var(--pv-surface-1);
    border: 1px solid var(--pv-border);
    border-top: none;
    z-index: 1;
  }
  .pv-banner-stats .pv-banner-cell {
    background: var(--pv-stats-bg);
    font-size: 12px;
    color: #6b7280;
    justify-content: center;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  .pv-banner-cell.pv-h1 {
    background: var(--pv-h1-bg);
    border-top: 1px solid var(--pv-border);
    border-bottom: 2px solid var(--pv-accent);
    font-weight: 600;
    justify-content: space-between;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  .pv-banner-h1 .pv-banner-cell { border-bottom: 1px solid var(--line) !important; }
  .pv-h1-text { padding-right: 8px; }
  .pv-banner-cell.pv-h2 { min-height: 56px; }
  .pv-h2-inner { display: flex; align-items: center; gap: 6px; width: 100%; }
  .pv-menu {
    margin-left: auto;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    opacity: .6;
    border-radius: 6px;
  }
  .pv-menu:hover { opacity: 1; background: rgba(0,0,0,.04); }
  .pv-add-cell {
    justify-content: center;
    min-height: 56px;
  }
  .pv-add-cell.pv-add-per-h1 { grid-row: span 2; }
  .pv-add-btn { border: none; background: transparent; cursor: pointer; }
  .pv-add-pill {
    border: 1px dashed var(--line);
    background: var(--surface-1);
    opacity: .95;
    border-radius: 999px;
    padding: 4px 10px;
  }
  .pv-add-pill:hover { opacity: 1; }
  .pv-editable { cursor: text; border-radius: 6px; padding: 2px 4px; }
  .pv-editable:focus-within { box-shadow: 0 0 0 2px var(--ring); outline: none; }
  .pv-inline-input {
    width: 100%;
    font: inherit;
    padding: 4px 6px;
    border: 1px solid var(--pv-border);
    border-radius: 6px;
    background: #fff;
  }
  .pv-cond-dot {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--pv-accent);
    opacity: 0;
  }
  .pv-banner-cell.has-cond .pv-cond-dot { opacity: .9; }
  .pv-cell-menu {
    position: fixed;
    z-index: 1001;
    min-width: 220px;
    background: var(--surface-1);
    border: 1px solid var(--line);
    border-radius: 10px;
    box-shadow: var(--shadow);
    padding: 6px;
  }
  .pv-cell-menu .mitem {
    display: block;
    width: 100%;
    text-align: left;
    padding: 8px 10px;
    border-radius: 8px;
  }
  .pv-cell-menu .mitem:hover { background: var(--surface-3); }
  .pv-cell-menu .subhead {
    font-size: 12px;
    color: var(--muted);
    padding: 6px 10px 2px;
  }

  /* START: Timeline Styles */
  .timeline-view {
    padding: 24px;
  }
  .timeline-item {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid var(--line);
  }
  .timeline-item:last-child {
    border-bottom: none;
  }
  .timeline-date {
    font-weight: 600;
    text-align: right;
    color: var(--muted);
    font-size: 13px;
  }
  .timeline-card {
    border-left: 3px solid var(--accent);
    padding-left: 16px;
  }
  .timeline-card-title {
    font-weight: 600;
    margin-bottom: 4px;
  }
  .timeline-card-meta {
    font-size: 13px;
    color: var(--muted);
  }
  /* END: Timeline Styles */

  /* ===================================================================
   NEW EDITOR UI STYLES (FROM MOCKUP)
   =================================================================== */

  /* Main Content Layout */
  .editor-main-content {
      display: grid;
      grid-template-columns: 360px 1fr; /* Wider sidebar */
      gap: 24px;
      padding: 24px;
      max-width: 1600px; /* Allow wider view */
      margin: 0 auto;
  }

  /* Question List Sidebar */
  .question-sidebar {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: calc(100vh - 120px); /* Prevent page stretching */
      position: sticky;
      top: 80px; /* Adjust based on your header height */
  }

  .sidebar-header-card {
      background: var(--surface-1);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow);
  }

  .sidebar-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: var(--fg);
  }

  .add-question-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
  }

  .add-btn {
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      background: var(--surface-2);
      color: var(--fg);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
  }

  .add-btn:hover {
      background: var(--accent);
      color: white;
      transform: translateY(-1px);
      border-color: var(--accent);
  }

  .question-list-card {
      background: var(--surface-1);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      overflow: hidden;
      flex: 1;
      display: flex;
      flex-direction: column;
  }

  .question-list-header {
      padding: 16px 20px;
      background: var(--surface-2);
      border-bottom: 1px solid var(--line);
      font-weight: 600;
      color: var(--fg);
      flex-shrink: 0;
  }
  .question-list-body {
      overflow-y: auto;
      flex: 1;
  }

  .question-item {
      padding: 12px 16px;
      border-bottom: 1px solid var(--line);
      cursor: grab;
      transition: all 0.2s ease;
      position: relative;
  }

  .question-item:last-child { border-bottom: none; }
  .question-item:hover { background: var(--surface-3); }

  .question-item.active {
      background: var(--brand-accent-3);
      border-left: 4px solid var(--accent);
      padding-left: 12px;
  }

  .question-item .summary { /* Reusing your old class for the meta text */
      font-size: 12px;
      color: var(--muted);
      margin-top: 4px;
  }
  /* Add these properties to your existing .question-item .text rule */
  .question-item .text {
      font-weight: 500;
      color: var(--fg);
      
      /* --- NEW STYLES START HERE --- */
      
      /* This prevents the text from wrapping to new lines */
      white-space: nowrap; 
      
      /* Hides any text that overflows the container's width */
      overflow: hidden; 
      
      /* This adds the "..." at the end of the line */
      text-overflow: ellipsis; 
      
      /* --- NEW STYLES END HERE --- */
  }

  /* This is an OPTIONAL but recommended addition. 
    It ensures the layout doesn't break if a question ID tag is very long.
  */
  .question-item .tag {
      flex-shrink: 0; /* Prevents the tag from shrinking */
  }


  /* Editor Panel */
  .editor-panel-card {
      background: var(--surface-1);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
  }

  .editor-header {
    padding: 16px 24px;
    background: var(--surface-2);
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between; /* <-- This pushes the title and buttons apart */
  }

  .editor-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--fg);
  }
  .editor-title strong { color: var(--accent); }

  .editor-content {
      padding: 24px;
  }

  .editor-section {
      margin-bottom: 32px;
  }
  .editor-section:last-child { margin-bottom: 0; }

  .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--fg);
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--line);
  }

  .form-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 16px;
      align-items: start;
      margin-bottom: 16px;
  }
  .form-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--muted);
      padding-top: 10px;
      text-align: right;
  }

  /* Mode Selection Pills */
  .mode-selection {
    display: flex;
    width: 100%;
    gap: 4px;
    background: var(--surface-2);
    padding: 4px;
    border-radius: var(--radius-md);
    border: 1px solid var(--line);
  }
  .mode-btn {
    padding: 6px 16px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--muted);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .mode-btn.active {
    background: var(--surface-1);
    color: var(--accent);
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .mode-selection .mode-btn {
    flex-grow: 1; /* Allows each button to grow and fill the available space */
  }

  /* Options List Container */
  .options-content-area {
      background: var(--surface-2);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      padding: 16px;
  }

  /* Updated Option Editor Row */
  .option-editor-row { /* Your existing class is fine, just needs a tweak */
      background: var(--surface-1);
      padding: 8px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--line);
  }

  /* --- Pre-Field Sub-Navigation Pills --- */
  .prefield-subnav-container {
      padding: 16px 0;
      display: flex;
      justify-content: center;
      background: var(--bg);
      border-bottom: 1px solid var(--line);
      position: sticky;
      top: 65px; /* Adjust if your main nav height changes */
      z-index: 49;
  }

  .prefield-pills {
      display: inline-flex;
      gap: 6px;
      background: var(--surface-2);
      padding: 6px;
      border-radius: var(--radius-md);
      border: 1px solid var(--line);
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
  }

  .prefield-pill-btn {
      padding: 8px 20px;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--muted);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
  }

  .prefield-pill-btn.active {
      background: var(--surface-1);
      color: var(--accent);
      box-shadow: var(--shadow);
  }

  .prefield-pill-btn:hover:not(.active) {
      background: rgba(0,0,0,0.02);
      color: var(--fg);
  }

  /* Responsive Adjustments */
  @media (max-width: 1200px) {
      .editor-main-content {
          grid-template-columns: 320px 1fr;
      }
  }
  @media (max-width: 900px) {
      .editor-main-content {
          grid-template-columns: 1fr;
      }
      .question-sidebar {
          max-height: none;
          position: static;
          top: auto;
      }
  }

  /* START: Kanban Styles */
  .kanban-board {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding: 16px;
    background-color: var(--surface-2);
    min-height: 60vh;
  }
  .kanban-column {
    flex: 0 0 320px; /* Each column has a fixed width */
    background-color: var(--surface-1);
    border-radius: var(--radius-lg);
    border: 1px solid var(--line);
    display: flex;
    flex-direction: column;
  }
  .kanban-column-header {
    padding: 12px 16px;
    font-weight: 600;
    border-bottom: 1px solid var(--line);
    background-color: var(--surface-2);
    border-top-left-radius: var(--radius-lg);
    border-top-right-radius: var(--radius-lg);
  }
  .kanban-cards {
    flex-grow: 1;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 100px; /* Ensures drop zone is available even when empty */
  }
  .project-card.is-dragging {
    opacity: 0.5;
    transform: scale(0.98);
  }
  /* END: Kanban Styles */

  /* ===================================================================
    10. ACCESSIBILITY & OVERRIDES
    =================================================================== */
  :focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--ring);
    border-radius: 8px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }


</style>
<body>
<header>
    <div class="project-inputs">
      <button id="sidebar-toggle" title="Toggle Sidebar" class="icon-btn">☰</button>
    </div>
    
    <a href="#/dashboard" id="logo-link" class="logo" title="Go to Dashboard">
      <img src="/assets/images/cue_logo/Cue Logo 2.png" alt="Cue Insights" height="48" style="display: block;" />
      <span>Q-Gen Tab Planner</span>
    </a>
    
    <div class="actions">
      <div id="project-name-indicator" class="project-indicator"></div>

      <div id="status" class="status-msg"></div>

      <div class="more-menu">
          <button id="settingsBtn" title="Settings" class="icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
          <div class="more-menu-content">
            <div class="more-menu-item theme-switcher-item">
                <label for="themeSwitch">Theme</label>
                <select id="themeSwitch" title="Theme">
                    <option value="cue-light">Cue Light</option>
                    <option value="cue-dark">Cue Dark</option>
                    <option value="cue-gold">Cue Gold</option>
                </select>
            </div>
            <hr style="margin: 4px 0; border-color: var(--line);">
            <button class="more-menu-item" onclick="goto('#/project/rules')">Project Rules</button>
            <button class="more-menu-item" onclick="goto('#/project/library')">Question Library</button>
            <button class="more-menu-item" onclick="renderPreview()">Preview</button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Slide-out navigation (hamburger) -->
  <div id="sideDrawer" class="side-drawer">
    <div class="sd-panel" role="menu" aria-label="Main navigation">
      <div class="sd-title">Navigate</div>

      <button class="sd-link pv-tab" data-route="#/dashboard">
        Dashboard
      </button>
      
      <button class="sd-link pv-tab" data-route="#/clients">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.964A3 3 0 0012 12v-1.5a3 3 0 00-3-3H6a3 3 0 00-3 3v1.5a3 3 0 003 3m7.5-2.964h.008v.008h-.008v-.008zm-7.5 0h.008v.008h-.008v-.008z" /></svg>
        Clients
      </button>

      <button class="sd-link pv-tab" data-route="#/analytics">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
        Analytics
      </button>
      
      <button class="sd-link pv-tab" data-route="#/projects">
        Projects
      </button>
    </div>
  </div>

  <!-- Backdrop (click to close) -->
  <div class="sidebar-backdrop" id="sidebarBackdrop"></div>


  <div id="editor-subtabs" class="subtabs is-hidden">
    <div class="subtabs-inner">
      <button data-subtab="pre"     onclick="goto('#/editor/pre')"     class="subtab">Pre-Field</button>
      <button data-subtab="field"   onclick="goto('#/editor/field')"   class="subtab">Fielding</button>
      <button data-subtab="report"  onclick="goto('#/editor/report')"  class="subtab">Reporting</button>
      <button data-subtab="post"    onclick="goto('#/editor/post')"    class="subtab">Post-Survey</button>
    </div>
  </div>


  <div id="createProjectModal" class="modal is-hidden" role="dialog" aria-modal="true" aria-labelledby="cp-title">
  <div class="modal-panel" onclick="event.stopPropagation()">
    <div class="modal-header">
      <h3 id="cp-title">Create Project</h3>
      <button class="icon-btn" onclick="closeCreateProjectModal()" aria-label="Close">✕</button>
    </div>

      
    <div class="modal-body">
      <label class="field">
        <span>Project Name</span>
        <input id="cp-name" type="text" placeholder="e.g., INFUSE Claims Test" />
      </label>

      <label class="field">
        <span>Client</span>
        <input id="cp-client" type="text" placeholder="e.g., Kenvue / JJIV" />
      </label>

      <div class="stack" style="gap: 12px; grid-template-columns: 1fr 1fr; display: grid;">
        <label class="field">
          <span>Status</span>
          <select id="cp-status">
            <option value="Draft" selected>Draft</option>
            <option value="Pre-Field">Pre-Field</option>
            <option value="Fielding">Fielding</option>
            <option value="Reporting">Reporting</option>
            <option value="Waiting for Approval">Waiting for Approval</option>
            <option value="Approved">Approved</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
            <option value="Archived">Archived</option>
          </select>
        </label>
        <label class="field">
          <span>Project Type</span>
          <select id="cp-project-type">
            <option value="">Select a type...</option>
            <option value="Brand Tracker">Brand Tracker</option>
            <option value="Ad Hoc">Ad Hoc</option>
            <option value="Concept Test">Concept Test</option>
            <option value="Claims Test">Claims Test</option>
            <option value="UX Research">UX Research</option>
            <option value="__custom__">-- Add Custom Type --</option>
          </select>
          <input type="text" id="cp-project-type-custom" class="is-hidden" placeholder="Enter custom type" style="margin-top: 8px;" />
        </label>
      </div>
      
      <div class="field">
        <span>Roles</span>
        <div id="cp-roles-container" style="display: grid; gap: 8px; margin-top: 4px;">
          </div>
        <button id="add-role-btn" type="button" style="margin-top: 8px;">+ Add Role</button>
      </div>
    
      <div class="field">
        <span>Important Dates</span>
        <div id="cp-dates-container" style="display: grid; gap: 12px; margin-top: 4px;">
          </div>
        <button id="add-date-btn" type="button" style="margin-top: 8px;">+ Add Date</button>
      </div>
    
      <label class="field">
        <span>Tags</span>
        <input id="cp-tags" type="text" placeholder="e.g., pharma, skincare, Q3-2025" />
        <small class="muted">Separate tags with commas.</small>
      </label>
    
      <label class="field">
        <span>Notes</span>
        <textarea id="cp-notes" rows="3" placeholder="Any context, constraints, deliverables…"></textarea>
      </label>

      <div class="field">
        <span>Start From Template (Optional)</span>
        <select id="cp-template">
          <option value="">Create blank project</option>
        </select>
        <div class="stack" style="margin-top: 8px; gap: 8px;">
          <button type="button" onclick="openTemplateManager()" class="btn">Manage Templates</button>
          <button type="button" onclick="saveCurrentAsTemplate()" class="btn">Save Current Project as Template</button>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn ghost" onclick="closeCreateProjectModal()">Cancel</button>
      <button class="btn primary" onclick="createProjectFromModal()">Create Project</button>
    </div>
  </div>
  <div class="modal-backdrop" onclick="closeCreateProjectModal()"></div>
</div>

  <main id="view-root" style="flex:1; overflow:auto"></main>

  <div id="serverError" class="error" style="display:none; margin:12px"></div>

<script>
/* --- guard: nuke any legacy globals if a stale file injected them --- */
for (const k of ["ensureRules","renderEditorPanel","renderRules","renderEditor","renderPreview","renderDashboard"]) {
  try { delete window[k]; } catch {}
}

/************* SUPABASE SETUP *************/
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* =========================
   LIKERT PRESET CATALOG
   ========================= */
const LIKERT_PRESETS = {
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
  function openPresetPicker(i){
  const host = document.getElementById(`presetHost-${i}`);
  if (!host) return;

  // Toggle open/close
  if (host.style.display === 'block') { host.style.display = 'none'; host.innerHTML = ''; return; }
  host.style.display = 'block';

  const close = () => {
    host.style.display = 'none';
    host.innerHTML = '';
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onEsc, true);
  };
  const onDocClick = (e) => {
    if (!host.contains(e.target) && e.target.id !== `presetBtn-${i}`) close();
  };
  const onEsc = (e) => { if (e.key === 'Escape') close(); };

  document.addEventListener('click', onDocClick, true);
  document.addEventListener('keydown', onEsc, true);

  const ptsOptions = [3,5,7,10].map(n=>`<option value="${n}">${n} pt.</option>`).join("");
  const typeOptions = Object.entries(LIKERT_PRESETS)
    .map(([k,v])=>`<option value="${k}">${v.label}</option>`).join("");

  host.innerHTML = `
    <div class="sticky-head">
      <div class="stack" style="align-items:flex-end; flex-wrap:wrap;">
        <label>Points
          <select id="prePts-${i}" style="min-width:120px">${ptsOptions}</select>
        </label>
        <label>Scale type
          <select id="preType-${i}" style="min-width:220px">${typeOptions}</select>
        </label>
        <button id="preApply-${i}" class="primary">Apply</button>
        <button id="preCancel-${i}">Cancel</button>
        <button id="preCustom-${i}">Create your own...</button>
      </div>
    </div>
    <div class="muted">Preview:</div>
    <div id="prePrev-${i}" class="mono" style="white-space:normal; word-break:break-word;"></div>
  `;

  const $pts  = document.getElementById(`prePts-${i}`);
  const $type = document.getElementById(`preType-${i}`);
  const $prev = document.getElementById(`prePrev-${i}`);

  function refreshPreview(){
    const t   = $type.value;
    const pts = parseInt($pts.value, 10);
    const labels = (LIKERT_PRESETS[t]?.byPoints?.[pts]) || [];
    $prev.textContent = labels.join(" | ");
  }
  $pts.onchange = refreshPreview;
  $type.onchange = refreshPreview;
  refreshPreview();

  document.getElementById(`preCancel-${i}`).onclick = close;

  // "Create your own…" is now correctly wired here
  document.getElementById(`preCustom-${i}`).onclick = () => {
    openPresetMaker(i);
  };

  document.getElementById(`preApply-${i}`).onclick = () => {
    const q   = state.questions[i];
    const t   = $type.value;
    const pts = parseInt($pts.value, 10);
    const labels = (LIKERT_PRESETS[t]?.byPoints?.[pts]) || [];
    if (!labels.length) return close();

    // Ensure table mode & sync
    q.mode = 'table';
    q.grid ||= { rows: q.statements || [], cols: [] };
    q.grid.cols = [...labels];
    q.scale ||= {};
    q.scale.labels = [...labels];
    q.scale.points = labels.length;

    harmonizeTypeFromMode(q);
    syncTableFacets(q);
    queueAutosave();
    renderEditorPanel();
    setStatus(`Applied ${pts}-pt ${LIKERT_PRESETS[t].label} preset.`, true);
    close();
  };

  // Keep the panel within viewport horizontally (simple edge guard)
  const rect = host.getBoundingClientRect();
  const overflowRight = rect.right - (window.innerWidth - 12);
  if (overflowRight > 0) host.style.left = `calc(0px - ${overflowRight}px)`;
}

/************* THEME *************/
const THEME_KEY = "qgen_theme";
const themeSel = document.getElementById("themeSwitch");
function applyThemeName(name){
  document.documentElement.setAttribute("data-theme", name);
  document.body.classList.toggle("gold-all", name === "cue-gold");
  localStorage.setItem(THEME_KEY, name);
  themeSel.value = name;
}
(function initTheme(){ const saved = localStorage.getItem(THEME_KEY) || "cue-light"; applyThemeName(saved); themeSel.addEventListener("change", e => applyThemeName(e.target.value)); })();

/************* STATE *************/
const AUTOSAVE_KEY = "qgen_autosave_v3";
const PROJECTS_KEY = "qgen_projects_v1"; // dashboard store
const LIB_KEY = "qgen_library_v1";      // question library
const SNAP_KEY = "qgen_snapshots_v1";   // versions per project (by id)
const PEOPLE_KEY = "qgen_people_v1"; // Key for storing our people list

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ========= PRESET SCALES (built-in + custom storage) ========= */
const PRESET_KEY = "qgen_custom_scales_v1"; // localStorage

// Built-ins. Keep "Numerical" first; others alphabetical in UI.
const BUILTIN_SCALES = {
  3: {
    Numerical: ["1","2","3"],
    Agreement: ["Strongly disagree","Disagree","Strongly agree"],
    Frequency: ["Rarely","Sometimes","Often"],
  },
  5: {
    Numerical: ["1","2","3","4","5"],
    Agreement: ["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"],
    Consideration: ["Definitely would not consider","Probably would not consider","Might or might not consider","Probably would consider","Definitely would consider"],
    Application: ["Not at all applicable","Slightly applicable","Moderately applicable","Very applicable","Extremely applicable"],
  },
  7: {
    Numerical: ["1","2","3","4","5","6","7"],
    Agreement: ["Strongly disagree","Disagree","Somewhat disagree","Neutral","Somewhat agree","Agree","Strongly agree"],
  },
  10: {
    Numerical: ["1","2","3","4","5","6","7","8","9","10"],
  }
};

function loadCustomScales(){
  try { return JSON.parse(localStorage.getItem(PRESET_KEY) || "{}"); }
  catch { return {}; }
}
function saveCustomScales(map){
  localStorage.setItem(PRESET_KEY, JSON.stringify(map));
}
function getScalesFor(points){
  const built = BUILTIN_SCALES[points] || {};
  const customMap = loadCustomScales();
  const custom = (customMap[points] || {});    // {Name: [labels]}
  // Order: Numerical first (if present), then others alpha
  const names = Object.keys({...built, ...custom});
  const numericalFirst = names.sort((a,b)=>{
    if (a==="Numerical") return -1;
    if (b==="Numerical") return 1;
    return a.localeCompare(b);
  });
  return numericalFirst.map(name => ({
    name,
    labels: (custom[name] || built[name])
  }));
}
function saveCustomPreset(points, name, labels, description=""){
  const map = loadCustomScales();
  (map[points] ||= {});
  map[points][name] = labels;
  // (Optional) you could also store descriptions in a sibling map if wanted
  saveCustomScales(map);
}


const state = {
  // 1. Project-specific details
  project: {
    id: "proj-" + Math.random().toString(16).slice(2, 10),
    name: "",
    client_id: null,       // Foreign key to the clients table
    organization_id: null, // Foreign key to the organizations table
    version: "0.1.0"
    // Other simple fields like status, notes, tags will also live here
  },

  // 2. Project-wide settings (maps to the project_globals table)
  globals: {
    default_base_verbiage: "Total (qualified respondents)",
    default_base_definition: "",
    scale_buckets: {
      "5pt": { "TB": [5], "T2B": [4, 5], "B2B": [1, 2], "BB": [1], "Mean": true },
      "7pt": { "TB": [7], "T2B": [6, 7], "B2B": [1, 2], "BB": [1], "Mean": true },
      "10pt": { "TB": [10], "T2B": [9, 10], "B2B": [1, 2], "BB": [1], "Mean": true }
    },
    banners: [{
      id: "BNR_CORE",
      label: "Core Demo & Cohorts",
      mode: "concat",
      dimensions: []
    }]
  },

  // 3. The list of all questions in the project
  questions: []
};

const ui_state = {
  organization_id: null, // Stores the main org ID after the first save
  active_project_id: null,
  active_question_index: null,
  active_tab: 'main',
  route: location.hash || '#/dashboard',
  active_prefield_tab: 'screener',
  base_builders: {} // Initialize here for cleanliness
};

/* ===== STEP 1: Option/Question defaults + migration ===== */
const OPTION_DEFAULTS = {
  exclusive: false,        // already existed
  terminate: false,        // already existed
  anchor: null,            // 'top' | 'bottom' | null
  lock_randomize: false,   // keep position even if shuffled
  custom_code: "",         // export-only override
  custom_label: "",        // export-only override
  nested_dropdown: {
    enabled: false,
    depends_on: null,      // field name this dropdown depends on
    value_map: {}          // mapping of parent values to child options
  },
  validation_range: null, // e.g., { min: 0.5, max: 6.0, decimals: [0, 5] }
  input_type: 'number'    // 'number' | 'text' 
};

const QUESTION_DEFAULTS = {
  randomization: {         // question-level randomization controls
    mode: "none",          // 'none' | 'shuffle'
    seed: null             // optional reproducibility
  },
  conditions: {           // display conditions
    mode: "none",         // 'none' | 'show_if' | 'hide_if'
    rules: []             // array of condition rules
  },
  repeated_measures: {
    enabled: false,
    source_qid: null,        // which question provides the count
    max_instances: 24,       // safety limit
    template: {              // template for each instance
      fields: []             // array of field definitions
    }
  }
};

function migrateQuestionModel(q){
  if (!q || typeof q !== "object") return q;

  // Ensure options exist and carry new flags
  if (Array.isArray(q.options)) {
    q.options = q.options.map((o, i) => ({
      // ensure basic shape
      code:  o?.code  ?? String(i + 1),
      label: o?.label ?? String(o?.text ?? o?.value ?? ""),
      // apply new defaults, then overlay existing props (so old data wins)
      ...OPTION_DEFAULTS,
      ...o
    }));
  }

  // Add/merge question-level randomization
  q.randomization = { ...QUESTION_DEFAULTS.randomization, ...(q.randomization || {}) };
  
  // Add/merge conditions
  q.conditions = { ...QUESTION_DEFAULTS.conditions, ...(q.conditions || {}) };

  // Add/merge repeated measures
  q.repeated_measures = { ...QUESTION_DEFAULTS.repeated_measures, ...(q.repeated_measures || {}) };

  return q;
}

function migrateProjectModel(){
  state.questions = (state.questions || []).map(migrateQuestionModel);
}

migrateProjectModel();

function refreshSidebarProjects(){
  const sel = document.getElementById('sdProjectSel');
  if (!sel) return;

  const list = getProjects(); // reads localStorage
  if (!list.length){
    sel.innerHTML = '<option value="">No projects</option>';
    sel.disabled = true;
    return;
  }

  sel.disabled = false;
  sel.innerHTML = list.map(p =>
    `<option value="${p.id}" ${p.id === state.project?.id ? 'selected' : ''}>
       ${escapeHTML(p.name || 'Untitled')}
     </option>`
  ).join('');

  sel.onchange = (e)=> openProjectById(e.target.value);
}

/************* ROUTER (robust) *************/
const routes = new Map();

function mount(viewEl, html){
  viewEl.innerHTML = html;
  // activate any [data-action] buttons here if needed later
}

function highlightNav(){
  const r = normalizeHash(location.hash);
  // Top-level sidebar nav
  document.querySelectorAll('#sideDrawer .sd-link[data-route]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.route === r);
  });
}

// bind clicks on nav buttons
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => { location.hash = btn.dataset.route; });
});

// go live
window.addEventListener('hashchange', renderRoute);
window.addEventListener('DOMContentLoaded', renderRoute);

/************* UTIL *************/
function setStatus(msg, ok){ const el = $("#status"); el.innerHTML = msg? `<span class="${ok?'ok':''}">${msg}</span>`: ""; }
function escapeHTML(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'}[m])); }
function goto(hash){ location.hash = hash; }
function getCoreBanner() {
  const g = state.globals;
  if (!g.banners?.length) g.banners = [{ id:"BNR_CORE", label:"Core Demo & Cohorts", mode:"concat", dimensions:[] }];
  return g.banners[0];
}
function findQuestionById(qid){ return state.questions.find(q => (q.id||"").toUpperCase() === (qid||"").toUpperCase()); }

// ===== Hamburger toggle & sidebar links =====
(function(){
  const body = document.body;
  const toggleBtn = document.getElementById('sidebar-toggle'); // existing button in header
  const drawer    = document.getElementById('sideDrawer');
  const handle    = document.getElementById('sdHandle');
  const backdrop  = document.getElementById('sidebarBackdrop');

  function openSidebar(){ body.classList.add('sidebar-open'); }
  function closeSidebar(){ body.classList.remove('sidebar-open'); }
  function toggleSidebar(){ body.classList.toggle('sidebar-open'); }

  toggleBtn?.addEventListener('click', (e)=>{ e.preventDefault(); toggleSidebar(); });
  handle?.addEventListener('click', (e)=>{ e.preventDefault(); drawer.classList.toggle('pinned'); openSidebar(); });
  backdrop?.addEventListener('click', closeSidebar);

  // Delegate clicks inside the drawer
  drawer?.addEventListener('click', (e) => {
    const btn = e.target.closest('.sd-link');
    if (!btn) return;

    const gotoHash = btn.getAttribute('data-goto');
    const route    = btn.getAttribute('data-route');

    if (gotoHash) { location.hash = gotoHash; }
    if (route)    { location.hash = route; }

    // close after navigating (unless pinned)
    if (!drawer.classList.contains('pinned')) closeSidebar();
  });

  // Extend your existing highlight function so it marks the sidebar too
  const _origHighlight = typeof highlightNav === 'function' ? highlightNav : null;
  window.highlightNav = function(){
    const r = location.hash || '#/dashboard';
    // Keep old behavior for any top-nav buttons left in DOM
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.route === r);
    });
    // Sidebar active state
    document.querySelectorAll('.sd-link.pv-tab[data-route]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.route === r);
    });
  };

  // Run once on load
  highlightNav();
})();

// ===== PHASE 1: Tab Plan data model & nets core =====

// Ensure the per-question Tab bucket exists
function ensureTabBucket(q){
  if (!q) return null;
  if (!q.tab || typeof q.tab !== 'object'){
    q.tab = { nets: [], instructions: "" };
  }else{
    q.tab.nets = Array.isArray(q.tab.nets) ? q.tab.nets : [];
    q.tab.instructions = typeof q.tab.instructions === "string" ? q.tab.instructions : "";
  }
  return q.tab;
}

// Quick type helpers (used by UI later)
function isNumericQuestion(q){ return String(q?.type||"").toLowerCase().startsWith("numeric"); }
function isCodesQuestion(q){
  // single/multi/list/table/likert/open-ends → anything with options/cols/scale labels
  if (Array.isArray(q?.options) && q.options.length) return true;
  if (Array.isArray(q?.grid?.cols) && q.grid.cols.length) return true;
  if (Array.isArray(q?.scale?.labels) && q.scale.labels.length) return true;
  return false;
}

// Constructors (normalized)
function createCodesNet({ label=null, codes=[] }){
  const uniq = Array.from(new Set((codes||[]).map(c => String(c))));
  return { kind: "codes", label: label ? String(label) : null, codes: uniq };
}
function createRangeNet({ min, max }){
  const mn = Number(min), mx = Number(max);
  return { kind: "range", min: mn, max: mx };
}

// Keep all nets valid & current against the live question definition
function syncNetsWithQuestion(q){
  const tab = ensureTabBucket(q);
  if (!tab) return null;

  // For codes-nets, drop codes that no longer exist; for ranges, coerce & validate.
  tab.nets = (tab.nets||[]).map(net => {
    if (net?.kind === "codes"){
      const labelOf = (code)=>getOptionLabel(q.id, code);  // already in your file
      const kept = (net.codes||[]).map(String).filter(c => !!labelOf(c));
      if (!kept.length) return null;
      return { kind:"codes", label: (net.label||null), codes: Array.from(new Set(kept)) };
    }
    if (net?.kind === "range") {
        // First, check for the new structure created by the modal
        if (net.operator) {
            const v1 = Number(net.value1);
            // The first value must always be a valid number
            if (!Number.isFinite(v1)) {
                return null;
            }
            // If it's a range ('-'), the second value must also be valid
            if (net.operator === '-') {
                const v2 = Number(net.value2);
                if (!Number.isFinite(v2) || v1 > v2) {
                    return null; // A range requires a valid v2, and v1 must be <= v2
                }
            }
            return net; // The net is valid, so we keep it
        }

        // Fallback for the old structure (min/max)
        const mn = Number(net.min), mx = Number(net.max);
        if (Number.isFinite(mn) && Number.isFinite(mx) && mn <= mx) {
            return { kind: "range", min: mn, max: mx };
        }
        
        return null; // The net is invalid in any format
    }
    return null; // unknown kinds are dropped
  }).filter(Boolean);

  return tab;
}

// Handy global: sync every question at once (use before painting UI or exporting)
function syncAllNets(){
  (state.questions||[]).forEach(syncNetsWithQuestion);
}

function closeProject() {
  ui_state.active_project_id = null;
  // Clear project-specific state if needed
  state.project = {};
  state.questions = [];
  location.hash = '#/projects';
}

// (Optional) Safe constructors exposed for later UI
window.QTab = { ensureTabBucket, createCodesNet, createRangeNet, syncNetsWithQuestion, syncAllNets };

/* ===== CONDITION MANAGEMENT FUNCTIONS ===== */

function updateConditionMode(questionIndex, mode) {
  const q = state.questions[questionIndex];
  if (!q) return;
  
  q.conditions = q.conditions || {};
  q.conditions.mode = mode;
  
  if (mode === 'none') {
    q.conditions.rules = [];
  }
  
  queueAutosave();
  renderEditorPanel();
}

function addConditionRule(questionIndex) {
  const q = state.questions[questionIndex];
  if (!q) return;
  
  q.conditions = q.conditions || { mode: 'show_if', rules: [] };
  q.conditions.rules = q.conditions.rules || [];
  
  q.conditions.rules.push({
    qid: '',
    operator: 'equals',
    values: ['']
  });
  
  queueAutosave();
  renderConditionRules(questionIndex);
}

function removeConditionRule(questionIndex, ruleIndex) {
  const q = state.questions[questionIndex];
  if (!q?.conditions?.rules) return;
  
  q.conditions.rules.splice(ruleIndex, 1);
  queueAutosave();
  renderConditionRules(questionIndex);
}

function updateConditionRule(questionIndex, ruleIndex, field, value) {
  const q = state.questions[questionIndex];
  if (!q?.conditions?.rules?.[ruleIndex]) return;
  
  if (field === 'values') {
    // Handle multiple values (comma-separated)
    q.conditions.rules[ruleIndex][field] = value.split(',').map(v => v.trim()).filter(Boolean);
  } else {
    q.conditions.rules[ruleIndex][field] = value;
  }
  
  if (field === 'qid') {
    // Reset values when question changes
    q.conditions.rules[ruleIndex].values = [''];
  }
  
  queueAutosave();
  renderConditionRules(questionIndex);
}

function renderConditionRules(questionIndex) {
  const container = document.getElementById(`conditionRulesList-${questionIndex}`);
  if (!container) return;
  
  const q = state.questions[questionIndex];
  const rules = q.conditions?.rules || [];
  const targetQuestions = getConditionTargetQuestions(questionIndex);
  
  if (rules.length === 0) {
    container.innerHTML = '<div class="muted">No rules defined. Click "Add Rule" to create conditions.</div>';
    return;
  }
  
  container.innerHTML = rules.map((rule, ruleIndex) => {
    const targetQOptions = targetQuestions.map(tq => 
      `<option value="${tq.id}" ${rule.qid === tq.id ? 'selected' : ''}>${tq.id} - ${escapeHTML(tq.text.substring(0, 40))}...</option>`
    ).join('');
    
    const availableValues = rule.qid ? getQuestionValuesForConditions(rule.qid) : [];
    const valueOptions = availableValues.map(v => 
      `<option value="${v.code}">${escapeHTML(v.label)}</option>`
    ).join('');
    
    return `
      <div class="stack" style="gap: 8px; padding: 12px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 8px;">
        <div class="stack" style="flex-wrap: wrap; gap: 8px;">
          <select onchange="updateConditionRule(${questionIndex}, ${ruleIndex}, 'qid', this.value)" style="min-width: 200px;">
            <option value="">Select Question...</option>
            ${targetQOptions}
          </select>
          
          <select onchange="updateConditionRule(${questionIndex}, ${ruleIndex}, 'operator', this.value)" style="min-width: 120px;">
            <option value="equals" ${rule.operator === 'equals' ? 'selected' : ''}>Equals</option>
            <option value="not_equals" ${rule.operator === 'not_equals' ? 'selected' : ''}>Not Equals</option>
            <option value="contains" ${rule.operator === 'contains' ? 'selected' : ''}>Contains</option>
            <option value="greater_than" ${rule.operator === 'greater_than' ? 'selected' : ''}>Greater Than</option>
            <option value="less_than" ${rule.operator === 'less_than' ? 'selected' : ''}>Less Than</option>
          </select>
          
          ${availableValues.length > 0 ? `
            <select onchange="updateConditionRule(${questionIndex}, ${ruleIndex}, 'values', this.value)" style="min-width: 150px;">
              <option value="">Select Value...</option>
              ${valueOptions}
            </select>
          ` : `
            <input type="text" placeholder="Enter values (comma-separated)" 
                   value="${(rule.values || []).join(', ')}"
                   onchange="updateConditionRule(${questionIndex}, ${ruleIndex}, 'values', this.value)"
                   style="min-width: 200px;" />
          `}
          
          <button class="btn danger" onclick="removeConditionRule(${questionIndex}, ${ruleIndex})">Remove</button>
        </div>
        
        <div class="muted" style="font-size: 12px;">
          ${rule.qid && rule.values?.length ? 
            `Preview: ${rule.qid} ${rule.operator.replace('_', ' ')} ${rule.values.join(', ')}` : 
            'Configure rule above'}
        </div>
      </div>
    `;
  }).join('');
}

/* =========================
   PHASE 2: TEXT PIPING CORE
   ========================= */

/** 
 * responses shape we expect at runtime:
 * {
 *   [qid]: {
 *     value: number|string|array,   // numeric answer (for sums) or string
 *     code?: string,                // chosen code for single-select
 *     codes?: string[],             // chosen codes for multi-select
 *   }
 * }
 * 
 * NOTE: For :label, we will try to map chosen code(s) to labels via getOptionLabel().
 */

/* --- Tiny value accessors --- */
function getResponsePrimitive(qid, responses){
  const r = responses?.[qid];
  if (r == null) return null;

  // Prefer numeric if present, else string. For lists, return count as number.
  if (typeof r.value === "number") return r.value;
  if (Array.isArray(r.value)) return r.value.length; // a sane default for sums
  if (typeof r.value === "string" && r.value.trim() !== "") return r.value;

  // If it's a codes payload, return count as default numeric primitive
  if (Array.isArray(r?.codes)) return r.codes.length;
  return null;
}

function getResponseLabelText(qid, responses){
  const r = responses?.[qid];
  if (!r) return null;

  // Single-select: prefer r.code, else try value if it looks like a code
  if (r.code) {
    const lbl = getOptionLabel(qid, r.code);
    if (lbl) return lbl;
  }
  // Multi-select: join labels of r.codes
  if (Array.isArray(r.codes) && r.codes.length){
    const parts = r.codes.map(c => getOptionLabel(qid, c)).filter(Boolean);
    if (parts.length) return parts.join(", ");
  }

  // Fallback: if primitive is a string, use it
  if (typeof r.value === "string" && r.value.trim() !== "") return r.value;

  return null;
}

/* --- Expression evaluators (no eval, focused on the spec) --- */
function parseNumericTerm(term, responses){
  term = String(term).trim();
  // number literal?
  if (/^[+-]?\d+(\.\d+)?$/.test(term)) return Number(term);

  // bare QID?
  const v = getResponsePrimitive(term, responses);
  return (v == null || isNaN(Number(v))) ? null : Number(v);
}

// supports A+B, A-B, A*B, A/B with A/B terms = QIDs or numbers
function evaluateSimpleMath(expr, responses){
  const m = String(expr).trim().match(/^(.+?)([+\-*/])(.+)$/);
  if (!m) return null;
  const left  = parseNumericTerm(m[1], responses);
  const op    = m[2];
  const right = parseNumericTerm(m[3], responses);
  if (left == null || right == null) return null;
  switch(op){
    case '+': return left + right;
    case '-': return left - right;
    case '*': return left * right;
    case '/': return right === 0 ? null : (left / right);
  }
  return null;
}

// condition supports: >, <, >=, <=, ==, != with QIDs, numbers, or quoted strings
function evaluateCondition(cond, responses){
  const m = String(cond).trim().match(/^(.*?)(==|!=|>=|<=|>|<)(.*)$/);
  if (!m) return null;
  const lhsRaw = m[1].trim(), op = m[2], rhsRaw = m[3].trim();

  const parseComparable = (raw) => {
    // quoted string?
    const sm = raw.match(/^"(.*)"$/) || raw.match(/^'(.*)'$/);
    if (sm) return { type: "str", val: sm[1] };

    // number?
    if (/^[+-]?\d+(\.\d+)?$/.test(raw)) return { type: "num", val: Number(raw) };

    // else treat as QID → try primitive first; if string, use as string
    const prim = getResponsePrimitive(raw, responses);
    if (prim != null && !Number.isNaN(Number(prim))) return { type: "num", val: Number(prim) };

    const lbl = getResponseLabelText(raw, responses);
    if (lbl != null) return { type: "str", val: String(lbl) };

    // last resort: raw as string
    return { type: "str", val: raw };
  };

  const L = parseComparable(lhsRaw);
  const R = parseComparable(rhsRaw);
  if (!L || !R) return null;

  const cmp = () => {
    if (L.type === "num" && R.type === "num"){
      switch(op){ case '==': return L.val === R.val;
                  case '!=': return L.val !== R.val;
                  case '>':  return L.val >  R.val;
                  case '<':  return L.val <  R.val;
                  case '>=': return L.val >= R.val;
                  case '<=': return L.val <= R.val; }
    } else {
      // string compare for non-numerics
      switch(op){ case '==': return String(L.val) === String(R.val);
                  case '!=': return String(L.val) !== String(R.val);
                  case '>':  return String(L.val) >  String(R.val);
                  case '<':  return String(L.val) <  String(R.val);
                  case '>=': return String(L.val) >= String(R.val);
                  case '<=': return String(L.val) <= String(R.val); }
    }
    return null;
  };

  return cmp();
}

/**
 * parse a single {...} directive:
 *  - {QID}                → value (numeric or string)
 *  - {QID:label}          → option label(s)
 *  - {A+B} (and - * /)    → math on numeric answers
 *  - {cond ? "a":"b"}     → conditional content
 */
function resolvePipe(inner, responses){
  const raw = String(inner).trim();

  // ternary? (very simple split that ignores ?: within quotes)
  // we only support one top-level ?: per token
  // pattern: <cond> ? <a> : <b>
  const qIdx = raw.indexOf('?');
  const cIdx = raw.lastIndexOf(':');
  if (qIdx > -1 && cIdx > qIdx){
    const cond = raw.slice(0, qIdx).trim();
    const a    = raw.slice(qIdx+1, cIdx).trim();
    const b    = raw.slice(cIdx+1).trim();
    const ok = evaluateCondition(cond, responses);
    const chosen = ok ? a : b;
    // strip optional quotes around outputs
    const sm = chosen.match(/^"(.*)"$/) || chosen.match(/^'(.*)'$/);
    return sm ? sm[1] : chosen;
  }

  // {QID:label}
  const lm = raw.match(/^([A-Za-z0-9_]+)\s*:\s*label$/i);
  if (lm){
    return getResponseLabelText(lm[1], responses) ?? `[${lm[1]}:label]`;
  }

  // simple math? (A+B etc.)
  const math = evaluateSimpleMath(raw, responses);
  if (math != null) return String(math);

  // bare {QID}
  if (/^[A-Za-z0-9_]+$/.test(raw)){
    const prim = getResponsePrimitive(raw, responses);
    if (prim == null) return `[${raw}]`;
    return String(prim);
  }

  // fallback: return as-is to avoid breaking the UI
  return `{${raw}}`;
}


/* ======================================
   PIPING UI: attach to a text input area
   ====================================== */

/**
 * attachPipingUI({
 *   host: HTMLElement (container where we’ll append toolbar+preview),
 *   targetEl: HTMLTextAreaElement|HTMLInputElement (the editor field),
 *   contextQIndex: number (the index of the currently edited question),
 *   previewClass?: string (class name for the preview div)
 * })
 */
/**
 * REWRITE your attachPipingUI function with this simplified version.
 * This new version ONLY creates the "Insert Pipe" button and its popover.
 */
 function attachPipingUI({ host, targetEl, contextQIndex }){
  if (!host || !targetEl) return;

  // 1. Create ONLY the "Insert Pipe" button
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn';
  btn.textContent = 'Insert Pipe';
  btn.title = 'Insert dynamic content';
  host.appendChild(btn);

  // 2. Create the popover for the button (logic is unchanged)
  const pop = document.createElement('div');
  pop.className = 'card';
  pop.style.cssText = 'position:absolute; z-index:1001; padding:8px; display:none; max-height:240px; overflow:auto; min-width:240px;';

  function openPop(){
    pop.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'muted';
    title.style.margin = '4px 6px 8px';
    title.textContent = 'Available piping codes';
    pop.appendChild(title);

    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gap = '6px';
    
    const qs = state.questions.slice(0, Math.max(0, contextQIndex));
    if (qs.length > 0) {
        qs.forEach(q => {
            const row = document.createElement('div');
            row.className = 'stack';
            const b1 = document.createElement('button');
            b1.type = 'button'; b1.className = 'btn'; b1.textContent = `{${q.id}}`;
            b1.onclick = () => { insertAtCursor(targetEl, `{${q.id}}`); closePop(); };
            const b2 = document.createElement('button');
            b2.type = 'button'; b2.className = 'btn'; b2.textContent = `{${q.id}:label}`;
            b2.onclick = () => { insertAtCursor(targetEl, `{${q.id}:label}`); closePop(); };
            row.appendChild(b1); row.appendChild(b2);
            list.appendChild(row);
        });
    } else {
        const noQsMsg = document.createElement('div');
        noQsMsg.className = 'muted';
        noQsMsg.textContent = 'No previous questions to pipe from.';
        noQsMsg.style.padding = '8px';
        list.appendChild(noQsMsg);
    }

    pop.appendChild(list);

    document.body.appendChild(pop);
    const r = btn.getBoundingClientRect();
    pop.style.left = `${r.left}px`;
    pop.style.top  = `${r.bottom + 6}px`;
    pop.style.display = 'block';

    const onDoc = (e)=>{ if (!pop.contains(e.target) && e.target !== btn){ closePop(); } };
    const onEsc = (e)=>{ if (e.key === 'Escape') closePop(); };
    setTimeout(()=>{ document.addEventListener('mousedown', onDoc, {capture:true}); document.addEventListener('keydown', onEsc, {capture:true}); });
    pop._closers = [onDoc, onEsc];
  }
  function closePop(){
    if (pop._closers){
      document.removeEventListener('mousedown', pop._closers[0], {capture:true});
      document.removeEventListener('keydown',   pop._closers[1], {capture:true});
    }
    pop.remove();
  }
  btn.onclick = (e)=>{ e.preventDefault(); pop.isConnected ? closePop() : openPop(); };
}

// util: insert text at cursor in a textarea/input
// util: insert text at cursor in a textarea/input OR a contenteditable div
function insertAtCursor(el, text) {
    if (!el) return;

    // NEW: Handle contenteditable divs (like your new question editor)
    if (el.isContentEditable) {
        el.focus(); // Ensure the editor has focus
        // Use the browser's built-in command to insert text at the cursor
        document.execCommand('insertText', false, text);
    } 
    // OLD: Keep the original logic for standard inputs/textareas
    else {
        const [start, end] = [el.selectionStart ?? el.value.length, el.selectionEnd ?? el.value.length];
        el.value = el.value.slice(0, start) + text + el.value.slice(end);
        el.selectionStart = el.selectionEnd = start + text.length;
    }
    
    // Trigger the input event so autosave works correctly
    el.dispatchEvent(new Event('input', { bubbles: true }));
}

function ensureDimensionFromQuestion(qid) {
  const q = findQuestionById(qid);
  if (!q) return null;
  const bnr = getCoreBanner();

  // 1) normal single/multi questions
  let srcLabels = [];
  let srcCodes  = [];

  if (Array.isArray(q.options) && q.options.length) {
    srcLabels = q.options.map(o => String(o.label ?? ''));
    srcCodes  = q.options.map((o, i) => String(o.code ?? (i + 1)));
  }
  // 2) table/likert: grid columns
  else if (Array.isArray(q.grid?.cols) && q.grid.cols.length) {
    srcLabels = q.grid.cols.map(c => String(c ?? ''));
    srcCodes  = srcLabels.map((_, i) => String(i + 1));
  }
  // 3) simple likert (single/dual) with scale labels
  else if (Array.isArray(q.scale?.labels) && q.scale.labels.length) {
    srcLabels = q.scale.labels.map(l => String(l ?? ''));
    srcCodes  = srcLabels.map((_, i) => String(i + 1));
  }

  // 4) numeric questions
  else if (isNumericQuestion(q)) {
    const opts = getQuestionOptions(q); // uses q.tab.nets / nets_text if present
    if (!opts.length) return null;
    srcLabels = opts.map(o => String(o.label ?? ''));
    srcCodes  = opts.map(o => String(o.code));
  }

  // if still nothing, there’s nothing to render
  if (!srcCodes.length) return null;

  // Generate a unique dim id each time this question is added
  const instanceCount = (bnr.dimensions || []).filter(d => d?.source?.qid === q.id).length + 1;
  const dimId = `DIM_${q.id}__${Date.now()}_${instanceCount}`;

  const groups = srcCodes.map((code, i) => ({
    // Make group ids unique by namespacing with the dim id
    group_id: `${dimId}:${code}`,
    ref: { qid: q.id, opt_id: String(code) },
    label_alias: null,
    include: true,
    order: i + 1
  }));

  const dim = {
    dim_id: dimId,
    source: { type: "question", qid: q.id },
    label: q.text || q.id,
    order: (bnr.dimensions.length + 1),
    groups
  };

  bnr.dimensions.push(dim);
  queueAutosave?.();
  return dim;
}

function updateDimAlias(dim_id, alias){
  const d = getCoreBanner().dimensions.find(x => x.dim_id === dim_id);
  if (!d) return;
  if (alias == null || String(alias).trim() === '') {
    d.label = getDimDefaultLabel(d);   // ← now resolves to question text
  } else {
    d.label = String(alias);
  }
  queueAutosave?.();
}
function getDimDefaultLabel(dim){
  const qid = dim?.source?.qid;
  const q   = findQuestionById(qid);
  // fallback order: question text → QID → empty
  return (q?.text?.trim() || qid || '').trim();
}
function toggleGroupInclude(group_id, on){ const d = getCoreBanner().dimensions; for (const dim of d){ const g = dim.groups.find(x => x.group_id === group_id); if (g){ g.include = !!on; queueAutosave?.(); return; } } }
function setGroupAlias(group_id, alias){ const d = getCoreBanner().dimensions; for (const dim of d){ const g = dim.groups.find(x => x.group_id === group_id); if (g){ g.label_alias = (alias||"").trim() || null; queueAutosave?.(); return; } } }
function reorderGroups(dim_id, newOrder){ const d = getCoreBanner().dimensions.find(x => x.dim_id === dim_id); if (!d) return; d.groups = newOrder.map((gid, i) => ({...d.groups.find(g=>g.group_id===gid), order:i+1})); queueAutosave?.(); }
function reorderDimensions(newDimIds){ const b = getCoreBanner(); b.dimensions = newDimIds.map((id,i)=>({...b.dimensions.find(d=>d.dim_id===id), order:i+1})); queueAutosave?.(); }
function removeBannerColumn(dim_id, group_id){
  const b = getCoreBanner();
  const d = b.dimensions.find(x => x.dim_id === dim_id);
  if (!d) return;
  const g = d.groups.find(x => x.group_id === group_id);
  if (!g) return;
  // soft delete: hide from preview/exports but keep editable history
  g.include = false;
  queueAutosave?.();
}
/* ===== Delete banner header 1 ===== */
function removeBannerDimension(dim_id, {soft=true} = {}){
  const b = getCoreBanner();
  const idx = b.dimensions.findIndex(d => d.dim_id === dim_id);
  if (idx < 0) return;

  if (soft) {
    // keep the dimension object but hide all groups
    b.dimensions[idx].groups?.forEach(g => g.include = false);
  } else {
    // hard delete the entire dimension
    b.dimensions.splice(idx, 1);
  }
  // re-number order so future inserts look tidy
  b.dimensions.forEach((d, i) => d.order = i + 1);
  queueAutosave?.();
}
function getOptionLabel(qid, code){
  const q = findQuestionById(qid);
  if (!q) return null;

  // prefer explicit options
  const byOpt = (q.options || []).find(o => String(o.code ?? '') === String(code ?? ''));
  if (byOpt) return byOpt.label ?? null;

  // grid columns (tables / likerts)
  const idx = Number(code) - 1;
  if (Array.isArray(q.grid?.cols) && q.grid.cols[idx]) return q.grid.cols[idx];

  // fallback to scale labels (single/dual likert)
  if (Array.isArray(q.scale?.labels) && q.scale.labels[idx]) return q.scale.labels[idx];

  return null;
}

function ensureGroupCond(g){
  if (!g.cond) g.cond = { all: [], any: [] };
  if (!Array.isArray(g.cond.all)) g.cond.all = [];
  if (!Array.isArray(g.cond.any)) g.cond.any = [];
  return g.cond;
}

function dedupeCond(g){
  ensureGroupCond(g);
  const key = c => `${c.qid}::${String((c.codes||[]).sort())}`;
  const uniq = arr => {
    const seen = new Set(); const out = [];
    for (const c of arr){ const k=key(c); if(!seen.has(k)){ seen.add(k); out.push(c); } }
    return out;
  };
  g.cond.all = uniq(g.cond.all||[]);
  g.cond.any = uniq(g.cond.any||[]);
}


function hasCond(g){
  return !!(g?.cond && (g.cond.all?.length || g.cond.any?.length));
}

function condSummary(g){
  if (!hasCond(g)) return '';

  const formatClause = (c) => {
    if (c.type === 'numeric') {
      if (c.op === 'between') return `${c.qid} is ${c.op} ${c.values[0]} and ${c.values[1]}`;
      return `${c.qid} ${c.op} ${c.values[0]}`;
    }
    // Fallback for original categorical clauses
    return `${c.qid} in [${(c.codes||[]).join(',')}]`;
  };

  const allClauses = (g.cond.all || []).map(formatClause);
  const anyClauses = (g.cond.any || []).map(formatClause);

  let summary = '';
  if (allClauses.length) summary += `AND: ( ${allClauses.join(' AND ')} )`;
  if (anyClauses.length) summary += ` OR: ( ${anyClauses.join(' OR ')} )`;

  return summary.trim();
}


function parseNumericBands(q){
  const txt = q?.exports?.tab_plan?.nets_text || '';
  // Accept things like "Net: 1-5, 6-10, 11-15, 16-24"
  const bands = Array.from(txt.matchAll(/(\d+)\s*-\s*(\d+)/g))
    .map(m => ({ code: `${m[1]}-${m[2]}`, label: `${m[1]}–${m[2]}` }));
  return bands;
}

/** Get selectable options for a question, returning [{code,label}] */
function getQuestionOptions(q){
  if (!q) return [];
  if (Array.isArray(q.options) && q.options.length){
    return q.options.map((o,i)=>({ code:String(o.code ?? (i+1)), label:String(o.label ?? '') }));
  }
  if (Array.isArray(q.grid?.cols) && q.grid.cols.length){
    return q.grid.cols.map((lab,i)=>({ code:String(i+1), label:String(lab ?? '') }));
  }
  if (Array.isArray(q.scale?.labels) && q.scale.labels.length){
    return q.scale.labels.map((lab,i)=>({ code:String(i+1), label:String(lab ?? '') }));
  }

  // ✅ NEW: numeric nets from q.tab.nets (primary)
  if (isNumericQuestion(q) && Array.isArray(q.tab?.nets) && q.tab.nets.length){
    const bands = q.tab.nets
      .map(n => {
        // operator style (new editor)
        if (n.operator) {
          const v1 = Number(n.value1), v2 = Number(n.value2);
          const mk = (lab, code) => ({ code:String(code), label:String(lab) });

          switch (n.operator) {
            case '-': if (Number.isFinite(v1) && Number.isFinite(v2) && v1 <= v2)
                        return mk(n.label || `${v1}–${v2}`, `${v1}-${v2}`);
                      break;
            case 'exact': if (Number.isFinite(v1)) return mk(n.label || `${v1}`, `==${v1}`); break;
            case '+': if (Number.isFinite(v1)) return mk(n.label || `${v1}+`, `>=${v1}`); break;
            case '<': if (Number.isFinite(v1)) return mk(n.label || `<${v1}`, `<${v1}`); break;
            case '>': if (Number.isFinite(v1)) return mk(n.label || `>${v1}`, `>${v1}`); break;
            case '<=': if (Number.isFinite(v1)) return mk(n.label || `≤${v1}`, `<=${v1}`); break;
            case '>=': if (Number.isFinite(v1)) return mk(n.label || `≥${v1}`, `>=${v1}`); break;
          }
          return null;
        }
        // legacy range {min,max}
        if (Number.isFinite(n.min) && Number.isFinite(n.max) && n.min <= n.max){
          return { code: `${n.min}-${n.max}`, label: n.label || `${n.min}–${n.max}` };
        }
        return null;
      })
      .filter(Boolean);
    if (bands.length) return bands;
  }

  // Fallback: parse from exports.tab_plan.nets_text (existing behavior)
  if ((q.type||'').startsWith('numeric')) {
    const bands = parseNumericBands(q);  // e.g. ["1-5","6-10",...]
    if (bands.length) return bands;      // already returns {code,label}
  }

  return [];
}

// Returns the options array in the correct display order for preview/runtime,
// based on per-question randomization settings.
function randomizedOptions(q){
  const opts = Array.isArray(q?.options) ? q.options.slice() : [];
  const mode = q?.randomization?.mode || 'none';
  if (mode !== 'shuffle' || opts.length < 2) return opts;

  // --- Fisher–Yates (stable) ---
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

/* ===== Sync banner with questions ===== */
function syncBannerWithQuestions({prune=true, addNew=false} = {}) {
  const b = getCoreBanner();
  const dims = b.dimensions || [];
  for (const d of dims) {
    if (!d?.source?.qid) continue;
    const q = findQuestionById(d.source.qid);
    if (!q) {
      // question gone → drop whole dimension
      if (prune) b.dimensions = dims.filter(x => x !== d);
      continue;
    }
    const liveCodes = new Set(getQuestionOptions(q).map(o => String(o.code ?? '')));
    // remove groups whose option no longer exists
    d.groups = (d.groups||[]).filter(g => liveCodes.has(String(g.ref?.opt_id ?? '')));
    // optionally add any newly added options as visible columns
    if (addNew) {
      for (const opt of (q.options||[])) {
        const code = String(opt.code ?? '');
        if (!d.groups.find(g => String(g.ref?.opt_id ?? '') === code)) {
          d.groups.push({
            group_id: `${q.id}:${code}`,
            ref: { qid: q.id, opt_id: code },
            label_alias: null,
            include: true,
            order: (d.groups.length + 1)
          });
        }
      }
    }
    // re-order numbers
    d.groups.forEach((g,i)=> g.order = i+1);
  }
  // tidy dimension order
  b.dimensions?.forEach((d,i)=> d.order = i+1);
}

// ==========================================================
// Banner Cell Menu Helpers (Global Scope)
// ==========================================================
let _openMenuEl = null;

function closeCellMenu() {
  if (_openMenuEl) {
    _openMenuEl.remove();
    _openMenuEl = null;
  }
  document.removeEventListener('pointerdown', onAway, true);
}

function onAway(e) {
  if (_openMenuEl && !e.composedPath().includes(_openMenuEl)) {
    closeCellMenu();
  }
}

function openCellMenu(anchor, dimId, groupId) {
  // Close any existing menu first
  try { closeCellMenu?.(); } catch {}

  const grid = document.getElementById('pvBannerGrid');
  if (!grid) return;

  // Resolve a robust anchor: prefer the .pv-menu button for positioning
  const btn = (anchor && anchor.closest) 
    ? anchor.closest('.pv-menu') 
    : null;
  if (!btn) return;

  // Build the menu
  const menu = document.createElement('div');
  menu.className = 'pv-cell-menu';
  menu.innerHTML = `
    <button class="mitem" data-act="edit-text">Edit text</button>
    <button class="mitem" data-act="duplicate">Duplicate column</button>
    <div class="subhead">Add condition</div>
    <button class="mitem" data-act="add-and">ADD criteria (AND)</button>
    <button class="mitem" data-act="add-or">OR criteria</button>
    <button class="mitem" data-act="edit-eqn">Create/Edit equation</button>
    <button class="mitem" data-act="delete">Delete</button>
  `;
  document.body.appendChild(menu);
  window._openMenuEl = menu; // keep your global if you rely on it elsewhere

  // Position (assumes .pv-cell-menu is position: fixed)
  const r = btn.getBoundingClientRect();
  const pad = 8;
  // Measure after attach so offsetWidth is valid
  const mw = menu.offsetWidth || 220;
  let left = Math.max(pad, r.left);
  left = Math.min(window.innerWidth - pad - mw, left);
  const top = r.bottom + 6;

  menu.style.left = left + 'px';
  menu.style.top  = top + 'px';

  // Helper: close and clean up the listener
  const safeClose = () => {
    document.removeEventListener('pointerdown', onAway, true);
    if (window._openMenuEl === menu) window._openMenuEl = null;
    menu.remove();
  };

  // Close when clicking away (but ignore clicks on the button or inside the menu)
  const onAway = (e) => {
    if (menu.contains(e.target) || btn.contains(e.target)) return;
    safeClose();
  };
  document.addEventListener('pointerdown', onAway, true);

  // Menu actions
  menu.addEventListener('click', (e) => {
    const item = e.target.closest('.mitem');
    if (!item) return;

    const act  = item.dataset.act;
    const host = document.getElementById('prefield-content-host');

    if (act === 'edit-text') {
      const cellEl = grid.querySelector(`.pv-banner-cell[data-g="${groupId}"] .pv-editable`);
      if (cellEl) cellEl.dispatchEvent(new Event('dblclick', { bubbles: true }));
    }

    else if (act === 'duplicate') {
      const banner = getCoreBanner();
      const dim = banner?.dimensions?.find(d => d.dim_id === dimId);
      const idx = dim?.groups?.findIndex(g => g.group_id === groupId);
      if (dim && idx > -1) {
        const original = dim.groups[idx];
        const copy = JSON.parse(JSON.stringify(original));
        // Ensure a unique id
        copy.group_id = `${groupId}_copy_${Date.now()}`;
        // Friendly label
        const baseLab = copy.label_alias || getOptionLabel(dim.source?.qid, copy.ref?.opt_id) || 'Copy';
        copy.label_alias = `${baseLab} (Copy)`;
        // Insert next to original
        dim.groups.splice(idx + 1, 0, copy);
        // Re-number order
        dim.groups.forEach((g, i) => g.order = i + 1);
        setStatus?.('Column duplicated.', true);
        renderPreviewBanner?.(host);
      }
    }

    else if (act === 'add-and') {
      openCondWizard?.('AND', dimId, groupId);
    }

    else if (act === 'add-or') {
      openCondWizard?.('OR', dimId, groupId);
    }

    else if (act === 'edit-eqn') {
      openCondEditor?.(dimId, groupId);
    }

    else if (act === 'delete') {
      const dim = getCoreBanner()?.dimensions?.find(d => d.dim_id === dimId);
      const g = dim?.groups?.find(x => x.group_id === groupId);
      if (g && confirm('Remove this banner column from the preview?')) {
        removeBannerColumn?.(dimId, groupId);
        setStatus?.('Column removed.', true);
        renderPreviewBanner?.(host);
      }
    }

    safeClose();
  });

  // Keyboard niceties
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') safeClose();
  });
  // Focus first actionable item for accessibility
  menu.querySelector('.mitem')?.focus();
}

let _toastTimer = null;
function showToast(message, actionLabel, onAction, duration=5000){
  const host = document.getElementById('toastHost');
  if (!host) return;
  host.innerHTML = `
    <div class="toast">
      <span>${message}</span>
      ${actionLabel ? `<button class="btn" id="toastAction">${actionLabel}</button>` : ``}
      <button class="btn ghost" id="toastClose">Close</button>
    </div>`;
  clearTimeout(_toastTimer);
  if (actionLabel) {
    document.getElementById('toastAction')?.addEventListener('click', ()=>{
      host.innerHTML = '';
      try { onAction && onAction(); } catch {}
    });
  }
  document.getElementById('toastClose')?.addEventListener('click', ()=> host.innerHTML = '');
  _toastTimer = setTimeout(()=> host.innerHTML = '', duration);
}

function startInlineEdit({container, initial, onCommit, onCancel}) {
  if (!container) return;

  container.classList.add('pv-editing');
  const origHTML = container.innerHTML;
  container.innerHTML = `
    <input type="text" value="${escapeHTML(initial)}" />
    <button class="pv-edit-btn">Save</button>
    <button class="pv-reset-btn">Cancel</button>
  `;
  const input = container.querySelector('input');
  const btnSave = container.querySelector('.pv-edit-btn');
  const btnCancel = container.querySelector('.pv-reset-btn');

  let committed = false, canceled = false;

  input.focus(); input.select();

  function cleanup(revert){
    container.classList.remove('pv-editing');
    if (revert) container.innerHTML = origHTML;
    document.removeEventListener('pointerdown', onDocDown, true);
  }
  function commit(){
    if (committed || canceled) return;
    committed = true;
    onCommit?.(input.value.trim());
    cleanup(false);
  }
  function cancel(){
    if (committed || canceled) return;
    canceled = true;
    onCancel?.();
    cleanup(true);
  }

  // Save/Cancel buttons
  btnSave?.addEventListener('click', commit);
  btnCancel?.addEventListener('click', cancel);

  // Keyboard: Enter=save, Esc=cancel
  input.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') cancel();
  });

  // CLICK-AWAY = SAVE
  // If the next pointerdown is outside the editing container, commit.
  function onDocDown(e){
    // Ignore clicks inside the edit UI (input / buttons)
    if (container.contains(e.target)) return;
    commit();
  }
  document.addEventListener('pointerdown', onDocDown, true);

  // Also catch simple blur (e.g., tabbing away)
  input.addEventListener('blur', () => {
    // If focus moves to Save/Cancel, don't auto-commit here; buttons will handle it.
    const to = document.activeElement;
    if (to === btnSave || to === btnCancel) return;
    // Slight defer so button click handlers can run first if applicable
    setTimeout(()=> commit(), 0);
  });
}
// clear alias (back to original name)
function resetGroupAlias(group_id){
  const dims = getCoreBanner().dimensions || [];
  for (const d of dims){
    const g = d.groups?.find(x => x.group_id === group_id);
    if (g){ g.label_alias = null; queueAutosave?.(); return; }
  }
}
function resetDimAlias(dim_id){
  const d = getCoreBanner().dimensions?.find(x => x.dim_id === dim_id);
  if (d){ d.label = d.label; /* no-op; alias is the label itself for dims */ }
}

function openAddColumnWizard(dimId /* null => add a new H1 */){
  const banner = getCoreBanner();
  const dims   = banner.dimensions || [];
  const dim    = dimId ? dims.find(d => d.dim_id === dimId) : null;
  const lockedQid = dim?.source?.qid || null; // when adding under an existing H1

  // Build question dropdown
  const qOpts = state.questions.map(q =>
    `<option value="${q.id}">${escapeHTML(q.id)} — ${escapeHTML(q.text||'')}</option>`
  ).join('');

  // Modal
  const overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.innerHTML = `
    <div class="modal-panel" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3>Add banner ${dim ? 'column' : 'category & column'}</h3>
        <button class="icon-btn" id="acClose">✕</button>
      </div>
      <div class="modal-body">
        ${dim ? `
          <div class="muted">Target category (H1): <b>${escapeHTML(dim.label || dim.source?.qid || '')}</b></div>
        ` : `
          <label>
            <span>New H1 label (optional)</span>
            <input id="acH1Label" placeholder="e.g., Custom Segment" />
          </label>
        `}

        <label style="margin-top:8px;">
          <span>Base question</span>
          ${lockedQid
            ? `<div class="muted"><b>${escapeHTML(lockedQid)}</b> (locked to this category)</div>`
            : `<select id="acQ"><option value="">Select question…</option>${qOpts}</select>`
          }
        </label>

        <div id="acOpts" class="stack" style="flex-wrap:wrap; gap:8px; margin-top:12px;"></div>

        <div id="acNumCustom" style="display:none; margin-top:12px; border-top:1px solid var(--line); padding-top:12px;">
          <div class="subhead">Custom numeric band (optional)</div>
          <div class="stack" style="gap:8px; align-items:center;">
            <select id="acNumOp" style="width:150px;">
              <option value="between">is between</option>
              <option value="==">is equal to</option>
              <option value=">=">&ge; (greater or equal)</option>
              <option value="<=">&le; (less or equal)</option>
              <option value=">">&gt; (greater than)</option>
              <option value="<">&lt; (less than)</option>
            </select>
            <input type="number" id="acNumV1" placeholder="Value 1" style="width:120px;" />
            <span id="acNumAnd">and</span>
            <input type="number" id="acNumV2" placeholder="Value 2" style="width:120px;" />
            <input type="text" id="acNumLabel" placeholder="Band label (optional)" style="width:180px;" />
          </div>
        </div>

        <label class="stack" style="margin-top:12px; align-items:center;">
          <input type="checkbox" id="acOpenCond" checked />
          <span>Open condition builder after adding</span>
        </label>
      </div>
      <div class="modal-footer">
        <button class="btn" id="acCancel">Cancel</button>
        <button class="btn primary" id="acSave">Add</button>
      </div>
    </div>
    <div class="modal-backdrop"></div>
  `;
  document.body.appendChild(overlay);
  const close = ()=> overlay.remove();
  overlay.querySelector('#acClose').onclick = close;
  overlay.querySelector('#acCancel').onclick = close;

  const $qSel = overlay.querySelector('#acQ');
  const $opts = overlay.querySelector('#acOpts');
  const $numBox = overlay.querySelector('#acNumCustom');
  const $opSel = overlay.querySelector('#acNumOp');
  const $v1 = overlay.querySelector('#acNumV1');
  const $v2 = overlay.querySelector('#acNumV2');
  const $and = overlay.querySelector('#acNumAnd');

  function drawOptions(){
    const qid = lockedQid || ($qSel?.value || '');
    const q = findQuestionById(qid);
    if (!q) { $opts.innerHTML = `<div class="muted">Pick a question.</div>`; $numBox.style.display='none'; return; }

    // Existing option/band choices
    const opts = getQuestionOptions(q); // includes numeric nets if present
    $opts.innerHTML = opts.length
      ? opts.map(o => `
          <label class="pill">
            <input type="checkbox" class="ac-opt" value="${escapeHTML(o.code)}" />
            ${escapeHTML(o.label)} <span class="muted">(${escapeHTML(o.code)})</span>
          </label>`).join('')
      : `<div class="muted">No selectable options for this question.</div>`;

    // Numeric custom band UI
    const numeric = typeof isNumericQuestion === 'function' && isNumericQuestion(q);
    $numBox.style.display = numeric ? 'block' : 'none';
    if (numeric) {
      const setBetween = () => {
        const show2 = ($opSel.value === 'between');
        $and.style.display = show2 ? 'inline' : 'none';
        $v2.style.display  = show2 ? 'inline-block' : 'none';
      };
      $opSel.onchange = setBetween; setBetween();
    }
  }

  if ($qSel) { $qSel.onchange = drawOptions; }
  drawOptions();

  overlay.querySelector('#acSave').onclick = ()=>{
    const qid = lockedQid || ($qSel?.value || '');
    const q = findQuestionById(qid);
    if (!q) { alert('Pick a question.'); return; }

    // Which codes did they check?
    const codes = Array.from(overlay.querySelectorAll('.ac-opt:checked')).map(cb => cb.value);

    // If numeric and they filled a custom band, add it to q.tab.nets and include its code too
    if (typeof isNumericQuestion === 'function' && isNumericQuestion(q)) {
      const op = $opSel.value;
      const v1 = $v1.value.trim();
      const v2 = $v2?.value?.trim() || '';
      const lab = overlay.querySelector('#acNumLabel').value.trim();

      const needsV2 = (op === 'between');
      if (v1 !== '' && (!needsV2 || v2 !== '')) {
        // Normalize & persist band into q.tab.nets so it "stays numeric"
        q.tab ||= {}; q.tab.nets ||= [];

        let code = '';
        let netObj = { operator: '-', value1: Number(v1), value2: Number(v2), label: lab || `${v1}–${v2}` };
        if (op === 'between') {
          code = `${Number(v1)}-${Number(v2)}`;
        } else {
          const map = { '>=':'>=', '<=':'<=', '>':'>', '<':'<', '==':'exact' };
          const opKey = map[op] || 'exact';
          netObj = { operator: opKey, value1: Number(v1), value2: (opKey === 'exact' ? null : null), label: lab || (opKey==='exact' ? `${v1}` : `${op}${v1}`) };
          code = (op === '==') ? `==${Number(v1)}` : `${op}${Number(v1)}`;
        }

        q.tab.nets.push(netObj);
        // Re-sync any derived structures the rest of your code expects
        try { syncNetsWithQuestion?.(q); } catch {}
        // Make sure the new code appears in options if none were checked
        if (!codes.includes(code)) codes.push(code);
      }
    }

    if (!codes.length) { alert('Select at least one option/band or add a custom numeric band.'); return; }

    // Create or reuse the target H1
    let targetDim = dim;
    if (!targetDim) {
      const newId = `DIM_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
      const label = (overlay.querySelector('#acH1Label')?.value.trim() || qid || 'Custom');
      targetDim = {
        dim_id: newId,
        label,                 // inline editable later
        source: { qid },       // keep tied to the question (safe with sync)
        groups: [],
        order: (dims.length + 1)
      };
      banner.dimensions.push(targetDim);
    }

    // Insert groups
    const baseOrder = targetDim.groups.length;
    const addedGroupIds = [];
    codes.forEach((code, idx) => {
      const gid = `${targetDim.dim_id}:${String(code)}:${Math.random().toString(36).slice(2,6)}`;
      const group = {
        group_id: gid,
        ref: { qid, opt_id: String(code) },
        label_alias: null,      // you can rename inline later
        include: true,
        order: baseOrder + idx + 1
      };
      targetDim.groups.push(group);
      addedGroupIds.push(gid);
    });

    // Save & redraw
    try { queueAutosave?.(); } catch {}
    const host = document.getElementById('prefield-content-host');
    renderPreviewBanner(host);

    // Optionally open the condition builder on the first new group
    const alsoCond = overlay.querySelector('#acOpenCond')?.checked;
    close();
    if (alsoCond && addedGroupIds.length) {
      openCondWizard('AND', targetDim.dim_id, addedGroupIds[0]);
    }
  };
}

/* ===== NEW: Tab Sheet summary panel (basic for now) ===== */
function renderPreviewTabSheet(host){
  const totalQs = state.questions.length;
  const likert = state.questions.filter(q =>
    (q.type||'').toLowerCase().startsWith('likert') ||
    (q.grid?.rows?.length && q.grid?.cols?.length)
  ).length;

  host.innerHTML = `
    <div class="card">
      <div class="card-header">
        <strong>Tab Sheet Summary</strong>
      </div>
      <div class="card-content">
        <table class="pv-table">
          <tr><th>Total questions</th><td>${totalQs}</td></tr>
          <tr><th>Matrix / Likert questions</th><td>${likert}</td></tr>
          <tr><th>Default base</th><td>${escapeHTML(state.globals?.default_base_verbiage || 'Total (qualified respondents)')}</td></tr>
        </table>
        <div class="pv-empty" style="margin-top:12px;">Final Excel headers will be built from the Banner Plan tab.</div>
      </div>
    </div>`;
}

function renderPreviewBanner(host) {
  // 1) normalize & sync
  if (typeof syncAllNets === "function") syncAllNets();
  syncBannerWithQuestions?.({ prune: true, addNew: false });

  const banner = getCoreBanner() || { dimensions: [] };
  const dims = (banner.dimensions || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));

  // utils
  const esc = (s) => String(s ?? "");
  const colTag = (idx) => { let n = idx + 1, s = ""; while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); } return s; };
  const getVisGroups = (d) => (d.groups || []).filter(g => g.include !== false).sort((a, b) => (a.order || 0) - (b.order || 0));

  // "Add category" select
  const addableQs = (state.questions || []).filter(q => (getQuestionOptions(q) || []).length > 0);
  const dd = addableQs.map(q => `<option value="${esc(q.id)}">${esc(q.id)} — ${esc(q.text || "")}</option>`).join("");

  // 2) Build layout: groups + per-H1 add are inside each H1 block; then a final H1-add column
  const layout = { colSlots: [], blockSpans: [], h1: [] }; // colSlots drives grid width
  {
    let cur = 1; // grid line pointer (1-based)
    for (const d of dims) {
      const vis = getVisGroups(d);
      if (!vis.length) continue;

      // H1 spans groups + its per-H1 "+"
      layout.h1.push({ dimId: d.dim_id, text: d.label || d.source?.qid || "", span: vis.length + 1 });

      const start = cur;
      // push group slots
      for (const g of vis) layout.colSlots.push({ type: "group", dim: d, g }), cur++;
      // per-H1 "+" slot
      layout.colSlots.push({ type: "add-per-h1", dim: d }); cur++;

      const end = cur - 1; // inclusive
      layout.blockSpans.push({ start, end, dimId: d.dim_id });
    }
    // final H1-level "+" at far right
    layout.colSlots.push({ type: "add-h1-final" });
  }
  const totalCols = layout.colSlots.length;

  // 3) A..Z letters (only increment letter for real data columns)
  let letterIdx = 0;
  const statsRowHTML = layout.colSlots.map(slot => {
    if (slot.type === "group") {
        return `<div class="pv-banner-cell">${colTag(letterIdx++)}</div>`;
    }
  }).join("");


  // 4) H1 row: each header spans its groups + its per-H1 add; then a final H1 "+" column
  const h1RowHTML =
    layout.h1.map(h => `
      <div class="pv-banner-cell pv-h1" style="grid-column: span ${h.span};" title="${esc(h.text)}">
        <span class="pv-h1-text pv-editable" data-edit-type="dim" data-dimid="${h.dimId}">${esc(h.text)}</span>
        <button class="pv-del" data-dimid="${h.dimId}" title="Remove category ‘${esc(h.text)}’">✕</button>
      </div>
    `).join("") +
    `
      <div class="pv-banner-cell pv-add-cell pv-add-h1-final" title="Add a new category (H1)">
        <button class="pv-add-btn" data-act="add-h1" aria-label="Add H1">
          <span class="pv-add-pill">＋</span>
        </button>
      </div>`;

  // 5) H2 row: groups → per-H1 "+"; final column is just an empty spacer (H1 plus lives above)
  let h2RowHTML = "";
  for (const d of dims) {
    const vis = getVisGroups(d);
    if (!vis.length) continue;

    for (const g of vis) {
      const code = g.ref?.opt_id;
      const lab  = g.label_alias || getOptionLabel(d.source?.qid, code) || (code ?? g.group_id);
      const has  = (typeof hasCond === "function") ? !!hasCond(g) : false;
      const csum = (typeof condSummary === "function") ? condSummary(g) : "";
      const showCode = code && String(code) !== String(lab);

      h2RowHTML += `
        <div class="pv-banner-cell pv-h2 ${has ? 'has-cond' : ''}"
             data-dim="${d.dim_id}" data-g="${g.group_id}" title="${esc(lab)}">
          <div class="pv-h2-inner">
            <span class="pv-editable" data-edit-type="group" data-gid="${g.group_id}">
              ${esc(lab)}${showCode ? ` <small class="muted">(${esc(String(code))})</small>` : ``}
            </span>
            <button class="pv-menu" data-gid="${g.group_id}" data-dimid="${d.dim_id}" title="More options">⋯</button>
          </div>
          <span class="pv-cond-dot" title="${esc(csum)}"></span>
        </div>
      `;
    }

    // per-H1 "+" (adds a column under THIS H1)
    h2RowHTML += `
      <div class="pv-banner-cell pv-add-cell pv-add-per-h1 pv-cell--add" title="Add column to this category">
        <button class="pv-add-pill pv-add-btn" data-act="add-col" data-dimid="${d.dim_id}" aria-label="Add column">＋</button>
      </div>
    `;
  }

  // 6) Background H1 blocks + vertical dividers (dividers now sit immediately after each block)
  const blocksHTML = layout.blockSpans.map((s, i, arr) =>
    `<div class="pv-banner-block ${i===0?'is-first':''} ${i===arr.length-1?'is-last':''}"
          style="grid-column:${s.start} / ${s.end + 1};"></div>`
  ).join("");

  // MODIFICATION: The divider is now gone.
  const dividersHTML = '';

  // 7) Paint
  host.innerHTML = `
    <section class="pv-sec">
      <h3>Banner Plan Builder</h3>
      <div class="pv-banner-controls">
        <label>+ Add category
          <select id="banAddSel" ${addableQs.length ? "" : "disabled"}>
            <option value="">Select question…</option>${dd}
          </select>
        </label>
        <button id="banAddBtn" ${addableQs.length ? "" : "disabled"}>Add</button>
      </div>

      <div class="pv-banner-wrap">
        <div class="pv-banner-grid" id="pvBannerGrid">
          ${blocksHTML}
          ${dividersHTML}
          <div class="pv-banner-h1">${h1RowHTML}</div>
          <div class="pv-banner-h2">${h2RowHTML}</div>
          <div class="pv-banner-stats">${statsRowHTML}</div>
        </div>
      </div>

      ${layout.blockSpans.length ? "" : `<div class="pv-empty" style="margin-top:10px;">No banner categories yet. Add one from a question above.</div>`}
    </section>
  `;

  // 8) Grid width
  const grid = document.getElementById("pvBannerGrid");
  if (grid) grid.style.setProperty("--pv-col-n", String(totalCols || 1));
  if (grid) {
    grid.style.gridTemplateColumns = layout.colSlots
    .map(slot =>
      (slot.type === 'group' || slot.type === 'add-h1-final')
        ? 'minmax(var(--pv-col-min,160px),1fr)'
        : 'var(--pv-col-add,72px)'
    )
    .join(' ');
  }

  // 9) top “Add” controls
  const sel = document.getElementById("banAddSel");
  const addBtn = document.getElementById("banAddBtn");
  addBtn?.addEventListener("click", () => {
    const qid = sel?.value || "";
    if (!qid) return;
    ensureDimensionFromQuestion?.(qid);
    renderPreviewBanner(host);
  });

  // 10) delegates
  grid?.addEventListener("click", (e) => {
    const delBtn  = e.target.closest(".pv-del");
    const menuBtn = e.target.closest(".pv-menu");
    const plusBtn = e.target.closest(".pv-add-btn");

    if (delBtn) {
      const dimId = delBtn.dataset?.dimid;
      if (dimId && typeof removeBannerDimension === "function") {
        removeBannerDimension(dimId, { soft: false });
        renderPreviewBanner(host);
      }
      return;
    }

    if (menuBtn) {
      const dimId   = menuBtn.dataset?.dimid;
      const groupId = menuBtn.dataset?.gid;
      if (typeof openCellMenu === "function") openCellMenu(menuBtn, dimId, groupId);
      return;
    }

    if (plusBtn) {
      const act   = plusBtn.dataset?.act;
      const dimId = plusBtn.dataset?.dimid || null;
      if (act === "add-col") {
        if (typeof openAddColumnWizard === "function") openAddColumnWizard(dimId);
      } else if (act === "add-h1") {
        if (typeof openAddColumnWizard === "function") openAddColumnWizard(null);
        else {
          document.getElementById("banAddSel")?.focus();
        }
      }
    }
  });

  // 11) inline edit (H1 & H2 labels)
  grid?.addEventListener("dblclick", (e) => {
    const editable = e.target.closest(".pv-editable");
    if (!editable) return;

    const startInlineEdit = ({ container, initial, onCommit }) => {
      if (!container || container.classList.contains("pv-editing")) return;
      container.classList.add("pv-editing");
      const orig = container.innerHTML;
      container.innerHTML = `<input class="pv-inline-input" type="text" value="${esc(initial)}" />`;
      const input = container.querySelector("input");
      input.focus(); input.select();

      const commit = () => onCommit?.(input.value.trim());
      input.addEventListener("blur", commit);
      input.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter") commit();
        if (evt.key === "Escape") { container.innerHTML = orig; container.classList.remove("pv-editing"); }
      });
    };

    const type = editable.dataset.editType;
    if (type === "group") {
      const cell = editable.closest(".pv-banner-cell");
      const dimId = cell.dataset.dim;
      const groupId = cell.dataset.g;
      const d = getCoreBanner().dimensions.find(d => d.dim_id === dimId);
      const g = d?.groups.find(x => x.group_id === groupId);
      if (!g) return;

      const code = g.ref?.opt_id;
      const current = g.label_alias || getOptionLabel(d.source?.qid, code) || "";
      startInlineEdit({
        container: editable,
        initial: current,
        onCommit: (txt) => { setGroupAlias(groupId, txt || null); renderPreviewBanner(host); }
      });
    } else if (type === "dim") {
      const dimId = editable.dataset.dimid;
      const d = getCoreBanner().dimensions.find(x => x.dim_id === dimId);
      if (!d) return;
      const current = d.label || d.source?.qid || "";
      startInlineEdit({
        container: editable,
        initial: current,
        onCommit: (txt) => { updateDimAlias(dimId, txt || null); renderPreviewBanner(host); }
      });
    }
  });
}



function openCondWizard(kind /* 'AND' | 'OR' */, dimId, groupId){
  const banner = getCoreBanner();
  const dim = banner.dimensions.find(d => d.dim_id === dimId);
  const g = dim?.groups.find(x => x.group_id === groupId);
  if (!g) return;
  ensureGroupCond(g);

  // Build question list (use anything already in the project)
  const qOpts = state.questions.map(q => `<option value="${q.id}">${escapeHTML(q.id)} — ${escapeHTML(q.text||'')}</option>`).join('');

  const overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.innerHTML = `
    <div class="modal-panel" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3>${kind === 'AND' ? 'Add AND criteria' : 'Add OR criteria'}</h3>
        <button class="icon-btn" id="cwClose">✕</button>
      </div>
      <div class="modal-body">
        <label>Pick a question
          <select id="cwQ">${qOpts}</select>
        </label>
        <div id="cwOpts" class="stack" style="flex-wrap:wrap; gap:8px; margin-top: 12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn" id="cwCancel">Cancel</button>
        <button class="btn primary" id="cwSave">Add</button>
      </div>
    </div>
    <div class="modal-backdrop"></div>`;

  function close(){ overlay.remove(); }
  overlay.querySelector('#cwClose').onclick = close;
  overlay.querySelector('#cwCancel').onclick = close;
  document.body.appendChild(overlay);

  const $q = overlay.querySelector('#cwQ');
  const $box = overlay.querySelector('#cwOpts');

  function drawOpts(){
    const q = findQuestionById($q.value);

    // ==========================================================
    // NEW: Check if the question is numeric and show a new UI
    // ==========================================================
    if (isNumericQuestion(q)) {
      $box.innerHTML = `
        <div class="stack" style="gap: 8px; align-items: center;">
          <select id="cwNumOp" style="width: 150px;">
            <option value="between">is between</option>
            <option value="==">is equal to</option>
            <option value=">=">&gt;= (greater or equal)</option>
            <option value="<=">&lt;= (less or equal)</option>
            <option value=">">&gt; (greater than)</option>
            <option value="<">&lt; (less than)</option>
          </select>
          <input type="number" id="cwNumVal1" placeholder="Value 1" style="width: 120px;" />
          <span id="cwNumAnd" style="display: inline;">and</span>
          <input type="number" id="cwNumVal2" placeholder="Value 2" style="width: 120px;" />
        </div>
      `;
      // Add a listener to hide the second input if not needed
      const opSelect = document.getElementById('cwNumOp');
      opSelect.onchange = () => {
        const showSecond = opSelect.value === 'between';
        document.getElementById('cwNumAnd').style.display = showSecond ? 'inline' : 'none';
        document.getElementById('cwNumVal2').style.display = showSecond ? 'inline-block' : 'none';
      };
      opSelect.onchange(); // Trigger once to set initial state
      return;
    }
    // ==========================================================
    // END NEW
    // ==========================================================


    const opts = getQuestionOptions(q);
    $box.innerHTML = opts.length
      ? opts.map(o => `
          <label class="pill">
            <input type="checkbox" value="${escapeHTML(o.code)}" />
            ${escapeHTML(o.label)} <span class="muted">(${escapeHTML(o.code)})</span>
          </label>`).join('')
      : `<div class="muted">This question has no selectable options.</div>`;
  }
  $q.onchange = drawOpts; drawOpts();

  overlay.querySelector('#cwSave').onclick = ()=>{
    const qid = $q.value;
    const q = findQuestionById(qid);
    let clause = null;

    // ==========================================================
    // MODIFIED: Construct the correct clause object
    // ==========================================================
    if (isNumericQuestion(q)) {
      const op = document.getElementById('cwNumOp').value;
      const val1 = document.getElementById('cwNumVal1').value;
      const val2 = document.getElementById('cwNumVal2').value;

      if (val1 === '') { alert('Please provide at least one value.'); return; }
      if (op === 'between' && val2 === '') { alert('Please provide a second value for "between".'); return; }

      const values = [Number(val1)];
      if (op === 'between') values.push(Number(val2));

      clause = { type: 'numeric', qid, op, values };

    } else {
      const codes = Array.from($box.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      if (!codes.length){ alert('Pick at least one option.'); return; }
      clause = { type: 'categorical', qid, codes };
    }
    // ==========================================================
    // END MODIFIED
    // ==========================================================

    if (!clause) return; // Should not happen

    if (kind === 'AND') g.cond.all.push(clause);
    else g.cond.any.push(clause);

    dedupeCond?.(g); // This might need updating if you want to prevent duplicate numeric conditions
    queueAutosave?.();
    renderPreviewBanner(document.getElementById('prefield-content-host'));
    setStatus('Condition added.', true);
    close();
  };
}

function openCondEditor(dimId, groupId){
  const banner = getCoreBanner();
  const dim = banner.dimensions.find(d => d.dim_id === dimId);
  const g = dim?.groups.find(x => x.group_id === groupId);
  if (!g) return;
  ensureGroupCond(g);

  function labelForClause(c){
    const q = findQuestionById(c.qid);
    const opts = getQuestionOptions(q);
    const map = new Map(opts.map(o=>[String(o.code), o.label]));
    const labs = c.codes.map(cd => `${map.get(String(cd)) ?? cd} (${cd})`);
    return `${c.qid}: ${labs.join(', ')}`;
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.innerHTML = `
    <div class="modal-panel" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3>Create/Edit equation</h3>
        <button class="icon-btn" id="eqClose">✕</button>
      </div>
      <div class="modal-body">
        <div>
          <div class="subhead">MUST match all (AND)</div>
          <div id="eqAll"></div>
        </div>
        <div>
          <div class="subhead" style="margin-top:8px;">Match any (OR)</div>
          <div id="eqAny"></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" id="eqClear">Clear all</button>
        <button class="btn primary" id="eqDone">Done</button>
      </div>
    </div>
    <div class="modal-backdrop"></div>`;

  const $all = overlay.querySelector('#eqAll');
  const $any = overlay.querySelector('#eqAny');

  function redraw(){
    $all.innerHTML = g.cond.all.length
      ? g.cond.all.map((c,i)=>`
          <div class="stack" style="justify-content:space-between; margin:6px 0;">
            <span>${escapeHTML(labelForClause(c))}</span>
            <span class="stack">
              <button class="btn" data-move="to-or" data-i="${i}">→ OR</button>
              <button class="btn" data-edit="all" data-i="${i}">✎ Edit</button>
              <button class="btn danger" data-del="all" data-i="${i}">🗑️</button>
            </span>
          </div>`).join('')
      : `<div class="muted">None</div>`;

    $any.innerHTML = g.cond.any.length
      ? g.cond.any.map((c,i)=>`
          <div class="stack" style="justify-content:space-between; margin:6px 0;">
            <span>${escapeHTML(labelForClause(c))}</span>
            <span class="stack">
              <button class="btn" data-move="to-and" data-i="${i}">
                ${(c.codes && c.codes.length > 1) ? 'Split → AND' : '→ AND'}
              </button>
              <button class="btn" data-edit="any" data-i="${i}">✎ Edit</button>
              <button class="btn danger" data-del="any" data-i="${i}">🗑️</button>
            </span>
          </div>`).join('')
      : `<div class="muted">None</div>`;
  }

  overlay.addEventListener('click', (e)=>{
    const mv = e.target.closest('[data-move]');
    const del= e.target.closest('[data-del]');
    const ed = e.target.closest('[data-edit]');
    if (mv){
      const dir = mv.dataset.move, i = +mv.dataset.i;
      if (dir === 'to-or') {
        const moved = g.cond.all.splice(i, 1)[0];
        if (!moved) return;
        const existing = g.cond.any.find(c => c.qid === moved.qid);
        if (existing) {
          const set = new Set([...(existing.codes||[]), ...(moved.codes||[])]);
          existing.codes = Array.from(set);
        } else {
          g.cond.any.push(moved);
        }
      }
      if (dir === 'to-and') {
        const moved = g.cond.any.splice(i, 1)[0];          // { qid, codes: [...] }
        if (!moved) return;
        const { qid, codes = [] } = moved;
        if (codes.length <= 1) {
          g.cond.all.push({ qid, codes: codes.slice() });
        } else {
          // split OR codes into separate AND clauses
          codes.forEach(cd => g.cond.all.push({ qid, codes: [cd] }));
        }
      }

      redraw(); queueAutosave?.(); renderPreviewBanner(document.getElementById('prefield-content-host'));
    }
    if (del){
      const which = del.dataset.del, i = +del.dataset.i;
      if (which === 'all') g.cond.all.splice(i,1);
      else g.cond.any.splice(i,1);
      redraw(); queueAutosave?.(); renderPreviewBanner(document.getElementById('prefield-content-host'));
    }
    if (ed){
      const which = ed.dataset.edit, i = +ed.dataset.i;
      if (which === 'all') openCondWizard('AND', dimId, groupId);
      else openCondWizard('OR', dimId, groupId);
    }
  });

  function openClauseEditor(slot, idx){
    const clause = g.cond[slot][idx];
    if (!clause) return;

    // Build question list (allow switching if you want; or lock it by hiding the select)
    const qOpts = state.questions.map(q => `<option value="${q.id}">${escapeHTML(q.id)} — ${escapeHTML(q.text||'')}</option>`).join('');
    const overlay = document.createElement('div');
    overlay.className = 'modal';
    overlay.innerHTML = `
      <div class="modal-panel" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Edit condition</h3>
          <button class="icon-btn" id="ceClose">✕</button>
        </div>
        <div class="modal-body">
          <label>Pick a question
            <select id="ceQ">${qOpts}</select>
          </label>
          <div id="ceOpts" class="stack" style="flex-wrap:wrap; gap:8px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn" id="ceCancel">Cancel</button>
          <button class="btn primary" id="ceSave">Save</button>
        </div>
      </div>
      <div class="modal-backdrop"></div>`;
    document.body.appendChild(overlay);

    const $q = overlay.querySelector('#ceQ');
    const $box = overlay.querySelector('#ceOpts');
    $q.value = clause.qid; // preselect current qid

    function drawOpts(){
      const q = findQuestionById($q.value);
      const opts = getQuestionOptions(q);
      const selected = new Set((clause.codes||[]).map(String));
      $box.innerHTML = opts.length
        ? opts.map(o => `
            <label class="pill">
              <input type="checkbox" value="${escapeHTML(o.code)}" ${selected.has(String(o.code))?'checked':''}/>
              ${escapeHTML(o.label)} <span class="muted">(${escapeHTML(o.code)})</span>
            </label>`).join('')
        : `<div class="muted">This question has no selectable options.</div>`;
    }
    $q.onchange = drawOpts;
    drawOpts();

    function close(){ overlay.remove(); }
    overlay.querySelector('#ceClose').onclick = close;
    overlay.querySelector('#ceCancel').onclick = close;

    overlay.querySelector('#ceSave').onclick = ()=>{
      const qid = $q.value;
      const codes = Array.from($box.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      if (!codes.length){
        // if nothing selected, remove the clause
        g.cond[slot].splice(idx,1);
      } else {
        // update/replace the clause
        g.cond[slot][idx] = { qid, codes: Array.from(new Set(codes)) };
      }
      dedupeCond?.(g);
      queueAutosave?.();
      renderPreviewBanner(document.getElementById('prefield-content-host'));
      redraw();  // refresh the editor lists
      close();
    };
  }

  overlay.querySelector('#eqClear').onclick = ()=>{
    g.cond.all = []; g.cond.any = [];
    redraw(); queueAutosave?.(); renderPreviewBanner(document.getElementById('prefield-content-host'));
  };
  overlay.querySelector('#eqDone').onclick = ()=> overlay.remove();
  overlay.querySelector('#eqClose').onclick = ()=> overlay.remove();

  document.body.appendChild(overlay);
  redraw();
}

/************* DASHBOARD *************/
// Update getProjects to fetch from Supabase instead of localStorage
async function getProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        clients (name),
        project_roles (
          role_name,
          people (name)
        ),
        project_dates (*)
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    // Transform to match your existing UI expectations
    return data.map(p => ({
      ...p,
      client: p.clients?.name || null,
      roles: (p.project_roles || []).map(pr => ({
        role: pr.role_name,
        person: pr.people?.name || ''
      })),
      important_dates: (p.project_dates || []).map(pd => ({
        id: pd.id,
        what: pd.event_name,
        when: pd.due_date,
        who: pd.people?.name || null,
        status: pd.status
      }))
    }));
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

// Update saveProjects to work with Supabase (this function becomes less relevant)
function saveProjects(list) {
  // Keep localStorage as backup, but main saving happens in autosaveNow
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
}

function getPeople() {
  try {
    // Reads the list, parses it, and sorts it alphabetically
    return JSON.parse(localStorage.getItem(PEOPLE_KEY) || '[]').sort();
  } catch {
    return [];
  }
}
function savePeople(peopleList) {
  // Use a Set to automatically remove any duplicates, then convert back to an array
  const uniquePeople = Array.from(new Set(peopleList));
  localStorage.setItem(PEOPLE_KEY, JSON.stringify(uniquePeople));
}
async function bulkUpdateStatus(ids, status) {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .in('id', ids);

    if (error) {
      console.error('Error in bulk status update:', error);
      setStatus('Failed to update projects.', false);
      return;
    }

    setStatus(`Updated ${ids.length} projects to "${status}".`, true);
  } catch (error) {
    console.error('Unexpected error in bulkUpdateStatus:', error);
    setStatus('Failed to update projects.', false);
  }
}


/** Ensure the current in-memory project is present in the Projects list + saved */
// Find this function in your script
async function touchCurrentIntoProjects() { 
  const list = await getProjects(); // <-- Add await
  const idx  = list.findIndex(p => p.id === state.project.id);

  const entry = {
    id: state.project.id,
    name: state.project.name || 'Untitled',
    client: state.project.client || '',
    version: state.project.version || '0.1.0',
    updated_at: new Date().toISOString(),
    favorite: !!(list[idx]?.favorite),
    status: state.project.status || 'Draft',
    project_type: state.project.project_type || null, 
    roles: state.project.roles || [],
    important_dates: state.project.important_dates || [], // Use an array [] as the fallback
    tags: state.project.tags || []
  };

  if (idx >= 0) list[idx] = entry;
  else list.unshift(entry);

  saveProjects(list);
  localStorage.setItem(
    `proj:${state.project.id}`,
    JSON.stringify({ project: state.project, globals: state.globals, questions: state.questions })
  );
}

/* =======================================================
   NEW DASHBOARD & PROJECT MANAGER FUNCTIONS
   ======================================================= */
/**
 * Renders a data-rich, actionable dashboard with an enhanced, user-friendly interface.
 * ENHANCEMENTS:
 * - Dynamic greeting based on the time of day.
 * - Relative and human-readable dates for deadlines (e.g., "Due Tomorrow").
 * - Improved empty-state UI for sections without content.
 * - Code is refactored into smaller helper functions for readability.
 * - Deadline items are clickable, directly linking to the project.
 */
async function renderSimpleDashboard(root) {
  // --- HELPER FUNCTIONS ---

  /**
   * Returns a greeting based on the current time of day.
   * @returns {string} 'Good morning', 'Good afternoon', or 'Good evening'.
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  /**
   * Formats a date string into a relative, human-readable format.
   * @param {string} dateString - An ISO date string (e.g., '2025-09-26').
   * @returns {string} A formatted string like 'Due Today', 'Due in 3 days', etc.
   */
  const formatDeadline = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Add 'T00:00:00' to avoid timezone issues where the date might be interpreted as the previous day.
    const deadline = new Date(dateString + 'T00:00:00');
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    if (diffDays > 1 && diffDays <= 14) return `Due in ${diffDays} days`;
    if (diffDays < 0) return `<span style="color: var(--danger);">Overdue by ${Math.abs(diffDays)} day(s)</span>`;
    return `Due ${deadline.toLocaleDateString()}`;
  };

  // --- DATA FETCHING & PROCESSING ---

  const allProjects = await getProjects();

  const stats = {
    total: allProjects.length,
    active: allProjects.filter(p => ['Active', 'Fielding'].includes(p.status)).length,
    approval: allProjects.filter(p => p.status === 'Waiting for Approval').length,
    reporting: allProjects.filter(p => p.status === 'Reporting').length,
  };

  const upcomingDeadlines = allProjects
    .flatMap(p => (p.important_dates || []).map(d => ({ ...d, projectId: p.id, projectName: p.name })))
    .filter(d => d.when && new Date(d.when) >= new Date())
    .sort((a, b) => new Date(a.when) - new Date(b.when))
    .slice(0, 5);

  const favoritedProjects = allProjects.filter(p => p.favorite)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  // --- RENDER HELPER FUNCTIONS ---

  const renderDeadlineItem = (d) => `
    <div class="deadline-item" data-open="${d.projectId}" title="Click to open project">
      <strong>${escapeHTML(d.what)}</strong>
      <div class="muted">${escapeHTML(d.projectName)} - ${formatDeadline(d.when)}</div>
    </div>
  `;

  const renderFavoriteProjectCard = (p) => `
    <div class="card" style="margin-bottom: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px;">
      <div class="stack" style="justify-content: space-between; align-items: flex-start;">
        <div>
          <strong>${escapeHTML(p.name)}</strong>
          <div class="muted" style="font-size: 12px;">v${escapeHTML(p.version || '0.1.0')}</div>
        </div>
        <button class="icon-btn project-favorite-btn" data-fav="${p.id}" title="Unfavorite">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="var(--brand-secondary)" stroke="var(--brand-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </button>
      </div>
      <div style="flex-grow: 1;">
        <div class="muted">${escapeHTML(p.client || 'No Client')}</div>
        <div><span class="pill">${escapeHTML(p.status)}</span></div>
      </div>
      <div>
        <button data-open="${p.id}" class="primary" style="width: 100%; padding: 10px;">Open Project</button>
      </div>
    </div>
  `;

  const renderEmptyState = (message, icon) => `
    <div class="empty-state">
      ${icon}
      <p class="muted">${message}</p>
    </div>
  `;
  
  // --- MAIN RENDER ---
  root.innerHTML = `
    <style>
      .stat-card { text-align: center; padding: 20px; transition: all 0.2s ease-out; }
      .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
      .stat-card .value { font-size: 2.5rem; font-weight: 600; color: var(--brand-primary); }
      .stat-card .label { font-weight: 500; color: var(--muted); }
      .deadline-item { padding: 12px 0; border-bottom: 1px solid var(--line); cursor: pointer; transition: background-color 0.2s; }
      .deadline-item:last-child { border-bottom: none; }
      .deadline-item:hover { background-color: var(--surface-3); }
      .empty-state { text-align: center; padding: 32px 20px; }
      .empty-state svg { width: 40px; height: 40px; color: var(--line); margin-bottom: 12px; }
    </style>
    <div class="workbench" style="margin-top: 24px;">
      <div style="margin-bottom: 24px;">
        <h2>${getGreeting()}!</h2>
        <p class="muted">Here's a summary of your workspace.</p>
      </div>

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px;">
        <div class="card stat-card"><div class="value">${stats.total}</div><div class="label">Total Projects</div></div>
        <div class="card stat-card"><div class="value">${stats.active}</div><div class="label">Active / In-Field</div></div>
        <div class="card stat-card"><div class="value">${stats.approval}</div><div class="label">Awaiting Approval</div></div>
        <div class="card stat-card"><div class="value">${stats.reporting}</div><div class="label">In Reporting</div></div>
      </div>

      <div class="grid" style="grid-template-columns: 1fr 1.5fr; gap: 24px; align-items: start;">
        <div class="stack" style="flex-direction: column; gap: 24px; align-items: stretch;">
          <div class="card">
            <div class="card-header"><strong>Quick Actions</strong></div>
            <div class="card-content" style="display: grid; grid-template-columns: 1fr; gap: 10px;">
              <button class="primary" style="padding: 10px;" onclick="openCreateProjectModal()">+ New Project</button>
              <button style="padding: 10px;" onclick="goto('#/projects')">📂 View All Projects</button>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><strong>Upcoming Deadlines</strong></div>
            <div class="card-content">
              ${upcomingDeadlines.length > 0 
                ? upcomingDeadlines.map(renderDeadlineItem).join('') 
                : renderEmptyState('No upcoming deadlines.', '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>')
              }
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><strong>Favorited Projects</strong></div>
          <div class="card-content">
            ${favoritedProjects.length > 0 
              ? `<div class="grid" style="grid-template-columns: 1fr;">${favoritedProjects.map(renderFavoriteProjectCard).join('')}</div>`
              : renderEmptyState("You haven't favorited any projects yet.", '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>')
            }
          </div>
        </div>
      </div>
    </div>
  `;

  // --- WIRING INTERACTIVE ELEMENTS ---
  root.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openProjectById(b.dataset.open));
  root.querySelectorAll('[data-fav]').forEach(b => b.onclick = (e) => {
    e.stopPropagation(); // Prevent card click when un-favoriting
    toggleFav(b.dataset.fav);
    renderSimpleDashboard(root);
  });
}
// Helper function to get status color dynamically
function getStatusColor(status) {
  switch(status) {
    case 'Active': return 'green';
    case 'Draft': return 'gray';
    case 'Archived': return 'red';
    case 'Waiting for Approval': return 'orange';
    default: return 'black';
  }
}

/**
 * Analyzes a project and returns an array of health issues.
 * @param {object} project The project object.
 * @returns {Array<{type: string, message: string}>} An array of issue objects.
 */
 function analyzeProjectHealth(project) {
  const issues = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  // (Your existing overdue dates check remains here)
  if (project.important_dates && project.important_dates.length > 0) {
    project.important_dates.forEach(date => {
      if (date.when && date.status !== 'Done' && new Date(date.when) < today) {
        issues.push({
          type: 'Overdue',
          message: `${date.what} was due on ${new Date(date.when).toLocaleDateString()}`
        });
      }
    });
  }

  // (Your existing missing role check remains here)
  if (!project.roles || !project.roles.some(r => r.role === 'Project Lead' && r.person)) {
    issues.push({
      type: 'Missing Info',
      message: 'Project is missing an assigned Project Lead.'
    });
  }

  // --- NEW CHECKS TO ADD ---

  // Check 3: Missing Client
  if (!project.client) {
    issues.push({
      type: 'Missing Info',
      message: 'No client has been assigned to this project.'
    });
  }

  // Check 4: Stale Project (not updated in 30 days and still active)
  const activeStatuses = ['Draft', 'Pre-Field', 'Fielding', 'Reporting', 'Waiting for Approval', 'Active'];
  if (activeStatuses.includes(project.status)) {
    const lastUpdate = new Date(project.updated_at);
    const daysSinceUpdate = (today - lastUpdate) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 30) {
      issues.push({
        type: 'Stale',
        message: `Project has not been updated in over 30 days.`
      });
    }
  }
  
  return issues;
}


/**
 * Renders the full-featured project management page with a redesigned UI.
 */
// Make the function async
async function renderProjectsManager(root) {
  if (ui_state.projects_view_mode === undefined) {
    ui_state.projects_view_mode = 'grid';
  }
  if (ui_state.projects_sort_by === undefined) {
    ui_state.projects_sort_by = 'updated_at-desc';
  }

  const allProjects = await getProjects();

  const stats = {
    total: allProjects.length,
    inField: allProjects.filter(p => p.status === 'Fielding').length,
    inReporting: allProjects.filter(p => p.status === 'Reporting').length,
    needsAttention: allProjects.filter(p => p.status === 'Waiting for Approval').length,
  };

  root.innerHTML = `
    <style>
      /* --- Styles for summary bar and control panel --- */
      .pm-summary-bar { padding: 16px; border-bottom: 1px solid var(--line); background-color: var(--surface-2); }
      .pm-stat-card { padding: 12px 16px; background-color: var(--surface-1); border: 1px solid var(--line); border-radius: var(--radius-md); text-align: center; }
      .pm-stat-card .value { font-size: 1.8rem; font-weight: 600; color: var(--accent); }
      .pm-stat-card .label { font-weight: 500; color: var(--muted); font-size: 13px; }
      .pm-control-panel { padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid var(--line); position: relative; }
      .pm-filters-bar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
      .project-card { border-left: 4px solid grey; position: relative; } /* Add relative positioning */

      .pm-filter-dropdown {
        position: absolute; top: calc(100% + 8px); left: 16px; background-color: var(--surface-1); border: 1px solid var(--line);
        border-radius: var(--radius-lg); box-shadow: var(--shadow); padding: 16px; z-index: 100; display: grid;
        grid-template-columns: 1fr 1fr; gap: 16px; width: min(600px, 90vw);
      }
      
      /* START: NEW styles for bulk actions */
      .bulk-actions-bar {
        background-color: var(--brand-accent-3); border: 1px solid var(--accent); border-radius: var(--radius-md);
        padding: 8px 12px; display: flex; align-items: center; gap: 12px;
      }
      .project-checkbox {
        position: absolute; top: 12px; left: 12px; z-index: 2;
        width: 20px; height: 20px; /* Make it easier to click */
      }
      .pv-table .project-checkbox { position: static; } /* Reset for list view */
      /* END: NEW styles */
    </style>
    <div class="workbench" style="max-width: 1600px; gap: 0; margin-top: 16px;">
      <div class="card" style="overflow: visible;">
        
        <div id="project-summary-bar" class="pm-summary-bar">
           </div>

        <div class="pm-control-panel">
          <div id="bulk-actions-bar" class="bulk-actions-bar is-hidden">
            <strong id="bulk-selected-count"></strong>
            <select id="bulk-status-select" class="form-control" style="width: auto;">
              <option value="">Change status to...</option>
              <option>Draft</option><option>Pre-Field</option><option>Fielding</option><option>Reporting</option>
              <option>Waiting for Approval</option><option>Active</option><option>Closed</option><option>Archived</option>
            </select>
            <button id="bulk-apply-btn" class="btn primary">Apply</button>
          </div>
          <div id="pm-filters-container" class="pm-filters-bar">
            <input id="dashSearch" placeholder="Search projects..." style="width:240px"/>
            <button id="toggle-filters-btn" class="btn">Filter +</button>
            <select id="project-sort-by" class="form-control" style="width: auto;">
              <option value="updated_at-desc">Sort by: Last Updated</option>
              <option value="name-asc">Sort by: Name (A-Z)</option>
              <option value="client-asc">Sort by: Client (A-Z)</option>
              <option value="created_at-desc">Sort by: Newest</option>
            </select>
          </div>
          <div class="stack" style="gap: 8px;">
            </div>
          
          <div id="filter-dropdown" class="pm-filter-dropdown is-hidden">
             </div>
        </div>
        
        <div class="card-content"><div id="projContainer"></div></div>
      </div>
    </div>
  `;
  
  // Re-populate static parts that were removed for brevity
  root.querySelector('#project-summary-bar').innerHTML = `
    <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
      <div class="pm-stat-card"><div class="value" id="stat-total">${stats.total}</div><div class="label">Total Projects</div></div>
      <div class="pm-stat-card"><div class="value" id="stat-in-field">${stats.inField}</div><div class="label">In Field</div></div>
      <div class="pm-stat-card"><div class="value" id="stat-in-reporting">${stats.inReporting}</div><div class="label">In Reporting</div></div>
      <div class="pm-stat-card"><div class="value" id="stat-needs-attention">${stats.needsAttention}</div><div class="label">Needs Attention</div></div>
    </div>`;
  root.querySelector('.stack[style="gap: 8px;"]').innerHTML = `
    <div class="btn-group">
      <button id="view-mode-grid" class="btn ${ui_state.projects_view_mode === 'grid' ? 'primary' : ''}">Grid</button>
      <button id="view-mode-list" class="btn ${ui_state.projects_view_mode === 'list' ? 'primary' : ''}">List</button>
      <button id="view-mode-kanban" class="btn ${ui_state.projects_view_mode === 'kanban' ? 'primary' : ''}">Kanban</button>
      <button id="view-mode-timeline" class="btn ${ui_state.projects_view_mode === 'timeline' ? 'primary' : ''}">Timeline</button>
      <button id="view-mode-gantt" class="btn ${ui_state.projects_view_mode === 'gantt' ? 'primary' : ''}">Gantt</button>
      <button id="view-mode-workload" class="btn ${ui_state.projects_view_mode === 'workload' ? 'primary' : ''}">Workload</button>
    </div>
    <div class="more-menu">
      <button class="btn">Collections ▾</button>
      <div class="more-menu-content">
        <button class="more-menu-item" onclick="applySmartFilter('my-projects')">My Projects</button>
        <button class="more-menu-item" onclick="applySmartFilter('due-soon')">Due This Week</button>
        <button class="more-menu-item" onclick="applySmartFilter('needs-attention')">Needs Attention</button>
        <button class="more-menu-item" onclick="applySmartFilter('active-work')">Active Work</button>
        <hr><button class="more-menu-item" onclick="saveCurrentFilter()">Save Current Filter...</button>
      </div>
    </div>
    <button class="primary" onclick="openCreateProjectModal()">+ New Project</button>`;
  root.querySelector('#filter-dropdown').innerHTML = `
      <label>Client<input id="clientFilter" list="client-list" placeholder="Type or select client..." /></label>
      <label>Status<select id="dashFilter"><option value="">All Statuses</option><option>Draft</option><option>Pre-Field</option><option>Fielding</option><option>Reporting</option><option>Waiting for Approval</option><option>Active</option><option>Closed</option><option>Archived</option></select></label>
      <label>Project Type<input id="typeFilter" list="type-list" placeholder="Type or select type..." /></label>
      <label>Person<select id="personFilter"><option value="">All People</option></select></label>
      <div style="grid-column: span 2; border-top: 1px solid var(--line); padding-top: 16px;">
        <label>Date Range (any project date)</label>
        <div class="stack" style="gap: 8px; align-items: center; margin-top: 4px;">
          <input id="dateFromFilter" type="date" class="form-control" title="From" />
          <span>to</span>
          <input id="dateToFilter" type="date" class="form-control" title="To" />
          <button id="clear-dates-btn" class="btn ghost">Clear</button>
        </div>
      </div>
      <div style="grid-column: span 2; display: flex; justify-content: flex-end; margin-top: 8px;">
        <button id="clear-all-filters-btn" class="btn danger">Clear All Filters</button>
      </div>
      <datalist id="client-list"></datalist>
      <datalist id="type-list"></datalist>`;

  const container = root.querySelector('#projContainer');
  const draw = (rows) => {
    // START: Add this new block for the workload view
    if (ui_state.projects_view_mode === 'workload') {
      drawWorkloadView(container, rows);
      return; // Stop here for workload view
    }
    if (ui_state.projects_view_mode === 'gantt') {
      drawGanttView(container, rows);
      return; // Stop here for Gantt view
    }
    if (ui_state.projects_view_mode === 'timeline') {
      drawTimelineView(container, rows);
      return; // Stop here for timeline view
    }
    if (ui_state.projects_view_mode === 'kanban') {
      drawKanbanView(container, rows);
      wireProjectActions(root); // Wire up fav buttons etc.
      return;
    }
    if (rows.length === 0) {
      container.innerHTML = `<div class="pv-empty">No projects match your search criteria.</div>`;
      return;
    }
    if (ui_state.projects_view_mode === 'list') {
        container.innerHTML = `<table class="pv-table" style="width: 100%;"><thead><tr>
          <th><input type="checkbox" id="select-all-checkbox" title="Select All"/></th>
          <th>Name</th><th>Client</th><th>Status</th><th>Last Updated</th><th>Actions</th>
        </tr></thead><tbody>${rows.map(p=>`<tr>
          <td><input type="checkbox" class="project-checkbox" data-project-id="${p.id}"/></td>
          <td><strong>${escapeHTML(p.name)}</strong><br><small class="muted">v${escapeHTML(p.version||'0.1.0')}</small></td>
          <td>${escapeHTML(p.client||'–')}</td><td><span class="pill">${escapeHTML(p.status)}</span></td>
          <td>${new Date(p.updated_at).toLocaleDateString()}</td>
          <td><div class="stack" style="gap:6px;"><button data-open="${p.id}" class="primary">Open</button><button data-edit="${p.id}" class="btn">Edit</button><button data-del="${p.id}" class="danger">Delete</button></div></td>
        </tr>`).join('')}</tbody></table>`;
    } else {
      container.className = 'grid';
      container.innerHTML = rows.map(p => {
        // ... (card rendering logic is the same, just with the checkbox added)
        const startDate = (p.important_dates || []).find(d => d.what === 'Start Date')?.when || null;
        const endDate = (p.important_dates || []).find(d => d.what === 'Due')?.when || null;
        const statusColors={'Draft':'var(--muted)','Pre-Field':'#3F6AB7','Fielding':'#F2B800','Reporting':'#16a34a','Waiting for Approval':'#f59e0b','Closed':'#C62828','Archived':'#637189','Active':'#16a34a'};
        const borderColor = statusColors[p.status] || 'grey';
        const healthIssues = analyzeProjectHealth(p);
        const healthIndicatorHTML = healthIssues.length > 0 
          ? `<span title="${escapeHTML(healthIssues.map(issue => issue.message).join('\n'))}" style="color: var(--danger); font-size: 1.2rem; margin-right: 8px;">⚠️</span>`
          : '';
        return `<div class="card project-card" style="border-left-color: ${borderColor};">
          <input type="checkbox" class="project-checkbox" data-project-id="${p.id}" title="Select Project"/>
          <div class="card-header project-card-header" style="padding-left: 40px;"><div class="project-title-group"><strong class="project-name">${escapeHTML(p.name)}</strong><span class="project-version muted">v${escapeHTML(p.version||'0.1.0')}</span></div><button class="icon-btn project-favorite-btn" data-fav="${p.id}" title="${p.favorite?'Unfavorite':'Favorite'}"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${p.favorite?'var(--brand-secondary)':'none'}" stroke="${p.favorite?'var(--brand-secondary)':'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></button></div><div class="card-content project-card-content"><div class="project-meta-item"><span>${escapeHTML(p.client||'No Client')}</span></div>${p.project_type?`<div class="project-meta-item"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg><span>${escapeHTML(p.project_type)}</span></div>`:''}
        <div class="project-meta-item"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span>${startDate?new Date(startDate).toLocaleDateString():'...'} to ${endDate?new Date(endDate).toLocaleDateString():'...'}</span></div>${(p.tags&&p.tags.length>0)?`<div class="project-tags-container">${p.tags.map(tag=>`<span class="pill">${escapeHTML(tag)}</span>`).join('')}</div>`:''}</div><div class="card-footer project-card-footer"><div class="stack"><button data-open="${p.id}" class="primary">Open</button><button data-edit="${p.id}" class="btn">Edit</button><button data-del="${p.id}" class="danger">Delete</button></div><div class="status-selector-wrapper"><select data-status-id="${p.id}" class="status-selector"><option ${p.status==='Draft'?'selected':''}>Draft</option><option ${p.status==='Pre-Field'?'selected':''}>Pre-Field</option><option ${p.status==='Fielding'?'selected':''}>Fielding</option><option ${p.status==='Reporting'?'selected':''}>Reporting</option><option ${p.status==='Waiting for Approval'?'selected':''}>Waiting for Approval</option><option ${p.status==='Active'?'selected':''}>Active</option><option ${p.status==='Closed'?'selected':''}>Closed</option><option ${p.status==='Archived'?'selected':''}>Archived</option></select></div></div></div>`;
      }).join('');
    }
    wireProjectActions(root);
    wireBulkActions(root); // <-- NEW function call
  };

  // START: NEW Kanban Functions
  function drawKanbanView(container, projects) {
    const statuses = ['Draft', 'Pre-Field', 'Fielding', 'Reporting', 'Waiting for Approval', 'Closed'];
    container.className = 'kanban-board';

    container.innerHTML = statuses.map(status => `
      <div class="kanban-column" data-status="${status}">
        <div class="kanban-column-header">${escapeHTML(status)}</div>
        <div class="kanban-cards">
          ${projects.filter(p => p.status === status).map(p => {
            // This reuses your existing project card HTML for a consistent look
            const startDate = (p.important_dates || []).find(d => d.what === 'Start Date')?.when || null;
            const endDate = (p.important_dates || []).find(d => d.what === 'Due')?.when || null;
            const statusColors={'Draft':'var(--muted)','Pre-Field':'#3F6AB7','Fielding':'#F2B800','Reporting':'#16a34a','Waiting for Approval':'#f59e0b','Closed':'#C62828','Archived':'#637189','Active':'#16a34a'};
            const borderColor = statusColors[p.status] || 'grey';
            // Important: Added draggable="true" and data-project-id to the main div
            return `<div class="card project-card" draggable="true" data-project-id="${p.id}" style="border-left-color: ${borderColor};">
              <div class="card-header project-card-header"><div class="project-title-group"><strong class="project-name">${escapeHTML(p.name)}</strong><span class="project-version muted">v${escapeHTML(p.version||'0.1.0')}</span></div><button class="icon-btn project-favorite-btn" data-fav="${p.id}" title="${p.favorite?'Unfavorite':'Favorite'}"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${p.favorite?'var(--brand-secondary)':'none'}" stroke="${p.favorite?'var(--brand-secondary)':'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></button></div><div class="card-content project-card-content"><div class="project-meta-item"><span>${escapeHTML(p.client||'No Client')}</span></div>${p.project_type?`<div class="project-meta-item"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg><span>${escapeHTML(p.project_type)}</span></div>`:''}
              <div class="project-meta-item"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span>${startDate?new Date(startDate).toLocaleDateString():'...'} to ${endDate?new Date(endDate).toLocaleDateString():'...'}</span></div></div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `).join('');

    wireKanbanDragDrop(root);
  }

  function wireKanbanDragDrop(root) {
    const cards = root.querySelectorAll('.project-card[draggable="true"]');
    const columns = root.querySelectorAll('.kanban-column');

    cards.forEach(card => {
      card.addEventListener('dragstart', () => {
        card.classList.add('is-dragging');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
      });
    });

    columns.forEach(column => {
      column.addEventListener('dragover', e => {
        e.preventDefault(); // This is necessary to allow a drop event
      });

      column.addEventListener('drop', async e => {
        e.preventDefault();
        const draggingCard = root.querySelector('.is-dragging');
        if (!draggingCard) return;

        const projectId = draggingCard.dataset.projectId;
        const newStatus = column.dataset.status;

        // Only update if the status is actually different
        if (projectId && newStatus) {
            await setStatusFor(projectId, newStatus);
            setStatus(`Project status updated to "${newStatus}".`, true);
            renderProjectsManager(document.getElementById('view-root')); // Refresh the whole view
        }
      });
    });
  }
  // END: NEW Kanban Functions

  // START: NEW Timeline Function
  function drawTimelineView(container, projects) {
    // 1. Get all dates from all projects and flatten into a single list
    const allDates = projects.flatMap(p => 
      (p.important_dates || []).map(d => ({
        ...d,
        projectId: p.id,
        projectName: p.name,
        client: p.client,
      }))
    );

    // 2. Filter out dates that are missing a 'when' value and sort chronologically
    const sortedDates = allDates
      .filter(d => d.when)
      .sort((a, b) => new Date(a.when) - new Date(b.when));

    container.className = 'timeline-view';

    if (sortedDates.length === 0) {
      container.innerHTML = `<div class="pv-empty">No projects with important dates found for this filter.</div>`;
      return;
    }
    
    // 3. Generate the HTML
    container.innerHTML = sortedDates.map(date => {
      const dateObj = new Date(date.when + 'T00:00:00'); // Prevent timezone issues
      const formattedDate = dateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      return `
        <div class="timeline-item">
          <div class="timeline-date">${formattedDate}</div>
          <div class="timeline-card" style="border-left-color: ${getStatusColor(date.status) || 'var(--accent)'};">
            <div class="timeline-card-title">${escapeHTML(date.what)}</div>
            <div class="timeline-card-meta">
              <strong>${escapeHTML(date.projectName)}</strong> • ${escapeHTML(date.client || 'No Client')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  // END: NEW Timeline Function
  // START: NEW Gantt Chart Function
  function drawGanttView(container, projects) {
    // 1. Find the earliest and latest dates for each project to determine its duration.
    const projectsWithDuration = projects.map(p => {
      const validDates = (p.important_dates || [])
        .filter(d => d.when) // Keep only dates that have a 'when' value
        .sort((a, b) => new Date(a.when) - new Date(b.when)); // Sort them chronologically

      // A project needs at least two valid dates to have a duration.
      if (validDates.length < 2) {
        return { ...p, gantt_start: null, gantt_end: null };
      }

      return {
        ...p,
        gantt_start: new Date(validDates[0].when), // Earliest date is the start
        gantt_end: new Date(validDates[validDates.length - 1].when) // Latest date is the end
      };
    }).filter(p => p.gantt_start && p.gantt_end); // Keep only projects with a valid duration.

    if (projectsWithDuration.length === 0) {
      container.innerHTML = `<div class="pv-empty" style="padding: 24px;">No projects with both a start and end date found.</div>`;
      return;
    }

    // 2. Determine the overall date range of all filtered projects
    let minDate = projectsWithDuration[0].gantt_start;
    let maxDate = projectsWithDuration[0].gantt_end;

    projectsWithDuration.forEach(p => {
      if (p.gantt_start < minDate) minDate = p.gantt_start;
      if (p.gantt_end > maxDate) maxDate = p.gantt_end;
    });

    const chartStartDate = new Date(minDate.getFullYear(), 0, 1); // Start of the earliest year
    const chartEndDate = new Date(maxDate.getFullYear(), 11, 31); // End of the latest year
    const totalDays = (chartEndDate - chartStartDate) / (1000 * 60 * 60 * 24);

    // 3. Generate Month Headers
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthHeadersHTML = months.map(m => `<div class="gantt-month-marker">${m}</div>`).join('');
    
    // 4. Generate the HTML for each project row
    const rowsHTML = projectsWithDuration.map(p => {
      const startDate = p.gantt_start;
      const endDate = p.gantt_end;

      // Calculate position and width as a percentage
      const startOffset = ((startDate - chartStartDate) / (1000 * 60 * 60 * 24) / totalDays) * 100;
      const duration = Math.max(0, ((endDate - startDate) / (1000 * 60 * 60 * 24) / totalDays) * 100);

      return `
        <div class="gantt-row">
          <div class="gantt-label-cell" title="${escapeHTML(p.name)}">${escapeHTML(p.name)}</div>
          <div class="gantt-timeline-cell">
            <div 
              class="gantt-bar" 
              style="left: ${startOffset}%; width: ${duration}%;" 
              title="${escapeHTML(p.name)}: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}"
              onclick="openProjectById('${p.id}')">
              ${escapeHTML(p.name)}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // 5. Assemble and render the final chart
    container.className = 'gantt-chart-container';
    container.innerHTML = `
      <div class="gantt-row gantt-header">
        <div class="gantt-label-cell">Project</div>
        <div class="gantt-timeline-cell">${monthHeadersHTML}</div>
      </div>
      ${rowsHTML}
    `;
  }
  // END: NEW Gantt Chart Function

  // START: NEW Workload View Function
  function drawWorkloadView(container, projects) {
    // 1. Get a unique, sorted list of all people from all project roles.
    const allPeople = [...new Set(
      projects.flatMap(p => (p.roles || []).map(r => r.person).filter(Boolean))
    )].sort();

    container.className = 'workload-view';

    if (allPeople.length === 0) {
      container.innerHTML = `<div class="pv-empty" style="grid-column: 1 / -1;">No people have been assigned to roles in any projects.</div>`;
      return;
    }

    // 2. Create a swimlane for each person.
    container.innerHTML = allPeople.map(person => {
      // 3. Find all projects this person is assigned to.
      const personProjects = projects.filter(p =>
        (p.roles || []).some(r => r.person === person)
      );

      return `
        <div class="workload-person-lane">
          <div class="workload-person-header">
            <h3>${escapeHTML(person)}</h3>
            <span class="pill">${personProjects.length} Project(s)</span>
          </div>
          <div class="workload-cards-container">
            ${personProjects.length > 0 ? personProjects.map(p => {
              // Find the specific role(s) this person has on this project.
              const rolesOnProject = (p.roles || [])
                .filter(r => r.person === person)
                .map(r => r.role)
                .join(', ');
              
              return `
                <div class="workload-card" onclick="openProjectById('${p.id}')">
                  <div class="workload-card-title">${escapeHTML(p.name)}</div>
                  <div class="workload-card-meta">
                    <span class="tag">${escapeHTML(rolesOnProject)}</span>
                    <span class="pill">${escapeHTML(p.status)}</span>
                  </div>
                </div>
              `;
            }).join('') : '<div class="muted" style="padding: 12px;">No active projects.</div>'}
          </div>
        </div>
      `;
    }).join('');
  }
  // END: NEW Workload View Function
  
  // The rest of the filter/sort/draw logic is unchanged...
  const filterAndDrawProjects = () => {
    // This entire function remains the same as the last version...
    const query = root.querySelector('#dashSearch').value.toLowerCase();
    const statusFilter = root.querySelector('#dashFilter').value;
    const clientFilter = root.querySelector('#clientFilter').value;
    const typeFilter = root.querySelector('#typeFilter').value;
    const personFilter = root.querySelector('#personFilter').value;
    const dateFrom = root.querySelector('#dateFromFilter').value;
    const dateTo = root.querySelector('#dateToFilter').value;
    const fromDate = dateFrom ? new Date(dateFrom + 'T00:00:00') : null;
    const toDate = dateTo ? new Date(dateTo + 'T00:00:00') : null;
    let filteredRows = allProjects.filter(p => {
      const matchesSearch = !query || p.name.toLowerCase().includes(query) || (p.client || '').toLowerCase().includes(query) || (p.notes || '').toLowerCase().includes(query);
      const matchesStatus = !statusFilter || p.status === statusFilter;
      const matchesClient = !clientFilter || p.client === clientFilter;
      const matchesType = !typeFilter || p.project_type === typeFilter;
      const matchesPerson = !personFilter || (p.roles && p.roles.some(role => role.person === personFilter));
      const matchesDate = (() => {
        if (!fromDate && !toDate) return true;
        if (!p.important_dates || p.important_dates.length === 0) return false;
        return p.important_dates.some(d => {
            if (!d.when) return false;
            const projectDate = new Date(d.when + 'T00:00:00');
            if (fromDate && toDate) return projectDate >= fromDate && projectDate <= toDate;
            if (fromDate) return projectDate >= fromDate;
            if (toDate) return projectDate <= toDate;
            return false;
        });
      })();
      return matchesSearch && matchesStatus && matchesClient && matchesType && matchesPerson && matchesDate;
    });
    const [sortKey, sortDir] = ui_state.projects_sort_by.split('-');
    filteredRows.sort((a, b) => {
      let valA, valB;
      if (sortKey === 'updated_at' || sortKey === 'created_at') {
        valA = new Date(a[sortKey]);
        valB = new Date(b[sortKey]);
      } else { valA = (a[sortKey] || '').toLowerCase(); valB = (b[sortKey] || '').toLowerCase(); }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    if (ui_state.smart_filter === 'due-soon') { /* ... unchanged ... */ }
    const filteredStats = { total: filteredRows.length, inField: filteredRows.filter(p => p.status === 'Fielding').length, inReporting: filteredRows.filter(p => p.status === 'Reporting').length, needsAttention: filteredRows.filter(p => p.status === 'Waiting for Approval').length, };
    document.getElementById('stat-total').textContent = filteredStats.total; document.getElementById('stat-in-field').textContent = filteredStats.inField; document.getElementById('stat-in-reporting').textContent = filteredStats.inReporting; document.getElementById('stat-needs-attention').textContent = filteredStats.needsAttention;
    draw(filteredRows);
  };
  
  // All the event listeners remain the same...
  // Attach all event listeners
  root.querySelector('#dashSearch').oninput = filterAndDrawProjects; root.querySelector('#dashFilter').onchange = filterAndDrawProjects; root.querySelector('#clientFilter').oninput = filterAndDrawProjects; root.querySelector('#typeFilter').oninput = filterAndDrawProjects; root.querySelector('#personFilter').onchange = filterAndDrawProjects; root.querySelector('#dateFromFilter').onchange = filterAndDrawProjects; root.querySelector('#dateToFilter').onchange = filterAndDrawProjects; root.querySelector('#clear-dates-btn').onclick = () => { root.querySelector('#dateFromFilter').value = ''; root.querySelector('#dateToFilter').value = ''; filterAndDrawProjects(); };
  root.querySelector('#project-sort-by').onchange = (e) => { ui_state.projects_sort_by = e.target.value; filterAndDrawProjects(); };
  root.querySelector('#clear-all-filters-btn').onclick = () => { root.querySelector('#dashSearch').value = ''; root.querySelector('#dashFilter').value = ''; root.querySelector('#clientFilter').value = ''; root.querySelector('#typeFilter').value = ''; root.querySelector('#personFilter').value = ''; root.querySelector('#dateFromFilter').value = ''; root.querySelector('#dateToFilter').value = ''; filterAndDrawProjects(); };
  root.querySelector('#view-mode-grid').onclick = () => { ui_state.projects_view_mode = 'grid'; renderProjectsManager(root); }; root.querySelector('#view-mode-list').onclick = () => { ui_state.projects_view_mode = 'list'; renderProjectsManager(root); }; root.querySelector('#view-mode-kanban').onclick = () => { ui_state.projects_view_mode = 'kanban'; renderProjectsManager(root); }; root.querySelector('#view-mode-timeline').onclick = () => { ui_state.projects_view_mode = 'timeline'; renderProjectsManager(root); }; root.querySelector('#view-mode-gantt').onclick = () => { ui_state.projects_view_mode = 'gantt'; renderProjectsManager(root); }; root.querySelector('#view-mode-workload').onclick = () => { ui_state.projects_view_mode = 'workload'; renderProjectsManager(root); }; // <-- ADD THIS LINE
  const filterBtn = root.querySelector('#toggle-filters-btn'); const filterDropdown = root.querySelector('#filter-dropdown'); if (filterBtn && filterDropdown) { filterBtn.onclick = (e) => { e.stopPropagation(); filterDropdown.classList.toggle('is-hidden'); }; document.addEventListener('click', function closeFilter(e) { if (!filterDropdown.classList.contains('is-hidden') && !filterDropdown.contains(e.target) && e.target !== filterBtn) { filterDropdown.classList.add('is-hidden'); document.removeEventListener('click', closeFilter); } }); }
  
  // START: NEW LOGIC FOR BULK ACTIONS
  function wireBulkActions(root) {
    const bulkBar = root.querySelector('#bulk-actions-bar');
    const filtersContainer = root.querySelector('#pm-filters-container');
    const selectedCountSpan = root.querySelector('#bulk-selected-count');
    const applyBtn = root.querySelector('#bulk-apply-btn');
    const statusSelect = root.querySelector('#bulk-status-select');
    const selectAllCheckbox = root.querySelector('#select-all-checkbox');
    const individualCheckboxes = root.querySelectorAll('.project-checkbox');

    function updateBulkUI() {
      const selected = root.querySelectorAll('.project-checkbox:checked');
      if (selected.length > 0) {
        bulkBar.classList.remove('is-hidden');
        filtersContainer.classList.add('is-hidden');
        selectedCountSpan.textContent = `${selected.length} selected`;
      } else {
        bulkBar.classList.add('is-hidden');
        filtersContainer.classList.remove('is-hidden');
      }
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = selected.length === individualCheckboxes.length;
        selectAllCheckbox.indeterminate = selected.length > 0 && selected.length < individualCheckboxes.length;
      }
    }

    if (selectAllCheckbox) {
      selectAllCheckbox.onchange = (e) => {
        individualCheckboxes.forEach(cb => cb.checked = e.target.checked);
        updateBulkUI();
      };
    }

    individualCheckboxes.forEach(cb => cb.onchange = updateBulkUI);

    applyBtn.onclick = async () => {
      const newStatus = statusSelect.value;
      const selectedIds = Array.from(root.querySelectorAll('.project-checkbox:checked')).map(cb => cb.dataset.projectId);

      if (!newStatus || selectedIds.length === 0) {
        alert("Please select a status and at least one project.");
        return;
      }
      
      await bulkUpdateStatus(selectedIds, newStatus);
      setStatus(`Updated ${selectedIds.length} projects to "${newStatus}".`, true);
      renderProjectsManager(root); // Refresh the view
    };
  }
  // END: NEW LOGIC FOR BULK ACTIONS

  // Initial setup
  populateFilterDropdowns(allProjects);
  root.querySelector('#project-sort-by').value = ui_state.projects_sort_by;
  filterAndDrawProjects();
}

function filterByStatus(status) {
  const filter = document.querySelector('#dashFilter');
  filter.value = status;
  renderProjectsManager(document.querySelector('#root')); // Re-render with filtered status
}

/**
 * Renders the main clients list page, showing all unique clients and their project counts.
 */
async function renderClientsListPage(root) {
  const allProjects = await getProjects();

  // Aggregate projects by client
  const clientsMap = allProjects.reduce((acc, p) => {
    if (!p.client) return acc;
    if (!acc[p.client]) {
      acc[p.client] = { name: p.client, projectCount: 0, lastActivity: new Date(0) };
    }
    acc[p.client].projectCount++;
    const updatedAt = new Date(p.updated_at);
    if (updatedAt > acc[p.client].lastActivity) {
      acc[p.client].lastActivity = updatedAt;
    }
    return acc;
  }, {});

  const clients = Object.values(clientsMap).sort((a, b) => b.lastActivity - a.lastActivity);

  root.innerHTML = `
    <style>
      .client-card {
        padding: 20px;
        text-decoration: none;
        color: var(--fg);
        display: block;
        transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
      }
      .client-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow);
      }
      .client-card strong { font-size: 1.2rem; }
    </style>
    <div class="workbench" style="margin-top: 24px;">
      <div style="margin-bottom: 24px;">
        <h2>Clients</h2>
        <p class="muted">A directory of all clients with active or archived projects.</p>
      </div>
      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
        ${clients.length > 0 ? clients.map(client => `
          <a href="#/clients/${encodeURIComponent(client.name)}" class="card client-card">
            <strong>${escapeHTML(client.name)}</strong>
            <p class="muted">${client.projectCount} Project(s)</p>
          </a>
        `).join('') : `
          <div class="pv-empty" style="grid-column: 1 / -1;">No clients found in any projects.</div>
        `}
      </div>
    </div>
  `;
}

/**
 * Renders a simple bar chart for project statuses.
 * @param {Array} projects - The list of projects for this client.
 * @returns {string} The HTML for the status chart.
 */
function renderStatusChart(projects) {
  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  
  const total = projects.length;
  if (total === 0) return '';
  
  const statusColors = {'Draft':'#9ca3af','Pre-Field':'#3b82f6','Fielding':'#f59e0b','Reporting':'#10b981','Waiting for Approval':'#eab308','Closed':'#ef4444','Archived':'#6b7280','Active':'#22c55e'};

  const bars = Object.entries(statusCounts).map(([status, count]) => {
    const percentage = (count / total * 100).toFixed(1);
    return `
      <div class="chart-bar" style="height: ${percentage}%; background-color: ${statusColors[status] || '#6b7280'};" title="${escapeHTML(status)}: ${count} (${percentage}%)"></div>
    `;
  }).join('');

  return `
    <style>
      .status-chart-container { display: flex; align-items: flex-end; height: 120px; width: 100%; gap: 2px; padding: 10px; background: var(--surface-2); border-radius: var(--radius-md); }
      .chart-bar { flex-grow: 1; transition: filter 0.2s; }
      .chart-bar:hover { filter: brightness(1.1); }
    </style>
    <div class="status-chart-container">${bars}</div>
  `;
}

/**
 * Renders the detailed profile page for a single client.
 */
async function renderClientDetailPage(root, clientName) {
  const decodedClientName = decodeURIComponent(clientName);
  const allProjects = await getProjects();
  const clientProjects = allProjects.filter(p => p.client === decodedClientName);

  // --- Calculate Stats ---
  const avgDuration = (() => {
    let total = 0, count = 0;
    clientProjects.forEach(p => {
      const start = new Date(p.created_at);
      const endEntry = p.status_history?.find(h => ['Closed', 'Archived'].includes(h.status));
      if (endEntry) {
        total += (new Date(endEntry.date) - start);
        count++;
      }
    });
    return count > 0 ? Math.round((total / count) / (1000 * 60 * 60 * 24)) : 'N/A';
  })();

  const mostCommonType = (() => {
    const types = clientProjects.map(p => p.project_type).filter(Boolean);
    if (!types.length) return 'N/A';
    const counts = types.reduce((acc, type) => (acc[type] = (acc[type] || 0) + 1, acc), {});
    return Object.entries(counts).sort((a,b) => b[1] - a[1])[0][0];
  })();

  const onTimeRate = (() => {
      const completed = clientProjects.filter(p => ['Closed', 'Archived'].includes(p.status));
      if (completed.length === 0) return 'N/A';
      let onTimeCount = 0;
      completed.forEach(p => {
          const dueDate = (p.important_dates || []).find(d => d.what === 'Due')?.when;
          const completionDate = p.status_history?.find(h => ['Closed', 'Archived'].includes(h.status))?.date;
          if (dueDate && completionDate && new Date(completionDate) <= new Date(dueDate)) {
              onTimeCount++;
          }
      });
      return `${Math.round((onTimeCount / completed.length) * 100)}%`;
  })();

  root.innerHTML = `
    <div class="workbench" style="margin-top: 24px;">
      <div style="margin-bottom: 24px;">
        <a href="#/clients" class="muted" style="text-decoration: none;">&larr; All Clients</a>
        <h2 style="margin-top: 8px;">${escapeHTML(decodedClientName)}</h2>
      </div>
      
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-content">
          <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div class="pm-stat-card"><div class="value">${clientProjects.length}</div><div class="label">Total Projects</div></div>
            <div class="pm-stat-card"><div class="value">${avgDuration}</div><div class="label">Avg. Duration (Days)</div></div>
            <div class="pm-stat-card"><div class="value">${onTimeRate}</div><div class="label">On-Time Completion</div></div>
            <div class="pm-stat-card" style="text-align: left; padding: 16px;">
              <div class="label" style="margin-bottom: 8px;">Most Common Type</div>
              <strong style="font-size: 1.2rem;">${escapeHTML(mostCommonType)}</strong>
            </div>
          </div>
          <div style="margin-top: 24px; border-top: 1px solid var(--line); padding-top: 24px;">
            <h4 class="label" style="margin-bottom: 12px; text-transform: uppercase; font-size: 0.8rem;">Projects by Status</h4>
            ${renderStatusChart(clientProjects)}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><strong>All Projects for ${escapeHTML(decodedClientName)}</strong></div>
        <div class="card-content" style="padding: 0;">
          <table class="pv-table" style="width: 100%;">
            <thead><tr><th>Name</th><th>Status</th><th>Last Updated</th><th></th></tr></thead>
            <tbody>
              ${clientProjects.map(p => `
                <tr>
                  <td><strong>${escapeHTML(p.name)}</strong></td>
                  <td><span class="pill">${escapeHTML(p.status)}</span></td>
                  <td>${new Date(p.updated_at).toLocaleDateString()}</td>
                  <td><button class="btn primary" onclick="openProjectById('${p.id}')">Open</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}


/**
 * Renders the company-wide Analytics Dashboard with key metrics and charts.
 */
 async function renderAnalyticsDashboard(root) {
  const allProjects = await getProjects();

  // --- 1. Calculate High-Level KPIs ---

  const totalProjects = allProjects.length;

  const avgDuration = (() => {
    let total = 0, count = 0;
    allProjects.forEach(p => {
      const start = new Date(p.created_at);
      const endEntry = p.status_history?.find(h => ['Closed', 'Archived'].includes(h.status));
      if (endEntry) {
        total += (new Date(endEntry.date) - start);
        count++;
      }
    });
    return count > 0 ? Math.round((total / count) / (1000 * 60 * 60 * 24)) : 'N/A';
  })();

  const onTimeRate = (() => {
    const completed = allProjects.filter(p => ['Closed', 'Archived'].includes(p.status));
    if (completed.length === 0) return 'N/A';
    let onTimeCount = 0;
    completed.forEach(p => {
      const dueDate = (p.important_dates || []).find(d => d.what === 'Due')?.when;
      const completionDate = p.status_history?.find(h => ['Closed', 'Archived'].includes(h.status))?.date;
      if (dueDate && completionDate && new Date(completionDate) <= new Date(dueDate)) {
        onTimeCount++;
      }
    });
    return `${Math.round((onTimeCount / completed.length) * 100)}%`;
  })();

  // --- 2. Aggregate Data for "Projects Started Per Month" Chart ---
  const projectsByMonth = allProjects.reduce((acc, p) => {
    const monthKey = new Date(p.created_at).toISOString().slice(0, 7); // Format as "YYYY-MM"
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {});
  
  // Create a sorted list of the last 12 months for the chart
  const last12Months = [];
  let today = new Date();
  for (let i = 0; i < 12; i++) {
    const monthKey = today.toISOString().slice(0, 7);
    last12Months.unshift({
      key: monthKey,
      label: today.toLocaleString('default', { month: 'short', year: '2-digit' }),
      count: projectsByMonth[monthKey] || 0
    });
    today.setMonth(today.getMonth() - 1);
  }

  const maxCount = Math.max(1, ...last12Months.map(m => m.count)); // Use 1 to avoid division by zero

  // --- 3. Render the Dashboard HTML ---
  root.innerHTML = `
    <style>
      .analytics-chart-container { display: flex; height: 250px; gap: 16px; }
      .y-axis { display: flex; flex-direction: column; justify-content: space-between; text-align: right; color: var(--muted); font-size: 12px; flex-shrink: 0; }
      .chart-area { display: grid; grid-template-columns: repeat(12, 1fr); gap: 8px; width: 100%; border-left: 1px solid var(--line); padding-left: 8px; }
      .chart-bar-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; }
      .chart-bar { width: 75%; background-color: var(--brand-accent-2); border-radius: 4px 4px 0 0; transition: height 0.3s ease-out; }
      .chart-bar:hover { filter: brightness(1.1); }
      .chart-label { font-size: 12px; color: var(--muted); margin-top: 4px; }
    </style>
    <div class="workbench" style="margin-top: 24px;">
      <div style="margin-bottom: 24px;">
        <h2>Analytics Dashboard</h2>
        <p class="muted">A high-level overview of all project activity and trends.</p>
      </div>

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="pm-stat-card"><div class="value">${totalProjects}</div><div class="label">Total Projects</div></div>
        <div class="pm-stat-card"><div class="value">${avgDuration}</div><div class="label">Avg. Duration (Days)</div></div>
        <div class="pm-stat-card"><div class="value">${onTimeRate}</div><div class="label">On-Time Completion</div></div>
      </div>

      <div class="card">
        <div class="card-header"><strong>Projects Started Per Month (Last 12 Months)</strong></div>
        <div class="card-content">
          <div class="analytics-chart-container">
            <div class="y-axis">
              <span>${maxCount}</span>
              <span>${Math.round(maxCount / 2)}</span>
              <span>0</span>
            </div>
            <div class="chart-area">
              ${last12Months.map(month => `
                <div class="chart-bar-wrapper">
                  <div class="chart-bar" style="height: ${(month.count / maxCount) * 100}%;" title="${month.label}: ${month.count} project(s)"></div>
                  <div class="chart-label">${month.label}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ----- Project helpers ----- */
/**
 * REWRITTEN OPEN PROJECT FUNCTION
 * Fetches data from all related tables and reconstructs the nested
 * JavaScript state object that the UI expects.
 */
async function openProjectById(id) {
  try {
    // Fetch the complete project with all related data
    const { data: projectData, error } = await supabase
      .from('projects')
      .select(`
        *,
        clients (id, name),
        project_roles (
          role_name,
          people (id, name)
        ),
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
      console.error("Error fetching project:", error);
      setStatus(`Project not found: ${error.message}`, false);
      return;
    }

    // Reconstruct the state object to match your existing structure
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
      
      // Reconstruct client as string (your UI expects this)
      client: projectData.clients?.name || null,
      
      // Reconstruct roles array
      roles: (projectData.project_roles || []).map(pr => ({
        role: pr.role_name,
        person: pr.people?.name || ''
      })),
      
      // Reconstruct important_dates array
      important_dates: (projectData.project_dates || []).map(pd => ({
        id: pd.id,
        what: pd.event_name,
        when: pd.due_date,
        who: pd.people?.name || null,
        status: pd.status
      }))
    };

    // Set globals from project_globals
    const globals = projectData.project_globals?.[0] || {};
    state.globals = {
      default_base_verbiage: globals.default_base_verbiage || "Total (qualified respondents)",
      default_base_definition: globals.default_base_definition || "",
      scale_buckets: globals.scale_buckets || {},
      rules: globals.rules || {},
      banners: globals.banners || []
    };

    // Reconstruct questions with options and other related data
    state.questions = (projectData.questions || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map(q => {
        // Reconstruct options
        const options = (q.question_options || [])
          .sort((a, b) => a.order_index - b.order_index)
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
            input_type: opt.input_type || 'number'
          }));

        // Reconstruct statements
        const statements = (q.question_statements || [])
          .sort((a, b) => a.order_index - b.order_index)
          .map(stmt => stmt.statement_text);

        // Reconstruct nets
        const nets = (q.question_nets || []).map(net => {
          if (net.net_type === 'codes') {
            return {
              kind: 'codes',
              label: net.net_label,
              codes: net.net_config.codes || []
            };
          } else if (net.net_type === 'range') {
            return {
              kind: 'range',
              label: net.net_label,
              operator: net.net_config.operator || '-',
              value1: net.net_config.value1,
              value2: net.net_config.value2,
              min: net.net_config.min, // for backward compatibility
              max: net.net_config.max  // for backward compatibility
            };
          }
          return net;
        });

        return {
          id: q.question_id, // Map back to your expected field name
          text: q.question_text,
          type: q.question_type,
          mode: q.question_mode,
          notes: q.notes,
          is_required: q.is_required,
          
          // Unpack JSONB fields
          base: q.base || {},
          randomization: q.randomization || {},
          conditions: q.conditions || {},
          validation: q.validation || {},
          repeated_measures: q.repeated_measures || {},
          
          numeric: q.numeric_config || {},
          open: q.open_config || {},
          scale: q.scale_config || {},
          grid: q.grid_config || {},
          exports: q.exports || {},
          tab: q.tab_plan || { nets: nets },
          
          // Attach reconstructed arrays
          options: options,
          statements: statements
        };
      });

    // Update UI state
    ui_state.active_project_id = id;
    ui_state.active_question_index = state.questions.length > 0 ? 0 : null;
    
    // Navigate to project overview
    location.hash = '#/project/overview';
    setStatus("Project loaded from database.", true);
    
  } catch (error) {
    console.error("Failed to load project:", error);
    setStatus(`Failed to load project: ${error.message}`, false);
  }
  console.log('Loaded questions from DB:', state.questions);
  console.log('Question IDs:', state.questions.map(q => q.id));
}
function duplicateProjectById(id) {
  const stash = JSON.parse(localStorage.getItem(`proj:${id}`) || 'null');
  if (!stash) return;

  const copy = JSON.parse(JSON.stringify(stash));
  copy.project.id = uuid_generate_v4(); // Use the correct UUID generator
  copy.project.name = (copy.project.name || 'Project') + ' (Copy)';
  localStorage.setItem(`proj:${copy.project.id}`, JSON.stringify(copy));

  const list = getProjects();
  list.unshift({
    id: copy.project.id,
    name: copy.project.name,
    client: copy.project.client,
    version: copy.project.version,
    updated_at: new Date().toISOString(),
    favorite: false,
    status: 'Draft'
  });
  saveProjects(list);
  renderRoute();
}

function exportProjectById(id) {
  const stash = JSON.parse(localStorage.getItem(`proj:${id}`) || 'null');
  if (!stash) return;
  const data = JSON.stringify(stash, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(stash.project.name || 'project').replace(/[^\w\-]+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function toggleFav(id) {
  try {
    // Get current favorite status
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('favorite')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching project to favorite:', fetchError);
      setStatus('Could not update favorite status.', false);
      return;
    }

    // Toggle the status
    const newFavoriteStatus = !project.favorite;

    // Update in database
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        favorite: newFavoriteStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating favorite status:', updateError);
      setStatus('Could not update favorite status.', false);
      return;
    }
    
    setStatus(`Project ${newFavoriteStatus ? 'added to' : 'removed from'} favorites.`, true);
    
    // Refresh the current view
    renderRoute();
  } catch (error) {
    console.error('Unexpected error in toggleFav:', error);
    setStatus('Could not update favorite status.', false);
  }
}


async function setStatusFor(id, status) {
  try {
    // Fetch current project for history
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching project to update status:', fetchError);
      setStatus('Could not update project status.', false);
      return;
    }
    
    // Update status
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating project status:', updateError);
      setStatus('Could not update project status.', false);
      return;
    }

    // Add to status history (optional, depending on your needs)
    try {
      const { error: historyError } = await supabase
        .from('project_status_history')
        .insert({
          project_id: id,
          old_status: project.status,
          new_status: status,
          notes: `Status changed from ${project.status} to ${status}`
        });
      
      if (historyError) {
        console.warn('Could not save status history:', historyError);
      }
    } catch (historyError) {
      console.warn('Status history update failed:', historyError);
    }
    
    setStatus(`Project status updated to "${status}".`, true);
  } catch (error) {
    console.error('Unexpected error in setStatusFor:', error);
    setStatus('Could not update project status.', false);
  }
}


function openAndGen(id, which) {
  openProjectById(id);
  setTimeout(() => {
    if (which === 'qre') $('#generateDocx').click();
    else $('#generateXlsx').click();
  }, 150);
}


/**
 * Helper function to attach event listeners to project actions.
 * Centralizes the logic for handling open, delete, favorite, and status changes.
 */
// Make the function async
async function wireProjectActions(root) { // <-- Add async
    root.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openProjectById(b.dataset.open));
    
    root.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openEditProjectModal(b.dataset.edit));

    root.querySelectorAll('[data-fav]').forEach(b => b.onclick = () => {
        toggleFav(b.dataset.fav);
        renderProjectsManager(root);
    });

    root.querySelectorAll('[data-status]').forEach(sel => sel.onchange = () => {
        setStatusFor(sel.dataset.status, sel.value);
    });

    root.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      const id = b.dataset.del;
      const projects = await getProjects();
      const projName = projects.find(p => p.id === id)?.name || 'this project';
      
      if (confirm(`Are you sure you want to permanently delete "${escapeHTML(projName)}"? This cannot be undone.`)) {
        try {
          setStatus('Deleting project...', true);

          // --- NEW SUPABASE DELETE LOGIC ---
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

          if (error) {
            // Throw an error to be caught by the catch block
            throw error;
          }

          setStatus('Project successfully deleted.', true);
          
          // Refresh the project manager view to show the change
          renderProjectsManager(root);

        } catch (error) {
          console.error('Delete failed:', error);
          setStatus(`Error deleting project: ${error.message}`, false);
          alert('Could not delete the project. Please check the console for details.');
        }
      }
    });
}

// Add after wireProjectActions function (around line 1830)

function populateFilterDropdowns(projects) {
  // MODIFIED: Populate Client <datalist> for the new text input combobox
  const clients = [...new Set(projects.map(p => p.client).filter(Boolean))].sort();
  const clientDatalist = document.querySelector('#client-list');
  if (clientDatalist) {
    clientDatalist.innerHTML = clients.map(client => `<option value="${escapeHTML(client)}"></option>`).join('');
  }

  // MODIFIED: Populate Type <datalist> for the new text input combobox
  const types = [...new Set(projects.map(p => p.project_type).filter(Boolean))].sort();
  const typeDatalist = document.querySelector('#type-list');
  if (typeDatalist) {
    typeDatalist.innerHTML = types.map(type => `<option value="${escapeHTML(type)}"></option>`).join('');
  }

  // UNCHANGED: This still populates the "Person" <select> dropdown normally
  const allPeople = new Set();
  projects.forEach(p => {
    if (p.roles) {
      p.roles.forEach(role => {
        if (role.person) allPeople.add(role.person);
      });
    }
  });
  const people = [...allPeople].sort();
  const personFilter = document.querySelector('#personFilter');
  if (personFilter) {
    personFilter.innerHTML = '<option value="">All People</option>' +
      people.map(person => `<option value="${escapeHTML(person)}">${escapeHTML(person)}</option>`).join('');
  }
}

async function openClientProfile(clientName) {
  const allProjects = await getProjects();
  const clientProjects = allProjects.filter(p => p.client === clientName);

  if (clientProjects.length === 0) {
    alert(`No projects found for ${clientName}.`);
    return;
  }

  // --- Calculate Stats ---
  
  // 1. Average Project Duration (Effort Estimation foundation)
  let totalDuration = 0;
  let completedProjects = 0;
  clientProjects.forEach(p => {
    const startDate = new Date(p.created_at);
    const closedDateEntry = p.status_history?.find(h => ['Closed', 'Archived'].includes(h.status));
    if (closedDateEntry) {
      const endDate = new Date(closedDateEntry.date);
      totalDuration += (endDate - startDate) / (1000 * 60 * 60 * 24); // duration in days
      completedProjects++;
    }
  });
  const avgDuration = completedProjects > 0 ? (totalDuration / completedProjects).toFixed(1) : 'N/A';

  // 2. Most Common Project Type (Client Pattern)
  const typeCounts = clientProjects.reduce((acc, p) => {
    if(p.project_type) acc[p.project_type] = (acc[p.project_type] || 0) + 1;
    return acc;
  }, {});
  const mostCommonType = Object.keys(typeCounts).length > 0 
    ? Object.entries(typeCounts).sort((a,b) => b[1] - a[1])[0][0]
    : 'N/A';

  // --- Display Modal ---
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-panel" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3>Client Profile: ${escapeHTML(clientName)}</h3>
        <button class="icon-btn" onclick="this.closest('.modal').remove()">✕</button>
      </div>
      <div class="modal-body">
        <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="card stat-card">
              <div class="value">${clientProjects.length}</div>
              <div class="label">Total Projects</div>
            </div>
            <div class="card stat-card">
              <div class="value">${avgDuration}</div>
              <div class="label">Avg. Duration (Days)</div>
            </div>
            <div class="card stat-card" style="grid-column: span 2;">
              <div class="value" style="font-size: 1.5rem;">${escapeHTML(mostCommonType)}</div>
              <div class="label">Most Common Project Type</div>
            </div>
        </div>
        <h4 style="margin-top: 24px; margin-bottom: 8px;">All Projects:</h4>
        <div style="max-height: 250px; overflow-y: auto;">
          ${clientProjects.map(p => `
            <div class="stack" style="justify-content: space-between; padding: 8px; border-bottom: 1px solid var(--line);">
              <strong>${escapeHTML(p.name)}</strong>
              <span class="pill">${escapeHTML(p.status)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn primary" onclick="this.closest('.modal').remove()">Close</button>
      </div>
    </div>
    <div class="modal-backdrop" onclick="this.closest('.modal').remove()"></div>
  `;
  document.body.appendChild(modal);
}

/**
 * Opens a modal displaying a health status report for all projects.
 * It identifies projects that are overdue, stale, or missing key information.
 * @param {Event} e - The click event, to prevent default link behavior.
 */
async function openProjectHealthModal(e) {
  e.preventDefault(); // Stop the link from navigating

  const allProjects = await getProjects();
  
  // Find projects that have at least one health issue
  const projectsWithIssues = allProjects
    .map(p => ({
      project: p,
      issues: analyzeProjectHealth(p) // Use your existing health check function
    }))
    .filter(item => item.issues.length > 0);

  // --- Display Modal ---
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-panel" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3>Project Health Status</h3>
        <button class="icon-btn" onclick="this.closest('.modal').remove()">✕</button>
      </div>
      <div class="modal-body" style="max-height: 70vh;">
        ${projectsWithIssues.length > 0 ? `
          <p>The following projects have issues that may require your attention:</p>
          ${projectsWithIssues.map(item => `
            <div class="card" style="margin-bottom: 16px;">
              <div class="card-header">
                <strong>${escapeHTML(item.project.name)}</strong>
                <button class="btn primary" style="padding: 4px 10px;" onclick="openProjectById('${item.project.id}')">View</button>
              </div>
              <div class="card-content" style="display:grid; gap: 8px;">
                ${item.issues.map(issue => `
                  <div class="stack" style="align-items: flex-start; gap: 12px; padding: 8px; background: var(--surface-2); border-radius: var(--radius-sm);">
                    <span style="color: var(--danger); font-size: 1.2rem; line-height: 1;">⚠️</span>
                    <div>
                      <strong>${escapeHTML(issue.type)}</strong>
                      <div class="muted">${escapeHTML(issue.message)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        ` : `
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h4 style="margin-top: 16px; margin-bottom: 0;">All Systems Go!</h4>
            <p class="muted">No immediate health issues detected across all projects.</p>
          </div>
        `}
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="this.closest('.modal').remove()">Close</button>
      </div>
    </div>
    <div class="modal-backdrop" onclick="this.closest('.modal').remove()"></div>
  `;
  document.body.appendChild(modal);
}

function applySmartFilter(filterType) {
  const searchInput = document.querySelector('#dashSearch');
  const statusFilter = document.querySelector('#dashFilter');
  const clientFilter = document.querySelector('#clientFilter');
  const typeFilter = document.querySelector('#typeFilter');
  const personFilter = document.querySelector('#personFilter');

  // Clear existing filters
  searchInput.value = '';
  statusFilter.value = '';
  clientFilter.value = '';
  typeFilter.value = '';
  personFilter.value = '';

  switch(filterType) {
    case 'my-projects':
      // This would need user context - for now just show active projects
      statusFilter.value = 'Active';
      break;
    case 'due-soon':
      // Filter projects with dates in next 7 days
      ui_state.smart_filter = 'due-soon';
      break;
    case 'needs-attention':
      statusFilter.value = 'Waiting for Approval';
      break;
    case 'active-work':
      statusFilter.value = 'Fielding';
      break;
  }

  filterAndDrawProjects();
}

function saveCurrentFilter() {
  const filterName = prompt('Name this filter:');
  if (!filterName) return;

  const currentFilters = {
    search: document.querySelector('#dashSearch').value,
    status: document.querySelector('#dashFilter').value,
    client: document.querySelector('#clientFilter').value,
    type: document.querySelector('#typeFilter').value,
    person: document.querySelector('#personFilter').value
  };

  // Save to localStorage
  const savedFilters = JSON.parse(localStorage.getItem('saved_project_filters') || '{}');
  savedFilters[filterName] = currentFilters;
  localStorage.setItem('saved_project_filters', JSON.stringify(savedFilters));

  alert(`Filter "${filterName}" saved!`);
}

/* ========================================================
   Modal Control + Create handler
   ======================================================== */
function openCreateProjectModal() {
  // Clear standard text fields
  const f = (id) => document.getElementById(id);
  f('cp-name').value   = '';
  f('cp-client').value = '';
  f('cp-notes').value  = '';
  f('cp-tags').value   = '';

  // Clear any existing dynamic role rows
  const rolesContainer = document.getElementById('cp-roles-container');
  if (rolesContainer) {
    rolesContainer.innerHTML = '';
  }

  const modal = document.getElementById('createProjectModal');
  if (!modal) return;

  // --- Logic for Custom Project Type ---
  const projectTypeSelect = document.getElementById('cp-project-type');
  const customTypeInput = document.getElementById('cp-project-type-custom');
  projectTypeSelect.onchange = function() {
    customTypeInput.classList.toggle('is-hidden', this.value !== '__custom__');
    if (this.value === '__custom__') {
      customTypeInput.focus();
    }
  };
  // Reset custom input state when modal opens
  projectTypeSelect.value = '';
  customTypeInput.classList.add('is-hidden');
  customTypeInput.value = '';
  
  // --- Setup for Dynamic Roles ---
  const addRoleBtn = document.getElementById('add-role-btn');
  addRoleBtn.onclick = function(e) {
    e.preventDefault();
    const container = document.getElementById('cp-roles-container');
    const roleRow = document.createElement('div');
    roleRow.className = 'stack role-row';

    const people = getPeople();
    const peopleOptions = people.map(person => `<option value="${escapeHTML(person)}">${escapeHTML(person)}</option>`).join('');

    roleRow.innerHTML = `
      <select class="role-input" style="flex: 1;">
        <option value="Project Lead">Project Lead</option>
        <option value="Project Manager" selected>Project Manager</option>
        <option value="Project Director">Project Director</option>
        <option value="Communications">Communications</option>
        <option value="QC">QC</option>
      </select>
      <div class="person-selector" style="flex: 2; display: flex; gap: 8px;">
        <select class="person-input" style="flex: 1;">
          <option value="">Select person...</option>
          ${peopleOptions}
          <option value="__new__">-- Add New Person --</option>
        </select>
        <input type="text" class="new-person-input is-hidden" placeholder="New Person's Name" style="flex: 1;" />
      </div>
      <button type="button" class="danger remove-role-btn">✕</button>
    `;
    container.appendChild(roleRow);

    const personSelect = roleRow.querySelector('.person-input');
    const newPersonInput = roleRow.querySelector('.new-person-input');
    personSelect.onchange = function() {
      newPersonInput.classList.toggle('is-hidden', this.value !== '__new__');
    };
  };

  // --- Setup for Dynamic Dates ---
  const datesContainer = document.getElementById('cp-dates-container');
  datesContainer.innerHTML = ''; // Clear any previous date rows
  document.getElementById('add-date-btn').onclick = function() {
      addDateRow(datesContainer);
  };

  document.querySelector('header')?.classList.add('content-blur');
  document.getElementById('view-root')?.classList.add('content-blur');

  populateTemplateDropdown();

  // Show the modal and focus the first field
  modal.classList.remove('is-hidden');
  f('cp-name').focus();
}

/** Called by the footer button in the modal for both Create and Edit */
async function createProjectFromModal() {
  const templateId = document.getElementById('cp-template')?.value;
  if (templateId) {
    createProjectFromTemplate(templateId);
    closeCreateProjectModal();
    return;
  }
  
  const modal = document.getElementById('createProjectModal');
  const editingProjectId = modal.dataset.editingProjectId;

  try {
    // Read form data (your existing form reading logic)
    const name = (document.getElementById('cp-name')?.value || '').trim();
    const client = (document.getElementById('cp-client')?.value || '').trim();
    const notes = (document.getElementById('cp-notes')?.value || '').trim();
    const status = (document.getElementById('cp-status')?.value || 'Draft');
    
    const projectTypeSelect = document.getElementById('cp-project-type');
    let projectTypeName = '';
    if (projectTypeSelect.value === '__custom__') {
      projectTypeName = (document.getElementById('cp-project-type-custom')?.value || '').trim();
    } else {
      projectTypeName = (projectTypeSelect?.value || '').trim();
    }

    // Read dates and roles (your existing logic)
    const important_dates = [];
    document.querySelectorAll('#cp-dates-container .date-row').forEach(row => {
      const whatSelect = row.querySelector('.date-what-select');
      let whatValue = whatSelect.value;
      if (whatValue === '__custom__') {
        whatValue = row.querySelector('.date-what-custom').value.trim();
      }
      
      const existingId = row.dataset.dateId;
      const dateId = existingId || uuid_generate_v4();

      const dateEntry = {
        id: dateId,
        what: whatValue,
        when: row.querySelector('.date-when-input').value || null,
        who: row.querySelector('.date-who-select').value || null,
        status: row.querySelector('.date-status-select').value || 'Not Started'
      };
      if (dateEntry.what && dateEntry.when) {
        important_dates.push(dateEntry);
      }
    });

    const tagsInput = (document.getElementById('cp-tags')?.value || '').trim();
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    const roles = [];
    const existingPeople = getPeople(); 
    const peopleToAdd = []; 
    document.querySelectorAll('#cp-roles-container .role-row').forEach(row => {
      const role = row.querySelector('.role-input').value;
      const personSelect = row.querySelector('.person-input');
      const newPersonInput = row.querySelector('.new-person-input');
      
      let person = '';
      if (personSelect.value === '__new__' && newPersonInput.value.trim() !== '') {
        person = newPersonInput.value.trim();
        if (!existingPeople.includes(person)) peopleToAdd.push(person);
      } else if (personSelect.value && personSelect.value !== '__new__') {
        person = personSelect.value;
      }
      if (role && person) roles.push({ role, person });
    });

    if (peopleToAdd.length > 0) {
      const updatedPeopleList = [...existingPeople, ...peopleToAdd];
      savePeople(updatedPeopleList);
    }

    if (editingProjectId) {
      // Update existing project
      state.project.name = name || 'Untitled';
      state.project.client = client;
      state.project.notes = notes;
      state.project.status = status;
      state.project.project_type = projectTypeName;
      state.project.important_dates = important_dates;
      state.project.tags = tags;
      state.project.roles = roles;
      state.project.updated_at = new Date().toISOString();
    } else {
      // Create new project
      state.project = {
        id: uuid_generate_v4(),
        name: name || 'Untitled',
        client: client,
        version: '0.1.0',
        status: status,
        project_type: projectTypeName,
        notes: notes,
        tags: tags,
        roles: roles,
        important_dates: important_dates,
        favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      state.questions = [];
      state.globals = {
        default_base_verbiage: "Total (qualified respondents)",
        default_base_definition: "",
        scale_buckets: {},
        rules: {},
        banners: []
      };
      
      ui_state.active_question_index = null;
      ui_state.active_project_id = state.project.id;
    }

    // Save to Supabase
    await autosaveNow();
    
    closeCreateProjectModal();
    setStatus(editingProjectId ? 'Project updated.' : 'Project created.', true);
    
    if (!editingProjectId) {
      location.hash = '#/project/overview';
    }
    
    renderRoute();
    
  } catch (error) {
    console.error('Error creating/updating project:', error);
    setStatus(`Failed to ${editingProjectId ? 'update' : 'create'} project: ${error.message}`, false);
  }
}

const TEMPLATE_KEY = "qgen_project_templates_v1";

function getProjectTemplates() {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveProjectTemplates(templates) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates));
}

function createProjectTemplate(name, description = '') {
  const templates = getProjectTemplates();
  const templateId = 'template-' + Math.random().toString(16).slice(2, 10);
  
  templates[templateId] = {
    id: templateId,
    name: name,
    description: description,
    created_at: new Date().toISOString(),
    template_data: {
      project: {
        ...state.project,
        id: null, // Templates don't have IDs
        name: `${name} Template`,
        created_at: null,
        updated_at: null
      },
      globals: { ...state.globals },
      questions: state.questions.map(q => ({ ...q }))
    }
  };
  
  saveProjectTemplates(templates);
  return templateId;
}

function createProjectFromTemplate(templateId) {
  const templates = getProjectTemplates();
  const template = templates[templateId];
  
  if (!template) return;
  
  // Create new project from template
  const newProject = {
    ...template.template_data.project,
    id: 'proj-' + Math.random().toString(16).slice(2, 10),
    name: template.name.replace(' Template', ''),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  state.project = newProject;
  state.globals = { ...template.template_data.globals };
  state.questions = template.template_data.questions.map(q => ({
    ...q,
    // Generate new IDs for questions to avoid conflicts
    id: q.id // Keep original for now, could regenerate if needed
  }));
  
  autosaveNow();
  touchCurrentIntoProjects();
  location.hash = '#/project/overview';
}

// Add these functions after the template functions above:

function populateTemplateDropdown() {
  const templates = getProjectTemplates();
  const templateSelect = document.getElementById('cp-template');
  
  if (templateSelect) {
    const options = Object.values(templates).map(template => 
      `<option value="${template.id}">${escapeHTML(template.name)}</option>`
    ).join('');
    
    templateSelect.innerHTML = '<option value="">Create blank project</option>' + options;
  }
}

function openTemplateManager() {
  const templates = getProjectTemplates();
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-panel" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3>Project Templates</h3>
        <button class="icon-btn" onclick="this.closest('.modal').remove()">✕</button>
      </div>
      <div class="modal-body">
        <div class="grid" id="templateGrid">
          ${Object.values(templates).map(template => `
            <div class="card" style="padding: 16px;">
              <strong>${escapeHTML(template.name)}</strong>
              <div class="muted" style="margin: 8px 0;">${escapeHTML(template.description || 'No description')}</div>
              <div class="muted" style="font-size: 12px;">Created ${new Date(template.created_at).toLocaleDateString()}</div>
              <div class="stack" style="margin-top: 12px; gap: 6px;">
                <button class="btn primary" onclick="useTemplate('${template.id}')">Use Template</button>
                <button class="btn danger" onclick="deleteTemplate('${template.id}')">Delete</button>
              </div>
            </div>
          `).join('') || '<div class="muted">No templates created yet.</div>'}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="this.closest('.modal').remove()">Close</button>
      </div>
    </div>
    <div class="modal-backdrop" onclick="this.closest('.modal').remove()"></div>
  `;
  
  document.body.appendChild(modal);
}

function useTemplate(templateId) {
  document.getElementById('cp-template').value = templateId;
  document.querySelector('.modal').remove();
}

function deleteTemplate(templateId) {
  if (!confirm('Delete this template?')) return;
  
  const templates = getProjectTemplates();
  delete templates[templateId];
  saveProjectTemplates(templates);
  
  // Refresh the template manager
  document.querySelector('.modal').remove();
  openTemplateManager();
}

function saveCurrentAsTemplate() {
  const name = prompt('Template name:');
  if (!name) return;
  
  const description = prompt('Template description (optional):') || '';
  createProjectTemplate(name, description);
  alert('Template saved!');
}

/** BONUS: Updated closeCreateProjectModal to reset edit state */
function closeCreateProjectModal() {
  const modal = document.getElementById('createProjectModal');
  if (modal) {
    modal.onkeydown = null;
    modal.classList.add('is-hidden');
    
    // --- NEW: Remove blur effect from background content ---
    document.querySelector('header')?.classList.remove('content-blur');
    document.getElementById('view-root')?.classList.remove('content-blur');

    // --- NEW: Clean up edit mode state for next time ---
    delete modal.dataset.editingProjectId;
    document.getElementById('cp-title').textContent = 'Create Project';
    modal.querySelector('.btn.primary').textContent = 'Create Project';
  }
}

// Change the function signature to accept data
function addDateRow(container, dateData = {}) {
  const dateRow = document.createElement('div');
  dateRow.className = 'stack date-row'; // Adds the necessary classes
  dateRow.style.cssText = 'gap: 8px; align-items: flex-end;'; // Fixes the alignment
  
  const people = getPeople();
  const peopleOptions = people.map(p => `<option value="${escapeHTML(p)}">${escapeHTML(p)}</option>`).join('');

  // --- Check if the 'what' value is a custom one ---
  const standardWhats = ["Questionnaire", "Tab Sheet", "Banners", "Reporting", "Data Processing", "QCing", "Approved By", "Due"];
  const isCustomWhat = dateData.what && !standardWhats.includes(dateData.what);

  // --- Store the existing date ID on the element itself ---
  if (dateData.id) {
    dateRow.dataset.dateId = dateData.id;
  }

  dateRow.innerHTML = `
    <label class="field" style="flex: 2;">
      <span style="font-size: 12px; color: var(--muted);">What</span>
      <select class="date-what-select">
        <option value="">Select task...</option>
        <option value="Questionnaire">Questionnaire</option>
        <option value="Tab Sheet">Tab Sheet</option>
        <option value="Banners">Banners</option>
        <option value="Reporting">Reporting</option>
        <option value="Data Processing">Data Processing</option>
        <option value="QCing">QCing</option>
        <option value="Approved By">Approved By</option>
        <option value="Due">Due</option>
        <option value="__custom__">Custom...</option>
      </select>
      <input type="text" class="date-what-custom ${isCustomWhat ? '' : 'is-hidden'}" placeholder="Custom task name" style="margin-top: 4px;" />
    </label>
    <label class="field" style="flex: 1.5;">
      <span style="font-size: 12px; color: var(--muted);">When</span>
      <input type="date" class="date-when-input" value="${dateData.when || ''}" />
    </label>
    <label class="field" style="flex: 1.5;">
      <span style="font-size: 12px; color: var(--muted);">Who</span>
      <select class="date-who-select">
        <option value="">Assign to...</option>
        ${peopleOptions}
      </select>
    </label>
    <label class="field" style="flex: 1.5;">
      <span style="font-size: 12px; color: var(--muted);">Status</span>
      <select class="date-status-select">
        <option value="Not Started">Not Started</option>
        <option value="In Progress">In Progress</option>
        <option value="Draft">Draft</option>
        <option value="Approved">Approved</option>
        <option value="Done">Done</option>
      </select>
    </label>
    <button type="button" class="danger remove-date-btn">✕</button>
  `;
  container.appendChild(dateRow);

  // --- NEW: Pre-fill the dropdowns and inputs with dateData ---
  const whatSelect = dateRow.querySelector('.date-what-select');
  const customWhatInput = dateRow.querySelector('.date-what-custom');
  if (isCustomWhat) {
    whatSelect.value = '__custom__';
    customWhatInput.value = dateData.what;
  } else {
    whatSelect.value = dateData.what || '';
  }
  
  dateRow.querySelector('.date-who-select').value = dateData.who || '';
  dateRow.querySelector('.date-status-select').value = dateData.status || 'Not Started';

  // Add logic to show the custom 'what' input
  whatSelect.onchange = function() {
    customWhatInput.classList.toggle('is-hidden', this.value !== '__custom__');
  };
}

async function openEditProjectModal(projectId) {
  // --- Step 1: Fetch the project and its related data from Supabase ---
  const { data: projectData, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (name),
      project_roles (
        role_name,
        people (name)
      ),
      project_dates (*)
    `)
    .eq('id', projectId)
    .single();

  if (error) {
    alert("Error: Could not find project data to edit. " + error.message);
    return;
  }

  // --- Step 2: Call the base modal function to set up the UI ---
  // This clears old data and sets up listeners correctly.
  openCreateProjectModal();

  // --- Step 3: Get references to all modal elements ---
  const f = (id) => document.getElementById(id);
  const modal = f('createProjectModal');
  
  // --- Step 4: Populate the fields with the fetched data ---
  modal.dataset.editingProjectId = projectId; // Store the ID for the save function
  f('cp-name').value = projectData.name || '';
  f('cp-client').value = projectData.clients?.name || '';
  f('cp-status').value = projectData.status || 'Draft';
  f('cp-notes').value = projectData.notes || '';
  f('cp-tags').value = (projectData.tags || []).join(', ');

  // Handle Project Type (standard or custom)
  const projectTypeSelect = f('cp-project-type');
  const customTypeInput = f('cp-project-type-custom');
  const standardTypes = Array.from(projectTypeSelect.options).map(opt => opt.value);
  if (standardTypes.includes(projectData.project_type)) {
    projectTypeSelect.value = projectData.project_type;
    customTypeInput.classList.add('is-hidden');
  } else if (projectData.project_type) {
    projectTypeSelect.value = '__custom__';
    customTypeInput.value = projectData.project_type;
    customTypeInput.classList.remove('is-hidden');
  }

  // Populate Roles
  const rolesContainer = f('cp-roles-container');
  rolesContainer.innerHTML = ''; // Ensure it's clear before adding
  (projectData.project_roles || []).forEach(roleData => {
    const people = getPeople();
    const peopleOptions = people.map(p => `<option value="${escapeHTML(p)}">${escapeHTML(p)}</option>`).join('');
    
    const roleRow = document.createElement('div');
    roleRow.className = 'stack role-row';
    roleRow.innerHTML = `
      <select class="role-input" style="flex: 1;"><option>Project Lead</option><option>Project Manager</option><option>Project Director</option><option>Communications</option><option>QC</option></select>
      <div class="person-selector" style="flex: 2; display: flex; gap: 8px;">
        <select class="person-input" style="flex: 1;"><option value="">Select person...</option>${peopleOptions}<option value="__new__">-- Add New Person --</option></select>
        <input type="text" class="new-person-input is-hidden" placeholder="New Person's Name" style="flex: 1;" />
      </div>
      <button type="button" class="danger remove-role-btn">✕</button>`;
    
    rolesContainer.appendChild(roleRow);
    
    roleRow.querySelector('.role-input').value = roleData.role_name;
    roleRow.querySelector('.person-input').value = roleData.people.name;
    
    const personSelect = roleRow.querySelector('.person-input');
    const newPersonInput = roleRow.querySelector('.new-person-input');
    personSelect.onchange = function() {
      newPersonInput.classList.toggle('is-hidden', this.value !== '__new__');
    };
  });

  // Populate Dates
  const datesContainer = f('cp-dates-container');
  datesContainer.innerHTML = '';
  (projectData.project_dates || []).forEach(dateData => {
    // Map DB columns to the data structure your addDateRow function expects
    const mappedDateData = {
        id: dateData.id,
        what: dateData.event_name,
        when: dateData.due_date,
        who: dateData.people?.name || null, // You may need to fetch person name if only ID is returned
        status: dateData.status
    };
    addDateRow(datesContainer, mappedDateData);
  });
  
  // --- Step 5: Update modal UI for "Edit Mode" ---
  f('cp-title').textContent = 'Edit Project';
  modal.querySelector('.btn.primary').textContent = 'Save Changes';
}

/************* EDITOR *************/
function renderEditor(root) {
    // --- STATE MANAGEMENT for the new UI ---
    // ui_state.active_prefield_tab determines which section's content is shown on the RIGHT
    // ui_state.expanded_prefield_section determines which accordion is expanded on the LEFT
    const activeTab = ui_state.active_prefield_tab || 'screener';
    const expandedSection = ui_state.expanded_prefield_section || null;

    // --- DEFINE the four main sections ---
    const sections = [
        { name: 'screener', title: 'Screener', hasQuestionList: true },
        { name: 'main', title: 'Main Survey', hasQuestionList: true },
        { name: 'tabplan', title: 'Tab Sheet', hasQuestionList: false },
        { name: 'banner', title: 'Banner', hasQuestionList: false },
    ];

    // --- BUILD the new layout with the accordion sidebar ---
    const layoutHTML = `
      <div class="editor-main-content">
        
        <div class="accordion-panel">
            <aside class="accordion-sidebar">
              ${sections.map(section => {
                const isActive = section.name === activeTab;
                const isExpanded = section.name === expandedSection;
    
                // Conditionally create the content for the accordion (add buttons, question list)
                let accordionContentHTML = '';
                if (section.hasQuestionList) {
                    accordionContentHTML = `
                      <div class="sidebar-header-card" style="margin-bottom: 12px; padding: 16px;">
                        <h3 class="sidebar-title" style="margin-bottom: 12px;">Add Questions</h3>
                        <div class="add-question-grid">
                          ${section.name === 'screener'
                            ? `<button class="add-btn" id="addScreener">+ Screener</button>`
                            : `<button class="add-btn" id="addMain">+ Main</button>
                               <button class="add-btn" id="addHidden">+ Hidden</button>
                               <button class="add-btn" id="addQC">+ QC Check</button>`
                          }
                        </div>
                      </div>
                      <div class="question-list-card">
                        <div class="question-list-header" id="question-list-header-${section.name}"></div>
                        <div class="question-list-body" id="question-list-${section.name}"></div>
                      </div>
                    `;
                }
    
                return `
                  <div class="accordion-item ${isActive ? 'active' : ''} ${isExpanded ? 'is-expanded' : ''}">
                    <div class="accordion-header" data-section-name="${section.name}">
                      <span class="accordion-title">${section.title}</span>
                      ${section.hasQuestionList 
                        ? `<span class="accordion-toggle-icon" data-expand-section="${section.name}">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                           </span>` 
                        : ''
                      }
                    </div>
                    <div class="accordion-content">
                      ${accordionContentHTML}
                    </div>
                  </div>
                `;
              }).join('')}
            </aside>
        </div>
        <main id="main-content-host" style="min-height: 80vh;"></main>
      </div>
    `;
    root.innerHTML = layoutHTML;
    const mainContentHost = document.getElementById('main-content-host');

    // --- RENDER CONTENT on the right based on the active tab ---
    if (activeTab === 'screener' || activeTab === 'main') {
        // Render the editor panel for question-based sections
        mainContentHost.id = 'editor-panel-host'; // Keep the ID for renderEditorPanel
        mainContentHost.className = 'editor-panel-card';
        renderEditorPanel(); // Your existing function still works perfectly here

        // If the section is expanded, also render its question list
        if (activeTab === 'screener' || activeTab === 'main') {
            const filter = (activeTab === 'screener') ? 'screener' : 'main';
            renderQuestionList(filter);
        }
    } else {
        // Render the single-panel views for Tab Sheet and Banner
        mainContentHost.id = ''; // Clear ID to avoid conflicts
        mainContentHost.className = '';
        mainContentHost.innerHTML = `
            <div class="workbench" style="max-width: 100%;">
                <div id="prefield-content-host"></div>
            </div>
        `;
        const host = document.getElementById('prefield-content-host');
        if (activeTab === 'banner') renderPreviewBanner(host);
        if (activeTab === 'tabplan') renderPreviewTabSheet(host);
    }

    // --- WIRE UP EVENT LISTENERS ---
    
    // Add Question buttons
    $('#addScreener')?.addEventListener('click', () => addQuestion('S'));
    $('#addMain')?.addEventListener('click', () => addQuestion('Q'));
    $('#addHidden')?.addEventListener('click', () => addQuestion('H'));
    $('#addQC')?.addEventListener('click', () => addQuestion('R'));

    // Accordion header clicks (to switch the main view)
    root.querySelectorAll('.accordion-header').forEach(header => {
        header.onclick = (e) => {
            // Clicks on the expand icon should not switch the main view
            if (e.target.closest('.accordion-toggle-icon')) return;

            const sectionName = header.dataset.sectionName;
            if (ui_state.active_prefield_tab !== sectionName) {
                ui_state.active_prefield_tab = sectionName;
                // Automatically expand the section when it becomes active
                ui_state.expanded_prefield_section = sectionName;
                renderEditor(root);
            }
        };
    });

    // Accordion expand/collapse icon clicks
    root.querySelectorAll('.accordion-toggle-icon').forEach(icon => {
        icon.onclick = () => {
            const sectionName = icon.dataset.expandSection;
            // If it's already expanded, collapse it. Otherwise, expand it.
            if (ui_state.expanded_prefield_section === sectionName) {
                ui_state.expanded_prefield_section = null;
            } else {
                ui_state.expanded_prefield_section = sectionName;
                // Also make it the active tab if it's not already
                if(ui_state.active_prefield_tab !== sectionName) {
                    ui_state.active_prefield_tab = sectionName;
                }
            }
            renderEditor(root);
        };
    });

    wireEditorShortcuts();
}

console.log('Active tab:', ui_state.active_prefield_tab);
console.log('Questions:', state.questions.map(q => q.id));

function renderOverview(host) {
  const p = state.project || {};
  const totalQuestions = state.questions?.length || 0;

  // Helper to give date statuses a color pill
// Helper to give date statuses a color pill
  const getStatusPill = (status) => {
    const styles = {
      // ✅ Green for "Done" states
      'Done': 'background: #dcfce7; color: #166534; border-color: #bbf7d0;',
      'Approved': 'background: #dcfce7; color: #166534; border-color: #bbf7d0;',

      // 🔵 Blue for "Active" states
      'In Progress': 'background: #dbeafe; color: #1e40af; border-color: #bfdbfe;',

      // 🟡 Yellow for "Pending" states
      'Draft': 'background: #fef9c3; color: #854d0e; border-color: #fde68a;',
      'Waiting for Approval': 'background: #fef9c3; color: #854d0e; border-color: #fde68a;',
      
      // 🔴 Red for "Problem" states (optional, for future use)
      'Blocked': 'background: #fee2e2; color: #991b1b; border-color: #fecaca;',
      'Overdue': 'background: #fee2e2; color: #991b1b; border-color: #fecaca;',

      // ⚫ Gray for "Inactive" states
      'Not Started': 'background: var(--surface-3); color: var(--muted); border-color: var(--line);',
    };
    return `<span class="pill" style="display: inline-flex; align-items: center; font-weight: 600; ${styles[status] || ''}">${escapeHTML(status)}</span>`;
  };

  // --- PREPARE DYNAMIC CONTENT ---

  const tagsHTML = (p.tags && p.tags.length > 0) ?
    p.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('') : '';

  const timelineHTML = (p.important_dates && p.important_dates.length > 0) ?
    p.important_dates.map(date => `
      <div class="stack timeline-item" style="justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--line);">
        <div>
          <strong>${escapeHTML(date.what)}</strong>
          <div class="muted" style="margin-top: 2px;">
            Due: ${date.when || 'N/A'} • Assigned: ${escapeHTML(date.who) || 'N/A'}
          </div>
        </div>
        ${getStatusPill(date.status)}
      </div>
    `).join('') :
    '<div class="pv-empty">No key dates have been set.</div>';

  const notesHTML = p.notes ?
    `<blockquote style="margin: 0; padding: 0 .8em; border-left: 3px solid var(--line); color: var(--muted); white-space: pre-wrap;">${escapeHTML(p.notes)}</blockquote>` :
    '<div class="pv-empty">No notes for this project.</div>';

  const teamHTML = (p.roles && p.roles.length > 0) ?
    p.roles.map(role => `
      <div class="stack team-item" style="justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--line);">
          <span>${escapeHTML(role.person)}</span>
          <span class="tag">${escapeHTML(role.role)}</span>
      </div>
    `).join('') :
    '<div class="pv-empty">No roles assigned.</div>';

  // --- FINAL ASSEMBLY ---

  host.innerHTML = `
    <style>
      .timeline-item:last-child, .team-item:last-child { border-bottom: none !important; }
      .section-heading { margin-top: 0; margin-bottom: 16px; color: var(--muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
      .metadata-value { font-size: 1.2rem; display: block; color: var(--brand-primary); font-weight: 600; }
      .content-section + .content-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--line); }
    </style>
    <div class="workbench" style="max-width: 1200px; margin-top: 24px;">
      <div class="card" style="display: grid; grid-template-columns: 2fr 1fr; overflow: hidden;">
        
        <div class="left-column" style="padding: 32px 40px;">
          <div class="content-section" style="padding-top:0; border-top:none;">
            <h2 style="margin-top:0; margin-bottom: 4px;">${escapeHTML(p.name || 'Untitled Project')}</h2>
            <p class="muted" style="font-size: 1.1rem; margin-top: 0;">
              ${escapeHTML(p.client || 'No Client')}
              ${p.client ? `<button class="btn ghost" style="margin-left: 8px; padding: 2px 8px;" onclick="openClientProfile('${escapeHTML(p.client)}')">View Profile</button>` : ''}
            </p>
            ${tagsHTML ? `<div class="stack" style="gap: 6px; margin-top: 12px;">${tagsHTML}</div>` : ''}
          </div>

          <div class="content-section">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 24px;">
              <div><div class="muted">Status</div><strong class="metadata-value">${escapeHTML(p.status)}</strong></div>
              <div><div class="muted">Project Type</div><strong class="metadata-value">${escapeHTML(p.project_type) || 'N/A'}</strong></div>
              <div><div class="muted">Last Updated</div><strong class="metadata-value">${new Date(p.updated_at).toLocaleDateString()}</strong></div>
              <div><div class="muted">Total Questions</div><strong class="metadata-value">${totalQuestions}</strong></div>
            </div>
          </div>
          
          <div class="content-section">
            <h3 class="section-heading">Project Timeline</h3>
            <div class="timeline-list">${timelineHTML}</div>
          </div>

          <div class="content-section">
            <h3 class="section-heading">Notes</h3>
            ${notesHTML}
          </div>
        </div>

        <div class="right-column" style="padding: 32px 40px; border-left: 1px solid var(--line); background-color: var(--surface-3);">
          <div class="content-section" style="padding-top:0; border-top:none;">
            <h3 class="section-heading" style="margin-top:0;">Team</h3>
            <div class="team-list">${teamHTML}</div>
          </div>

          <div class="content-section">
            <h3 class="section-heading">Actions & Exports</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button id="overviewImportJson">Import Project</button>
                <button id="overviewExportJson">Export Project</button>
                <button id="overviewGenerateQre">Export QRE</button>
                <button id="overviewGenerateTab">Export Tab Plan</button>
            </div>
            <button class="primary" onclick="openEditProjectModal('${p.id}')" style="width: 100%; padding: 12px; margin-top: 10px;">Edit Project Details</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // --- Re-wire Action Button Handlers ---
  const hostQuery = (sel) => host.querySelector(sel);
  hostQuery('#overviewExportJson').onclick = downloadJSON;
  hostQuery('#overviewImportJson').onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        state.project = data.project || {}; state.globals = data.globals || {}; state.questions = data.questions || [];
        migrateProjectModel?.(); autosaveNow?.(); setStatus?.("Project imported.", true); renderRoute();
      } catch (err) {
        alert("Error importing file. Please ensure it is a valid JSON project file."); console.error("Import Error:", err);
      }
    };
    input.click();
  };
  // In renderOverview function, update these lines:
  hostQuery('#overviewGenerateQre').onclick = () => {
      postAndDownload("http://localhost:8000/generate/questionnaire", `${(state.project.name || 'project').replace(/[^\w\-]+/g, '_')}_questionnaire.docx`);
  };
  hostQuery('#overviewGenerateTab').onclick = () => {
      postAndDownload("http://localhost:8000/generate/tab-plan", `${(state.project.name || 'project').replace(/[^\w\-]+/g, '_')}_tab_plan.xlsx`);
  };

  console.log('UI state active_prefield_tab:', ui_state.active_prefield_tab);
  console.log('UI state expanded_prefield_section:', ui_state.expanded_prefield_section);
}


function renderFielding(host) {
  host.innerHTML = `
    <div class="workbench" style="margin-top: 16px;">
      <h2>Fielding</h2>
      <div class="pv-empty">Fielding dashboard and tools will be available here.</div>
    </div>`;
}

function renderReporting(host) {
  host.innerHTML = `
    <div class="workbench" style="margin-top: 16px;">
      <h2>Reporting</h2>
      <div class="pv-empty">Banner builder, data exports, and reporting tools will be available here.</div>
    </div>`;
}

// ---------- SUMMARIES (numeric, table, open end)
function numericSummary(q){
  const N = q.numeric || {};
  const hasRange = (N.min != null || N.max != null);
  const range = hasRange ? ` ${N.min ?? ''}–${N.max ?? ''}` : '';
  if (q.type === 'numeric_time')  return `time${range} ${N.time_unit || ''}`.trim();
  if (q.type === 'numeric_count') return `count${range} ${N.unit || ''}`.trim();
  if (q.type === 'numeric_open')  return `num${range} ${N.unit || ''}`.trim();
  return '';
}

function openSummary(q){
  if (q.type !== 'open_end') return '';
  const O = q.open || {};
  const k = O.limit_kind || '';
  const a = O.min, b = O.max;
  // base label always; details only if kind chosen AND at least one bound set
  const detail = (k && (a != null || b != null)) ? ` ${a ?? ''}–${b ?? ''} ${k}` : '';
  return ` • open${detail}`;
}

function summaryFor(q){
  if (q.mode === 'table' && q.table_variation) {
    return q.table_variation;
  }
  const base = (q.mode === 'open') ? 'open_end' : `${q.type || 'single'}`;
  const scal = q.scale?.points ? ` • ${q.scale.points}pt` : '';
  const opts = (q.options?.length || 0) ? ` • ${q.options.length} opt` : '';
  const stm  = (q.statements?.length || 0) ? ` • ${q.statements.length} stmts` : '';
  const num  = /^numeric_/.test(q.type || '') ? ` • ${numericSummary(q)}` : '';
  const tbl  = (q.grid?.rows?.length || 0) || (q.grid?.cols?.length || 0)
    ? ` • table ${q.grid.rows.length}×${q.grid.cols.length}` : '';
  const open = openSummary(q);

  return base + scal + opts + stm + num + tbl + open;
}

// ==========================
// Sidebar: Question List
// ==========================
function renderQuestionList(filter = 'all') {
  // 0) Resolve the host nodes for this section (screener | main)
  const listEl   = document.getElementById(`question-list-${filter}`);
  const headerEl = document.getElementById(`question-list-header-${filter}`);
  if (!listEl || !headerEl) return; // nothing to render into (collapsed, wrong tab, etc.)

  // 1) Build the data set for this section
  const rows = state.questions
    .map((q, originalIndex) => ({ q, originalIndex }))
    .filter(({ q }) => {
      const id = String(q.id || '').toUpperCase();
      if (filter === 'screener') return id.startsWith('S');
      if (filter === 'main')     return id.startsWith('Q') || !id.startsWith('S');
      return true; // 'all'
    });

  // 2) Header
  headerEl.textContent = `${filter === 'screener' ? 'Screener' : 'Main Survey'} Questions (${rows.length})`;

  // 3) List body
  listEl.innerHTML = '';
  rows.forEach(({ q, originalIndex }) => {
    const item = document.createElement('div');
    item.className = 'question-item' + (originalIndex === ui_state.active_question_index ? ' active' : '');
    item.dataset.index = String(originalIndex);
    item.draggable = true;

    item.innerHTML = `
      <div class="stack" style="align-items:flex-start;">
        <span class="tag">${escapeHTML(q.id || '')}</span>
        <div class="text" style="flex:1;">${escapeHTML(q.text || '...')}</div>
      </div>
      <div class="summary">${summaryFor(q)}</div>
    `;

    // A) Select to edit (keeps preview & editor in sync)
    item.addEventListener('click', () => {
      ui_state.active_question_index = originalIndex;
      // Ensure the right tab is active if user clicks from the other section
      if (filter !== ui_state.active_prefield_tab && (filter === 'screener' || filter === 'main')) {
        ui_state.active_prefield_tab = filter;
      }
      renderEditorPanel();        // right-side form
      renderQuestionPreview();    // live preview pane (if present)
      renderQuestionList(filter); // refresh highlight
    });

    // B) Drag & drop re-ordering (within the same filtered list)
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', String(originalIndex));
    });
    item.addEventListener('dragover', (e) => e.preventDefault());
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
      const to   = originalIndex;
      if (Number.isNaN(from) || Number.isNaN(to) || from === to) return;

      // Move in the global array (state.questions)
      const [moved] = state.questions.splice(from, 1);
      // After removal, indices >= from have shifted left by 1
      const adjustedTo = from < to ? to - 1 : to;
      state.questions.splice(adjustedTo, 0, moved);

      // Keep the selection on the moved question
      ui_state.active_question_index = state.questions.findIndex(x => x === moved);

      // Re-render UI and persist order
      renderQuestionList(filter);
      renderEditorPanel();
      renderQuestionPreview();
      queueAutosave();
    });

    listEl.appendChild(item);
  });
}


// ==========================
// Right pane: Live Preview
// ==========================
function renderQuestionPreview() {
  const host = document.getElementById('question-preview-host');
  if (!host) return;

  const i = ui_state.active_question_index;
  if (i == null || !state.questions[i]) {
    host.innerHTML = `<div class="pv-empty" style="padding:20px;">Select a question to see its preview.</div>`;
    return;
  }

  const q = state.questions[i];

  // Resolve preview columns for tables
  let previewCols = [];
  if (q.mode === 'table') {
    if (q.grid?.columnSource?.qid) {
      const src = findQuestionById(q.grid.columnSource.qid);
      if (src) {
        const exclude = new Set(String(q.grid.columnSource.exclude || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean));
        previewCols = getQuestionOptions(src)
          .filter(opt => !exclude.has(opt.code))
          .map(opt => opt.label);
      } else {
        previewCols = [`Error: QID "${q.grid?.columnSource?.qid}" not found.`];
      }
    } else {
      previewCols = Array.isArray(q.grid?.cols) ? q.grid.cols : [];
    }
  }

  // Build body by type
  let content = '';
  const randomized = randomizedOptions(q);

  switch (q.type) {
    case 'single':
    case 'multi': {
      const inputType = q.type === 'single' ? 'radio' : 'checkbox';
      const name = `q-preview-${q.id}`;
      content = randomized.map(o => `
        <label class="stack" style="padding:8px;border-radius:8px;background:var(--surface-2);cursor:pointer;">
          <input type="${inputType}" name="${escapeHTML(name)}" />
          <span>${escapeHTML(parsePipedText(o.label || '', buildMockResponses()))}</span>
        </label>
      `).join('<div style="height:6px;"></div>');
      break;
    }

    case 'grid_single':
    case 'grid_multi': {
      const rows = Array.isArray(q.grid?.rows) ? q.grid.rows : [];
      if (!rows.length || !previewCols.length) {
        content = `<div class="pv-empty">Table has no rows or columns defined.</div>`;
        break;
      }
      const cellType = q.type === 'grid_single' ? 'radio' : 'checkbox';
      content = `
        <div style="overflow-x:auto;">
          <table class="pv-table" style="width:100%;">
            <thead>
              <tr>
                <th style="min-width:150px;"></th>
                ${previewCols.map(c => `<th>${escapeHTML(c)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map((r, ri) => `
                <tr>
                  <td>${escapeHTML(r)}</td>
                  ${previewCols.map((_c, ci) => `
                    <td style="text-align:center;">
                      <input type="${cellType}" name="q-preview-${escapeHTML(String(q.id))}-row-${ri}" />
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
      break;
    }

    case 'numeric':
    case 'numeric_open': {
      content = `
        <input type="number" placeholder="Enter a number…" style="padding:8px;border-radius:8px;width:220px;" />
      `;
      break;
    }

    case 'open_end': {
      content = `
        <textarea rows="4" placeholder="Type your response…" style="padding:8px;border-radius:8px;width:100%;"></textarea>
      `;
      break;
    }

    default:
      content = `<div class="pv-empty">Preview not available for this question type yet.</div>`;
  }

  // Render preview card
  host.innerHTML = `
    <div class="card-header">
      <strong>Live Preview</strong>
    </div>
    <div class="card-content" style="display:flex;flex-direction:column;gap:8px;">
      <p style="font-weight:600;margin:0 0 8px 0;">
        ${escapeHTML(parsePipedText(q.text || '...', buildMockResponses()))}
      </p>
      ${content}
    </div>
  `;
}



/* -----------------------
   MODE <-> TYPE MAPPING
   ----------------------- */
function inferModeFromType(q){
  const t = q.type || 'single';
  if (t.startsWith('numeric_') || t === 'numeric') return 'numeric';
  if (t.startsWith('grid_') || (t.startsWith('likert_') && (q.statements?.length||0) >= 2)) return 'table';
  return 'list';
}
function ensureMode(q){ q.mode ||= inferModeFromType(q); return q.mode; }
function getListSelection(q){ return (q.type === 'multi' || q.type === 'grid_multi') ? 'multi' : 'single'; }
function setListSelection(q, sel){ if (q.mode !== 'list') return; q.type = (sel === 'multi') ? 'multi' : 'single'; }

/* ===== TEXT PIPING SYSTEM ===== */

/**
 * Parses piped text and replaces variables with actual values
 * Supports syntax like {S6_3}, {S6_3:label}, {S6_2+S6_3}, {S6_3>1?"children":"child"}
 */
function parsePipedText(text, responses = {}) {
  if (!text || typeof text !== 'string') return text;
  
  // Replace all piped variables in the text
  return text.replace(/\{([^}]+)\}/g, (match, expression) => {
    try {
      return evaluatePipeExpression(expression.trim(), responses);
    } catch (error) {
      console.warn('Piping error:', error.message, 'for expression:', expression);
      return `[${expression}]`; // Show placeholder on error
    }
  });
}

/**
 * Evaluates a single pipe expression
 */
function evaluatePipeExpression(expr, responses) {
  // Ternary logic: {condition ? "true text" : "false text"}
  const ternaryMatch = expr.match(/(.+)\s*\?\s*([\'\"].+[\'\"])\s*:\s*([\'\"].+[\'\"])/);
  if (ternaryMatch) {
      const [, condition, trueVal, falseVal] = ternaryMatch;
      // Recursively evaluate the condition part (e.g., "S6_3+S6_4 > 1")
      const result = evaluatePipeExpression(condition.trim(), responses);
      
      // Helper to remove quotes from the output values
      const unquote = (str) => str.trim().slice(1, -1);

      return result ? unquote(trueVal) : unquote(falseVal);
  }

  // Handle pluralization: {S6_3:plural("child","children")}
  // Add support for conditional pluralization
  const pluralMatch = expr.match(/^([^:]+):plural\("([^"]+)","([^"]+)"\)$/);
  if (pluralMatch) {
    const [, qid, singular, plural] = pluralMatch;
    const value = getResponsePrimitive(qid, responses);
    return (value !== null && Number(value) === 1) ? singular : plural;
  }
  
  // Handle conditional pluralization: {S6_3:smart_plural("child")}
  const smartPluralMatch = expr.match(/^([^:]+):smart_plural\("([^"]+)"\)$/);
  if (smartPluralMatch) {
    const [, qid, base] = smartPluralMatch;
    const value = getResponsePrimitive(qid, responses);
    if (value !== null && Number(value) === 1) return base;
    // Simple pluralization rules
    if (base.endsWith('y')) return base.slice(0, -1) + 'ies';
    if (base.endsWith('s') || base.endsWith('sh') || base.endsWith('ch')) return base + 'es';
    return base + 's';
  }
  
  // Handle math expressions with decimals: {S6_3:round(2)}
  const roundMatch = expr.match(/^([^:]+):round\((\d+)\)$/);
  if (roundMatch) {
    const [, qid, decimals] = roundMatch;
    const value = getResponsePrimitive(qid, responses);
    if (value !== null && !isNaN(Number(value))) {
      return Number(value).toFixed(Number(decimals));
    }
    return `[${qid}:round]`;
  }
  
  // Handle array operations: {S6_3:sum}
  const sumMatch = expr.match(/^([^:]+):sum$/);
  if (sumMatch) {
    const qid = sumMatch[1];
    const response = responses[qid];
    if (Array.isArray(response)) {
      const sum = response.reduce((acc, val) => acc + (Number(val) || 0), 0);
      return String(sum);
    }
    return `[${qid}:sum]`;
  }
  
  // Handle comparisons: S6_3>1, S6_2+S6_3>0
  const comparisonMatch = expr.match(/^(.+?)(>=|<=|>|<|==|!=)(.+?)$/);
  if (comparisonMatch) {
    const [, left, operator, right] = comparisonMatch;
    const leftVal = evaluatePipeExpression(left, responses);
    const rightVal = evaluatePipeExpression(right, responses);
    
    const leftNum = Number(leftVal);
    const rightNum = Number(right.trim());
    
    switch (operator) {
      case '>': return leftNum > rightNum;
      case '<': return leftNum < rightNum;
      case '>=': return leftNum >= rightNum;
      case '<=': return leftNum <= rightNum;
      case '==': return leftNum === rightNum;
      case '!=': return leftNum !== rightNum;
      default: return false;
    }
  }
  
  // Handle arithmetic: S6_2+S6_3, S6_4-1
  const arithmeticMatch = expr.match(/^(.+?)([\+\-\*\/])(.+?)$/);
  if (arithmeticMatch) {
    const [, left, operator, right] = arithmeticMatch;
    const leftVal = Number(evaluatePipeExpression(left, responses));
    const rightVal = Number(evaluatePipeExpression(right, responses));
    
    switch (operator) {
      case '+': return leftVal + rightVal;
      case '-': return leftVal - rightVal;
      case '*': return leftVal * rightVal;
      case '/': return leftVal / rightVal;
      default: return leftVal;
    }
  }
  
  // Handle label requests: S6_3:label
  const labelMatch = expr.match(/^([^:]+):label$/);
  if (labelMatch) {
    const qid = labelMatch[1].trim();
    const value = responses[qid];
    if (value) {
      const question = findQuestionById(qid);
      const option = question?.options?.find(o => String(o.code) === String(value));
      return option?.label || value;
    }
    return `[${qid}:label]`;
  }
  
  // Handle simple variable references: S6_3
  if (/^[A-Z]\w*$/.test(expr)) {
    const value = responses[expr];
    return value !== undefined ? value : `[${expr}]`;
  }
  
  // Handle literal strings and numbers
  if (/^".*"$/.test(expr)) {
    return expr.slice(1, -1); // Remove quotes
  }
  
  if (/^\d+$/.test(expr)) {
    return Number(expr);
  }
  
  return `[${expr}]`;
}

/**
 * Gets available piping codes for the current question context
 */
function getAvailablePipingCodes(currentQuestionIndex) {
  const codes = [];
  
  // Add all prior questions with enhanced syntax
  for (let i = 0; i < currentQuestionIndex; i++) {
    const q = state.questions[i];
    if (q?.id) {
      // Basic codes
      codes.push({
        code: `{${q.id}}`,
        description: `Value from ${q.id}`
      });
      
      // If has options, add label variant
      if (q.options?.length) {
        codes.push({
          code: `{${q.id}:label}`,
          description: `Label from ${q.id}`
        });
      }
      
      // If numeric, add rounding
      if (isNumericQuestion(q)) {
        codes.push({
          code: `{${q.id}:round(1)}`,
          description: `${q.id} rounded to 1 decimal`
        });
      }
      
      // Add pluralization helpers
      codes.push({
        code: `{${q.id}:plural("child","children")}`,
        description: `Plural form based on ${q.id} value`
      });
      
      codes.push({
        code: `{${q.id}:smart_plural("child")}`,
        description: `Auto-pluralized based on ${q.id}`
      });
    }
  }
  
  // Add mathematical examples
  codes.push({
    code: `{S6_2+S6_3+S6_4}`,
    description: `Sum multiple values`
  });
  
  codes.push({
    code: `{S6_3>1?"have":"has"}`,
    description: `Conditional grammar`
  });
  
  return codes;
}

/* ===== CONDITIONAL DISPLAY SYSTEM ===== */
// Evaluate if a question should be visible based on its conditions
function evaluateQuestionConditions(q, allResponses = {}) {
  if (!q?.conditions || q.conditions.mode === 'none') {
    return true; // No conditions = always show
  }
  
  const rules = q.conditions.rules || [];
  if (!rules.length) return true;
  
  // Evaluate all rules
  const results = rules.map(rule => evaluateConditionRule(rule, allResponses));
  
  // Apply logic based on condition mode
  if (q.conditions.mode === 'show_if') {
    return results.every(r => r === true); // All must be true to show
  } else if (q.conditions.mode === 'hide_if') {
    return !results.some(r => r === true); // If any true, hide (so return false)
  }
  
  return true;
}

// Evaluate a single condition rule
function evaluateConditionRule(rule, allResponses) {
  const { qid, operator, values } = rule;
  if (!qid || !operator) return true;
  
  const response = allResponses[qid];
  if (response === undefined || response === null) return false;
  
  const responseArray = Array.isArray(response) ? response : [response];
  const checkValues = Array.isArray(values) ? values : [values];
  
  switch (operator) {
    case 'equals':
      return checkValues.some(val => responseArray.includes(String(val)));
    case 'not_equals':
      return !checkValues.some(val => responseArray.includes(String(val)));
    case 'contains':
      return checkValues.some(val => 
        responseArray.some(resp => String(resp).includes(String(val)))
      );
    case 'greater_than':
      const numResp = Number(responseArray[0]);
      const numVal = Number(checkValues[0]);
      return !isNaN(numResp) && !isNaN(numVal) && numResp > numVal;
    case 'less_than':
      const numResp2 = Number(responseArray[0]);
      const numVal2 = Number(checkValues[0]);
      return !isNaN(numResp2) && !isNaN(numVal2) && numResp2 < numVal2;
    default:
      return true;
  }
}

// Get available questions for condition targeting (only prior questions)
function getConditionTargetQuestions(currentQuestionIndex) {
  return state.questions
    .slice(0, currentQuestionIndex) // Only questions before current one
    .map(q => ({ id: q.id, text: q.text || q.id }));
}

// Get available values for a specific question (for condition builder)
function getQuestionValuesForConditions(qid) {
  const q = findQuestionById(qid);
  if (!q) return [];
  
  // Return options if available
  if (Array.isArray(q.options) && q.options.length) {
    return q.options.map(o => ({
      code: String(o.code || ''),
      label: String(o.label || o.code || '')
    }));
  }
  
  // For numeric questions, return some common values
  if (isNumericQuestion(q)) {
    return [
      { code: '0', label: '0' },
      { code: '1', label: '1' },
      { code: '5', label: '5' },
      { code: '10', label: '10' }
    ];
  }
  
  return [];
}

/* ===== VALIDATION SYSTEM ===== */

/**
 * Validates a question based on its `validation` rules.
 * @param {object} q The question object from the state.
 * @param {object} allResponses A map of all current survey responses (e.g., {S5: 3}).
 * @returns {object|null} An object with validation results or null if no validation is needed.
 */
function runValidation(q, allResponses) {
  if (!q.validation) {
    return null; // No validation rules for this question.
  }

  if (q.validation.type === 'sum_equals_qid') {
    const targetQid = q.validation.target;
    const targetSum = Number(allResponses[targetQid] || 0);

    let currentSum = 0;
    q.options.forEach(opt => {
      const fieldId = `${q.id}_${opt.code}`;
      currentSum += Number(allResponses[fieldId] || 0);
    });

    const isValid = currentSum === targetSum;

    return {
      isValid: isValid,
      message: `The sum of ages must equal ${targetSum}.`,
      currentSum: currentSum,
      targetSum: targetSum
    };
  }

  if (q.validation?.type === 'sum_equals_qid') {
    const targetSum = Number(allResponses[q.validation.target] || 0);
    let currentSum = 0;
    
    // Sum across multiple fields
    q.options?.forEach(opt => {
      const fieldId = `${q.id}_${opt.code}`;
      currentSum += Number(allResponses[fieldId] || 0);
    });
    
    return {
      isValid: currentSum === targetSum,
      message: `Sum must equal ${targetSum}. Current: ${currentSum}`,
      currentSum,
      targetSum
    };
  }

    // Handles validation where the range depends on which option is selected.
  if (q.validation.type === 'per_option_range') {
      const selectedOptionCode = allResponses[q.id];
      // The corresponding amount is likely stored in a separate response field, e.g., "Q6a_amount"
      const enteredAmount = parseFloat(allResponses[`${q.id}_amount`]);

      if (!selectedOptionCode || isNaN(enteredAmount)) {
          return null; // Not enough info to validate yet
      }

      const selectedOption = q.options.find(o => String(o.code) === String(selectedOptionCode));
      const rule = selectedOption?.validation_range;

      if (!rule) return null; // No rule for this option

      // Check Min/Max
      if ((rule.min !== null && enteredAmount < rule.min) || (rule.max !== null && enteredAmount > rule.max)) {
          return {
              isValid: false,
              message: `Amount must be between ${rule.min} and ${rule.max}.`
          };
      }

      // Check Decimals
      if (rule.decimals && rule.decimals.length > 0) {
          const decimalPart = enteredAmount % 1;
          const allowedDecimals = rule.decimals.map(d => d / 10); // e.g., [0, 5] -> [0.0, 0.5]
          if (!allowedDecimals.includes(decimalPart)) {
                return {
                  isValid: false,
                  message: `Amount must be a whole number or end in .${rule.decimals.join(' or .')}.`
              };
          }
      }

      // If all checks pass
      return { isValid: true };
  }


  // Add column validation for tables
  if (q.mode === 'table' && q.validation?.type === 'force_per_column') {
    const cols = q.grid?.cols || [];
    const missingCols = [];
    
    cols.forEach((col, colIndex) => {
      const hasResponse = (q.grid?.rows || []).some(row => 
        allResponses[`${q.id}_${row}_${colIndex}`]
      );
      if (!hasResponse) missingCols.push(col);
    });
    
    return {
      isValid: missingCols.length === 0,
      message: `Please answer for: ${missingCols.join(', ')}`
    };
  }

  return null; // Unknown validation type
}


function harmonizeTypeFromMode(q){
  const mode = ensureMode(q);
  if (mode === 'numeric'){
    if (!/^numeric_/.test(q.type||'')) q.type = 'numeric_open';
    return;
  }
  if (mode === 'table'){
    q.grid ||= { rows: q.statements || [], cols: (q.scale?.labels || []) };
    q.type = (q.type === 'grid_multi') ? 'grid_multi' : 'grid_single';
    return;
  }
  if (mode === 'open'){
    q.type = 'open_text';      // canonical subtype
    q.options = [];            // strip list/table artifacts
    q.statements = [];
    q.scale = null;
    q.grid = null;
    return;
  }
  if (mode === 'repeated'){
    q.type = 'repeated_measures';
    return;
  }
  // list (fallback)
  const hasScale = !!q.scale?.points;
  const stmts = q.statements?.length || 0;
  if (hasScale && stmts <= 1) q.type = 'likert_single';
  else if (hasScale && stmts === 2) q.type = 'likert_dual';
  else if (hasScale && stmts >= 3) q.type = 'likert_multi';
  else q.type = getListSelection(q);
}
function syncTableFacets(q){
  if (q.mode === 'table' && q.grid){
    q.statements = [...q.grid.rows];
    q.scale ||= {};
    q.scale.labels = [...q.grid.cols];
    q.scale.points = q.grid.cols.length || q.scale.points || null;
  }
}

/* -------------
   NUMERIC API
   ------------- */
// Guarantees a numeric object exists for question i, with safe defaults.
function ensureNumeric(i){
  const q = state.questions[i];
  if (!q.numeric) q.numeric = {};
  const n = q.numeric;
  if (n.min === undefined)        n.min = null;
  if (n.max === undefined)        n.max = null;
  if (n.unit === undefined)       n.unit = '';       // for numeric_open / numeric_count
  if (n.time_unit === undefined)  n.time_unit = '';  // for numeric_time
  if (n.placeholder === undefined)n.placeholder = ''; // e.g., "____ years"
  if (n.zero_pad === undefined)   n.zero_pad = 0;    // 0 = none, 2 = pad to "01"
  if (n.integer_only === undefined)n.integer_only = true;
  return n;
}

// Normalizes numeric updates; blanks become null, numbers parse safely.
function updateNumeric(i, key, value){
  ensureNumeric(i);
  const n = state.questions[i].numeric;

  if (key === 'integer_only') {
    n.integer_only = !!value;
  } else if (key === 'min' || key === 'max') {
    if (value === '' || value === null) n[key] = null;
    else {
      const num = Number(value);
      n[key] = Number.isFinite(num) ? num : null;
    }
  } else if (key === 'zero_pad') {
    // Accept only 0 or 2; blank -> 0
    const z = String(value).trim() === '' ? 0 : Number(value);
    n.zero_pad = (z === 2) ? 2 : 0;
  } else if (key === 'unit' || key === 'time_unit' || key === 'placeholder') {
    n[key] = String(value ?? '');
  }
  queueAutosave();
}

function updateRepeatedSource(i, sourceQid) {
  const q = state.questions[i];
  if (!q.repeated_measures) q.repeated_measures = { ...QUESTION_DEFAULTS.repeated_measures };
  q.repeated_measures.source_qid = sourceQid || null;
  queueAutosave();
  renderEditorPanel();
}

function addRepeatedField(i) {
  const q = state.questions[i];
  if (!q.repeated_measures?.template) {
    if (!q.repeated_measures) q.repeated_measures = { ...QUESTION_DEFAULTS.repeated_measures };
    q.repeated_measures.template = { fields: [] };
  }
  q.repeated_measures.template.fields.push({
    label: '',
    type: 'text',
    options: []
  });
  queueAutosave();
  renderEditorPanel();
}

function delRepeatedField(i, fieldIndex) {
  const q = state.questions[i];
  if (q.repeated_measures?.template?.fields) {
    q.repeated_measures.template.fields.splice(fieldIndex, 1);
    queueAutosave();
    renderEditorPanel();
  }
}

function updateRepeatedField(i, fieldIndex, property, value) {
  const q = state.questions[i];
  if (q.repeated_measures?.template?.fields?.[fieldIndex]) {
    q.repeated_measures.template.fields[fieldIndex][property] = value;
    queueAutosave();
  }
}

function getPriorQuestions(currentIndex) {
  return state.questions.filter((q, i) => i < currentIndex);
}

/**
 * Analyzes a question object and returns its specific table variation name.
 * @param {object} q The question object.
 * @returns {string} The name of the table variation or an empty string.
 */
function getTableVariationName(q) {
  if (q.mode !== 'table') {
    return ''; // Not a table question
  }

  // Check for Dynamic Column Matrix first, as it's a primary feature
  if (q.grid?.columnSource?.qid) {
    return 'Dynamic Column Matrix';
  }
  
  const cols = q.grid?.cols || [];
  if (cols.length === 2 && /applies/i.test(cols[0]) && /not apply/i.test(cols[1])) {
    return 'Dichotomous Matrix';
  }

  // Check for Likert scale patterns (e.g., presence of "agree", "likely", "satisfied")
  const scaleText = cols.join(' ').toLowerCase();
  if (/agree/.test(scaleText) || /likely/.test(scaleText) || /satisfied/.test(scaleText)) {
    return 'Likert Scale Matrix';
  }
  
  if (cols.length > 0) {
    return 'Standard Matrix'; // A good default for generic tables
  }

  return 'Table'; // Generic fallback
}

/* -------- EDITOR PANEL (Type UI removed entirely) -------- */
/* -------- EDITOR PANEL (Type UI removed entirely) -------- */
function renderEditorPanel() {
    // 1. GET HOST ELEMENT & ACTIVE QUESTION
    const panel = $("#editor-panel-host");
    if (!panel) return;

    const i = ui_state.active_question_index;

    // Clear the base builder state if we're switching questions
    if (i !== null && ui_state.base_builders) {
        delete ui_state.base_builders[i];
    }

    // 2. HANDLE EMPTY STATE
    if (i === null || !state.questions[i]) {
        panel.innerHTML = `
            <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; text-align:center; padding: 40px;">
              <svg style="width: 48px; height: 48px; color: var(--muted); margin-bottom: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l-4 4-4-4M6 16l-4-4 4-4"></path></svg>
              <h3 style="font-size: 18px; margin: 0 0 8px 0;">No Question Selected</h3>
              <p style="color: var(--muted);">Select a question from the list on the left to begin editing.</p>
            </div>`;
        return;
    }

    // 3. PREPARE DATA & RUN VALIDATION
    const q = state.questions[i];
    q.table_variation = getTableVariationName(q);
    ensureTabBucket(q);
    syncNetsWithQuestion(q);
    harmonizeTypeFromMode(q);
    syncTableFacets(q);
    const N = ensureNumeric(i);
    const mode = ensureMode(q);
    const tp = q.exports?.tab_plan || {};

    // ✨ NEW: Run validation logic
    const mockResponses = { ...buildMockResponses(), ...mockNumericResponses };
    const validationResult = runValidation(q, mockResponses);


    // Global table helpers are preserved
    window._tb_addRow = (ii) => { state.questions[ii].grid.rows.push(''); renderEditorPanel(); queueAutosave(); };
    window._tb_delRow = (ii, idx) => { state.questions[ii].grid.rows.splice(idx,1); renderEditorPanel(); queueAutosave(); };
    window._tb_updRow = (ii, idx, val) => { state.questions[ii].grid.rows[idx] = val; queueAutosave(); };
    window._tb_addCol = (ii) => { state.questions[ii].grid.cols.push(''); renderEditorPanel(); queueAutosave(); };
    window._tb_delCol = (ii, idx) => { state.questions[ii].grid.cols.splice(idx,1); renderEditorPanel(); queueAutosave(); };
    window._tb_updCol = (ii, idx, val) => { state.questions[ii].grid.cols[idx] = val; queueAutosave(); };

    // Helper functions to toggle and update the column source
    window.toggleColumnSource = (qIndex, enabled) => {
        const question = state.questions[qIndex];
        if (enabled) {
            question.grid.columnSource = { qid: null, exclude: '' };
        } else {
            delete question.grid.columnSource;
        }
        renderEditorPanel();
        queueAutosave();
    };

    window.updateColumnSource = (qIndex, key, value) => {
        const question = state.questions[qIndex];
        if (question.grid.columnSource) {
            question.grid.columnSource[key] = value;
            queueAutosave();
        }
    };

    // 4. DEFINE MODE-SPECIFIC HTML TEMPLATES (Refactored)
    const modeSpecificHTML = {
        'list': `
            <div class="options-content-area">
                ${(q.options||[]).map((o,j)=> `
                    <div class="option-row" style="margin-bottom:8px;">
                        <div class="option-editor-row">
                            <input class="form-control" placeholder="Code" style="flex: 0 0 70px;" value="${o.code ?? ""}" oninput="updateOpt(${i},${j},'code',event.target.value,true)"/>
                            <div style="flex: 1 1 auto;">
                                <input
                                id="optLabel-${i}-${j}"
                                class="form-control"
                                placeholder="Label"
                                value="${escapeHTML(o.label || '')}"
                                oninput="updateOpt(${i},${j},'label',event.target.value)"
                                />
                            </div>
                            
                            ${q.validation?.type === 'sum_equals_qid' ? `
                                <input 
                                type="number" 
                                class="form-control" 
                                style="width: 100px; text-align: right;"
                                placeholder="Count"
                                oninput="updateNumericResponse('${q.id}_${o.code}', this.value)"
                                value="${mockNumericResponses[`${q.id}_${o.code}`] || ''}"
                                />
                            ` : ''}

                            <button class="icon-btn" title="Advanced Settings" data-action="toggle-advanced" data-target="adv-opt-${i}-${j}">⚙️</button>
                            <button class="icon-btn danger" title="Delete Option" onclick="delOpt(${i},${j})">🗑️</button>
                        </div>
                        <div class="advanced-options is-hidden" id="adv-opt-${i}-${j}" style="padding: 12px 8px 4px;">
                            <div id="pipeHost-${i}-${j}-optlabel"></div>
                            <div class="stack" style="gap:12px; align-items:center;"></div>
                            <div class="stack" style="gap:12px; align-items:center;">
                                <div class="input-group">
                                    <label>Anchor</label>
                                    <select onchange="updateOpt(${i},${j},'anchor', this.value || null)">
                                        <option value="" ${!o.anchor?'selected':''}>Default</option>
                                        <option value="top" ${o.anchor==='top'?'selected':''}>Top</option>
                                        <option value="bottom" ${o.anchor==='bottom'?'selected':''}>Bottom</option>
                                    </select>
                                </div>
                                <label class="stack" style="gap:4px;"><input type="checkbox" ${o.exclusive?'checked':''} onchange="updateOpt(${i},${j},'exclusive',this.checked)"> Exclusive</label>
                                <label class="stack" style="gap:4px;"><input type="checkbox" ${o.terminate?'checked':''} onchange="updateOpt(${i},${j},'terminate',this.checked)"> Terminate</label>
                                <label class="stack" style="gap:4px;"><input type="checkbox" ${o.lock_randomize?'checked':''} onchange="updateOpt(${i},${j},'lock_randomize',this.checked)"> Lock</label>
                            </div>
                        </div>
                    </div>`).join('') || '<div class="muted" style="padding: 10px;">No options yet.</div>'}

                ${validationResult && !validationResult.isValid ? `
                <div class="error" style="margin-top: 12px; text-align: center;">
                    ${escapeHTML(validationResult.message)} 
                    <strong>Current Sum: ${validationResult.currentSum}</strong>
                </div>
                ` : ''}

                <div class="stack" style="margin-top: 16px; border-top: 1px solid var(--line); padding-top: 16px;">
                    <button class="btn" onclick="addOpt(${i})">+ Add Option</button>
                    <button class="btn" onclick="bulkAddOptions(${i})">📋 Bulk Add</button>
                    <div class="more-menu">
                        <button class="btn">Presets ▾</button>
                        <div class="more-menu-content">
                            <button class="more-menu-item" onclick="addPresetOption(${i}, 'pna')">Add "Prefer not to say"</button>
                            <button class="more-menu-item" onclick="addPresetOption(${i}, 'other')">Add "Other (please specify)"</button>
                            <button class="more-menu-item" onclick="addPresetOption(${i}, 'na')">Add "N/A"</button>
                        </div>
                    </div>
                </div>
            </div>`,
        'numeric': `
            <div class="options-content-area">
                <div class="form-row">
                    <label class="form-label" style="text-align: left; padding-top: 8px;">Type</label>
                    <div class="btn-group">
                        <input type="radio" id="num-open-${i}" name="numType-${i}" ${q.type === 'numeric_open' ? 'checked' : ''} onchange="updateQ(${i}, 'type', 'numeric_open'); renderEditorPanel();"/>
                        <label for="num-open-${i}">Open Numeric</label>
                        <input type="radio" id="num-count-${i}" name="numType-${i}" ${q.type === 'numeric_count' ? 'checked' : ''} onchange="updateQ(${i}, 'type', 'numeric_count'); renderEditorPanel();"/>
                        <label for="num-count-${i}">Count</label>
                        <input type="radio" id="num-time-${i}" name="numType-${i}" ${q.type === 'numeric_time' ? 'checked' : ''} onchange="updateQ(${i}, 'type', 'numeric_time'); renderEditorPanel();"/>
                        <label for="num-time-${i}">Time</label>
                    </div>
                </div>
                <div class="form-row">
                    <label class="form-label" style="text-align: left;">Range</label>
                    <div class="stack">
                        <input class="form-control" style="width:140px" type="number" placeholder="Min Value" value="${N.min ?? ''}" oninput="updateNumeric(${i}, 'min', this.value)"/>
                        <input class="form-control" style="width:140px" type="number" placeholder="Max Value" value="${N.max ?? ''}" oninput="updateNumeric(${i}, 'max', this.value)"/>
                    </div>
                </div>
                <div class="form-row">
                    <label class="form-label" style="text-align: left;">Unit</label>
                    ${q.type === 'numeric_time' ? `
                        <select class="form-control" style="width:290px" onchange="updateNumeric(${i}, 'time_unit', this.value)">
                            <option value="">(Select a time unit)</option>
                            ${['seconds','minutes','hours','days','weeks','months','years'].map(u=>`<option value="${u}" ${N.time_unit===u?'selected':''}>${u.charAt(0).toUpperCase() + u.slice(1)}</option>`).join('')}
                        </select>
                    ` : `
                        <input class="form-control" style="width:290px" placeholder="e.g., dollars, years" value="${N.unit || ''}" oninput="updateNumeric(${i}, 'unit', this.value)"/>
                    `}
                </div>
                 <div class="form-row">
                    <label class="form-label" style="text-align: left;">Formatting</label>
                    <div class="stack">
                        <label class="stack" style="gap:4px; padding-top: 8px;"><input type="checkbox" ${N.integer_only ? 'checked' : ''} onchange="updateNumeric(${i}, 'integer_only', this.checked)"/> Integer only</label>
                    </div>
                </div>
            </div>`,
        'table': (() => {
            const q = state.questions[i];
            const isDynamic = !!q.grid?.columnSource;
            const sourceQid = q.grid?.columnSource?.qid;
            let finalCols = [];

            if (isDynamic && sourceQid) {
                const sourceQ = findQuestionById(sourceQid);
                if (sourceQ) {
                    const excludeCodes = new Set((q.grid.columnSource.exclude || '').split(',').map(s => s.trim()));
                    finalCols = getQuestionOptions(sourceQ)
                        .filter(opt => !excludeCodes.has(opt.code))
                        .map(opt => opt.label);
                }
            } else {
                finalCols = q.grid?.cols || [];
            }
            
            const displayCols = finalCols.slice(0, 3);
            const hasMoreCols = finalCols.length > 3;
            const priorQuestions = getPriorQuestions(i);
            
            return `
                <style>
                    .qre-editor-table { width: 100%; border-collapse: collapse; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
                    .qre-editor-table th, .qre-editor-table td { border: 1px solid var(--line); padding: 0; vertical-align: middle; }
                    .qre-editor-table .header-cell { text-align: center; color: var(--muted); padding: 8px 12px; font-weight: 600; white-space: nowrap; }
                    .qre-editor-table input[type="text"] { border: none; background: transparent; width: 100%; height: 100%; padding: 10px 12px; font-family: inherit; font-size: 14px; }
                    .qre-editor-table input[type="text"]:focus { outline: 2px solid var(--accent); outline-offset: -2px; }
                </style>
                <div class="form-row">
                    <label class="form-label">Column Source</label>
                    <div>
                        <label class="stack" style="gap:6px; font-weight: 500; margin-bottom: 12px;">
                            <input type="checkbox" onchange="toggleColumnSource(${i}, this.checked)" ${isDynamic ? 'checked' : ''}/>
                            Populate columns from a previous question's answers
                        </label>
                        <div ${!isDynamic ? 'style="display:none;"' : ''}>
                            <div class="stack" style="margin-top: 12px; padding: 16px; background: var(--surface-3); border-radius: var(--radius-md); border: 1px solid var(--line);">
                                <label class="field" style="flex:1;">
                                    <span style="font-weight: 600; font-size: 12px; color: var(--muted);">Source Question</span>
                                    <select class="form-control" onchange="updateColumnSource(${i}, 'qid', this.value); renderEditorPanel();">
                                        <option value="">Select...</option>
                                        ${priorQuestions.map(pq => `<option value="${pq.id}" ${sourceQid === pq.id ? 'selected' : ''}>${pq.id}: ${escapeHTML((pq.text || '').substring(0,50))}...</option>`).join('')}
                                    </select>
                                </label>
                                <label class="field">
                                    <span style="font-weight: 600; font-size: 12px; color: var(--muted);">Exclude Codes</span>
                                    <input class="form-control" style="width: 150px;" placeholder="e.g., 98,99" value="${q.grid?.columnSource?.exclude || ''}" oninput="updateColumnSource(${i}, 'exclude', this.value)"/>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <hr style="margin: 24px 0; border-color: var(--line);">
                <h4 class="section-title" style="border-bottom: none; margin-bottom: 12px;">Content Editor</h4>
                <div class="options-content-area" style="padding: 0; background: transparent; border: none; overflow-x: auto;">
                    <table class="qre-editor-table">
                        <thead>
                            <tr>
                                <th style="width: 20%; min-width: 250px;">
                                    ${!isDynamic ? `<button id="presetBtn-${i}" class="btn" onclick="openPresetPicker(${i})">📊 Presets</button><div id="presetHost-${i}" class="preset-panel"></div>` : '&nbsp;'}
                                </th>
                                ${displayCols.map((c, ci) => `
                                    <th class="header-cell">
                                        ${isDynamic 
                                            ? `Insert selection from ${sourceQid}` 
                                            : `<input type="text" value="${escapeHTML(c)}" placeholder="Column ${ci + 1}" oninput="_tb_updCol(${i}, ${ci}, this.value)" />`
                                        }
                                    </th>
                                `).join('')}
                                ${hasMoreCols ? `<th class="header-cell">...and ${finalCols.length - 3} more</th>` : ''}
                                ${isDynamic ? '' : `<th><button class="btn" onclick="_tb_addCol(${i})">+</button></th>`}
                            </tr>
                        </thead>
                        <tbody>
                            ${(q.grid?.rows || []).map((r, ri) => `
                                <tr>
                                    <td style="display:flex; align-items:center; gap: 4px; padding-left: 5px;">
                                        <input type="text" value="${escapeHTML(r)}" placeholder="Statement ${ri + 1}" oninput="_tb_updRow(${i}, ${ri}, this.value)" />
                                        <button class="icon-btn danger" title="Delete Row" onclick="_tb_delRow(${i}, ${ri})">✕</button>
                                    </td>
                                    ${displayCols.map(() => `<td style="text-align:center; padding: 8px;">( )</td>`).join('')}
                                    ${hasMoreCols ? `<td style="text-align:center; padding: 8px;">...</td>` : ''}
                                    ${isDynamic ? '' : '<td></td>'}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <button class="btn" style="margin-top: 12px;" onclick="_tb_addRow(${i})">+ Add Statement</button>
                </div>
            `;
        })(),
        'open': `
            <div class="form-row">
                <label class="form-label">Length Limits</label>
                <div class="stack" style="align-items:center;">
                    <select class="form-control" style="width:150px;" onchange="(state.questions[${i}].open||={}).limit_kind=this.value||null; queueAutosave(); renderEditorPanel();">
                        <option value="" ${!q.open?.limit_kind ? 'selected' : ''}>None</option>
                        ${['words','characters','sentences'].map(k=>`<option value="${k}" ${q.open?.limit_kind===k?'selected':''}>${k.charAt(0).toUpperCase() + k.slice(1)}</option>`).join('')}
                    </select>
                    <input class="form-control" type="number" placeholder="Min" style="width:120px" value="${q.open?.min ?? ''}" oninput="(state.questions[${i}].open||={}).min=this.value===''?null:+this.value; queueAutosave();" ${!q.open?.limit_kind ? 'disabled' : ''} />
                    <input class="form-control" type="number" placeholder="Max" style="width:120px" value="${q.open?.max ?? ''}" oninput="(state.questions[${i}].open||={}).max=this.value===''?null:+this.value; queueAutosave();" ${!q.open?.limit_kind ? 'disabled' : ''} />
                </div>
            </div>`,
        'repeated': `
          <div class="options-content-area">
            <div class="form-row">
              <label class="form-label">Count Source</label>
              <select class="form-control" onchange="updateRepeatedSource(${i}, this.value)">
                <option value="">Select question that provides count...</option>
                ${getPriorQuestions(i).filter(pq => isNumericQuestion(pq)).map(pq => 
                  `<option value="${pq.id}" ${q.repeated_measures?.source_qid === pq.id ? 'selected' : ''}>
                    ${pq.id}: ${escapeHTML((pq.text || '').substring(0,50))}...
                  </option>`).join('')}
              </select>
            </div>
            
            <div class="form-row">
              <label class="form-label">Template Fields</label>
              <div id="repeatedFieldsList-${i}">
                ${(q.repeated_measures?.template?.fields || []).map((field, fi) => `
                  <div class="option-editor-row" style="margin-bottom:8px;">
                    <input class="form-control" placeholder="Field Label" value="${escapeHTML(field.label || '')}" 
                           oninput="updateRepeatedField(${i}, ${fi}, 'label', this.value)" style="flex: 1;"/>
                    <select class="form-control" style="width: 120px;" 
                            onchange="updateRepeatedField(${i}, ${fi}, 'type', this.value)">
                      <option value="text" ${field.type === 'text' ? 'selected' : ''}>Text</option>
                      <option value="select" ${field.type === 'select' ? 'selected' : ''}>Dropdown</option>
                      <option value="number" ${field.type === 'number' ? 'selected' : ''}>Number</option>
                    </select>
                    <button class="icon-btn danger" onclick="delRepeatedField(${i}, ${fi})">🗑️</button>
                  </div>
                  ${field.type === 'select' ? `
                    <div style="margin-left: 20px; margin-bottom: 8px;">
                      <textarea class="form-control" placeholder="Options (one per line)" 
                                oninput="updateRepeatedField(${i}, ${fi}, 'options', this.value.split('\\n'))"
                      >${(field.options || []).join('\n')}</textarea>
                    </div>
                  ` : ''}
                `).join('')}
              </div>
              <button class="btn" onclick="addRepeatedField(${i})">+ Add Field</button>
            </div>
            
            <div class="form-row">
              <label class="form-label">Preview</label>
              <div id="repeatedPreview-${i}" style="background: var(--surface-3); padding: 12px; border-radius: 8px;">
                ${q.repeated_measures?.source_qid ? 
                  `Will create instances based on response to ${q.repeated_measures.source_qid}` : 
                  'Select a count source to see preview'}
              </div>
            </div>
          </div>`
    };
    // 5. FINAL ASSEMBLY
    panel.innerHTML = `
      <div class="editor-header">
          <h2 class="editor-title">Editing: <strong>${q.id}</strong></h2>
          <div class="editor-actions stack">
              <button class="btn" onclick="saveQuestionToLibrary(${i})">💾 To Library</button>
              <button class="btn" onclick="dupQ(${i})">Duplicate</button>
              <button class="btn danger" onclick="delQ(${i})">Delete</button>
          </div>
      </div>

      <div class="editor-tabs" style="padding: 0 16px; border-bottom: 1px solid var(--line);">
        <button class="shell-tab ${ui_state.active_tab==='main'?'active':''}" data-tab="main">Question Setup</button>
        <button class="shell-tab ${ui_state.active_tab==='tabplan'?'active':''}" data-tab="tabplan">Tab Plan</button>
      </div>

      <div class="editor-content" style="overflow-y:auto;">
        <div class="tab-content ${ui_state.active_tab==='main'?'active':''}">
          
          <section class="editor-section">
            <h3 class="section-title">Question Text</h3>
            <div class="form-row">
              <label class="form-label">Text</label>
              <div>
                <div class="editor-toolbar-container">
                  <div id="qtext-toolbar-toggle-${i}" class="toolbar-toggle-bar">
                    <span>Formatting Tools</span>
                    <span>▾</span>
                  </div>
                  <div id="pipeHost-${i}-qtext" class="editor-toolbar">
                    <select id="qtext-fontsize-${i}" class="form-control" style="width: auto;" title="Font Size">
                      <option value="14px">Size: 14px</option>
                      <option value="16px">Size: 16px</option>
                      <option value="18px">Size: 18px</option>
                      <option value="20px">Size: 20px</option>
                    </select>
                    <input type="color" id="qtext-color-${i}" class="form-control" style="width: 50px; padding: 4px;" title="Font Color" value="#0F172A">
                  </div>
                </div>
                <div
                  id="questionText-${i}"
                  class="form-control"
                  contenteditable="true"
                  style="min-height:80px; border-top-left-radius:0; border-top-right-radius:0;"
                  oninput="updateQ(${i}, 'text', event.target.innerHTML)"
                >${q.text || ''}</div>
              </div>
            </div>
          </section>

          <section class="editor-section">
            <h3 class="section-title">Question Configuration</h3>
            <div class="form-row">
              <label class="form-label">Question ID</label>
              <input
                class="form-control"
                style="width: 250px;"
                value="${q.id}"
                oninput="updateQ(${i}, 'id', event.target.value)"/>
            </div>
            <div class="form-row">
              <label class="form-label">Mode</label>
              <div class="stack">
                ${['list', 'numeric', 'table', 'repeated', 'open'].map(m => `
                  <button class="mode-btn ${mode === m ? 'active' : ''}"
                    onclick="state.questions[${i}].mode='${m}'; harmonizeTypeFromMode(state.questions[${i}]); renderEditorPanel();">
                    ${{list:'Item/List', numeric:'Numeric', table:'Table', repeated:'Repeated Measures', open:'Open End'}[m]}
                  </button>
                `).join('')}
              </div>
            </div>
          </section>

          <section class="editor-section">
            <h3 class="section-title">Options & Content</h3>
            ${modeSpecificHTML[mode] || '<div class="muted">Select a mode to see options.</div>'}
          </section>

          <section class="editor-section">
            <details>
              <summary style="font-weight:600; cursor:pointer;">Advanced Logic & Settings</summary>
              <div style="padding-top: 16px;">
                ${mode==='list' ? `
                <div class="form-row">
                  <label class="form-label" style="padding-top:8px;">Selection Type</label>
                  <div class="btn-group">
                    <input type="radio" id="sel-single-${i}" name="listSel-${i}" value="single" ${getListSelection(q)==='single'?'checked':''} onchange="setListSelection(state.questions[${i}], 'single'); queueAutosave();"/>
                    <label for="sel-single-${i}">Single</label>
                    <input type="radio" id="sel-multi-${i}" name="listSel-${i}" value="multi" ${getListSelection(q)==='multi'?'checked':''} onchange="setListSelection(state.questions[${i}], 'multi'); queueAutosave();"/>
                    <label for="sel-multi-${i}">Multi</label>
                  </div>
                </div>
                <div class="form-row">
                  <label class="form-label" style="padding-top:8px;">Randomization</label>
                  <div class="btn-group">
                    <input type="radio" id="rand-none-${i}" name="rand-${i}" value="none" ${(q.randomization?.mode||'none')!=='shuffle'?'checked':''} onchange="updateQ(${i},'randomization',{...state.questions[${i}].randomization,mode:'none'});"/>
                    <label for="rand-none-${i}">None</label>
                    <input type="radio" id="rand-shuffle-${i}" name="rand-${i}" value="shuffle" ${q.randomization?.mode==='shuffle'?'checked':''} onchange="updateQ(${i},'randomization',{...state.questions[${i}].randomization,mode:'shuffle'});"/>
                    <label for="rand-shuffle-${i}">Shuffle</label>
                  </div>
                </div>` : ''}
                <div class="form-row">
                  <label class="form-label">Base Definition</label>
                  <div>
                    <input class="form-control" id="baseDef-${i}" value="${q.base?.definition || ''}" oninput="updateBase(${i},'definition',event.target.value)" placeholder="e.g., S1 in [2]"/>
                    <div id="bbHost-${i}" style="margin-top:8px;"></div>
                    <button class="btn" style="margin-top:8px;" onclick="bbApply(${i})">Apply Helper</button>
                  </div>
                </div>
                <div class="form-row">
                  <label class="form-label">Notes</label>
                  <input class="form-control" value="${q.notes || ''}" oninput="updateQ(${i}, 'notes', event.target.value)" placeholder="Internal notes, e.g., 'Red herring'"/>
                </div>
              </div>
            </details>
          </section>

          <section class="editor-section">
            <details open>
              <summary style="font-weight:600; cursor:pointer;">Display Conditions</summary>
              <div style="padding-top: 16px;">
                <div class="form-row">
                  <label class="form-label" style="padding-top:8px;">Condition Type</label>
                  <div class="mode-selection">
                    <button class="mode-btn ${(q.conditions?.mode || 'none') === 'none' ? 'active' : ''}" onclick="updateConditionMode(${i}, 'none')">No Conditions</button>
                    <button class="mode-btn ${q.conditions?.mode === 'show_if' ? 'active' : ''}" onclick="updateConditionMode(${i}, 'show_if')">Show If</button>
                    <button class="mode-btn ${q.conditions?.mode === 'hide_if' ? 'active' : ''}" onclick="updateConditionMode(${i}, 'hide_if')">Hide If</button>
                  </div>
                </div>
                <div id="conditionRules-${i}" style="${(q.conditions?.mode === 'none' || !q.conditions?.mode) ? 'display:none' : ''}">
                  <div class="form-row">
                    <label class="form-label">Condition Rules</label>
                    <div>
                      <div id="conditionRulesList-${i}"></div>
                      <button class="btn" style="margin-top: 8px;" onclick="addConditionRule(${i})">+ Add Rule</button>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </section>
        </div>

        <div class="tab-content ${ui_state.active_tab==='tabplan'?'active':''}">
          <section class="editor-section">
            <h3 class="section-title">Nets</h3>
            <div class="form-row">
              <label class="form-label">Defined Nets</label>
              <div>
                <div id="netsPreviewHost-${i}" class="stack" style="flex-direction:column; align-items:stretch; gap:6px; margin-bottom:8px;"></div>
                <button id="addNetBtn-${i}" class="btn primary">+ Add Net</button>
              </div>
            </div>
          </section>

          <section class="editor-section">
            <h3 class="section-title">Tabulation Instructions</h3>
            <div class="form-row">
              <label class="form-label">Instructions</label>
              <div>
                <textarea
                  class="form-control"
                  id="tabplan-instr-${i}"
                  oninput="updateTabPlan(${i},'additional_instructions',event.target.value)"
                  placeholder="Add any specific instructions for the tabulation team.">${tp.additional_instructions || ''}</textarea>
                <div id="pipeHost-${i}-instr" style="margin-top:6px;"></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;
// 1. Get references to key elements
const qtextEl = document.getElementById(`questionText-${i}`);
    const toggleBtn = document.getElementById(`qtext-toolbar-toggle-${i}`);
    const toolbar = document.getElementById(`pipeHost-${i}-qtext`);
    const fontSizeSelect = document.getElementById(`qtext-fontsize-${i}`);
    const fontColorInput = document.getElementById(`qtext-color-${i}`);
    const previewEl = document.getElementById(`pipingPreview-${i}`);

    // 2. Populate the contenteditable div with the saved question text (HTML)
    if (qtextEl) {
        qtextEl.innerHTML = q.text || "";
    }

    // 3. Wire up the collapsible toolbar toggle
    if (toggleBtn && toolbar) {
      toggleBtn.onclick = () => {
        toolbar.classList.toggle('is-open');
      };
    }

    // 4. Wire up the NEW rich text formatting tools
    if (qtextEl && fontSizeSelect) {
        fontSizeSelect.onchange = (e) => {
            // Use execCommand to apply font size to the selected text
            const sizeMap = { '14px': 3, '16px': 4, '18px': 5, '20px': 6 };
            document.execCommand('fontSize', false, sizeMap[e.target.value] || 3);
            qtextEl.focus(); // Return focus to the editor
        };
    }
    if (qtextEl && fontColorInput) {
        fontColorInput.oninput = (e) => {
            // Use execCommand to apply color to the selected text
            document.execCommand('foreColor', false, e.target.value);
            qtextEl.focus(); // Return focus to the editor
        };
    }
    
    // 5. Attach the "Insert Pipe" button to the collapsible toolbar
    if (toolbar) { // Add a check for the toolbar host
        attachPipingUI({
          host: toolbar,
          targetEl: qtextEl,
          contextQIndex: i
        });
    }

    // 6. Attach the live preview
    if (qtextEl && previewEl) {
        const refreshPreview = () => {
            const mockResponses = (typeof buildMockResponses === 'function' ? buildMockResponses() : {});
            const plainText = qtextEl.innerText; 
            const pipedText = parsePipedText(plainText, mockResponses);
            if (plainText.includes('{') && plainText.includes('}')) {
                previewEl.textContent = pipedText;
            } else {
                previewEl.textContent = '';
            }
        };
        qtextEl.addEventListener('input', refreshPreview);
        refreshPreview();
    }

    // 7. Attach piping to option labels
    if (mode === 'list') {
      q.options.forEach((o, j) => {
        const optHost = document.getElementById(`pipeHost-${i}-${j}-optlabel`);
        const optTarget = document.getElementById(`optLabel-${i}-${j}`);
        if (optHost && optTarget) {
          attachPipingUI({ host: optHost, targetEl: optTarget, contextQIndex: i });
        }
      });
    }

    // 8. Attach piping to tab plan instructions
    const instrHost = document.getElementById(`pipeHost-${i}-instr`);
    const instrTarget = document.getElementById(`tabplan-instr-${i}`);
    if (instrHost && instrTarget) {
      attachPipingUI({ host: instrHost, targetEl: instrTarget, contextQIndex: i });
    }

    // 9. Final post-render wiring
    drawBaseBuilder(i);
    renderNetPreviews(i);
    document.getElementById(`addNetBtn-${i}`)?.addEventListener('click', () => {
        if (isNumericQuestion(q)) { openRangeNetEditor(i); }
        else { openCodesNetEditor(i); }
    });

    panel.querySelectorAll('[data-tab]').forEach(tabBtn => {
      tabBtn.onclick = () => setActiveTab(tabBtn.dataset.tab);
    });

    const questionIndex = ui_state.active_question_index;
    if (questionIndex !== null && state.questions[questionIndex]?.conditions?.mode !== 'none') {
      renderConditionRules(questionIndex);
    }

    renderQuestionPreview();
}

function onOptionClick(q, opt){
  const isMulti = (getListSelection(q) === 'multi');

  if(isMulti && opt.exclusive){
    q.answer = [opt.code];                      // clear others
  }else if(isMulti){
    const a = Array.isArray(q.answer) ? q.answer.slice() : [];
    const ix = a.indexOf(opt.code);
    if(ix === -1) a.push(opt.code); else a.splice(ix,1);
    q.answer = a;
  }else{
    q.answer = opt.code;
  }
  if(opt.terminate){ state.disposition = "TERM_SCREEN"; }
  // re-render preview if needed
  renderPreview?.();
}

/* -------- Small editor helpers (hardened) -------- */

let mockNumericResponses = {}; // Store mock responses for real-time validation

function updateNumericResponse(fieldId, value) {
  mockNumericResponses[fieldId] = value;
  renderEditorPanel(); // Re-render to update the validation message
}

function setActiveTab(tab){
  ui_state.active_question_index = ui_state.active_question_index ?? null;
  ui_state.active_tab = tab || 'main';
  renderEditorPanel();
}

function updateQ(i, k, v) {
  if (!state.questions[i]) return;
  const q = state.questions[i];
  q[k] = v;

  // NEW: Add this line to update the variation name
  q.table_variation = getTableVariationName(q);

  if (k === 'id' || k === 'text' || k === 'type' || k === 'mode') {
      const activeFilter = ui_state.active_prefield_tab === 'screener' ? 'screener' : 'main';
      renderQuestionList(activeFilter);
  }
  updatePipingPreview(i);
  queueAutosave();
}
function updatePipingPreview(questionIndex) {
  const previewEl = document.getElementById(`pipingPreview-${questionIndex}`);
  if (!previewEl) return;
  
  const q = state.questions[questionIndex];
  const mockResponses = buildMockResponses();
  const pipedText = parsePipedText(q.text || '', mockResponses);
  
  if (pipedText !== q.text && q.text?.includes('{')) {
    previewEl.innerHTML = `<strong>Preview:</strong> ${escapeHTML(pipedText)}`;
    previewEl.style.display = 'block';
  } else {
    previewEl.style.display = 'none';
  }
}

function updateBase(i, k, v){
  if (!state.questions[i]) return;
  if (!state.questions[i].base) state.questions[i].base = {};
  // empty string means "use default" → store null
  var val = (v == null ? '' : String(v)).trim();
  state.questions[i].base[k] = val === '' ? null : val;
  queueAutosave();
}

function updateScalePoints(i, val){
  if (!state.questions[i]) return;
  if (!state.questions[i].scale) state.questions[i].scale = {};
  state.questions[i].scale.points = val ? parseInt(val, 10) : null;
  queueAutosave();
}

function updateScaleLabels(i, txt){
  if (!state.questions[i]) return;
  if (!state.questions[i].scale) state.questions[i].scale = {};
  var labels = String(txt || '').split('|').map(function(s){ return s.trim(); }).filter(Boolean);
  state.questions[i].scale.labels = labels;
  queueAutosave();
}

function addOpt(i){
  if (!state.questions[i]) return;
  if (!state.questions[i].options) state.questions[i].options = [];
  state.questions[i].options.push({ code: state.questions[i].options.length + 1, label: "" });
  renderEditorPanel(); queueAutosave();
}

function delOpt(i, j){
  if (!state.questions[i] || !state.questions[i].options) return;
  state.questions[i].options.splice(j, 1);
  renderEditorPanel(); queueAutosave();
}

function updateOpt(i, j, k, v, num){
  if (!state.questions[i] || !state.questions[i].options || !state.questions[i].options[j]) return;
  if (num) {
    var s = String(v == null ? '' : v).trim();
    state.questions[i].options[j][k] = (s === '') ? '' : (isFinite(parseInt(s, 10)) ? parseInt(s, 10) : s);
  } else {
    state.questions[i].options[j][k] = v;
  }
  queueAutosave();
}

/**
 * Adds a preset option (e.g., "Other", "N/A") to a question.
 * @param {number} i The index of the question in state.questions.
 * @param {string} presetType The type of preset to add ('pna', 'other', 'na').
 */
function addPresetOption(i, presetType) {
  if (!state.questions[i]) return;
  if (!state.questions[i].options) state.questions[i].options = [];

  const q = state.questions[i];
  let newOption = {};

  // Find the next available numeric code, starting from a high number
  // to avoid conflicts with manually entered codes.
  let nextCode = 97;
  const existingCodes = new Set(q.options.map(o => parseInt(o.code, 10)).filter(c => !isNaN(c)));
  while (existingCodes.has(nextCode)) {
    nextCode++;
  }

  switch (presetType) {
    case 'pna':
      newOption = { code: nextCode, label: "Prefer not to say", exclusive: true };
      break;
    case 'other':
      newOption = { code: nextCode, label: "Other (please specify)", anchor: 'bottom' };
      break;
    case 'na':
      newOption = { code: nextCode, label: "N/A", exclusive: true };
      break;
    default:
      return; // Do nothing if preset is unknown
  }

  q.options.push(newOption);
  renderEditorPanel(); // Re-render the UI to show the new option
  queueAutosave();
}

function addStmt(i){
  if (!state.questions[i]) return;
  if (!state.questions[i].statements) state.questions[i].statements = [];
  state.questions[i].statements.push("");
  renderEditorPanel(); queueAutosave();
}

function delStmt(i, j){
  if (!state.questions[i] || !state.questions[i].statements) return;
  state.questions[i].statements.splice(j, 1);
  renderEditorPanel(); queueAutosave();
}

function updateStmt(i, j, v){
  if (!state.questions[i] || !state.questions[i].statements) return;
  state.questions[i].statements[j] = v;
  queueAutosave();
}

function bulkAddOptions(i){
  if (!state.questions[i]) return;
  var txt = prompt("Paste options (one per line). Use 'code\\tlabel', 'code label', '1) label', or just 'label'.");
  if (!txt) return;

  if (!state.questions[i].options) state.questions[i].options = [];
  var lines = txt.split(/\r?\n/).map(function(s){ return s.trim(); }).filter(Boolean);

  // Next code = 1 + current max numeric code (more reliable than .at(-1))
  var currentCodes = state.questions[i].options.map(function(o){ return o && isFinite(o.code) ? Number(o.code) : 0; });
  var maxCode = currentCodes.length ? Math.max.apply(null, currentCodes) : 0;
  var nextCode = isFinite(maxCode) ? (maxCode + 1) : (state.questions[i].options.length + 1);

  lines.forEach(function(line){
    var m = line.match(/^(\d+)[\s\.\-\t\)]\s*(.+)$/);
    if (m) {
      state.questions[i].options.push({ code: parseInt(m[1], 10), label: m[2].trim() });
    } else {
      var parts = line.split(/\t/);
      if (parts.length >= 2 && /^\d+$/.test(parts[0])) {
        state.questions[i].options.push({ code: parseInt(parts[0], 10), label: parts.slice(1).join(" ").trim() });
      } else {
        state.questions[i].options.push({ code: nextCode++, label: line });
      }
    }
  });

  renderEditorPanel(); queueAutosave();
}

function bulkAddStatements(i){
  if (!state.questions[i]) return;
  var txt = prompt("Paste statements (one per line).");
  if (!txt) return;
  if (!state.questions[i].statements) state.questions[i].statements = [];
  state.questions[i].statements.push.apply(
    state.questions[i].statements,
    txt.split(/\r?\n/).map(function(s){ return s.trim(); }).filter(Boolean)
  );
  renderEditorPanel(); queueAutosave();
}

function populatePriorOpts(i){
  var priorQSel = document.querySelector('#priorQ-' + i);
  var optSel    = document.querySelector('#priorOpt-' + i);
  if (!priorQSel || !optSel) return;

  var priorQId = priorQSel.value;
  var qq = state.questions.find(function(x){ return x.id === priorQId; });
  var opts = (qq && qq.options) ? qq.options : [];

  optSel.innerHTML = '<option value="">Pick Opt</option>' +
    opts.map(function(o){
      var lbl = escapeHTML(o && o.label ? o.label : '');
      return '<option value="' + (o && o.code != null ? o.code : '') + '">' +
             (o && o.code != null ? o.code : '') + ': ' + lbl + '</option>';
    }).join('');
}

function applyBase(i){
  var qSel = document.querySelector('#priorQ-' + i);
  var oSel = document.querySelector('#priorOpt-' + i);
  if (!qSel || !oSel) return;

  var pq = qSel.value;
  var po = oSel.value;
  if (!pq || !po) return;

  var newCondition = pq + ' in [' + po + ']';
  var existingDef = (state.questions[i].base && state.questions[i].base.definition) ? state.questions[i].base.definition : '';
  var finalDef = existingDef ? (existingDef + ' AND ' + newCondition) : newCondition;

  updateBase(i, 'definition', finalDef);
  renderEditorPanel(); // reflect change
}

function nextNumber(prefix){
  var n = 1;
  while (state.questions.some(function(q){ return q.id === (prefix + n); })) n++;
  return n;
}

function addQuestion(prefix){
  var id;
  if (prefix === 'S'){
    id = 'S' + nextNumber('S');
    state.questions.push({ id: id, type: 'single', text: '', options: [] });
    ui_state.active_prefield_tab = 'screener'; // Switch to screener tab
  } else if (prefix === 'Q'){
    id = 'Q' + nextNumber('Q');
    state.questions.push({ id: id, type: 'single', text: '', options: [] });
    ui_state.active_prefield_tab = 'main'; // Switch to main tab
  } else if (prefix === 'H'){
    id = 'Q' + nextNumber('Q') + '_H';
    state.questions.push({ id: id, type: 'single', text: '', notes: 'Hidden question', options: [] });
    ui_state.active_prefield_tab = 'main'; // Switch to main tab
  } else if (prefix === 'R'){
    id = 'Q' + nextNumber('Q') + '_R';
    state.questions.push({ id: id, type: 'single', text: '', notes: 'Red herring', options: [] });
    ui_state.active_prefield_tab = 'main'; // Switch to main tab
  }
  ui_state.active_question_index = state.questions.length - 1;
    const activeFilter = (ui_state.active_prefield_tab === 'screener') ? 'screener' : 'main';
    renderQuestionList(activeFilter);
    renderEditorPanel();
    queueAutosave();
}


function delQ(i){
  if (!state.questions[i]) return;
  if (!confirm('Delete ' + state.questions[i].id + '?')) return;
  state.questions.splice(i, 1);
  ui_state.active_question_index = Math.min(i, state.questions.length - 1);
  if (state.questions.length === 0) ui_state.active_question_index = null;
  const activeFilter = ui_state.active_prefield_tab === 'screener' ? 'screener' : 'main';
  renderQuestionList(activeFilter);
  renderEditorPanel();
  queueAutosave();
}

function dupQ(i){
  if (!state.questions[i]) return;
  var copy = JSON.parse(JSON.stringify(state.questions[i]));
  var pref = (copy.id && copy.id.startsWith('S')) ? 'S' : 'Q';
  var m = copy.id && copy.id.match(/_([HR])$/);
  var suffix = m ? m[0] : '';
  copy.id = pref + nextNumber(pref) + suffix;
  state.questions.splice(i + 1, 0, copy);
  ui_state.active_question_index = i + 1;
  const activeFilter = ui_state.active_prefield_tab === 'screener' ? 'screener' : 'main';
  renderQuestionList(activeFilter);
  renderEditorPanel();
  queueAutosave();
}

function deleteNet(i, netIndex) {
  const q = state.questions[i];
  if (!q || !q.tab || !q.tab.nets) return;
  
  if (confirm('Are you sure you want to delete this net?')) {
    q.tab.nets.splice(netIndex, 1);
    renderEditorPanel(); // Re-render to show the change
    queueAutosave();
  }
}

function renderNetPreviews(i) {
  const q = state.questions[i];
  const host = document.getElementById(`netsPreviewHost-${i}`);
  if (!host) return;

  const nets = q.tab?.nets || [];
  if (!nets.length) {
    host.innerHTML = `<div class="muted">No nets defined yet.</div>`;
    return;
  }

  host.innerHTML = nets.map((net, index) => {
    let summaryText = '';
    
    if (net.kind === 'codes') {
      const labels = net.codes.map(code => getOptionLabel(q.id, code) || `Code ${code}`).join(', ');
      summaryText = `<b>Net:</b> ${escapeHTML(labels)}`;
    } 
    else if (net.kind === 'range') {
      // NEW logic to handle different operators
      switch (net.operator) {
        case '+':
          summaryText = `<b>Net:</b> ${net.value1}+`;
          break;
        case '>':
          summaryText = `<b>Net:</b> > ${net.value1}`;
          break;
        case '>=':
          summaryText = `<b>Net:</b> ≥ ${net.value1}`;
          break;
        case '<':
          summaryText = `<b>Net:</b> < ${net.value1}`;
          break;
        case '<=':
          summaryText = `<b>Net:</b> ≤ ${net.value1}`;
          break;
        case 'exact':
          summaryText = `<b>Net:</b> ${net.value1} (exact)`;
          break;
        case '-':
        default: // Default to the standard min-max range
          summaryText = `<b>Net:</b> ${net.value1} - ${net.value2}`;
          break;
      }
    }
    
    const netLabel = net.label ? `<span class="muted" style="margin-left: auto;">- ${escapeHTML(net.label)}</span>` : '';

    return `
      <div class="stack" style="padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; width: 100%; justify-content: space-between;">
        <div class="stack" style="flex-grow: 1; justify-content: flex-start; gap: 12px;">
          <span>${summaryText}</span>
          ${netLabel}
        </div>
        <div class="stack">
          <button class="btn" onclick="editNet(${i}, ${index})">Edit</button>
          <button class="btn danger" onclick="deleteNet(${i}, ${index})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function editNet(i, netIndex) {
  const q = state.questions[i];
  const net = q.tab.nets[netIndex];
  
  if (net.kind === 'range' || isNumericQuestion(q)) {
    openRangeNetEditor(i, netIndex);
  } else {
    openCodesNetEditor(i, netIndex);
  }
}

function openCodesNetEditor(i, netIndex = null) {
  const q = state.questions[i];
  const isEditing = netIndex !== null;
  const net = isEditing ? q.tab.nets[netIndex] : { label: '', codes: [] }; // Default for new net

  const options = getQuestionOptions(q);
  const selectedCodes = new Set(net.codes.map(String));

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-panel" onclick="event.stopPropagation()">
      <div class="modal-header"><h3>${isEditing ? 'Edit Codes Net' : 'Add Codes Net'}</h3><button class="icon-btn" id="netClose">✕</button></div>
      <div class="modal-body">
        <label>
          <span>Net Label (Optional, e.g., "Manufacturer 1")</span>
          <input id="netLabel" type="text" value="${escapeHTML(net.label || '')}" />
        </label>
        <div>
          <span>Select Options to Include in Net</span>
          <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--line); border-radius: 8px; padding: 8px; margin-top: 4px;">
            ${options.map(o => `
              <label class="stack">
                <input type="checkbox" class="net-opt-cb" value="${o.code}" ${selectedCodes.has(o.code) ? 'checked' : ''}/>
                ${escapeHTML(o.label)} <span class="muted">(${o.code})</span>
              </label>`).join('') || '<div class="muted">This question has no options to select.</div>'}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn ghost" id="netCancel">Cancel</button>
        <button class="btn primary" id="netSave">Save Net</button>
      </div>
    </div>
    <div class="modal-backdrop"></div>
  `;
  document.body.appendChild(modal);
  const closeModal = () => modal.remove();
  modal.querySelector('#netCancel').onclick = closeModal;
  modal.querySelector('.modal-backdrop').onclick = closeModal;

  modal.querySelector('#netSave').onclick = () => {
    const newLabel = modal.querySelector('#netLabel').value.trim() || null;
    const newCodes = Array.from(modal.querySelectorAll('.net-opt-cb:checked')).map(cb => cb.value);

    if (newCodes.length === 0) {
      alert('Please select at least one option.');
      return;
    }

    const newNet = createCodesNet({ label: newLabel, codes: newCodes });

    if (isEditing) {
      q.tab.nets[netIndex] = newNet;
    } else {
      q.tab.nets.push(newNet);
    }

    closeModal();
    renderEditorPanel();
    queueAutosave();
  };
}

function openRangeNetEditor(i, netIndex = null) {
  const q = state.questions[i];
  const isEditing = netIndex !== null;
  // Set defaults for a new net or use existing net data
  const net = isEditing ? q.tab.nets[netIndex] : { operator: '-', value1: '', value2: '' };

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-panel" style="width: min(500px, 92vw);" onclick="event.stopPropagation()">
      <div class="modal-header"><h3>${isEditing ? 'Edit Numeric Net' : 'Add Numeric Net'}</h3><button class="icon-btn" id="netClose">✕</button></div>
      <div class="modal-body">
        <label>
          <span>Net Label (Optional, e.g., "Ages 18-34")</span>
          <input id="netLabel" type="text" value="${escapeHTML(net.label || '')}" />
        </label>
        <div class="stack" style="gap: 10px; align-items: center; justify-content: center; margin-top: 16px;">
          <input id="netValue1" type="number" placeholder="Value" value="${net.value1 ?? ''}" style="width: 120px;" />
          
          <select id="netOperator" style="width: 60px;">
            <option value="-" ${net.operator === '-' ? 'selected' : ''}>-</option>
            <option value="exact" ${net.operator === 'exact' ? 'selected' : ''}>(exact)</option>
            <option value="+" ${net.operator === '+' ? 'selected' : ''}>+</option>
            <option value="<" ${net.operator === '<' ? 'selected' : ''}><</option>
            <option value=">" ${net.operator === '>' ? 'selected' : ''}>></option>
            <option value="<=" ${net.operator === '<=' ? 'selected' : ''}>≤</option>
            <option value=">=" ${net.operator === '>=' ? 'selected' : ''}>≥</option>
          </select>

          <input id="netValue2" type="number" placeholder="Max" value="${net.value2 ?? ''}" style="width: 120px;" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn ghost" id="netCancel">Cancel</button>
        <button class="btn primary" id="netSave">Save Net</button>
      </div>
    </div>
    <div class="modal-backdrop"></div>
  `;
  document.body.appendChild(modal);

  const value1Input = modal.querySelector('#netValue1');
  const value2Input = modal.querySelector('#netValue2');
  const operatorSelect = modal.querySelector('#netOperator');

  // Function to toggle the second input box
  const toggleSecondInput = () => {
    // Only show the second input for the standard range operator '-'
    const show = operatorSelect.value === '-';
    value2Input.style.display = show ? '' : 'none';
  };

  // Set initial visibility and add event listener
  toggleSecondInput();
  operatorSelect.addEventListener('change', toggleSecondInput);

  const closeModal = () => modal.remove();
  modal.querySelector('#netClose').onclick = closeModal;
  modal.querySelector('#netCancel').onclick = closeModal;
  modal.querySelector('.modal-backdrop').onclick = closeModal;

  modal.querySelector('#netSave').onclick = () => {
    const newLabel = modal.querySelector('#netLabel').value.trim() || null;
    const operator = operatorSelect.value;
    const val1 = value1Input.value;
    const val2 = value2Input.value;

    if (val1 === '') {
      alert('Please enter at least one value.');
      return;
    }
    if (operator === '-' && val2 === '') {
      alert('Please enter both a minimum and maximum value for a range.');
      return;
    }
    
    // Create the new net object based on the operator
    const newNet = {
      kind: 'range', // Still a range kind, just more complex
      label: newLabel,
      operator: operator,
      value1: Number(val1),
      value2: operator === '-' ? Number(val2) : null
    };

    if (isEditing) {
      q.tab.nets[netIndex] = newNet;
    } else {
      q.tab.nets.push(newNet);
    }

    closeModal();
    renderEditorPanel();
    queueAutosave();
  };
}

function wireEditorShortcuts(){
  document.onkeydown = function(e){
    // Don't interfere if an input, textarea, or select is focused
    if (e.target.matches('input, textarea, select')) {
      return;
    }

    var i = (ui_state.active_question_index == null) ? -1 : ui_state.active_question_index;
    if (e.ctrlKey || e.metaKey){
      if (e.key.toLowerCase() === 's'){ e.preventDefault(); downloadJSON(); }
      if (e.key.toLowerCase() === 'd'){ e.preventDefault(); if (i >= 0) dupQ(i); }
    } else {
      if (e.key === 'ArrowUp'   && i > 0){
        ui_state.active_question_index = i - 1;
        const activeFilter = ui_state.active_prefield_tab === 'screener' ? 'screener' : 'main';
        renderQuestionList(activeFilter);
        renderEditorPanel();
      }
      if (e.key === 'ArrowDown' && i < state.questions.length - 1){
        ui_state.active_question_index = i + 1;
        const activeFilter = ui_state.active_prefield_tab === 'screener' ? 'screener' : 'main';
        renderQuestionList(activeFilter);
        renderEditorPanel();
      }
      if (e.key === 'Enter'     && i < 0 && state.questions.length){
        ui_state.active_question_index = 0;
        renderEditorPanel();
      }
    }
  };
}

/* ===== STEP 2: editor helpers ===== */
function updateOption(qIndex, optIndex, key, val){
  const q = state.questions[qIndex];
  if(!q?.options?.[optIndex]) return;
  q.options[optIndex][key] = val;
  // if your project uses updateOpt/updateQ, keep calling them elsewhere;
  // this helper just centralizes autosave + re-render
  queueAutosave?.();
  renderEditorPanel?.();
}

// alias to your existing updateQ if you have it
function updateQuestion(i, key, val){
  const q = state.questions[i];
  if(!q) return;
  q[key] = val;
  queueAutosave?.();
  renderEditorPanel?.();
}

function randomizedOptions(q){
  const opts = (q.options||[]).map((o, idx) => ({...o, _idx: idx}));
  if(q.randomization?.mode !== 'shuffle') return opts;

  const topAnchors    = opts.filter(o => o.anchor === 'top');
  const bottomAnchors = opts.filter(o => o.anchor === 'bottom');
  const locked        = opts.filter(o => o.lock_randomize && !o.anchor);
  const pool          = opts.filter(o => !o.anchor && !o.lock_randomize);

  for(let i = pool.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [...topAnchors, ...locked, ...pool, ...bottomAnchors];
}



/* ====== Multi-clause Base Builder ====== */
// Ensure a builder for question i exists with at least one empty clause
function bbEnsure(i){
    ui_state.base_builders = ui_state.base_builders || {};
    const currentDefinition = state.questions[i]?.base?.definition || '';
    
    // Always re-parse the definitive source of truth
    ui_state.base_builders[i] = bbParseDefinition(currentDefinition);

    return ui_state.base_builders[i];
}

function bbParseDefinition(def = "") {
    const clauses = [];
    // Regex to find all clauses like (QID in [CODE]), optionally led by AND/OR
    const regex = /(AND|OR)?\s*\((\w+)\s+in\s+\[(\w+)\]\)/g;
    
    let match;
    while ((match = regex.exec(def)) !== null) {
        clauses.push({
            op: match[1] || null, // The first clause won't have a leading operator
            qid: match[2],
            opt: match[3]
        });
    }

    // If parsing fails or the string is empty, return a single default clause
    if (clauses.length === 0) {
        return [{ op: null, qid: "", opt: "" }];
    }

    return clauses;
}

// Build "(Q in [x]) OP (Q2 in [y]) ..." string from the current clauses
function bbBuildExpr(i){
  var clauses = bbEnsure(i);
  var parts = [];
  for (var idx = 0; idx < clauses.length; idx++){
    var c = clauses[idx];
    if (!c || !c.qid || !c.opt) continue;
    var lit = '(' + c.qid + ' in [' + c.opt + '])';
    if (idx > 0 && c.op) parts.push(c.op);
    parts.push(lit);
  }
  return parts.join(' ');
}

function bbAddClause(i, op){
  var clauses = bbEnsure(i);
  clauses.push({ op: op || 'AND', qid: "", opt: "" });
  drawBaseBuilder(i);
}

function bbRemoveClause(i, idx){
  var clauses = bbEnsure(i);
  if (idx >= 0 && idx < clauses.length){
    clauses.splice(idx, 1);
    if (!clauses.length) clauses.push({ op: null, qid: "", opt: "" });
  }
  drawBaseBuilder(i);
}

function bbEnsure(i){
  ui_state.base_builders = ui_state.base_builders || {};
  
  // FIX: Only parse from the main state if the temporary builder state doesn't exist yet for this question.
  if (!ui_state.base_builders[i]) {
      const currentDefinition = state.questions[i]?.base?.definition || '';
      ui_state.base_builders[i] = bbParseDefinition(currentDefinition);
  }
  
  return ui_state.base_builders[i];
}

function bbApply(i){
  var expr = bbBuildExpr(i);
  if (!expr) return;
  updateBase(i, 'definition', expr);
  var baseInput = document.getElementById('baseDef-' + i);
  if (baseInput) baseInput.value = expr;
  drawBaseBuilder(i);
}

// Draw the rows (one per clause) with AND/OR + Pick Q + Pick Opt
function drawBaseBuilder(i){
  var host = document.getElementById('bbHost-' + i);
  var prev = document.getElementById('bbPrev-' + i);
  if (!host) return;

  var clauses = bbEnsure(i);

  // Build list of prior question ids (only those indexed before i)
  var prior = state.questions.filter(function(_, j){ return j < i; });

  var html = clauses.map(function(c, idx){
    // Build Q options
    var qOpts = ['<option value="">Pick Q</option>']
      .concat(prior.map(function(qq){
        var sel = (qq.id === c.qid) ? ' selected' : '';
        return '<option value="'+ qq.id +'"' + sel + '>'+ qq.id +'</option>';
      })).join('');

    // Build Opt options based on chosen qid
    var chosen = prior.find(function(qq){ return qq.id === c.qid; });
    var opts = (chosen && chosen.options) ? chosen.options : [];
    var oOpts = ['<option value="">Pick option</option>']
      .concat(opts.map(function(o){
        var code = (o && o.code != null) ? o.code : '';
        var sel  = (String(code) === String(c.opt)) ? ' selected' : '';
        var lbl  = escapeHTML(o && o.label ? o.label : '');
        return '<option value="'+ code +'"' + sel + '>'+ code +': '+ lbl +'</option>';
      }))
      .join('');

    // Leading connector (not shown for first row)
    var opSel = (idx === 0)
      ? '<span class="muted" style="min-width:42px; display:inline-block;"></span>'
      : '<select style="min-width:70px" onchange="bbSet('+ i +','+ idx +',\'op\', this.value)">' +
          '<option value="AND"'+ (c.op==='AND'?' selected':'') +'>AND</option>' +
          '<option value="OR"'+  (c.op==='OR' ?' selected':'') +'>OR</option>' +
        '</select>';

    // Row UI
    return '' +
    '<div class="stack" style="gap:8px; align-items:center; width:100%;">' +
      opSel +
      '<select style="flex:1" onchange="bbSet('+ i +','+ idx +',\'qid\', this.value)">'+ qOpts +'</select>' +
      '<select style="flex:1" onchange="bbSet('+ i +','+ idx +',\'opt\', this.value)">'+ oOpts +'</select>' +
      (idx === clauses.length - 1
        ? '<button title="Add clause" onclick="bbAddClause('+ i +', \'AND\')">＋</button>'
        : '<button title="Remove clause" onclick="bbRemoveClause('+ i +','+ idx +')">🗑️</button>') +
    '</div>';
  }).join('');

  host.innerHTML = html;
  if (prev) prev.textContent = bbBuildExpr(i) ? ('Preview: ' + bbBuildExpr(i)) : '';
}

/* =========================================================
   LIBRARY
   ========================================================= */
function getLibrary(){ try{ return JSON.parse(localStorage.getItem(LIB_KEY)||'{}'); } catch{ return {}; } }
function saveLibrary(lib){ localStorage.setItem(LIB_KEY, JSON.stringify(lib)); }
function saveQuestionToLibrary(i){
  const q   = JSON.parse(JSON.stringify(state.questions[i]));
  const key = state.project.client || '_global';
  const lib = getLibrary();
  (lib[key] ||= []).push({ saved_at:new Date().toISOString(), project_id: state.project.id, q });
  saveLibrary(lib);
  alert('Saved to library.');
}
function renderLibrary(root){
  const lib      = getLibrary();
  const clients  = Object.keys(lib).sort();
  root.innerHTML = `
    <section class="app-grid" style="grid-template-columns: 1fr;">
      <div class="card">
        <div class="card-header">
          <strong>Question Library</strong>
          <div class="stack">
            <select id="libClient"></select>
            <button id="libInsert">Insert into current project</button>
            <button id="libDel">Delete selected</button>
          </div>
        </div>
        <div class="card-content"><div class="grid" id="libGrid"></div></div>
      </div>
    </section>`;

  const sel = $('#libClient');
  sel.innerHTML = clients.map(c=>`<option value="${c}">${c}</option>`).join('') || '<option value="_global">_global</option>';
  const grid = $('#libGrid');

  const draw = ()=>{
    const key   = sel.value || clients[0] || '_global';
    const items = lib[key]||[];
    grid.innerHTML = items.map((it,idx)=>`
      <label class="card" style="padding:10px; display:block;">
        <input type="radio" name="libpick" value="${idx}"/>
        <strong>${escapeHTML(it.q.id)} • ${escapeHTML(it.q.type)}</strong>
        <div class="meta">${escapeHTML((it.q.text||'').slice(0,120))}</div>
        <div class="meta">Saved ${new Date(it.saved_at).toLocaleString()}</div>
      </label>
    `).join('') || '<div class="muted">No saved items for this client.</div>';
  };

  sel.onchange = draw;
  draw();

  $('#libInsert').onclick = ()=>{
    const key = sel.value || clients[0] || '_global';
    const idx = +(document.querySelector('input[name="libpick"]:checked')?.value ?? -1);
    if(idx<0) return alert('Pick one');
    const q = JSON.parse(JSON.stringify((lib[key]||[])[idx].q));
    const pref = q.id.startsWith('S') ? 'S':'Q';
    q.id = `${pref}${nextNumber(pref)}`;
    state.questions.push(q);
    ui_state.active_question_index = state.questions.length-1;
    autosaveNow();
    location.hash = '#/editor';
  };

  $('#libDel').onclick = ()=>{
    const key = sel.value || clients[0] || '_global';
    const idx = +(document.querySelector('input[name="libpick"]:checked')?.value ?? -1);
    if(idx<0) return;
    (lib[key]||[]).splice(idx,1);
    saveLibrary(lib);
    draw();
  };
}

/* =========================================================
   RULES (defensive defaults + UI)
   ========================================================= */

const RULES_DEFAULTS = {
  likert:   { single: true,  dual: true,  multi: true  },
  screener: { noNetsOnTerminate: true },
  nets:     { ageMaxInference:  true, hoursDefaultBands: true },
  numeric:  {
    // seconds|minutes|hours|days|weeks|months|years|count|other
    default_unit: "years",
    default_decimals: false,
    default_min: null,
    default_max: null
  }
};

/** Deep fill: ensures state.globals.rules exists and has every leaf. */
function ensureRules(){
  const tgt = (state.globals.rules ||= {});
  const src = RULES_DEFAULTS;

  // leaf-by-leaf merge (avoids clobbering user values)
  tgt.likert   = Object.assign({}, src.likert,   tgt.likert);
  tgt.screener = Object.assign({}, src.screener, tgt.screener);
  tgt.nets     = Object.assign({}, src.nets,     tgt.nets);
  tgt.numeric  = Object.assign({}, src.numeric,  tgt.numeric);

  return tgt;
}

/** Rules screen */
function renderRules(root){
  const r = ensureRules();

  root.innerHTML = `
    <section class="app-grid" style="grid-template-columns: 1fr;">
      <div class="card">
        <div class="card-header"><strong>Rules & Nets Studio</strong></div>
        <div class="card-content">

          <div class="row">
            <div class="k">Likert presets</div>
            <div class="stack">
              <label><input type="checkbox" id="rLikS" ${r.likert.single?'checked':''}/> single → Net: T2B, B2B</label>
              <label><input type="checkbox" id="rLikD" ${r.likert.dual?'checked':''}/> dual → Net: T2B, B2B</label>
              <label><input type="checkbox" id="rLikM" ${r.likert.multi?'checked':''}/> ≥3 stmts → add Q5 summaries</label>
            </div>
          </div>

          <div class="row">
            <div class="k">Screener</div>
            <div class="stack">
              <label><input type="checkbox" id="rScr" ${r.screener.noNetsOnTerminate?'checked':''}/> no nets on terminate options</label>
            </div>
          </div>

          <div class="row">
            <div class="k">Nets engine</div>
            <div class="stack">
              <label><input type="checkbox" id="rAge" ${r.nets.ageMaxInference?'checked':''}/> infer max age from S3</label>
              <label><input type="checkbox" id="rHours" ${r.nets.hoursDefaultBands?'checked':''}/> default hours bands</label>
            </div>
          </div>

          <div class="row">
            <div class="k">Numeric defaults</div>
            <div class="stack" style="align-items:flex-end">
              <label>Unit
                <select id="rNumUnit" style="min-width:160px">
                  ${["years","months","weeks","days","hours","minutes","seconds","count","other"]
                    .map(u=>`<option ${r.numeric.default_unit===u?'selected':''}>${u}</option>`).join("")}
                </select>
              </label>
              <label><input type="checkbox" id="rNumDec" ${r.numeric.default_decimals?'checked':''}/> allow decimals</label>
              <label>Min <input id="rNumMin" type="number" step="any" value="${r.numeric.default_min ?? ''}" placeholder="(none)" style="width:120px"/></label>
              <label>Max <input id="rNumMax" type="number" step="any" value="${r.numeric.default_max ?? ''}" placeholder="(none)" style="width:120px"/></label>
            </div>
          </div>

          <div class="stack"><button id="saveRules" class="primary">Save</button></div>
        </div>
      </div>
    </section>`;

  // Save & autosave
  $('#saveRules').onclick = ()=>{
    const rr = ensureRules(); // ensure structure still intact

    rr.likert.single = $('#rLikS').checked;
    rr.likert.dual   = $('#rLikD').checked;
    rr.likert.multi  = $('#rLikM').checked;

    rr.screener.noNetsOnTerminate = $('#rScr').checked;

    rr.nets.ageMaxInference   = $('#rAge').checked;
    rr.nets.hoursDefaultBands = $('#rHours').checked;

    rr.numeric.default_unit     = $('#rNumUnit').value;
    rr.numeric.default_decimals = $('#rNumDec').checked;

    const minV = $('#rNumMin').value, maxV = $('#rNumMax').value;
    rr.numeric.default_min = (minV==='' ? null : Number(minV));
    rr.numeric.default_max = (maxV==='' ? null : Number(maxV));

    queueAutosave();
    setStatus('Rules saved.', true);
    alert('Saved');
  };
}

/* =========================================================
   VALIDATOR
   ========================================================= */
function validateProject(){
  const issues = [];

  // 0) mode sanity (expect list|numeric|table)
  state.questions.forEach(q=>{
    if(q.mode && !['list','numeric','table','open'].includes(q.mode)){
      issues.push(["red", `${q.id}: invalid mode "${q.mode}" (must be list | numeric | table | open)`]);
    }
  });

  // 1) codes & labels
  state.questions.forEach((q)=>{
    const codes  = (q.options||[]).map(o=>o.code).filter(v=>v!==undefined && v!==null && v!=='');
    const labels = (q.options||[]).map(o=>o.label||'');
    const dup    = codes.filter((v,i,a)=> a.indexOf(v)!==i);
    if(dup.length) issues.push(["red", `${q.id}: duplicate codes ${[...new Set(dup)].join(', ')}`]);
    if(codes.length){
      const sorted=[...codes].sort((a,b)=>a-b);
      for(let i=1;i<sorted.length;i++){
        if(sorted[i]-sorted[i-1]>1){ issues.push(["amber", `${q.id}: code gap between ${sorted[i-1]} and ${sorted[i]}`]); break; }
      }
    }
    labels.forEach((l,li)=>{ if(!String(l).trim()) issues.push(["red", `${q.id}: option ${li+1} missing label`]); });
  });

  // 1b) numeric config
  const validUnits = new Set(["seconds","minutes","hours","days","weeks","months","years","count","other",""]);
  state.questions.forEach(q=>{
    const isNumeric = q.mode==='numeric' || (q.type||'').startsWith('numeric');
    if(!isNumeric) return;
    const n = q.numeric || {};
    if(n.unit && !validUnits.has(n.unit)) issues.push(["red", `${q.id}: invalid numeric unit "${n.unit}"`]);
    if(n.min!=null && n.max!=null && Number(n.min) > Number(n.max)) issues.push(["red", `${q.id}: numeric min > max`]);
    if(n.placeholder && typeof n.placeholder !== 'string') issues.push(["amber", `${q.id}: numeric placeholder should be text`]);
  });

  // 1c) open-end config
  state.questions.forEach(q=>{
    if(q.mode === 'open'){
      const k = q.open?.limit_kind;
      if (k && !['words','characters','sentences'].includes(k)){
        issues.push(['amber', `${q.id}: invalid open limit kind "${k}"`]);
      }
      const {min, max} = q.open || {};
      if (min!=null && max!=null && Number(min) > Number(max)){
        issues.push(['amber', `${q.id}: open min > max`]);
      }
    }
  });


  // 2) bases referencing future questions
  state.questions.forEach((q,qi)=>{
    const def = q.base?.definition||'';
    const m = def.match(/^(S\d+|Q\d+)[^\d]*\[(\d+)\]/i);
    if(m){
      const refId  = m[1];
      const refIdx = state.questions.findIndex(x=>x.id===refId);
      if(refIdx>qi) issues.push(["red", `${q.id}: base references future question ${refId}`]);
    }
  });

  // 3) likert mismatches
  state.questions.forEach(q=>{
    if(q.scale?.points && q.scale.labels && q.scale.labels.length && q.scale.labels.length !== q.scale.points){
      issues.push(["amber", `${q.id}: ${q.scale.points}pt but ${q.scale.labels.length} labels`]);
    }
  });

  // 4) terminate included in nets
  state.questions.forEach(q=>{
    const hasTerm = (q.options||[]).some(o=>o.terminate);
    if(hasTerm && (q.exports?.tab_plan?.nets_text||'').trim()){
      issues.push(["amber", `${q.id}: has terminate options but nets text present`]);
    }
  });

  return issues;
}
function renderValidator(root){
  const issues = validateProject();
  root.innerHTML = `
    <section class="app-grid" style="grid-template-columns: 1fr;">
      <div class="card">
        <div class="card-header">
          <strong>Validator</strong>
          <div class="pill">${issues.length? issues.length+" issues" : "All checks passed"}</div>
        </div>
        <div class="card-content">
          ${
            issues.length
              ? issues.map(([sev,msg])=>`<div class="stack"><span class="pill" style="${sev==='red'?'background:#fee2e2;':''}${sev==='amber'?'background:#fef9c3;':''}">${sev.toUpperCase()}</span><span>${escapeHTML(msg)}</span></div>`).join('')
              : '<div class="ok">No blocking issues detected.</div>'
          }
          <div class="stack" style="margin-top:12px;"><button onclick="location.hash='#/editor'">Go to Editor</button></div>
        </div>
      </div>
    </section>`;
}

/* =========================================================
   Preview
   ========================================================= */
function renderPreview() {
  // You can customize this part based on how you want the preview rendered
  const previewContainer = document.getElementById("view-root");

  // Clear any existing content in the preview container
  previewContainer.innerHTML = "";

  // Example content for the preview (you can replace this with your actual preview content)
  const previewContent = `
    <div class="pv-wrap">
      <h2 class="pv-header">Project Preview</h2>
      <div class="pv-sub">This is a preview of the current project</div>
      <div class="pv-sec">
        <h3>Preview Section 1</h3>
        <p>Details about the first section of your project.</p>
      </div>
      <div class="pv-sec">
        <h3>Preview Section 2</h3>
        <p>Details about the second section of your project.</p>
      </div>
    </div>
  `;
  
  previewContainer.innerHTML = previewContent;
}


/* =========================================================
   VERSIONS / SNAPSHOTS
   ========================================================= */
function getSnapshotsMap(){ try{ return JSON.parse(localStorage.getItem(SNAP_KEY)||'{}'); } catch{ return {}; } }
function saveSnapshotsMap(map){ localStorage.setItem(SNAP_KEY, JSON.stringify(map)); }
function snapshotCurrent(note=''){
  const map  = getSnapshotsMap();
  const pid  = state.project.id;
  const snap = {
    id: 'snap-' + Math.random().toString(16).slice(2,10),
    ts: new Date().toISOString(),
    note,
    project: JSON.parse(JSON.stringify(state))
  };
  (map[pid] ||= []).unshift(snap);
  saveSnapshotsMap(map);
  setStatus('Snapshot saved.', true);
  return snap;
}
function restoreSnapshot(id, byId){
  const snap = byId?.[id] || (getSnapshotsMap()[state.project.id]||[]).find(s=>s.id===id);
  if(!snap) return;
  if(!confirm('Restore this snapshot? Your current unsaved changes will be replaced.')) return;
  state.project   = snap.project.project;
  state.globals   = snap.project.globals;
  state.questions = snap.project.questions;
  autosaveNow();
  touchCurrentIntoProjects();
  location.hash = '#/editor';
}
function renderVersions(root){
  const map   = getSnapshotsMap();
  const pid   = state.project.id;
  const snaps = map[pid] || [];
  root.innerHTML = `
    <section class="app-grid" style="grid-template-columns: 1fr;">
      <div class="card">
        <div class="card-header">
          <strong>Versions & Diff</strong>
          <div class="stack">
            <input id="snapNote" placeholder="Snapshot note (optional)" style="width:240px"/>
            <button id="makeSnap" class="primary">📸 Snapshot</button>
          </div>
        </div>
        <div class="card-content">
          ${snaps.length ? `
            <div class="stack" style="flex-wrap:wrap;">
              <select id="snapA">${snaps.map(s=>`<option value="${s.id}">${new Date(s.ts).toLocaleString()} — ${escapeHTML(s.note||'')}</option>`).join('')}</select>
              <span>↔</span>
              <select id="snapB">${snaps.map(s=>`<option value="${s.id}">${new Date(s.ts).toLocaleString()} — ${escapeHTML(s.note||'')}</option>`).join('')}</select>
              <button id="doDiff">Compare</button>
              <button id="restoreA">Restore A</button>
              <button id="restoreB">Restore B</button>
              <button id="deleteA">Delete A</button>
            </div>
            <div id="diffOut" class="diff" style="margin-top:12px; white-space:pre-wrap;"></div>
          ` : `<div class="muted">No snapshots yet.</div>`}
        </div>
      </div>
    </section>`;

  $('#makeSnap').onclick = ()=>{
    snapshotCurrent($('#snapNote').value.trim());
    renderVersions(root);
  };
  if(!snaps.length) return;

  const byId = Object.fromEntries(snaps.map(s=>[s.id,s]));
  $('#doDiff').onclick    = ()=>{ const a = byId[$('#snapA').value]; const b = byId[$('#snapB').value]; if(!a||!b) return; $('#diffOut').innerHTML = prettyJsonDiff(a.project, b.project); };
  $('#restoreA').onclick  = ()=> restoreSnapshot($('#snapA').value, byId);
  $('#restoreB').onclick  = ()=> restoreSnapshot($('#snapB').value, byId);
  $('#deleteA').onclick   = ()=>{
    const id  = $('#snapA').value;
    const idx = snaps.findIndex(s=>s.id===id);
    if(idx>=0 && confirm('Delete snapshot A?')){
      snaps.splice(idx,1);
      saveSnapshotsMap(map);
      renderVersions(root);
    }
  };
}
/* Simple JSON diff (line-based) */
function prettyJsonDiff(a,b){
  const A = JSON.stringify(a, null, 2).split('\n');
  const B = JSON.stringify(b, null, 2).split('\n');
  const max = Math.max(A.length, B.length);
  const out = [];
  for(let i=0;i<max;i++){
    const l = A[i] ?? '', r = B[i] ?? '';
    if(l===r){ out.push(escapeHTML(l)); }
    else{ if(l) out.push('<del>− ' + escapeHTML(l) + '</del>'); if(r) out.push('<ins>+ ' + escapeHTML(r) + '</ins>'); }
  }
  return out.join('\n');
}

/* =========================================================
   IMPORT / EXPORT / GENERATE
   ========================================================= */
function postAndDownload(url, filename) {
  const data = {
    project: state.project,
    globals: state.globals,
    questions: state.questions
  };

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.blob();
  })
  .then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
    alert('An error occurred while exporting the file. Please check the console for more details.');
  });
}

function downloadJSON(){
  state.project.updated_at = new Date().toISOString();
  const data = JSON.stringify({ project: state.project, globals: state.globals, questions: state.questions }, null, 2);
  const blob = new Blob([data], {type:"application/json"});
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);
  a.download = `${(state.project.name||'project').replace(/[^\w\-]+/g,'_')}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* =========================================================
   AUTOSAVE
   ========================================================= */
async function autosaveNow() {
  try {
    if (!state.project?.id) {
      console.warn("No project to save");
      return;
    }

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

    // 2. Handle client reference (create/find client if needed)
    let clientId = null;
    if (state.project.client) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('name', state.project.client)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            organization_id: organizationId,
            name: state.project.client,
            contact_info: {},
            metadata: {}
          })
          .select()
          .single();
        
        if (clientError) throw clientError;
        clientId = newClient.id;
      }
    }

    // 3. Upsert the main project record
    const projectData = {
      id: state.project.id,
      organization_id: organizationId,
      client_id: clientId,
      name: state.project.name || 'Untitled',
      version: state.project.version || '0.1.0',
      status: state.project.status || 'Draft',
      project_type: state.project.project_type,
      notes: state.project.notes,
      tags: state.project.tags || [],
      favorite: state.project.favorite || false,
      metadata: {},
      updated_at: new Date().toISOString()
    };

    const { error: projectError } = await supabase
      .from('projects')
      .upsert(projectData);
    
    if (projectError) throw projectError;

    // 4. Handle people and project roles
    if (state.project.roles?.length) {
      // Delete existing roles first
      await supabase
        .from('project_roles')
        .delete()
        .eq('project_id', state.project.id);

      // Create/find people and insert roles
      for (const role of state.project.roles) {
        if (!role.person) continue;

        // Upsert person
        const { data: person, error: personError } = await supabase
          .from('people')
          .upsert({
            organization_id: organizationId,
            name: role.person,
            email: null,
            role: 'team_member'
            }, { onConflict: 'email' }
          ) 
          .select()
          .single();

        if (personError) throw personError;

        // Insert project role
        const { error: roleError } = await supabase
          .from('project_roles')
          .insert({
            project_id: state.project.id,
            person_id: person.id,
            role_name: role.role
          });

        if (roleError) throw roleError;
      }
    }

    // 5. Handle project dates
    if (state.project.important_dates?.length) {
      // Delete existing dates first
      await supabase
        .from('project_dates')
        .delete()
        .eq('project_id', state.project.id);

      for (const date of state.project.important_dates) {
        let personId = null;
        
        // Find person if assigned
        if (date.who) {
          const { data: person } = await supabase
            .from('people')
            .select('id')
            .eq('name', date.who)
            .eq('organization_id', organizationId)
            .single();
          
          personId = person?.id || null;
        }

        const { error: dateError } = await supabase
          .from('project_dates')
          .insert({
            id: date.id || uuid_generate_v4(), // Generate UUID if needed
            project_id: state.project.id,
            person_id: personId,
            event_name: date.what,
            due_date: date.when,
            status: date.status || 'Not Started',
            notes: date.notes
          });

        if (dateError) throw dateError;
      }
    }

    // 6. Handle project globals
    const { error: globalsError } = await supabase
      .from('project_globals')
      .upsert({
        project_id: state.project.id,
        default_base_verbiage: state.globals.default_base_verbiage || 'Total (qualified respondents)',
        default_base_definition: state.globals.default_base_definition,
        default_banners: state.globals.banners || [],
        scale_buckets: state.globals.scale_buckets || {},
        rules: state.globals.rules || {},
        banners: state.globals.banners || [],
        settings: {}
      }, {
        onConflict: 'project_id' // <-- ADD THIS OPTION
      });

    if (globalsError) throw globalsError;

    // 7. Handle questions and related data
    if (state.questions?.length) {
      // Delete existing questions and related data (cascade will handle options, etc.)
      await supabase
        .from('questions')
        .delete()
        .eq('project_id', state.project.id);

      for (let i = 0; i < state.questions.length; i++) {
        const q = state.questions[i];
        
        // Insert question
        const questionData = {
          id: q.uuid || uuid_generate_v4(), // Generate UUID if needed
          project_id: state.project.id,
          question_id: q.id, // Your S1, Q1 identifiers
          question_text: q.text,
          question_type: q.type || 'single',
          question_mode: q.mode || 'list',
          order_index: i,
          notes: q.notes,
          is_required: q.is_required !== false,
          
          // JSONB fields
          base: q.base || {},
          randomization: q.randomization || {},
          conditions: q.conditions || {},
          validation: q.validation || {},
          repeated_measures: q.repeated_measures || {},
          
          numeric_config: q.numeric || {},
          open_config: q.open || {},
          scale_config: q.scale || {},
          grid_config: q.grid || {},
          
          exports: q.exports || {},
          tab_plan: q.tab || {}
        };

        const { data: savedQuestion, error: questionError } = await supabase
          .from('questions')
          .insert(questionData)
          .select()
          .single();

        if (questionError) throw questionError;

        // Insert question options
        if (q.options?.length) {
          const optionsData = q.options.map((opt, index) => ({
            question_id: savedQuestion.id,
            option_code: String(opt.code || (index + 1)),
            option_label: opt.label || '',
            order_index: index,
            is_exclusive: opt.exclusive || false,
            is_terminate: opt.terminate || false,
            anchor_position: opt.anchor,
            lock_randomize: opt.lock_randomize || false,
            custom_code: opt.custom_code,
            custom_label: opt.custom_label,
            nested_dropdown: opt.nested_dropdown || {},
            validation_range: opt.validation_range || {}
          }));

          const { error: optionsError } = await supabase
            .from('question_options')
            .insert(optionsData);

          if (optionsError) throw optionsError;
        }

        // Insert question statements
        if (q.statements?.length) {
          const statementsData = q.statements.map((stmt, index) => ({
            question_id: savedQuestion.id,
            statement_text: stmt,
            order_index: index
          }));

          const { error: statementsError } = await supabase
            .from('question_statements')
            .insert(statementsData);

          if (statementsError) throw statementsError;
        }

        // Insert question nets
        if (q.tab?.nets?.length) {
          const netsData = q.tab.nets.map((net, index) => {
            let netConfig = {};
            let netType = '';

            if (net.kind === 'codes') {
              netType = 'codes';
              netConfig = { codes: net.codes || [] };
            } else if (net.kind === 'range') {
              netType = 'range';
              netConfig = {
                operator: net.operator || '-',
                value1: net.value1,
                value2: net.value2,
                min: net.min, // backward compatibility
                max: net.max   // backward compatibility
              };
            }

            return {
              question_id: savedQuestion.id,
              net_type: netType,
              net_label: net.label,
              net_config: netConfig,
              order_index: index
            };
          });

          const { error: netsError } = await supabase
            .from('question_nets')
            .insert(netsData);

          if (netsError) throw netsError;
        }
      }
    }

    setStatus("Saved to database.", true);
    
    // Also keep localStorage backup for offline capability
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
      project: state.project,
      globals: state.globals,
      questions: state.questions
    }));

  } catch (error) {
    console.error("Save failed:", error);
    setStatus(`Save failed: ${error.message}`, false);
    
    // Fallback to localStorage
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
        project: state.project,
        globals: state.globals,
        questions: state.questions
      }));
      setStatus("Saved locally (database unavailable)", false);
    } catch (localError) {
      setStatus("Save failed completely", false);
    }
  }
}

// Helper function to generate UUIDs (you'll need this)
function uuid_generate_v4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

let _asTimer=null;
function queueAutosave(){ clearTimeout(_asTimer); _asTimer=setTimeout(autosaveNow, 600); }
document.addEventListener("input",  queueAutosave, true);
document.addEventListener("change", queueAutosave, true);

function loadAutosave(){
  const s = localStorage.getItem(AUTOSAVE_KEY);
  if(!s) return false;
  const d = JSON.parse(s);
  state.project   = d.project   || state.project;
  state.globals   = d.globals   || state.globals;
  state.questions = d.questions || [];
  ensureRules();
  ui_state.active_question_index = state.questions.length? 0 : null;
  return true;
}

// ---------------- ROUTING TABLE + RENDERER (hardened) ----------------

// 1) Register pages
// Change it to this:
routes.clear?.(); // clean slate if a previous bundle populated it
routes.set('#/dashboard', renderSimpleDashboard);
routes.set('#/projects', renderProjectsManager);
routes.set('#/clients', renderClientsListPage);
routes.set('#/analytics', renderAnalyticsDashboard);

// simple stubs (wire later)
routes.set('#/library',   renderLibrary);
routes.set('#/rules',     renderRules);
routes.set('#/validator', renderValidator);
routes.set('#/versions',  renderVersions);

// 2) Helpers
// Replace your entire normalizeHash function with this one
function normalizeHash(h) {
  const hash = h || location.hash || '#/dashboard';

  // These checks for project-specific routes are fine
  if (hash.startsWith('#/project/')) return hash;
  if (hash.startsWith('#/editor')) return '#/editor';

  // The old logic was breaking simple routes. 
  // This correctly returns the full hash for pages like '#/projects'.
  return hash;
}
function getSubtabFromHash(h) {
  const parts = (h || location.hash || '').split('/');
  return parts[2] || null; // e.g., '#/editor/pre' -> 'pre'
}

// 3) Subtab controller (visibility + active state)
function updateSubtabsVisibilityAndState() {
  const bar = document.getElementById('editor-subtabs');
  if (!bar) return;

  const onEditor = (normalizeHash() === '#/editor');
  const hasProject = !!state?.project?.id;

  // Show/hide the sticky bar
  bar.classList.toggle('is-hidden', !(onEditor && hasProject));

  // Handle L2 sub-panel visibility
  const editorPanelsContainer = document.getElementById('editor-panels');
  if (editorPanelsContainer) {
      if (!(onEditor && hasProject)) {
          editorPanelsContainer.classList.add('is-hidden');
          return;
      }
      editorPanelsContainer.classList.remove('is-hidden');

      const valid = new Set(['pre','field','report','post']);
      const sub = valid.has(getSubtabFromHash()) ? getSubtabFromHash() : 'pre';

      bar.querySelectorAll('.subtab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.subtab === sub);
      });

      ['pre','field','report','post'].forEach(p => {
        const el = document.getElementById('panel-' + p);
        if (el) el.classList.toggle('is-hidden', p !== sub);
      });
  }
}

function renderProjectShell(root) {
  const currentHash = location.hash || '#/project/overview';
  const activeTab = currentHash.split('/')[2] || 'overview'; // e.g., 'overview', 'pre-field'

  // Conditionally build the sub-navigation for the "Pre-Field" section
  let prefieldSubNavHTML = '';
  if (activeTab === 'pre-field') {
    const prefieldSubTab = ui_state.active_prefield_tab || 'screener';
    prefieldSubNavHTML = `
      <div class="prefield-pills" style="margin: 0 auto;">
         <button class="prefield-pill-btn ${prefieldSubTab === 'screener' ? 'active' : ''}" data-prefield-tab="screener">Screener</button>
         <button class="prefield-pill-btn ${prefieldSubTab === 'main' ? 'active' : ''}" data-prefield-tab="main">Main Survey</button>
         <button class="prefield-pill-btn ${prefieldSubTab === 'tabplan' ? 'active' : ''}" data-prefield-tab="tabplan">Tab Sheet</button>
         <button class="prefield-pill-btn ${prefieldSubTab === 'banner' ? 'active' : ''}" data-prefield-tab="banner">Banner</button>
      </div>
    `;
  }

  const moreMenuItems = [
    { label: 'Preview', hash: '#/project/preview' },
    { label: 'Validator', hash: '#/project/validator' },
    { label: 'Library', hash: '#/project/library' },
    { label: 'Versions', hash: '#/project/versions' },
    { label: 'Post-Survey', hash: '#/project/post-survey' },
    { label: 'Rules (Settings)', hash: '#/project/rules' },
  ];

  const isMoreActive = moreMenuItems.some(item => item.hash === currentHash);

  root.innerHTML = `
    <nav class="project-shell-nav">
      <div class="project-shell-nav-inner">
        <button class="shell-tab ${activeTab === 'overview' ? 'active' : ''}" onclick="goto('#/project/overview')">Overview</button>
        <button class="shell-tab ${activeTab === 'pre-field' ? 'active' : ''}" onclick="goto('#/project/pre-field')">Pre-Field</button>
        <button class="shell-tab ${activeTab === 'fielding' ? 'active' : ''}" onclick="goto('#/project/fielding')">Fielding</button>
        <button class="shell-tab ${activeTab === 'reporting' ? 'active' : ''}" onclick="goto('#/project/reporting')">Reporting</button>

        <div class="more-menu" style="margin-left: auto;">
          <button class="shell-tab ${isMoreActive ? 'active' : ''}">More ▾</button>
          <div class="more-menu-content">
            ${moreMenuItems.map(item => `
              <button class="more-menu-item" onclick="goto('${item.hash}')">${item.label}</button>
            `).join('')}
          </div>
        </div>
        <button class="shell-tab" onclick="closeProject()">Close Project</button>
      </div>
    </nav>
    <div id="project-content-host" style="padding: 0 16px;"></div>
  `;

  const host = document.getElementById('project-content-host');

  // Route to the correct sub-view renderer
  switch(activeTab) {
    case 'overview':
      renderOverview(host);
      break;
    case 'pre-field':
      // Your existing editor now lives here
      renderEditor(host);
      break;
    case 'fielding':
      renderFielding(host);
      break;
    case 'reporting':
      renderReporting(host);
      break;
    // The "More" menu items just need to map to your existing render functions
    case 'validator':
      renderValidator(host);
      break;
    case 'library':
      renderLibrary(host);
      break;
    case 'versions':
      renderVersions(host);
      break;
    case 'rules':
      renderRules(host);
      break;
    case 'preview':
      renderPreview(host);
      break;
    case 'post-survey':
      renderPostSurvey(host);
      break;
    // Add cases for preview, post-survey etc. as you build them
    default:
      renderOverview(host); // Fallback to overview
  }

  // Wire up the new sub-navigation buttons after they have been rendered
  root.querySelectorAll('[data-prefield-tab]').forEach(btn => {
    btn.onclick = (e) => {
      const nextTab = e.currentTarget.dataset.prefieldTab;
      if (ui_state.active_prefield_tab !== nextTab) {
        ui_state.active_prefield_tab = nextTab;
        renderProjectShell(root); // Re-render the entire shell to update content
      }
    };
  });
}

/**
 * REWRITTEN & ENHANCED ROUTER
 * This function determines what page to display based on the URL hash.
 * It's now broken into two parts:
 * 1. updateHeaderState(): Manages what appears in the top-right of the header 
 * (either the project name or the project selector dropdown).
 * 2. renderRoute(): The main router that decides which content rendering function to call.
 */

// Helper function to manage the header's dynamic content
async function updateHeaderState() {
  const projectNameIndicator = document.getElementById('project-name-indicator');
  if (!projectNameIndicator) return;

  if (ui_state.active_project_id) {
    // If a project is open, just display its name as simple text.
    projectNameIndicator.innerHTML = ''; // Clear any previous dropdown
    projectNameIndicator.textContent = state.project?.name || 'Project Loaded';
    projectNameIndicator.className = 'project-indicator';
  } else {
    // If no project is open, build and display the project selection dropdown.
    const projects = await getProjects();
    const options = projects.map(p => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join('');
    
    projectNameIndicator.innerHTML = `
      <select id="header-project-selector" class="project-selector-dropdown">
        <option value="" disabled selected>Select a Project...</option>
        ${options}
      </select>
    `;

    // Attach an event listener to the newly created dropdown.
    document.getElementById('header-project-selector').addEventListener('change', (e) => {
      if (e.target.value) {
        openProjectById(e.target.value);
      }
    });
  }
}

// The main routing function
async function renderRoute() {
  const root = document.getElementById('view-root');
  const err  = document.getElementById('serverError');
  if (!root) return;

  try {
    if (err) { err.style.display = 'none'; err.textContent = ''; }

    // STEP 1: Always update the header first.
    await updateHeaderState();

    // STEP 2: Decide which main content to render based on the URL and app state.
    const hash = normalizeHash(location.hash) || '#/dashboard';

    if (ui_state.active_project_id) {
      // --- Case 1: A project is currently open ---
      // The project shell handles all of its own sub-routes (overview, pre-field, etc.)
      renderProjectShell(root);

    } else if (hash.startsWith('#/clients/')) {
      // --- Case 2: Viewing a specific client's detail page ---
      // This is a dynamic route that isn't in our main `routes` map.
      const clientName = hash.substring('#/clients/'.length);
      await renderClientDetailPage(root, clientName);

    } else {
      // --- Case 3: Viewing a standard, top-level page (no project open) ---
      // Look up the page renderer from our `routes` map.
      const view = routes.get(hash) || renderSimpleDashboard; // Fallback to dashboard
      await view(root);
    }

    // STEP 3: Perform final UI updates that run on every page change.
    refreshSidebarProjects();
    highlightNav?.();

  } catch (e) {
    // This is your existing, robust error handling.
    console.error(e);
    if (err) {
      err.style.display = 'block';
      err.textContent = (e && e.stack) ? e.stack : String(e);
    }
    try { renderSimpleDashboard(root); } catch(_) {} // Attempt to recover to dashboard
  }
}
// 5) Bootstrap (safe; don’t blow up if ensureRules was nuked)
// Make the header logo navigate to the dashboard correctly
document.getElementById('logo-link')?.addEventListener('click', (e) => {
  e.preventDefault(); // Stop the link from navigating immediately
  ui_state.active_project_id = null; // <-- This is the crucial step
  location.hash = '#/dashboard'; // Manually trigger the navigation
});

(function bootstrap(){
  if (typeof ensureRules === 'function') ensureRules();

  // This function will now automatically try to load the last project
  // without asking for confirmation.
  const tryAutoLoadLastProject = async () => {
    try {
      // We check localStorage ONLY to see which project was last active.
      const lastSession = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || 'null');
      const lastProjectId = lastSession?.project?.id;

      if (lastProjectId) {
        console.log(`Auto-loading last active project: ${lastProjectId}`);
        await openProjectById(lastProjectId); // Fetch the definitive version from Supabase
      } else {
        // If no last project is found, just render the default route.
        await renderRoute();
      }
    } catch (e) {
      console.error("Failed to auto-load last session, showing dashboard.", e);
      location.hash = '#/dashboard'; // Go to dashboard on error
      await renderRoute();
    }
  };

  tryAutoLoadLastProject();
})();

// 6) Events
window.addEventListener('hashchange', renderRoute);
window.addEventListener('DOMContentLoaded', renderRoute);

// Side Drawer → Preview panel switching
(function() {
  console.log("Starting project data migration...");

  const PROJECTS_KEY = "qgen_projects_v1";
  const projectsJSON = localStorage.getItem(PROJECTS_KEY);

  if (!projectsJSON) {
    console.log("No projects found to migrate. All good!");
    return;
  }

  try {
    let projects = JSON.parse(projectsJSON);
    let fixedCount = 0;

    // Loop through each project to find and fix the error
    projects.forEach(p => {
      // The bug is when important_dates is an object but NOT an array.
      if (p && typeof p.important_dates === 'object' && !Array.isArray(p.important_dates)) {
        p.important_dates = []; // Fix it by replacing the object with an empty array.
        fixedCount++;
      }
    });

    if (fixedCount > 0) {
      // Save the corrected data back to localStorage
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      console.log(`✅ Success! Repaired ${fixedCount} project(s). Your data is safe.`);
    } else {
      console.log("✅ No issues found. Your project data is already in the correct format.");
    }

  } catch (e) {
    console.error("❌ Failed to migrate project data. Error:", e);
  }

  console.log("Migration script finished.");
})();

// GLOBAL CLICK LISTENER
document.addEventListener('click', function(e) {

  if (e.target.classList.contains('remove-role-btn')) {
    e.preventDefault();
    e.target.closest('.role-row').remove();
  }
  
  // --- Logic for Editor Tabs ---
  const tabBtn = e.target.closest('.editor-tabs [data-tab]');
  if (tabBtn) {
    if (typeof setActiveTab === 'function') {
      setActiveTab(tabBtn.dataset.tab);
    } else {
      // Minimal fallback if helper isn’t defined
      ui_state.active_tab = tabBtn.dataset.tab;
      renderEditorPanel?.();
    }
  }

  const settingsBtn = e.target.closest('[data-action="toggle-advanced"]');
  if (settingsBtn) {
    const targetId = settingsBtn.dataset.target;
    const advancedPanel = document.getElementById(targetId);
    if (advancedPanel) {
      advancedPanel.classList.toggle('is-hidden');
    }
  }
});

/* ===== PIPING HELPER FUNCTIONS ===== */

function openPipingHelper(questionIndex, fieldType) {
  const modal = document.getElementById('pipingHelperModal');
  const content = document.getElementById('pipingHelperContent');
  
  const availableCodes = getAvailablePipingCodes(questionIndex);
  
  content.innerHTML = `
    <div class="form-row">
      <label class="form-label">Available Piping Codes</label>
      <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--line); border-radius: 8px; padding: 12px;">
        ${availableCodes.length > 0 ? availableCodes.map(code => `
          <div class="piping-code-item" style="padding: 8px; border-bottom: 1px solid var(--line); cursor: pointer;" onclick="insertPipingCode('${code.code}', ${questionIndex}, '${fieldType}')">
            <code style="background: var(--surface-3); padding: 2px 6px; border-radius: 4px;">${escapeHTML(code.code)}</code>
            <div class="muted" style="font-size: 12px; margin-top: 2px;">${escapeHTML(code.description)}</div>
          </div>
        `).join('') : '<div class="muted">No previous questions available for piping.</div>'}
      </div>
    </div>
    
    <div class="form-row">
      <label class="form-label">Piping Syntax Examples</label>
      <div style="background: var(--surface-3); padding: 12px; border-radius: 8px;">
        <div style="margin-bottom: 8px;"><code>{S6_3}</code> - Insert response value</div>
        <div style="margin-bottom: 8px;"><code>{S6_3:label}</code> - Insert option label</div>
        <div style="margin-bottom: 8px;"><code>{S6_2+S6_3}</code> - Sum values</div>
        <div style="margin-bottom: 8px;"><code>{S6_3>1?"children":"child"}</code> - Conditional text</div>
        <div><code>{S6_3>=2?"have":"has"}</code> - Plural/singular verbs</div>
      </div>
    </div>
  `;
  
  modal.classList.remove('is-hidden');
  document.querySelector('header')?.classList.add('content-blur');
  document.getElementById('view-root')?.classList.add('content-blur');
}

function closePipingHelper() {
  const modal = document.getElementById('pipingHelperModal');
  modal.classList.add('is-hidden');
  document.querySelector('header')?.classList.remove('content-blur');
  document.getElementById('view-root')?.classList.remove('content-blur');
}

function insertPipingCode(code, questionIndex, fieldType) {
  let targetElement;
  
  if (fieldType === 'text') {
    targetElement = document.getElementById(`questionText-${questionIndex}`);
  }
  
  if (targetElement) {
    const cursorPos = targetElement.selectionStart || targetElement.value.length;
    const textBefore = targetElement.value.substring(0, cursorPos);
    const textAfter = targetElement.value.substring(cursorPos);
    
    targetElement.value = textBefore + code + textAfter;
    targetElement.focus();
    targetElement.selectionStart = targetElement.selectionEnd = cursorPos + code.length;
    
    // Trigger the update
    const event = new Event('input', { bubbles: true });
    targetElement.dispatchEvent(event);
  }
  
  closePipingHelper();
}

/* ===== CONDITION TESTING & PREVIEW ===== */

// Test conditions with mock responses for preview
function testQuestionConditions() {
  // This will be used later for preview functionality
  // For now, just log that the system is working
  console.log('Condition testing system ready');
}

// Helper to build mock responses for testing
// Helper to build mock responses for testing
function buildMockResponses() {
  const mockResponses = {};
  
  state.questions.forEach((q, index) => {
    if (q.id) {
      // Create realistic mock responses based on question type and context
      if (q.id.match(/S6_\d/)) {
        // Child count questions - use realistic numbers
        mockResponses[q.id] = Math.floor(Math.random() * 3) + 1; // 1-3 children
      } else if (Array.isArray(q.options) && q.options.length > 0) {
        mockResponses[q.id] = q.options[0].code || '1';
      } else if (isNumericQuestion(q)) {
        mockResponses[q.id] = '25'; // Default age or count
      } else {
        mockResponses[q.id] = 'Sample response';
      }
    }
  });
  
  // Add some specific mock data that matches the Benadryl questionnaire patterns
  mockResponses['S6_2'] = 0; // 2-5 years
  mockResponses['S6_3'] = 2; // 6-11 years  
  mockResponses['S6_4'] = 1; // 12-17 years
  
  return mockResponses;
}


</script>
<!-- Piping Helper Modal -->
<div id="pipingHelperModal" class="modal is-hidden" role="dialog" aria-modal="true">
  <div class="modal-panel" onclick="event.stopPropagation()" style="max-width: 600px;">
    <div class="modal-header">
      <h3>Text Piping Helper</h3>
      <button class="icon-btn" onclick="closePipingHelper()" aria-label="Close">✕</button>
    </div>
    <div class="modal-body">
      <div id="pipingHelperContent"></div>
    </div>
    <div class="modal-footer">
      <button class="btn ghost" onclick="closePipingHelper()">Close</button>
    </div>
  </div>
  <div class="modal-backdrop" onclick="closePipingHelper()"></div>
</div>
<footer class="app-footer-zoned">
  <div class="footer-container">
      <div class="footer-left">
          © 2025 <strong>QGEN</strong> by <a href="https://www.cueinsights.com/" target="_blank">Cue Insights</a>
      </div>
      <div class="footer-right">
          <a href="#">Help</a>
          <a href="#" onclick="openProjectHealthModal(event)">Status</a>
          <a href="#">Privacy & Terms</a>
          <span>v3.0.0</span>
      </div>
  </div>
</footer>
</body>
</html>