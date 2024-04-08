import { NewsFetcher } from "./news-fetcher";
import { SpreadsheetReader } from "./spreadsheet-reader";
import { JsonProcessor } from "./time-series-prediction/json-processor";
import { SavePredictions } from "./time-series-prediction/save-predictions";

async function bootstrap() {

    // READS CODE FROM SPREADSHEET
    // const spreadSheetReader = new SpreadsheetReader();
    // spreadSheetReader.readData();

    // FETCH NEWS FROM API
    const newFetcher = new NewsFetcher();
    newFetcher.fetchAllPlayersNews();

}

bootstrap();
