import path from 'path';
import type { GeneratorOptions, TemplateData } from '../types/index.js';
import { toPascalCase, toCamelCase, packageToPath } from '../utils/naming.js';
import { writeFile, ensureDirectory, logFileCreated, exists } from '../utils/file.js';
import { renderTemplate } from '../templates/engine.js';

export async function generateEntity(options: GeneratorOptions): Promise<void> {
  const { name, packageName, directory, module, lombok, jpa } = options;
  
  const className = toPascalCase(name);
  const entityName = className.endsWith('Entity') ? className : className;
  
  const packagePath = packageToPath(packageName);
  const targetDir = path.join(
    process.cwd(),
    directory,
    packagePath,
    module ? `${module}/entity` : 'entity'
  );
  
  ensureDirectory(targetDir);
  
  const templateData: TemplateData = {
    className: entityName,
    classNameLower: toCamelCase(entityName),
    classNameCamel: toCamelCase(entityName),
    packageName: module 
      ? `${packageName}.${module}.entity`
      : `${packageName}.entity`,
    entityName: entityName,
    entityNameLower: toCamelCase(entityName),
    moduleName: module,
    hasLombok: lombok ?? true,
    hasJpa: jpa ?? true,
    hasCrud: false,
    hasRest: false,
    fields: [
      { name: 'id', type: 'Long', isId: true },
      { name: 'createdAt', type: 'LocalDateTime' },
      { name: 'updatedAt', type: 'LocalDateTime' },
    ],
  };
  
  const content = await renderTemplate('entity', templateData);
  const filePath = path.join(targetDir, `${entityName}.java`);
  
  if (exists(filePath)) {
    console.log(`  Entity ${entityName} already exists, skipping...`);
    return;
  }
  
  writeFile(filePath, content);
  logFileCreated(path.relative(process.cwd(), filePath));
}
