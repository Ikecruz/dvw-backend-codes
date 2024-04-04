import { NewsFetcher } from "./news-fetcher";
import { SpreadsheetReader } from "./spreadsheet-reader";
import { JsonProcessor } from "./time-series-prediction/json-processor";

function bootstrap() {

    // const spreadSheetReader = new SpreadsheetReader();
    // spreadSheetReader.readData();

    // const newFetcher = new NewsFetcher();
    // newFetcher.fetchAllPlayersNews();
    
    const jsonProcessor = new JsonProcessor();
    jsonProcessor.fetchDataAndSaveToJson();

}

bootstrap();
