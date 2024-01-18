<template>
  <div class="CleanArticlesTable">
    <div class="table-heading">
      <h2>{{ translateKey('components.cleanArticlesTable.totalRangeHeading') }}</h2>
      <p>{{ translateKey('components.cleanArticlesTable.description') }}</p>
    </div>

    <TableFilters
      :filters="
        tableFilters.map((tableFilter) => ({
          ...tableFilter,
          label: tableFilter.label ? translateKey(tableFilter.label) : '',
        }))
      "
      :applied-filters-values="appliedFilters"
      :format-applied-filter-label="formatAppliedFilterLabel"
      @filter-click="onFilterClick($event.key as CleanArticlesTableFilterType)"
      @filter-remove="onFilterRemove($event.key as CleanArticlesTableFilterType, $event.value)"
    ></TableFilters>

    <div class="divider"></div>

    <SearchInput
      id="CleanArticlesTable__search"
      :scope="Object.fromEntries(Object.entries(tableSearchScope).map(([key, value]) => [translateKey(key), value]))"
      :initial-search-value="initialSearchValue"
      :initial-search-column="initialSearchColumn"
      @search="onSearch($event)"
    />

    <Table
      id="CleanArticlesTable"
      :loading="cleanArticlesTableStore.articlesLoading"
      :columns="tableColumns.map((column) => ({ ...column, title: translateKey(column.title) }))"
      :items="asArrayOfIndexables(mappedArticles)"
      :total-items="cleanArticlesTableStore.totalArticles"
      :total-pages="cleanArticlesTableStore.totalPages"
      :current-page="currentPage"
      :initial-items-per-page="initialItemsPerPage"
      :initial-order-by="initialOrderBy"
      :initial-desc="initialDesc"
      @page-change="onPageChange($event)"
      @items-per-page-change="onItemsPerPageChange($event)"
      @sort-change="onSortChange($event)"
    ></Table>

    <Modal v-model:visible="filtersModalVisible" :handle-close-btn="onModalClose">
      <Sheets :aria-label="translateKey('components.cleanArticlesTable.tableFilters')" :close-btn-click="onModalClose">
        <template #header>
          <ModalHeader
            :title="translateKey('components.cleanArticlesTable.tableFilters')"
            :aria-close-txt="translateKey('components.cleanArticlesTable.close')"
            :close-btn-click="onModalClose"
          />
        </template>

        <ModalBody>
          <v-expansion-panels v-model="expandedPanels" :multiple="true">
            <v-expansion-panel v-for="{ filterType } in tableFilters" :key="filterType" :value="filterType">
              <v-expansion-panel-title v-ripple>
                <template
                  v-for="expansionPanelTitle in [expansionPanelTitleByFilterType(filterType)]"
                  :key="expansionPanelTitle"
                >
                  <div class="CleanArticlesTable__expansion-panel-title" :title="expansionPanelTitle">
                    {{ expansionPanelTitle }}
                  </div>
                </template>
              </v-expansion-panel-title>

              <v-expansion-panel-text>
                <SearchInput
                  v-if="searchableFilterTypes.includes(filterType)"
                  :id="`CleanArticlesTable__${filterType}__search`"
                  :placeholder="
                    translateKey('components.cleanArticlesTable.searchFor', {
                      filterType: translateKey(formatArticleKey(filterType)),
                    })
                  "
                  @search="onFilterSearch(filterType, $event)"
                />

                <v-virtual-scroll
                  :ref="
                    (nodeRef) => {
                      if (!nodeRef) {
                        return;
                      }

                      virtualScrolls[filterType] = nodeRef as ElementRef;
                    }
                  "
                  :max-height="`${MAX_HEIGHT_REM}rem`"
                  :items="filteredFiltersValues[filterType]"
                >
                  <template #default="{ item }">
                    <RadioButton
                      v-if="
                        filterType === ArticleColumn.HFB ||
                        filterType === ArticleColumn.PA ||
                        filterType === ArticleColumn.FUNCTIONAL_AREA_NAME ||
                        filterType === ArticleColumn.CONSUMER_FUNCTION_NAME ||
                        filterType === ArticleColumn.PRODUCT_FUNCTION_NAME
                      "
                      :id="`${filterType}:${item.value}`"
                      v-model="chosenGroupNoByGrouping[filterType]"
                      v-ripple
                      :name="item.group_no"
                      :value="item.group_no"
                    >
                      <span :title="optionToString(item)" data-testId="CleanArticlesTable__radio-label">
                        {{ optionToString(item) }}
                      </span>
                    </RadioButton>

                    <Checkbox
                      v-else
                      :id="`${filterType}:${item.value}`"
                      v-model="appliedValuesByFilterType[filterType]"
                      v-ripple
                      :value="item.value"
                    >
                      <span :title="optionToString(item)" data-testId="CleanArticlesTable__checkbox-label">
                        {{ optionToString(item) }}
                      </span>
                    </Checkbox>
                  </template>
                </v-virtual-scroll>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </ModalBody>

        <template #footer>
          <ModalFooter v-slot="slotProps">
            <Button
              v-bind="slotProps"
              :disabled="!appliedFiltersExist"
              data-testId="CleanArticlesTable__reset-button"
              @click="onReset()"
            >
              {{ translateKey('components.cleanArticlesTable.resetButton') }}
            </Button>

            <Button
              v-bind="slotProps"
              type="primary"
              :disabled="!appliedValuesByFilterTypeDirty && !chosenGroupNoByGroupingDirty"
              data-testId="CleanArticlesTable__apply-button"
              @click="onApply()"
            >
              {{ translateKey('components.cleanArticlesTable.applyButton') }}
            </Button>
          </ModalFooter>
        </template>
      </Sheets>
    </Modal>

    <ConfirmationModal
      data-testId="CleanArticlesTable__filter-remove-confirmation"
      :title="translateKey('components.cleanArticlesTable.filterRemoveConfirmation.title')"
      :accessibility-label="translateKey('components.cleanArticlesTable.filterRemoveConfirmation.title')"
      :primary-btn-text="translateKey('components.cleanArticlesTable.filterRemoveConfirmation.confirm')"
      :secondary-btn-text="translateKey('components.cleanArticlesTable.filterRemoveConfirmation.cancel')"
      @open="openFilterRemoveConfirmation = $event.open"
    >
      <div
        class="CleanArticlesTable__confirmation-message"
        data-testId="CleanArticlesTable__filter-remove-confirmation__message"
      >
        {{ translateKey('components.cleanArticlesTable.filterRemoveConfirmation.message') }}
      </div>

      <Checkbox
        id="CleanArticlesTable__filter-remove-confirmation__checkbox"
        v-model="doNotShowFilterRemoveConfirmationAgain"
        value="true"
      >
        {{ translateKey('components.cleanArticlesTable.filterRemoveConfirmation.doNotShowAgain') }}
      </Checkbox>
    </ConfirmationModal>

    <ConfirmationModal
      data-testId="CleanArticlesTable__filter-apply-confirmation"
      :title="translateKey('components.cleanArticlesTable.filterApplyConfirmation.title')"
      :accessibility-label="translateKey('components.cleanArticlesTable.filterApplyConfirmation.title')"
      :primary-btn-text="translateKey('components.cleanArticlesTable.filterApplyConfirmation.confirm')"
      :secondary-btn-text="translateKey('components.cleanArticlesTable.filterApplyConfirmation.cancel')"
      @open="openFilterApplyConfirmation = $event.open"
    >
      <div
        class="CleanArticlesTable__confirmation-message"
        data-testId="CleanArticlesTable__filter-apply-confirmation__message"
      >
        {{ translateKey('components.cleanArticlesTable.filterApplyConfirmation.message') }}
      </div>

      <Checkbox
        id="CleanArticlesTable__filter-apply-confirmation__checkbox"
        v-model="doNotShowFilterApplyConfirmationAgain"
        value="true"
      >
        {{ translateKey('components.cleanArticlesTable.filterApplyConfirmation.doNotShowAgain') }}
      </Checkbox>
    </ConfirmationModal>

    <ConfirmationModal
      data-testId="CleanArticlesTable__filters-reset-confirmation"
      :title="translateKey('components.cleanArticlesTable.filtersResetConfirmation.title')"
      :accessibility-label="translateKey('components.cleanArticlesTable.filtersResetConfirmation.title')"
      :primary-btn-text="translateKey('components.cleanArticlesTable.filtersResetConfirmation.confirm')"
      :secondary-btn-text="translateKey('components.cleanArticlesTable.filtersResetConfirmation.cancel')"
      @open="openFiltersResetConfirmation = $event.open"
    >
      <div
        class="CleanArticlesTable__confirmation-message"
        data-testId="CleanArticlesTable__filters-reset-confirmation__message"
      >
        {{ translateKey('components.cleanArticlesTable.filtersResetConfirmation.message') }}
      </div>

      <Checkbox
        id="CleanArticlesTable__filters-reset-confirmation__checkbox"
        v-model="doNotShowFiltersResetConfirmationAgain"
        value="true"
      >
        {{ translateKey('components.cleanArticlesTable.filtersResetConfirmation.doNotShowAgain') }}
      </Checkbox>
    </ConfirmationModal>
  </div>
