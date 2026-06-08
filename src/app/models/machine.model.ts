import { InventoryItem } from './inventory-item.model';
import { Status } from './enums';

export interface Machine extends InventoryItem {
  serialNumber: string;
  lastRestoration?: string;
  nextRestoration?: string;
  status: Status;
}
