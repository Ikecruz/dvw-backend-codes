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

    // Method to get news for a single player
    public async fetchSinglePlayerNews(playerName: string) {

        const results = await this.api.v2.everything({
            q: playerName,
            sortBy: 'popularity',
            language: 'en',
        })

        if (results.totalResults > 0) {

            // reduced number of news articles being saved to the database
            const trimmedResult = results.articles.slice(0, 4)
            
            // save news artices to dynamo db
            for (let { title, publishedAt, url } of trimmedResult) {
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
                    
                    console.log("News for player: " + playerName + " uploaded");

                } catch (error) {
                    console.error(error);
                }
            }
        }

    }

    /**
     * The function fetches news for multiple players concurrently using asynchronous requests.
     */
    public async fetchAllPlayersNews() {

        const players = ["LeBron James", "Stephen Curry", "Giannis Antetokounmpo", "Kevin Durant", "Russell Westbrook"] 
        
        const playerPromise = players.map(player => this.fetchSinglePlayerNews(player));

        await Promise.all(playerPromise);

    }

}