</template>

<script lang="ts" setup>
  import { SearchInput } from '@/components/SearchInput';
  import { SortOrder, Table } from '@/components/Table';
  import { TableFilters } from '@/components/TableFilters';
  import { TABLE_DEFAULT_PAGE, VIEW_OPTION_SEPARATOR } from '@/constants';
  import { useI18n } from '@/hooks/use-i18n.hook';
  import { useQueryParamsValues } from '@/hooks/use-query-params-values.hook';
  import { useCleanArticlesTableStore } from '@/store/clean-articles-table';
  import { ArticleColumn } from '@/types/article-column.enum';
  import { ConfirmationModalActions, type ConfirmationModalOpen } from '@/types/confirmation-modal';
  import type { ElementRef } from '@/types/element-ref.type';
  import { Grouping } from '@/types/grouping.enum';
  import { asArrayOfIndexables } from '@/utils/common.utils';
  import { optionFromString, optionToString } from '@/utils/option.utils';
  import Button from '@ingka/button-vue';
  import Checkbox from '@ingka/checkbox-vue';
  import Modal, { ModalBody, ModalFooter, ModalHeader, Sheets } from '@ingka/modal-vue';
  import RadioButton from '@ingka/radio-button-vue';
  import { inject, nextTick, reactive, ref, watch } from 'vue';
  import { ConfirmationModal } from '../ConfirmationModal';
  import {
    DO_NOT_SHOW_FILTERS_RESET_CONFIRMATION_AGAIN,
    DO_NOT_SHOW_FILTER_APPLY_CONFIRMATION_AGAIN,
    DO_NOT_SHOW_FILTER_REMOVE_CONFIRMATION_AGAIN,
    MOCK_APPLIED_FILTERS_EXIST_TOKEN,
    MOCK_APPLIED_FILTERS_LENGTH_BY_KEY_TOKEN,
    MOCK_APPLIED_FILTERS_TOKEN,
    MOCK_APPLIED_VALUES_BY_FILTER_TYPE_DIRTY_TOKEN,
    MOCK_APPLIED_VALUES_BY_FILTER_TYPE_TOKEN,
    MOCK_CHOSEN_GROUP_NO_BY_GROUPING_DIRTY_TOKEN,
    MOCK_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN,
    MOCK_CLEAN_ARTICLES_TABLE_STORE_TOKEN,
    MOCK_CONSUMER_FUNCTION_BEING_MODIFIED_TOKEN,
    MOCK_CURRENT_PAGE_TOKEN,
    MOCK_DO_NOT_SHOW_FILTERS_RESET_CONFIRMATION_AGAIN_TOKEN,
    MOCK_DO_NOT_SHOW_FILTER_APPLY_CONFIRMATION_AGAIN_TOKEN,
    MOCK_DO_NOT_SHOW_FILTER_REMOVE_CONFIRMATION_AGAIN_TOKEN,
    MOCK_EXPANDED_PANELS_TOKEN,
    MOCK_EXPANSION_PANEL_TITLE_BY_FILTER_TYPE,
    MOCK_FILTERED_FILTERS_VALUES_TOKEN,
    MOCK_FILTERS_MODAL_VISIBLE_TOKEN,
    MOCK_FORMAT_APPLIED_FILTER_LABEL_TOKEN,
    MOCK_FUNCTIONAL_AREA_BEING_MODIFIED_TOKEN,
    MOCK_HFB_BEING_MODIFIED_TOKEN,
    MOCK_INITIAL_APPLIED_VALUES_BY_FILTER_TYPE_TOKEN,
    MOCK_INITIAL_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN,
    MOCK_INITIAL_DESC_TOKEN,
    MOCK_INITIAL_ITEMS_PER_PAGE_TOKEN,
    MOCK_INITIAL_ORDER_BY_TOKEN,
    MOCK_INITIAL_SEARCH_COLUMN_TOKEN,
    MOCK_INITIAL_SEARCH_VALUE_TOKEN,
    MOCK_INIT_APPLIED_BY_FILTER_VALUE_BY_FILTER_TYPE_TOKEN,
    MOCK_INIT_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN,
    MOCK_INIT_SEARCH_VALUE_BY_FILTER_TYPE_TOKEN,
    MOCK_IS_VIEW_FILTER_TYPE_TOKEN,
    MOCK_MAPPED_ARTICLES_TOKEN,
    MOCK_MAX_HEIGHT_REM_TOKEN,
    MOCK_MAX_VIRTUAL_SCROLL_HEIGHT_PX_TOKEN,
    MOCK_ON_APPLY_TOKEN,
    MOCK_ON_FILTER_CLICK_TOKEN,
    MOCK_ON_FILTER_REMOVE_TOKEN,
    MOCK_ON_FILTER_SEARCH_TOKEN,
    MOCK_ON_ITEMS_PER_PAGE_CHANGE_TOKEN,
    MOCK_ON_MODAL_CLOSE_TOKEN,
    MOCK_ON_MODAL_OPEN_TOKEN,
    MOCK_ON_PAGE_CHANGE_TOKEN,
    MOCK_ON_RESET_TOKEN,
    MOCK_ON_SEARCH_TOKEN,
    MOCK_ON_SORT_CHANGE_TOKEN,
    MOCK_OPEN_FILTERS_RESET_CONFIRMATION_TOKEN,
    MOCK_OPEN_FILTER_APPLY_CONFIRMATION_TOKEN,
    MOCK_OPEN_FILTER_REMOVE_CONFIRMATION_TOKEN,
    MOCK_PA_BEING_MODIFIED_TOKEN,
    MOCK_PRODUCT_FUNCTION_BEING_MODIFIED_TOKEN,
    MOCK_REM_PX_TOKEN,
    MOCK_SEARCHABLE_FILTER_TYPES_TOKEN,
    MOCK_SEARCH_VALUE_BY_FILTER_TYPE_TOKEN,
    MOCK_SELECTED_OPTION_VALUE_BY_FILTER_TYPE_TOKEN,
    MOCK_TABLE_COLUMNS_KEYS_TOKEN,
    MOCK_TABLE_COLUMNS_TOKEN,
    MOCK_TABLE_FILTERS_TOKEN,
    MOCK_TABLE_FILTER_TYPES_TOKEN,
    MOCK_TABLE_SEARCH_SCOPE_TOKEN,
    MOCK_VIRTUAL_SCROLLS_TOKEN,
  } from './CleanArticlesTable.constants';
  import {
    type CleanArticlesTableAppliedFiltersLengthByFilterType,
    type CleanArticlesTableChosenGroupNoByGrouping,
    type CleanArticlesTableExpansionPanelTitleByFilterType,
    type CleanArticlesTableFilterType,
    type CleanArticlesTableFiltersValues,
    type CleanArticlesTableFormatAppliedFilterLabel,
    type CleanArticlesTableInitAppliedByFilterValueByFilterType,
    type CleanArticlesTableInitChosenGroupNoByGrouping,
    type CleanArticlesTableInitSearchValueByFilterType,
    type CleanArticlesTableIsViewFilterType,
    type CleanArticlesTableOnApply,
    type CleanArticlesTableOnFilterClick,
    type CleanArticlesTableOnFilterRemove,
    type CleanArticlesTableOnFilterSearch,
    type CleanArticlesTableOnItemsPerPageChange,
    type CleanArticlesTableOnModalClose,
    type CleanArticlesTableOnModalOpen,
    type CleanArticlesTableOnPageChange,
    type CleanArticlesTableOnReset,
    type CleanArticlesTableOnSearch,
    type CleanArticlesTableOnSortChange,
    type CleanArticlesTableSearchValueByFilterType,
    type CleanArticlesTableSelectedOptionValueByFilterType,
    type CleanArticlesTableViewFilterType,
    type CleanArticlesTableVirtualScrollElementRefByFilterType,
  } from './CleanArticlesTable.types';
  import { formatArticleKey } from './CleanArticlesTable.utils';
  import { useAppliedFiltersExist } from './hooks/use-applied-filters-exist.hook';
  import { useAppliedFilters } from './hooks/use-applied-filters.hook';
  import { useAppliedValuesByFilterTypeDirty } from './hooks/use-applied-values-by-filter-type-dirty.hook';
  import { useChosenGroupNoByGroupingDirty } from './hooks/use-chosen-group-no-by-grouping-dirty.hook';
  import { useCurrentPage } from './hooks/use-current-page.hook';
  import { useFilteredFiltersValues } from './hooks/use-filtered-filters-values.hook';
  import { useInitialDesc } from './hooks/use-initial-desc.hook';
  import { useInitialItemsPerPage } from './hooks/use-initial-items-per-page.hook';
  import { useInitialOrderBy } from './hooks/use-initial-order-by.hook';
  import { useInitialSearchColumn } from './hooks/use-initial-search-column.hook';
  import { useInitialSearchValue } from './hooks/use-initial-search-value.hook';
  import { useMappedArticles } from './hooks/use-mapped-articles.hook';
  import { useTableColumnsKeys } from './hooks/use-table-columns-keys.hook';
  import { useTableColumns } from './hooks/use-table-columns.hook';
  import { useTableFilterTypes } from './hooks/use-table-filter-types.hook';
  import { useTableFilters } from './hooks/use-table-filters.hook';
  import { useTableSearchScope } from './hooks/use-table-search-scope.hook';

  const { translateKey } = useI18n();

  const REM_PX = inject(MOCK_REM_PX_TOKEN, 16);
  const MAX_HEIGHT_REM = inject(MOCK_MAX_HEIGHT_REM_TOKEN, 32);
  const MAX_VIRTUAL_SCROLL_HEIGHT_PX = inject(MOCK_MAX_VIRTUAL_SCROLL_HEIGHT_PX_TOKEN, MAX_HEIGHT_REM * REM_PX);

  const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();
  const cleanArticlesTableStore = inject(MOCK_CLEAN_ARTICLES_TABLE_STORE_TOKEN, useCleanArticlesTableStore());
  const tableColumnsKeys = inject(
    MOCK_TABLE_COLUMNS_KEYS_TOKEN,
    useTableColumnsKeys(() => ({
      queryParamsValues: queryParamsValues.value,
    })),
  );
  const tableColumns = inject(
    MOCK_TABLE_COLUMNS_TOKEN,
    useTableColumns(() => ({
      tableColumnsKeys: tableColumnsKeys.value,
    })),
  );
  const mappedArticles = inject(
    MOCK_MAPPED_ARTICLES_TOKEN,
    useMappedArticles(() => ({
      articles: cleanArticlesTableStore.articles,
    })),
  );
  const tableSearchScope = inject(
    MOCK_TABLE_SEARCH_SCOPE_TOKEN,
    useTableSearchScope(() => ({
      tableColumnsKeys: tableColumnsKeys.value,
    })),
  );
  const tableFilterTypes = inject(
    MOCK_TABLE_FILTER_TYPES_TOKEN,
    useTableFilterTypes(() => ({
      queryParamsValues: queryParamsValues.value,
    })),
  );
  const appliedFilters = inject(
    MOCK_APPLIED_FILTERS_TOKEN,
    useAppliedFilters(() => ({
      queryParamsValues: queryParamsValues.value,
      filterOptionsByColumn: cleanArticlesTableStore.filterOptionsByColumn,
    })),
  );
  const tableFilters = inject(
    MOCK_TABLE_FILTERS_TOKEN,
    useTableFilters(() => ({
      filterTypes: tableFilterTypes.value,
      appliedFilters: appliedFilters.value,
    })),
  );
  const filteredFiltersValues = inject(
    MOCK_FILTERED_FILTERS_VALUES_TOKEN,
    useFilteredFiltersValues(() => ({
      filterOptionsByColumn: cleanArticlesTableStore.filterOptionsByColumn,
      searchValueByFilterType: searchValueByFilterType.value,
    })),
  );
  const appliedValuesByFilterTypeDirty = inject(
    MOCK_APPLIED_VALUES_BY_FILTER_TYPE_DIRTY_TOKEN,
    useAppliedValuesByFilterTypeDirty(() => ({
      appliedValuesByFilterType: appliedValuesByFilterType.value,
      initialAppliedValuesByFilterType: initialAppliedValuesByFilterType.value,
    })),
  );
  const chosenGroupNoByGroupingDirty = inject(
    MOCK_CHOSEN_GROUP_NO_BY_GROUPING_DIRTY_TOKEN,
    useChosenGroupNoByGroupingDirty(() => ({
      chosenGroupNoByGrouping,
      initialChosenGroupNoByGrouping,
    })),
  );
  const appliedFiltersExist = inject(
    MOCK_APPLIED_FILTERS_EXIST_TOKEN,
    useAppliedFiltersExist(() => ({
      appliedFilters: appliedFilters.value,
    })),
  );
  const initialSearchValue = inject(
    MOCK_INITIAL_SEARCH_VALUE_TOKEN,
    useInitialSearchValue(() => ({
      queryParamsValues: queryParamsValues.value,
    })),
  );
  const initialSearchColumn = inject(
    MOCK_INITIAL_SEARCH_COLUMN_TOKEN,
    useInitialSearchColumn(() => ({
      queryParamsValues: queryParamsValues.value,
    })),
  );
  const currentPage = inject(
    MOCK_CURRENT_PAGE_TOKEN,
    useCurrentPage(() => ({
      queryParamsValues: queryParamsValues.value,
    })),
  );
  const initialItemsPerPage = inject(
    MOCK_INITIAL_ITEMS_PER_PAGE_TOKEN,
    useInitialItemsPerPage(() => ({
      queryParamsValues: queryParamsValues.value,
    })),
  );
  const initialOrderBy = inject(
    MOCK_INITIAL_ORDER_BY_TOKEN,
    useInitialOrderBy(() => ({
      queryParamsValues: queryParamsValues.value,
    })),
  );
  const initialDesc = inject(
    MOCK_INITIAL_DESC_TOKEN,
    useInitialDesc(() => ({
      queryParamsValues: queryParamsValues.value,
    })),
  );

  const expandedPanels = inject(MOCK_EXPANDED_PANELS_TOKEN, ref<CleanArticlesTableFilterType[]>([]));
  const virtualScrolls = inject(
    MOCK_VIRTUAL_SCROLLS_TOKEN,
    ref<CleanArticlesTableVirtualScrollElementRefByFilterType>({}),
  );
  const filtersModalVisible = inject(MOCK_FILTERS_MODAL_VISIBLE_TOKEN, ref<boolean>(false));
  const searchValueByFilterType = inject(
    MOCK_SEARCH_VALUE_BY_FILTER_TYPE_TOKEN,
    ref<CleanArticlesTableSearchValueByFilterType>({}),
  );
  const appliedValuesByFilterType = inject(
    MOCK_APPLIED_VALUES_BY_FILTER_TYPE_TOKEN,
    ref<CleanArticlesTableFiltersValues>({}),
  );
  const initialAppliedValuesByFilterType = inject(
    MOCK_INITIAL_APPLIED_VALUES_BY_FILTER_TYPE_TOKEN,
    ref<CleanArticlesTableFiltersValues>({}),
  );
  const searchableFilterTypes = inject(
    MOCK_SEARCHABLE_FILTER_TYPES_TOKEN,
    ref<CleanArticlesTableFilterType[]>([
      ArticleColumn.PRODUCT_NAME,
      ArticleColumn.HFB,
      ArticleColumn.PA,
      ArticleColumn.FUNCTIONAL_AREA_NAME,
      ArticleColumn.CONSUMER_FUNCTION_NAME,
      ArticleColumn.PRODUCT_FUNCTION_NAME,
    ]),
  );
  const chosenGroupNoByGrouping = inject(
    MOCK_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN,
    reactive<CleanArticlesTableChosenGroupNoByGrouping>({}),
  );
  const initialChosenGroupNoByGrouping = inject(
    MOCK_INITIAL_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN,
    reactive<CleanArticlesTableChosenGroupNoByGrouping>({}),
  );
  const openFilterRemoveConfirmation = inject(MOCK_OPEN_FILTER_REMOVE_CONFIRMATION_TOKEN, ref<ConfirmationModalOpen>());
  const doNotShowFilterRemoveConfirmationAgain = inject(
    MOCK_DO_NOT_SHOW_FILTER_REMOVE_CONFIRMATION_AGAIN_TOKEN,
    ref<string>(`${sessionStorage.getItem(DO_NOT_SHOW_FILTER_REMOVE_CONFIRMATION_AGAIN) === 'true'}`),
  );
  const openFilterApplyConfirmation = inject(MOCK_OPEN_FILTER_APPLY_CONFIRMATION_TOKEN, ref<ConfirmationModalOpen>());
  const doNotShowFilterApplyConfirmationAgain = inject(
    MOCK_DO_NOT_SHOW_FILTER_APPLY_CONFIRMATION_AGAIN_TOKEN,
    ref<string>(`${sessionStorage.getItem(DO_NOT_SHOW_FILTER_APPLY_CONFIRMATION_AGAIN) === 'true'}`),
  );
  const openFiltersResetConfirmation = inject(MOCK_OPEN_FILTERS_RESET_CONFIRMATION_TOKEN, ref<ConfirmationModalOpen>());
  const doNotShowFiltersResetConfirmationAgain = inject(
    MOCK_DO_NOT_SHOW_FILTERS_RESET_CONFIRMATION_AGAIN_TOKEN,
    ref<string>(`${sessionStorage.getItem(DO_NOT_SHOW_FILTERS_RESET_CONFIRMATION_AGAIN) === 'true'}`),
  );
  const hfbBeingModified = inject(MOCK_HFB_BEING_MODIFIED_TOKEN, ref<boolean>(false));
  const paBeingModified = inject(MOCK_PA_BEING_MODIFIED_TOKEN, ref<boolean>(false));
  const functionalAreaBeingModified = inject(MOCK_FUNCTIONAL_AREA_BEING_MODIFIED_TOKEN, ref<boolean>(false));
  const consumerFunctionBeingModified = inject(MOCK_CONSUMER_FUNCTION_BEING_MODIFIED_TOKEN, ref<boolean>(false));
  const productFunctionBeingModified = inject(MOCK_PRODUCT_FUNCTION_BEING_MODIFIED_TOKEN, ref<boolean>(false));

  const onSearch: CleanArticlesTableOnSearch = inject(MOCK_ON_SEARCH_TOKEN, ({ scope, value: tableSearchValue }) => {
    let tableSearchColumn = scope as ArticleColumn;

    switch (tableSearchColumn) {
      case ArticleColumn.ITEM_NAME:
        tableSearchColumn = ArticleColumn.ITEM_NAME_INTERNATIONAL;
        break;

      case ArticleColumn.PRODUCT_NAME:
        tableSearchColumn = ArticleColumn.PRODUCT_NAME_INTERNATIONAL;
        break;
    }

    setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableSearchColumn,
        tableSearchValue,
        tablePage: TABLE_DEFAULT_PAGE,
      },
    });
  });
  const formatAppliedFilterLabel: CleanArticlesTableFormatAppliedFilterLabel = inject(
    MOCK_FORMAT_APPLIED_FILTER_LABEL_TOKEN,
    (filterKey, filterValue) => {
      return `${translateKey(formatArticleKey(filterKey as ArticleColumn))} - ${filterValue}`;
    },
  );
  const onPageChange: CleanArticlesTableOnPageChange = inject(MOCK_ON_PAGE_CHANGE_TOKEN, (page) => {
    setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tablePage: page,
      },
    });
  });
  const onItemsPerPageChange: CleanArticlesTableOnItemsPerPageChange = inject(
    MOCK_ON_ITEMS_PER_PAGE_CHANGE_TOKEN,
    (itemsPerPage) => {
      setQueryParamsValues({
        queryParams: {
          ...JSON.parse(JSON.stringify(queryParamsValues.value)),
          tableItemsPerPage: itemsPerPage,
          tablePage: TABLE_DEFAULT_PAGE,
        },
      });
    },
  );
  const onSortChange: CleanArticlesTableOnSortChange = inject(MOCK_ON_SORT_CHANGE_TOKEN, (sort) => {
    setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableOrderBy: sort ? (sort.key as ArticleColumn) : null,
        tableDesc: sort ? sort.order === SortOrder.DESC : null,
      },
    });
  });
  const onModalOpen: CleanArticlesTableOnModalOpen = inject(MOCK_ON_MODAL_OPEN_TOKEN, () => {
    filtersModalVisible.value = true;
    initSearchValueByFilterType();
    initAppliedByFilterValueByFilterType();
    initChosenGroupNoByGrouping();
  });
  const onModalClose: CleanArticlesTableOnModalClose = inject(MOCK_ON_MODAL_CLOSE_TOKEN, () => {
    filtersModalVisible.value = false;
  });
  const initSearchValueByFilterType: CleanArticlesTableInitSearchValueByFilterType = inject(
    MOCK_INIT_SEARCH_VALUE_BY_FILTER_TYPE_TOKEN,
    () => {
      Object.keys(searchValueByFilterType.value).forEach((filterType) => {
        searchValueByFilterType.value[filterType as CleanArticlesTableFilterType] = '';
      });
    },
  );
  const initAppliedByFilterValueByFilterType: CleanArticlesTableInitAppliedByFilterValueByFilterType = inject(
    MOCK_INIT_APPLIED_BY_FILTER_VALUE_BY_FILTER_TYPE_TOKEN,
    () => {
      tableFilterTypes.value.forEach((filterType) => {
        appliedValuesByFilterType.value[filterType] = [];
        initialAppliedValuesByFilterType.value[filterType] = [];

        const filterValues = appliedFilters.value[filterType];

        if (!filterValues) {
          return;
        }

        filterValues.forEach((filterValue) => {
          appliedValuesByFilterType.value[filterType]!.push(filterValue);
          initialAppliedValuesByFilterType.value[filterType]!.push(filterValue);
        });
      });
    },
  );
  const initChosenGroupNoByGrouping: CleanArticlesTableInitChosenGroupNoByGrouping = inject(
    MOCK_INIT_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN,
    async () => {
      const { groupNoPath } = queryParamsValues.value;

      const [hfbNo, paNo] = groupNoPath ?? [];
      const [functionalAreaNo, consumerFunctionNo, productFunctionNo] = groupNoPath ?? [];

      const [hfb] = !cleanArticlesTableStore.filterOptionsByColumn[ArticleColumn.HFB]
        ? []
        : cleanArticlesTableStore.filterOptionsByColumn[ArticleColumn.HFB]!.filter(
            (option) => option.group_no === hfbNo,
          ).map((option) => option.group_no);

      const [pa] = !cleanArticlesTableStore.filterOptionsByColumn[ArticleColumn.PA]
        ? []
        : cleanArticlesTableStore.filterOptionsByColumn[ArticleColumn.PA]!.filter(
            (option) => option.group_no === paNo,
          ).map((option) => option.group_no);

      const [functionalArea] = !cleanArticlesTableStore.filterOptionsByColumn[ArticleColumn.FUNCTIONAL_AREA_NAME]
        ? []
        : cleanArticlesTableStore.filterOptionsByColumn[ArticleColumn.FUNCTIONAL_AREA_NAME]!.filter(
            (option) => option.group_no === functionalAreaNo,
          ).map((option) => option.group_no);

      const [consumerFunction] = !cleanArticlesTableStore.filterOptionsByColumn[ArticleColumn.CONSUMER_FUNCTION_NAME]
        ? []
        : cleanArticlesTableStore.filterOptionsByColumn[ArticleColumn.CONSUMER_FUNCTION_NAME]!.filter(
            (option) => option.group_no === consumerFunctionNo,
          ).map((option) => option.group_no);

      const [productFunction] = !cleanArticlesTableStore.filterOptionsByColumn[ArticleColumn.PRODUCT_FUNCTION_NAME]
        ? []
        : cleanArticlesTableStore.filterOptionsByColumn[ArticleColumn.PRODUCT_FUNCTION_NAME]!.filter(
            (option) => option.group_no === productFunctionNo,
          ).map((option) => option.group_no);

      chosenGroupNoByGrouping.HFB = hfb ?? '';
      initialChosenGroupNoByGrouping.HFB = hfb ?? '';
      await nextTick();
      chosenGroupNoByGrouping.PA = pa ?? '';
      initialChosenGroupNoByGrouping.PA = pa ?? '';
      await nextTick();
      chosenGroupNoByGrouping.Functional_Area_Name = functionalArea ?? '';
      initialChosenGroupNoByGrouping.Functional_Area_Name = functionalArea ?? '';
      await nextTick();
      chosenGroupNoByGrouping.Consumer_Function_Name = consumerFunction ?? '';
      initialChosenGroupNoByGrouping.Consumer_Function_Name = consumerFunction ?? '';
      await nextTick();
      chosenGroupNoByGrouping.Product_Function_Name = productFunction ?? '';
      initialChosenGroupNoByGrouping.Product_Function_Name = productFunction ?? '';
    },
  );
  const selectedOptionValueByFilterType: CleanArticlesTableSelectedOptionValueByFilterType = inject(
    MOCK_SELECTED_OPTION_VALUE_BY_FILTER_TYPE_TOKEN,
    (filterType) => {
      const option = cleanArticlesTableStore.filterOptionsByColumn[filterType]?.find(
        (option) => option.group_no === chosenGroupNoByGrouping[filterType],
      );

      return option ? optionToString(option) : '';
    },
  );
  const appliedFiltersLengthByFilterType: CleanArticlesTableAppliedFiltersLengthByFilterType = inject(
    MOCK_APPLIED_FILTERS_LENGTH_BY_KEY_TOKEN,
    (filterType) => {
      const appliedValues = appliedValuesByFilterType.value[filterType];

      return appliedValues ? appliedValues.length : 0;
    },
  );
  const isViewFilterType: CleanArticlesTableIsViewFilterType = inject(MOCK_IS_VIEW_FILTER_TYPE_TOKEN, (filterType) => {
    return (
      filterType === ArticleColumn.HFB ||
      filterType === ArticleColumn.PA ||
      filterType === ArticleColumn.FUNCTIONAL_AREA_NAME ||
      filterType === ArticleColumn.CONSUMER_FUNCTION_NAME ||
      filterType === ArticleColumn.PRODUCT_FUNCTION_NAME
    );
  });
  const expansionPanelTitleByFilterType: CleanArticlesTableExpansionPanelTitleByFilterType = inject(
    MOCK_EXPANSION_PANEL_TITLE_BY_FILTER_TYPE,
    (filterType) => {
      const parts: string[] = [translateKey(formatArticleKey(filterType))];

      if (isViewFilterType(filterType)) {
        const selectedOptionValue = selectedOptionValueByFilterType(filterType as CleanArticlesTableViewFilterType);

        console.log({ selectedOptionValue });

        if (selectedOptionValue) {
          parts.push(`${VIEW_OPTION_SEPARATOR}${selectedOptionValue}`);
        }
      } else {
        const appliedFiltersLength = appliedFiltersLengthByFilterType(filterType);

        if (appliedFiltersLength) {
          parts.push(` (${appliedFiltersLength})`);
        }
      }

      return parts.join('');
    },
  );
  const onFilterSearch: CleanArticlesTableOnFilterSearch = inject(
    MOCK_ON_FILTER_SEARCH_TOKEN,
    (filterType, { value }): void => {
      searchValueByFilterType.value[filterType] = value;
    },
  );
  const onFilterClick: CleanArticlesTableOnFilterClick = inject(MOCK_ON_FILTER_CLICK_TOKEN, async (filterType) => {
    onModalOpen();
    await nextTick();
    expandedPanels.value = [filterType];
    await nextTick();
    virtualScrolls.value[filterType]!.$el.scrollIntoView();
  });
  const onFilterRemove: CleanArticlesTableOnFilterRemove = inject(
    MOCK_ON_FILTER_REMOVE_TOKEN,
    async (filterType, value) => {
      const {
        tableCleanCandidateValues,
        tableCCLValues,
        tableStyleGroupValues,
        tablePriceLevelValues,
        tableProductNameValues,
        groupingPath,
        groupNoPath,
      } = queryParamsValues.value;

      if (isViewFilterType(filterType)) {
        if (doNotShowFilterRemoveConfirmationAgain.value === 'false') {
          const confirmed = await openFilterRemoveConfirmation.value!();

          if (confirmed !== ConfirmationModalActions.Confirm) {
            return;
          }

          sessionStorage.setItem(DO_NOT_SHOW_FILTER_REMOVE_CONFIRMATION_AGAIN, 'true');
        }
      }

      const { group_no } = optionFromString(value);

      switch (filterType) {
        case ArticleColumn.CLEAN_CANDIDATE:
          setQueryParamsValues({
            queryParams: {
              ...JSON.parse(JSON.stringify(queryParamsValues.value)),
              tableCleanCandidateValues: tableCleanCandidateValues!.filter((filterValue) => filterValue !== value),
              tablePage: TABLE_DEFAULT_PAGE,
            },
          });
          break;

        case ArticleColumn.CCL:
          setQueryParamsValues({
            queryParams: {
              ...JSON.parse(JSON.stringify(queryParamsValues.value)),
              tableCCLValues: tableCCLValues!.filter((filterValue) => filterValue !== value),
              tablePage: TABLE_DEFAULT_PAGE,
            },
          });
          break;

        case ArticleColumn.STYLE_GROUP:
          setQueryParamsValues({
            queryParams: {
              ...JSON.parse(JSON.stringify(queryParamsValues.value)),
              tableStyleGroupValues: tableStyleGroupValues!.filter((filterValue) => filterValue !== value),
              tablePage: TABLE_DEFAULT_PAGE,
            },
          });
          break;

        case ArticleColumn.PRICE_LEVEL:
          setQueryParamsValues({
            queryParams: {
              ...JSON.parse(JSON.stringify(queryParamsValues.value)),
              tablePriceLevelValues: tablePriceLevelValues!.filter((filterValue) => filterValue !== value),
              tablePage: TABLE_DEFAULT_PAGE,
            },
          });
          break;

        case ArticleColumn.PRODUCT_NAME:
          setQueryParamsValues({
            queryParams: {
              ...JSON.parse(JSON.stringify(queryParamsValues.value)),
              tableProductNameValues: tableProductNameValues!.filter((filterValue) => filterValue !== value),
              tablePage: TABLE_DEFAULT_PAGE,
            },
          });
          break;

        case ArticleColumn.HFB:
          setQueryParamsValues({
            queryParams: {
              ...JSON.parse(JSON.stringify(queryParamsValues.value)),
              groupingPath: [Grouping.HFB],
              groupNoPath: null,
              tablePage: TABLE_DEFAULT_PAGE,
            },
          });
          break;

        case ArticleColumn.PA:
          setQueryParamsValues({
            queryParams: {
              ...JSON.parse(JSON.stringify(queryParamsValues.value)),
              groupingPath: groupingPath!.slice(0, groupingPath!.indexOf(Grouping.PA)),
              groupNoPath: groupNoPath!.slice(0, groupNoPath!.indexOf(group_no!)),
              tablePage: TABLE_DEFAULT_PAGE,
            },
          });
          break;

        case ArticleColumn.FUNCTIONAL_AREA_NAME:
          setQueryParamsValues({
            queryParams: {
              ...JSON.parse(JSON.stringify(queryParamsValues.value)),
              groupingPath: [Grouping.FUNCTIONAL_AREA],
              groupNoPath: null,
              tablePage: TABLE_DEFAULT_PAGE,
            },
          });
          break;

        case ArticleColumn.CONSUMER_FUNCTION_NAME:
          setQueryParamsValues({
            queryParams: {
              ...JSON.parse(JSON.stringify(queryParamsValues.value)),
              groupingPath: groupingPath!.slice(0, groupingPath!.indexOf(Grouping.CONSUMER_FUNCTION)),
              groupNoPath: groupNoPath!.slice(0, groupNoPath!.indexOf(group_no!)),
              tablePage: TABLE_DEFAULT_PAGE,
            },
          });
          break;

        case ArticleColumn.PRODUCT_FUNCTION_NAME:
          setQueryParamsValues({
            queryParams: {
              ...JSON.parse(JSON.stringify(queryParamsValues.value)),
              groupingPath: groupingPath!.slice(0, groupingPath!.indexOf(Grouping.PRODUCT_FUNCTION)),
              groupNoPath: groupNoPath!.slice(0, groupNoPath!.indexOf(group_no!)),
              tablePage: TABLE_DEFAULT_PAGE,
            },
          });
          break;
      }
    },
  );
  const onReset: CleanArticlesTableOnReset = inject(MOCK_ON_RESET_TOKEN, async () => {
    if (doNotShowFiltersResetConfirmationAgain.value === 'false') {
      const confirmed = await openFiltersResetConfirmation.value!();

      if (confirmed !== ConfirmationModalActions.Confirm) {
        return;
      }

      sessionStorage.setItem(DO_NOT_SHOW_FILTERS_RESET_CONFIRMATION_AGAIN, 'true');
    }

    const { grouping } = queryParamsValues.value;

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableCleanCandidateValues: null,
        tableCCLValues: null,
        tableStyleGroupValues: null,
        tablePriceLevelValues: null,
        tableProductNameValues: null,
        groupingPath: [grouping!],
        groupNoPath: null,
      },
    });

    onModalClose();
  });
  const onApply: CleanArticlesTableOnApply = inject(MOCK_ON_APPLY_TOKEN, async () => {
    if (doNotShowFilterApplyConfirmationAgain.value === 'false') {
      const confirmed = await openFilterApplyConfirmation.value!();

      if (confirmed !== ConfirmationModalActions.Confirm) {
        return;
      }

      sessionStorage.setItem(DO_NOT_SHOW_FILTER_APPLY_CONFIRMATION_AGAIN, 'true');
    }

    const { grouping } = queryParamsValues.value;

    const options = [
      ...(grouping === Grouping.HFB
        ? [
            ...(chosenGroupNoByGrouping[Grouping.HFB]
              ? [
                  {
                    grouping: Grouping.HFB,
                    groupNo: chosenGroupNoByGrouping[Grouping.HFB],
                  },
                ]
              : []),

            ...(chosenGroupNoByGrouping[Grouping.PA]
              ? [
                  {
                    grouping: Grouping.PA,
                    groupNo: chosenGroupNoByGrouping[Grouping.PA],
                  },
                ]
              : []),
          ]
        : []),

      ...(grouping === Grouping.FUNCTIONAL_AREA
        ? [
            ...(chosenGroupNoByGrouping[Grouping.FUNCTIONAL_AREA]
              ? [
                  {
                    grouping: Grouping.FUNCTIONAL_AREA,
                    groupNo: chosenGroupNoByGrouping[Grouping.FUNCTIONAL_AREA],
                  },
                ]
              : []),

            ...(chosenGroupNoByGrouping[Grouping.CONSUMER_FUNCTION]
              ? [
                  {
                    grouping: Grouping.CONSUMER_FUNCTION,
                    groupNo: chosenGroupNoByGrouping[Grouping.CONSUMER_FUNCTION],
                  },
                ]
              : []),

            ...(chosenGroupNoByGrouping[Grouping.PRODUCT_FUNCTION]
              ? [
                  {
                    grouping: Grouping.PRODUCT_FUNCTION,
                    groupNo: chosenGroupNoByGrouping[Grouping.PRODUCT_FUNCTION],
                  },
                ]
              : []),
          ]
        : []),
    ];

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableCleanCandidateValues: appliedValuesByFilterType.value[ArticleColumn.CLEAN_CANDIDATE],
        tableCCLValues: appliedValuesByFilterType.value[ArticleColumn.CCL],
        tableStyleGroupValues: appliedValuesByFilterType.value[ArticleColumn.STYLE_GROUP],
        tablePriceLevelValues: appliedValuesByFilterType.value[ArticleColumn.PRICE_LEVEL],
        tableProductNameValues: appliedValuesByFilterType.value[ArticleColumn.PRODUCT_NAME],
        groupingPath: options.map(({ grouping }) => grouping),
        groupNoPath: options.map(({ groupNo }) => groupNo),
        tablePage: TABLE_DEFAULT_PAGE,
      },
    });

    onModalClose();
  });

  watch(
    () => expandedPanels.value,
    async () => {
      await nextTick();
      expandedPanels.value.forEach((filterType) => {
        if (virtualScrolls.value[filterType]!.$el.scrollHeight > MAX_VIRTUAL_SCROLL_HEIGHT_PX) {
          virtualScrolls.value[filterType]!.$el.classList.add('with-scroll');
        } else {
          virtualScrolls.value[filterType]!.$el.classList.remove('with-scroll');
        }
      });
    },
  );

  watch(
    () => chosenGroupNoByGrouping[Grouping.HFB],
    async () => {
      if (hfbBeingModified.value) {
        return;
      }

      paBeingModified.value = true;
      chosenGroupNoByGrouping[Grouping.PA] = '';
      await nextTick();
      paBeingModified.value = false;
    },
  );

  watch(
    () => chosenGroupNoByGrouping[Grouping.PA],
    async () => {
      if (paBeingModified.value) {
        return;
      }

      const paOption = cleanArticlesTableStore.filterOptionsByColumn[Grouping.PA]?.find(
        (option) => option.group_no === chosenGroupNoByGrouping[Grouping.PA],
      );

      const hfbOption = cleanArticlesTableStore.filterOptionsByColumn[Grouping.HFB]?.find(
        (option) => option.group_no === paOption?.parent_group_no,
      );

      hfbBeingModified.value = true;
      chosenGroupNoByGrouping[Grouping.HFB] = hfbOption?.group_no ?? '';
      await nextTick();
      hfbBeingModified.value = false;
    },
  );

  watch(
    () => chosenGroupNoByGrouping[Grouping.FUNCTIONAL_AREA],
    async () => {
      if (functionalAreaBeingModified.value) {
        return;
      }

      consumerFunctionBeingModified.value = true;
      productFunctionBeingModified.value = true;
      chosenGroupNoByGrouping[Grouping.CONSUMER_FUNCTION] = '';
      chosenGroupNoByGrouping[Grouping.PRODUCT_FUNCTION] = '';
      await nextTick();
      consumerFunctionBeingModified.value = false;
      productFunctionBeingModified.value = false;
    },
  );

  watch(
    () => chosenGroupNoByGrouping[Grouping.CONSUMER_FUNCTION],
    async () => {
      if (consumerFunctionBeingModified.value) {
        return;
      }

      productFunctionBeingModified.value = true;
      chosenGroupNoByGrouping[Grouping.PRODUCT_FUNCTION] = '';
      await nextTick();
      productFunctionBeingModified.value = false;

      const consumerFunctionOption = cleanArticlesTableStore.filterOptionsByColumn[Grouping.CONSUMER_FUNCTION]?.find(
        (option) => option.group_no === chosenGroupNoByGrouping[Grouping.CONSUMER_FUNCTION],
      );

      const functionalAreaOption = cleanArticlesTableStore.filterOptionsByColumn[Grouping.FUNCTIONAL_AREA]?.find(
        (option) => option.group_no === consumerFunctionOption?.parent_group_no,
      );

      functionalAreaBeingModified.value = true;
      chosenGroupNoByGrouping[Grouping.FUNCTIONAL_AREA] = functionalAreaOption?.group_no ?? '';
      await nextTick();
      functionalAreaBeingModified.value = false;
    },
  );

  watch(
    () => chosenGroupNoByGrouping[Grouping.PRODUCT_FUNCTION],
    async () => {
      if (productFunctionBeingModified.value) {
        return;
      }

      const productFunctionOption = cleanArticlesTableStore.filterOptionsByColumn[Grouping.PRODUCT_FUNCTION]?.find(
        (option) => option.group_no === chosenGroupNoByGrouping[Grouping.PRODUCT_FUNCTION],
      );

      const consumerFunctionOption = cleanArticlesTableStore.filterOptionsByColumn[Grouping.CONSUMER_FUNCTION]?.find(
        (option) => option.group_no === productFunctionOption?.parent_group_no,
      );

      const functionalAreaOption = cleanArticlesTableStore.filterOptionsByColumn[Grouping.FUNCTIONAL_AREA]?.find(
        (option) => option.group_no === consumerFunctionOption?.parent_group_no,
      );

      functionalAreaBeingModified.value = true;
      consumerFunctionBeingModified.value = true;
      chosenGroupNoByGrouping[Grouping.CONSUMER_FUNCTION] = consumerFunctionOption?.group_no ?? '';
      chosenGroupNoByGrouping[Grouping.FUNCTIONAL_AREA] = functionalAreaOption?.group_no ?? '';
      await nextTick();
      functionalAreaBeingModified.value = false;
      consumerFunctionBeingModified.value = false;
    },
  );

  watch(queryParamsValues, async (newQueryParams, oldQueryParams) => {
    if (
      newQueryParams.groupingPath !== oldQueryParams.groupingPath ||
      newQueryParams.groupNoPath !== oldQueryParams.groupNoPath
    ) {
      const { groupNoPath } = newQueryParams;

      const [hfbNo, paNo] = groupNoPath ?? [];
      const [functionalAreaNo, consumerFunctionNo, productFunctionNo] = groupNoPath ?? [];

      chosenGroupNoByGrouping[Grouping.HFB] = hfbNo ?? '';
      initialChosenGroupNoByGrouping[Grouping.HFB] = hfbNo ?? '';
      await nextTick();
      chosenGroupNoByGrouping[Grouping.PA] = paNo ?? '';
      initialChosenGroupNoByGrouping[Grouping.PA] = paNo ?? '';
      await nextTick();
      chosenGroupNoByGrouping[Grouping.FUNCTIONAL_AREA] = functionalAreaNo ?? '';
      initialChosenGroupNoByGrouping[Grouping.FUNCTIONAL_AREA] = functionalAreaNo ?? '';
      await nextTick();
      chosenGroupNoByGrouping[Grouping.CONSUMER_FUNCTION] = consumerFunctionNo ?? '';
      initialChosenGroupNoByGrouping[Grouping.CONSUMER_FUNCTION] = consumerFunctionNo ?? '';
      await nextTick();
      chosenGroupNoByGrouping[Grouping.PRODUCT_FUNCTION] = productFunctionNo ?? '';
      initialChosenGroupNoByGrouping[Grouping.PRODUCT_FUNCTION] = productFunctionNo ?? '';
    }
  });

  defineExpose({
    cleanArticlesTableStore,
    tableColumnsKeys,
    tableColumns,
    mappedArticles,
    tableSearchScope,
    tableFilterTypes,
    appliedFilters,
    tableFilters,
    filteredFiltersValues,
    appliedValuesByFilterTypeDirty,
    chosenGroupNoByGroupingDirty,
    appliedFiltersExist,
    initialSearchValue,
    initialSearchColumn,
    currentPage,
    initialItemsPerPage,
    initialOrderBy,
    initialDesc,
    expandedPanels,

    virtualScrolls,
    filtersModalVisible,
    searchValueByFilterType,
    appliedValuesByFilterType,
    initialAppliedValuesByFilterType,
    searchableFilterTypes,
    chosenGroupNoByGrouping,
    initialChosenGroupNoByGrouping,
    openFilterRemoveConfirmation,
    doNotShowFilterRemoveConfirmationAgain,
    openFilterApplyConfirmation,
    doNotShowFilterApplyConfirmationAgain,
    openFiltersResetConfirmation,
    doNotShowFiltersResetConfirmationAgain,
    hfbBeingModified,
    paBeingModified,
    functionalAreaBeingModified,
    consumerFunctionBeingModified,
    productFunctionBeingModified,

    onSearch,
    formatAppliedFilterLabel,
    onPageChange,
    onItemsPerPageChange,
    onSortChange,
    onModalOpen,
    onModalClose,
    initSearchValueByFilterType,
    initAppliedByFilterValueByFilterType,
    initChosenGroupNoByGrouping,
    selectedOptionValueByFilterType,
    appliedFiltersLengthByFilterType,
    isViewFilterType,
    expansionPanelTitleByFilterType,
    onFilterSearch,
    onFilterClick,
    onFilterRemove,
    onReset,
    onApply,
  });
