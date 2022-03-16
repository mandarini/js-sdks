export interface DVCUser {
    /**
     * Identifies the current user. Must be defined
     */
    user_id: string

    /**
     * Email used for identifying a device user in the dashboard,
     * or used for audience segmentation.
     */
    email?: string

    /**
     * Name of the user which can be used for identifying a device user,
     * or used for audience segmentation.
     */
    name?: string

    /**
     * ISO 639-1 two letter codes, or ISO 639-2 three letter codes
     */
    language?: string

    /**
     * ISO 3166 two or three letter codes
     */
    country?: string

    /**
     * Application Version, can be used for audience segmentation.
     */
    appVersion?: string

    /**
     * Application Build, can be used for audience segmentation.
     */
    appBuild?: number

    /**
     * Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will be logged to DevCycle's servers and available in the dashboard to view.
     */
    customData?: JSON

    /**
     * Private Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will not be logged to DevCycle's servers and
     * will not be available in the dashboard.
     */
    privateCustomData?: JSON
}

/**
 * Initialize the SDK
 * @param environmentKey
 * @param options
 */
export type initialize = (
    environmentKey: string,
    options?: DVCOptions
) => Promise<DVCClient>

/**
 * Options to control the setup of the DevCycle NodeJS Server SDK.
 */
export interface DVCOptions {
    /**
     * Logger override to replace default logger
     */
    logger?: DVCLogger

    /**
     * Controls the polling interval in milliseconds to fetch new environment config changes, defaults to 10 seconds.
     * @min 1000
     */
    configPollingIntervalMS?: number

    /**
     * Controls the request timeout to fetch new environment config changes, defaults to 5 seconds,
     * must be less than the configPollingIntervalMS value.
     * @min 1000
     */
    configPollingTimeoutMS?: number

    /**
     * Controls the interval between flushing events to the DevCycle servers, defaults to 30 seconds.
     */
    flushEventsMS?: number

    /**
     * Disables logging of any events or user data to DevCycle.
     */
    disableEventLogging?: boolean
}

export interface DVCClient {
    /**
     * Notify the user when Features have been loaded from the server.
     * An optional callback can be passed in, and will return a promise if no callback has been passed in.
     *
     * @param onInitialized
     */
    onClientInitialized(onInitialized?: (err?: Error) => void): Promise<DVCClient>

    /**
     * Grab variable values associated with Features. Use the key created in the dashboard to fetch
     * the variable value. If the user does not receive the feature, the default value is used in the DVCVariable.
     * DVCVariable is returned, which has a `value` property that is used to grab the variable value.
     *
     * @param key
     * @param user
     * @param defaultValue
     */
    variable(
        user: DVCUser,
        key: string,
        defaultValue: DVCVariableValue
    ): DVCVariable

    /**
     * Retrieve all data on all Features, Object mapped by feature `key`.
     * Use the `DVCFeature.segmented` value to determine if the user was segmented into a
     * feature's audience.
     */
    allFeatures(user: DVCUser): DVCFeatureSet

    /**
     * Retrieve all data on all Variables, Object mapped by feature `key`.
     */
    allVariables(user: DVCUser): DVCVariableSet

    /**
     * Track Event to DVC
     *
     * @param user
     * @param event
     */
    track(user: DVCUser, event: DVCEvent): void

    /**
     * Flush all queued events to DVC
     *
     * @param callback
     */
    flushEvents(callback?: () => void): Promise<void>
}

export type DVCVariableValue = string | number | boolean | JSON
export type JSON = { [key: string]: string | number | boolean }

export type DVCVariableSet = Record<string,
    Omit<DVCVariable, 'defaultValue' | 'isDefaulted'> & { _id: string }
>

export interface DVCVariable {
    /**
     * Unique "key" by Project to use for this Dynamic Variable.
     */
    readonly key: string

    /**
     * The value for this Dynamic Variable which will be set to the `defaultValue`
     * if accessed before the SDK is fully Initialized
     */
    readonly value: DVCVariableValue

    /**
     * Default value set when creating the variable
     */
    readonly defaultValue: DVCVariableValue

    /**
     * If the `variable.value` is set to use the `defaultValue` this will be `true`.
     */
    readonly isDefaulted: boolean

    /**
     * The data type of this Dynamic variable, which will be one of:
     * String, Number, Boolean, JSON
     */
    readonly type?: 'String' | 'Number' | 'Boolean' | 'JSON'

    /**
     * Evaluation Reason as to why the variable was segmented into a specific Feature and
     * given this specific value
     */
    readonly evalReason?: unknown
}

export interface DVCEvent {
    /**
     * type of the event
     */
    type: string

    /**
     * date event occurred according to client stored as time since epoch
     */
    date?: number

    /**
     * target / subject of event. Contextual to event type
     */
    target?: string

    /**
     * value for numerical events. Contextual to event type
     */
    value?: number

    /**
     * extra metadata for event. Contextual to event type
     */
    metaData?: Record<string, unknown>
}

export interface DVCFeature {
    readonly _id: string

    readonly key: string

    readonly type: string

    readonly evalReason?: unknown
}

export type DVCFeatureSet = Record<string, DVCFeature>

export interface DVCLogger {
    error(message: string): void

    warn(message: string): void

    info(message: string): void

    debug(message: string): void
}

export type DVCDefaultLoggerOptions = {
    level?: 'debug' | 'info' | 'warn' | 'error'

    logWriter?: (message: string) => void
}

export type defaultLogger = (options?: DVCDefaultLoggerOptions) => DVCLogger