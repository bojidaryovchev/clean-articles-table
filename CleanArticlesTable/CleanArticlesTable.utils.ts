import { ArticleColumn } from '@/types/article-column.enum';

export const formatArticleKey = (articleKey: ArticleColumn) => {
  switch (articleKey) {
    case ArticleColumn.ITEM_NUMBER:
      return 'components.cleanArticlesTable.itemNumber';

    case ArticleColumn.ITEM_NAME:
      return 'components.cleanArticlesTable.itemName';

    case ArticleColumn.ITEM_NAME_INTERNATIONAL:
      return '';

    case ArticleColumn.AVAILABILITY:
      return 'components.cleanArticlesTable.availability';

    case ArticleColumn.RU_SSD:
      return 'components.cleanArticlesTable.ruSsd';

    case ArticleColumn.RU_SED:
      return 'components.cleanArticlesTable.ruSed';

    case ArticleColumn.CCL:
      return 'components.cleanArticlesTable.ccl';

    case ArticleColumn.TOTAL_REVENUE:
      return 'components.cleanArticlesTable.totalRevenue';

    case ArticleColumn.TOTAL_QUANTITY:
      return 'components.cleanArticlesTable.totalQuantity';

    case ArticleColumn.TOTAL_DISTINCT_PURCHASES:
      return 'components.cleanArticlesTable.totalDistinctPurchases';

    case ArticleColumn.PROB_OF_BUYING:
      return 'components.cleanArticlesTable.probOfBuying';

    case ArticleColumn.HFB:
      return 'components.cleanArticlesTable.hfb';

    case ArticleColumn.HFB_NO:
      return '';

    case ArticleColumn.PA:
      return 'components.cleanArticlesTable.pa';

    case ArticleColumn.PA_NO:
      return '';

    case ArticleColumn.STYLE_GROUP:
      return 'components.cleanArticlesTable.styleGroup';

    case ArticleColumn.PRICE_LEVEL:
      return 'components.cleanArticlesTable.priceLevel';

    case ArticleColumn.REVENUE_PER_RECEIPT:
      return 'components.cleanArticlesTable.revenuePerReceipt';

    case ArticleColumn.QUANTITY_PER_RECEIPT:
      return 'components.cleanArticlesTable.quantityPerReceipt';

    case ArticleColumn.QUANTITY_GROWTH_RATE:
      return 'components.cleanArticlesTable.quantityGrowthRate';

    case ArticleColumn.AVG_RATING:
      return 'components.cleanArticlesTable.avgRating';

    case ArticleColumn.PRODUCT_NAME:
      return 'components.cleanArticlesTable.productName';

    case ArticleColumn.PRODUCT_NAME_INTERNATIONAL:
      return '';

    case ArticleColumn.FUNCTIONAL_AREA_NAME:
      return 'components.cleanArticlesTable.functionalAreaName';

    case ArticleColumn.FUNCTIONAL_AREA_NAME_NO:
      return '';

    case ArticleColumn.CONSUMER_FUNCTION_NAME:
      return 'components.cleanArticlesTable.consumerFunctionName';

    case ArticleColumn.CONSUMER_FUNCTION_NAME_NO:
      return '';

    case ArticleColumn.PRODUCT_FUNCTION_NAME:
      return 'components.cleanArticlesTable.productFunctionName';

    case ArticleColumn.PRODUCT_FUNCTION_NAME_NO:
      return '';

    case ArticleColumn.HFA_FURNITURE:
      return 'components.cleanArticlesTable.hfaFurniture';

    case ArticleColumn.RETAIL_UNIT_CODE:
      return 'components.cleanArticlesTable.retailUnitCode';

    case ArticleColumn.CURRENCY_CODE:
      return 'components.cleanArticlesTable.currencyCode';

    case ArticleColumn.CLEAN_CANDIDATE:
      return 'components.cleanArticlesTable.cleanCandidate';
  }
};

export const normalize = (value: string) =>
  value
    // Normalize the string
    .normalize('NFD')
    // Remove diacritics
    .replace(/[\u0300-\u036f]/g, '');
