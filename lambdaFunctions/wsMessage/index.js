import { sendMessage } from './websocket.mjs'
import { getData, getSentiments } from './database.mjs';

export const handler = async (event) => {
    try {
        let connId = event.requestContext.connectionId;

        const body = JSON.parse(event.body);
        const playerName = body.data;

        // Using team name sent from the clientside
        const requestId = playerName;

        // Fetch data based on the team name
        const data = await getData(playerName);
        const sentiments = await getSentiments(playerName);

        //Extract domain and stage from event
        const domain = event.requestContext.domainName;
        const stage = event.requestContext.stage;

        //Get promises to send the data and the requestId to connected clients
        let result = await sendMessage(JSON.stringify({ ...data, id: requestId, sentiments }), connId, domain, stage);
    }
    catch (err) {
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }

    //Success
    return { statusCode: 200, body: "Data sent successfully." };
};