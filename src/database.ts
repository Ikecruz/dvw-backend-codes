import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

interface AddData {
    tableName: string;
    body: {
        [key: string]: any
    }
}

interface ScanData {
    TableName: string;
    [key: string]: any;
}

/**
 * Database class for interacting with AWS DynamoDB.
 */
export class Database {

    private readonly docClient: DynamoDBDocumentClient;

    constructor() {
        const client = new DynamoDBClient({region: "us-east-1"})
        this.docClient = DynamoDBDocumentClient.from(client);
    }

    /**
     * Saves data using the specified properties.
     * @param prop The properties for the data to be saved.
     * @returns A promise that resolves with the save result.
     */
    public save (prop: AddData) {
        return new Promise( async (resolve, reject) => {
            try {

                const command = new PutCommand({
                    TableName: prop.tableName,
                    Item: prop.body
                })
    
                const result = await this.docClient.send(command)
                resolve(result);

            } catch (error) {
                reject(error);
            }
        })
    }  

    /**
     * Performs a public scan operation on the specified data.
     * @param prop The properties for the scan operation.
     * @returns A promise that resolves with the scan result.
     */
    public scan (prop: ScanData): Promise<any> {
        return new Promise( async (resolve, reject) => {
            try {

                const command = new ScanCommand(prop);

                const result = await this.docClient.send(command);
                resolve(result);

            } catch (error) {
                reject(error);
            }
        })
    }

}
