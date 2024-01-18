import {
  TABLE_DEFAULT_DESC,
  TABLE_DEFAULT_ITEMS_PER_PAGE,
  TABLE_DEFAULT_ORDER_BY,
  TABLE_DEFAULT_PAGE,
  TABLE_DEFAULT_SEARCH_COLUMN,
  VIEW_OPTION_SEPARATOR,
} from '@/constants';
import { useQueryParamsValues } from '@/hooks/use-query-params-values.hook';
import { type CleanArticlesTableStoreState, type FilterOptionsByColumn } from '@/store/clean-articles-table';
import { ArticleColumn } from '@/types/article-column.enum';
import { Grouping } from '@/types/grouping.enum';
import type { MappedTableArticle } from '@/types/mapped-table-article.interface';
import type { Option } from '@/types/option.interface';
import type { TableArticle } from '@/types/table-article.interface';
import Button from '@ingka/button-vue';
import Checkbox from '@ingka/checkbox-vue';
import Modal, { ModalBody, ModalFooter, ModalHeader, Sheets } from '@ingka/modal-vue';
import { mount, shallowMount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { computed, reactive, ref } from 'vue';
import type { LocationQuery } from 'vue-router';
import { createVuetify } from 'vuetify';
import { VExpansionPanel, VExpansionPanelText, VExpansionPanels, VVirtualScroll } from 'vuetify/components';
import { SearchInput } from '../SearchInput';
import type { SearchResult } from '../SearchInput/SearchInput.types';
import { Table } from '../Table';
import { SortOrder, type Sort, type TableColumn } from '../Table/Table.types';
import { TableFilters } from '../TableFilters';
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
  MOCK_ON_MODAL_CLOSE_TOKEN,
  MOCK_ON_MODAL_OPEN_TOKEN,
  MOCK_OPEN_FILTERS_RESET_CONFIRMATION_TOKEN,
  MOCK_OPEN_FILTER_APPLY_CONFIRMATION_TOKEN,
  MOCK_OPEN_FILTER_REMOVE_CONFIRMATION_TOKEN,
  MOCK_PA_BEING_MODIFIED_TOKEN,
  MOCK_PRODUCT_FUNCTION_BEING_MODIFIED_TOKEN,
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
  type CleanArticlesTableFilter,
  type CleanArticlesTableFilterType,
  type CleanArticlesTableFiltersValues,
  type CleanArticlesTableFormatAppliedFilterLabel,
  type CleanArticlesTableInitAppliedByFilterValueByFilterType,
  type CleanArticlesTableInitChosenGroupNoByGrouping,
  type CleanArticlesTableInitSearchValueByFilterType,
  type CleanArticlesTableIsViewFilterType,
  type CleanArticlesTableOnModalClose,
  type CleanArticlesTableOnModalOpen,
  type CleanArticlesTableSearchValueByFilterType,
  type CleanArticlesTableSelectedOptionValueByFilterType,
  type CleanArticlesTableVirtualScrollElementRefByFilterType,
} from './CleanArticlesTable.types';
import CleanArticlesTable from './CleanArticlesTable.vue';
import {
  ConfirmationModalActions,
  type ConfirmationModalConfiguration,
  type ConfirmationModalOpen,
} from '@/types/confirmation-modal';
import { ConfirmationModal, MOCK_CONFIRMATION_MODAL_CONFIG_TOKEN } from '../ConfirmationModal';

const query = ref<LocationQuery>({});
const vuetify = createVuetify({});

vi.mock('vue-router', () => {
  return {
    useRoute: () => {
      return computed(() => ({
        query: query.value,
      }));
    },
    useRouter: () => ({
      push: (route: { query: LocationQuery }) => {
        query.value = route.query;
      },
      replace: (route: { query: LocationQuery }) => {
        query.value = route.query;
      },
    }),
  };
});

vi.mock('@/hooks/use-i18n.hook', () => ({
  useI18n: () => ({
    translateKey: vi.fn((translationKey, replacements: Record<string, string | number | null | undefined> = {}) => {
      return `translated ${translationKey}${
        Object.keys(replacements).length ? ` ${JSON.stringify(replacements)}` : ''
      }`;
    }),
  }),
}));

vi.mock('@/store/clean-articles-table', () => ({
  useCleanArticlesTableStore: () =>
    reactive<CleanArticlesTableStoreState>({
      articles: [],
      articlesLoading: true,
      totalPages: 0,
      totalArticles: 0,
      filterOptionsByColumn: {},
      filterOptionsLoadingByColumn: {},
    }),
}));

vi.mock('@/components/CleanArticlesTable/CleanArticlesTable.utils', () => ({
  formatArticleKey: vi.fn((articleKey: ArticleColumn) => `formatted ${articleKey}`),
  normalize: vi.fn((value: string) => `normalized ${value}`),
}));

vi.mock('@/utils/common.utils', () => ({
  formatNumber: vi.fn(({ number }: { number: number }) => `formatted ${number}`),
  asArrayOfIndexables: vi.fn(<T>(array: T[]) => array as unknown as Record<string, unknown>[]),
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

const MOCK_TABLE_ARTICLE: TableArticle = {
  Item_Number: 'Item_Number',
  Item_Name: 'Item_Name',
  Item_Name_International: 'Item_Name_International',
  Availability: 0,
  RU_SSD: 'RU_SSD',
  RU_SED: 'RU_SED',
  CCL: 'CCL',
  Total_Revenue: 0,
  Total_Quantity: 0,
  Total_Distinct_Purchases: 0,
  Prob_of_buying: 0,
  HFB: 'HFB',
  hfb_no: 'hfb_no',
  PA: 'PA',
  pa_no: 'pa_no',
  Style_Group: 'Style_Group',
  Price_Level: 'Price_Level',
  Revenue_per_receipt: 0,
  Quantity_per_receipt: 0,
  Quantity_Growth_Rate: 0,
  Avg_rating: 0,
  Product_Name: 'Product_Name',
  Functional_Area_Name: 'Functional_Area_Name',
  functional_area_name_no: 'functional_area_name_no',
  Consumer_Function_Name: 'Consumer_Function_Name',
  consumer_function_name_no: 'consumer_function_name_no',
  Product_Function_Name: 'Product_Function_Name',
  product_function_name_no: 'product_function_name_no',
  HFA_Furniture: 'HFA_Furniture',
  retail_unit_code: 'retail_unit_code',
  currency_code: 'currency_code',
  Clean_Candidate: 'Clean_Candidate',
};

const MOCK_MAPPED_TABLE_ARTICLE: MappedTableArticle = {
  ...MOCK_TABLE_ARTICLE,
  Availability: 'formatted 0',
  Total_Revenue: 'formatted 0',
  Total_Quantity: 'formatted 0',
  Total_Distinct_Purchases: 'formatted 0',
  Prob_of_buying: 'formatted 0',
  Revenue_per_receipt: 'formatted 0',
  Quantity_per_receipt: 'formatted 0',
  Quantity_Growth_Rate: 'formatted 0',
  Avg_rating: 'formatted 0',
};

describe('`tableColumnsKeys`', () => {
  it('should return grouping-specific columns', async () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        grouping: Grouping.HFB,
      },
    });

    expect(wrapper.vm.tableColumnsKeys).toContain(ArticleColumn.HFB);
    expect(wrapper.vm.tableColumnsKeys).toContain(ArticleColumn.PA);
    expect(wrapper.vm.tableColumnsKeys).not.toContain(ArticleColumn.FUNCTIONAL_AREA_NAME);
    expect(wrapper.vm.tableColumnsKeys).not.toContain(ArticleColumn.CONSUMER_FUNCTION_NAME);
    expect(wrapper.vm.tableColumnsKeys).not.toContain(ArticleColumn.PRODUCT_FUNCTION_NAME);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        grouping: Grouping.FUNCTIONAL_AREA,
      },
    });

    expect(wrapper.vm.tableColumnsKeys).toContain(ArticleColumn.FUNCTIONAL_AREA_NAME);
    expect(wrapper.vm.tableColumnsKeys).toContain(ArticleColumn.CONSUMER_FUNCTION_NAME);
    expect(wrapper.vm.tableColumnsKeys).toContain(ArticleColumn.PRODUCT_FUNCTION_NAME);
    expect(wrapper.vm.tableColumnsKeys).not.toContain(ArticleColumn.HFB);
    expect(wrapper.vm.tableColumnsKeys).not.toContain(ArticleColumn.PA);
  });
});

describe('`tableColumns`', () => {
  it('should return table columns', () => {
    const mockTableColumnsKeys = ref<ArticleColumn[]>([ArticleColumn.CLEAN_CANDIDATE]);

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_TABLE_COLUMNS_KEYS_TOKEN]: mockTableColumnsKeys,
        },
      },
    });

    expect(wrapper.vm.tableColumns).toEqual([
      {
        key: ArticleColumn.CLEAN_CANDIDATE,
        title: `formatted ${ArticleColumn.CLEAN_CANDIDATE}`,
        value: ArticleColumn.CLEAN_CANDIDATE,
      } as TableColumn,
    ]);
  });
});

describe('`mappedArticles`', () => {
  it('should return mapped articles', () => {
    const mockCleanArticlesTableStore = reactive<CleanArticlesTableStoreState>({
      articles: [MOCK_TABLE_ARTICLE],
      articlesLoading: true,
      totalPages: 0,
      totalArticles: 0,
      filterOptionsByColumn: {},
      filterOptionsLoadingByColumn: {},
    });

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CLEAN_ARTICLES_TABLE_STORE_TOKEN]: mockCleanArticlesTableStore,
        },
      },
    });

    expect(wrapper.vm.mappedArticles).toEqual([
      {
        ...MOCK_TABLE_ARTICLE,
        HFB: 'hfb_no - HFB',
        PA: 'pa_no - PA',
        Functional_Area_Name: 'functional_area_name_no - Functional_Area_Name',
        Consumer_Function_Name: 'consumer_function_name_no - Consumer_Function_Name',
        Product_Function_Name: 'product_function_name_no - Product_Function_Name',
        Availability: 'formatted 0',
        Total_Revenue: 'formatted 0',
        Total_Quantity: 'formatted 0',
        Total_Distinct_Purchases: 'formatted 0',
        Avg_rating: 'formatted 0',
        Prob_of_buying: 'formatted 0',
        Revenue_per_receipt: 'formatted 0',
        Quantity_Growth_Rate: 'formatted 0',
        Quantity_per_receipt: 'formatted 0',
      },
    ]);

    mockCleanArticlesTableStore.articles = [
      {
        ...MOCK_TABLE_ARTICLE,
        Availability: null,
        Total_Revenue: null,
        Total_Quantity: null,
        Total_Distinct_Purchases: null,
        Avg_rating: null,
        Prob_of_buying: null,
        Revenue_per_receipt: null,
        Quantity_Growth_Rate: null,
        Quantity_per_receipt: null,
      },
    ];

    expect(wrapper.vm.mappedArticles).toEqual([
      {
        ...MOCK_TABLE_ARTICLE,
        HFB: 'hfb_no - HFB',
        PA: 'pa_no - PA',
        Functional_Area_Name: 'functional_area_name_no - Functional_Area_Name',
        Consumer_Function_Name: 'consumer_function_name_no - Consumer_Function_Name',
        Product_Function_Name: 'product_function_name_no - Product_Function_Name',
        Availability: '',
        Total_Revenue: '',
        Total_Quantity: '',
        Total_Distinct_Purchases: '',
        Avg_rating: '',
        Prob_of_buying: '',
        Revenue_per_receipt: '',
        Quantity_Growth_Rate: '',
        Quantity_per_receipt: '',
      },
    ]);
  });
});

describe('`tableSearchScope`', () => {
  it('should return table search scope', () => {
    const mockTableColumnsKeys = ref<ArticleColumn[]>([ArticleColumn.CLEAN_CANDIDATE]);

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_TABLE_COLUMNS_KEYS_TOKEN]: mockTableColumnsKeys,
        },
      },
    });

    expect(wrapper.vm.tableSearchScope).toEqual({
      [`formatted ${ArticleColumn.CLEAN_CANDIDATE}`]: ArticleColumn.CLEAN_CANDIDATE,
    });
  });
});

describe('`tableFilterTypes`', () => {
  it('should return grouping-specific filter types', async () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        grouping: Grouping.HFB,
      },
    });

    expect(wrapper.vm.tableFilterTypes).toContain(ArticleColumn.HFB);
    expect(wrapper.vm.tableFilterTypes).toContain(ArticleColumn.PA);
    expect(wrapper.vm.tableFilterTypes).not.toContain(ArticleColumn.FUNCTIONAL_AREA_NAME);
    expect(wrapper.vm.tableFilterTypes).not.toContain(ArticleColumn.CONSUMER_FUNCTION_NAME);
    expect(wrapper.vm.tableFilterTypes).not.toContain(ArticleColumn.PRODUCT_FUNCTION_NAME);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        grouping: Grouping.FUNCTIONAL_AREA,
      },
    });

    expect(wrapper.vm.tableFilterTypes).toContain(ArticleColumn.FUNCTIONAL_AREA_NAME);
    expect(wrapper.vm.tableFilterTypes).toContain(ArticleColumn.CONSUMER_FUNCTION_NAME);
    expect(wrapper.vm.tableFilterTypes).toContain(ArticleColumn.PRODUCT_FUNCTION_NAME);
    expect(wrapper.vm.tableFilterTypes).not.toContain(ArticleColumn.HFB);
    expect(wrapper.vm.tableFilterTypes).not.toContain(ArticleColumn.PA);
  });
});

