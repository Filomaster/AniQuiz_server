import mongoose from 'mongoose';

interface Theme {
    mal_id: number; // MyAnimeList ID for each anime
    title: string,
    alt_title: Array<string>,
    rank: number,
    popularity: number,
    genres: Array<string>,
}

export default class MongoWrapper {
    private static Instance: MongoWrapper;

    private constructor() {

    }

    public static getInstance(): MongoWrapper {
        if (!MongoWrapper.Instance) MongoWrapper.Instance = new MongoWrapper();
        return MongoWrapper.Instance;
    }
}