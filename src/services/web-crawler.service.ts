import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class WebCrawlerService {
  constructor() {}

  async crawl(url: string): Promise<Record<string, any>> {
    // Implement your web crawling logic here
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const links: string[] = [];

    $('a').each((index, element) => {
      const link = $(element).attr('href');

      if (link) {
        links.push(link);
      }
    });

    return {
      url,
      totalLinks: links.length,
      links,
    };

     }
}
