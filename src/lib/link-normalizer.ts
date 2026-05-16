/**
 * 链接标准化工具
 * 处理各种特殊字符差异
 */

/**
 * 标准化文本用于匹配
 * - 转为小写
 * - 处理中文冒号、英文冒号 → 连字符
 * - 处理下划线 → 连字符
 * - 处理多个空格 → 单个空格
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[：:]/g, "-")
    .replace(/_/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 计算两个字符串的 Levenshtein 距离（编辑距离）
 * 返回将 str1 转换为 str2 所需的最少操作次数
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = [];
    for (let j = 0; j <= n; j++) {
      if (i === 0) {
        dp[i][j] = j;
      } else if (j === 0) {
        dp[i][j] = i;
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (str1[i - 1] === str2[j - 1] ? 0 : 1)
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * 计算两个字符串的相似度（0-1）
 */
export function stringSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
}

/**
 * 模糊匹配阈值
 */
export const FUZZY_MATCH_THRESHOLD = 0.8;

/**
 * 检查两个字符串是否足够相似
 */
export function areStringsSimilar(
  str1: string,
  str2: string,
  threshold: number = FUZZY_MATCH_THRESHOLD
): boolean {
  return stringSimilarity(normalizeText(str1), normalizeText(str2)) >= threshold;
}
