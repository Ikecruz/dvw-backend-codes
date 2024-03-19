import NewsAPI from "newsapi"
import { NEWS_API_KEY } from "./config";
import { Database } from "./database";

export class NewsFetcher {

    private api: typeof NewsAPI;
    private readonly database: Database;

    constructor() {
        this.api = new NewsAPI(
            NEWS_API_KEY
        );
        this.database = new Database();
    }

    public async fetchSinglePlayerNews(playerName: string) {

        const results = await this.api.v2.everything({
            q: playerName,
            sortBy: 'popularity',
            language: 'en',
        })

        if (results.totalResults > 0) {
            const trimmedResult = [results.articles[0]]
            
            trimmedResult.map( async ({ title, publishedAt, url }) => {

                try {
                
                    await this.database.save({
                        tableName: "PlayersNews",
                        body: {
                            "NewsTS": (new Date(publishedAt)).getTime(),
                            "News": title,
                            "PlayerName": playerName,
                            "Url": url
                        }
                    })
    
                } catch (error) {
                    console.error(error);
                }

            })
        }

    }

}