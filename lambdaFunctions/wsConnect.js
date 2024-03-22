import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {

    // Get connection id from event
    let connectionId = event.requestContext.connectionId;

    const command = new PutCommand({
        TableName: "WebSocketClients",
        Item: {
            connectionId
        }
    })

    try {
        
        // Save connection id to table
        await docClient.send(command);
        console.log("Connection key stored");

        return {
            statusCode: 200,
            body: "Client connected with ID: " + connectionId,
        }

    } catch (error) {
        console.error(JSON.stringify(error))
        return {
            statusCode: 500,
            body: "Server Error: " + JSON.stringify(error)
        }
    }

}
