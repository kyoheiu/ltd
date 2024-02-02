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

export enum Category {
  All,
  Default,
  Spade,
  Heart,
  Club,
  Diamond,
}

export enum Suit {
  Spade,
  Heart,
  Club,
  Diamond,
}