describe('`appliedFilters`', () => {
  it('should return table filters values based on `queryParamsValues`', async () => {
    const mockCleanArticlesTableStore = reactive<CleanArticlesTableStoreState>({
      articles: [],
      articlesLoading: true,
      totalPages: 0,
      totalArticles: 0,
      filterOptionsByColumn: {},
      filterOptionsLoadingByColumn: {},
    });

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CLEAN_ARTICLES_TABLE_STORE_TOKEN]: mockCleanArticlesTableStore,
        },
      },
    });

    expect(wrapper.vm.appliedFilters).toEqual({
      [ArticleColumn.CLEAN_CANDIDATE]: [],
      [ArticleColumn.CCL]: [],
      [ArticleColumn.STYLE_GROUP]: [],
      [ArticleColumn.PRICE_LEVEL]: [],
      [ArticleColumn.PRODUCT_NAME]: [],
      [ArticleColumn.HFB]: [],
      [ArticleColumn.PA]: [],
      [ArticleColumn.FUNCTIONAL_AREA_NAME]: [],
      [ArticleColumn.CONSUMER_FUNCTION_NAME]: [],
      [ArticleColumn.PRODUCT_FUNCTION_NAME]: [],
    } as CleanArticlesTableFiltersValues);

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableCleanCandidateValues: ['tableCleanCandidateValues'],
        tableCCLValues: ['tableCCLValues'],
        tableStyleGroupValues: ['tableStyleGroupValues'],
        tablePriceLevelValues: ['tablePriceLevelValues'],
        tableProductNameValues: ['tableProductNameValues'],
      },
    });

    expect(wrapper.vm.appliedFilters).toEqual({
      [ArticleColumn.CLEAN_CANDIDATE]: ['tableCleanCandidateValues'],
      [ArticleColumn.CCL]: ['tableCCLValues'],
      [ArticleColumn.STYLE_GROUP]: ['tableStyleGroupValues'],
      [ArticleColumn.PRICE_LEVEL]: ['tablePriceLevelValues'],
      [ArticleColumn.PRODUCT_NAME]: ['tableProductNameValues'],
      [ArticleColumn.HFB]: [],
      [ArticleColumn.PA]: [],
      [ArticleColumn.FUNCTIONAL_AREA_NAME]: [],
      [ArticleColumn.CONSUMER_FUNCTION_NAME]: [],
      [ArticleColumn.PRODUCT_FUNCTION_NAME]: [],
    } as CleanArticlesTableFiltersValues);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableCleanCandidateValues: null,
        tableCCLValues: null,
        tableStyleGroupValues: null,
        tablePriceLevelValues: null,
        tableProductNameValues: null,
      },
    });

    expect(wrapper.vm.appliedFilters).toEqual({
      [ArticleColumn.CLEAN_CANDIDATE]: [],
      [ArticleColumn.CCL]: [],
      [ArticleColumn.STYLE_GROUP]: [],
      [ArticleColumn.PRICE_LEVEL]: [],
      [ArticleColumn.PRODUCT_NAME]: [],
      [ArticleColumn.HFB]: [],
      [ArticleColumn.PA]: [],
      [ArticleColumn.FUNCTIONAL_AREA_NAME]: [],
      [ArticleColumn.CONSUMER_FUNCTION_NAME]: [],
      [ArticleColumn.PRODUCT_FUNCTION_NAME]: [],
    } as CleanArticlesTableFiltersValues);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        groupNoPath: ['hfbNo', 'paNo'],
      },
    });

    mockCleanArticlesTableStore.filterOptionsByColumn = {
      HFB: [
        {
          parent_group_no: null,
          group_no: 'hfbNo',
          value: 'hfb',
        },
      ],
      PA: [
        {
          parent_group_no: null,
          group_no: 'paNo',
          value: 'pa',
        },
      ],
    };

    expect(wrapper.vm.appliedFilters).toEqual({
      [ArticleColumn.CLEAN_CANDIDATE]: [],
      [ArticleColumn.CCL]: [],
      [ArticleColumn.STYLE_GROUP]: [],
      [ArticleColumn.PRICE_LEVEL]: [],
      [ArticleColumn.PRODUCT_NAME]: [],
      [ArticleColumn.HFB]: [`hfbNo${VIEW_OPTION_SEPARATOR}hfb`],
      [ArticleColumn.PA]: [`paNo${VIEW_OPTION_SEPARATOR}pa`],
      [ArticleColumn.FUNCTIONAL_AREA_NAME]: [],
      [ArticleColumn.CONSUMER_FUNCTION_NAME]: [],
      [ArticleColumn.PRODUCT_FUNCTION_NAME]: [],
    } as CleanArticlesTableFiltersValues);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        groupNoPath: ['functionalAreaNo', 'consumerFunctionNo', 'productFunctionNo'],
      },
    });

    mockCleanArticlesTableStore.filterOptionsByColumn = {
      Functional_Area_Name: [
        {
          parent_group_no: null,
          group_no: 'functionalAreaNo',
          value: 'functionalArea',
        },
      ],
      Consumer_Function_Name: [
        {
          parent_group_no: null,
          group_no: 'consumerFunctionNo',
          value: 'consumerFunction',
        },
      ],
      Product_Function_Name: [
        {
          parent_group_no: null,
          group_no: 'productFunctionNo',
          value: 'productFunction',
        },
      ],
    };

    expect(wrapper.vm.appliedFilters).toEqual({
      [ArticleColumn.CLEAN_CANDIDATE]: [],
      [ArticleColumn.CCL]: [],
      [ArticleColumn.STYLE_GROUP]: [],
      [ArticleColumn.PRICE_LEVEL]: [],
      [ArticleColumn.PRODUCT_NAME]: [],
      [ArticleColumn.HFB]: [],
      [ArticleColumn.PA]: [],
      [ArticleColumn.FUNCTIONAL_AREA_NAME]: [`functionalAreaNo${VIEW_OPTION_SEPARATOR}functionalArea`],
      [ArticleColumn.CONSUMER_FUNCTION_NAME]: [`consumerFunctionNo${VIEW_OPTION_SEPARATOR}consumerFunction`],
      [ArticleColumn.PRODUCT_FUNCTION_NAME]: [`productFunctionNo${VIEW_OPTION_SEPARATOR}productFunction`],
    } as CleanArticlesTableFiltersValues);
  });
});

describe('`tableFilters`', () => {
  it('should return table filters based on `filterTypes` and `appliedFilters`', () => {
    const mockTableFilterTypes = ref<CleanArticlesTableFilterType[]>([]);
    const mockAppliedFilters = ref<CleanArticlesTableFiltersValues>({});

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_TABLE_FILTER_TYPES_TOKEN]: mockTableFilterTypes,
          [MOCK_APPLIED_FILTERS_TOKEN]: mockAppliedFilters,
        },
      },
    });

    expect(wrapper.vm.tableFilters).toEqual([]);

    mockTableFilterTypes.value = [ArticleColumn.CLEAN_CANDIDATE];
    mockAppliedFilters.value = {
      CCL: ['CCL'],
    };

    expect(wrapper.vm.tableFilters).toEqual([]);

    mockAppliedFilters.value = {
      Clean_Candidate: [],
    };

    expect(wrapper.vm.tableFilters).toEqual([
      {
        filterType: ArticleColumn.CLEAN_CANDIDATE,
        label: `formatted ${ArticleColumn.CLEAN_CANDIDATE}`,
        isActive: false,
      } as CleanArticlesTableFilter,
    ]);

    mockAppliedFilters.value = {
      Clean_Candidate: ['Clean_Candidate'],
    };

    expect(wrapper.vm.tableFilters).toEqual([
      {
        filterType: ArticleColumn.CLEAN_CANDIDATE,
        label: `formatted ${ArticleColumn.CLEAN_CANDIDATE}`,
        isActive: true,
      } as CleanArticlesTableFilter,
    ]);
  });
});

describe('`filteredFiltersValues`', () => {
  it('should return filtered filters values based on `filterOptionsByColumn` and `searchValueByFilterType`', () => {
    const mockCleanArticlesTableStore = reactive<CleanArticlesTableStoreState>({
      articles: [],
      articlesLoading: true,
      totalPages: 0,
      totalArticles: 0,
      filterOptionsByColumn: {},
      filterOptionsLoadingByColumn: {},
    });
    const mockSearchValueByFilterType = ref<CleanArticlesTableSearchValueByFilterType>({});

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CLEAN_ARTICLES_TABLE_STORE_TOKEN]: mockCleanArticlesTableStore,
          [MOCK_SEARCH_VALUE_BY_FILTER_TYPE_TOKEN]: mockSearchValueByFilterType,
        },
      },
    });

    expect(wrapper.vm.filteredFiltersValues).toEqual({});

    mockCleanArticlesTableStore.filterOptionsByColumn = {
      Clean_Candidate: [
        {
          parent_group_no: null,
          group_no: null,
          value: 'Clean_Candidate',
        },
      ],
    };

    expect(wrapper.vm.filteredFiltersValues).toEqual({
      Clean_Candidate: [
        {
          parent_group_no: null,
          group_no: null,
          value: 'Clean_Candidate',
        },
      ],
    });

    mockSearchValueByFilterType.value = {
      Clean_Candidate: 'foo',
    };

    expect(wrapper.vm.filteredFiltersValues).toEqual({
      Clean_Candidate: [],
    });

    mockSearchValueByFilterType.value = {
      Clean_Candidate: 'ean',
    };

    expect(wrapper.vm.filteredFiltersValues).toEqual({
      Clean_Candidate: [
        {
          parent_group_no: null,
          group_no: null,
          value: 'Clean_Candidate',
        },
      ],
    });

    mockCleanArticlesTableStore.filterOptionsByColumn = {
      HFB: [
        {
          parent_group_no: null,
          group_no: '07',
          value: 'Kitchen',
        },
      ],
    };
    mockSearchValueByFilterType.value = {
      HFB: '07 - kit',
    };

    expect(wrapper.vm.filteredFiltersValues).toEqual({
      HFB: [
        {
          parent_group_no: null,
          group_no: '07',
          value: 'Kitchen',
        },
      ],
    });
  });
});

describe('`appliedValuesByFilterTypeDirty`', () => {
  it('should determine whether filters are dirty by comparing initial vs applied filters', () => {
    const mockInitialAppliedValuesByFilterType = ref<CleanArticlesTableFiltersValues>({
      Clean_Candidate: [],
    });
    const mockAppliedValuesByFilterType = ref<CleanArticlesTableFiltersValues>({
      Clean_Candidate: [],
    });

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_INITIAL_APPLIED_VALUES_BY_FILTER_TYPE_TOKEN]: mockInitialAppliedValuesByFilterType,
          [MOCK_APPLIED_VALUES_BY_FILTER_TYPE_TOKEN]: mockAppliedValuesByFilterType,
        },
      },
    });

    expect(wrapper.vm.appliedValuesByFilterTypeDirty).toBe(false);

    mockInitialAppliedValuesByFilterType.value = {
      Clean_Candidate: ['bar', 'foo'],
    };
    mockAppliedValuesByFilterType.value = {
      Clean_Candidate: ['foo', 'bar'],
    };

    expect(wrapper.vm.appliedValuesByFilterTypeDirty).toBe(false);

    mockAppliedValuesByFilterType.value = {
      Clean_Candidate: ['foo', 'bar', 'baz'],
    };

    expect(wrapper.vm.appliedValuesByFilterTypeDirty).toBe(true);
  });
});

describe('`chosenGroupNoByGroupingDirty`', () => {
  it('should determine whether view filters are dirty by comparing initial vs applied view filters', async () => {
    const mockChosenGroupNoByGrouping = reactive<CleanArticlesTableChosenGroupNoByGrouping>({});
    const mockInitialChosenGroupNoByGrouping = reactive<CleanArticlesTableChosenGroupNoByGrouping>({});

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN]: mockChosenGroupNoByGrouping,
          [MOCK_INITIAL_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN]: mockInitialChosenGroupNoByGrouping,
        },
      },
    });

    expect(wrapper.vm.chosenGroupNoByGroupingDirty).toBe(false);

    mockChosenGroupNoByGrouping.HFB = 'foo';
    mockInitialChosenGroupNoByGrouping.HFB = 'foo';

    expect(wrapper.vm.chosenGroupNoByGroupingDirty).toBe(false);

    mockChosenGroupNoByGrouping.HFB = 'bar';

    expect(wrapper.vm.chosenGroupNoByGroupingDirty).toBe(true);
  });
});

describe('`appliedFiltersExist`', () => {
  it('should determine whether there are any applied filters', () => {
    const mockAppliedFilters = ref<CleanArticlesTableFiltersValues>({});

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_APPLIED_FILTERS_TOKEN]: mockAppliedFilters,
        },
      },
    });

    expect(wrapper.vm.appliedFiltersExist).toBe(false);

    mockAppliedFilters.value = {
      Clean_Candidate: ['foo'],
    };

    expect(wrapper.vm.appliedFiltersExist).toBe(true);
  });
});

describe('`initialSearchValue`', () => {
  it('should take `tableSearchValue` from query params or fallback to a default value', async () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    expect(wrapper.vm.initialSearchValue).toBe('');

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableSearchValue: 'foo',
      },
    });

    expect(wrapper.vm.initialSearchValue).toBe('foo');

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableSearchValue: null,
      },
    });

    expect(wrapper.vm.initialSearchValue).toBe('');
  });
});

