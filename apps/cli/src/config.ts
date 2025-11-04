import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.resolve(process.cwd(), '.pong-cli.json');

export function setToken(token: string) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ token }, null, 2));
}

export function readToken(): string | null {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  return data.token || null;
}

export function clearToken() {
  if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH);
}
