import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import {
  normalizeText,
  areStringsSimilar,
  FUZZY_MATCH_THRESHOLD,
} from "./link-normalizer";

// 缓存接口
interface WikiCache {
  pages: WikiPage[];
  categoryTree: CategoryNode;
  searchIndex: SearchIndex;
  lastModified: number;
}

// 全局缓存对象
let wikiCache: WikiCache | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

// 检查 wiki 目录是否有更新
async function checkWikiDirModified(): Promise<number> {
  let latestMtime = 0;
  
  async function traverse(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== ".obsidian") {
          await traverse(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          const stats = await fs.stat(fullPath);
          if (stats.mtimeMs > latestMtime) {
            latestMtime = stats.mtimeMs;
          }
        }
      }
    } catch {}
  }
  
  await traverse(WIKI_DIR);
  return latestMtime;
}

// 清除缓存（手动触发）
export function clearWikiCache() {
  wikiCache = null;
}

// 分类树节点类型
export interface CategoryNode {
  name: string;
  path: string;
  children: CategoryNode[];
  articles: WikiPage[];
  totalCount: number;
}

// 搜索索引类型
export interface SearchIndex {
  pages: SearchablePage[];
  categories: SearchableCategory[];
}

export interface SearchablePage {
  id: string;
  slug: string;
  title: string;
  content: string;
  categoryPath: string;
  categoryName: string;
}

export interface SearchableCategory {
  id: string;
  path: string;
  name: string;
  description?: string;
  articleCount: number;
}

const WIKI_DIR = path.join(process.cwd(), "wiki");

export interface WikiPage {
  slug: string;
  title: string;
  description: string;
  content: string;
  rawContent?: string;
  created: string;
  updated: string;
  tags: string[];
  sources: string[];
  outLinks: string[];
  inLinks: string[];
  categories?: string[];
  categoryPath?: string;
}

export interface GraphNode {
  id: string;
  title: string;
  type: string;
  group: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// ==================== 核心链接处理逻辑 ====================

/**
 * 智能查找目标页面 slug
 * 使用多种策略匹配，确保能找到对应的页面
 */
export function findTargetSlug(titleOrSlug: string, slugMap: Map<string, string>): string | undefined {
  let trimmed = titleOrSlug.trim();

  // 预处理：移除 .md 后缀
  trimmed = trimmed.replace(/\.md$/g, '');

  // 预处理：处理 | 别名（取第一部分）
  if (trimmed.includes('|')) {
    trimmed = trimmed.split('|')[0].trim();
  }

  // 策略1：精确匹配
  if (slugMap.has(trimmed)) {
    return slugMap.get(trimmed);
  }

  // 策略2：标准化后精确匹配
  const normalizedLink = normalizeText(trimmed);
  const keys = Array.from(slugMap.keys());
  for (const key of keys) {
    if (normalizeText(key) === normalizedLink) {
      return slugMap.get(key);
    }
  }

  // 策略3：路径最后部分匹配（同时处理相对路径 ../）
  let searchPart = trimmed;
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/').filter(p => p && p !== '.');
    searchPart = parts.length > 0 ? parts[parts.length - 1] : trimmed;
  }

  // 用搜索部分匹配
  const normalizedSearch = normalizeText(searchPart);
  for (const key of keys) {
    if (normalizeText(key) === normalizedSearch) {
      return slugMap.get(key);
    }
  }

  // 策略4：模糊匹配（相似度）
  let bestMatch: { slug: string; similarity: number } | null = null;
  for (const key of keys) {
    if (areStringsSimilar(trimmed, key)) {
      if (!bestMatch) {
        bestMatch = { slug: slugMap.get(key) || '', similarity: 1 };
      }
    }
  }
  if (bestMatch) {
    return bestMatch.slug;
  }

  return undefined;
}

/**
 * 构建完整的 slug 映射
 * 添加多种可能的键，提高匹配成功率
 */