describe('`initialSearchColumn`', () => {
  it('should take `tableSearchColumn` from query params or fallback to a default value', async () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    expect(wrapper.vm.initialSearchColumn).toBe(TABLE_DEFAULT_SEARCH_COLUMN);

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableSearchColumn: ArticleColumn.ITEM_NUMBER,
      },
    });

    expect(wrapper.vm.initialSearchColumn).toBe(ArticleColumn.ITEM_NUMBER);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableSearchColumn: ArticleColumn.ITEM_NAME_INTERNATIONAL,
      },
    });

    expect(wrapper.vm.initialSearchColumn).toBe(ArticleColumn.ITEM_NAME);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableSearchColumn: ArticleColumn.PRODUCT_NAME_INTERNATIONAL,
      },
    });

    expect(wrapper.vm.initialSearchColumn).toBe(ArticleColumn.PRODUCT_NAME);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableSearchColumn: null,
      },
    });

    expect(wrapper.vm.initialSearchColumn).toBe(TABLE_DEFAULT_SEARCH_COLUMN);
  });
});

describe('`currentPage`', () => {
  it('should take `tablePage` from query params or fallback to a default value', async () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    expect(wrapper.vm.currentPage).toBe(TABLE_DEFAULT_PAGE);

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tablePage: 10,
      },
    });

    expect(wrapper.vm.currentPage).toBe(10);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tablePage: null,
      },
    });

    expect(wrapper.vm.currentPage).toBe(TABLE_DEFAULT_PAGE);
  });
});

describe('`initialItemsPerPage`', () => {
  it('should take `tableItemsPerPage` from query params or fallback to a default value', async () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    expect(wrapper.vm.initialItemsPerPage).toBe(TABLE_DEFAULT_ITEMS_PER_PAGE);

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableItemsPerPage: 100,
      },
    });

    expect(wrapper.vm.initialItemsPerPage).toBe(100);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableItemsPerPage: null,
      },
    });

    expect(wrapper.vm.initialItemsPerPage).toBe(TABLE_DEFAULT_ITEMS_PER_PAGE);
  });
});

describe('`initialOrderBy`', () => {
  it('should take `tableOrderBy` from query params or fallback to a default value', async () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    expect(wrapper.vm.initialOrderBy).toBe(TABLE_DEFAULT_ORDER_BY);

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableOrderBy: ArticleColumn.ITEM_NUMBER,
      },
    });

    expect(wrapper.vm.initialOrderBy).toBe(ArticleColumn.ITEM_NUMBER);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableOrderBy: null,
      },
    });

    expect(wrapper.vm.initialOrderBy).toBe(TABLE_DEFAULT_ORDER_BY);
  });
});

describe('`initialDesc`', () => {
  it('should take `tableDesc` from query params or fallback to a default value', async () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    expect(wrapper.vm.initialDesc).toBe(TABLE_DEFAULT_DESC);

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableDesc: true,
      },
    });

    expect(wrapper.vm.initialDesc).toBe(true);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableDesc: null,
      },
    });

    expect(wrapper.vm.initialDesc).toBe(TABLE_DEFAULT_DESC);
  });
});

describe('`onSearch`', () => {
  it('should reflect search in query params', async () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    const { queryParamsValues } = useQueryParamsValues();

    wrapper.vm.onSearch({ scope: ArticleColumn.CLEAN_CANDIDATE, value: 'foo' });

    await wrapper.vm.$nextTick();

    expect(queryParamsValues.value.tableSearchColumn).toBe(ArticleColumn.CLEAN_CANDIDATE);
    expect(queryParamsValues.value.tableSearchValue).toBe('foo');
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);

    wrapper.vm.onSearch({ scope: ArticleColumn.ITEM_NAME, value: 'bar' });

    await wrapper.vm.$nextTick();

    expect(queryParamsValues.value.tableSearchColumn).toBe(ArticleColumn.ITEM_NAME_INTERNATIONAL);
    expect(queryParamsValues.value.tableSearchValue).toBe('bar');

    wrapper.vm.onSearch({ scope: ArticleColumn.PRODUCT_NAME, value: 'baz' });

    await wrapper.vm.$nextTick();

    expect(queryParamsValues.value.tableSearchColumn).toBe(ArticleColumn.PRODUCT_NAME_INTERNATIONAL);
    expect(queryParamsValues.value.tableSearchValue).toBe('baz');
  });
});

describe('`formatAppliedFilterLabel`', () => {
  it('should format applied filter label', () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    expect(wrapper.vm.formatAppliedFilterLabel(ArticleColumn.CLEAN_CANDIDATE, 'foo')).toBe(
      `translated formatted ${ArticleColumn.CLEAN_CANDIDATE} - foo`,
    );
  });
});

describe('`onPageChange`', () => {
  it('should reflect page in query params', async () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    const { queryParamsValues } = useQueryParamsValues();

    wrapper.vm.onPageChange(10);

    await wrapper.vm.$nextTick();

    expect(queryParamsValues.value.tablePage).toBe(10);
  });
});

describe('`onItemsPerPageChange`', () => {
  it('should reflect items per page in query params and reset page to default', async () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    const { queryParamsValues } = useQueryParamsValues();

    wrapper.vm.onItemsPerPageChange(100);

    await wrapper.vm.$nextTick();

    expect(queryParamsValues.value.tableItemsPerPage).toBe(100);
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);
  });
});

describe('`onSortChange`', () => {
  it('should reflect sorting in query params', async () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    const { queryParamsValues } = useQueryParamsValues();

    wrapper.vm.onSortChange({
      key: ArticleColumn.CLEAN_CANDIDATE,
      order: SortOrder.DESC,
    });

    await wrapper.vm.$nextTick();

    expect(queryParamsValues.value.tableOrderBy).toBe(ArticleColumn.CLEAN_CANDIDATE);
    expect(queryParamsValues.value.tableDesc).toBe(true);

    wrapper.vm.onSortChange(undefined);

    await wrapper.vm.$nextTick();

    expect(queryParamsValues.value.tableOrderBy).toBe(null);
    expect(queryParamsValues.value.tableDesc).toBe(null);
  });
});

describe('`onModalOpen`', () => {
  it('should open modal and initialize values', () => {
    const mockFiltersModalVisible = ref<boolean>(false);
    const mockInitSearchValueByFilterType: CleanArticlesTableInitSearchValueByFilterType = vi.fn();
    const mockInitAppliedByFilterValueByFilterType: CleanArticlesTableInitAppliedByFilterValueByFilterType = vi.fn();
    const mockInitChosenGroupNoByGrouping: CleanArticlesTableInitChosenGroupNoByGrouping = vi.fn();

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
          [MOCK_INIT_SEARCH_VALUE_BY_FILTER_TYPE_TOKEN]: mockInitSearchValueByFilterType,
          [MOCK_INIT_APPLIED_BY_FILTER_VALUE_BY_FILTER_TYPE_TOKEN]: mockInitAppliedByFilterValueByFilterType,
          [MOCK_INIT_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN]: mockInitChosenGroupNoByGrouping,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    wrapper.vm.onModalOpen();

    expect(wrapper.vm.filtersModalVisible).toBe(true);
    expect(mockInitSearchValueByFilterType).toHaveBeenCalled();
    expect(mockInitAppliedByFilterValueByFilterType).toHaveBeenCalled();
    expect(mockInitChosenGroupNoByGrouping).toHaveBeenCalled();
  });
});

describe('`onModalClose`', () => {
  it('should close modal', () => {
    const mockFiltersModalVisible = ref<boolean>(true);
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    wrapper.vm.onModalClose();

    expect(wrapper.vm.filtersModalVisible).toBe(false);
  });
});

describe('`initSearchValueByFilterType`', () => {
  it('should initialize search value by filter type', () => {
    const mockSearchValueByFilterType = ref<CleanArticlesTableSearchValueByFilterType>({
      Clean_Candidate: undefined,
    });

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_SEARCH_VALUE_BY_FILTER_TYPE_TOKEN]: mockSearchValueByFilterType,
        },
      },
    });

    wrapper.vm.initSearchValueByFilterType();

    expect(wrapper.vm.searchValueByFilterType).toEqual({
      Clean_Candidate: '',
    } as CleanArticlesTableSearchValueByFilterType);

    mockSearchValueByFilterType.value = {
      Clean_Candidate: 'foo',
    };

    wrapper.vm.initSearchValueByFilterType();

    expect(wrapper.vm.searchValueByFilterType).toEqual({
      Clean_Candidate: '',
    } as CleanArticlesTableSearchValueByFilterType);
  });
});

describe('`initAppliedByFilterValueByFilterType`', () => {
  it('should initialize applied by filter value by filter type', () => {
    const mockTableFilterTypes = ref<CleanArticlesTableFilterType[]>([
      ArticleColumn.CLEAN_CANDIDATE,
      ArticleColumn.CCL,
    ]);
    const mockAppliedValuesByFilterType = ref<CleanArticlesTableFiltersValues>({
      CCL: ['baz'],
    });
    const mockInitialAppliedValuesByFilterType = ref<CleanArticlesTableFiltersValues>({
      CCL: ['baz'],
    });
    const mockAppliedFilters = ref<CleanArticlesTableFiltersValues>({
      Clean_Candidate: ['foo', 'bar'],
    });

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_TABLE_FILTER_TYPES_TOKEN]: mockTableFilterTypes,
          [MOCK_APPLIED_VALUES_BY_FILTER_TYPE_TOKEN]: mockAppliedValuesByFilterType,
          [MOCK_INITIAL_APPLIED_VALUES_BY_FILTER_TYPE_TOKEN]: mockInitialAppliedValuesByFilterType,
          [MOCK_APPLIED_FILTERS_TOKEN]: mockAppliedFilters,
        },
      },
    });

    wrapper.vm.initAppliedByFilterValueByFilterType();

    expect(wrapper.vm.appliedValuesByFilterType).toEqual({
      Clean_Candidate: ['foo', 'bar'],
      CCL: [],
    } as CleanArticlesTableFiltersValues);
    expect(wrapper.vm.initialAppliedValuesByFilterType).toEqual({
      Clean_Candidate: ['foo', 'bar'],
      CCL: [],
    } as CleanArticlesTableFiltersValues);
  });
});

describe('`initChosenGroupNoByGrouping`', () => {
  it('should initialize `chosenGroupNoByGrouping`', async () => {
    const mockCleanArticlesTableStore = reactive<CleanArticlesTableStoreState>({
      articles: [],
      articlesLoading: true,
      totalPages: 0,
      totalArticles: 0,
      filterOptionsByColumn: {},
      filterOptionsLoadingByColumn: {},
    });
    const mockHFBBeingModified = ref<boolean>(true);
    const mockPABeingModified = ref<boolean>(true);
    const mockFunctionalAreaBeingModified = ref<boolean>(true);
    const mockConsumerFunctionBeingModified = ref<boolean>(true);
    const mockProductFunctionBeingModified = ref<boolean>(true);
    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CLEAN_ARTICLES_TABLE_STORE_TOKEN]: mockCleanArticlesTableStore,
          [MOCK_HFB_BEING_MODIFIED_TOKEN]: mockHFBBeingModified,
          [MOCK_PA_BEING_MODIFIED_TOKEN]: mockPABeingModified,
          [MOCK_FUNCTIONAL_AREA_BEING_MODIFIED_TOKEN]: mockFunctionalAreaBeingModified,
          [MOCK_CONSUMER_FUNCTION_BEING_MODIFIED_TOKEN]: mockConsumerFunctionBeingModified,
          [MOCK_PRODUCT_FUNCTION_BEING_MODIFIED_TOKEN]: mockProductFunctionBeingModified,
        },
      },
    });

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await wrapper.vm.initChosenGroupNoByGrouping();

    expect(wrapper.vm.chosenGroupNoByGrouping.HFB).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.HFB).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.PA).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.PA).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Functional_Area_Name).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Consumer_Function_Name).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Consumer_Function_Name).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Product_Function_Name).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Product_Function_Name).toBe('');

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        groupNoPath: ['hfbNo', 'paNo'],
      },
    });

    mockCleanArticlesTableStore.filterOptionsByColumn.HFB = [
      {
        parent_group_no: null,
        group_no: 'hfb',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.PA = [
      {
        parent_group_no: null,
        group_no: 'pa',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Functional_Area_Name = [];
    mockCleanArticlesTableStore.filterOptionsByColumn.Consumer_Function_Name = [];
    mockCleanArticlesTableStore.filterOptionsByColumn.Product_Function_Name = [];

    await wrapper.vm.initChosenGroupNoByGrouping();

    expect(wrapper.vm.chosenGroupNoByGrouping.HFB).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.HFB).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.PA).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.PA).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Functional_Area_Name).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Consumer_Function_Name).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Consumer_Function_Name).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Product_Function_Name).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Product_Function_Name).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.HFB = [
      {
        parent_group_no: null,
        group_no: 'hfbNo',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.PA = [
      {
        parent_group_no: null,
        group_no: 'paNo',
        value: 'foo',
      },
    ];

    await wrapper.vm.initChosenGroupNoByGrouping();

    expect(wrapper.vm.chosenGroupNoByGrouping.HFB).toBe('hfbNo');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.HFB).toBe('hfbNo');
    expect(wrapper.vm.chosenGroupNoByGrouping.PA).toBe('paNo');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.PA).toBe('paNo');
    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Functional_Area_Name).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Consumer_Function_Name).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Consumer_Function_Name).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Product_Function_Name).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Product_Function_Name).toBe('');

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        groupNoPath: ['functionalAreaNo', 'consumerFunctionNo', 'productFunctionNo'],
      },
    });

    mockCleanArticlesTableStore.filterOptionsByColumn.HFB = [];
    mockCleanArticlesTableStore.filterOptionsByColumn.PA = [];
    mockCleanArticlesTableStore.filterOptionsByColumn.Functional_Area_Name = [
      {
        parent_group_no: null,
        group_no: 'functionalArea',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Consumer_Function_Name = [
      {
        parent_group_no: null,
        group_no: 'consumerFunction',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Product_Function_Name = [
      {
        parent_group_no: null,
        group_no: 'productFunction',
        value: 'foo',
      },
    ];

    await wrapper.vm.initChosenGroupNoByGrouping();

    expect(wrapper.vm.chosenGroupNoByGrouping.HFB).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.HFB).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.PA).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.PA).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Functional_Area_Name).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Consumer_Function_Name).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Consumer_Function_Name).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Product_Function_Name).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Product_Function_Name).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.Functional_Area_Name = [
      {
        parent_group_no: null,
        group_no: 'functionalAreaNo',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Consumer_Function_Name = [
      {
        parent_group_no: null,
        group_no: 'consumerFunctionNo',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Product_Function_Name = [
      {
        parent_group_no: null,
        group_no: 'productFunctionNo',
        value: 'foo',
      },
    ];

    await wrapper.vm.initChosenGroupNoByGrouping();

    expect(wrapper.vm.chosenGroupNoByGrouping.HFB).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.HFB).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.PA).toBe('');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.PA).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('functionalAreaNo');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Functional_Area_Name).toBe('functionalAreaNo');
    expect(wrapper.vm.chosenGroupNoByGrouping.Consumer_Function_Name).toBe('consumerFunctionNo');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Consumer_Function_Name).toBe('consumerFunctionNo');
    expect(wrapper.vm.chosenGroupNoByGrouping.Product_Function_Name).toBe('productFunctionNo');
    expect(wrapper.vm.initialChosenGroupNoByGrouping.Product_Function_Name).toBe('productFunctionNo');
  });
});

