'use client';

import type { Article, Dictionary } from '@/types';
import { getColumns } from './Columns';
import { DataTable } from './DataTable';

type ContentClientProps = {
  articles: Article[];
  dict: Dictionary['content'];
};

export function ContentClient({ articles, dict }: ContentClientProps) {
  const columns = getColumns({ dict });

  return (
    <DataTable columns={columns} data={articles} searchPlaceholder={`${dict.table.title}...`} />
  );
}
