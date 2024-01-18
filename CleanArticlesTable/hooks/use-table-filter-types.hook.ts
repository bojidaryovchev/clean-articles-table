import { ArticleColumn } from '@/types/article-column.enum';
import { Grouping } from '@/types/grouping.enum';
import type { FrozenQueryParamsValues } from '@/types/query-params-values.interface';
import { computed } from 'vue';
import type { CleanArticlesTableFilterType } from '../CleanArticlesTable.types';

export const useTableFilterTypes = (
  getter: () => {
    queryParamsValues: FrozenQueryParamsValues;
  },
) =>
  computed<CleanArticlesTableFilterType[]>(() => {
    const {
      queryParamsValues: { grouping },
    } = getter();

    const filterTypes: CleanArticlesTableFilterType[] = [
      ArticleColumn.CLEAN_CANDIDATE,
      ArticleColumn.CCL,
      ArticleColumn.STYLE_GROUP,
      ArticleColumn.PRICE_LEVEL,
    ];

    switch (grouping) {
      case Grouping.HFB:
        filterTypes.push(ArticleColumn.HFB);
        filterTypes.push(ArticleColumn.PA);
        break;

      case Grouping.FUNCTIONAL_AREA:
        filterTypes.push(ArticleColumn.FUNCTIONAL_AREA_NAME);
        filterTypes.push(ArticleColumn.CONSUMER_FUNCTION_NAME);
        filterTypes.push(ArticleColumn.PRODUCT_FUNCTION_NAME);
        break;
    }

    filterTypes.push(ArticleColumn.PRODUCT_NAME);

    return filterTypes;
  });
