
'use client';

import type { Article, Dictionary, SiteConfig, User } from '@/types';
import { getColumns } from './Columns';
import { DataTable } from './DataTable';
import { useAuth } from '@/context/AuthContext';

type ContentClientProps = {
  articles: Article[];
  dict: Dictionary;
  siteConfig?: SiteConfig | null;
};

export function ContentClient({ articles, dict, siteConfig }: ContentClientProps) {
  const { user } = useAuth();
  const columns = getColumns({ dict, siteConfig, user });

  return (
    <DataTable columns={columns} data={articles} searchPlaceholder={`${dict.content.table.title}...`} />
  );
}
