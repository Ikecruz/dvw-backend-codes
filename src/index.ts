import { NewsFetcher } from "./news-fetcher";
import { SpreadsheetReader } from "./spreadsheet-reader";

function bootstrap() {
    // const spreadSheetReader = new SpreadsheetReader();
    // spreadSheetReader.readData();

    const newFetcher = new NewsFetcher();
    newFetcher.fetchSinglePlayerNews("Stephen Curry");
    
}

bootstrap();
