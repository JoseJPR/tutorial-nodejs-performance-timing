/** Require generics dependences */
const { execSync } = require('child_process');
const { PerformanceObserver, performance } = require('perf_hooks');

// Define variables.
let name;

// Create timerify wrapper for this function.
const localRequire = performance.timerify(require);

// Activate the observer.
const obs = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    process.send({ Module: name, Time: entry.duration });
  });
  obs.disconnect();
});
obs.observe({ entryTypes: ['function'], buffered: true });

// Get message from parent process.
process.on('message', (m) => {
  try {
    name = m.moduleName;
    // Install module.
    execSync(`cd ${__dirname} && npm i ${name}`);

    // Use local require function for get timer.
    localRequire(name);

    // Clear modules.
    execSync(`cd ${__dirname} && npm uninstall ${name}`);
  } catch (err) {
    console.error(err);
  }
});
