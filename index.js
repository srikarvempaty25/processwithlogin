#!/usr/bin/env node
const { spawn } = require('child_process');
const chalk = require('chalk');
const boxen = require('boxen');
const yargs = require('yargs');
const figlet = require('figlet');
const { exec } = require('child_process');
const util = require('util');

console.log("\nUsage: processcli <--user> <--password> [--listprocesses] [--kill all] [--kill browser]\n" +
  boxen(chalk.green('\n' + 'Lists the currently running processes and optionally kills processes according to choice' + '\n'), {
    padding: 1,
    borderColor: 'green',
    dimBorder: true,
  }) +
  '\n'
);
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;


const listoptions = yargs
.option('user',{
    describe: 'username',
    type: 'string',
    demandOption: true,
})
.option('pwd',{
    describe: 'password',
    type: 'string',
    demandOption: true,
})
.option('listprocesses', {
  describe: 'List running processes',
  type: 'boolean',
  demandOption: false,
})
.option('kill', {
  describe: 'Kill processes',
  type: 'string',
  demandOption: false,
})
.help(true)
.argv;

var username = argv.user;
var password = argv.pwd;

//console.log(`User: ${username} Pwd: ${password}`);

function authenticate(username, password) {
  if (!username || !password) {
    console.log('Please provide username and password');
    console.log('Usage: processcli <username> <password>');
    return Promise.reject(new Error('Authentication failed: Username and password required'));
  }

  var request = require('request');
  var options = {
    url: 'http://localhost:3000/api/auth',
    method: 'POST',
    json: {
      username: username,
      password: password
    }
  };

  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if (error) {
        reject(new Error('Authentication failed: ' + error));
      } else if (body && body.status === 'authorized') {
        resolve();
      } else {
        reject(new Error('Authentication failed: Invalid username or password'));
      }
    });
  });
}

authenticate(username, password)
  .then(function() {
    const execPromise = util.promisify(exec);


if (argv.listprocesses) {
execPromise('tasklist')
  .then(({ stdout }) => {
    const processes = stdout.split('\n').slice(3).map((line) => line.split(/\s+/)[0]);
    console.log(
      '\n' +
        boxen(chalk.green('Running Processes:\n\n' + processes.join('\n')), {
          padding: 1,
          borderColor: 'green',
          dimBorder: true,
        }) +
        '\n'
    );
  })
  .catch((error) => {
    console.error(error);
  });
}

if (argv.kill === 'all') {
execPromise('taskkill /F /FI "STATUS eq running"')
  .then(() => {
    console.log('Successfully killed all running processes');
  })
  .catch((error) => {
    console.error(`Error killing processes: ${error}`);
  });
}

if (argv.kill === 'browser') {
const browserProcesses = ['chrome.exe', 'firefox.exe', 'msedge.exe', 'brave.exe'];
const pName = browserProcesses.map((processName) => `IMAGENAME eq ${processName}`).join(' || ');
execPromise(`taskkill /F /FI "${pName}"`)
  .then(() => {
    console.log('Successfully killed browser processes');
  })
  .catch((error) => {
    console.error(`Error killing processes: ${error}`);
  });
}
  })
  .catch(function(error) {
    console.error(error.message);
  });





