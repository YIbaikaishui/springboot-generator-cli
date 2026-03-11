import path from 'path';
import type { GeneratorOptions, TemplateData } from '../types/index.js';
import { toPascalCase, toCamelCase, packageToPath } from '../utils/naming.js';
import { writeFile, ensureDirectory, logFileCreated, exists } from '../utils/file.js';
import { renderTemplate } from '../templates/engine.js';

export async function generateController(options: GeneratorOptions): Promise<void> {
  const { name, packageName, directory, module, rest, crud, lombok, jpa } = options;
  
  const className = toPascalCase(name);
  const controllerName = className.endsWith('Controller') ? className : `${className}Controller`;
  
  const packagePath = packageToPath(packageName);
  const targetDir = path.join(
    process.cwd(),
    directory,
    packagePath,
    module ? `${module}/controller` : 'controller'
  );
  
  ensureDirectory(targetDir);
  
  const templateData: TemplateData = {
    className: controllerName,
    classNameLower: toCamelCase(controllerName),
    classNameCamel: toCamelCase(className),
    packageName: module 
      ? `${packageName}.${module}.controller`
      : `${packageName}.controller`,
    entityName: className,
    entityNameLower: toCamelCase(className),
    moduleName: module,
    hasLombok: lombok ?? true,
    hasJpa: jpa ?? true,
    hasCrud: crud ?? false,
    hasRest: rest ?? true,
  };
  
  const content = await renderTemplate('controller', templateData);
  const filePath = path.join(targetDir, `${controllerName}.java`);
  
  if (exists(filePath)) {
    console.log(`  Controller ${controllerName} already exists, skipping...`);
    return;
  }
  
  writeFile(filePath, content);
  logFileCreated(path.relative(process.cwd(), filePath));
}
