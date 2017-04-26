export interface BaseState<T> {
  entities: { [id: string]: T};
}
