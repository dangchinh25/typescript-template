export const isObjectEmpty = ( obj: unknown ): boolean => {
    return Object.keys( <Record<string, unknown>> obj ).length === 0;
};