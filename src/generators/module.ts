import chalk from 'chalk';
import path from 'path';
import type { GeneratorOptions, TemplateData } from '../types/index.js';
import {
  pluralize,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  packageToPath,
} from '../utils/naming.js';
import { ensureDirectory, exists, logFileCreated, writeFile } from '../utils/file.js';
import {
  buildDefaultBusinessFields,
  buildModuleFields,
  collectJavaImports,
} from '../utils/fields.js';
import { renderTemplate } from '../templates/engine.js';
import { generateController } from './controller.js';
import { generateDto } from './dto.js';
import { generateEntity } from './entity.js';
import { generateRepository } from './repository.js';
import { generateService } from './service.js';

export async function generateModule(options: GeneratorOptions): Promise<void> {
  const style = options.style ?? 'ddd-modulith';

  if (style === 'layered') {
    await generateLayeredModule(options);
    return;
  }

  await generateDddModule(options);
}

async function generateLayeredModule(options: GeneratorOptions): Promise<void> {
  const moduleName = toPascalCase(options.name);
  const modulePath = resolveModulePath(options);

  console.log(chalk.cyan(`\nGenerating legacy layered module: ${moduleName}`));
  console.log(chalk.gray('This will generate:'));
  console.log(chalk.gray(`  - Entity: ${moduleName}`));
  console.log(chalk.gray(`  - Repository: ${moduleName}Repository`));
  console.log(chalk.gray(`  - Service: ${moduleName}Service`));
  console.log(chalk.gray(`  - Controller: ${moduleName}Controller`));
  console.log(chalk.gray(`  - DTOs: ${moduleName}Request, ${moduleName}Response`));
  console.log();

  const moduleOptions: GeneratorOptions = {
    ...options,
    module: modulePath,
    style: 'layered',
    crud: true,
    rest: true,
  };

  await generateEntity(moduleOptions);
  await generateRepository(moduleOptions);
  await generateService(moduleOptions);
  await generateDto(moduleOptions);
  await generateController(moduleOptions);

  console.log();
  console.log(chalk.green(`✓ Legacy layered module ${moduleName} generated successfully!`));
}

async function generateDddModule(options: GeneratorOptions): Promise<void> {
  const entityName = toPascalCase(options.name);
  const data = buildDddTemplateData(options, entityName);
  const moduleRootDir = path.join(
    process.cwd(),
    options.directory,
    packageToPath(data.basePackage ?? '')
  );

  console.log(chalk.cyan(`\nGenerating DDD/Modulith-ready module: ${entityName}`));
  console.log(chalk.gray('This will generate:'));
  console.log(
    chalk.gray(
      `  - API: ${data.controllerName}, ${data.createRequestClassName}, ${data.updateRequestClassName}, ${data.responseClassName}`
    )
  );
  console.log(chalk.gray(`  - Application: ${data.applicationServiceName}`));
  console.log(chalk.gray(`  - Domain: ${entityName}, ${data.repositoryInterfaceName}`));
  console.log(
    chalk.gray(
      `  - Infrastructure: ${data.jpaEntityName}, ${data.jpaRepositoryName}, ${data.repositoryImplName}`
    )
  );
  console.log();

  await generateDddFile(moduleRootDir, 'api', `${data.controllerName}.java`, 'ddd/api-controller', {
    ...data,
    className: data.controllerName ?? '',
    classNameLower: toCamelCase(data.controllerName ?? ''),
    classNameCamel: toCamelCase(entityName),
    packageName: data.apiPackage ?? '',
    artifactKind: 'api-controller',
  });
  await generateDddFile(
    moduleRootDir,
    'api',
    `${data.createRequestClassName}.java`,
    'ddd/api-request',
    {
      ...data,
      className: data.createRequestClassName ?? '',
      classNameLower: toCamelCase(data.createRequestClassName ?? ''),
      classNameCamel: toCamelCase(entityName),
      packageName: data.apiPackage ?? '',
      artifactKind: 'api-create-request',
      imports: [
        ...collectJavaImports(data.businessFields ?? []),
        ...((data.businessFields ?? []).some((field) => field.isEmail)
          ? ['jakarta.validation.constraints.Email']
          : []),
        ...((data.businessFields ?? []).some((field) => field.isString)
          ? ['jakarta.validation.constraints.NotBlank']
          : []),
      ],
    }
  );
  await generateDddFile(
    moduleRootDir,
    'api',
    `${data.updateRequestClassName}.java`,
    'ddd/api-request',
    {
      ...data,
      className: data.updateRequestClassName ?? '',
      classNameLower: toCamelCase(data.updateRequestClassName ?? ''),
      classNameCamel: toCamelCase(entityName),
      packageName: data.apiPackage ?? '',
      artifactKind: 'api-update-request',
      imports: [
        ...collectJavaImports(data.businessFields ?? []),
        ...((data.businessFields ?? []).some((field) => field.isEmail)
          ? ['jakarta.validation.constraints.Email']
          : []),
        ...((data.businessFields ?? []).some((field) => field.isString)
          ? ['jakarta.validation.constraints.NotBlank']
          : []),
      ],
    }
  );
  await generateDddFile(
    moduleRootDir,
    'api',
    `${data.responseClassName}.java`,
    'ddd/api-response',
    {
      ...data,
      className: data.responseClassName ?? '',
      classNameLower: toCamelCase(data.responseClassName ?? ''),
      classNameCamel: toCamelCase(entityName),
      packageName: data.apiPackage ?? '',
      artifactKind: 'api-response',
      imports: collectJavaImports(data.fields ?? []),
    }
  );
  await generateDddFile(
    moduleRootDir,
    'application',
    `${data.applicationServiceName}.java`,
    'ddd/application-service',
    {
      ...data,
      className: data.applicationServiceName ?? '',
      classNameLower: toCamelCase(data.applicationServiceName ?? ''),
      classNameCamel: toCamelCase(entityName),
      packageName: data.applicationPackage ?? '',
      artifactKind: 'application-service',
    }
  );
  await generateDddFile(moduleRootDir, 'domain', `${entityName}.java`, 'ddd/domain-entity', {
    ...data,
    className: entityName,
    classNameLower: toCamelCase(entityName),
    classNameCamel: toCamelCase(entityName),
    packageName: data.domainPackage ?? '',
    artifactKind: 'domain-entity',
    imports: [
      ...collectJavaImports(data.fields ?? []),
      ...((data.businessFields ?? []).some((field) => field.isString) ? ['java.util.Objects'] : []),
    ],
  });
  await generateDddFile(
    moduleRootDir,
    'domain',
    `${data.repositoryInterfaceName}.java`,
    'ddd/domain-repository',
    {
      ...data,
      className: data.repositoryInterfaceName ?? '',
      classNameLower: toCamelCase(data.repositoryInterfaceName ?? ''),
      classNameCamel: toCamelCase(entityName),
      packageName: data.domainPackage ?? '',
      artifactKind: 'domain-repository',
    }
  );
  await generateDddFile(
    moduleRootDir,
    path.join('infrastructure', 'persistence'),
    `${data.jpaEntityName}.java`,
    'ddd/infrastructure-jpa-entity',
    {
      ...data,
      className: data.jpaEntityName ?? '',
      classNameLower: toCamelCase(data.jpaEntityName ?? ''),
      classNameCamel: toCamelCase(entityName),
      packageName: data.persistencePackage ?? '',
      artifactKind: 'infrastructure-jpa-entity',
      imports: collectJavaImports(data.fields ?? []),
    }
  );
  await generateDddFile(
    moduleRootDir,
    path.join('infrastructure', 'persistence'),
    `${data.jpaRepositoryName}.java`,
    'ddd/infrastructure-jpa-repository',
    {
      ...data,
      className: data.jpaRepositoryName ?? '',
      classNameLower: toCamelCase(data.jpaRepositoryName ?? ''),
      classNameCamel: toCamelCase(entityName),
      packageName: data.persistencePackage ?? '',
      artifactKind: 'infrastructure-jpa-repository',
    }
  );
  await generateDddFile(
    moduleRootDir,
    path.join('infrastructure', 'persistence'),
    `${data.repositoryImplName}.java`,
    'ddd/infrastructure-repository-impl',
    {
      ...data,
      className: data.repositoryImplName ?? '',
      classNameLower: toCamelCase(data.repositoryImplName ?? ''),
      classNameCamel: toCamelCase(entityName),
      packageName: data.persistencePackage ?? '',
      artifactKind: 'infrastructure-repository-impl',
      imports: collectJavaImports(data.fields ?? []),
    }
  );

  console.log();
  console.log(chalk.green(`✓ DDD/Modulith-ready module ${entityName} generated successfully!`));
}