export async function getAllWikiSlugs(): Promise<Map<string, string>> {
  const combined = new Map<string, string>();

  async function traverse(dir: string, baseSlug = "") {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await traverse(fullPath, `${baseSlug}/${entry.name}`);
        } else if (
          entry.name.endsWith(".md") &&
          entry.name !== "log.md" &&
          entry.name !== "_category.md"
        ) {
          const slug = `${baseSlug}/${entry.name.replace(".md", "")}`.replace(/^\//, "");
          try {
            const fileContent = await fs.readFile(fullPath, "utf-8");
            const { data } = matter(fileContent);
            const title = data.title || entry.name.replace(".md", "");
            const filename = entry.name.replace(".md", "");

            // 添加多种映射方式，提高匹配成功率
            combined.set(title, slug);
            combined.set(slug, slug);
            combined.set(filename, slug);
            combined.set(title.toLowerCase(), slug);
            combined.set(filename.toLowerCase(), slug);

            // 添加不带空格的版本
            combined.set(title.replace(/\s+/g, ""), slug);
            combined.set(filename.replace(/\s+/g, ""), slug);

            // 添加标准化版本
            combined.set(normalizeText(title), slug);
            combined.set(normalizeText(filename), slug);
          } catch (e) {
          }
        }
      }
    } catch (e) {
    }
  }

  await traverse(WIKI_DIR);
  return combined;
}

/**
 * 统一的链接转换函数
 * 处理 [[...]] 和 [...](url) 格式的链接
 */
export function convertWikiLinks(content: string, slugMap: Map<string, string>): string {
  let processedContent = content;

  // 只处理 Obsidian 格式的链接 [[Page Name]] 或 [[Path/Page Name]]
  // 直接一次性转换为正确的链接格式
  processedContent = processedContent.replace(/\[\[([^\]]+)\]\]/g, (match, pageName) => {
    const titleOrSlug = pageName.trim().replace(/\.md$/, "");
    const targetSlug = findTargetSlug(titleOrSlug, slugMap);

    if (targetSlug) {
      // 如果链接中包含 | 别名（如 [[Page|Display Name]]），使用别名
      let displayName = titleOrSlug;
      if (titleOrSlug.includes("|")) {
        displayName = titleOrSlug.split("|")[1].trim();
      } else if (titleOrSlug.includes("/")) {
        // 如果是完整路径，只显示最后一部分
        displayName = titleOrSlug.split("/").pop() || titleOrSlug;
      }
      
      // 对 URL 路径进行编码，特别是空格和特殊字符
      const encodedSlug = targetSlug.split('/').map(encodeURIComponent).join('/');
      return `[${displayName}](/wiki/${encodedSlug})`;
    }

    // 找不到对应页面的链接，直接跳转到缺失概念页面
    let displayName = titleOrSlug;
    if (titleOrSlug.includes("|")) {
      displayName = titleOrSlug.split("|")[1].trim();
    } else if (titleOrSlug.includes("/")) {
      displayName = titleOrSlug.split("/").pop() || titleOrSlug;
    }
    const encodedName = encodeURIComponent(titleOrSlug);
    return `[${displayName}](/wiki/missing/concept/${encodedName})`;
  });

  return processedContent;
}

// ==================== 页面获取和处理 ====================

export async function getWikiPageBySlug(slug: string, existingSlugMap?: Map<string, string>): Promise<WikiPage | null> {
  // 简单解码 slug 并移除 .md 后缀
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    // 如果解码失败，使用原始 slug
  }
  // 移除可能的 .md 后缀
  decodedSlug = decodedSlug.replace(/\.md$/, "");
  const filePath = path.join(WIKI_DIR, `${decodedSlug}.md`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const slugMap = existingSlugMap || await getAllWikiSlugs();
    let processedContent = convertWikiLinks(content, slugMap);
    
    // 从 wiki 文章中移除图片链接，图片只用于 AI 理解，不在展示时显示
    // 移除 Obsidian 图片链接格式 ![[图片文件名]]
    processedContent = processedContent.replace(/!\[\[[^\]]+\]\]/g, "");
    // 也移除标准 Markdown 图片格式 ![alt](url)
    processedContent = processedContent.replace(/!\[[^\]]*\]\([^\)]+\)/g, "");

    const pathParts = decodedSlug.split("/").filter(Boolean);
    let categoryPath = "";
    if (pathParts.length > 1) {
      categoryPath = pathParts.slice(0, -1).join("/");
    }

    return {
      slug: decodedSlug,
      title: data.title || decodedSlug.split("/").pop() || decodedSlug,
      description: content.split("\n").find((l) => l.trim()) || "",
      content: processedContent,
      rawContent: content,
      created: data.created || new Date().toISOString().split("T")[0],
      updated: data.updated || new Date().toISOString().split("T")[0],
      tags: data.tags || [],
      sources: data.sources || [],
      categories: data.categories || [],
      categoryPath: data.categoryPath || categoryPath,
      outLinks: [],
      inLinks: [],
    };
  } catch (e) {
    return null;
  }
}

