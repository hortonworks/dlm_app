export class MathUtils {
    public static bytesToSize(bytes: number): string {
        let sizes: string[] = ['KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) {
            return 'n/a';
        }
        let i = parseInt( '' + Math.floor(Math.log(bytes) / Math.log(1024))  );
        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    }

    public static dateToHumanReadableForm(milliSeconds: number): string {
        let cd: number = 24 * 60 * 60 * 1000;
        let ch: number = 60 * 60 * 1000;
        let d: number = Math.floor(milliSeconds / cd);
        let h: any = '0' + Math.floor( (milliSeconds - d * cd) / ch);
        let m: any = '0' + Math.round( (milliSeconds - d * cd - h * ch) / 60000);
        return [d, h.substr(-2), m.substr(-2)].join(':');
    }
}