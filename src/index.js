/** Require generics dependences */
const readline = require('readline');
const { fork } = require('child_process');

// Declare variables.
const results = [];

// Init Readline.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Clear terminal.
process.stdout.write('\x1b[2J');

// Show welcome message.
console.log(`
👋 Hi!, with this CLI application you can check the time it takes
   for each "require" to load a module. 

   Next you have to write the module names, for example: dayjs or
   severals for example: dayjs,moment.
`);
rl.question('👉 ', async (answer) => {
  // Get response and execute a fork for each module.
  if (answer !== '') {
    // Split for create array with module name.
    const modulesNames = answer.split(',');
    console.log('⌛️ Wait a moment, processing ...');

    // Iterate on the array modules.
    const iterate = modulesNames.map(async (name) => new Promise((resolve, reject) => {
      // Launch a fork process for install a module and get time require function.
      const n = fork(`${__dirname}/subprocess/index.js`);

      // Waiting message from fork for get result.
      n.on('message', (m) => {
        results.push(m);
        resolve();
      });
      n.on('error', (error) => {
        reject(new Error(error));
      });

      // Send module name for install into fork process.
      n.send({ moduleName: name.trim() });
    }));
    await Promise.all(iterate);

    // Show result with table.
    console.table(results);
  }
  process.exit(0);
});