export async function getWikiIndexPage(): Promise<{ content: string; title: string } | null> {
  const filePath = path.join(WIKI_DIR, "index.md");

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const slugMap = await getAllWikiSlugs();
    const processedContent = convertWikiLinks(content, slugMap);

    return {
      content: processedContent,
      title: data.title || "Wiki Index",
    };
  } catch (e) {
    console.error("getWikiIndexPage error:", e);
    return null;
  }
}

// ==================== 其他功能函数（保持不变）====================

function parseOutLinks(content: string, allTitles: Map<string, string>, currentSlug?: string): string[] {
  const outLinks: string[] = [];

  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = wikiLinkRegex.exec(content)) !== null) {
    const titleOrSlug = match[1].trim();
    let targetSlug = allTitles.get(titleOrSlug);
    if (!targetSlug && titleOrSlug.includes("/")) {
      targetSlug = titleOrSlug;
    }
    if (targetSlug) {
      outLinks.push(targetSlug);
    }
  }

  const mdLinkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
  while ((match = mdLinkRegex.exec(content)) !== null) {
    let url = match[2].trim();
    if (url.startsWith("http://") || url.startsWith("https://")) {
      continue;
    }
    url = url.replace(/\.md$/g, "");

    let resolvedSlug: string | null = null;

    if (url.startsWith("../") && currentSlug) {
      const currentParts = currentSlug.split("/").filter(Boolean);
      currentParts.pop();
      const targetParts = url.split("/").filter(Boolean);
      for (const part of targetParts) {
        if (part === "..") {
          currentParts.pop();
        } else if (part !== ".") {
          currentParts.push(part);
        }
      }
      resolvedSlug = currentParts.join("/");
    } else if (url.startsWith("./") && currentSlug) {
      const currentParts = currentSlug.split("/").filter(Boolean);
      currentParts.pop();
      const targetParts = url.substring(2).split("/").filter(Boolean);
      resolvedSlug = [...currentParts, ...targetParts].join("/");
    } else if (url.startsWith("/")) {
      resolvedSlug = url.substring(1);
    } else if (url.startsWith("/wiki/")) {
      resolvedSlug = url.replace("/wiki/", "");
    } else {
      resolvedSlug = url;
    }

    if (resolvedSlug) {
      if (allTitles.has(resolvedSlug)) {
        outLinks.push(allTitles.get(resolvedSlug)!);
      } else {
        let found = false;
        const titleKeys = Array.from(allTitles.keys());
        for (const key of titleKeys) {
          const value = allTitles.get(key);
          if (value === resolvedSlug) {
            outLinks.push(value);
            found = true;
            break;
          }
        }
        if (!found) {
          const lastPart = resolvedSlug.split("/").pop();
          if (lastPart && allTitles.has(lastPart)) {
            outLinks.push(allTitles.get(lastPart)!);
          }
        }
      }
    }
  }

  return Array.from(new Set(outLinks));
}

export function convertLinks(content: string, slugMap: Map<string, string>): string {
  return convertWikiLinks(content, slugMap);
}

export interface MissingLink {
  title: string;
  referencedIn: { slug: string; title: string }[];
}

export async function getAllMissingLinks(): Promise<MissingLink[]> {
  const { pages, titleToSlug } = await getAllWikiPagesWithMap();
  const missingLinksMap = new Map<string, { slug: string; title: string }[]>();

  for (const page of pages) {
    // 重新解析原始内容，找到所有链接
    if (!page.rawContent) continue;
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    let match;
    while ((match = wikiLinkRegex.exec(page.rawContent)) !== null) {
      const titleOrSlug = match[1].trim();
      const targetSlug = findTargetSlug(titleOrSlug, titleToSlug);
      
      if (!targetSlug) {
        let displayName = titleOrSlug;
        if (titleOrSlug.includes("|")) {
          displayName = titleOrSlug.split("|")[1].trim();
        }
        if (!missingLinksMap.has(displayName)) {
          missingLinksMap.set(displayName, []);
        }
        missingLinksMap.get(displayName)?.push({
          slug: page.slug,
          title: page.title,
        });
      }
    }
  }

  return Array.from(missingLinksMap.entries()).map(([title, referencedIn]) => ({
    title,
    referencedIn,
  })).sort((a, b) => b.referencedIn.length - a.referencedIn.length);
}

