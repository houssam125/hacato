export interface AdminSocketMessage<T> {
  type: string;
  data: T;
}

export interface Lead {
  [key: string]: string | number | boolean | null;
}