describe('`selectedOptionValueByFilterType`', () => {
  it('should return selected option value by filter type', () => {
    const mockCleanArticlesTableStore = reactive<CleanArticlesTableStoreState>({
      articles: [],
      articlesLoading: true,
      totalPages: 0,
      totalArticles: 0,
      filterOptionsByColumn: {},
      filterOptionsLoadingByColumn: {},
    });
    const mockChosenGroupNoByGrouping = reactive<CleanArticlesTableChosenGroupNoByGrouping>({});

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CLEAN_ARTICLES_TABLE_STORE_TOKEN]: mockCleanArticlesTableStore,
          [MOCK_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN]: mockChosenGroupNoByGrouping,
        },
      },
    });

    expect(wrapper.vm.selectedOptionValueByFilterType(ArticleColumn.FUNCTIONAL_AREA_NAME)).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.Functional_Area_Name = [
      {
        parent_group_no: null,
        group_no: 'functionalAreaNo',
        value: 'foo',
      },
    ];

    expect(wrapper.vm.selectedOptionValueByFilterType(ArticleColumn.FUNCTIONAL_AREA_NAME)).toBe('');

    mockChosenGroupNoByGrouping.Functional_Area_Name = 'functionalAreaNo';

    expect(wrapper.vm.selectedOptionValueByFilterType(ArticleColumn.FUNCTIONAL_AREA_NAME)).toBe(
      `functionalAreaNo${VIEW_OPTION_SEPARATOR}foo`,
    );
  });
});

describe('`appliedFiltersLengthByFilterType`', () => {
  it('should compute applied filters length by filter type', () => {
    const mockAppliedValuesByFilterType = ref<CleanArticlesTableFiltersValues>({
      Clean_Candidate: ['foo'],
    });

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_APPLIED_VALUES_BY_FILTER_TYPE_TOKEN]: mockAppliedValuesByFilterType,
        },
      },
    });

    expect(wrapper.vm.appliedFiltersLengthByFilterType(ArticleColumn.CCL)).toBe(0);
    expect(wrapper.vm.appliedFiltersLengthByFilterType(ArticleColumn.CLEAN_CANDIDATE)).toBe(1);
  });
});

describe('`isViewFilterType`', () => {
  it('should determine view filter types', () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    expect(wrapper.vm.isViewFilterType(ArticleColumn.CLEAN_CANDIDATE)).toBe(false);
    expect(wrapper.vm.isViewFilterType(ArticleColumn.HFB)).toBe(true);
    expect(wrapper.vm.isViewFilterType(ArticleColumn.PA)).toBe(true);
    expect(wrapper.vm.isViewFilterType(ArticleColumn.FUNCTIONAL_AREA_NAME)).toBe(true);
    expect(wrapper.vm.isViewFilterType(ArticleColumn.CONSUMER_FUNCTION_NAME)).toBe(true);
    expect(wrapper.vm.isViewFilterType(ArticleColumn.PRODUCT_FUNCTION_NAME)).toBe(true);
  });
});

describe('`expansionPanelTitleByFilterType`', () => {
  it('should return expansion panel title by filter type', () => {
    const mockIsViewFilterTypeResult = ref<boolean>(true);
    const mockIsViewFilterType: CleanArticlesTableIsViewFilterType = vi.fn(() => mockIsViewFilterTypeResult.value);
    const mockSelectedOptionValueByFilterTypeResult = ref<string>('');
    const mockSelectedOptionValueByFilterType: CleanArticlesTableSelectedOptionValueByFilterType = vi.fn(
      () => mockSelectedOptionValueByFilterTypeResult.value,
    );
    const mockAppliedFiltersLengthByFilterTypeResult = ref<number>(0);
    const mockAppliedFiltersLengthByFilterType: CleanArticlesTableAppliedFiltersLengthByFilterType = vi.fn(
      () => mockAppliedFiltersLengthByFilterTypeResult.value,
    );

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_IS_VIEW_FILTER_TYPE_TOKEN]: mockIsViewFilterType,
          [MOCK_SELECTED_OPTION_VALUE_BY_FILTER_TYPE_TOKEN]: mockSelectedOptionValueByFilterType,
          [MOCK_APPLIED_FILTERS_LENGTH_BY_KEY_TOKEN]: mockAppliedFiltersLengthByFilterType,
        },
      },
    });

    expect(wrapper.vm.expansionPanelTitleByFilterType(ArticleColumn.CLEAN_CANDIDATE)).toBe(
      `translated formatted ${ArticleColumn.CLEAN_CANDIDATE}`,
    );

    mockSelectedOptionValueByFilterTypeResult.value = 'foo';

    expect(wrapper.vm.expansionPanelTitleByFilterType(ArticleColumn.CLEAN_CANDIDATE)).toBe(
      `translated formatted ${ArticleColumn.CLEAN_CANDIDATE}${VIEW_OPTION_SEPARATOR}foo`,
    );

    mockIsViewFilterTypeResult.value = false;

    expect(wrapper.vm.expansionPanelTitleByFilterType(ArticleColumn.CLEAN_CANDIDATE)).toBe(
      `translated formatted ${ArticleColumn.CLEAN_CANDIDATE}`,
    );

    mockAppliedFiltersLengthByFilterTypeResult.value = 10;

    expect(wrapper.vm.expansionPanelTitleByFilterType(ArticleColumn.CLEAN_CANDIDATE)).toBe(
      `translated formatted ${ArticleColumn.CLEAN_CANDIDATE} (10)`,
    );
  });
});

describe('`onFilterSearch`', () => {
  it('should search among filter values', () => {
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
      },
    });

    wrapper.vm.onFilterSearch(ArticleColumn.CLEAN_CANDIDATE, { value: 'foo' });

    expect(wrapper.vm.searchValueByFilterType.Clean_Candidate).toBe('foo');
  });
});

describe('`onFilterClick`', () => {
  it('should open modal, expand corresponding panel and scroll to it', async () => {
    const mockFiltersModalVisible = ref<boolean>(false);
    const mockTableFilters = ref<CleanArticlesTableFilter[]>([
      {
        filterType: ArticleColumn.CLEAN_CANDIDATE,
        isActive: false,
        label: 'foo',
      },
    ]);
    const mockOnModalOpen: CleanArticlesTableOnModalOpen = vi.fn(() => {
      mockFiltersModalVisible.value = true;
    });
    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
          [MOCK_TABLE_FILTERS_TOKEN]: mockTableFilters,
          [MOCK_ON_MODAL_OPEN_TOKEN]: mockOnModalOpen,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    await wrapper.vm.onFilterClick(ArticleColumn.CLEAN_CANDIDATE);

    expect(mockOnModalOpen).toHaveBeenCalled();

    expect(wrapper.vm.expandedPanels).toEqual([ArticleColumn.CLEAN_CANDIDATE] as CleanArticlesTableFilterType[]);
    expect(wrapper.vm.virtualScrolls.Clean_Candidate!.$el.scrollIntoView).toHaveBeenCalled();
  });
});

describe('`onFilterRemove`', () => {
  it('should properly update query params upon filter removal', async () => {
    const mockIsViewFilterTypeResult = ref<boolean>(true);
    const mockIsViewFilterType: CleanArticlesTableIsViewFilterType = vi.fn(() => mockIsViewFilterTypeResult.value);
    const mockDoNotShowFilterRemoveConfirmationAgain = ref<string>('false');
    const mockOpenFilterRemoveConfirmationResult = ref<ConfirmationModalActions>(ConfirmationModalActions.Cancel);
    const mockOpenFilterRemoveConfirmation = ref<ConfirmationModalOpen>(
      vi.fn(() => Promise.resolve(mockOpenFilterRemoveConfirmationResult.value)),
    );

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_IS_VIEW_FILTER_TYPE_TOKEN]: mockIsViewFilterType,
          [MOCK_DO_NOT_SHOW_FILTER_REMOVE_CONFIRMATION_AGAIN_TOKEN]: mockDoNotShowFilterRemoveConfirmationAgain,
          [MOCK_OPEN_FILTER_REMOVE_CONFIRMATION_TOKEN]: mockOpenFilterRemoveConfirmation,
        },
      },
    });

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableCleanCandidateValues: ['foo', 'bar'],
        tableCCLValues: ['foo', 'bar'],
        tableStyleGroupValues: ['foo', 'bar'],
        tablePriceLevelValues: ['foo', 'bar'],
        tableProductNameValues: ['foo', 'bar'],
        tablePage: 10,
      },
    });

    await wrapper.vm.onFilterRemove(ArticleColumn.CLEAN_CANDIDATE, 'foo');

    expect(mockOpenFilterRemoveConfirmation.value).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(DO_NOT_SHOW_FILTER_REMOVE_CONFIRMATION_AGAIN)).toBe(null);

    mockOpenFilterRemoveConfirmationResult.value = ConfirmationModalActions.Confirm;

    await wrapper.vm.onFilterRemove(ArticleColumn.CLEAN_CANDIDATE, 'foo');

    expect(mockOpenFilterRemoveConfirmation.value).toHaveBeenCalledTimes(2);
    expect(sessionStorage.getItem(DO_NOT_SHOW_FILTER_REMOVE_CONFIRMATION_AGAIN)).toBe('true');

    mockIsViewFilterTypeResult.value = false;
    mockDoNotShowFilterRemoveConfirmationAgain.value = 'true';

    await wrapper.vm.onFilterRemove(ArticleColumn.CLEAN_CANDIDATE, 'foo');

    expect(queryParamsValues.value.tableCleanCandidateValues).toEqual(['bar']);
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tablePage: 10,
      },
    });

    await wrapper.vm.onFilterRemove(ArticleColumn.CCL, 'foo');

    expect(queryParamsValues.value.tableCCLValues).toEqual(['bar']);
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tablePage: 10,
      },
    });

    await wrapper.vm.onFilterRemove(ArticleColumn.STYLE_GROUP, 'foo');

    expect(queryParamsValues.value.tableStyleGroupValues).toEqual(['bar']);
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tablePage: 10,
      },
    });

    await wrapper.vm.onFilterRemove(ArticleColumn.PRICE_LEVEL, 'foo');

    expect(queryParamsValues.value.tablePriceLevelValues).toEqual(['bar']);
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tablePage: 10,
      },
    });

    await wrapper.vm.onFilterRemove(ArticleColumn.PRODUCT_NAME, 'foo');

    expect(queryParamsValues.value.tableProductNameValues).toEqual(['bar']);
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        groupingPath: [Grouping.HFB, Grouping.PA],
        groupNoPath: ['hfbNo', 'paNo'],
        tablePage: 10,
      },
    });

    await wrapper.vm.onFilterRemove(ArticleColumn.HFB, `hfbNo${VIEW_OPTION_SEPARATOR}hfb`);

    expect(queryParamsValues.value.groupingPath).toEqual([Grouping.HFB]);
    expect(queryParamsValues.value.groupNoPath).toBe(null);
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        groupingPath: [Grouping.HFB, Grouping.PA],
        groupNoPath: ['hfbNo', 'paNo'],
        tablePage: 10,
      },
    });

    await wrapper.vm.onFilterRemove(ArticleColumn.PA, `paNo${VIEW_OPTION_SEPARATOR}pa`);

    expect(queryParamsValues.value.groupingPath).toEqual([Grouping.HFB]);
    expect(queryParamsValues.value.groupNoPath).toEqual(['hfbNo']);
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        groupingPath: [Grouping.FUNCTIONAL_AREA, Grouping.CONSUMER_FUNCTION, Grouping.PRODUCT_FUNCTION],
        groupNoPath: ['functionalAreaNo', 'consumerFunctionNo', 'productFunctionNo'],
        tablePage: 10,
      },
    });

    await wrapper.vm.onFilterRemove(
      ArticleColumn.FUNCTIONAL_AREA_NAME,
      `functionalAreaNo${VIEW_OPTION_SEPARATOR}functionalArea`,
    );

    expect(queryParamsValues.value.groupingPath).toEqual([Grouping.FUNCTIONAL_AREA]);
    expect(queryParamsValues.value.groupNoPath).toBe(null);
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        groupingPath: [Grouping.FUNCTIONAL_AREA, Grouping.CONSUMER_FUNCTION, Grouping.PRODUCT_FUNCTION],
        groupNoPath: ['functionalAreaNo', 'consumerFunctionNo', 'productFunctionNo'],
        tablePage: 10,
      },
    });

    await wrapper.vm.onFilterRemove(
      ArticleColumn.CONSUMER_FUNCTION_NAME,
      `consumerFunctionNo${VIEW_OPTION_SEPARATOR}consumerFunction`,
    );

    expect(queryParamsValues.value.groupingPath).toEqual([Grouping.FUNCTIONAL_AREA]);
    expect(queryParamsValues.value.groupNoPath).toEqual(['functionalAreaNo']);
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        groupingPath: [Grouping.FUNCTIONAL_AREA, Grouping.CONSUMER_FUNCTION, Grouping.PRODUCT_FUNCTION],
        groupNoPath: ['functionalAreaNo', 'consumerFunctionNo', 'productFunctionNo'],
        tablePage: 10,
      },
    });

    await wrapper.vm.onFilterRemove(
      ArticleColumn.PRODUCT_FUNCTION_NAME,
      `productFunctionNo${VIEW_OPTION_SEPARATOR}productFunction`,
    );

    expect(queryParamsValues.value.groupingPath).toEqual([Grouping.FUNCTIONAL_AREA, Grouping.CONSUMER_FUNCTION]);
    expect(queryParamsValues.value.groupNoPath).toEqual(['functionalAreaNo', 'consumerFunctionNo']);
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);
  });
});

