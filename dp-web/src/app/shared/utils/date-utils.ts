import * as moment from 'moment';

export class DateUtils {

  public static toReadableDate(since: number) {
    if (!since || since === 0) {
      return 'NA';
    }
    return moment.duration(since).humanize();
  }

  public static formatDate(timeInMillisecs, format) {
    return moment(timeInMillisecs).format(format);
  }

  public static compare(first, second) {
    let currentTime = moment.now();
    return moment(currentTime + first).isBefore(currentTime + second);
  }

}
