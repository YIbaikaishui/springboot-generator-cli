#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { generateCommand } from './commands/generate.js';
import { newCommand } from './commands/new.js';
import { infoCommand } from './commands/info.js';

const program = new Command();

// Display banner
console.log(chalk.cyan(figlet.textSync('SpringBoot CLI', { horizontalLayout: 'full' })));
console.log(chalk.gray('A CLI tool for generating Spring Boot modular code\n'));

program.name('sg').description('CLI tool for generating Spring Boot modular code').version('1.0.0');

// Register commands
program
  .command('new <name>')
  .description('Create a new DDD-friendly Spring Boot project')
  .option('-p, --package <package>', 'base package name', 'com.example')
  .option('-d, --directory <directory>', 'target directory')
  .option('-s, --style <style>', 'project layout style (ddd-modulith|layered)', 'ddd-modulith')
  .action(newCommand);

program
  .command('generate <type> <name>')
  .alias('g')
  .description(
    'Generate code artifacts (module recommended; controller/service/repository/entity/dto are legacy layered generators)'
  )
  .option('-p, --package <package>', 'package name suffix')
  .option('-d, --directory <directory>', 'target directory', 'src/main/java')
  .option('-f, --fields <fields>', 'business fields for modules, e.g. "name:string,price:decimal"')
  .option('-m, --module <module>', 'module name')
  .option('-s, --style <style>', 'module layout style (ddd-modulith|layered)', 'ddd-modulith')
  .option('--no-crud', 'skip CRUD-oriented boilerplate')
  .option('--no-rest', 'skip REST endpoints')
  .option('--no-jpa', 'skip JPA annotations and persistence output')
  .option('--no-lombok', 'skip Lombok annotations')
  .action(generateCommand);

program.command('info').description('Display project information').action(infoCommand);

program.parse();
