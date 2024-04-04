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

export class Database {

    private readonly docClient: DynamoDBDocumentClient;

    constructor() {
        const client = new DynamoDBClient({region: "us-east-1"})
        this.docClient = DynamoDBDocumentClient.from(client);
    }

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
