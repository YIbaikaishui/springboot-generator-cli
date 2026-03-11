import path from 'path';
import type { GeneratorOptions, TemplateData } from '../types/index.js';
import { toPascalCase, toCamelCase, packageToPath } from '../utils/naming.js';
import { writeFile, ensureDirectory, logFileCreated, exists } from '../utils/file.js';
import { renderTemplate } from '../templates/engine.js';

export async function generateRepository(options: GeneratorOptions): Promise<void> {
  const { name, packageName, directory, module, jpa } = options;
  
  const className = toPascalCase(name);
  const repositoryName = className.endsWith('Repository') 
    ? className 
    : `${className}Repository`;
  
  const packagePath = packageToPath(packageName);
  const targetDir = path.join(
    process.cwd(),
    directory,
    packagePath,
    module ? `${module}/repository` : 'repository'
  );
  
  ensureDirectory(targetDir);
  
  const templateData: TemplateData = {
    className: repositoryName,
    classNameLower: toCamelCase(repositoryName),
    classNameCamel: toCamelCase(className),
    packageName: module 
      ? `${packageName}.${module}.repository`
      : `${packageName}.repository`,
    entityName: className,
    entityNameLower: toCamelCase(className),
    moduleName: module,
    hasLombok: false,
    hasJpa: jpa ?? true,
    hasCrud: true,
    hasRest: false,
  };
  
  const content = await renderTemplate('repository', templateData);
  const filePath = path.join(targetDir, `${repositoryName}.java`);
  
  if (exists(filePath)) {
    console.log(`  Repository ${repositoryName} already exists, skipping...`);
    return;
  }
  
  writeFile(filePath, content);
  logFileCreated(path.relative(process.cwd(), filePath));
}
