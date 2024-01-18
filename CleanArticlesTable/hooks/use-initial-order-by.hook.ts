import { TABLE_DEFAULT_ORDER_BY } from '@/constants';
import { ArticleColumn } from '@/types/article-column.enum';
import type { FrozenQueryParamsValues } from '@/types/query-params-values.interface';
import { computed } from 'vue';

export const useInitialOrderBy = (
  getter: () => {
    queryParamsValues: FrozenQueryParamsValues;
  },
) =>
  computed<ArticleColumn>(() => {
    const {
      queryParamsValues: { tableOrderBy },
    } = getter();

    return tableOrderBy ?? TABLE_DEFAULT_ORDER_BY;
  });
