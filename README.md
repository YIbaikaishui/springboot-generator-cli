# SpringBoot Generator CLI

<p align="center">
  <a href="./README_zh.md">
    <img src="https://img.shields.io/badge/Read%20in%20Chinese-README_zh.md-1677ff?style=for-the-badge" alt="Read in Chinese" />
  </a>
</p>

<p align="center">
  <strong>DDD-friendly Spring Boot scaffolding with a Modulith-ready layout and a legacy layered compatibility mode.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js 18+" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.x" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.x-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot 3.5.x" />
  <img src="https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Architecture-DDD%20%2B%20Modulith--ready-1F6FEB" alt="DDD and Modulith ready" />
  <img src="https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white" alt="CI GitHub Actions" />
</p>

<p align="center">
  <a href="#overview">Overview</a> ·
  <a href="#why-this-structure">Why this structure</a> ·
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#generated-structure">Generated Structure</a> ·
  <a href="#commands">Commands</a> ·
  <a href="#development">Development</a>
</p>

---

## Overview

SpringBoot Generator CLI is a TypeScript-based CLI for generating modern Spring Boot projects and business modules.

It defaults to a pragmatic architecture:

- `sg new` creates a fresh Spring Boot project baseline
- `sg g module` generates feature modules in `api / application / domain / infrastructure`
- `--style layered` keeps the old layered generators available for compatibility
- v1 follows Modulith-style package boundaries without forcing Spring Modulith as a hard dependency

## Why This Structure

Classic global folders like `controller/`, `service/`, `repository/`, `entity/`, and `dto/` look simple at first, but they usually age badly.

They tend to create:

- scattered feature logic
- weak module ownership
- large procedural service classes
- hard-to-review cross-folder changes

This project makes package-by-feature the default so each business module stays easy to read, test, and extend.

## Features

- DDD-friendly module scaffolding
- Modulith-ready package layout
- Legacy layered compatibility mode
- EJS templates with explicit imports
- TypeScript tests, CI, and Maven smoke compilation
- Simple CLI commands with a low learning curve

## Quick Start

### Install

```bash
npm install
npm run build
```

### Run locally

```bash
npm start -- --help
```

### Create a project

```bash
sg new demo-app
cd demo-app
```

Recommended defaults:

- Style: `ddd-modulith`
- Java: `21`
- Spring Boot: `3.5.x`
- Common starter set: `web`, `jpa`, `validation`, `lombok`, `h2`

### Generate a module

```bash
sg g module User
```

### Use legacy compatibility mode

```bash
sg new old-style-app --style layered
sg g module User --style layered
sg g controller User --style layered
```

## Generated Structure

Default module output:

```text
user/
├── api/
│   ├── UserController.java
│   ├── UserCreateRequest.java
│   ├── UserUpdateRequest.java
│   └── UserResponse.java
├── application/
│   └── UserApplicationService.java
├── domain/
│   ├── User.java
│   └── UserRepository.java
└── infrastructure/
    └── persistence/
        ├── UserJpaEntity.java
        ├── UserJpaRepository.java
        └── UserRepositoryImpl.java
```

Responsibilities:

- `api`: HTTP entrypoints and request or response models
- `application`: use-case orchestration and transaction boundaries
- `domain`: business model and repository abstraction
- `infrastructure`: persistence and external implementation details

## Commands

### `sg new <name>`

Create a new Spring Boot project.

| Option                        | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| `-p, --package <package>`     | Base package name, default `com.example`                           |
| `-d, --directory <directory>` | Target directory                                                   |
| `-s, --style <style>`         | Project style: `ddd-modulith` or `layered`, default `ddd-modulith` |

### `sg generate <type> <name>` / `sg g <type> <name>`

Generate code artifacts.

Supported types:

- `module` - recommended
- `controller` - legacy layered generator
- `service` - legacy layered generator
- `repository` - legacy layered generator
- `entity` - legacy layered generator
- `dto` - legacy layered generator

| Option                        | Description                                                       |
| ----------------------------- | ----------------------------------------------------------------- |
| `-p, --package <package>`     | Package name suffix                                               |
| `-d, --directory <directory>` | Target directory, default `src/main/java`                         |
| `-m, --module <module>`       | Explicit module directory name                                    |
| `-s, --style <style>`         | Module style: `ddd-modulith` or `layered`, default `ddd-modulith` |
| `--crud`                      | Generate CRUD operations                                          |
| `--rest`                      | Generate REST endpoints                                           |
| `--jpa`                       | Include JPA-related behavior                                      |
| `--lombok`                    | Include Lombok-related behavior                                   |

### `sg info`

Inspect the current Spring Boot project and print basic metadata.

## Development

```bash
npm install
npm run build
npx vitest run
```

Smoke compile the generated Maven project:

```bash
npm run smoke:maven
```

If your default `JAVA_HOME` is not Java 21, override it:

```bash
SMOKE_JAVA_HOME=/path/to/jdk-21 npm run smoke:maven
```

Windows PowerShell:

```powershell
$env:SMOKE_JAVA_HOME='C:\path\to\jdk-21'
npm run smoke:maven
```

Current CI checks:

- `npm run build`
- `npx vitest run`
- `npm run smoke:maven`

## Repository Layout

```text
src/
├── cli.ts
├── commands/
├── generators/
├── templates/
├── types/
└── utils/

templates/
├── ddd/
└── *.ejs
```

## Roadmap

- optional Spring Modulith starter support
- richer aggregate and domain event templates
- stricter port and adapter generation mode
- richer test template generation
- customizable template preset system

## License

MIT
