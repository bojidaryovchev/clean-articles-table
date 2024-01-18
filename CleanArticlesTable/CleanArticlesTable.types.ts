import type { SearchResult } from '@/components/SearchInput/SearchInput.types';
import type { Sort, TableFilter, TableFiltersValues } from '@/components/Table/Table.types';
import type { ArticleColumn } from '@/types/article-column.enum';
import type { ElementRef } from '@/types/element-ref.type';
import type { Grouping } from '@/types/grouping.enum';

export type CleanArticlesTableFilterType =
  | ArticleColumn.CLEAN_CANDIDATE
  | ArticleColumn.CCL
  | ArticleColumn.STYLE_GROUP
  | ArticleColumn.PRICE_LEVEL
  | ArticleColumn.PRODUCT_NAME
  | ArticleColumn.HFB
  | ArticleColumn.PA
  | ArticleColumn.FUNCTIONAL_AREA_NAME
  | ArticleColumn.CONSUMER_FUNCTION_NAME
  | ArticleColumn.PRODUCT_FUNCTION_NAME;

export type CleanArticlesTableViewFilterType =
  | ArticleColumn.HFB
  | ArticleColumn.PA
  | ArticleColumn.FUNCTIONAL_AREA_NAME
  | ArticleColumn.CONSUMER_FUNCTION_NAME
  | ArticleColumn.PRODUCT_FUNCTION_NAME;

export type CleanArticlesTableFilter = TableFilter<CleanArticlesTableFilterType>;

export type CleanArticlesTableFiltersValues = TableFiltersValues<CleanArticlesTableFilterType>;

export type CleanArticlesTableChosenGroupNoByGrouping = Partial<Record<Grouping, string>>;

export type CleanArticlesTableSearchValueByFilterType = Partial<Record<CleanArticlesTableFilterType, string>>;

export type CleanArticlesTableVirtualScrollElementRefByFilterType = Partial<
  Record<CleanArticlesTableFilterType, ElementRef>
>;

export type CleanArticlesTableOnSearch = ({ scope, value }: SearchResult) => void;

export type CleanArticlesTableFormatAppliedFilterLabel = (filterKey: string, filterValue: string) => string;

export type CleanArticlesTableOnPageChange = (page: number) => void;

export type CleanArticlesTableOnItemsPerPageChange = (itemsPerPage: number) => void;

export type CleanArticlesTableOnSortChange = (sort: Sort | undefined) => void;

export type CleanArticlesTableOnModalOpen = () => void;

export type CleanArticlesTableInitSearchValueByFilterType = () => void;

export type CleanArticlesTableInitAppliedByFilterValueByFilterType = () => void;

export type CleanArticlesTableInitChosenGroupNoByGrouping = () => Promise<void>;

export type CleanArticlesTableAppliedFiltersLengthByFilterType = (filterType: CleanArticlesTableFilterType) => number;

export type CleanArticlesTableIsViewFilterType = (filterType: CleanArticlesTableFilterType) => boolean;

export type CleanArticlesTableSelectedOptionValueByFilterType = (
  filterType: CleanArticlesTableViewFilterType,
) => string;

export type CleanArticlesTableExpansionPanelTitleByFilterType = (filterType: CleanArticlesTableFilterType) => string;

export type CleanArticlesTableOnFilterSearch = (
  filterType: CleanArticlesTableFilterType,
  { value }: { value: string },
) => void;

export type CleanArticlesTableOnFilterClick = (filterType: CleanArticlesTableFilterType) => Promise<void>;

export type CleanArticlesTableOnFilterRemove = (
  filterType: CleanArticlesTableFilterType,
  value: string,
) => Promise<void>;

export type CleanArticlesTableOnReset = () => Promise<void>;

export type CleanArticlesTableOnApply = () => Promise<void>;

export type CleanArticlesTableOnModalClose = () => void;
