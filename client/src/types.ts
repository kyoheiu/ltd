export type Item = {
  id: string;
  value: string;
  todo: boolean;
  dot: number;
  showModal: boolean;
}

export type ItemsWithModifiedTime = {
  items: Item[];
  modified: number;
}

export enum Category {
  All,
  Default,
  Green,
  Yellow,
  Red,
  Archived,
}

export enum Dot {
  Default,
  Green,
  Yellow,
  Red,
}