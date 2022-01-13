import * as dotenv from "dotenv";

//! DO NOT CROSS STREAMS. OR AT LEAST DO NOT IMPORT CODEBASE INTO ITSELF
import AnimeThemesWrapper from "../../themeProcessing/ThemesProcessing";

import FiLogger, { colors, logLvl } from '../../utils/FiLogger';
import { makeApiRequest } from "../../utils/Common";

import {
    IAnimeObject,
    IRankingObject,
    IRankingResponse,
    IProcessedAnimeData
} from '../interfaces/MALInterfaces';

const log = FiLogger.getInstance();

export default class MalWrapper {
    private readonly baseUrl: URL = new URL("https://api.myanimelist.net/v2/anime");
    private readonly clientAuth: string;

    constructor() {
        // let themes = AnimeThemesWrapper.getInstance();
        dotenv.config();
        this.clientAuth = process.env.MAL_CLIENT_ID!;

        this.getTopAnime(5).then(async (res) => {
            for (let i = 0; i < res.length; i++) {
                // res.forEach(x => {
                let animeDetail = await this.getAnimeDetail(res[i]);
                log.info(animeDetail);
                //! ONLY FOR TEST. DO NOT LEAVE THIS HERE
                // let themesInfo = await themes.getTheme(animeDetail.title, animeDetail.alternative_titles);
                //  .then(resx => {
                // log.status("ANIME", colors.MAGENTA, logLvl.INFO, res);
                // log.status("THEME", colors.CYAN, logLvl.INFO, themesInfo);
                // }).catch(e => log.error(e));
                // })
            }
            log.error("done");

        });
    }



    public async getTopAnime(number: number): Promise<Array<number>> {
        // Setting up URL
        let animeIds: Array<number> = [];
        // Prepare URL
        let reqUrl: URL = new URL(this.baseUrl);
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
            let data: Array<IRankingObject> = (await makeApiRequest(url) as IRankingResponse).data;
            for (let i = 0; i < data.length; i++) {
                animeIds.push(data[i].node.id);
                log.info(`Found [${data[i].node.id}]\t-\t${data[i].node.title}`);
            }
        };
        // Actually getting list of IDs
        // TODO: Promise without reject, you might want to think about that again
        return new Promise(async (resolve) => {
            let offset: number = 0;
            if (number > 500) reqUrl.searchParams.set("limit", "500");
            for (let i = 0; i < Math.floor(number / 500); i++) {
                await getRanking(reqUrl);
                offset += 500;
                reqUrl.searchParams.set("offset", offset.toString());
            }
            number %= 500;
            if (number != 0) {
                reqUrl.searchParams.set("limit", number.toString());
                await getRanking(reqUrl);
            }
            resolve(animeIds);
        });


    }
    public async getAnimeDetail(malId: number): Promise<IAnimeObject> {
        return new Promise(async (resolve, reject) => {
            // Prepare URL
            let reqUrl: URL = new URL(this.baseUrl);
            reqUrl.pathname += `/${malId}`;
            // Set all required search params
            try {
                let data: IAnimeObject = (await makeApiRequest(reqUrl, "fields=alternative_titles,rank,popularity,genres,opening_themes,ending_themes") as IAnimeObject);
                // FIXME: PLEASE TELL ME THAT THERE'S ACTUALLY BETTER WAY OF DOING THIS. IT'S PAINFUL
                // I just need to cast that with modifying ONE type.
                // let output: IProcessedAnimeData = ((x: IAnimeObject): IProcessedAnimeData => ({
                //     id: x.id,
                //     title: x.title,
                //     // That's some awful spread
                //     alternative_titles: [...x.alternative_titles.synonyms, ...(x.alternative_titles.en === x.title ? [] : [x.alternative_titles.en])],
                //     rank: x.rank,
                //     popularity: x.popularity,
                //     opening_themes: x.opening_themes,
                //     ending_themes: x.ending_themes
                // }))(data);
                // let output: IAnimeObject = 
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    }
    // public 


}