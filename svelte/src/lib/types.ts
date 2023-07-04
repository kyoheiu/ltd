  export enum State {
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