describe('`onReset`', () => {
  it('should reset filters', async () => {
    const mockDoNotShowFiltersResetConfirmationAgain = ref<string>('false');
    const mockOpenFiltersResetConfirmationResult = ref<ConfirmationModalActions>(ConfirmationModalActions.Cancel);
    const mockOpenFiltersResetConfirmation = ref<ConfirmationModalOpen>(
      vi.fn(() => Promise.resolve(mockOpenFiltersResetConfirmationResult.value)),
    );
    const mockOnModalClose: CleanArticlesTableOnModalClose = vi.fn();
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_DO_NOT_SHOW_FILTERS_RESET_CONFIRMATION_AGAIN_TOKEN]: mockDoNotShowFiltersResetConfirmationAgain,
          [MOCK_OPEN_FILTERS_RESET_CONFIRMATION_TOKEN]: mockOpenFiltersResetConfirmation,
          [MOCK_ON_MODAL_CLOSE_TOKEN]: mockOnModalClose,
        },
      },
    });

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        grouping: Grouping.FUNCTIONAL_AREA,
        groupNoPath: ['functionalAreaNo'],
      },
    });

    await wrapper.vm.onReset();

    expect(mockOpenFiltersResetConfirmation.value).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(DO_NOT_SHOW_FILTERS_RESET_CONFIRMATION_AGAIN)).toBe(null);

    mockOpenFiltersResetConfirmationResult.value = ConfirmationModalActions.Confirm;

    await wrapper.vm.onReset();

    expect(mockOpenFiltersResetConfirmation.value).toHaveBeenCalledTimes(2);
    expect(sessionStorage.getItem(DO_NOT_SHOW_FILTERS_RESET_CONFIRMATION_AGAIN)).toBe('true');
    expect(queryParamsValues.value.groupingPath).toEqual([Grouping.FUNCTIONAL_AREA]);
    expect(mockOnModalClose).toHaveBeenCalled();

    mockDoNotShowFiltersResetConfirmationAgain.value = 'true';

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableCleanCandidateValues: ['tableCleanCandidateValues'],
        tableCCLValues: ['tableCCLValues'],
        tableStyleGroupValues: ['tableStyleGroupValues'],
        tablePriceLevelValues: ['tablePriceLevelValues'],
        tableProductNameValues: ['tableProductNameValues'],
        grouping: Grouping.CONSUMER_FUNCTION,
        groupNoPath: ['consumerFunctionNo'],
      },
    });

    await wrapper.vm.onReset();

    expect(mockOpenFiltersResetConfirmation.value).toHaveBeenCalledTimes(2);
    expect(queryParamsValues.value.tableCleanCandidateValues).toBe(null);
    expect(queryParamsValues.value.tableCCLValues).toBe(null);
    expect(queryParamsValues.value.tableStyleGroupValues).toBe(null);
    expect(queryParamsValues.value.tablePriceLevelValues).toBe(null);
    expect(queryParamsValues.value.tableProductNameValues).toBe(null);
    expect(queryParamsValues.value.groupingPath).toEqual([Grouping.CONSUMER_FUNCTION]);
    expect(queryParamsValues.value.groupNoPath).toEqual(null);
  });
});

describe('`onApply`', () => {
  it('should apply filters in query params', async () => {
    const mockDoNotShowFilterApplyConfirmationAgain = ref<string>('false');
    const mockOpenFiltersResetConfirmationResult = ref<ConfirmationModalActions>(ConfirmationModalActions.Cancel);
    const mockOpenFilterApplyConfirmation = ref<ConfirmationModalOpen>(
      vi.fn(() => Promise.resolve(mockOpenFiltersResetConfirmationResult.value)),
    );
    const mockChosenGroupNoByGrouping = reactive<CleanArticlesTableChosenGroupNoByGrouping>({});
    const mockAppliedValuesByFilterType = ref<CleanArticlesTableFiltersValues>({
      Clean_Candidate: ['foo'],
      CCL: ['foo'],
      Style_Group: ['foo'],
      Price_Level: ['foo'],
      Product_Name: ['foo'],
    });
    const mockOnModalClose: CleanArticlesTableOnModalClose = vi.fn();
    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_DO_NOT_SHOW_FILTER_APPLY_CONFIRMATION_AGAIN_TOKEN]: mockDoNotShowFilterApplyConfirmationAgain,
          [MOCK_OPEN_FILTER_APPLY_CONFIRMATION_TOKEN]: mockOpenFilterApplyConfirmation,
          [MOCK_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN]: mockChosenGroupNoByGrouping,
          [MOCK_APPLIED_VALUES_BY_FILTER_TYPE_TOKEN]: mockAppliedValuesByFilterType,
          [MOCK_ON_MODAL_CLOSE_TOKEN]: mockOnModalClose,
        },
      },
    });

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await wrapper.vm.onApply();

    expect(mockOpenFilterApplyConfirmation.value).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(DO_NOT_SHOW_FILTER_APPLY_CONFIRMATION_AGAIN)).toBe(null);

    mockOpenFiltersResetConfirmationResult.value = ConfirmationModalActions.Confirm;

    await wrapper.vm.onApply();

    expect(mockOpenFilterApplyConfirmation.value).toHaveBeenCalledTimes(2);
    expect(sessionStorage.getItem(DO_NOT_SHOW_FILTER_APPLY_CONFIRMATION_AGAIN)).toBe('true');

    mockDoNotShowFilterApplyConfirmationAgain.value = 'true';

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        grouping: Grouping.HFB,
      },
    });

    mockChosenGroupNoByGrouping.HFB = 'hfbNo';
    mockChosenGroupNoByGrouping.PA = 'paNo';

    await wrapper.vm.onApply();

    expect(queryParamsValues.value.tableCleanCandidateValues).toEqual(['foo']);
    expect(queryParamsValues.value.tableCCLValues).toEqual(['foo']);
    expect(queryParamsValues.value.tableStyleGroupValues).toEqual(['foo']);
    expect(queryParamsValues.value.tablePriceLevelValues).toEqual(['foo']);
    expect(queryParamsValues.value.tableProductNameValues).toEqual(['foo']);
    expect(queryParamsValues.value.groupingPath).toEqual([Grouping.HFB, Grouping.PA]);
    expect(queryParamsValues.value.groupNoPath).toEqual(['hfbNo', 'paNo']);
    expect(queryParamsValues.value.tablePage).toBe(TABLE_DEFAULT_PAGE);
    expect(mockOnModalClose).toHaveBeenCalled();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        grouping: Grouping.FUNCTIONAL_AREA,
      },
    });

    mockChosenGroupNoByGrouping.Functional_Area_Name = 'functionalAreaNo';
    mockChosenGroupNoByGrouping.Consumer_Function_Name = 'consumerFunctionNo';
    mockChosenGroupNoByGrouping.Product_Function_Name = 'productFunctionNo';

    await wrapper.vm.onApply();

    expect(queryParamsValues.value.groupingPath).toEqual([
      Grouping.FUNCTIONAL_AREA,
      Grouping.CONSUMER_FUNCTION,
      Grouping.PRODUCT_FUNCTION,
    ]);
    expect(queryParamsValues.value.groupNoPath).toEqual([
      'functionalAreaNo',
      'consumerFunctionNo',
      'productFunctionNo',
    ]);
  });
});

describe('`watch(() => chosenGroupNoByGrouping[Grouping.HFB]`', () => {
  it('should clear out child selections', async () => {
    const mockChosenGroupNoByGrouping = reactive<CleanArticlesTableChosenGroupNoByGrouping>({
      PA: 'paNo',
    });
    const mockHFBBeingModified = ref<boolean>(true);

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN]: mockChosenGroupNoByGrouping,
          [MOCK_HFB_BEING_MODIFIED_TOKEN]: mockHFBBeingModified,
        },
      },
    });

    mockChosenGroupNoByGrouping.HFB = 'hfbNo 0';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.PA).toBe('paNo');

    mockHFBBeingModified.value = false;
    mockChosenGroupNoByGrouping.HFB = 'hfbNo 1';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.PA).toBe('');
  });
});

describe('`watch(() => chosenGroupNoByGrouping[Grouping.PA]`', () => {
  it('should select parents', async () => {
    const mockChosenGroupNoByGrouping = reactive<CleanArticlesTableChosenGroupNoByGrouping>({});
    const mockPABeingModified = ref<boolean>(true);
    const mockCleanArticlesTableStore = reactive<CleanArticlesTableStoreState>({
      articles: [],
      articlesLoading: true,
      totalPages: 0,
      totalArticles: 0,
      filterOptionsByColumn: {},
      filterOptionsLoadingByColumn: {},
    });

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN]: mockChosenGroupNoByGrouping,
          [MOCK_PA_BEING_MODIFIED_TOKEN]: mockPABeingModified,
          [MOCK_CLEAN_ARTICLES_TABLE_STORE_TOKEN]: mockCleanArticlesTableStore,
        },
      },
    });

    mockChosenGroupNoByGrouping.PA = 'paNo 0';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.HFB).toBe(undefined);

    mockPABeingModified.value = false;

    mockChosenGroupNoByGrouping.PA = 'paNo 1';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.HFB).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.PA = [
      {
        parent_group_no: null,
        group_no: null,
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.PA = 'paNo 2';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.HFB).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.PA = [
      {
        parent_group_no: null,
        group_no: 'paNo 3',
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.PA = 'paNo 3';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.HFB).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.HFB = [
      {
        parent_group_no: null,
        group_no: null,
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.PA = [
      {
        parent_group_no: 'hfbNo',
        group_no: 'paNo 4',
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.PA = 'paNo 4';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.HFB).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.HFB = [
      {
        parent_group_no: null,
        group_no: 'hfbNo',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.PA = [
      {
        parent_group_no: 'hfbNo',
        group_no: 'paNo 5',
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.PA = 'paNo 5';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.HFB).toBe('hfbNo');
  });
});

describe('`watch(() => chosenGroupNoByGrouping[Grouping.FUNCTIONAL_AREA]`', () => {
  it('should clear out child selections', async () => {
    const mockChosenGroupNoByGrouping = reactive<CleanArticlesTableChosenGroupNoByGrouping>({
      Consumer_Function_Name: 'consumerFunctionNo',
      Product_Function_Name: 'productFunctionNo',
    });
    const mockFunctionalAreaBeingModified = ref<boolean>(true);

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN]: mockChosenGroupNoByGrouping,
          [MOCK_FUNCTIONAL_AREA_BEING_MODIFIED_TOKEN]: mockFunctionalAreaBeingModified,
        },
      },
    });

    mockChosenGroupNoByGrouping.Functional_Area_Name = 'functionalAreaNo 0';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Consumer_Function_Name).toBe('consumerFunctionNo');
    expect(wrapper.vm.chosenGroupNoByGrouping.Product_Function_Name).toBe('productFunctionNo');

    mockFunctionalAreaBeingModified.value = false;
    mockChosenGroupNoByGrouping.Functional_Area_Name = 'functionalAreaNo 1';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Consumer_Function_Name).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Product_Function_Name).toBe('');
  });
});

