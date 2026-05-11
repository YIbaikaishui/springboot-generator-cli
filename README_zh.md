# SpringBoot Generator CLI

<p align="center">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/%E5%88%87%E6%8D%A2%E5%88%B0%E8%8B%B1%E6%96%87-README.md-1677ff?style=for-the-badge" alt="切换到英文版 README" />
  </a>
</p>

<p align="center">
  <strong>面向 DDD 的 Spring Boot 脚手架工具，默认采用 Modulith 风格结构，同时保留旧式分层模式的兼容生成能力。</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js 18+" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.x" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.x-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot 3.5.x" />
  <img src="https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/架构-DDD%20%2B%20Modulith%20Ready-1F6FEB" alt="DDD and Modulith ready" />
  <img src="https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white" alt="CI GitHub Actions" />
</p>

<p align="center">
  <a href="#项目简介">项目简介</a> ·
  <a href="#为什么这样组织">为什么这样组织</a> ·
  <a href="#特性">特性</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#生成结构">生成结构</a> ·
  <a href="#命令说明">命令说明</a> ·
  <a href="#开发">开发</a>
</p>

---

## 项目简介

SpringBoot Generator CLI 是一个基于 TypeScript 的命令行工具，用来生成现代 Spring Boot 项目和业务模块。

它默认遵循一套比较务实的结构约定：

- `sg new` 先创建一个新的 Spring Boot 项目骨架
- `sg g module` 默认生成 `api / application / domain / infrastructure` 模块结构
- `--style layered` 保留旧式分层生成方式，方便兼容历史项目
- 第一版采用 Modulith 风格的包组织，但不强制引入 Spring Modulith 依赖

## 为什么这样组织

传统的全局目录，比如 `controller/`、`service/`、`repository/`、`entity/`、`dto/`，一开始看起来简单，但项目变大后通常会变得不好维护。

常见问题包括：

- 一个功能被拆散到很多目录里
- 模块边界不清晰
- `service` 容易变成又大又杂的流程类
- 跨目录改动难以审查

这个项目把“按业务模块组织代码”作为默认方式，让每个功能模块都更容易阅读、测试和扩展。

## 特性

- DDD 友好的模块脚手架
- Modulith 风格的包结构
- 旧式分层模式兼容生成
- 使用 EJS 模板并显式处理 import
- 带 TypeScript 测试、CI 和 Maven 冒烟编译
- 命令简单，学习成本低

## 快速开始

### 安装

```bash
npm install
npm run build
```

### 本地运行

```bash
npm start -- --help
```

### 创建项目

```bash
sg new demo-app
cd demo-app
```

推荐默认值：

- 风格：`ddd-modulith`
- Java：`21`
- Spring Boot：`3.5.x`
- 常见 starter：`web`、`jpa`、`validation`、`lombok`、`h2`

### 生成模块

```bash
sg g module User
```

### 使用旧式兼容模式

```bash
sg new old-style-app --style layered
sg g module User --style layered
sg g controller User --style layered
```

## 生成结构

默认模块输出如下：

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

各层职责：

- `api`：HTTP 入口、请求和响应模型
- `application`：用例编排和事务边界
- `domain`：业务模型和仓储抽象
- `infrastructure`：持久化和外部实现细节

## 命令说明

### `sg new <name>`

创建一个新的 Spring Boot 项目。

| 选项                          | 说明                                  |
| ----------------------------- | ------------------------------------- |
| `-p, --package <package>`     | 基础包名，默认 `com.example`          |
| `-d, --directory <directory>` | 目标目录                              |
| `-s, --style <style>`         | 项目风格：`ddd-modulith` 或 `layered` |

### `sg generate <type> <name>` / `sg g <type> <name>`

生成代码结构。

支持的类型：

- `module` - 推荐
- `controller` - 旧式分层兼容生成器
- `service` - 旧式分层兼容生成器
- `repository` - 旧式分层兼容生成器
- `entity` - 旧式分层兼容生成器
- `dto` - 旧式分层兼容生成器

| 选项                          | 说明                                  |
| ----------------------------- | ------------------------------------- |
| `-p, --package <package>`     | 包名后缀                              |
| `-d, --directory <directory>` | 目标目录，默认 `src/main/java`        |
| `-m, --module <module>`       | 显式指定模块目录名                    |
| `-s, --style <style>`         | 模块风格：`ddd-modulith` 或 `layered` |
| `--crud`                      | 生成 CRUD 操作                        |
| `--rest`                      | 生成 REST 接口                        |
| `--jpa`                       | 包含 JPA 相关行为                     |
| `--lombok`                    | 包含 Lombok 相关行为                  |

### `sg info`

检查当前 Spring Boot 项目并输出基础信息。

## 开发

```bash
npm install
npm run build
npx vitest run
```

冒烟编译生成的 Maven 项目：

```bash
npm run smoke:maven
```

如果默认 `JAVA_HOME` 不是 Java 21，可以手动覆盖：

```bash
SMOKE_JAVA_HOME=/path/to/jdk-21 npm run smoke:maven
```

Windows PowerShell：

```powershell
$env:SMOKE_JAVA_HOME='C:\path\to\jdk-21'
npm run smoke:maven
```

当前 CI 检查：

- `npm run build`
- `npx vitest run`
- `npm run smoke:maven`

## 仓库结构

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

## 路线图

- 可选的 Spring Modulith starter 支持
- 更丰富的聚合根和领域事件模板
- 更严格的端口和适配器生成模式
- 更丰富的测试模板生成
- 可自定义的模板预设系统

## 许可证

MIT
