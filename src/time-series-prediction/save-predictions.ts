import { InvokeEndpointCommand, SageMakerRuntimeClient } from "@aws-sdk/client-sagemaker-runtime";
import { Database } from "../database";
import fs from "fs";
import path from "path";
import moment from "moment";

interface GetPredictions {
    endpointName: string;
    filename: string;
}

interface FetchAndSavePredictions extends GetPredictions {
    playerName: string;
}

interface PlayerStats {
    MatchTS: number;
    Points: number;
    PlayerName: string;
}

export class SavePredictions {

    private readonly database: Database;
    private client: SageMakerRuntimeClient;

    constructor() {
        this.database = new Database();
        this.client = new SageMakerRuntimeClient({
            region: "us-east-1"
        });
    }

    async fetchAndSavePredictions({ endpointName, filename, playerName }: FetchAndSavePredictions) {
        const points = await this.getPrediction({ endpointName, filename });

        const playerStats: PlayerStats[] = (await this.database.scan({
            TableName: "PlayerStat",
            FilterExpression: "PlayerName = :p",
            ExpressionAttributeValues: {
                ":p": playerName
            }
        })).Items

        let previousTimestamp = playerStats.sort((a, b) => a.MatchTS - b.MatchTS)[playerStats.length - 1].MatchTS;

        for (let point of points) {
            try {

                const timestamp = this.getNextDayAfter7DaysUnixTimestamp(previousTimestamp);

                await this.database.save({
                    tableName: "PredictedStat",
                    body: {
                        "Points": point,
                        "PlayerName": playerName,
                        "MatchTS": timestamp
                    }
                })
                
                previousTimestamp = timestamp;

                console.log("Predicted stats for player: " + playerName + " uploaded")

                await this.sleep(1000);
            } catch (error) {
                console.error(error)
            }
        }

        console.log("Success. All predicted stats for player: " + playerName + " uploaded")

    }

    async getPrediction({ endpointName, filename }: GetPredictions) {

        const instance = await this.getInstance(filename);

        const command = new InvokeEndpointCommand({
            EndpointName: endpointName,
            Body: JSON.stringify({
                "instances": [instance],
                "configuration":
                {
                    "num_samples": 50,
                    "output_types": ["mean"],
                    "quantiles": ["0.1", "0.9"]
                }
            }),
            ContentType: "application/json",
            Accept: "application/json"
        });
        const response = await this.client.send(command);

        let predictions = JSON.parse(Buffer.from(response.Body).toString('utf8'));
        return predictions.predictions[0].mean;

    }

    async getInstance(filename: string) {
        return new Promise((resolve, reject) => {
            const baseDir = path.join(__dirname, "../../jsonStores");
            const filePath = path.join(baseDir, filename);

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    try {
                        // Parse the JSON data
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } catch (error) {
                        reject(error)
                    }
                }
            });
        })
    }

    getNextDayAfter7DaysUnixTimestamp(timestamp: number): number {
        const nextDay = new Date(timestamp * 1000);
        nextDay.setDate(nextDay.getDate() + 7); // Increment the date by 7 days
        return Math.floor(nextDay.getTime() / 1000); // Convert to Unix timestamp and return
    }

    sleep(ms: number) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    }

}