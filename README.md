<h1 align="center">SpringBoot Generator CLI</h1>

<p align="center">
  <strong>🚀 类似 NestJS CLI 的 Spring Boot 模块化代码生成工具</strong>
</p>

<p align="center">
  <a href="#特性">特性</a> •
  <a href="#安装">安装</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#命令详解">命令详解</a> •
  <a href="#开发指南">开发指南</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node Version" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.x-green" alt="Spring Boot" />
</p>

---

## 特性

- ⚡ **快速创建项目** - 交互式创建 Spring Boot 项目，支持 Maven/Gradle
- 📦 **模块化生成** - 一键生成 Controller、Service、Repository、Entity、DTO
- 🎨 **最佳实践** - 生成的代码遵循 Spring Boot 最佳实践
- 🔧 **高度可配置** - 支持 Lombok、JPA、自定义包名等选项
- 💡 **智能命名** - 自动处理 PascalCase、camelCase 命名转换
- 📝 **模板自定义** - 基于 EJS 模板，可轻松扩展

## 安装

```bash
# 使用 npm
npm install -g springboot-generator-cli

# 使用 yarn
yarn global add springboot-generator-cli

# 使用 pnpm
pnpm add -g springboot-generator-cli
```

## 快速开始

### 创建新项目

```bash
# 交互式创建 Spring Boot 项目
sg new my-project

# 指定包名
sg new my-project -p com.mycompany.app

# 指定目标目录
sg new my-project -d D:\projects
```

创建项目时会交互式选择：
- 构建工具（Maven / Gradle）
- Java 版本（11 / 17 / 21）
- Spring Boot 版本
- 依赖项（Web、JPA、Security、Lombok 等）

### 生成模块代码

```bash
# 生成完整模块（推荐）
sg generate module User
sg g module User

# 生成单个组件
sg g controller User      # Controller
sg g service User         # Service + ServiceImpl
sg g repository User      # Repository
sg g entity User          # Entity
sg g dto User             # Request + Response DTO
```

### 查看项目信息

```bash
sg info
```

## 命令详解

### `sg new <name>`

创建新的 Spring Boot 项目。

| 选项 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| `--package` | `-p` | 基础包名 | `com.example` |
| `--directory` | `-d` | 目标目录 | 当前目录 |

### `sg generate <type> <name>` / `sg g <type> <name>`

生成代码文件。

**支持的类型：**

| 类型 | 说明 |
|------|------|
| `module` | 完整模块（Entity + Repository + Service + Controller + DTO） |
| `controller` | REST Controller |
| `service` | Service 接口 + 实现类 |
| `repository` | JPA Repository |
| `entity` | JPA Entity |
| `dto` | Request DTO + Response DTO |

**选项：**

| 选项 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| `--package` | `-p` | 包名后缀 | - |
| `--directory` | `-d` | 目标目录 | `src/main/java` |
| `--module` | `-m` | 模块名称 | - |
| `--crud` | | 生成 CRUD 操作 | `false` |
| `--lombok` | | 使用 Lombok 注解 | `true` |
| `--jpa` | | 使用 JPA 注解 | `true` |

### `sg info`

显示当前 Spring Boot 项目信息，包括：
- 构建工具
- Spring Boot 版本
- Java 版本
- 基础包名

## 项目结构

### 标准结构

```
src/main/java/com/example/
├── controller/
│   └── UserController.java
├── service/
│   ├── UserService.java
│   └── impl/
│       └── UserServiceImpl.java
├── repository/
│   └── UserRepository.java
├── entity/
│   └── User.java
└── dto/
    ├── UserRequest.java
    └── UserResponse.java
```

### 模块化结构

```bash
sg g module User -m user
```

```
src/main/java/com/example/
└── user/
    ├── controller/
    │   └── UserController.java
    ├── service/
    │   ├── UserService.java
    │   └── impl/
    │       └── UserServiceImpl.java
    ├── repository/
    │   └── UserRepository.java
    ├── entity/
    │   └── User.java
    └── dto/
        ├── UserRequest.java
        └── UserResponse.java
```

## 生成的代码示例

<details>
<summary><b>Entity 示例</b></summary>

```java
package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

</details>

<details>
<summary><b>Controller 示例</b></summary>

```java
package com.example.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserResponse> create(@RequestBody @Valid UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid UserRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

</details>

## 命令对比

| NestJS CLI | SpringBoot CLI |
|------------|----------------|
| `nest new project` | `sg new project` |
| `nest g module user` | `sg g module User` |
| `nest g controller user` | `sg g controller User` |
| `nest g service user` | `sg g service User` |

## 开发指南

### 环境要求

- Node.js >= 18.0.0
- npm / yarn / pnpm

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-username/springboot-generator-cli.git

# 安装依赖
cd springboot-generator-cli
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build

# 运行测试
npm test

# 代码检查
npm run lint
```

### 项目结构

```
springboot-generator-cli/
├── src/
│   ├── cli.ts              # CLI 入口
│   ├── commands/           # 命令处理
│   │   ├── generate.ts
│   │   ├── new.ts
│   │   └── info.ts
│   ├── generators/         # 代码生成器
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   ├── repository.ts
│   │   ├── entity.ts
│   │   ├── dto.ts
│   │   └── module.ts
│   ├── templates/          # 模板引擎
│   │   └── engine.ts
│   ├── types/              # 类型定义
│   │   └── index.ts
│   └── utils/              # 工具函数
│       ├── naming.ts
│       └── file.ts
├── templates/              # EJS 模板文件
│   ├── controller.ejs
│   ├── service.ejs
│   ├── service-impl.ejs
│   ├── repository.ejs
│   ├── entity.ejs
│   ├── dto.ejs
│   ├── exception.ejs
│   └── config.ejs
├── package.json
├── tsconfig.json
└── README.md
```

### 自定义模板

模板位于 `templates/` 目录，使用 [EJS](https://ejs.co/) 语法。

**可用变量：**

| 变量 | 类型 | 说明 |
|------|------|------|
| `className` | string | 类名（PascalCase） |
| `classNameLower` | string | 类名（camelCase） |
| `packageName` | string | 包名 |
| `entityName` | string | 实体名 |
| `hasLombok` | boolean | 是否使用 Lombok |
| `hasJpa` | boolean | 是否使用 JPA |
| `fields` | array | 字段定义数组 |

## 贡献指南

欢迎贡献代码！请查看 [Contributing Guide](CONTRIBUTING.md) 了解详情。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 常见问题

<details>
<summary><b>如何更新已生成的代码？</b></summary>

目前生成器不会覆盖已存在的文件。如果需要更新，请先删除原文件或手动修改。
</details>

<details>
<summary><b>支持哪些 Java 版本？</b></summary>

支持 Java 11、17、21。生成的代码使用 Jakarta EE（Spring Boot 3.x）。
</details>

<details>
<summary><b>如何添加自定义字段？</b></summary>

生成器创建的是基础模板，请在生成后手动添加所需字段。后续版本将支持交互式字段定义。
</details>

## Roadmap

- [ ] 支持交互式字段定义
- [ ] 支持更多数据库类型（MongoDB、Redis）
- [ ] 支持生成测试代码
- [ ] 支持生成 Swagger/OpenAPI 文档
- [ ] 支持生成 Docker 配置
- [ ] 支持自定义模板目录

## License

[MIT](LICENSE) © 2024

---

<p align="center">
  如果这个项目对你有帮助，请给一个 ⭐️ Star！
</p>