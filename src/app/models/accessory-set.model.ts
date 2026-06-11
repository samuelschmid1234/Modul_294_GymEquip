import { InventoryItem } from './inventory-item.model';
import { Accessory } from './accessory.model';

export interface AccessorySet extends InventoryItem {
  purchaseDate: string;
  accessoryList: Accessory[];
}
