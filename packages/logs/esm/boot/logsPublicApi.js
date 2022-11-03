import { assign, BoundedBuffer, createContextManager, makePublicApi, monitor, display, deepClone, canUseEventBridge, timeStampNow, } from '@datadog/browser-core';
import { validateAndBuildLogsConfiguration } from '../domain/configuration';
import { Logger } from '../domain/logger';
export function makeLogsPublicApi(startLogsImpl) {
    var isAlreadyInitialized = false;
    var globalContextManager = createContextManager();
    var customLoggers = {};
    var getInternalContextStrategy = function () { return undefined; };
    var beforeInitLoggerLog = new BoundedBuffer();
    var handleLogStrategy = function (logsMessage, logger, savedCommonContext, date) {
        if (savedCommonContext === void 0) { savedCommonContext = deepClone(getCommonContext()); }
        if (date === void 0) { date = timeStampNow(); }
        beforeInitLoggerLog.add(function () { return handleLogStrategy(logsMessage, logger, savedCommonContext, date); });
    };
    var getInitConfigurationStrategy = function () { return undefined; };
    var mainLogger = new Logger(function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return handleLogStrategy.apply(void 0, params);
    });
    function getCommonContext() {
        return {
            view: {
                referrer: document.referrer,
                url: window.location.href,
            },
            context: globalContextManager.get(),
        };
    }
    return makePublicApi({
        logger: mainLogger,
        init: monitor(function (initConfiguration) {
            var _a;
            if (canUseEventBridge()) {
                initConfiguration = overrideInitConfigurationForBridge(initConfiguration);
            }
            if (!canInitLogs(initConfiguration)) {
                return;
            }
            var configuration = validateAndBuildLogsConfiguration(initConfiguration);
            if (!configuration) {
                return;
            }
            ;
            (_a = startLogsImpl(initConfiguration, configuration, getCommonContext, mainLogger), handleLogStrategy = _a.handleLog, getInternalContextStrategy = _a.getInternalContext);
            getInitConfigurationStrategy = function () { return deepClone(initConfiguration); };
            beforeInitLoggerLog.drain();
            isAlreadyInitialized = true;
        }),
        /** @deprecated: use getGlobalContext instead */
        getLoggerGlobalContext: monitor(globalContextManager.get),
        getGlobalContext: monitor(globalContextManager.getContext),
        /** @deprecated: use setGlobalContext instead */
        setLoggerGlobalContext: monitor(globalContextManager.set),
        setGlobalContext: monitor(globalContextManager.setContext),
        /** @deprecated: use setGlobalContextProperty instead */
        addLoggerGlobalContext: monitor(globalContextManager.add),
        setGlobalContextProperty: monitor(globalContextManager.setContextProperty),
        /** @deprecated: use removeGlobalContextProperty instead */
        removeLoggerGlobalContext: monitor(globalContextManager.remove),
        removeGlobalContextProperty: monitor(globalContextManager.removeContextProperty),
        clearGlobalContext: monitor(globalContextManager.clearContext),
        createLogger: monitor(function (name, conf) {
            if (conf === void 0) { conf = {}; }
            customLoggers[name] = new Logger(function () {
                var params = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    params[_i] = arguments[_i];
                }
                return handleLogStrategy.apply(void 0, params);
            }, name, conf.handler, conf.level, conf.context);
            return customLoggers[name];
        }),
        getLogger: monitor(function (name) { return customLoggers[name]; }),
        getInitConfiguration: monitor(function () { return getInitConfigurationStrategy(); }),
        getInternalContext: monitor(function (startTime) { return getInternalContextStrategy(startTime); }),
    });
    function overrideInitConfigurationForBridge(initConfiguration) {
        return assign({}, initConfiguration, { clientToken: 'empty' });
    }
    function canInitLogs(initConfiguration) {
        if (isAlreadyInitialized) {
            if (!initConfiguration.silentMultipleInit) {
                display.error('DD_LOGS is already initialized.');
            }
            return false;
        }
        return true;
    }
}
//# sourceMappingURL=logsPublicApi.js.map