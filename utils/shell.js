'use strict';

var shellEscape = require('shell-escape');
var Promise     = require('ember-cli/lib/ext/promise');
var dargs       = require('dargs');
var exec        = require('child_process').exec;

module.exports = {
  runCommand: runCommand,

  buildCommand: buildCommand
};

/**
  @method runCommand

  @param {String} command The command to be run
  @param {Object} ui The instance that handles stdin/stdout

*/
function runCommand(command, ui) {
  return new Promise(function(resolve, reject) {
      if (!command) {
        return resolve('No command found');
      }

      ui.writeLine(command);

      var task = exec(command, {
        cwd: process.cwd()
      }, function(err) {
        if (err !== null) {
          return reject(err);
        }
        return resolve(command);
      });

      task.stdout.pipe(ui.outputStream, { end: false });
    });
}

/*
  Converts a task:
  ```
    {
      command: 'curl',
      includeOptions: [
        { form: ['file=@dist/index.html', 'version=new'] },
        { request: 'POST' },
        { url: 'api.com/new-release' }
      ]
    }
  ```
  into a String that serves as a command.

  @method buildCommand
  @param {Object} task
  @return {String} Formatted command line argument

*/
function buildCommand(task) {
  var command = task.command.trim();
  var options = task.options || {};

  var args = dargs(options);

  var formattedArgs = formatArgs(args);
  var commandArgs = !!formattedArgs ? (' ' + formattedArgs) : '';
  var fullCommand = command + commandArgs;

  return fullCommand;
}

/**
  Turns an array of `key=value` into proper command-line arguments and flags.
  `['foo=bar', 'header=x-update: 1', '--truthy']` becomes:
  `--foo bar --header "x-update: 1" --truthy`

  @method formatArgs
  @param {Array} args An array of `key=value` pairs.
  @return {String} command line arguments

*/
function formatArgs(args) {
  args = args || [];
  var split, formattedArgs = [];

  args.forEach(function(arg) {
    split = arg.split(/\=(.+)?/, 2);

    formattedArgs.push(split[0]);

    if (split[1]) {
      formattedArgs.push(split[1]);
    }
  });

  return shellEscape(formattedArgs);
}