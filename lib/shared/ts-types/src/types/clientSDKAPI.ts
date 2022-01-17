import { isString } from 'lodash'
import {
    PublicEnvironment, PublicFeature, PublicProject, PublicVariable
} from './configBody'
import { VariableValue } from '@devcycle/shared/mongo/schemas'
import {
    IsEmail, IsDate, IsOptional, IsNumber, IsBoolean,
    IsString, IsIn, IsNotEmpty, IsISO31661Alpha2
} from 'class-validator'
import { Transform, Type } from 'class-transformer'
import 'reflect-metadata'
import { DVCJSON, IsDVCJSONObject } from './dvcJSON'

export const SDKTypeValues = ['client', 'server', 'mobile', 'api']
export type SDKTypes = typeof SDKTypeValues[number]

export type QueryParams = { [key: string]: string }

/**
 * Base API User Schema used by the Bucketing API where the only required field is user_id.
 */
export class DVCAPIUser {
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => isString(value) ? value === 'true' : value)
    isAnonymous?: boolean

    /**
     * Must be defined if `isAnonymous = false`
     */
    @IsString()
    @IsNotEmpty()
    user_id: string

    /**
     * Email used for identifying a device user in the dashboard,
     * or used for audience segmentation.
     */
    @IsEmail()
    @IsOptional()
    email?: string

    /**
     * Name of the user which can be used for identifying a device user,
     * or used for audience segmentation.
     */
    @IsString()
    @IsOptional()
    name?: string

    /**
     * ISO 639-1 two letter codes
     */
    @IsString()
    @IsOptional()
    language?: string

    /**
     * ISO 3166 alpha-2
     */
    @IsISO31661Alpha2()
    @IsOptional()
    country?: string

    /**
     * Application Version, can be used for audience segmentation.
     */
    @IsString()
    @IsOptional()
    appVersion?: string

    /**
     * Application Build, can be used for audience segmentation.
     */
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    appBuild?: number

    /**
     * Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will be logged to DevCycle's servers and available in the dashboard to view.
     */
    @IsDVCJSONObject()
    @IsOptional()
    @Transform(({ value }) => isString(value) ? JSON.parse(value) : value)
    customData?: DVCJSON

    /**
     * Private Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will not be logged to DevCycle's servers and
     * will not be available in the dashboard.
     */
    @IsDVCJSONObject()
    @IsOptional()
    @Transform(({ value }) => isString(value) ? JSON.parse(value) : value)
    privateCustomData?: DVCJSON

    /**
     * Set by SDK automatically
     */
    @IsDate()
    @IsOptional()
    @Transform(({ value }) => value ? new Date(Number(value)) : undefined)
    createdDate?: Date

    /**
     * Set by SDK automatically
     */
    @IsDate()
    @IsOptional()
    @Transform(({ value }) => value ? new Date(Number(value)) : undefined)
    lastSeenDate?: Date

    /**
     * Set by SDK to 'web'
     */
    @IsString()
    @IsOptional()
    platform?: string

    /**
     * Set by SDK to ??
     */
    @IsString()
    @IsOptional()
    platformVersion?: string

    /**
     * Set by SDK to User-Agent
     */
    @IsString()
    @IsOptional()
    deviceModel?: string

    /**
     * SDK type
     */
    @IsString()
    @IsOptional()
    @IsIn(['client', 'server', 'mobile', 'api'])
    @Transform(({ value }) => value)
    sdkType?: SDKTypes = 'api'

    /**
     * SDK Version
     */
    @IsString()
    @IsOptional()
    sdkVersion?: string
}

/**
 * Client API User Schema that extends the base DVCAPIUser schema to add fields
 * from the Client SDKs like: isAnonymous, isDebug.
 * Also changes certain fields to be required from the Client SDKs.
 */
