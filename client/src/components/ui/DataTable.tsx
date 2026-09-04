import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No results found.',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-brand-border bg-white shadow-level-1">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-brand-surface border-b border-brand-border text-[11px] font-bold text-slate-500 uppercase tracking-widest h-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-2 font-medium whitespace-nowrap", {
                    'text-left': !col.align || col.align === 'left',
                    'text-right': col.align === 'right',
                    'text-center': col.align === 'center',
                  })}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-subSurface">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-32 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn("h-12 bg-white transition-colors", {
                    'cursor-pointer hover:bg-brand-surface': !!onRowClick,
                  })}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-2 text-[14px] text-brand-navy font-medium", {
                        'text-left': !col.align || col.align === 'left',
                        'text-right': col.align === 'right',
                        'text-center': col.align === 'center',
                      })}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
