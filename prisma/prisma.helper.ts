import { Prisma } from '@prisma/client';
import {
    DatabaseError,
    DatabaseDuplicateKeyError,
    DatabaseForeignKeyError,
    DatabaseNotNullError,
    DatabaseRelationViolationError,
    DatabaseResourceNotFoundError,
    DatabaseSpecificResourceNotFoundError
} from './prisma.errors';

export const createDatabaseError = (
    newError: unknown
): DatabaseError => {
    const error = newError as Error;

    if ( error.name === 'NotFoundError' ) {
        return new DatabaseSpecificResourceNotFoundError(
            error as Prisma.PrismaClientKnownRequestError
        );
    }

    if ( error instanceof Prisma.PrismaClientKnownRequestError ) {
        if ( error.code === 'P2002' ) return new DatabaseDuplicateKeyError( error );
        if ( error.code === 'P2003' ) return new DatabaseForeignKeyError( error );
        if ( error.code === 'P2011' ) return new DatabaseNotNullError( error );
        if ( error.code === 'P2025' ) return new DatabaseResourceNotFoundError( error );
        if ( error.code === 'P2014' ) return new DatabaseRelationViolationError( error );
    }

    console.error( 'database error', error );

    return new DatabaseError( { error } );
};