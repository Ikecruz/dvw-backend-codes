import axios from "axios";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    
    // Extract data from event
    for (let record of event.Records) {

        // Checks if event type is for a database insert
        if (record.eventName !== "INSERT") {
            return {
                statusCode: 400,
                message: "Not expected event"
            }
        }

        const text = record.dynamodb.NewImage.News.S;
        const player = record.dynamodb.NewImage.PlayerName.S;
        const timeStamp = record.dynamodb.NewImage.NewsTS.N;

        const url = 'http://text-processing.com/api/sentiment/';
        const body = {
            text: text
        }
        const options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        // Process sentiment with new data
        const response = await axios.post(url, body, options);
        const sentiment = JSON.stringify(response.data);

        // Saves sentiment result to database
        const command = new PutCommand({
            TableName: "Sentiments",
            Item: {
                "NewsTS": parseInt(timeStamp),
                "PlayerName": player,
                "Result": JSON.parse(sentiment)
            }
        })

        try {
            
            await docClient.send(command);
            console.log(player + " sentiment updated")

        } catch (error){
            console.error("Error saving data: ", error)
        }

    }

    const response = {
        statusCode: 200
    };

    return response;

}
