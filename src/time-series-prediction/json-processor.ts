import { Database } from "../database";
import moment from "moment"
import { promises as fs } from "fs";
import path from "path";

interface PlayerStats {
    MatchTS: number;
    Points: number;
    PlayerName: string;
}

interface CreateJson {
    start: string;
    target: number[];
    fileName: string
}

export class JsonProcessor {

    private readonly database: Database;
    private readonly players = ["LeBron James", "Stephen Curry", "Giannis Antetokounmpo", "Kevin Durant", "Russell Westbrook"] 

    constructor () {
        this.database = new Database();
    }

    public async fetchDataAndSaveToJson() {
        await Promise.all(
            this.players.map(player => this.fetchPlayerDataAndSaveToJson(player))
        )
    }

    public async fetchPlayerDataAndSaveToJson(playerName: string) {
    
        const stats: PlayerStats[] = (await this.database.scan({
            TableName: "PlayerStat",
            FilterExpression: "PlayerName = :p",
            ExpressionAttributeValues: {
                ":p": playerName
            }
        })).Items;
        
        const startTimestamp = moment.unix(stats[0].MatchTS).format("YYYY-MM-DD HH:mm:ss");
        const targetPoints = stats.map(stat => stat.Points);

        const fileName = this.createFilename(playerName);
        
        await this.createJsonFile({
            fileName,
            start: startTimestamp,
            target: targetPoints
        })

        await this.createPlayerTestAndTrainJson(stats, fileName);

    }

    private async createPlayerTestAndTrainJson(data: PlayerStats[], playerName: string) {
        const playerStats = data;
        const last100Items = playerStats.slice(-100);

        const testStart = moment.unix(last100Items[0].MatchTS).format("YYYY-MM-DD HH:mm:ss");
        const testTarget = last100Items.map(stat => stat.Points);

        const trainStart = moment.unix(playerStats[0].MatchTS).format("YYYY-MM-DD HH:mm:ss");
        const trainTarget = playerStats.map(stat => stat.Points);

        await Promise.all([
            this.createJsonFile({ fileName: playerName + "_test", start: testStart, target: testTarget }),
            this.createJsonFile({ fileName: playerName + "_train", start: trainStart, target: trainTarget })
        ])

    }

    private async createJsonFile({ fileName, start, target }: CreateJson) {
        let fileData = `{"start": "${start}", "target": [${target}]}`

        const baseDir = path.join(__dirname, "../../jsonStores");
        const filePath = path.join(baseDir, fileName + ".json");

        try {
            await fs.writeFile(filePath, fileData, "utf8");
            console.log(`JSON file ${fileName} has been processed`)
        } catch (error) {
            console.error('Error processing or saving the data by team:', error)         
        }
    }

    private createFilename(value: string) {
        return value.toLowerCase().split(" ").join("_");
    }

}
