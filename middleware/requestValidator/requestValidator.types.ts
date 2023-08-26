import { SCHEMAS } from './requestValidator.schemas';

export interface RequestContent {
    query?: unknown;

   /*
    *This is actually of type ParamsDictionary.
    *But Express doesn't export it
    */
    params?: unknown;
    body?: unknown;
}


/**
 * We store joi schemas used for validation
 * schemas in the same file. This helps filter
 * the normal schemas to not be used by the
 * typing of the request validator. We are able
 * to do this filter because the valid request
 * schemas are named in an UPPER_CASE pattern.
 */

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
type OmitNonRequestSchema<S extends string>
    = S extends `${ infer _ }_${ infer __ }` ? S : never;

export type SchemaName = OmitNonRequestSchema<keyof typeof SCHEMAS>;