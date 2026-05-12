---
name: springboot-generator
description: Use when creating a new Spring Boot project, generating DDD-friendly modules inside an existing Spring Boot codebase, or standardizing Spring Boot scaffolding with compile-safe defaults instead of ad hoc AI output
---

# SpringBoot Generator

## Overview

This skill wraps the `springboot-generator-cli` project. The CLI is the engine; this skill is the workflow layer that helps an agent pick the right command, prefer the `ddd-modulith` structure, and verify the generated output.

Read [references/usage.md](references/usage.md) for the exact commands before running the generator.

## When to Use

Use this skill when:

- the user wants a new Spring Boot project scaffolded quickly
- the user wants a feature module generated in `api / application / domain / infrastructure`
- the user wants a stable Spring Boot directory structure instead of one-off AI-generated files
- the user wants generated code that is easy to compile and review

Do not use this skill when:

- the user only wants architecture discussion without generating code
- the user wants a hand-written custom domain model that should not follow the CLI templates
- the user is working outside the Spring Boot generator repo and cannot run either the published CLI or the local built CLI

## Workflow

1. Decide whether this is a new project or an existing Spring Boot project.
2. Prefer `ddd-modulith` unless the user explicitly asks for compatibility mode.
3. If the module has concrete business fields, use `--fields` instead of accepting the default demo fields.
4. Prefer the published CLI via `npx springboot-generator-cli@latest`.
5. Only fall back to `node dist/cli.js` when working inside this repo and `dist/cli.js` is available.
6. After generation, verify the result with a compile command when practical.

## Defaults

- Default project style: `ddd-modulith`
- Default module workflow: `sg g module <Name>`
- Compatibility mode: `--style layered`
- Business field customization: `--fields "name:string,price:decimal"`

## Important Constraints

- For `ddd-modulith`, the current CLI intentionally keeps the CRUD + REST + JPA baseline.
- `--no-crud`, `--no-rest`, and `--no-jpa` are not supported for DDD modules.
- This skill should not invent a second code-generation path; it should call the CLI.
