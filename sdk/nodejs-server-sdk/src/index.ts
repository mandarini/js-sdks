// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../types.d.ts'/>
import { DVCOptions } from '../types'
import { DVCClient } from './client'
export { DVCClient } from './client'

export { defaultLogger } from './utils/logger'

export function initialize(environmentKey: string, options?: DVCOptions): DVCClient {
    if (!environmentKey) {
        throw new Error('Missing environment key! Call initialize with a valid environment key')
    }

    return new DVCClient(environmentKey, options)
}
