import { TABLE_DEFAULT_SEARCH_COLUMN } from '@/constants';
import { ArticleColumn } from '@/types/article-column.enum';
import type { FrozenQueryParamsValues } from '@/types/query-params-values.interface';
import { computed } from 'vue';

export const useInitialSearchColumn = (
  getter: () => {
    queryParamsValues: FrozenQueryParamsValues;
  },
) =>
  computed<ArticleColumn>(() => {
    const {
      queryParamsValues: { tableSearchColumn },
    } = getter();

    if (!tableSearchColumn) {
      return TABLE_DEFAULT_SEARCH_COLUMN;
    }

    switch (tableSearchColumn) {
      case ArticleColumn.ITEM_NAME_INTERNATIONAL:
        return ArticleColumn.ITEM_NAME;

      case ArticleColumn.PRODUCT_NAME_INTERNATIONAL:
        return ArticleColumn.PRODUCT_NAME;

      default:
        return tableSearchColumn;
    }
  });
