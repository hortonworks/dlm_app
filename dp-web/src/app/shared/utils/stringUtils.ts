export class StringUtils {
    public static trunc(str: string, n: number) {
        return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
    };

    public static cleanupUri(url: string): string{
        // http://stackoverflow.com/a/26434126/640012
        //  create an anchor element (note: no need to append this element to the document)
        if(!url || url.length === 0){
            return "";
        }
        let link = document.createElement('a');
        //  set href to any path
        link.setAttribute('href', url);

        const cleanedUri = `${link.protocol || 'http:'}//${link.hostname}:${link.port || '80'}`;
        // cleanup for garbage collection
        // prevent leaks
        link = null;
        return cleanedUri;
    }
}
