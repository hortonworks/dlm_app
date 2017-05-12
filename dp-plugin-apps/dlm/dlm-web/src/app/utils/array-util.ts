export const flatten = (list) => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
export const unique = (list) => list.filter((item, index, arr) => arr.indexOf(item) === index);
export const sum = (list) => list.reduce((acc, item) => acc + item, 0);

export const filterCollection = (collection, filters) => {
  const fields = Object.keys(filters);
  return collection.filter(row => {
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const filterValue = filters[field];
      const value = row[field];
      if (Array.isArray(filterValue)) {
        if (filterValue.length && filterValue.indexOf(value) === -1) {
          return false;
        }
      } else {
        if (filterValue && filterValue !== value) {
          return false;
        }
      }
    }
    return true;
  });
};

export const groupByKey = (collection, keyName) => {
  const group = {};
  collection.forEach(item => {
    const value = item[keyName];
    if (group[value] == null) {
      group[value] = [item];
    } else {
      group[value].push(item);
    }
  });
  return group;
};
