import MalWrapper from './components/MalWrapper';
import { IAnimeObject } from './interfaces/MALInterfaces';
export default class AnimeProcessing {
    private static Instance: AnimeProcessing;

    private MAL: MalWrapper;

    private constructor() {
        this.MAL = new MalWrapper();

    }

    public static getInstance(): AnimeProcessing {
        if (!AnimeProcessing.Instance) AnimeProcessing.Instance = new AnimeProcessing();
        return AnimeProcessing.Instance;
    }

    // Gets anime from MAL, then searches for it on Kitsu and Anilist
    public async getAnimeData(MAL_data: IAnimeObject) {

    }
}