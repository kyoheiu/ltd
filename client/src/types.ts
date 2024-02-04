export type Item = {
  id: string;
  value: string;
  todo: boolean;
  suit: number;
  showModal: boolean;
}

export type ItemsWithModifiedTime = {
  items: Item[];
  modified: number;
}

export type ModifiedTime = {
  modified: number;
}

export enum Category {
  All,
  Spade,
  Heart,
  Club,
  Diamond,
  Archived
}

export enum Suit {
  Spade,
  Heart,
  Club,
  Diamond,
}