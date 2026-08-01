import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Installing main site dependencies (devDependencies needed for Vite)...');
execSync('npm install --include=dev', { stdio: 'inherit', cwd: __dirname });

console.log('Building main site...');
execSync('npx vite build', { stdio: 'inherit', cwd: __dirname });

console.log('Installing admin dependencies...');
execSync('npm install --include=dev', { stdio: 'inherit', cwd: path.join(__dirname, 'admin') });

console.log('Building admin panel...');
execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, 'admin') });

console.log('Merging admin dist into main dist...');
const adminDistPath = path.join(__dirname, 'admin', 'dist');
const targetAdminPath = path.join(__dirname, 'dist', 'admin');

if (!fs.existsSync(targetAdminPath)) {
    fs.mkdirSync(targetAdminPath, { recursive: true });
}

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to);
    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isFile()) {
            fs.copyFileSync(fromPath, toPath);
        } else {
            copyFolderSync(fromPath, toPath);
        }
    });
}

copyFolderSync(adminDistPath, targetAdminPath);
console.log('Build complete.');
