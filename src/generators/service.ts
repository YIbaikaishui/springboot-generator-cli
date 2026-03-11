import path from 'path';
import type { GeneratorOptions, TemplateData } from '../types/index.js';
import { toPascalCase, toCamelCase, packageToPath } from '../utils/naming.js';
import { writeFile, ensureDirectory, logFileCreated, exists } from '../utils/file.js';
import { renderTemplate } from '../templates/engine.js';

export async function generateService(options: GeneratorOptions): Promise<void> {
  const { name, packageName, directory, module, crud, lombok, jpa } = options;
  
  const className = toPascalCase(name);
  const serviceName = className.endsWith('Service') ? className : `${className}Service`;
  const serviceImplName = `${serviceName}Impl`;
  
  const packagePath = packageToPath(packageName);
  const targetDir = path.join(
    process.cwd(),
    directory,
    packagePath,
    module ? `${module}/service` : 'service'
  );
  
  ensureDirectory(targetDir);
  
  const templateData: TemplateData = {
    className: serviceName,
    classNameLower: toCamelCase(serviceName),
    classNameCamel: toCamelCase(className),
    packageName: module 
      ? `${packageName}.${module}.service`
      : `${packageName}.service`,
    entityName: className,
    entityNameLower: toCamelCase(className),
    moduleName: module,
    hasLombok: lombok ?? true,
    hasJpa: jpa ?? true,
    hasCrud: crud ?? false,
    hasRest: true,
  };
  
  // Generate Service Interface
  const interfaceContent = await renderTemplate('service', templateData);
  const interfacePath = path.join(targetDir, `${serviceName}.java`);
  
  if (!exists(interfacePath)) {
    writeFile(interfacePath, interfaceContent);
    logFileCreated(path.relative(process.cwd(), interfacePath));
  } else {
    console.log(`  Service ${serviceName} already exists, skipping...`);
  }
  
  // Generate Service Implementation
  const implTemplateData: TemplateData = {
    ...templateData,
    className: serviceImplName,
    classNameLower: toCamelCase(serviceImplName),
    packageName: module 
      ? `${packageName}.${module}.service.impl`
      : `${packageName}.service.impl`,
  };
  
  const implTargetDir = path.join(targetDir, 'impl');
  ensureDirectory(implTargetDir);
  
  const implContent = await renderTemplate('service-impl', implTemplateData);
  const implPath = path.join(implTargetDir, `${serviceImplName}.java`);
  
  if (!exists(implPath)) {
    writeFile(implPath, implContent);
    logFileCreated(path.relative(process.cwd(), implPath));
  }
}
