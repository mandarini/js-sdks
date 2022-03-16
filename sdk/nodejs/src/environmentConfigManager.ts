import { AxiosResponse } from 'axios'
import { ConfigBody } from '@devcycle/types'
import { DVCLogger, DVCOptions } from './types'
import { getEnvironmentConfig } from './request'
import { plainToClass } from 'class-transformer'

type ConfigPollingOptions = DVCOptions & {
    cdnURI?: string
}

export class EnvironmentConfigManager {
    private readonly logger: DVCLogger
    private readonly environmentKey: string
    config?: ConfigBody
    configEtag?: string
    private readonly pollingIntervalMS: number
    private readonly requestTimeoutMS: number
    private readonly cdnURI: string
    fetchConfigPromise: Promise<void>
    private intervalTimeout: NodeJS.Timeout

    constructor(
        logger: DVCLogger,
        environmentKey: string,
        {
            configPollingIntervalMS = 10000,
            configPollingTimeoutMS = 5000,
            cdnURI = 'https://config-cdn.devcycle.com'
        }: ConfigPollingOptions
    ) {
        this.logger = logger
        this.environmentKey = environmentKey
        this.pollingIntervalMS = configPollingIntervalMS >= 1000
            ? configPollingIntervalMS
            : 1000
        this.requestTimeoutMS = configPollingTimeoutMS >= this.pollingIntervalMS
            ? this.pollingIntervalMS
            : configPollingTimeoutMS
        this.cdnURI = cdnURI

        this.fetchConfigPromise = this._fetchConfig().then(() => {
            this.logger.debug('DevCycle initial config loaded')
        })
        this.intervalTimeout = setInterval(() => this._fetchConfig(), this.pollingIntervalMS)
    }

    cleanup(): void {
        clearInterval(this.intervalTimeout)
    }

    getConfigURL(): string {
        return `${this.cdnURI}/config/v1/server/${this.environmentKey}.json`
    }

    async _fetchConfig(): Promise<void> {
        const url = this.getConfigURL()
        let res: AxiosResponse<ConfigBody> | null
        try {
            this.logger.debug(`Requesting new config for ${url}, etag: ${this.configEtag}`)
            res = await getEnvironmentConfig(url, this.requestTimeoutMS, this.configEtag)
            this.logger.debug(`Downloaded config, status: ${res?.status}, etag: ${res?.headers?.etag}`)
        } catch (ex) {
            this.logger.error(`Request to get config failed for url: ${url}, ` +
                `response message: ${ex.message}, response data ${ex?.response?.data}`)
            res = null
        }

        if (res?.status === 304) {
            this.logger.debug(`Config not modified, using cache, etag: ${this.configEtag}`)
        } else if (res?.status === 200) {
            this.config = res?.data ? plainToClass(ConfigBody, res.data): undefined
            this.configEtag = res?.headers?.etag
        } else if (this.config) {
            this.logger.error(`Failed to download config, using cached version. url: ${url}.`)
        } else {
            throw new Error('Failed to download DevCycle config.')
        }
    }
}