describe('`watch(() => chosenGroupNoByGrouping[Grouping.CONSUMER_FUNCTION]`', () => {
  it('should clear out child selections and select parents', async () => {
    const mockChosenGroupNoByGrouping = reactive<CleanArticlesTableChosenGroupNoByGrouping>({});
    const mockConsumerFunctionBeingModified = ref<boolean>(true);
    const mockCleanArticlesTableStore = reactive<CleanArticlesTableStoreState>({
      articles: [],
      articlesLoading: true,
      totalPages: 0,
      totalArticles: 0,
      filterOptionsByColumn: {},
      filterOptionsLoadingByColumn: {},
    });

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN]: mockChosenGroupNoByGrouping,
          [MOCK_CONSUMER_FUNCTION_BEING_MODIFIED_TOKEN]: mockConsumerFunctionBeingModified,
          [MOCK_CLEAN_ARTICLES_TABLE_STORE_TOKEN]: mockCleanArticlesTableStore,
        },
      },
    });

    mockChosenGroupNoByGrouping.Consumer_Function_Name = 'consumerFunctionNo 0';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Product_Function_Name).toBe(undefined);
    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe(undefined);

    mockConsumerFunctionBeingModified.value = false;

    mockChosenGroupNoByGrouping.Consumer_Function_Name = 'consumerFunctionNo 1';

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Product_Function_Name).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.Consumer_Function_Name = [
      {
        parent_group_no: null,
        group_no: null,
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.Consumer_Function_Name = 'consumerFunctionNo 2';

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.Consumer_Function_Name = [
      {
        parent_group_no: null,
        group_no: 'consumerFunctionNo 3',
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.Consumer_Function_Name = 'consumerFunctionNo 3';

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.Functional_Area_Name = [
      {
        parent_group_no: null,
        group_no: null,
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Consumer_Function_Name = [
      {
        parent_group_no: 'functionalAreaNo',
        group_no: 'consumerFunctionNo 4',
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.Consumer_Function_Name = 'consumerFunctionNo 4';

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.Functional_Area_Name = [
      {
        parent_group_no: null,
        group_no: 'functionalAreaNo',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Consumer_Function_Name = [
      {
        parent_group_no: 'functionalAreaNo',
        group_no: 'consumerFunctionNo 5',
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.Consumer_Function_Name = 'consumerFunctionNo 5';

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('functionalAreaNo');
  });
});

describe('`watch(() => chosenGroupNoByGrouping[Grouping.PRODUCT_FUNCTION]`', () => {
  it('should clear out child selections and select parents', async () => {
    const mockChosenGroupNoByGrouping = reactive<CleanArticlesTableChosenGroupNoByGrouping>({});
    const mockProductFunctionBeingModified = ref<boolean>(true);
    const mockCleanArticlesTableStore = reactive<CleanArticlesTableStoreState>({
      articles: [],
      articlesLoading: true,
      totalPages: 0,
      totalArticles: 0,
      filterOptionsByColumn: {},
      filterOptionsLoadingByColumn: {},
    });

    const wrapper = shallowMount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CHOSEN_GROUP_NO_BY_GROUPING_TOKEN]: mockChosenGroupNoByGrouping,
          [MOCK_PRODUCT_FUNCTION_BEING_MODIFIED_TOKEN]: mockProductFunctionBeingModified,
          [MOCK_CLEAN_ARTICLES_TABLE_STORE_TOKEN]: mockCleanArticlesTableStore,
        },
      },
    });

    mockChosenGroupNoByGrouping.Product_Function_Name = 'productFunctionNo 0';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Consumer_Function_Name).toBe(undefined);
    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe(undefined);

    mockProductFunctionBeingModified.value = false;

    mockChosenGroupNoByGrouping.Product_Function_Name = 'productFunctionNo 1';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Consumer_Function_Name).toBe('');
    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.Product_Function_Name = [
      {
        parent_group_no: null,
        group_no: null,
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.Product_Function_Name = 'productFunctionNo 2';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.Product_Function_Name = [
      {
        parent_group_no: null,
        group_no: 'productFunctionNo 3',
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.Product_Function_Name = 'productFunctionNo 3';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.Consumer_Function_Name = [
      {
        parent_group_no: null,
        group_no: null,
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Product_Function_Name = [
      {
        parent_group_no: 'consumerFunctionNo',
        group_no: 'productFunctionNo 4',
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.Product_Function_Name = 'productFunctionNo 4';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.Consumer_Function_Name = [
      {
        parent_group_no: null,
        group_no: 'consumerFunctionNo',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Product_Function_Name = [
      {
        parent_group_no: 'consumerFunctionNo',
        group_no: 'productFunctionNo 5',
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.Product_Function_Name = 'productFunctionNo 5';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.Functional_Area_Name = [
      {
        parent_group_no: null,
        group_no: null,
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Consumer_Function_Name = [
      {
        parent_group_no: 'functionalAreaNo',
        group_no: 'consumerFunctionNo',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Product_Function_Name = [
      {
        parent_group_no: 'consumerFunctionNo',
        group_no: 'productFunctionNo 6',
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.Product_Function_Name = 'productFunctionNo 6';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('');

    mockCleanArticlesTableStore.filterOptionsByColumn.Functional_Area_Name = [
      {
        parent_group_no: null,
        group_no: 'functionalAreaNo',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Consumer_Function_Name = [
      {
        parent_group_no: 'functionalAreaNo',
        group_no: 'consumerFunctionNo',
        value: 'foo',
      },
    ];
    mockCleanArticlesTableStore.filterOptionsByColumn.Product_Function_Name = [
      {
        parent_group_no: 'consumerFunctionNo',
        group_no: 'productFunctionNo 7',
        value: 'foo',
      },
    ];

    mockChosenGroupNoByGrouping.Product_Function_Name = 'productFunctionNo 7';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chosenGroupNoByGrouping.Functional_Area_Name).toBe('functionalAreaNo');
  });
});

describe('`TableFilters`', () => {
  it('should render with correct props and invoke correct handlers', async () => {
    const mockTableFilters = ref<CleanArticlesTableFilter[]>([
      {
        filterType: ArticleColumn.CLEAN_CANDIDATE,
        isActive: false,
        label: 'foo',
      },
      {
        filterType: ArticleColumn.CCL,
        isActive: false,
        label: '',
      },
    ]);
    const mockAppliedFilters = ref<CleanArticlesTableFiltersValues>({
      Clean_Candidate: ['foo'],
    });
    const mockFormatAppliedFilterLabel: CleanArticlesTableFormatAppliedFilterLabel = () =>
      'formatted applied filter label';

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_TABLE_FILTERS_TOKEN]: mockTableFilters,
          [MOCK_APPLIED_FILTERS_TOKEN]: mockAppliedFilters,
          [MOCK_FORMAT_APPLIED_FILTER_LABEL_TOKEN]: mockFormatAppliedFilterLabel,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const tableFiltersComponent = wrapper.findComponent(TableFilters);

    expect(tableFiltersComponent.exists()).toBe(true);

    const props = tableFiltersComponent.props();

    expect(props.filters).toEqual([
      {
        filterType: ArticleColumn.CLEAN_CANDIDATE,
        isActive: false,
        label: 'translated foo',
      },
      {
        filterType: ArticleColumn.CCL,
        isActive: false,
        label: '',
      },
    ]);
    expect(props.appliedFiltersValues).toEqual({
      Clean_Candidate: ['foo'],
    });
    expect(props.formatAppliedFilterLabel).toBe(mockFormatAppliedFilterLabel);

    const onFilterClickSpy = vi.spyOn(wrapper.vm, 'onFilterClick');

    tableFiltersComponent.vm.$emit('filterClick', { key: ArticleColumn.CLEAN_CANDIDATE });

    expect(onFilterClickSpy).toHaveBeenCalledWith(ArticleColumn.CLEAN_CANDIDATE);

    const { queryParamsValues, setQueryParamsValues } = useQueryParamsValues();

    await setQueryParamsValues({
      queryParams: {
        ...JSON.parse(JSON.stringify(queryParamsValues.value)),
        tableCleanCandidateValues: ['foo', 'bar'],
      },
    });

    const onFilterRemoveSpy = vi.spyOn(wrapper.vm, 'onFilterRemove');

    tableFiltersComponent.vm.$emit('filterRemove', { key: ArticleColumn.CLEAN_CANDIDATE, value: 'foo' });

    expect(onFilterRemoveSpy).toHaveBeenCalledWith(ArticleColumn.CLEAN_CANDIDATE, 'foo');
  });
});

describe('`CleanArticlesTable__search`', () => {
  it('should render with correct props and invoke correct handlers', () => {
    const mockTableSearchScope = ref<Record<string, string>>({
      foo: 'bar',
    });
    const mockInitialSearchValue = ref<string>('foo');
    const mockInitialSearchColumn = ref<ArticleColumn>(ArticleColumn.CLEAN_CANDIDATE);

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_TABLE_SEARCH_SCOPE_TOKEN]: mockTableSearchScope,
          [MOCK_INITIAL_SEARCH_VALUE_TOKEN]: mockInitialSearchValue,
          [MOCK_INITIAL_SEARCH_COLUMN_TOKEN]: mockInitialSearchColumn,
        },
      },
    });

    const searchInputComponent = wrapper.findComponent(SearchInput);

    expect(searchInputComponent.exists()).toBe(true);

    const props = searchInputComponent.props();

    expect(props.scope).toEqual({
      'translated foo': 'bar',
    });
    expect(props.initialSearchValue).toBe('foo');
    expect(props.initialSearchColumn).toBe(ArticleColumn.CLEAN_CANDIDATE);

    const onSearchSpy = vi.spyOn(wrapper.vm, 'onSearch');

    searchInputComponent.vm.$emit('search', { scope: 'bar', value: 'foo' });

    expect(onSearchSpy).toHaveBeenCalledWith({ scope: 'bar', value: 'foo' });
  });
});

describe('`Table`', () => {
  it('should render with correct props and invoke correct handlers', () => {
    const mockCleanArticlesTableStore = reactive<CleanArticlesTableStoreState>({
      articles: [MOCK_TABLE_ARTICLE],
      articlesLoading: true,
      totalPages: 100,
      totalArticles: 1000,
      filterOptionsByColumn: {},
      filterOptionsLoadingByColumn: {},
    });
    const mockTableColumns = ref<TableColumn[]>([
      {
        key: ArticleColumn.CLEAN_CANDIDATE,
        title: ArticleColumn.CLEAN_CANDIDATE,
        value: ArticleColumn.CLEAN_CANDIDATE,
      },
    ]);
    const mockMappedArticles = ref<MappedTableArticle[]>([MOCK_MAPPED_TABLE_ARTICLE]);
    const mockCurrentPage = ref<number>(10);
    const mockInitialItemsPerPage = ref<number>(100);
    const mockInitialOrderBy = ref<ArticleColumn>(ArticleColumn.CLEAN_CANDIDATE);
    const mockInitialDesc = ref<boolean>(true);

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CLEAN_ARTICLES_TABLE_STORE_TOKEN]: mockCleanArticlesTableStore,
          [MOCK_TABLE_COLUMNS_TOKEN]: mockTableColumns,
          [MOCK_MAPPED_ARTICLES_TOKEN]: mockMappedArticles,
          [MOCK_CURRENT_PAGE_TOKEN]: mockCurrentPage,
          [MOCK_INITIAL_ITEMS_PER_PAGE_TOKEN]: mockInitialItemsPerPage,
          [MOCK_INITIAL_ORDER_BY_TOKEN]: mockInitialOrderBy,
          [MOCK_INITIAL_DESC_TOKEN]: mockInitialDesc,
        },
      },
    });

    const tableComponent = wrapper.findComponent(Table);

    expect(tableComponent.exists()).toBe(true);

    const props = tableComponent.props();

    expect(props.loading).toBe(true);
    expect(props.columns).toEqual([
      {
        key: ArticleColumn.CLEAN_CANDIDATE,
        title: `translated ${ArticleColumn.CLEAN_CANDIDATE}`,
        value: ArticleColumn.CLEAN_CANDIDATE,
      } as TableColumn,
    ]);
    expect(props.items).toEqual([MOCK_MAPPED_TABLE_ARTICLE]);
    expect(props.totalItems).toBe(1000);
    expect(props.totalPages).toBe(100);
    expect(props.currentPage).toBe(10);
    expect(props.initialItemsPerPage).toBe(100);
    expect(props.initialOrderBy).toBe(ArticleColumn.CLEAN_CANDIDATE);
    expect(props.initialDesc).toBe(true);

    const onPageChangeSpy = vi.spyOn(wrapper.vm, 'onPageChange');

    tableComponent.vm.$emit('pageChange', 20);

    expect(onPageChangeSpy).toHaveBeenCalledWith(20);

    const onItemsPerPageChangeSpy = vi.spyOn(wrapper.vm, 'onItemsPerPageChange');

    tableComponent.vm.$emit('itemsPerPageChange', 200);

    expect(onItemsPerPageChangeSpy).toHaveBeenCalledWith(200);

    const onSortChangeSpy = vi.spyOn(wrapper.vm, 'onSortChange');

    tableComponent.vm.$emit('sortChange', { key: ArticleColumn.AVAILABILITY, order: SortOrder.ASC } as Sort);

    expect(onSortChangeSpy).toHaveBeenCalledWith({ key: ArticleColumn.AVAILABILITY, order: SortOrder.ASC } as Sort);
  });
});

describe('`Modal`', () => {
  it('should render with correct props', () => {
    const mockFiltersModalVisible = ref<boolean>(true);
    const mockOnModalClose: CleanArticlesTableOnModalClose = () => {};

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
          [MOCK_ON_MODAL_CLOSE_TOKEN]: mockOnModalClose,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const modalComponent = wrapper.findComponent(Modal);

    expect(modalComponent.exists()).toBe(true);

    const props = modalComponent.props();

    expect(props.visible).toBe(true);
    expect(props.handleCloseBtn).toBe(mockOnModalClose);
  });
});

describe('`Sheets`', () => {
  it('should render with correct props', () => {
    const mockFiltersModalVisible = ref<boolean>(true);
    const mockOnModalClose: CleanArticlesTableOnModalClose = () => {};

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
          [MOCK_ON_MODAL_CLOSE_TOKEN]: mockOnModalClose,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const sheetsComponent = wrapper.findComponent(Sheets);

    expect(sheetsComponent.exists()).toBe(true);

    const props = sheetsComponent.props();

    expect(props.ariaLabel).toBe('translated components.cleanArticlesTable.tableFilters');
    expect(props.closeBtnClick).toBe(mockOnModalClose);
  });
});

describe('`ModalHeader`', () => {
  it('should render with correct props', () => {
    const mockFiltersModalVisible = ref<boolean>(true);
    const mockOnModalClose: CleanArticlesTableOnModalClose = () => {};

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
          [MOCK_ON_MODAL_CLOSE_TOKEN]: mockOnModalClose,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const modalHeaderComponent = wrapper.findComponent(ModalHeader);

    expect(modalHeaderComponent.exists()).toBe(true);

    const props = modalHeaderComponent.props();

    expect(props.title).toBe('translated components.cleanArticlesTable.tableFilters');
    expect(props.ariaCloseTxt).toBe('translated components.cleanArticlesTable.close');
    expect(props.closeBtnClick).toBe(mockOnModalClose);
  });
});

describe('`ModalBody`', () => {
  it('should render with correct props', () => {
    const mockFiltersModalVisible = ref<boolean>(true);

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const modalBodyComponent = wrapper.findComponent(ModalBody);

    expect(modalBodyComponent.exists()).toBe(true);
  });
});

describe('`v-expansion-panels`', () => {
  it('should render with correct props', async () => {
    const mockFiltersModalVisible = ref<boolean>(true);
    const mockExpandedPanels = ref<CleanArticlesTableFilterType[]>([ArticleColumn.CLEAN_CANDIDATE]);

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
          [MOCK_EXPANDED_PANELS_TOKEN]: mockExpandedPanels,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const vExpansionPanelsComponent = wrapper.findComponent(VExpansionPanels);

    expect(vExpansionPanelsComponent.exists()).toBe(true);

    expect(vExpansionPanelsComponent.vm.modelValue).toEqual([ArticleColumn.CLEAN_CANDIDATE]);
    expect(vExpansionPanelsComponent.vm.multiple).toBe(true);

    vExpansionPanelsComponent.vm.$emit('update:modelValue', []);

    await vExpansionPanelsComponent.vm.$nextTick();

    expect(wrapper.vm.expandedPanels).toEqual([]);
  });
});

describe('`v-expansion-panel`', () => {
  it('should render with correct props', () => {
    const mockFiltersModalVisible = ref<boolean>(true);
    const mockTableFilters = ref<CleanArticlesTableFilter[]>([
      {
        filterType: ArticleColumn.CLEAN_CANDIDATE,
        label: 'foo',
        isActive: false,
      },
      {
        filterType: ArticleColumn.CCL,
        label: 'foo',
        isActive: false,
      },
    ]);

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
          [MOCK_TABLE_FILTERS_TOKEN]: mockTableFilters,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const vExpansionPanelComponents = wrapper.findAllComponents(VExpansionPanel);

    expect(vExpansionPanelComponents.length).toBe(2);
    expect(vExpansionPanelComponents[0].vm.value).toBe(ArticleColumn.CLEAN_CANDIDATE);
    expect(vExpansionPanelComponents[1].vm.value).toBe(ArticleColumn.CCL);
  });
});

describe('`v-expansion-panel-text`', () => {
  it('should render with correct props', async () => {
    const mockFiltersModalVisible = ref<boolean>(true);
    const mockTableFilters = ref<CleanArticlesTableFilter[]>([
      {
        filterType: ArticleColumn.CLEAN_CANDIDATE,
        label: 'foo',
        isActive: false,
      },
    ]);

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
          [MOCK_TABLE_FILTERS_TOKEN]: mockTableFilters,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const vExpansionPanelTextComponent = wrapper.findComponent(VExpansionPanelText);

    expect(vExpansionPanelTextComponent.exists()).toBe(true);
  });
});

describe('`CleanArticlesTable__${filterType}__search`', () => {
  it('should render with correct props and invoke correct handlers', async () => {
    const mockFiltersModalVisible = ref<boolean>(true);
    const mockTableFilters = ref<CleanArticlesTableFilter[]>([
      {
        filterType: ArticleColumn.CLEAN_CANDIDATE,
        label: 'foo',
        isActive: false,
      },
      {
        filterType: ArticleColumn.CCL,
        label: 'foo',
        isActive: false,
      },
    ]);
    const mockExpandedPanels = ref<CleanArticlesTableFilterType[]>([ArticleColumn.CLEAN_CANDIDATE]);
    const mockSearchableFilterTypes = ref<CleanArticlesTableFilterType[]>([ArticleColumn.CLEAN_CANDIDATE]);

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
          [MOCK_TABLE_FILTERS_TOKEN]: mockTableFilters,
          [MOCK_EXPANDED_PANELS_TOKEN]: mockExpandedPanels,
          [MOCK_SEARCHABLE_FILTER_TYPES_TOKEN]: mockSearchableFilterTypes,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const searchInputComponents = wrapper.findAllComponents(SearchInput);

    const cleanCandidateSearchInputComponent = searchInputComponents.find(
      (searchInput) => searchInput.vm.id === `CleanArticlesTable__${ArticleColumn.CLEAN_CANDIDATE}__search`,
    );

    expect(cleanCandidateSearchInputComponent!.exists()).toBe(true);
    expect(cleanCandidateSearchInputComponent!.vm.placeholder).toBe(
      `translated components.cleanArticlesTable.searchFor ${JSON.stringify({
        filterType: `translated formatted ${ArticleColumn.CLEAN_CANDIDATE}`,
      })}`,
    );

    const onFilterSearchSpy = vi.spyOn(wrapper.vm, 'onFilterSearch');

    cleanCandidateSearchInputComponent!.vm.$emit('search', {
      scope: ArticleColumn.CLEAN_CANDIDATE,
      value: 'foo',
    } as SearchResult);

    expect(onFilterSearchSpy).toHaveBeenCalledWith(ArticleColumn.CLEAN_CANDIDATE, {
      scope: ArticleColumn.CLEAN_CANDIDATE,
      value: 'foo',
    } as SearchResult);

    const cclSearchInputComponent = searchInputComponents.find(
      (searchInput) => searchInput.element.id === `CleanArticlesTable__${ArticleColumn.CCL}__search`,
    );

    expect(cclSearchInputComponent?.exists()).toBeFalsy();
  });
});

describe('`v-virtual-scroll`', () => {
  it('should render with correct props', async () => {
    const mockFiltersModalVisible = ref<boolean>(true);
    const mockTableFilters = ref<CleanArticlesTableFilter[]>([
      {
        filterType: ArticleColumn.CLEAN_CANDIDATE,
        label: 'foo',
        isActive: false,
      },
    ]);
    const mockExpandedPanels = ref<CleanArticlesTableFilterType[]>([ArticleColumn.CLEAN_CANDIDATE]);
    const mockVirtualScrolls = ref<CleanArticlesTableVirtualScrollElementRefByFilterType>({});
    const mockFilteredFiltersValues = ref<FilterOptionsByColumn>({
      Clean_Candidate: [
        {
          parent_group_no: null,
          group_no: null,
          value: 'foo',
        },
      ],
    });

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
          [MOCK_TABLE_FILTERS_TOKEN]: mockTableFilters,
          [MOCK_EXPANDED_PANELS_TOKEN]: mockExpandedPanels,
          [MOCK_VIRTUAL_SCROLLS_TOKEN]: mockVirtualScrolls,
          [MOCK_MAX_HEIGHT_REM_TOKEN]: 4,
          [MOCK_MAX_VIRTUAL_SCROLL_HEIGHT_PX_TOKEN]: 600,
          [MOCK_FILTERED_FILTERS_VALUES_TOKEN]: mockFilteredFiltersValues,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const virtualScrollComponent = wrapper.findComponent(VVirtualScroll);

    expect(virtualScrollComponent.exists()).toBe(true);

    expect(virtualScrollComponent.vm.maxHeight).toBe('4rem');

    expect((virtualScrollComponent.vm as unknown as { items: Option[] }).items).toEqual([
      {
        parent_group_no: null,
        group_no: null,
        value: 'foo',
      } as Option,
    ]);

    expect(wrapper.vm.virtualScrolls.Clean_Candidate!.$el).toEqual(virtualScrollComponent.element);

    Object.defineProperty(wrapper.vm.virtualScrolls.Clean_Candidate!.$el, 'scrollHeight', {
      configurable: true,
      get: function () {
        return this._scrollHeightValue;
      },
      set: function (value) {
        this._scrollHeightValue = value;
      },
    });

    mockExpandedPanels.value = [];

    await wrapper.vm.$nextTick();

    (wrapper.vm.virtualScrolls.Clean_Candidate!.$el as HTMLElement & { scrollHeight: number }).scrollHeight = 1000;

    mockExpandedPanels.value = [ArticleColumn.CLEAN_CANDIDATE];

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.virtualScrolls.Clean_Candidate!.$el.classList.contains('with-scroll')).toBe(true);

    mockExpandedPanels.value = [];

    await wrapper.vm.$nextTick();

    (wrapper.vm.virtualScrolls.Clean_Candidate!.$el as HTMLElement & { scrollHeight: number }).scrollHeight = 400;

    mockExpandedPanels.value = [ArticleColumn.CLEAN_CANDIDATE];

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.virtualScrolls.Clean_Candidate!.$el.classList.contains('with-scroll')).toBe(false);
  });
});

describe('`ModalFooter`', () => {
  it('should render with reset and apply buttons', () => {
    const mockFiltersModalVisible = ref<boolean>(true);

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const modalFooterComponent = wrapper.findComponent(ModalFooter);

    expect(modalFooterComponent.exists()).toBe(true);

    const resetButton = wrapper.find('[data-testId="CleanArticlesTable__reset-button"]');
    const applyButton = wrapper.find('[data-testId="CleanArticlesTable__apply-button"]');

    expect(resetButton.exists()).toBe(true);
    expect(applyButton.exists()).toBe(true);
  });
});

describe('`CleanArticlesTable__reset-button`', () => {
  it('should render with correct props and invoke correct handlers', () => {
    const mockFiltersModalVisible = ref<boolean>(true);
    const mockAppliedFiltersExist = ref<boolean>(true);

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
          [MOCK_APPLIED_FILTERS_EXIST_TOKEN]: mockAppliedFiltersExist,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const modalFooterComponent = wrapper.findComponent(ModalFooter);
    const buttonComponents = modalFooterComponent.findAllComponents(Button);

    const resetButtonComponent = buttonComponents[0];

    expect(resetButtonComponent.text()).toBe('translated components.cleanArticlesTable.resetButton');

    const props = resetButtonComponent.props();

    expect(props.disabled).toBe(false);

    const onResetSpy = vi.spyOn(wrapper.vm, 'onReset');

    resetButtonComponent.trigger('click');

    expect(onResetSpy).toHaveBeenCalled();
  });
});

describe('`CleanArticlesTable__apply-button`', () => {
  it('should render with correct props and invoke correct handlers', async () => {
    const mockFiltersModalVisible = ref<boolean>(true);
    const appliedValuesByFilterTypeDirty = ref<boolean>(false);
    const chosenGroupNoByGroupingDirty = ref<boolean>(false);

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_FILTERS_MODAL_VISIBLE_TOKEN]: mockFiltersModalVisible,
          [MOCK_APPLIED_VALUES_BY_FILTER_TYPE_DIRTY_TOKEN]: appliedValuesByFilterTypeDirty,
          [MOCK_CHOSEN_GROUP_NO_BY_GROUPING_DIRTY_TOKEN]: chosenGroupNoByGroupingDirty,
        },
        stubs: {
          ModalHeader: true,
        },
      },
    });

    const modalFooterComponent = wrapper.findComponent(ModalFooter);
    const buttonComponents = modalFooterComponent.findAllComponents(Button);

    const applyButtonComponent = buttonComponents[1];

    expect(applyButtonComponent.text()).toBe('translated components.cleanArticlesTable.applyButton');

    const props = applyButtonComponent.props();

    expect(props.disabled).toBe(true);

    appliedValuesByFilterTypeDirty.value = true;

    await wrapper.vm.$nextTick();

    expect(props.disabled).toBe(false);

    appliedValuesByFilterTypeDirty.value = false;
    chosenGroupNoByGroupingDirty.value = true;

    await wrapper.vm.$nextTick();

    expect(props.disabled).toBe(false);

    appliedValuesByFilterTypeDirty.value = true;
    chosenGroupNoByGroupingDirty.value = true;

    await wrapper.vm.$nextTick();

    expect(props.disabled).toBe(false);

    const onApplySpy = vi.spyOn(wrapper.vm, 'onApply');

    applyButtonComponent.trigger('click');

    expect(onApplySpy).toHaveBeenCalled();
  });
});

describe('`CleanArticlesTable__filter-remove-confirmation`', () => {
  it('should render with correct props and invoke correct handlers', async () => {
    const mockConfirmationModalIsOpen = ref<boolean>(false);
    const mockOpenFilterRemoveConfirmation = ref<ConfirmationModalOpen>(
      vi.fn(() => {
        mockConfirmationModalIsOpen.value = true;
        return Promise.resolve(ConfirmationModalActions.Confirm);
      }),
    );
    const mockConfirmationModalConfig = ref<ConfirmationModalConfiguration>({
      isOpen: mockConfirmationModalIsOpen.value,
      open: mockOpenFilterRemoveConfirmation.value,
      action: vi.fn(() => (mockConfirmationModalIsOpen.value = false)),
      close: vi.fn(() => (mockConfirmationModalIsOpen.value = false)),
    });

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CONFIRMATION_MODAL_CONFIG_TOKEN]: mockConfirmationModalConfig,
          [MOCK_OPEN_FILTER_REMOVE_CONFIRMATION_TOKEN]: mockOpenFilterRemoveConfirmation,
        },
      },
    });

    const confirmationModals = wrapper.findAllComponents(ConfirmationModal);

    const filterRemoveConfirmation = confirmationModals.find(
      (confirmationModal) =>
        confirmationModal.element.getAttribute('data-testId') === 'CleanArticlesTable__filter-remove-confirmation',
    );

    expect(filterRemoveConfirmation!.exists()).toBe(true);

    expect(filterRemoveConfirmation!.vm.title).toBe(
      'translated components.cleanArticlesTable.filterRemoveConfirmation.title',
    );
    expect(filterRemoveConfirmation!.vm.accessibilityLabel).toBe(
      'translated components.cleanArticlesTable.filterRemoveConfirmation.title',
    );
    expect(filterRemoveConfirmation!.vm.primaryBtnText).toBe(
      'translated components.cleanArticlesTable.filterRemoveConfirmation.confirm',
    );
    expect(filterRemoveConfirmation!.vm.secondaryBtnText).toBe(
      'translated components.cleanArticlesTable.filterRemoveConfirmation.cancel',
    );

    await mockOpenFilterRemoveConfirmation!.value!();

    expect(mockConfirmationModalIsOpen.value).toBe(true);
  });
});