</script>

<style lang="scss" scoped>
  .CleanArticlesTable {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .table-heading {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 800px;
      padding-bottom: 1rem;
    }
  }
</style>

<style lang="scss">
  @import '@ingka/variables/style.scss';

  .CleanArticlesTable {
    padding-bottom: 6rem;

    .v-data-table__td {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;

      // Item Number
      &:nth-child(1) {
        min-width: 10rem;
      }

      // Item Name
      &:nth-child(2) {
        min-width: 24rem;
        max-width: 24rem;
      }

      // RU code
      &:nth-child(3) {
        min-width: 6rem;
      }

      // Currency code
      &:nth-child(4) {
        min-width: 6rem;
      }

      // Clean Candidate
      &:nth-child(5) {
        min-width: 6rem;
      }

      // Availability
      &:nth-child(6) {
        min-width: 10rem;
      }

      // RU SSD
      &:nth-child(7) {
        min-width: 10rem;
      }

      // RU SED
      &:nth-child(8) {
        min-width: 10rem;
      }

      // CCL
      &:nth-child(9) {
        min-width: 4rem;
      }

      // Total Revenue
      &:nth-child(10) {
        min-width: 8rem;
      }

      // Total Quantity
      &:nth-child(11) {
        min-width: 8rem;
      }

      // Total Distinct Purchases
      &:nth-child(12) {
        min-width: 10rem;
      }

      // Prob of buying
      &:nth-child(13) {
        min-width: 12rem;
      }

      // Revenue per receipt
      &:nth-child(14) {
        min-width: 10rem;
      }

      // Quantity per receipt
      &:nth-child(15) {
        min-width: 10rem;
      }

      // Quantity Growth Rate
      &:nth-child(16) {
        min-width: 12rem;
      }

      // Avg rating
      &:nth-child(17) {
        min-width: 10rem;
      }

      // Product Name
      &:nth-child(18) {
        min-width: 12rem;
      }

      // HFA Furniture
      &:nth-child(19) {
        min-width: 10rem;
      }

      // Price Level
      &:nth-child(20) {
        min-width: 14rem;
      }

      // Style Group
      &:nth-child(21) {
        min-width: 10rem;
      }

      // HFB / Functional_Area_Name
      &:nth-child(22) {
        min-width: 16rem;
      }

      // PA / Consumer_Function_Name
      &:nth-child(23) {
        min-width: 16rem;
      }

      // Product_Function_Name
      &:nth-child(24) {
        min-width: 16rem;
      }

      // Numeric cells
      &:nth-child(6),
      &:nth-child(7),
      &:nth-child(8),
      &:nth-child(10),
      &:nth-child(11),
      &:nth-child(12),
      &:nth-child(13),
      &:nth-child(14),
      &:nth-child(15),
      &:nth-child(16),
      &:nth-child(17) {
        text-align: right;

        .v-data-table-header__content {
          justify-content: flex-end;
        }

        &:not(th) {
          padding-right: 2.5rem;
        }
      }
    }

    .v-expansion-panel {
      border-radius: 0;
      background-color: transparent;

      .v-expansion-panel__shadow {
        display: none;
      }

      .search {
        margin: 1.5rem 0;
      }

      &::before {
        content: '';
        display: block;
        border-top: 1px solid $colour-neutral-3;
      }

      &:not(:first-child)::after {
        display: none;
      }
    }

    .v-expansion-panel-title {
      font-weight: bold;
      padding: 1.5rem 1rem;
      background: transparent;
      color: $colour-text-and-icon-1;
      border: 0;
      border-radius: 0;
      line-height: 1.5rem;

      .CleanArticlesTable__expansion-panel-title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .v-expansion-panel-title__overlay {
        display: none;
      }
    }

    .v-expansion-panel-text__wrapper {
      padding: 0;
    }

    .v-virtual-scroll {
      padding-right: 0.375rem;

      .v-virtual-scroll__item {
        .checkbox {
          flex-direction: row-reverse;
          padding: 1.5rem 1rem;
          gap: 1rem;

          input[type='checkbox'] {
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
          }

          .checkbox__label {
            display: flex;
            flex: 1;
            z-index: 1;
            min-width: 0;
            margin-top: 0;
            font-size: 0.875rem;
            line-height: 1.375rem;
            color: $colour-text-and-icon-2;

            label {
              padding-inline-start: 0;
              width: 100%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }

        &:not(:first-child) {
          .checkbox {
            border-top: 1px solid $colour-neutral-3;
          }
        }

        .radio {
          flex-direction: row-reverse;
          padding: 1.5rem 1rem;
          gap: 1rem;

          input[type='radio'] {
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
          }

          .radio__label {
            display: flex;
            flex: 1;
            z-index: 1;
            min-width: 0;
            margin-top: 0;
            font-size: 0.875rem;
            line-height: 1.375rem;
            color: $colour-text-and-icon-2;

            label {
              padding-inline-start: 0;
              width: 100%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }

        &:not(:first-child) {
          .radio {
            border-top: 1px solid $colour-neutral-3;
          }
        }
      }

      &.with-scroll {
        padding-right: 1.5rem;
      }
    }

    .prompt .checkbox {
      padding: 2rem 0 1.5rem;

      .checkbox__label {
        font-size: 1rem;
        line-height: 1.5rem;
        margin-top: 0;
      }
    }
  }
</style>
