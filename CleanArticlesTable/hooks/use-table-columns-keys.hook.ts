import { ArticleColumn } from '@/types/article-column.enum';
import { Grouping } from '@/types/grouping.enum';
import type { FrozenQueryParamsValues } from '@/types/query-params-values.interface';
import { computed } from 'vue';

export const useTableColumnsKeys = (
  getter: () => {
    queryParamsValues: FrozenQueryParamsValues;
  },
) =>
  computed<ArticleColumn[]>(() => {
    const {
      queryParamsValues: { grouping },
    } = getter();

    const columns: ArticleColumn[] = [
      ArticleColumn.ITEM_NUMBER,
      ArticleColumn.ITEM_NAME,
      ArticleColumn.RETAIL_UNIT_CODE,
      ArticleColumn.CURRENCY_CODE,
      ArticleColumn.CLEAN_CANDIDATE,
      ArticleColumn.AVAILABILITY,
      ArticleColumn.RU_SSD,
      ArticleColumn.RU_SED,
      ArticleColumn.CCL,
      ArticleColumn.TOTAL_REVENUE,
      ArticleColumn.TOTAL_QUANTITY,
      ArticleColumn.TOTAL_DISTINCT_PURCHASES,
      ArticleColumn.PROB_OF_BUYING,
      ArticleColumn.REVENUE_PER_RECEIPT,
      ArticleColumn.QUANTITY_PER_RECEIPT,
      ArticleColumn.QUANTITY_GROWTH_RATE,
      ArticleColumn.AVG_RATING,
      ArticleColumn.PRODUCT_NAME,
      ArticleColumn.HFA_FURNITURE,
      ArticleColumn.PRICE_LEVEL,
      ArticleColumn.STYLE_GROUP,
    ];

    let groupSpecificColumns: ArticleColumn[] = [];

    switch (grouping) {
      case Grouping.HFB:
        groupSpecificColumns = [ArticleColumn.HFB, ArticleColumn.PA];
        break;

      case Grouping.FUNCTIONAL_AREA:
        groupSpecificColumns = [
          ArticleColumn.FUNCTIONAL_AREA_NAME,
          ArticleColumn.CONSUMER_FUNCTION_NAME,
          ArticleColumn.PRODUCT_FUNCTION_NAME,
        ];
        break;

      default:
        break;
    }

    return [...columns, ...groupSpecificColumns];
  });
