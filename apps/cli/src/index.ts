#!/usr/bin/env node
import { Command } from 'commander';
import { signin, signout, signup } from './commands/auth';
import { showMatches } from './commands/matches';

const program = new Command();

program.name('pong').description('CLI Pong Application');

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

program
  .command('signout')
  .action(signout);

program.command('matches').action(showMatches);
if (process.argv.length <= 2) {
  program.help();
}
program.parse();
