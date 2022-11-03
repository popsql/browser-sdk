/**
 * Internal context keep returning v1 format
 * to not break compatibility with logs data format
 */
export function startInternalContext(applicationId, sessionManager, viewContexts, actionContexts, urlContexts) {
    return {
        get: function (startTime) {
            var viewContext = viewContexts.findView(startTime);
            var urlContext = urlContexts.findUrl(startTime);
            var session = sessionManager.findTrackedSession(startTime);
            if (session && viewContext && urlContext) {
                var actionId = actionContexts.findActionId(startTime);
                return {
                    application_id: applicationId,
                    session_id: session.id,
                    user_action: actionId ? { id: actionId } : undefined,
                    view: { id: viewContext.id, name: viewContext.name, referrer: urlContext.referrer, url: urlContext.url },
                };
            }
        },
    };
}
//# sourceMappingURL=internalContext.js.map