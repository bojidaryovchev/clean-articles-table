import { TABLE_DEFAULT_DESC } from '@/constants';
import type { FrozenQueryParamsValues } from '@/types/query-params-values.interface';
import { computed } from 'vue';

export const useInitialDesc = (
  getter: () => {
    queryParamsValues: FrozenQueryParamsValues;
  },
) =>
  computed<boolean>(() => {
    const {
      queryParamsValues: { tableDesc },
    } = getter();

    return tableDesc ?? TABLE_DEFAULT_DESC;
  });