export async function getAllWikiPagesWithMap(): Promise<{
  pages: WikiPage[];
  titleToSlug: Map<string, string>;
}> {
  const pages: WikiPage[] = [];
  
  // 使用我们强大的 getAllWikiSlugs() 函数来获取完整的映射
  const titleToSlug = await getAllWikiSlugs();

  async function traverse(dir: string, baseSlug = "") {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await traverse(fullPath, `${baseSlug}/${entry.name}`);
        } else if (
          entry.name.endsWith(".md") &&
          entry.name !== "log.md" &&
          entry.name !== "_category.md"
        ) {
          const slug = `${baseSlug}/${entry.name.replace(".md", "")}`.replace(/^\//, "");
          const page = await getWikiPageBySlug(slug, titleToSlug);
          if (page) {
            page.outLinks = parseOutLinks(page.rawContent || page.content, titleToSlug, slug);
            page.inLinks = [];
            pages.push(page);
          }
        }
      }
    } catch {}
  }

  await traverse(WIKI_DIR);

  const slugToPage = new Map(pages.map(p => [p.slug, p]));

  for (const page of pages) {
    for (const targetSlug of page.outLinks) {
      const targetPage = slugToPage.get(targetSlug);
      if (targetPage && !targetPage.inLinks.includes(page.slug)) {
        targetPage.inLinks.push(page.slug);
      }
    }
  }

  return {
    pages: pages.sort(
      (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
    ),
    titleToSlug,
  };
}

export async function getGraphData(): Promise<GraphData> {
  const pages = await getAllWikiPages();
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const typeToGroup: Record<string, number> = {
    "index": 0,
    "人物与工具": 1,
    "核心概念": 2,
    "资料存档": 3,
    "关于本站": 4,
    "投资理财": 5,
  };

  // 先创建节点映射
  const nodeIdSet = new Set<string>();

  for (const page of pages) {
    let type = "other";
    if (page.slug === "index") type = "index";
    else if (page.slug.startsWith("人物与工具/")) type = "人物与工具";
    else if (page.slug.startsWith("核心概念/")) type = "核心概念";
    else if (page.slug.startsWith("资料存档/")) type = "资料存档";
    else if (page.slug.startsWith("关于本站/")) type = "关于本站";
    else if (page.slug.startsWith("投资理财/")) type = "投资理财";

    nodes.push({
      id: page.slug,
      title: page.title,
      type,
      group: typeToGroup[type] || 0,
    });
    nodeIdSet.add(page.slug);
  }

  // 再添加链接，只保留两端都存在的链接
  for (const page of pages) {
    for (const targetSlug of page.outLinks) {
      // 只有当 source 和 target 都在节点集合中时才添加
      if (nodeIdSet.has(page.slug) && nodeIdSet.has(targetSlug)) {
        links.push({
          source: page.slug,
          target: targetSlug,
        });
      }
    }
  }

  return { nodes, links };
}

export async function getCategoryByPath(pathStr: string): Promise<CategoryNode | null> {
  const { categoryTree } = await getAllWikiData();

  if (!pathStr) {
    return categoryTree;
  }

  const pathParts = pathStr.split("/").filter(Boolean);

  let current = categoryTree;
  for (const part of pathParts) {
    const next = current.children.find(c => c.name === part);
    if (!next) {
      return null;
    }
    current = next;
  }

  return current;
}

// ========== 新增：统一的数据获取函数（带缓存） ==========

