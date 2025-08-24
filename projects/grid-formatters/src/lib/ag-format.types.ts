import { ICellRendererParams } from 'ag-grid-community';

export interface BaseFormatParams<TData = any>
  extends ICellRendererParams<TData, any> {
  /** One override key to rule them all (preferred) */
  fmt?: string;

  /** Legacy/aliases (optional to support old columns) */
  dateFormat?: string;
  dateFmt?: string;
  timeFormat?: string;
  timeFmt?: string;

  /** Timezone override */
  timezone?: string | null;
  tz?: string;
}

export type FormatKind = 'date' | 'time' | 'datetime';
