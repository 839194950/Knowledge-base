import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { normalizeText, areStringsSimilar, FUZZY_MATCH_THRESHOLD } from "./link-normalizer";

const WIKI_DIR = path.join(process.cwd(), "wiki");

export interface LinkData {
  sourceFile: string;
  linkText: string;
  linkType: "wiki" | "markdown";
  status: "unknown" | "matched" | "unmatched";
  targetSlug?: string;
  notes?: string;
}

export interface PageData {
  slug: string;
  title: string;
  filename: string;
  filePath: string;
  aliases: string[];
}

export interface LinkDatabase {
  links: LinkData[];
  pages: PageData[];
  lastUpdated: string;
  statistics: {
    totalPages: number;
    totalLinks: number;
    matchedLinks: number;
    unmatchedLinks: number;
  };
}

export async function scanAllWikiPages(): Promise<PageData[]> {
  const pages: PageData[] = [];

  async function traverse(dir: string, baseSlug = "") {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== ".obsidian") {
        await traverse(path.join(dir, entry.name), `${baseSlug}/${entry.name}`);
      } else if (
        entry.isFile() &&
        entry.name.endsWith(".md") &&
        entry.name !== "index.md" &&
        entry.name !== "log.md" &&
        entry.name !== "_category.md" &&
        !entry.name.startsWith("_")
      ) {
        const slug = `${baseSlug}/${entry.name.replace(".md", "")}`.replace(/^\//, "");
        const filePath = path.join(dir, entry.name);
        const fileContent = await fs.readFile(filePath, "utf-8");
        const { data } = matter(fileContent);
        const title = data.title || entry.name.replace(".md", "");
        const filename = entry.name.replace(".md", "");

        const page: PageData = {
          slug,
          title,
          filename,
          filePath,
          aliases: [title, filename],
        };

        page.aliases.push(
          title.toLowerCase(),
          filename.toLowerCase(),
          title.replace(/\s+/g, ""),
          filename.replace(/\s+/g, ""),
          normalizeText(title),
          normalizeText(filename)
        );

        pages.push(page);
      }
    }
  }

  await traverse(WIKI_DIR);
  return pages;
}

export async function scanAllLinks(pages: PageData[]): Promise<LinkData[]> {
  const links: LinkData[] = [];
  const slugToPage = new Map(pages.map(p => [p.slug, p]));

  async function processFile(filePath: string, relativePath: string) {
    const content = await fs.readFile(filePath, "utf-8");

    // 处理 [[...]] 格式链接
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    let match;
    while ((match = wikiLinkRegex.exec(content)) !== null) {
      links.push({
        sourceFile: relativePath,
        linkText: match[1].trim(),
        linkType: "wiki",
        status: "unknown",
      });
    }

    // 处理 [...](...) 格式链接
    const mdLinkRegex = /\[([^\]]*)\]\(([^\)]+)\)/g;
    while ((match = mdLinkRegex.exec(content)) !== null) {
      const url = match[2].trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        links.push({
          sourceFile: relativePath,
          linkText: url,
          linkType: "markdown",
          status: "unknown",
        });
      }
    }
  }

  async function traverse(dir: string, basePath = "") {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== ".obsidian") {
        await traverse(path.join(dir, entry.name), `${basePath}/${entry.name}`);
      } else if (
        entry.isFile() &&
        entry.name.endsWith(".md") &&
        entry.name !== "index.md" &&
        entry.name !== "log.md" &&
        entry.name !== "_category.md" &&
        !entry.name.startsWith("_")
      ) {
        const relativePath = `${basePath}/${entry.name}`.replace(/^\//, "");
        await processFile(path.join(dir, entry.name), relativePath);
      }
    }
  }

  await processFile(path.join(WIKI_DIR, "index.md"), "index.md");
  await traverse(WIKI_DIR);

  // 尝试匹配链接
  let matchedCount = 0;
  for (const link of links) {
    const targetSlug = findTargetSlug(link.linkText, pages);
    if (targetSlug) {
      link.targetSlug = targetSlug;
      link.status = "matched";
      matchedCount++;
    } else {
      link.status = "unmatched";
    }
  }

  return links;
}