function buildDddTemplateData(options: GeneratorOptions, entityName: string): TemplateData {
  const modulePath = resolveModulePath(options);
  const basePackage = `${options.packageName}.${modulePath}`;
  const entityNameLower = toCamelCase(entityName);
  const businessFields = options.fields?.length ? options.fields : buildDefaultBusinessFields();
  const fields = buildModuleFields(businessFields);

  return {
    className: entityName,
    classNameLower: entityNameLower,
    classNameCamel: entityNameLower,
    packageName: basePackage,
    style: 'ddd-modulith',
    entityName,
    entityNameLower,
    moduleName: modulePath,
    modulePath,
    basePackage,
    apiPackage: `${basePackage}.api`,
    applicationPackage: `${basePackage}.application`,
    domainPackage: `${basePackage}.domain`,
    infrastructurePackage: `${basePackage}.infrastructure`,
    persistencePackage: `${basePackage}.infrastructure.persistence`,
    createRequestClassName: `${entityName}CreateRequest`,
    updateRequestClassName: `${entityName}UpdateRequest`,
    responseClassName: `${entityName}Response`,
    controllerName: `${entityName}Controller`,
    applicationServiceName: `${entityName}ApplicationService`,
    repositoryInterfaceName: `${entityName}Repository`,
    repositoryImplName: `${entityName}RepositoryImpl`,
    jpaEntityName: `${entityName}JpaEntity`,
    jpaRepositoryName: `${entityName}JpaRepository`,
    routeName: pluralize(entityNameLower),
    tableName: pluralize(toSnakeCase(entityName)),
    hasLombok: options.lombok ?? true,
    hasJpa: options.jpa ?? true,
    hasCrud: true,
    hasRest: true,
    fields,
    businessFields,
  };
}

async function generateDddFile(
  moduleRootDir: string,
  relativeDir: string,
  fileName: string,
  templateName: string,
  templateData: TemplateData
): Promise<void> {
  const targetDir = path.join(moduleRootDir, relativeDir);
  const filePath = path.join(targetDir, fileName);

  ensureDirectory(targetDir);

  if (exists(filePath)) {
    console.log(`  ${fileName} already exists, skipping...`);
    return;
  }

  const content = await renderTemplate(templateName, templateData);
  writeFile(filePath, content);
  logFileCreated(path.relative(process.cwd(), filePath));
}

function resolveModulePath(options: GeneratorOptions): string {
  return toCamelCase(options.module || options.name);
}
