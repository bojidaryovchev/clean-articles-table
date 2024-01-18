import { TABLE_DEFAULT_ITEMS_PER_PAGE } from '@/constants';
import type { FrozenQueryParamsValues } from '@/types/query-params-values.interface';
import { computed } from 'vue';

export const useInitialItemsPerPage = (
  getter: () => {
    queryParamsValues: FrozenQueryParamsValues;
  },
) =>
  computed<number>(() => {
    const {
      queryParamsValues: { tableItemsPerPage },
    } = getter();

    return tableItemsPerPage ?? TABLE_DEFAULT_ITEMS_PER_PAGE;
  });
