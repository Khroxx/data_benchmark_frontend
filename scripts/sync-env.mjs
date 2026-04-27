import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const envFilePath = existsSync(resolve('.env')) ? resolve('.env') : resolve('.env.example');
const outputFiles = [
  resolve('src/environments/environment.ts'),
  resolve('src/environments/environment.development.ts'),
];

const envValues = parseEnvFile(envFilePath);
const apiBaseUrl = envValues.FRONTEND_API_BASE_URL ?? '';

const fileContent = `export const environment = {
  apiBaseUrl: ${JSON.stringify(apiBaseUrl)},
};
`;

for (const outputFile of outputFiles) {
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, fileContent, 'utf8');
}

function parseEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  const result = {};
  const rawContent = readFileSync(path, 'utf8');

  for (const rawLine of rawContent.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) {
      continue;
    }

    const [rawKey, ...rawValueParts] = line.split('=');
    const key = rawKey.trim();
    const value = rawValueParts.join('=').trim().replace(/^["']|["']$/g, '');

    if (key && !(key in result)) {
      result[key] = value;
    }
  }

  return result;
}
