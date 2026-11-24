import { addDays, format } from 'date-fns'
import type { Batch, Product } from '@/types/inventory'

// Demo seed data only. Dates are relative to "today" so the demo always shows
// fresh, expiring and expired batches. Never used when VITE_USE_MOCK=false.

const d = (n: number) => format(addDays(new Date(), n), 'yyyy-MM-dd')

const created = (n: number) => format(addDays(new Date(), n), "yyyy-MM-dd'T'HH:mm:ss")

export const seedProducts: Product[] = [
  { id: 'p1', name: 'Fresh Milk 1L', sku: 'DAI-MILK-1L', barcode: '8964000101011', category: 'Dairy', description: 'Pasteurised full-cream milk, 1 litre carton.', unit: 'pcs', minStock: 24, imageUrl: '', createdAt: created(-120) },
  { id: 'p2', name: 'Cheddar Cheese', sku: 'DAI-CHED-500', barcode: '8964000101028', category: 'Dairy', description: 'Aged cheddar block, 500g.', unit: 'kg', minStock: 5, imageUrl: '', createdAt: created(-110) },
  { id: 'p3', name: 'Greek Yogurt', sku: 'DAI-YOG-200', barcode: '8964000101035', category: 'Dairy', description: 'Thick Greek yogurt, 200g cup.', unit: 'pcs', minStock: 30, imageUrl: '', createdAt: created(-95) },
  { id: 'p4', name: 'Chicken Breast', sku: 'MEA-CHK-BRST', barcode: '8964000101042', category: 'Meat', description: 'Fresh boneless chicken breast, cleaned.', unit: 'kg', minStock: 10, imageUrl: '', createdAt: created(-80) },
  { id: 'p5', name: 'Bread Loaf', sku: 'BAK-BRD-STD', barcode: '8964000101059', category: 'Bakery', description: 'Standard white sandwich loaf, 600g.', unit: 'pcs', minStock: 15, imageUrl: '', createdAt: created(-70) },
  { id: 'p6', name: 'Orange Juice 1L', sku: 'BEV-OJ-1L', barcode: '8964000101066', category: 'Beverages', description: 'No-added-sugar orange juice, 1 litre.', unit: 'pcs', minStock: 20, imageUrl: '', createdAt: created(-60) },
  { id: 'p7', name: 'Cooking Oil 1L', sku: 'PAN-OIL-1L', barcode: '8964000101073', category: 'Pantry', description: 'Refined sunflower cooking oil, 1 litre bottle.', unit: 'pcs', minStock: 12, imageUrl: '', createdAt: created(-55) },
  { id: 'p8', name: 'Butter 200g', sku: 'DAI-BTR-200', barcode: '8964000101080', category: 'Dairy', description: 'Salted butter block, 200g.', unit: 'pcs', minStock: 10, imageUrl: '', createdAt: created(-50) },
  { id: 'p9', name: 'Eggs (dozen)', sku: 'DAI-EGG-DZN', barcode: '8964000101097', category: 'Dairy', description: 'Farm eggs, pack of 12.', unit: 'pack', minStock: 8, imageUrl: '', createdAt: created(-45) },
  { id: 'p10', name: 'Canned Beans', sku: 'PAN-BEAN-400', barcode: '8964000101103', category: 'Pantry', description: 'Pre-cooked beans in brine, 400g can.', unit: 'pcs', minStock: 40, imageUrl: '', createdAt: created(-40) },
  { id: 'p11', name: 'Frozen Peas 500g', sku: 'FRZ-PEA-500', barcode: '8964000101110', category: 'Frozen', description: 'Individually quick-frozen green peas, 500g.', unit: 'pcs', minStock: 16, imageUrl: '', createdAt: created(-35) },
  { id: 'p12', name: 'Fresh Cream 250ml', sku: 'DAI-CRM-250', barcode: '8964000101127', category: 'Dairy', description: 'Whipping cream, 250ml carton.', unit: 'pcs', minStock: 12, imageUrl: '', createdAt: created(-30) },
]

