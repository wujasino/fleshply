
import type { PlaywrightTestConfig } from '@playwright/test';

export default createLovableConfig({
  // Add your custom playwright configuration overrides here
  // Example:
  // timeout: 60000,
  // use: {
  //   baseURL: 'http://localhost:3000',
  // },
});

function createLovableConfig(config: PlaywrightTestConfig): PlaywrightTestConfig {
  return config;
}

