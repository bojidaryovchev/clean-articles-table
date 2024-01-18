import { computed } from 'vue';
import type {
  CleanArticlesTableFilter,
  CleanArticlesTableFilterType,
  CleanArticlesTableFiltersValues,
} from '../CleanArticlesTable.types';
import { formatArticleKey } from '../CleanArticlesTable.utils';

export const useTableFilters = (
  getter: () => {
    filterTypes: CleanArticlesTableFilterType[];
    appliedFilters: CleanArticlesTableFiltersValues;
  },
) =>
  computed<CleanArticlesTableFilter[]>(() => {
    const { filterTypes, appliedFilters } = getter();

    return filterTypes
      .filter((filterType) => appliedFilters[filterType])
      .map((filterType) => ({
        filterType: filterType,
        label: formatArticleKey(filterType),
        isActive: !!appliedFilters[filterType]!.length,
      }));
  });
