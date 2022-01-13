export interface IAnime {
    id: number,
    title: string,
    season: ISeasonInfo;
    themes: Array<ITheme>;
}

export interface ISeasonInfo {
    year: number,
    season: string,
    api: any;
}

export interface ITheme {
    anime: any,
    api: any,
    number: number,
    title: string,
    type: string,
    url: string,
    version: number;
}