export class DVCClientAPIUser implements DVCAPIUser {
    /**
     * Users must be explicitly defined as anonymous, where the SDK will
     * generate a random `user_id` for them. If they are `isAnonymous = false`
     * a `user_id` value must be provided.
     */
    @IsBoolean()
    @Transform(({ value }) => isString(value) ? value === 'true' : value)
    isAnonymous: boolean

    /**
     * Must be defined if `isAnonymous = false`
     */
    @IsString()
    @IsNotEmpty()
    user_id: string

    /**
     * Email used for identifying a device user in the dashboard,
     * or used for audience segmentation.
     */
    @IsEmail()
    @IsOptional()
    email?: string

    /**
     * Name of the user which can be used for identifying a device user,
     * or used for audience segmentation.
     */
    @IsString()
    @IsOptional()
    name?: string

    /**
     * ISO 639-1 two letter codes
     */
    @IsString()
    @IsOptional()
    language?: string

    /**
     * ISO 3166 alpha-2
     */
    @IsISO31661Alpha2()
    @IsOptional()
    country?: string

    /**
     * Application Version, can be used for audience segmentation.
     */
    @IsString()
    @IsOptional()
    appVersion?: string

    /**
     * Application Build, can be used for audience segmentation.
     */
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    appBuild?: number

    /**
     * Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will be logged to DevCycle's servers and available in the dashboard to view.
     */
    @IsDVCJSONObject()
    @IsOptional()
    @Transform(({ value }) => isString(value) ? JSON.parse(value) : value)
    customData?: DVCJSON

    /**
     * Private Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will not be logged to DevCycle's servers and
     * will not be available in the dashboard.
     */
    @IsDVCJSONObject()
    @IsOptional()
    @Transform(({ value }) => isString(value) ? JSON.parse(value) : value)
    privateCustomData?: DVCJSON

    /**
     * Set by SDK automatically
     */
    @IsDate()
    @Transform(({ value }) => value ? new Date(Number(value)) : undefined)
    createdDate: Date

    /**
     * Set by SDK automatically
     */
    @IsDate()
    @Transform(({ value }) => value ? new Date(Number(value)) : undefined)
    lastSeenDate: Date

    /**
     * Set by SDK to 'web'
     */
    @IsString()
    @IsNotEmpty()
    platform: string

    /**
     * Set by SDK to ??
     */
    @IsString()
    @IsNotEmpty()
    platformVersion: string

    /**
     * Set by SDK to User-Agent
     */
    @IsString()
    @IsNotEmpty()
    deviceModel: string

    /**
     * SDK type
     */
    @IsString()
    @IsIn(['client', 'mobile'])
    sdkType: SDKTypes

    /**
     * SDK Version
     */
    @IsString()
    @IsNotEmpty()
    sdkVersion: string

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => isString(value) ? value === 'true' : value)
    isDebug?: boolean
}

export type SDKVariable = PublicVariable & {
    value: VariableValue
    evalReason?: unknown
}

export type SDKFeature = Pick<PublicFeature, '_id' | 'key' | 'type'> & {
    _variation: string
    evalReason?: unknown
}

export interface BucketedUserConfig {
    /**
     * Project data used for logging
     */
    project: PublicProject

    /**
     * Environment data used for logging
     */
    environment: PublicEnvironment

    /**
     * Mapping of `ClientSDKFeature.key` to `ClientSDKFeature` values.
     * SDK uses this object to log `allBucketedFeatures()`
     */
    features: {
        [key: string]: SDKFeature
    }

    /**
     * Map of `feature._id` to `variation._id` used for event logging.
     */
    featureVariationMap: Record<string, string>

    /**
     * Mapping of `ClientSDKDynamicVariable.key` to `ClientSDKDynamicVariable` values.
     * SDK uses this object to retrieve bucketed values for variables.
     */
    variables: {
        [key: string]: SDKVariable
    }

    /**
     * Hashes `murmurhash.v3(variable.key + environment.apiKey)` of all known variable keys
     * not contained in the `variables` object. This is so the SDK doesn't make
     * requests for new Variables for known variables.
     */
    knownVariableKeys: number[]
}
