import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
});

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
}); 