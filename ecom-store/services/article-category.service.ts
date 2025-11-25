import axiosClient from "@/configurations/axios.config";
import type { ArticleListResponse } from "@/types/article-category.type";

export const articleCategoryService = {
  /**
   * Lấy danh sách danh mục bài viết
   * Backend mặc định limit=7, nên ta cần truyền limit lớn (vd: 50) để lấy hết cho Tabs
   */
  getCategories: async (page = 1, limit = 50, title = "") => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (title) params.append("title", title);

    // Endpoint khớp với @RequestMapping("${api.prefix}/article-categories")
    const response = await axiosClient.get<ArticleListResponse>(`/article-categories?${params.toString()}`);
    return response.data;
  },
};