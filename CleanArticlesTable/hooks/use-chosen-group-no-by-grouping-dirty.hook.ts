import { computed } from 'vue';
import type { CleanArticlesTableChosenGroupNoByGrouping } from '../CleanArticlesTable.types';

export const useChosenGroupNoByGroupingDirty = (
  getter: () => {
    chosenGroupNoByGrouping: CleanArticlesTableChosenGroupNoByGrouping;
    initialChosenGroupNoByGrouping: CleanArticlesTableChosenGroupNoByGrouping;
  },
) =>
  computed<boolean>(() => {
    const { chosenGroupNoByGrouping, initialChosenGroupNoByGrouping } = getter();

    return JSON.stringify(chosenGroupNoByGrouping) !== JSON.stringify(initialChosenGroupNoByGrouping);
  });
