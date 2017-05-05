export const flatten = (list) => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
export const unique = (list) => list.filter((item, index, arr) => arr.indexOf(item) === index);
export const sum = (list) => list.reduce((acc, item) => acc + item, 0);
