import fetch from "node-fetch-commonjs";
export function makeApiRequest(url: URL, additionalParams?: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
        let response: any = await fetch(url.toString() + (additionalParams ? "?" + additionalParams : ""), { headers: { "X-MAL-CLIENT-ID": process.env.MAL_CLIENT_ID! } });
        let data: any = await response.json();
        // TODO: Make better reject message!
        if (!response.ok || !data) reject(`Something went wrong dude :/\nURL: ${url}\nresponse: ${response}`);
        resolve(data);
    });
}

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}