describe('`CleanArticlesTable__filters-remove-confirmation__message`', () => {
  it('should render with correct props and invoke correct handlers', async () => {
    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        stubs: {
          ConfirmationModal: {
            template: '<slot></slot>',
            inheritAttrs: false,
          },
        },
      },
    });

    const filterRemoveConfirmationMessage = wrapper.find(
      '[data-testId="CleanArticlesTable__filter-remove-confirmation__message"]',
    );

    expect(filterRemoveConfirmationMessage.exists()).toBe(true);

    expect(filterRemoveConfirmationMessage.text()).toBe(
      'translated components.cleanArticlesTable.filterRemoveConfirmation.message',
    );
  });
});

describe('`CleanArticlesTable__filter-remove-confirmation__checkbox`', () => {
  it('should render with correct props and invoke correct handlers', async () => {
    const mockDoNotShowFilterRemoveConfirmationAgain = ref<string>('false');

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_DO_NOT_SHOW_FILTER_REMOVE_CONFIRMATION_AGAIN_TOKEN]: mockDoNotShowFilterRemoveConfirmationAgain,
        },
        stubs: {
          ConfirmationModal: {
            template: '<slot></slot>',
            inheritAttrs: false,
          },
        },
      },
    });

    const checkboxes = wrapper.findAllComponents(Checkbox);

    const filterRemoveConfirmationCheckbox = checkboxes.find(
      (checkbox) => checkbox.vm.id === 'CleanArticlesTable__filter-remove-confirmation__checkbox',
    );

    expect(filterRemoveConfirmationCheckbox!.exists()).toBe(true);

    expect(filterRemoveConfirmationCheckbox!.vm.modelValue).toEqual('false');

    filterRemoveConfirmationCheckbox!.vm.$emit('update:modelValue', 'true');

    expect(wrapper.vm.doNotShowFiltersResetConfirmationAgain).toEqual('true');

    expect(filterRemoveConfirmationCheckbox!.vm.value).toEqual('true');

    expect(filterRemoveConfirmationCheckbox!.text()).toBe(
      'translated components.cleanArticlesTable.filterRemoveConfirmation.doNotShowAgain',
    );
  });
});

