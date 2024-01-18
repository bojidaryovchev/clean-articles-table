import { computed } from 'vue';
import type { CleanArticlesTableFiltersValues } from '../CleanArticlesTable.types';

export const useAppliedValuesByFilterTypeDirty = (
  getter: () => {
    initialAppliedValuesByFilterType: CleanArticlesTableFiltersValues;
    appliedValuesByFilterType: CleanArticlesTableFiltersValues;
  },
) =>
  computed<boolean>(() => {
    const { initialAppliedValuesByFilterType, appliedValuesByFilterType } = getter();

    return (
      JSON.stringify(
        Object.fromEntries(
          Object.entries(initialAppliedValuesByFilterType).map(([filterType, appliedValues]) => [
            filterType,
            appliedValues.sort((a, b) => a.localeCompare(b)),
          ]),
        ),
      ) !==
      JSON.stringify(
        Object.fromEntries(
          Object.entries(appliedValuesByFilterType).map(([filterType, appliedValues]) => [
            filterType,
            appliedValues.sort((a, b) => a.localeCompare(b)),
          ]),
        ),
      )
    );
  });
