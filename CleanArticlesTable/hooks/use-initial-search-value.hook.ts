import type { FrozenQueryParamsValues } from '@/types/query-params-values.interface';
import { computed } from 'vue';

export const useInitialSearchValue = (
  getter: () => {
    queryParamsValues: FrozenQueryParamsValues;
  },
) =>
  computed<string>(() => {
    const {
      queryParamsValues: { tableSearchValue },
    } = getter();

    return tableSearchValue ?? '';
  });
