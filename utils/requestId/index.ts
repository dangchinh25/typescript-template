import cls from 'cls-hooked';
import { v4 as uuid } from 'uuid';

/**
 * This function looks at the current namespace
 * and returns the requestId attribute that is
 * assigned at the beginning of a request's
 * lifecycle.
 */
export const getCurrentRequestId = (): string => {
    const namespace = cls.getNamespace( 'context-ask-gpt' );
    const requestId: string = namespace?.get( 'requestId' ) ?? uuid();
    return requestId;
};