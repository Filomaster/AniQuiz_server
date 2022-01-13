import { resolve } from "path/posix";
import { makeApiRequest } from "../utils/Common";
import FiLogger, { colors, logLvl } from '../utils/FiLogger';
import AnimeThemes from "anime-themes";
import { IAnime } from "./ThemesInterfaces";
import { IProcessedAnimeData } from '../animeProcessing/interfaces/MALInterfaces';

const themes = new AnimeThemes();
const log = FiLogger.getInstance();

export default class AnimeThemesWrapper {
    private static Instance: AnimeThemesWrapper;
    private readonly baseUrl: URL = new URL("https://staging.animethemes.moe/api");

    private constructor() { /* It's useless for now */ }

    public static getInstance(): AnimeThemesWrapper {
        if (!AnimeThemesWrapper.Instance) AnimeThemesWrapper.Instance = new AnimeThemesWrapper();
        return AnimeThemesWrapper.Instance;
    }

    // TODO: Change return type from any
    // TODO: Change parameters to IProcessedAnimeData (to check for themes)
    public getTheme(anime: IProcessedAnimeData): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let mismatchedAnimeTitles: Array<string> = [];
            let titles: Array<string> = [anime.title, ...anime.alternative_titles];
            // TODO: As this is working, check if anime title is EXACTLY the same as title or alt title from parameter, get themes info, check if number and title from mal and themes are consistent, then return them
            animeLoop: // Loop to check title and alternative titles if proper response from themes is not found
            for (let i = 0; i < titles.length; i++) {
                let data = await themes.search(titles[i]) as Array<IAnime>;
                themesLoop: // Loop to check every title returned from themes api
                for (let j = 0; j < data.length; j++) {
                    if (data[j].title === titles[i]) break animeLoop;
                    mismatchedAnimeTitles.push(...(mismatchedAnimeTitles.indexOf(data[j].title) != -1 ? [data[j].title] : []));
                    if (i === titles.length - 1 && j === data.length - 1) reject({ expectedTitle: titles, found: mismatchedAnimeTitles });
                }
            }

            // Check if theme name is exact to the search name

            resolve("ok");

        });

    }
}