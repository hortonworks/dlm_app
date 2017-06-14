export const capitalize = (str: string) => str ? str[0].toUpperCase() + str.slice(1).toLowerCase() : '';
export const simpleSearch = (str: string, search: string): boolean => {
  let reg: RegExp;
  try {
    reg = new RegExp(search);
  } catch (e) {
    reg = new RegExp('');
  }
  return reg.test(str);
};
