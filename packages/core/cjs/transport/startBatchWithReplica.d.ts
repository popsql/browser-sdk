import type { Configuration, EndpointBuilder } from '../domain/configuration';
import type { RawError } from '../tools/error';
import type { Context } from '../tools/context';
export declare function startBatchWithReplica<T extends Context>(configuration: Configuration, endpoint: EndpointBuilder, reportError: (error: RawError) => void, replicaEndpoint?: EndpointBuilder): {
    add(message: T, replicated?: boolean): void;
};
