#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { generateCommand } from './commands/generate.js';
import { newCommand } from './commands/new.js';
import { infoCommand } from './commands/info.js';

const program = new Command();

// Display banner
console.log(
  chalk.cyan(figlet.textSync('SpringBoot CLI', { horizontalLayout: 'full' }))
);
console.log(chalk.gray('A CLI tool for generating Spring Boot modular code\n'));

program
  .name('sg')
  .description('CLI tool for generating Spring Boot modular code')
  .version('1.0.0');

// Register commands
program
  .command('new <name>')
  .description('Create a new Spring Boot project')
  .option('-p, --package <package>', 'base package name', 'com.example')
  .option('-d, --directory <directory>', 'target directory')
  .action(newCommand);

program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate code artifacts (controller, service, repository, entity, dto, module)')
  .option('-p, --package <package>', 'package name suffix')
  .option('-d, --directory <directory>', 'target directory', 'src/main/java')
  .option('-m, --module <module>', 'module name')
  .option('--crud', 'generate CRUD operations', false)
  .option('--rest', 'generate REST endpoints', true)
  .option('--jpa', 'include JPA annotations', true)
  .option('--lombok', 'include Lombok annotations', true)
  .action(generateCommand);

program
  .command('info')
  .description('Display project information')
  .action(infoCommand);

program.parse();
