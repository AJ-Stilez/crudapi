import { CreateUserAttributes, User, UserDocument } from 'src/schema/class/user.schema.class';
import { CrudService } from './core/crud.service';
import { Model } from 'mongoose';
import { AccessType } from 'src/enums/access_type';
import { RecordId } from 'src/types/types';
import { AuditTrailService } from './audit-trail.service';
import { Logger } from 'nestjs-pino';
import { AppToken } from 'src/schema/class/app-token.schema.class';
import { CacheService } from './cache/cache.services';
export declare class UserService extends CrudService<UserDocument> {
    private readonly userModel;
    private readonly cacheService;
    private readonly auditTrailService;
    private readonly logger;
    private readonly USER_CACHE_PREFIX;
    constructor(userModel: Model<UserDocument>, cacheService: CacheService, auditTrailService: AuditTrailService, logger: Logger);
    private getUserCacheTtl;
    createUser(userData: CreateUserAttributes, userType?: AccessType, tokenId?: RecordId, otpCode?: string, selfie?: Array<Express.Multer.File>): Promise<{
        user: User;
        token?: AppToken | null;
    }>;
    getUserInfo(userId: RecordId): Promise<User>;
}