// 核心函数：一次性获取所有 wiki 数据
export async function getAllWikiData(): Promise<{
  pages: WikiPage[];
  categoryTree: CategoryNode;
  searchIndex: SearchIndex;
}> {
  const now = Date.now();
  
  // 检查缓存是否有效
  if (wikiCache && (now - wikiCache.lastModified < CACHE_TTL)) {
    return {
      pages: wikiCache.pages,
      categoryTree: wikiCache.categoryTree,
      searchIndex: wikiCache.searchIndex,
    };
  }
  
  // 检查文件是否有更新
  const currentModified = await checkWikiDirModified();
  if (wikiCache && currentModified <= wikiCache.lastModified) {
    // 文件没有更新，刷新缓存时间并返回
    wikiCache.lastModified = now;
    return {
      pages: wikiCache.pages,
      categoryTree: wikiCache.categoryTree,
      searchIndex: wikiCache.searchIndex,
    };
  }
  
  // 需要重新构建数据
  const { pages, titleToSlug } = await getAllWikiPagesWithMap();
  
  // 构建分类树（复用已有 pages）
  const categoryTree = await buildCategoryTreeFromPages(pages);
  
  // 构建搜索索引（复用已有数据）
  const searchIndex = buildSearchIndexFromData(pages, categoryTree);
  
  // 更新缓存
  wikiCache = {
    pages,
    categoryTree,
    searchIndex,
    lastModified: now,
  };
  
  return { pages, categoryTree, searchIndex };
}

// 从已有 pages 构建分类树（避免重复读取文件）
async function buildCategoryTreeFromPages(pages: WikiPage[]): Promise<CategoryNode> {
  const slugToPage = new Map(pages.map(p => [p.slug, p]));
  
  async function buildTreeFromFS(dirPath: string, parentPath = ""): Promise<CategoryNode> {
    const dirName = path.basename(dirPath);
    const node: CategoryNode = {
      name: dirName === "wiki" ? "知识库" : dirName,
      path: parentPath,
      children: [],
      articles: [],
      totalCount: 0,
    };

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== ".obsidian") {
          const childPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
          const childNode = await buildTreeFromFS(
            path.join(dirPath, entry.name),
            childPath
          );
          node.children.push(childNode);
        }
      }

      for (const entry of entries) {
        if (
          entry.isFile() &&
          entry.name.endsWith(".md") &&
          entry.name !== "index.md" &&
          entry.name !== "log.md" &&
          entry.name !== "_category.md"
        ) {
          const slug = parentPath ? `${parentPath}/${entry.name.replace(".md", "")}` : entry.name.replace(".md", "");
          const page = slugToPage.get(slug);
          if (page) {
            node.articles.push(page);
          }
        }
      }
    } catch {}

    return node;
  }

  const root = await buildTreeFromFS(WIKI_DIR, "");

  function calculateTotal(node: CategoryNode): number {
    let count = node.articles.length;
    for (const child of node.children) {
      count += calculateTotal(child);
    }
    node.totalCount = count;
    return count;
  }

  calculateTotal(root);
  return root;
}

// 从已有数据构建搜索索引（避免重复调用）
function buildSearchIndexFromData(pages: WikiPage[], tree: CategoryNode): SearchIndex {
  const searchablePages: SearchablePage[] = pages.map(page => ({
    id: page.slug,
    slug: page.slug,
    title: page.title,
    content: page.content,
    categoryPath: page.categoryPath || "",
    categoryName: page.categoryPath ? page.categoryPath.split("/").pop() || "" : "",
  }));

  const searchableCategories: SearchableCategory[] = [];

  function traverseCategories(node: CategoryNode, parentPath = "") {
    if (node.path) {
      searchableCategories.push({
        id: node.path,
        path: node.path,
        name: node.name,
        description: "",
        articleCount: node.totalCount,
      });
    }

    for (const child of node.children) {
      traverseCategories(child, node.path);
    }
  }

  traverseCategories(tree);

  return {
    pages: searchablePages,
    categories: searchableCategories,
  };
}

// ========== 优化现有函数，使用缓存 ==========

// 重写 getAllWikiPages 使用缓存
export async function getAllWikiPages(): Promise<WikiPage[]> {
  const { pages } = await getAllWikiData();
  return pages;
}

// 重写 buildCategoryTree 使用缓存
export async function buildCategoryTree(): Promise<CategoryNode> {
  const { categoryTree } = await getAllWikiData();
  return categoryTree;
}

// 重写 buildSearchIndex 使用缓存
export async function buildSearchIndex(): Promise<SearchIndex> {
  const { searchIndex } = await getAllWikiData();
  return searchIndex;
}