describe('`CleanArticlesTable__filter-apply-confirmation`', () => {
  it('should render with correct props and invoke correct handlers', async () => {
    const mockConfirmationModalIsOpen = ref<boolean>(false);
    const mockOpenFilterApplyConfirmation = ref<ConfirmationModalOpen>(
      vi.fn(() => {
        mockConfirmationModalIsOpen.value = true;
        return Promise.resolve(ConfirmationModalActions.Confirm);
      }),
    );
    const mockConfirmationModalConfig = ref<ConfirmationModalConfiguration>({
      isOpen: mockConfirmationModalIsOpen.value,
      open: mockOpenFilterApplyConfirmation.value,
      action: vi.fn(() => (mockConfirmationModalIsOpen.value = false)),
      close: vi.fn(() => (mockConfirmationModalIsOpen.value = false)),
    });

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CONFIRMATION_MODAL_CONFIG_TOKEN]: mockConfirmationModalConfig,
          [MOCK_OPEN_FILTER_APPLY_CONFIRMATION_TOKEN]: mockOpenFilterApplyConfirmation,
        },
      },
    });

    const confirmationModals = wrapper.findAllComponents(ConfirmationModal);

    const filterApplyConfirmation = confirmationModals.find(
      (confirmationModal) =>
        confirmationModal.element.getAttribute('data-testId') === 'CleanArticlesTable__filter-apply-confirmation',
    );

    expect(filterApplyConfirmation!.exists()).toBe(true);

    expect(filterApplyConfirmation!.vm.title).toBe(
      'translated components.cleanArticlesTable.filterApplyConfirmation.title',
    );
    expect(filterApplyConfirmation!.vm.accessibilityLabel).toBe(
      'translated components.cleanArticlesTable.filterApplyConfirmation.title',
    );
    expect(filterApplyConfirmation!.vm.primaryBtnText).toBe(
      'translated components.cleanArticlesTable.filterApplyConfirmation.confirm',
    );
    expect(filterApplyConfirmation!.vm.secondaryBtnText).toBe(
      'translated components.cleanArticlesTable.filterApplyConfirmation.cancel',
    );

    await mockOpenFilterApplyConfirmation!.value!();

    expect(mockConfirmationModalIsOpen.value).toBe(true);
  });
});

describe('`CleanArticlesTable__filters-apply-confirmation__message`', () => {
  it('should render with correct props and invoke correct handlers', async () => {
    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        stubs: {
          ConfirmationModal: {
            template: '<slot></slot>',
            inheritAttrs: false,
          },
        },
      },
    });

    const filterApplyConfirmationMessage = wrapper.find(
      '[data-testId="CleanArticlesTable__filter-apply-confirmation__message"]',
    );

    expect(filterApplyConfirmationMessage.exists()).toBe(true);

    expect(filterApplyConfirmationMessage.text()).toBe(
      'translated components.cleanArticlesTable.filterApplyConfirmation.message',
    );
  });
});

describe('`CleanArticlesTable__filter-apply-confirmation__checkbox`', () => {
  it('should render with correct props and invoke correct handlers', async () => {
    const mockDoNotShowFilterApplyConfirmationAgain = ref<string>('false');

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_DO_NOT_SHOW_FILTER_APPLY_CONFIRMATION_AGAIN_TOKEN]: mockDoNotShowFilterApplyConfirmationAgain,
        },
        stubs: {
          ConfirmationModal: {
            template: '<slot></slot>',
            inheritAttrs: false,
          },
        },
      },
    });

    const checkboxes = wrapper.findAllComponents(Checkbox);

    const filterApplyConfirmationCheckbox = checkboxes.find(
      (checkbox) => checkbox.vm.id === 'CleanArticlesTable__filter-apply-confirmation__checkbox',
    );

    expect(filterApplyConfirmationCheckbox!.exists()).toBe(true);

    expect(filterApplyConfirmationCheckbox!.vm.modelValue).toEqual('false');

    filterApplyConfirmationCheckbox!.vm.$emit('update:modelValue', 'true');

    expect(wrapper.vm.doNotShowFiltersResetConfirmationAgain).toEqual('true');

    expect(filterApplyConfirmationCheckbox!.vm.value).toEqual('true');

    expect(filterApplyConfirmationCheckbox!.text()).toBe(
      'translated components.cleanArticlesTable.filterApplyConfirmation.doNotShowAgain',
    );
  });
});

describe('`CleanArticlesTable__filters-reset-confirmation`', () => {
  it('should render with correct props and invoke correct handlers', async () => {
    const mockConfirmationModalIsOpen = ref<boolean>(false);
    const mockOpenFiltersResetConfirmation = ref<ConfirmationModalOpen>(
      vi.fn(() => {
        mockConfirmationModalIsOpen.value = true;
        return Promise.resolve(ConfirmationModalActions.Confirm);
      }),
    );
    const mockConfirmationModalConfig = ref<ConfirmationModalConfiguration>({
      isOpen: mockConfirmationModalIsOpen.value,
      open: mockOpenFiltersResetConfirmation.value,
      action: vi.fn(() => (mockConfirmationModalIsOpen.value = false)),
      close: vi.fn(() => (mockConfirmationModalIsOpen.value = false)),
    });

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_CONFIRMATION_MODAL_CONFIG_TOKEN]: mockConfirmationModalConfig,
          [MOCK_OPEN_FILTERS_RESET_CONFIRMATION_TOKEN]: mockOpenFiltersResetConfirmation,
        },
      },
    });

    const confirmationModals = wrapper.findAllComponents(ConfirmationModal);

    const filtersResetConfirmation = confirmationModals.find(
      (confirmationModal) =>
        confirmationModal.element.getAttribute('data-testId') === 'CleanArticlesTable__filters-reset-confirmation',
    );

    expect(filtersResetConfirmation!.exists()).toBe(true);

    expect(filtersResetConfirmation!.vm.title).toBe(
      'translated components.cleanArticlesTable.filtersResetConfirmation.title',
    );
    expect(filtersResetConfirmation!.vm.accessibilityLabel).toBe(
      'translated components.cleanArticlesTable.filtersResetConfirmation.title',
    );
    expect(filtersResetConfirmation!.vm.primaryBtnText).toBe(
      'translated components.cleanArticlesTable.filtersResetConfirmation.confirm',
    );
    expect(filtersResetConfirmation!.vm.secondaryBtnText).toBe(
      'translated components.cleanArticlesTable.filtersResetConfirmation.cancel',
    );

    await mockOpenFiltersResetConfirmation!.value!();

    expect(mockConfirmationModalIsOpen.value).toBe(true);
  });
});

describe('`CleanArticlesTable__filters-reset-confirmation__message`', () => {
  it('should render with correct props and invoke correct handlers', async () => {
    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        stubs: {
          ConfirmationModal: {
            template: '<slot></slot>',
            inheritAttrs: false,
          },
        },
      },
    });

    const filtersResetConfirmationMessage = wrapper.find(
      '[data-testId="CleanArticlesTable__filters-reset-confirmation__message"]',
    );

    expect(filtersResetConfirmationMessage.exists()).toBe(true);

    expect(filtersResetConfirmationMessage.text()).toBe(
      'translated components.cleanArticlesTable.filtersResetConfirmation.message',
    );
  });
});

describe('`CleanArticlesTable__filters-reset-confirmation__checkbox`', () => {
  it('should render with correct props and invoke correct handlers', async () => {
    const mockDoNotShowFiltersResetConfirmationAgain = ref<string>('false');

    const wrapper = mount(CleanArticlesTable, {
      global: {
        components: {
          CleanArticlesTable,
        },
        plugins: [vuetify],
        provide: {
          [MOCK_DO_NOT_SHOW_FILTERS_RESET_CONFIRMATION_AGAIN_TOKEN]: mockDoNotShowFiltersResetConfirmationAgain,
        },
        stubs: {
          ConfirmationModal: {
            template: '<slot></slot>',
            inheritAttrs: false,
          },
        },
      },
    });

    const checkboxes = wrapper.findAllComponents(Checkbox);

    const filtersResetConfirmationCheckbox = checkboxes.find(
      (checkbox) => checkbox.vm.id === 'CleanArticlesTable__filters-reset-confirmation__checkbox',
    );

    expect(filtersResetConfirmationCheckbox!.exists()).toBe(true);

    expect(filtersResetConfirmationCheckbox!.vm.modelValue).toEqual('false');

    filtersResetConfirmationCheckbox!.vm.$emit('update:modelValue', 'true');

    expect(wrapper.vm.doNotShowFiltersResetConfirmationAgain).toEqual('true');

    expect(filtersResetConfirmationCheckbox!.vm.value).toEqual('true');

    expect(filtersResetConfirmationCheckbox!.text()).toBe(
      'translated components.cleanArticlesTable.filtersResetConfirmation.doNotShowAgain',
    );
  });
});
