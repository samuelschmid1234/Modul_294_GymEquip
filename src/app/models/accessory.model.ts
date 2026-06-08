import { AccessoryType } from './accessory-type.model';
import { Status } from './enums';

export interface Accessory {
  id?: number;
  accessoryType: AccessoryType;
  weight: number;
  count: number;
  status: Status;
}
