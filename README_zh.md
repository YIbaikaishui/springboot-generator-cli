# SpringBoot Generator CLI

<p align="center">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/%E5%88%87%E6%8D%A2%E5%88%B0%E8%8B%B1%E6%96%87-README.md-1677ff?style=for-the-badge" alt="切换到英文版 README" />
  </a>
</p>

<p align="center">
  <strong>面向 AI 工作流、可编译验证的 Spring Boot 脚手架工具，默认采用 DDD 友好和 Modulith Ready 的结构，并提供可安装的 Codex Skill。</strong>
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
  <a href="#通过-codex--skillssh-使用">Codex Skill</a> ·
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
- CLI 是核心执行引擎，附带的 Skill 是给 Codex 等 agent 用的工作流封装层

## 为什么这样组织

传统的全局目录，比如 `controller/`、`service/`、`repository/`、`entity/`、`dto/`，一开始看起来简单，但项目变大后通常会变得不好维护。

常见问题包括：

- 一个功能被拆散到很多目录里
- 模块边界不清晰
- `service` 容易变成又大又杂的流程类
- 跨目录改动难以审查

这个项目把“按业务模块组织代码”作为默认方式，让每个功能模块都更容易阅读、测试和扩展。

## 为什么不是直接让 AI 生成

AI 可以生成 Spring Boot 代码，但团队仍然需要稳定脚手架。

- prompt 会漂，但目录结构不应该漂
- 临时生成的输出经常在 import、构建文件、持久化 wiring 上不稳定
- agent 需要可重复执行、可验证的命令，而不是每次重新发明结构

这个项目的价值不是替代 AI，而是给 AI 和 agent 提供一个可复用的基础能力：确定性的、可编译验证的 Spring Boot 结构生成。

## 特性

- DDD 友好的模块脚手架
- Modulith 风格的包结构
- 通过 `--fields` 自定义业务字段
- 可安装到 Codex 等 agent 的 Skill
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

### 直接通过 npx 运行

```bash
npx springboot-generator-cli@latest --help
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

使用自定义业务字段：

```bash
sg g module Product --fields "name:string,price:decimal,active:boolean"
```

### 使用旧式兼容模式

```bash
sg new old-style-app --style layered
sg g module User --style layered
sg g controller User --style layered
```

## 通过 Codex / skills.sh 使用

安装 Skill：

```bash
npx skills add https://github.com/YIbaikaishui/springboot-generator-cli --skill springboot-generator
```

适用场景：

- 让 agent 生成新的 Spring Boot 项目骨架
- 在现有项目里生成 DDD 风格业务模块
- 希望优先使用稳定、可编译验证的脚手架，而不是一次性 AI 输出

Skill 的定位：

- CLI 是 engine
- Skill 是分发层和工作流层
- 默认优先调用 `npx springboot-generator-cli@latest`
- 在本仓库开发时可回退到 `node dist/cli.js`

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

| 选项                          | 说明                                           |
| ----------------------------- | ---------------------------------------------- |
| `-f, --fields <fields>`       | 模块业务字段，例如 `name:string,price:decimal` |
| `-p, --package <package>`     | 包名后缀                                       |
| `-d, --directory <directory>` | 目标目录，默认 `src/main/java`                 |
| `-m, --module <module>`       | 显式指定模块目录名                             |
| `-s, --style <style>`         | 模块风格：`ddd-modulith` 或 `layered`          |
| `--no-crud`                   | 跳过 CRUD 风格样板代码                         |
| `--no-rest`                   | 跳过 REST 接口                                 |
| `--no-jpa`                    | 跳过 JPA 相关输出                              |
| `--no-lombok`                 | 跳过 Lombok 注解                               |

当前 v1 说明：

- `ddd-modulith` 目前有意保持默认的 CRUD + REST + JPA 基线
- 对 DDD 模块使用 `--no-crud`、`--no-rest`、`--no-jpa` 时，CLI 会明确提示当前暂不支持

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
- `npm pack --dry-run`

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
