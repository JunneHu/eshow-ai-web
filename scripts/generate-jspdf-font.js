// 简单的字体转换脚本：
// 使用方法（在 big-data-admin 目录下执行）：
//   node scripts/generate-jspdf-font.js src/static/fonts/NotoSansSC-Regular.ttf NotoSansSC
//
// 第一个参数：源 TTF 字体路径（相对于 big-data-admin）
// 第二个参数：在 jsPDF 中使用的字体名称（例如 NotoSansSC）
//
// 生成文件：src/static/fonts/<fontName>-normal.js

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function main() {
  const [, , ttfPathArg, fontNameArg] = process.argv;

  if (!ttfPathArg || !fontNameArg) {
    console.error('用法: node scripts/generate-jspdf-font.js <ttfPath> <fontName>');
    console.error('示例: node scripts/generate-jspdf-font.js src/static/fonts/NotoSansSC-Regular.ttf NotoSansSC');
    process.exit(1);
  }

  const projectRoot = __dirname ? path.resolve(__dirname, '..') : process.cwd();
  const ttfPath = path.resolve(projectRoot, ttfPathArg);
  const fontName = fontNameArg;

  if (!fs.existsSync(ttfPath)) {
    console.error(`找不到字体文件: ${ttfPath}`);
    process.exit(1);
  }

  const ttfData = fs.readFileSync(ttfPath);
  const base64 = ttfData.toString('base64');

  const outDir = path.resolve(projectRoot, 'src/static/fonts');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, `${fontName}-normal.js`);

  const jsContent = `// 自动生成：jsPDF 字体数据文件
// 源字体: ${path.basename(ttfPath)}
// 字体名称: ${fontName}
// 生成时间: ${new Date().toISOString()}
//
// 使用方式（在前端代码中）：
//   import { jsPDF } from 'jspdf';
//   import fontData from '@/static/fonts/${fontName}-normal';
//   const doc = new jsPDF();
//   (doc as any).addFileToVFS('${fontName}.ttf', fontData);
//   (doc as any).addFont('${fontName}.ttf', '${fontName}', 'normal');
//   doc.setFont('${fontName}', 'normal');

// 字体数据（base64 编码的 TTF 文件）
const fontData = '${base64}';

// 确保导出为字符串类型
export default fontData;
`;

  fs.writeFileSync(outFile, jsContent, 'utf8');
  console.log('已生成 jsPDF 字体数据文件:', path.relative(projectRoot, outFile));
}

main();


