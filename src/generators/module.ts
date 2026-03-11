import chalk from 'chalk';
import type { GeneratorOptions } from '../types/index.js';
import { toPascalCase, toCamelCase } from '../utils/naming.js';
import { generateController } from './controller.js';
import { generateService } from './service.js';
import { generateRepository } from './repository.js';
import { generateEntity } from './entity.js';
import { generateDto } from './dto.js';

export async function generateModule(options: GeneratorOptions): Promise<void> {
  const { name } = options;
  
  const moduleName = toPascalCase(name);
  const moduleNameLower = toCamelCase(name);
  
  console.log(chalk.cyan(`\nGenerating module: ${moduleName}`));
  console.log(chalk.gray('This will generate:'));
  console.log(chalk.gray(`  - Entity: ${moduleName}`));
  console.log(chalk.gray(`  - Repository: ${moduleName}Repository`));
  console.log(chalk.gray(`  - Service: ${moduleName}Service`));
  console.log(chalk.gray(`  - Controller: ${moduleName}Controller`));
  console.log(chalk.gray(`  - DTOs: ${moduleName}Request, ${moduleName}Response`));
  console.log();
  
  // Set module option for all generators
  const moduleOptions: GeneratorOptions = {
    ...options,
    module: moduleNameLower,
    crud: true,
    rest: true,
  };
  
  // Generate in order
  await generateEntity(moduleOptions);
  await generateRepository(moduleOptions);
  await generateService(moduleOptions);
  await generateDto(moduleOptions);
  await generateController(moduleOptions);
  
  console.log();
  console.log(chalk.green(`✓ Module ${moduleName} generated successfully!`));
}
