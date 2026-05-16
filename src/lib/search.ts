import type { SearchablePage, SearchableCategory, SearchIndex } from "@/lib/markdown";

export function searchInIndex(
  searchIndex: SearchIndex,
  query: string
): { pages: SearchablePage[]; categories: SearchableCategory[] } {
  if (!query.trim()) {
    return { pages: [], categories: [] };
  }

  const searchTerm = query.toLowerCase();

  // 评分并过滤页面
  const scoredPages = searchIndex.pages
    .map(page => {
      const titleMatch = page.title.toLowerCase().includes(searchTerm);
      const contentMatch = page.content.toLowerCase().includes(searchTerm);
      const categoryMatch = page.categoryName.toLowerCase().includes(searchTerm);
      
      let score = 0;
      if (titleMatch) score += 100; // 标题匹配权重最高
      if (contentMatch) score += 10;  // 内容匹配权重次之
      if (categoryMatch) score += 1;   // 分类匹配权重最低
      
      return { page, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score) // 按分数从高到低排序
    .map(item => item.page);

  const filteredCategories = searchIndex.categories.filter(category => {
    return category.name.toLowerCase().includes(searchTerm);
  });

  return {
    pages: scoredPages,
    categories: filteredCategories,
  };
}