function findTargetSlug(linkText: string, pages: PageData[]): string | undefined {
  const trimmed = linkText.trim();
  const normalizedLink = normalizeText(trimmed);

  // 策略1：精确匹配 slug
  for (const page of pages) {
    if (page.slug === trimmed || page.title === trimmed || page.filename === trimmed) {
      return page.slug;
    }
  }

  // 策略2：标准化匹配
  for (const page of pages) {
    if (
      normalizeText(page.title) === normalizedLink ||
      normalizeText(page.filename) === normalizedLink ||
      normalizeText(page.slug) === normalizedLink
    ) {
      return page.slug;
    }
  }

  // 策略3：路径最后部分匹配
  if (trimmed.includes("/")) {
    const lastPart = trimmed.split("/").pop();
    if (lastPart) {
      for (const page of pages) {
        if (
          page.title === lastPart ||
          page.filename === lastPart ||
          normalizeText(page.title) === normalizeText(lastPart) ||
          normalizeText(page.filename) === normalizeText(lastPart)
        ) {
          return page.slug;
        }
      }
    }
  }

  // 策略4：模糊匹配
  let bestMatch: { slug: string; similarity: number } | null = null;
  for (const page of pages) {
    for (const alias of page.aliases) {
      if (areStringsSimilar(trimmed, alias)) {
        const similarity = 1;
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { slug: page.slug, similarity };
        }
      }
    }
  }

  return bestMatch?.slug;
}

export async function buildLinkDatabase(): Promise<LinkDatabase> {
  const pages = await scanAllWikiPages();
  const links = await scanAllLinks(pages);

  const matchedLinks = links.filter(l => l.status === "matched").length;

  return {
    links,
    pages,
    lastUpdated: new Date().toISOString(),
    statistics: {
      totalPages: pages.length,
      totalLinks: links.length,
      matchedLinks,
      unmatchedLinks: links.length - matchedLinks,
    },
  };
}

export async function saveLinkDatabase(db: LinkDatabase): Promise<string> {
  const dbPath = path.join(WIKI_DIR, "_links.json");
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
  return dbPath;
}

export async function generateLinkReport(db: LinkDatabase): Promise<string> {
  const reportPath = path.join(WIKI_DIR, "_links-report.md");

  const reportContent = `# Wiki 链接扫描报告

**生成时间**: ${new Date().toLocaleString("zh-CN")}

## 📊 统计

- 页面总数: ${db.statistics.totalPages}
- 链接总数: ${db.statistics.totalLinks}
- 匹配成功: ${db.statistics.matchedLinks}
- 未匹配: ${db.statistics.unmatchedLinks}

## 📋 页面列表

${db.pages.map(p => `- **${p.title}**\n  - Slug: \`${p.slug}\`\n  - 文件: \`${p.filename}.md\``).join("\n")}

## 🔗 链接列表

${db.links.map(l => `- [${l.status === "matched" ? "✅" : "❌"}] \`${l.linkText}\` (来自: ${l.sourceFile})${l.targetSlug ? ` → \`${l.targetSlug}\`` : ""}`).join("\n")}

## ❌ 未匹配链接

${db.links.filter(l => l.status === "unmatched").map(l => `- \`${l.linkText}\` (来自: ${l.sourceFile})`).join("\n") || "无"}

---

_此报告由 link-scanner.ts 自动生成_
`;

  await fs.writeFile(reportPath, reportContent, "utf-8");
  return reportPath;
}

export async function scanAndSave(): Promise<{ dbPath: string; reportPath: string }> {
  console.log("🔍 开始扫描链接...");

  const db = await buildLinkDatabase();
  console.log(`✅ 扫描完成`);
  console.log(`   - 页面: ${db.statistics.totalPages}`);
  console.log(`   - 链接: ${db.statistics.totalLinks}`);
  console.log(`   - 匹配成功: ${db.statistics.matchedLinks}`);
  console.log(`   - 未匹配: ${db.statistics.unmatchedLinks}`);

  const dbPath = await saveLinkDatabase(db);
  const reportPath = await generateLinkReport(db);

  console.log(`\n💾 数据库已保存: ${dbPath}`);
  console.log(`📄 报告已生成: ${reportPath}`);

  return { dbPath, reportPath };
}
