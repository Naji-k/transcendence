#!/usr/bin/env node
import { Command } from 'commander';
import { signin, signup } from './commands/auth';
import { showMatches } from './commands/matches';

const program = new Command();

program.name('pong-cli').description('CLI Pong Application');

program
  .command('signup')
  .argument('<name>')
  .argument('<email>')
  .argument('<password>')
  .action(signup);

program
  .command('signin')
  .argument('<email>')
  .argument('<password>')
  .action(signin);

program.command('matches').action(showMatches);
if (process.argv.length <= 2) {
  program.help();
}
program.parse();
