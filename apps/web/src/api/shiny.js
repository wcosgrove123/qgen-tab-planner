/**
 * API endpoint to manage Shiny for Python cross-tab app
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let shinyProcess = null;

/**
 * Start Shiny cross-tab app in background
 */
export async function startShinyCrosstabApp() {
  // Check if already running
  if (shinyProcess && !shinyProcess.killed) {
    return { success: true, message: 'Shiny app already running', port: 8080 };
  }

  try {
    const shinyAppPath = join(__dirname, '../../../../shiny_app');
    const mainScript = join(shinyAppPath, 'main_with_crosstabs.py');

    console.log('🚀 Starting Shiny app:', mainScript);

    // Start Python process
    shinyProcess = spawn('python', [mainScript], {
      cwd: shinyAppPath,
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Log output
    shinyProcess.stdout.on('data', (data) => {
      console.log(`[Shiny] ${data.toString().trim()}`);
    });

    shinyProcess.stderr.on('data', (data) => {
      console.error(`[Shiny Error] ${data.toString().trim()}`);
    });

    shinyProcess.on('close', (code) => {
      console.log(`Shiny process exited with code ${code}`);
      shinyProcess = null;
    });

    // Give it time to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    return { success: true, message: 'Shiny app started', port: 8080 };

  } catch (error) {
    console.error('Error starting Shiny app:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Stop Shiny app
 */
export function stopShinyCrosstabApp() {
  if (shinyProcess && !shinyProcess.killed) {
    shinyProcess.kill();
    shinyProcess = null;
    return { success: true, message: 'Shiny app stopped' };
  }
  return { success: true, message: 'Shiny app not running' };
}

/**
 * Check if Shiny app is running
 */
export function getShinyCrosstabStatus() {
  return {
    running: shinyProcess && !shinyProcess.killed,
    port: 8080
  };
}