export const SYMBOL_SIZE = 18;

export enum Page {
  All,
  Default,
  Green,
  Yellow,
  Red,
  Archived,
  NotLoggedIn,
}

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
