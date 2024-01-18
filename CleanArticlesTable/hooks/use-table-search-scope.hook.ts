import type { ArticleColumn } from '@/types/article-column.enum';
import { computed } from 'vue';
import { formatArticleKey } from '../CleanArticlesTable.utils';

export const useTableSearchScope = (
  getter: () => {
    tableColumnsKeys: ArticleColumn[];
  },
) =>
  computed(() => {
    const { tableColumnsKeys } = getter();

    return tableColumnsKeys.reduce(
      (scope, key) => {
        scope[formatArticleKey(key)] = key;
        return scope;
      },
      {} as Record<string, string>,
    );
  });
