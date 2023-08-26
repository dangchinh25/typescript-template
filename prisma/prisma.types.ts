import { Prisma } from '@prisma/client';

export interface DatabaseErrorConstructorParams {
    error: Error | Prisma.PrismaClientKnownRequestError;
    code?: string;
    message?: string;
    statusCode?: number;
}