import chalk from 'chalk';
import inquirer from 'inquirer';
import type { GenerateCommandOptions, GeneratorStyle, GeneratorType } from '../types/index.js';
import { generateController } from '../generators/controller.js';
import { generateService } from '../generators/service.js';
import { generateRepository } from '../generators/repository.js';
import { generateEntity } from '../generators/entity.js';
import { generateDto } from '../generators/dto.js';
import { generateModule } from '../generators/module.js';
import { exists } from '../utils/file.js';
import { parseFieldDefinitions } from '../utils/fields.js';
import path from 'path';

const VALID_TYPES: GeneratorType[] = [
  'controller',
  'service',
  'repository',
  'entity',
  'dto',
  'module',
];

const LEGACY_LAYERED_TYPES: GeneratorType[] = [
  'controller',
  'service',
  'repository',
  'entity',
  'dto',
];

const VALID_STYLES: GeneratorStyle[] = ['ddd-modulith', 'layered'];

export function validateDddModuleOptions(
  type: string,
  options: Pick<GenerateCommandOptions, 'style' | 'crud' | 'rest' | 'jpa'>
): string | null {
  const style = options.style ?? 'ddd-modulith';
  if (type !== 'module' || style !== 'ddd-modulith') {
    return null;
  }
  if (options.crud === false) {
    return "The DDD module generator does not support '--no-crud' yet. Keep the default CRUD-oriented skeleton or use '--style layered'.";
  }
  if (options.rest === false) {
    return "The DDD module generator does not support '--no-rest' yet. Keep the default REST API output or use '--style layered'.";
  }
  if (options.jpa === false) {
    return "The DDD module generator does not support '--no-jpa' yet. Keep the default JPA persistence output or use '--style layered'.";
  }
  return null;
}

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
    console.log(chalk.yellow("Warning: This doesn't appear to be a Spring Boot project."));
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

  const style = (options.style ?? 'ddd-modulith') as GeneratorStyle;
  if (!VALID_STYLES.includes(style)) {
    console.log(chalk.red(`Invalid style: ${style}`));
    console.log(chalk.gray(`Valid styles: ${VALID_STYLES.join(', ')}`));
    process.exit(1);
  }

  const dddOptionError = validateDddModuleOptions(type, options);
  if (dddOptionError) {
    console.log(chalk.red(dddOptionError));
    process.exit(1);
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
    style,
    crud: options.crud,
    rest: options.rest ?? true,
    jpa: options.jpa ?? true,
    lombok: options.lombok ?? true,
    fields: options.fields ? parseFieldDefinitions(options.fields) : undefined,
  };

  console.log();
  console.log(chalk.cyan(`Generating ${type}: ${name}`));
  console.log(chalk.gray(`Package: ${packageName}`));
  console.log(chalk.gray(`Directory: ${targetDir}`));
  console.log(chalk.gray(`Style: ${style}`));
  console.log();

  if (LEGACY_LAYERED_TYPES.includes(type as GeneratorType) && style !== 'layered') {
    console.log(
      chalk.yellow(
        `Note: '${type}' is a legacy layered generator. Use 'sg g module ${name}' for the default DDD/Modulith-ready layout.`
      )
    );
    console.log();
  }

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
