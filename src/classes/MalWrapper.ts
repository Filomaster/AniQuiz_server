import * as dotenv from "dotenv";
import fetch from "node-fetch-commonjs";
import FiLogger, { colors, logLvl } from './FiLogger';

const log = FiLogger.getInstance();

// TODO: Move interfaces to other files/dir

/**
 * Interface for the object returned from ranking endpoint of MAL api
 */
interface IRankingResponse {
    data: Array<IRankingObject>;
}
interface IRankingObject {
    node: {
        id: number,
        title: string,
        main_picture: {
            medium: string,
            large: string;
        };
    },
    ranking: {
        rank: number;
    };
}

export default class MalWrapper {
    private readonly baseUrl: URL = new URL("https://api.myanimelist.net/v2/anime");
    private readonly clientAuth: string;

    constructor() {
        dotenv.config();
        this.clientAuth = process.env.MAL_CLIENT_ID!;
        this.getTopAnime(690);
    }

    private isRankingObject(obj: any): obj is IRankingResponse {
        return 'data' in obj;
    }

    private makeApiRequest(url: URL): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let response: any = await fetch(url.toString(), { headers: { "X-MAL-CLIENT-ID": process.env.MAL_CLIENT_ID! } });
            let data: any = await response.json();
            if (!response.ok || !data) reject(response.statusText);
            resolve(data);
        });
    }

    public async getTopAnime(number: number): Promise<Array<number>> {
        // Setting up URL
        let animeIds: Array<number> = [];
        // Prepare URL
        let reqUrl: URL = this.baseUrl;
        reqUrl.pathname += "/ranking";
        // Set all required search params
        reqUrl.searchParams.append("ranking_type", "tv");
        reqUrl.searchParams.append("limit", number.toString());
        reqUrl.searchParams.append("offset", "0");
        /*
        I'm not to proud of declaring lambda function here, but well
        The other two alternatives are to make it separate private method
        (which is definitely not needed as its only use case will be in this specific function)
        or to just copy and paste this code 2 times, which seems counterproductive (especially for testing)
        */
        let getRanking = async (url: URL) => {
            let data: Array<IRankingObject> = (await this.makeApiRequest(url) as IRankingResponse).data;
            for (let i = 0; i < data.length; i++) {
                animeIds.push(data[i].node.id);
                log.info(`Found [${data[i].node.id}]\t-\t${data[i].node.title}`);
            }
        };
        // Actually getting list of IDs
        return new Promise(async (resolve) => {
            let offset: number = 0;
            if (number > 500) reqUrl.searchParams.set("limit", "500");
            for (let i = 0; i < Math.floor(number / 500); i++) {
                getRanking(reqUrl);
                offset += 500;
                reqUrl.searchParams.set("offset", offset.toString());
            }
            number %= 500;
            if (number != 0) {
                reqUrl.searchParams.set("limit", number.toString());
                getRanking(reqUrl);
            }
            resolve(animeIds);
        });


    }

    // public 


}