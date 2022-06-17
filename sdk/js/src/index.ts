import {
    DVCOptions,
    DVCUser
} from './types'
import { DVCPopulatedUser } from './User'
import { DVCClient } from './Client'

export * from './types'

export const initialize = (environmentKey: string, user: DVCUser, options: DVCOptions = {}): DVCClient => {
    // TODO: implement logger
    if (typeof window === 'undefined') {
        console.warn('Window is not defined, try initializing in a browser context')
    }

    if (typeof window !== 'undefined' && !window.addEventListener && !options?.reactNative) {
        throw new Error('Window is not defined, try initializing in a browser context.' +
            ' If running on React Native, initialize with the option reactNative: true')
    }

    if (options?.reactNative && !globalThis.DeviceInfo) {
        throw new Error('DeviceInfo is not defined. ' +
            'Import react-native-device-info and set global.DeviceInfo when running on React Native')
    }

    if (!environmentKey) {
        throw new Error('Missing environment key! Call initialize with a valid environment key')
    }

    if (!options || options === null) {
        throw new Error('Invalid options! Call initialize with valid options')
    }

    const dvcUser = new DVCPopulatedUser(user, options)
    const client = new DVCClient(environmentKey, dvcUser, options)

    client.onClientInitialized()
        .then(() => client.logger.info('Successfully initialized DevCycle!'))
        .catch((err) => client.logger.error(`Error initializing DevCycle: ${err}`))

    if (!options?.reactNative && typeof window !== 'undefined') {
        window.addEventListener('pagehide', () => {
            client.flushEvents()
        })
    }

    return client
}

export default { initialize }
