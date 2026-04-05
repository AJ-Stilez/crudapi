import { WebCrawlerService } from "src/services/web-crawler.service";
export declare class WebCrawlerController {
    private readonly webCrawlerService;
    constructor(webCrawlerService: WebCrawlerService);
    crawl(url: string): Promise<Record<string, any>>;
}
