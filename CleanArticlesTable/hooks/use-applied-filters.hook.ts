import type { FilterOptionsByColumn } from '@/store/clean-articles-table';
import { ArticleColumn } from '@/types/article-column.enum';
import type { FrozenQueryParamsValues } from '@/types/query-params-values.interface';
import { optionToString } from '@/utils/option.utils';
import { computed } from 'vue';
import type { CleanArticlesTableFiltersValues } from '../CleanArticlesTable.types';

export const useAppliedFilters = (
  getter: () => {
    queryParamsValues: FrozenQueryParamsValues;
    filterOptionsByColumn: FilterOptionsByColumn;
  },
) =>
  computed<CleanArticlesTableFiltersValues>(() => {
    const {
      queryParamsValues: {
        tableCleanCandidateValues,
        tableCCLValues,
        tableStyleGroupValues,
        tablePriceLevelValues,
        tableProductNameValues,
        groupNoPath,
      },
      filterOptionsByColumn,
    } = getter();

    const [hfbNo, paNo] = groupNoPath ?? [];
    const [functionalAreaNo, consumerFunctionNo, productFunctionNo] = groupNoPath ?? [];

    const hfbValues = !filterOptionsByColumn[ArticleColumn.HFB]
      ? []
      : filterOptionsByColumn[ArticleColumn.HFB]!.filter((option) => option.group_no === hfbNo).map((option) =>
          optionToString(option),
        );

    const paValues = !filterOptionsByColumn[ArticleColumn.PA]
      ? []
      : filterOptionsByColumn[ArticleColumn.PA]!.filter((option) => option.group_no === paNo).map((option) =>
          optionToString(option),
        );

    const functionalAreaValues = !filterOptionsByColumn[ArticleColumn.FUNCTIONAL_AREA_NAME]
      ? []
      : filterOptionsByColumn[ArticleColumn.FUNCTIONAL_AREA_NAME]!.filter(
          (option) => option.group_no === functionalAreaNo,
        ).map((option) => optionToString(option));

    const consumerFunctionValues = !filterOptionsByColumn[ArticleColumn.CONSUMER_FUNCTION_NAME]
      ? []
      : filterOptionsByColumn[ArticleColumn.CONSUMER_FUNCTION_NAME]!.filter(
          (option) => option.group_no === consumerFunctionNo,
        ).map((option) => optionToString(option));

    const productFunctionValues = !filterOptionsByColumn[ArticleColumn.PRODUCT_FUNCTION_NAME]
      ? []
      : filterOptionsByColumn[ArticleColumn.PRODUCT_FUNCTION_NAME]!.filter(
          (option) => option.group_no === productFunctionNo,
        ).map((option) => optionToString(option));

    const filtersValues: CleanArticlesTableFiltersValues = {
      [ArticleColumn.CLEAN_CANDIDATE]: tableCleanCandidateValues ? [...tableCleanCandidateValues] : [],
      [ArticleColumn.CCL]: tableCCLValues ? [...tableCCLValues] : [],
      [ArticleColumn.STYLE_GROUP]: tableStyleGroupValues ? [...tableStyleGroupValues] : [],
      [ArticleColumn.PRICE_LEVEL]: tablePriceLevelValues ? [...tablePriceLevelValues] : [],
      [ArticleColumn.PRODUCT_NAME]: tableProductNameValues ? [...tableProductNameValues] : [],
      [ArticleColumn.HFB]: hfbValues,
      [ArticleColumn.PA]: paValues,
      [ArticleColumn.FUNCTIONAL_AREA_NAME]: functionalAreaValues,
      [ArticleColumn.CONSUMER_FUNCTION_NAME]: consumerFunctionValues,
      [ArticleColumn.PRODUCT_FUNCTION_NAME]: productFunctionValues,
    };

    return filtersValues;
  });
