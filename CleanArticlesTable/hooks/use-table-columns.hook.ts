import type { TableColumn } from '@/components/Table/Table.types';
import type { ArticleColumn } from '@/types/article-column.enum';
import { computed } from 'vue';
import { formatArticleKey } from '../CleanArticlesTable.utils';

export const useTableColumns = (
  getter: () => {
    tableColumnsKeys: ArticleColumn[];
  },
) =>
  computed<TableColumn[]>(() => {
    const { tableColumnsKeys } = getter();

    return tableColumnsKeys.map((key) => {
      const tableColumn: TableColumn = {
        key,
        title: formatArticleKey(key),
        value: key,
      };

      return tableColumn;
    });
  });
