import path from 'path';
import type { GeneratorOptions, TemplateData } from '../types/index.js';
import { toPascalCase, toCamelCase, packageToPath } from '../utils/naming.js';
import { writeFile, ensureDirectory, logFileCreated, exists } from '../utils/file.js';
import { renderTemplate } from '../templates/engine.js';

export async function generateDto(options: GeneratorOptions): Promise<void> {
  const { name, packageName, directory, module, lombok } = options;
  
  const className = toPascalCase(name);
  
  const packagePath = packageToPath(packageName);
  const targetDir = path.join(
    process.cwd(),
    directory,
    packagePath,
    module ? `${module}/dto` : 'dto'
  );
  
  ensureDirectory(targetDir);
  
  // Generate Request DTO
  const requestDtoName = `${className}Request`;
  const requestTemplateData: TemplateData = {
    className: requestDtoName,
    classNameLower: toCamelCase(requestDtoName),
    classNameCamel: toCamelCase(className),
    packageName: module 
      ? `${packageName}.${module}.dto`
      : `${packageName}.dto`,
    entityName: className,
    entityNameLower: toCamelCase(className),
    moduleName: module,
    hasLombok: lombok ?? true,
    hasJpa: false,
    hasCrud: false,
    hasRest: false,
    fields: [
      { name: 'name', type: 'String' },
    ],
  };
  
  const requestContent = await renderTemplate('dto', requestTemplateData);
  const requestPath = path.join(targetDir, `${requestDtoName}.java`);
  
  if (!exists(requestPath)) {
    writeFile(requestPath, requestContent);
    logFileCreated(path.relative(process.cwd(), requestPath));
  } else {
    console.log(`  DTO ${requestDtoName} already exists, skipping...`);
  }
  
  // Generate Response DTO
  const responseDtoName = `${className}Response`;
  const responseTemplateData: TemplateData = {
    ...requestTemplateData,
    className: responseDtoName,
    classNameLower: toCamelCase(responseDtoName),
    fields: [
      { name: 'id', type: 'Long' },
      { name: 'name', type: 'String' },
      { name: 'createdAt', type: 'LocalDateTime' },
    ],
  };
  
  const responseContent = await renderTemplate('dto', responseTemplateData);
  const responsePath = path.join(targetDir, `${responseDtoName}.java`);
  
  if (!exists(responsePath)) {
    writeFile(responsePath, responseContent);
    logFileCreated(path.relative(process.cwd(), responsePath));
  }
}
