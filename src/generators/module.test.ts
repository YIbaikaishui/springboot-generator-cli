import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateModule } from './module.js';

describe('generateModule', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'springboot-generate-module-'));
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('generates the default DDD/Modulith-ready module layout', async () => {
    await generateModule({
      name: 'User',
      packageName: 'com.example.demo',
      directory: 'src/main/java',
      style: 'ddd-modulith',
      jpa: true,
      lombok: true,
    });

    const javaRoot = path.join(
      tempDir,
      'src/main/java/com/example/demo/user',
    );

    const expectedFiles = [
      'api/UserController.java',
      'api/UserCreateRequest.java',
      'api/UserUpdateRequest.java',
      'api/UserResponse.java',
      'application/UserApplicationService.java',
      'domain/User.java',
      'domain/UserRepository.java',
      'infrastructure/persistence/UserJpaEntity.java',
      'infrastructure/persistence/UserJpaRepository.java',
      'infrastructure/persistence/UserRepositoryImpl.java',
    ];

    for (const file of expectedFiles) {
      expect(fs.existsSync(path.join(javaRoot, file)), file).toBe(true);
    }

    const controller = fs.readFileSync(
      path.join(javaRoot, 'api/UserController.java'),
      'utf-8',
    );
    expect(controller).toContain(
      'import com.example.demo.user.application.UserApplicationService;',
    );
    expect(controller).toContain(
      'import com.example.demo.user.api.UserCreateRequest;',
    );
    expect(controller).toContain('@RequestMapping("/api/users")');

    const repositoryImpl = fs.readFileSync(
      path.join(javaRoot, 'infrastructure/persistence/UserRepositoryImpl.java'),
      'utf-8',
    );
    expect(repositoryImpl).toContain(
      'import com.example.demo.user.domain.UserRepository;',
    );
    expect(repositoryImpl).toContain(
      'implements UserRepository',
    );
  });

  it('preserves the legacy layered module layout when requested', async () => {
    await generateModule({
      name: 'User',
      packageName: 'com.example.demo',
      directory: 'src/main/java',
      style: 'layered',
      jpa: true,
      lombok: true,
    });

    const javaRoot = path.join(
      tempDir,
      'src/main/java/com/example/demo/user',
    );

    const expectedFiles = [
      'controller/UserController.java',
      'service/UserService.java',
      'service/impl/UserServiceImpl.java',
      'repository/UserRepository.java',
      'entity/User.java',
      'dto/UserRequest.java',
      'dto/UserResponse.java',
    ];

    for (const file of expectedFiles) {
      expect(fs.existsSync(path.join(javaRoot, file)), file).toBe(true);
    }

    const controller = fs.readFileSync(
      path.join(javaRoot, 'controller/UserController.java'),
      'utf-8',
    );
    expect(controller).toContain(
      'import com.example.demo.user.dto.UserRequest;',
    );
    expect(controller).toContain(
      'import com.example.demo.user.service.UserService;',
    );
  });
});
