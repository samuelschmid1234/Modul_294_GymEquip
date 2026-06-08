export enum Status {
  BROKEN = 'BROKEN',
  IN_REPARATION = 'IN_REPARATION',
  IN_USE = 'IN_USE',
  LOST = 'LOST',
  IN_STORAGE = 'IN_STORAGE',
  DISPOSED = 'DISPOSED',
}

export enum InventoryItemType {
  MACHINE = 'MACHINE',
  ACCESSORY_SET = 'ACCESSORY_SET',
}

export const STATUS_LABELS: Record<Status, string> = {
  [Status.IN_USE]: 'In Betrieb',
  [Status.BROKEN]: 'Defekt',
  [Status.IN_REPARATION]: 'In Reparatur',
  [Status.IN_STORAGE]: 'Im Lager',
  [Status.LOST]: 'Verloren',
  [Status.DISPOSED]: 'Entsorgt',
};
