import type { MappedTableArticle } from '@/types/mapped-table-article.interface';
import type { TableArticle } from '@/types/table-article.interface';
import { formatNumber } from '@/utils/common.utils';
import { computed } from 'vue';

export const useMappedArticles = (
  getter: () => {
    articles: TableArticle[];
  },
) =>
  computed<MappedTableArticle[]>(() => {
    const { articles } = getter();

    return articles.map((article) => ({
      ...article,
      HFB: `${article.hfb_no} - ${article.HFB}`,
      PA: `${article.pa_no} - ${article.PA}`,
      Functional_Area_Name: `${article.functional_area_name_no} - ${article.Functional_Area_Name}`,
      Consumer_Function_Name: `${article.consumer_function_name_no} - ${article.Consumer_Function_Name}`,
      Product_Function_Name: `${article.product_function_name_no} - ${article.Product_Function_Name}`,
      Availability:
        article.Availability !== null ? formatNumber({ number: article.Availability, style: 'percent' }) : '',
      Total_Revenue: article.Total_Revenue !== null ? formatNumber({ number: article.Total_Revenue }) : '',
      Total_Quantity: article.Total_Quantity !== null ? formatNumber({ number: article.Total_Quantity }) : '',
      Total_Distinct_Purchases:
        article.Total_Distinct_Purchases !== null ? formatNumber({ number: article.Total_Distinct_Purchases }) : '',
      Avg_rating: article.Avg_rating !== null ? formatNumber({ number: article.Avg_rating }) : '',
      Prob_of_buying:
        article.Prob_of_buying !== null
          ? formatNumber({ number: article.Prob_of_buying, style: 'percent', maxDigits: 12 })
          : '',
      Revenue_per_receipt:
        article.Revenue_per_receipt !== null
          ? formatNumber({ number: article.Revenue_per_receipt, maxDigits: 12 })
          : '',
      Quantity_Growth_Rate:
        article.Quantity_Growth_Rate !== null
          ? formatNumber({ number: article.Quantity_Growth_Rate, maxDigits: 12 })
          : '',
      Quantity_per_receipt:
        article.Quantity_per_receipt !== null
          ? formatNumber({ number: article.Quantity_per_receipt, maxDigits: 12 })
          : '',
    }));
  });
