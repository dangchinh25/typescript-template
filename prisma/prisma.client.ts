import { PrismaClient } from '@prisma/client';

export const prismaClient = new PrismaClient(

    // { log: [ { level: 'query', emit: 'event' } ] }
);

// prismaClient.$on( 'query', ( e ) => {
//     console.log( 'Query: ' + e.query );
//     console.log( 'Params: ' + e.params );
//     console.log( 'Duration: ' + e.duration + 'ms' );
// } );