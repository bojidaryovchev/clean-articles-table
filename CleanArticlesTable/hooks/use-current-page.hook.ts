import { TABLE_DEFAULT_PAGE } from '@/constants';
import type { FrozenQueryParamsValues } from '@/types/query-params-values.interface';
import { computed } from 'vue';

export const useCurrentPage = (
  getter: () => {
    queryParamsValues: FrozenQueryParamsValues;
  },
) =>
  computed<number>(() => {
    const {
      queryParamsValues: { tablePage },
    } = getter();

    return tablePage ?? TABLE_DEFAULT_PAGE;
  });
