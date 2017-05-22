import { IMyDate } from 'mydatepicker';

export const getDatePickerDate = (date: Date): IMyDate => {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
};
