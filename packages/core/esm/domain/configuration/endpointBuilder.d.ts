import type { InitConfiguration } from './configuration';
export declare const ENDPOINTS: {
    readonly logs: "logs";
    readonly rum: "rum";
    readonly sessionReplay: "session-replay";
};
export declare type EndpointType = keyof typeof ENDPOINTS;
export declare type EndpointBuilder = ReturnType<typeof createEndpointBuilder>;
export declare function createEndpointBuilder(initConfiguration: InitConfiguration, endpointType: EndpointType, tags: string[]): {
    build(): string;
    buildIntakeUrl(): string;
    endpointType: "logs" | "rum" | "sessionReplay";
};
