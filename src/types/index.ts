export type GeneratorStyle = 'ddd-modulith' | 'layered';

export interface GeneratorOptions {
  name: string;
  packageName: string;
  module?: string;
  directory: string;
  style?: GeneratorStyle;
  crud?: boolean;
  rest?: boolean;
  jpa?: boolean;
  lombok?: boolean;
}

export interface GenerateCommandOptions {
  package?: string;
  directory?: string;
  module?: string;
  style?: GeneratorStyle;
  crud?: boolean;
  rest?: boolean;
  jpa?: boolean;
  lombok?: boolean;
}

export interface ProjectConfig {
  name: string;
  packageName: string;
  javaVersion: string;
  springBootVersion: string;
  dependencies: string[];
}

export type GeneratorType = 
  | 'controller' 
  | 'service' 
  | 'repository' 
  | 'entity' 
  | 'dto' 
  | 'module';

export interface TemplateData {
  className: string;
  classNameLower: string;
  classNameCamel: string;
  packageName: string;
  style?: GeneratorStyle;
  entityName?: string;
  entityNameLower?: string;
  moduleName?: string;
  modulePath?: string;
  artifactKind?: string;
  basePackage?: string;
  apiPackage?: string;
  applicationPackage?: string;
  domainPackage?: string;
  infrastructurePackage?: string;
  persistencePackage?: string;
  entityPackage?: string;
  dtoPackage?: string;
  servicePackage?: string;
  repositoryPackage?: string;
  createRequestClassName?: string;
  updateRequestClassName?: string;
  requestClassName?: string;
  responseClassName?: string;
  controllerName?: string;
  applicationServiceName?: string;
  repositoryInterfaceName?: string;
  repositoryImplName?: string;
  jpaEntityName?: string;
  jpaRepositoryName?: string;
  routeName?: string;
  tableName?: string;
  hasLombok: boolean;
  hasJpa: boolean;
  hasCrud: boolean;
  hasRest: boolean;
  fields?: FieldDefinition[];
  imports?: string[];
}

export interface FieldDefinition {
  name: string;
  type: string;
  isId?: boolean;
  isNullable?: boolean;
  columnDefinition?: string;
}

export interface CliConfig {
  defaultPackage: string;
  defaultDirectory: string;
  lombok: boolean;
  jpa: boolean;
  author?: string;
}

export const DEFAULT_CONFIG: CliConfig = {
  defaultPackage: 'com.example',
  defaultDirectory: 'src/main/java',
  lombok: true,
  jpa: true,
};
