export interface IRankingResponse {
    data: Array<IRankingObject>;
}
export interface IRankingObject {
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

// Interfaces for anime detail request
export interface IMainPicture {
    medium: string,
    large: string;
}

export interface IAlternativeTitles {
    synonyms: Array<string>,
    en: string,
    jp: string;
}
// For genres and studios
export interface IProperty {
    id: number,
    name: string;
}

export interface ITheme {
    id: number,
    anime_id: number,
    test: string;
}

export interface IAnimeObject {
    id: number,
    title: string,
    main_Picture: IMainPicture,
    alternative_titles: IAlternativeTitles,
    rank: number,
    popularity: number,
    genres: Array<IProperty>,
    opening_themes: Array<ITheme>,
    ending_themes: Array<ITheme>;
}

export interface IProcessedAnimeData {
    id: number,
    title: string,
    alternative_titles: Array<string>,
    rank: number,
    popularity: number,
    opening_themes: Array<ITheme>,
    ending_themes: Array<ITheme>;
}