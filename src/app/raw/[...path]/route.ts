import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const RAW_DIR = path.join(process.cwd(), "raw");

// 图片扩展名映射到 MIME 类型
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

// 文本文件扩展名
const TEXT_EXTENSIONS = new Set([
  ".txt", ".md", ".markdown", ".json", ".yaml", ".yml", ".xml", ".html", ".css", ".js", ".ts"
]);

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  // 正确解码每个路径段
  const decodedPathParts = params.path.map(part => decodeURIComponent(part));
  const filePath = path.join(RAW_DIR, ...decodedPathParts);
  const ext = path.extname(filePath).toLowerCase();
  const fileName = decodedPathParts[decodedPathParts.length - 1];

  try {
    // 检查文件是否存在
    await fs.access(filePath);
    
    // 如果是图片或 PDF，直接返回二进制数据
    if (MIME_TYPES[ext]) {
      const fileBuffer = await fs.readFile(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": MIME_TYPES[ext],
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
    
    // 对于文本文件，读取内容并返回 HTML 展示
    if (TEXT_EXTENSIONS.has(ext) || !ext) {
      const content = await fs.readFile(filePath, "utf-8");
      
      const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName} - 原始源文件</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
    }
    .container {
      max-width: 80rem;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }
    .header {
      margin-bottom: 1.5rem;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .description {
      color: #64748b;
    }
    .content {
      background-color: #f1f5f9;
      padding: 1.5rem;
      border-radius: 0.5rem;
      overflow-x: auto;
    }
    pre {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.875rem;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${escapeHtml(fileName)}</h1>
      <p class="description">原始源文件</p>
    </div>
    <div class="content">
      <pre>${escapeHtml(content)}</pre>
    </div>
  </div>
</body>
</html>`;
      
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }
    
    // 对于其他未知类型，尝试返回原始数据
    const fileBuffer = await fs.readFile(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (e) {
    return new NextResponse("File not found", { status: 404 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
