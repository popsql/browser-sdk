import type { ActionContexts } from '../rumEventsCollection/action/actionCollection';
import type { RumSessionManager } from '../rumSessionManager';
import type { ViewContexts } from './viewContexts';
import type { UrlContexts } from './urlContexts';
export interface InternalContext {
    application_id: string;
    session_id: string | undefined;
    view?: {
        id: string;
        url: string;
        referrer: string;
        name?: string;
    };
    user_action?: {
        id: string | string[];
    };
}
/**
 * Internal context keep returning v1 format
 * to not break compatibility with logs data format
 */
export declare function startInternalContext(applicationId: string, sessionManager: RumSessionManager, viewContexts: ViewContexts, actionContexts: ActionContexts, urlContexts: UrlContexts): {
    get: (startTime?: number | undefined) => InternalContext | undefined;
};
