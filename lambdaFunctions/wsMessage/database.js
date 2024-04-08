import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

//Returns all of the connection IDs
export async function getConnectionIds() {
    const scanCommand = new ScanCommand({
        TableName: "WebSocketClients"
    });

    const response = await docClient.send(scanCommand);
    return response.Items;
}


//Deletes the specified connection ID
export async function deleteConnectionId(connectionId) {
    console.log("Deleting connection Id: " + connectionId);

    const deleteCommand = new DeleteCommand({
        TableName: "WebSocketClients",
        Key: {
            ConnectionId: connectionId
        }
    });
    return docClient.send(deleteCommand);
}

//Returns results based on query
export async function getQueryResults(playerName, tableName) {
    const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PlayerName = :playerName",
        ExpressionAttributeValues: {
            ":playerName": playerName
        },
    });

    const response = await docClient.send(command);
    const result = response.Items;

    return result.slice(Math.max(result.length - 100, 0));
}

export async function getSentimentData(playerName) {
    const command = new QueryCommand({
        TableName: "Sentiments",
        KeyConditionExpression: "PlayerName = :playerName",
        ExpressionAttributeValues: {
            ":playerName": playerName,
        },
    });

    try {
        const response = await docClient.send(command);
        const result = response.Items;
        return result;
    }
    catch (error) {
        console.error("Error fetching sentiment data:", error);
        throw error;
    }
}

export async function getData(teamName) {
    const results = await getQueryResults(teamName, "PlayerStat");
    const predictions = await getQueryResults(teamName, "PredictedStat");

    // Actual date for x axis
    let actualXArray = results?.map(item => {
        // convert timestamp in millisecs to usable date format
        const timestamp = item.MatchTS;
        const date = new Date(timestamp);
        return date.toISOString().slice(0, 19).replace('T', ' ');
    });

    let predictedXArray = predictions?.map(item => {
        // convert timestamp in millisecs to usable date format
        const timestamp = item.MatchTS;
        const date = new Date(timestamp);
        return date.toISOString().slice(0, 19).replace('T', ' ');
    });
    
    // Actual points for y axis
    let actualYArray = results?.map(item => item.Points);
    
    // Predicted points for y axis
    let predictedYArray = predictions?.map(item => item.Points);

    let data = {
        actual: {
            x: actualXArray,
            y: actualYArray,
            type: "scatter"
        },
        predicted: {
            x: predictedXArray,
            y: predictedYArray,
            type: "scatter"
        }
    };

    return data;
}

export async function getSentiments(playerName) {
    const results = await getSentimentData(playerName);
    const labels = results?.map(item => item.Result.label);

    const data = [labels];
    return data;
}