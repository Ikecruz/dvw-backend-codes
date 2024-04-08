import { NewsFetcher } from "./news-fetcher";
import { SpreadsheetReader } from "./spreadsheet-reader";
import { JsonProcessor } from "./time-series-prediction/json-processor";
import { SavePredictions } from "./time-series-prediction/save-predictions";

async function bootstrap() {

    // const spreadSheetReader = new SpreadsheetReader();
    // spreadSheetReader.readData();

    // const newFetcher = new NewsFetcher();
    // newFetcher.fetchAllPlayersNews();
    
    // const predictionSaver = new SavePredictions();
    // await predictionSaver.fetchAndSavePredictions({
    //     endpointName: "StephenEndpoint",
    //     filename: "stephen_curry_test.json",
    //     playerName: "Stephen Curry"
    // })

}

bootstrap();
