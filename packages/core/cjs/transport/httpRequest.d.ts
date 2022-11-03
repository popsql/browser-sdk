import type { EndpointBuilder } from '../domain/configuration';
import type { Context } from '../tools/context';
import type { RawError } from '../tools/error';
/**
 * Use POST request without content type to:
 * - avoid CORS preflight requests
 * - allow usage of sendBeacon
 *
 * multiple elements are sent separated by \n in order
 * to be parsed correctly without content type header
 */
export declare type HttpRequest = ReturnType<typeof createHttpRequest>;
export interface HttpResponse extends Context {
    status: number;
}
export interface Payload {
    data: string | FormData;
    bytesCount: number;
}
export declare function createHttpRequest(endpointBuilder: EndpointBuilder, bytesLimit: number, reportError: (error: RawError) => void): {
    send: (payload: Payload) => void;
    /**
     * Since fetch keepalive behaves like regular fetch on Firefox,
     * keep using sendBeaconStrategy on exit
     */
    sendOnExit: (payload: Payload) => void;
};
export declare function fetchKeepAliveStrategy(endpointBuilder: EndpointBuilder, bytesLimit: number, { data, bytesCount }: Payload, onResponse?: (r: HttpResponse) => void): void;
export declare function sendXHR(url: string, data: Payload['data'], onResponse?: (r: HttpResponse) => void): void;
