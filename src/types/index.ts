export interface GeneratorOptions {
  name: string;
  packageName: string;
  module?: string;
  directory: string;
  crud?: boolean;
  rest?: boolean;
  jpa?: boolean;
  lombok?: boolean;
}

export interface GenerateCommandOptions {
  package?: string;
  directory?: string;
  module?: string;
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
  | 'module'
  | 'mapper'
  | 'config'
  | 'exception';

export interface TemplateData {
  className: string;
  classNameLower: string;
  classNameCamel: string;
  packageName: string;
  entityName?: string;
  entityNameLower?: string;
  moduleName?: string;
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
