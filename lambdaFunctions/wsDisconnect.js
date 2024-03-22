import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({region: "us-east-1"});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {

    // Connection ID from event
    let connectionId = event.requestContext.connectionId;

    const command = new DeleteCommand({
        TableName: "WebSocketClients",
        Key: {
            connectionId
        }
    });

    try {
        
        // Remove connection id from table
        await docClient.send(command);
        console.log("Connection ID deleted");

        return {
            statusCode: 200,
            body: "Client disconnected. ID: " + connectionId
        }

    } catch (error) {
        console.error("Error disconnecting client ID: " + connectionId);
        console.error("Error: "+error);

        return {
            statusCode: 500,
            body: "Server Error: " + JSON.stringify(error),
        }
    }

}
