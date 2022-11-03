"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRumPublicApi = void 0;
var browser_core_1 = require("@datadog/browser-core");
var configuration_1 = require("../domain/configuration");
function makeRumPublicApi(startRumImpl, recorderApi, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.ignoreInitIfSyntheticsWillInjectRum, ignoreInitIfSyntheticsWillInjectRum = _c === void 0 ? true : _c;
    var isAlreadyInitialized = false;
    var globalContextManager = (0, browser_core_1.createContextManager)();
    var userContextManager = (0, browser_core_1.createContextManager)();
    var getInternalContextStrategy = function () { return undefined; };
    var getInitConfigurationStrategy = function () { return undefined; };
    var bufferApiCalls = new browser_core_1.BoundedBuffer();
    var addTimingStrategy = function (name, time) {
        if (time === void 0) { time = (0, browser_core_1.timeStampNow)(); }
        bufferApiCalls.add(function () { return addTimingStrategy(name, time); });
    };
    var startViewStrategy = function (options, startClocks) {
        if (startClocks === void 0) { startClocks = (0, browser_core_1.clocksNow)(); }
        bufferApiCalls.add(function () { return startViewStrategy(options, startClocks); });
    };
    var addActionStrategy = function (action, commonContext) {
        if (commonContext === void 0) { commonContext = {
            context: globalContextManager.getContext(),
            user: userContextManager.getContext(),
        }; }
        bufferApiCalls.add(function () { return addActionStrategy(action, commonContext); });
    };
    var addErrorStrategy = function (providedError, commonContext) {
        if (commonContext === void 0) { commonContext = {
            context: globalContextManager.getContext(),
            user: userContextManager.getContext(),
        }; }
        bufferApiCalls.add(function () { return addErrorStrategy(providedError, commonContext); });
    };
    function initRum(initConfiguration) {
        // If we are in a Synthetics test configured to automatically inject a RUM instance, we want to
        // completely discard the customer application RUM instance by ignoring their init() call.  But,
        // we should not ignore the init() call from the Synthetics-injected RUM instance, so the
        // internal `ignoreInitIfSyntheticsWillInjectRum` option is here to bypass this condition.
        if (ignoreInitIfSyntheticsWillInjectRum && (0, browser_core_1.willSyntheticsInjectRum)()) {
            return;
        }
        if ((0, browser_core_1.canUseEventBridge)()) {
            initConfiguration = overrideInitConfigurationForBridge(initConfiguration);
        }
        else if (!canHandleSession(initConfiguration)) {
            return;
        }
        if (!canInitRum(initConfiguration)) {
            return;
        }
        var configuration = (0, configuration_1.validateAndBuildRumConfiguration)(initConfiguration);
        if (!configuration) {
            return;
        }
        if (!configuration.trackViewsManually) {
            doStartRum(initConfiguration, configuration);
        }
        else {
            // drain beforeInitCalls by buffering them until we start RUM
            // if we get a startView, drain re-buffered calls before continuing to drain beforeInitCalls
            // in order to ensure that calls are processed in order
            var beforeInitCalls = bufferApiCalls;
            bufferApiCalls = new browser_core_1.BoundedBuffer();
            startViewStrategy = function (options) {
                doStartRum(initConfiguration, configuration, options);
            };
            beforeInitCalls.drain();
        }
        getInitConfigurationStrategy = function () { return (0, browser_core_1.deepClone)(initConfiguration); };
        isAlreadyInitialized = true;
    }
    function doStartRum(initConfiguration, configuration, initialViewOptions) {
        var startRumResults = startRumImpl(initConfiguration, configuration, function () { return ({
            user: userContextManager.getContext(),
            context: globalContextManager.getContext(),
            hasReplay: recorderApi.isRecording() ? true : undefined,
        }); }, recorderApi, initialViewOptions);
        (startViewStrategy = startRumResults.startView, addActionStrategy = startRumResults.addAction, addErrorStrategy = startRumResults.addError, addTimingStrategy = startRumResults.addTiming, getInternalContextStrategy = startRumResults.getInternalContext);
        bufferApiCalls.drain();
        recorderApi.onRumStart(startRumResults.lifeCycle, configuration, startRumResults.session, startRumResults.viewContexts);
    }
    var startView = (0, browser_core_1.monitor)(function (options) {
        var sanitizedOptions = typeof options === 'object' ? options : { name: options };
        startViewStrategy(sanitizedOptions);
    });
    var rumPublicApi = (0, browser_core_1.makePublicApi)({
        init: (0, browser_core_1.monitor)(initRum),
        /** @deprecated: use setGlobalContextProperty instead */
        addRumGlobalContext: (0, browser_core_1.monitor)(globalContextManager.add),
        setGlobalContextProperty: (0, browser_core_1.monitor)(globalContextManager.setContextProperty),
        /** @deprecated: use removeGlobalContextProperty instead */
        removeRumGlobalContext: (0, browser_core_1.monitor)(globalContextManager.remove),
        removeGlobalContextProperty: (0, browser_core_1.monitor)(globalContextManager.removeContextProperty),
        /** @deprecated: use getGlobalContext instead */
        getRumGlobalContext: (0, browser_core_1.monitor)(globalContextManager.get),
        getGlobalContext: (0, browser_core_1.monitor)(globalContextManager.getContext),
        /** @deprecated: use setGlobalContext instead */
        setRumGlobalContext: (0, browser_core_1.monitor)(globalContextManager.set),
        setGlobalContext: (0, browser_core_1.monitor)(globalContextManager.setContext),
        clearGlobalContext: (0, browser_core_1.monitor)(globalContextManager.clearContext),
        getInternalContext: (0, browser_core_1.monitor)(function (startTime) { return getInternalContextStrategy(startTime); }),
        getInitConfiguration: (0, browser_core_1.monitor)(function () { return getInitConfigurationStrategy(); }),
        addAction: (0, browser_core_1.monitor)(function (name, context) {
            addActionStrategy({
                name: name,
                context: (0, browser_core_1.deepClone)(context),
                startClocks: (0, browser_core_1.clocksNow)(),
                type: "custom" /* CUSTOM */,
            });
        }),
        addError: function (error, context) {
            var handlingStack = (0, browser_core_1.createHandlingStack)();
            (0, browser_core_1.callMonitored)(function () {
                addErrorStrategy({
                    error: error,
                    handlingStack: handlingStack,
                    context: (0, browser_core_1.deepClone)(context),
                    startClocks: (0, browser_core_1.clocksNow)(),
                });
            });
        },
        addTiming: (0, browser_core_1.monitor)(function (name, time) {
            addTimingStrategy(name, time);
        }),
        setUser: (0, browser_core_1.monitor)(function (newUser) {
            if (typeof newUser !== 'object' || !newUser) {
                browser_core_1.display.error('Unsupported user:', newUser);
            }
            else {
                userContextManager.setContext(sanitizeUser(newUser));
            }
        }),
        getUser: (0, browser_core_1.monitor)(userContextManager.getContext),
        setUserProperty: (0, browser_core_1.monitor)(function (key, property) {
            var _a;
            var sanitizedProperty = sanitizeUser((_a = {}, _a[key] = property, _a))[key];
            userContextManager.setContextProperty(key, sanitizedProperty);
        }),
        removeUserProperty: (0, browser_core_1.monitor)(userContextManager.removeContextProperty),
        /** @deprecated: renamed to clearUser */
        removeUser: (0, browser_core_1.monitor)(userContextManager.clearContext),
        clearUser: (0, browser_core_1.monitor)(userContextManager.clearContext),
        startView: startView,
        startSessionReplayRecording: (0, browser_core_1.monitor)(recorderApi.start),
        stopSessionReplayRecording: (0, browser_core_1.monitor)(recorderApi.stop),
    });
    return rumPublicApi;
    function sanitizeUser(newUser) {
        var shallowClonedUser = (0, browser_core_1.assign)(newUser, {});
        if ('id' in shallowClonedUser) {
            shallowClonedUser.id = String(shallowClonedUser.id);
        }
        if ('name' in shallowClonedUser) {
            shallowClonedUser.name = String(shallowClonedUser.name);
        }
        if ('email' in shallowClonedUser) {
            shallowClonedUser.email = String(shallowClonedUser.email);
        }
        return shallowClonedUser;
    }
    function canHandleSession(initConfiguration) {
        if (!(0, browser_core_1.areCookiesAuthorized)((0, browser_core_1.buildCookieOptions)(initConfiguration))) {
            browser_core_1.display.warn('Cookies are not authorized, we will not send any data.');
            return false;
        }
        if (isLocalFile()) {
            browser_core_1.display.error('Execution is not allowed in the current context.');
            return false;
        }
        return true;
    }
    function canInitRum(initConfiguration) {
        if (isAlreadyInitialized) {
            if (!initConfiguration.silentMultipleInit) {
                browser_core_1.display.error('DD_RUM is already initialized.');
            }
            return false;
        }
        return true;
    }
    function overrideInitConfigurationForBridge(initConfiguration) {
        return (0, browser_core_1.assign)({}, initConfiguration, {
            applicationId: '00000000-aaaa-0000-aaaa-000000000000',
            clientToken: 'empty',
            sampleRate: 100,
        });
    }
    function isLocalFile() {
        return window.location.protocol === 'file:';
    }
}
exports.makeRumPublicApi = makeRumPublicApi;
//# sourceMappingURL=rumPublicApi.js.map