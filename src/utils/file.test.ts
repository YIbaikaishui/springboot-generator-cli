import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  ensureDirectory,
  writeFile,
  exists,
  readFile,
  remove,
  isSpringBootProject,
} from './file.js';

const TEST_DIR = path.join(process.cwd(), 'test-temp');

describe('file utilities', () => {
  beforeEach(() => {
    // Clean up test directory before each test
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test directory after each test
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('ensureDirectory', () => {
    it('should create directory if not exists', () => {
      const dir = path.join(TEST_DIR, 'new-dir');
      ensureDirectory(dir);
      expect(fs.existsSync(dir)).toBe(true);
    });

    it('should not throw if directory already exists', () => {
      const dir = path.join(TEST_DIR, 'existing-dir');
      fs.mkdirSync(dir, { recursive: true });
      expect(() => ensureDirectory(dir)).not.toThrow();
    });

    it('should create nested directories', () => {
      const dir = path.join(TEST_DIR, 'nested', 'deep', 'dir');
      ensureDirectory(dir);
      expect(fs.existsSync(dir)).toBe(true);
    });
  });

  describe('writeFile', () => {
    it('should write content to file', () => {
      const filePath = path.join(TEST_DIR, 'test.txt');
      writeFile(filePath, 'Hello World');
      expect(fs.readFileSync(filePath, 'utf-8')).toBe('Hello World');
    });

    it('should create parent directories if not exist', () => {
      const filePath = path.join(TEST_DIR, 'nested', 'test.txt');
      writeFile(filePath, 'Hello World');
      expect(fs.readFileSync(filePath, 'utf-8')).toBe('Hello World');
    });
  });

  describe('exists', () => {
    it('should return true if path exists', () => {
      fs.mkdirSync(TEST_DIR, { recursive: true });
      expect(exists(TEST_DIR)).toBe(true);
    });

    it('should return false if path does not exist', () => {
      expect(exists(path.join(TEST_DIR, 'nonexistent'))).toBe(false);
    });
  });

  describe('readFile', () => {
    it('should read file content', () => {
      const filePath = path.join(TEST_DIR, 'test.txt');
      fs.mkdirSync(TEST_DIR, { recursive: true });
      fs.writeFileSync(filePath, 'Hello World', 'utf-8');
      expect(readFile(filePath)).toBe('Hello World');
    });
  });

  describe('remove', () => {
    it('should remove file', () => {
      const filePath = path.join(TEST_DIR, 'test.txt');
      fs.mkdirSync(TEST_DIR, { recursive: true });
      fs.writeFileSync(filePath, 'test', 'utf-8');
      remove(filePath);
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('should remove directory', () => {
      const dir = path.join(TEST_DIR, 'dir');
      fs.mkdirSync(dir, { recursive: true });
      remove(dir);
      expect(fs.existsSync(dir)).toBe(false);
    });

    it('should not throw if path does not exist', () => {
      expect(() => remove(path.join(TEST_DIR, 'nonexistent'))).not.toThrow();
    });
  });

  describe('isSpringBootProject', () => {
    it('should return true for Maven project', () => {
      fs.mkdirSync(TEST_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(TEST_DIR, 'pom.xml'),
        '<project><parent><artifactId>spring-boot-starter-parent</artifactId></parent></project>',
        'utf-8'
      );
      expect(isSpringBootProject(TEST_DIR)).toBe(true);
    });

    it('should return true for Gradle project', () => {
      fs.mkdirSync(TEST_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(TEST_DIR, 'build.gradle'),
        "plugins { id 'org.springframework.boot' version '3.2.0' }\ndependencies { implementation 'org.springframework.boot:spring-boot-starter-web' }",
        'utf-8'
      );
      expect(isSpringBootProject(TEST_DIR)).toBe(true);
    });

    it('should return false for non-Spring Boot project', () => {
      fs.mkdirSync(TEST_DIR, { recursive: true });
      expect(isSpringBootProject(TEST_DIR)).toBe(false);
    });
  });
});
