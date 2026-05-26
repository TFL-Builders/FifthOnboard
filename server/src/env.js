/**
 * env.js — must be the FIRST import in server.js
 *
 * ESM hoists all import declarations and resolves them before module body
 * code runs. Putting dotenv.config() in the module body of server.js would
 * fire AFTER app.js is already evaluated, so process.env would still be
 * empty when app.js captures it.
 *
 * The fix: load .env inside a dedicated module. Because imports are resolved
 * in declaration order, importing this file before app.js ensures env vars
 * are present when app.js (and every other module) is first evaluated.
 *
 * The path is always relative to THIS file, so the server can be started
 * from any working directory — project root, server/, server/src/, etc.
 */
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

config({ path: path.join(__dirname, '.env') });
