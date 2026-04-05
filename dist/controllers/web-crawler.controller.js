"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebCrawlerController = void 0;
const common_1 = require("@nestjs/common");
const web_crawler_service_1 = require("../services/web-crawler.service");
let WebCrawlerController = class WebCrawlerController {
    webCrawlerService;
    constructor(webCrawlerService) {
        this.webCrawlerService = webCrawlerService;
    }
    async crawl(url) {
        return this.webCrawlerService.crawl(url);
    }
};
exports.WebCrawlerController = WebCrawlerController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('url')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebCrawlerController.prototype, "crawl", null);
exports.WebCrawlerController = WebCrawlerController = __decorate([
    (0, common_1.Controller)('web-crawler'),
    __metadata("design:paramtypes", [web_crawler_service_1.WebCrawlerService])
], WebCrawlerController);
//# sourceMappingURL=web-crawler.controller.js.map