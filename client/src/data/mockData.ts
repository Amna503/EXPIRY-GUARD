import { addDays, format } from 'date-fns'

const d = (n: number) => format(addDays(new Date(), n), 'yyyy-MM-dd')

export type Batch = {
  id: string
  product: string
  batchNo: string
  branch: string
  qty: number
  unit: string
  expiry: string
  cost: number
}

export const batches: Batch[] = [
  { id: '1', product: 'Cheddar Cheese', batchNo: 'B-0911', branch: 'Main Branch', qty: 12, unit: 'kg', expiry: d(-3), cost: 1800 },
  { id: '2', product: 'Fresh Milk 1L', batchNo: 'B-1042', branch: 'Main Branch', qty: 60, unit: 'pcs', expiry: d(-1), cost: 220 },
  { id: '3', product: 'Greek Yogurt', batchNo: 'B-0987', branch: 'Main Branch', qty: 35, unit: 'pcs', expiry: d(0), cost: 180 },
  { id: '4', product: 'Chicken Breast', batchNo: 'B-1120', branch: 'Main Branch', qty: 18, unit: 'kg', expiry: d(1), cost: 650 },
  { id: '5', product: 'Fresh Cream', batchNo: 'B-1133', branch: 'Main Branch', qty: 24, unit: 'pcs', expiry: d(2), cost: 300 },
  { id: '6', product: 'Bread Loaf', batchNo: 'B-1150', branch: 'Main Branch', qty: 40, unit: 'pcs', expiry: d(4), cost: 120 },
  { id: '7', product: 'Butter 200g', batchNo: 'B-1075', branch: 'Main Branch', qty: 50, unit: 'pcs', expiry: d(6), cost: 480 },
  { id: '8', product: 'Orange Juice', batchNo: 'B-1103', branch: 'Main Branch', qty: 90, unit: 'pcs', expiry: d(9), cost: 250 },
  { id: '9', product: 'Cooking Oil 1L', batchNo: 'B-0990', branch: 'Main Branch', qty: 120, unit: 'pcs', expiry: d(14), cost: 520 },
  { id: '10', product: 'Eggs (dozen)', batchNo: 'B-1160', branch: 'Main Branch', qty: 70, unit: 'pcs', expiry: d(21), cost: 380 },
  { id: '11', product: 'Tea 500g', batchNo: 'B-0870', branch: 'Main Branch', qty: 200, unit: 'pcs', expiry: d(28), cost: 450 },
  { id: '12', product: 'Biscuits Pack', batchNo: 'B-1010', branch: 'Main Branch', qty: 300, unit: 'pcs', expiry: d(45), cost: 60 },
  { id: '13', product: 'Rice 5kg', batchNo: 'B-0720', branch: 'Main Branch', qty: 150, unit: 'pcs', expiry: d(70), cost: 1500 },
  { id: '14', product: 'Canned Beans', batchNo: 'B-0650', branch: 'Main Branch', qty: 220, unit: 'pcs', expiry: d(120), cost: 140 },
]
