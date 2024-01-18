import { computed } from 'vue';
import type { CleanArticlesTableFiltersValues } from '../CleanArticlesTable.types';

export const useAppliedFiltersExist = (
  getter: () => {
    appliedFilters: CleanArticlesTableFiltersValues;
  },
) =>
  computed(() => {
    const { appliedFilters } = getter();

    return !!Object.values(appliedFilters).flat().length;
  });