export const seedBatches: Batch[] = [
  { id: 'b1', productId: 'p1', batchNo: 'B-1042', manufacturingDate: d(-20), expiryDate: d(-1), purchaseQuantity: 120, availableQuantity: 60, supplierName: 'DairyFresh Ltd', supplierContact: 'sales@dairyfresh.example', purchasePrice: 220, branch: 'Main Branch', receivedAt: created(-18) },
  { id: 'b2', productId: 'p1', batchNo: 'B-1077', manufacturingDate: d(-3), expiryDate: d(11), purchaseQuantity: 90, availableQuantity: 84, supplierName: 'DairyFresh Ltd', supplierContact: 'sales@dairyfresh.example', purchasePrice: 220, branch: 'Main Branch', receivedAt: created(-2) },
  { id: 'b3', productId: 'p2', batchNo: 'B-0911', manufacturingDate: d(-45), expiryDate: d(-3), purchaseQuantity: 30, availableQuantity: 12, supplierName: 'CheeseCraft Co', supplierContact: 'orders@cheesecraft.example', purchasePrice: 1800, branch: 'Main Branch', receivedAt: created(-40) },
  { id: 'b4', productId: 'p2', batchNo: 'B-1105', manufacturingDate: d(-10), expiryDate: d(40), purchaseQuantity: 25, availableQuantity: 25, supplierName: 'CheeseCraft Co', supplierContact: 'orders@cheesecraft.example', purchasePrice: 1850, branch: 'Main Branch', receivedAt: created(-9) },
  { id: 'b5', productId: 'p3', batchNo: 'B-0987', manufacturingDate: d(-8), expiryDate: d(0), purchaseQuantity: 60, availableQuantity: 35, supplierName: 'DairyFresh Ltd', supplierContact: 'sales@dairyfresh.example', purchasePrice: 180, branch: 'Main Branch', receivedAt: created(-7) },
  { id: 'b6', productId: 'p3', batchNo: 'B-1140', manufacturingDate: d(-1), expiryDate: d(6), purchaseQuantity: 80, availableQuantity: 72, supplierName: 'DairyFresh Ltd', supplierContact: 'sales@dairyfresh.example', purchasePrice: 180, branch: 'Main Branch', receivedAt: created(-1) },
  { id: 'b7', productId: 'p4', batchNo: 'B-1120', manufacturingDate: d(-2), expiryDate: d(1), purchaseQuantity: 40, availableQuantity: 18, supplierName: 'Prime Meats', supplierContact: 'dispatch@primemeats.example', purchasePrice: 650, branch: 'Main Branch', receivedAt: created(-2) },
  { id: 'b8', productId: 'p4', batchNo: 'B-1155', manufacturingDate: d(-1), expiryDate: d(4), purchaseQuantity: 35, availableQuantity: 35, supplierName: 'Prime Meats', supplierContact: 'dispatch@primemeats.example', purchasePrice: 650, branch: 'Main Branch', receivedAt: created(-1) },
  { id: 'b9', productId: 'p5', batchNo: 'B-1150', manufacturingDate: d(-1), expiryDate: d(4), purchaseQuantity: 60, availableQuantity: 40, supplierName: 'Sunrise Bakery', supplierContact: 'hello@sunrisebakery.example', purchasePrice: 120, branch: 'Main Branch', receivedAt: created(-1) },
  { id: 'b10', productId: 'p5', batchNo: 'B-1162', manufacturingDate: d(0), expiryDate: d(5), purchaseQuantity: 50, availableQuantity: 50, supplierName: 'Sunrise Bakery', supplierContact: 'hello@sunrisebakery.example', purchasePrice: 120, branch: 'Main Branch', receivedAt: created(0) },
  { id: 'b11', productId: 'p6', batchNo: 'B-1103', manufacturingDate: d(-12), expiryDate: d(9), purchaseQuantity: 120, availableQuantity: 90, supplierName: 'JuiceWorks', supplierContact: 'supply@juiceworks.example', purchasePrice: 250, branch: 'Main Branch', receivedAt: created(-11) },
  { id: 'b12', productId: 'p7', batchNo: 'B-0990', manufacturingDate: d(-60), expiryDate: d(14), purchaseQuantity: 150, availableQuantity: 120, supplierName: 'AgroOils', supplierContact: 'trade@agrooils.example', purchasePrice: 520, branch: 'Main Branch', receivedAt: created(-55) },
  { id: 'b13', productId: 'p8', batchNo: 'B-1075', manufacturingDate: d(-15), expiryDate: d(6), purchaseQuantity: 70, availableQuantity: 50, supplierName: 'DairyFresh Ltd', supplierContact: 'sales@dairyfresh.example', purchasePrice: 480, branch: 'Main Branch', receivedAt: created(-14) },
  { id: 'b14', productId: 'p9', batchNo: 'B-1160', manufacturingDate: d(-5), expiryDate: d(16), purchaseQuantity: 90, availableQuantity: 70, supplierName: 'FarmLine', supplierContact: 'orders@farmline.example', purchasePrice: 380, branch: 'Main Branch', receivedAt: created(-4) },
  { id: 'b15', productId: 'p10', batchNo: 'B-0650', manufacturingDate: d(-200), expiryDate: d(120), purchaseQuantity: 250, availableQuantity: 220, supplierName: 'CanTech Foods', supplierContact: 'sales@cantechfoods.example', purchasePrice: 140, branch: 'Main Branch', receivedAt: created(-180) },
  { id: 'b16', productId: 'p11', batchNo: 'B-0720', manufacturingDate: d(-90), expiryDate: d(70), purchaseQuantity: 180, availableQuantity: 150, supplierName: 'FrostGate', supplierContact: 'info@frostgate.example', purchasePrice: 320, branch: 'Main Branch', receivedAt: created(-85) },
  { id: 'b17', productId: 'p12', batchNo: 'B-1133', manufacturingDate: d(-4), expiryDate: d(2), purchaseQuantity: 48, availableQuantity: 24, supplierName: 'DairyFresh Ltd', supplierContact: 'sales@dairyfresh.example', purchasePrice: 300, branch: 'Main Branch', receivedAt: created(-3) },
  { id: 'b18', productId: 'p12', batchNo: 'B-1171', manufacturingDate: d(-1), expiryDate: d(8), purchaseQuantity: 60, availableQuantity: 0, supplierName: 'DairyFresh Ltd', supplierContact: 'sales@dairyfresh.example', purchasePrice: 300, branch: 'Main Branch', receivedAt: created(-1) },
]

export const seedCategories: string[] = [...new Set(seedProducts.map(p => p.category))].sort()
