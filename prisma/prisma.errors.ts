import { Prisma } from '@prisma/client';
import { ResourceError } from '../errors';
import { DatabaseErrorConstructorParams } from './prisma.types';

export class DatabaseError extends ResourceError {
    error: DatabaseErrorConstructorParams['error'];

    public constructor ( {
        error,
        code,
        message = 'The database request could not be fulfilled.',
        statusCode = 500
    }: DatabaseErrorConstructorParams ) {
        super( {
            message,
            error,
            code,
            statusCode
        } );
        this.error = { ...error, message: error.message };
    }
}

export class DatabaseNotNullError extends DatabaseError {
    public constructor ( error: Prisma.PrismaClientKnownRequestError ) {
        const message = 'A not-null constraint was violated';
        const statusCode = 400;
        super( {
            error,
            message,
            statusCode
        } );
    }
}

export class DatabaseForeignKeyError extends DatabaseError {
    public constructor ( error: Prisma.PrismaClientKnownRequestError ) {
        const message = 'A foreign key constraint was violated';
        const statusCode = 400;
        super( {
            error,
            message,
            statusCode
        } );
    }
}

export class DatabaseDuplicateKeyError extends DatabaseError {
    public constructor ( error: Prisma.PrismaClientKnownRequestError ) {
        const message = 'A unique key constraint was violated';
        const statusCode = 400;
        super( {
            error,
            message,
            statusCode
        } );
    }
}

export class DatabaseResourceNotFoundError extends DatabaseError {
    public constructor ( error: Prisma.PrismaClientKnownRequestError ) {
        const message = 'An operation failed because it depends on one or more records that were required but not found';
        const statusCode = 404;
        super( {
            error,
            message,
            statusCode
        } );
    }
}

export class DatabaseSpecificResourceNotFoundError extends DatabaseError {
    public constructor ( error: Prisma.PrismaClientKnownRequestError ) {
        const message = 'The specified resource was not found';
        const statusCode = 404;
        super( {
            error,
            message,
            statusCode
        } );
    }
}

export class DatabaseRelationViolationError extends DatabaseError {
    public constructor ( error: Prisma.PrismaClientKnownRequestError ) {
        const message = 'A requried relation is violated';
        const statusCode = 400;
        super( {
            error,
            message,
            statusCode
        } );
    }
}
