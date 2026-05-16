// 分类树节点类型
export interface CategoryNode {
  name: string;
  path: string;
  children: CategoryNode[];
  articles: WikiPage[];
  totalCount: number;
}

// Wiki 页面类型（扩展现有类型）
export interface WikiPage {
  slug: string;
  title: string;
  content: string;
  categories?: string[];
  categoryPath?: string;
  inLinks: string[];
  outLinks: string[];
  created: string;
  updated: string;
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

// 搜索结果类型
export interface SearchResult {
  pages: SearchablePage[];
  categories: SearchableCategory[];
}
