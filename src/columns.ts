import type { ColDef } from 'ag-grid-community'
import type { ProductRow } from './data/sampleData'

export const columnDefs: ColDef<ProductRow>[] = [
  { field: 'product', headerName: '製品名', flex: 1 },
  { field: 'sales', headerName: '売上', flex: 1 },
  { field: 'stock', headerName: '在庫', flex: 1 },
]
