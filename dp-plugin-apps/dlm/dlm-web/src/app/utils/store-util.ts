export const mapToList = (entities) => Object.keys(entities).map(id => entities[id]);
export const toEntities = <T>(collection, id = 'id'): {[id: string]: T} => collection.reduce(
  (entities: {[id: string]: T}, entity: T) => Object.assign({}, entities, {
    [entity[id]]: entity
  }), {}
);
