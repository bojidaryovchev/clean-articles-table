import type { FilterOptionsByColumn } from '@/store/clean-articles-table';
import { optionToString } from '@/utils/option.utils';
import { computed } from 'vue';
import type {
  CleanArticlesTableFilterType,
  CleanArticlesTableSearchValueByFilterType,
} from '../CleanArticlesTable.types';
import { normalize } from '../CleanArticlesTable.utils';

export const useFilteredFiltersValues = (
  getter: () => {
    filterOptionsByColumn: FilterOptionsByColumn;
    searchValueByFilterType: CleanArticlesTableSearchValueByFilterType;
  },
) =>
  computed<FilterOptionsByColumn>(() => {
    const { filterOptionsByColumn, searchValueByFilterType } = getter();

    return Object.fromEntries(
      Object.entries(filterOptionsByColumn).map(([column, filterOptions]) => [
        column,
        filterOptions.filter((filterOption) => {
          const searchValue = searchValueByFilterType[column as CleanArticlesTableFilterType];

          if (!searchValue) {
            return true;
          }

          return normalize(optionToString(filterOption)).toLowerCase().includes(searchValue.toLowerCase());
        }),
      ]),
    );
  });
