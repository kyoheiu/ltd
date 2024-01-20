export interface Item {
  id: string;
  value: string;
  todo: boolean;
  dot: number;
  showModal: boolean;
}

export interface ItemsWithModifiedTime {
  items: Item[];
  modified: number;
}

