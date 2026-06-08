import { Category } from './category.model';
import { InventoryItemType } from './enums';

export interface InventoryItem {
  id?: number;
  name: string;
  price: number;
  category: Category;
  comment?: string;
  brand: string;
  type: InventoryItemType;
}
