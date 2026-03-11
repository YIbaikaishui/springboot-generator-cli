import chalk from 'chalk';
import inquirer from 'inquirer';
import type { GenerateCommandOptions, GeneratorType } from '../types/index.js';
import { generateController } from '../generators/controller.js';
import { generateService } from '../generators/service.js';
import { generateRepository } from '../generators/repository.js';
import { generateEntity } from '../generators/entity.js';
import { generateDto } from '../generators/dto.js';
import { generateModule } from '../generators/module.js';
import { exists } from '../utils/file.js';
import path from 'path';

const VALID_TYPES: GeneratorType[] = [
  'controller',
  'service', 
  'repository',
  'entity',
  'dto',
  'module',
  'mapper',
  'config',
  'exception',
];

export async function generateCommand(
  type: string,
  name: string,
  options: GenerateCommandOptions
): Promise<void> {
  // Validate type
  if (!VALID_TYPES.includes(type as GeneratorType)) {
    console.log(chalk.red(`Invalid type: ${type}`));
    console.log(chalk.gray(`Valid types: ${VALID_TYPES.join(', ')}`));
    process.exit(1);
  }

  // Validate name
  if (!name || name.trim() === '') {
    console.log(chalk.red('Name is required'));
    process.exit(1);
  }

  // Get working directory
  const cwd = process.cwd();
  const targetDir = options.directory || 'src/main/java';

  // Check if it's a Spring Boot project
  if (!exists(path.join(cwd, 'pom.xml')) && !exists(path.join(cwd, 'build.gradle'))) {
    console.log(chalk.yellow('Warning: This doesn\'t appear to be a Spring Boot project.'));
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Continue anyway?',
        default: false,
      },
    ]);
    if (!proceed) {
      process.exit(0);
    }
  }

  // Get package name
  let packageName = options.package || 'com.example';
  if (!options.package) {
    const { inputPackage } = await inquirer.prompt([
      {
        type: 'input',
        name: 'inputPackage',
        message: 'Package name:',
        default: 'com.example',
      },
    ]);
    packageName = inputPackage;
  }

  // Build generator options
  const generatorOptions = {
    name,
    packageName,
    module: options.module,
    directory: targetDir,
    crud: options.crud,
    rest: options.rest ?? true,
    jpa: options.jpa ?? true,
    lombok: options.lombok ?? true,
  };

  console.log();
  console.log(chalk.cyan(`Generating ${type}: ${name}`));
  console.log(chalk.gray(`Package: ${packageName}`));
  console.log(chalk.gray(`Directory: ${targetDir}`));
  console.log();

  // Execute generator
  switch (type) {
    case 'controller':
      await generateController(generatorOptions);
      break;
    case 'service':
      await generateService(generatorOptions);
      break;
    case 'repository':
      await generateRepository(generatorOptions);
      break;
    case 'entity':
      await generateEntity(generatorOptions);
      break;
    case 'dto':
      await generateDto(generatorOptions);
      break;
    case 'module':
      await generateModule(generatorOptions);
      break;
    default:
      console.log(chalk.red(`Generator for '${type}' not implemented yet`));
      process.exit(1);
  }

  console.log();
  console.log(chalk.green('✓ Generation completed!'));
}
