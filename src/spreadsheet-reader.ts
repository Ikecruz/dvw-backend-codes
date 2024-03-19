import csv from 'csv-parser';
import fs from "fs";
import path from 'path';
import { Database } from './database';

interface Stat {
    playerName: string;
    date: number;
    minutesPlayed: number;
    points: number;
}

interface RawData {
    date: string;
    type: string;
    player: string;
    MIN: string;
    PTS: string
}

export class SpreadsheetReader {

    private readonly filePath = "../players-stats.csv";
    private readonly players = ["LeBron James", "Stephen Curry", "Giannis Antetokounmpo", "Kevin Durant", "Russell Westbrook"]  
    private readonly database: Database;

    constructor() {
        this.database = new Database();
    }

    public readData() {

        const absolutePath = path.join(__dirname, this.filePath);

        const playerStats: Stat[] = []

        const readStream = fs.createReadStream(absolutePath).pipe(csv())
        
        readStream.on('data', async (data: RawData) => {
            
            if (!this.players.includes(data.player) || data.type !== "regular") return;

            const newStat: Stat = {
                date: (new Date(data.date)).getTime(),
                playerName: data.player,
                minutesPlayed: Number(data.MIN),
                points: Number(data.PTS),
            }

            playerStats.push(newStat);
                
        })

        readStream.on('end', async () => {
            for (let playerStat of playerStats) {

                try {
                    await this.database.save({
                        tableName: "PlayerStat",
                        body: {
                            "MatchTS": playerStat.date,
                            "Points": playerStat.points,
                            "PlayerName": playerStat.playerName,
                        }
                    })

                    console.log(`Player ${playerStat.playerName} stats updated`)

                } catch (error) {
                    console.error(error);
                }
                
            }
        })
    }

    
}