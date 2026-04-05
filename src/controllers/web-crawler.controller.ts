import { Controller, Get, Query } from "@nestjs/common";
import { WebCrawlerService } from "src/services/web-crawler.service";

@Controller('web-crawler')
export class WebCrawlerController {
  constructor(private readonly webCrawlerService: WebCrawlerService) {}

  @Get()
  async crawl(@Query('url') url: string) {
    return this.webCrawlerService.crawl(url);
  }

}