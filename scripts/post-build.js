import { readdirSync, copyFileSync, writeFileSync, statSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '../dist');
const latestFilePath = join(distDir, 'LATEST.txt');

// 查找带版本号和哈希的文件
const files = readdirSync(distDir);
const versionedFile = files.find(f => f.startsWith('experiment-widget.v') && f.endsWith('.js'));

if (versionedFile) {
  const source = join(distDir, versionedFile);
  const target = join(distDir, 'experiment-widget.js');

  // 复制为固定名称（方便本地开发和测试）
  copyFileSync(source, target);

  // 计算下一次的自增版本号
  let currentVersion = 0;
  if (existsSync(latestFilePath)) {
    try {
      const latestContent = readFileSync(latestFilePath, 'utf-8').trim();
      const match = latestContent.match(/experiment-widget\\.v(\\d+)\\.js/);
      if (match) currentVersion = Number(match[1]) || 0;
    } catch {
      // ignore parse errors and fall back to 0
    }
  }
  const nextVersion = currentVersion + 1;
  const simpleVersionFile = `experiment-widget.v${nextVersion}.js`;
  const simpleVersionPath = join(distDir, simpleVersionFile);

  // 复制一份自增版本号的文件，给 CDN / 外部引用使用
  copyFileSync(source, simpleVersionPath);

  // 获取文件大小
  const stats = statSync(source);
  const sizeKB = (stats.size / 1024).toFixed(2);

  // 生成版本信息文件
  const versionInfo = {
    version: `v${nextVersion}`,
    filename: simpleVersionFile,
    sourceFilename: versionedFile,
    buildTime: new Date().toISOString(),
    size: `${sizeKB} KB`,
    cdnUrl: `https://experiment-widget-sdk.vercel.app/${simpleVersionFile}`,
  };

  writeFileSync(
    join(distDir, 'version.json'),
    JSON.stringify(versionInfo, null, 2)
  );

  // 生成一个简单的文本文件，包含最新的文件名
  writeFileSync(
    join(distDir, 'LATEST.txt'),
    simpleVersionFile
  );

  console.log('\n✅ Build complete!');
  console.log(`📦 Source file: ${versionedFile}`);
  console.log(`🔢 Simple version: ${simpleVersionFile}`);
  console.log(`📏 File size: ${sizeKB} KB`);
  console.log(`📋 Stable alias: experiment-widget.js (copy of source file)`);
  console.log(`📄 Version info: dist/version.json`);
  console.log(`📝 Latest filename: dist/LATEST.txt`);
  console.log('\n💡 Usage:');
  console.log(`   Production (CDN):`);
  console.log(`   https://experiment-widget-sdk.vercel.app/${simpleVersionFile}`);
  console.log(`\n   Development:`);
  console.log(`   /dist/experiment-widget.js`);
  console.log('\n📋 Copy this to your HTML:');
  console.log(`   <script src="https://experiment-widget-sdk.vercel.app/${simpleVersionFile}" ...></script>\n`);
} else {
  console.error('❌ Could not find versioned widget file!');
  process.exit(1);
}
