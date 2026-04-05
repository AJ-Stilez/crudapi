import { Module } from "@nestjs/common";
import { WebCrawlerController } from "src/controllers/web-crawler.controller";
import { WebCrawlerService } from "src/services/web-crawler.service";

@Module({
    imports: [],
    controllers: [WebCrawlerController],
    providers: [WebCrawlerService],
})

export class WebCrawlerModule {}