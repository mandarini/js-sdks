import { createContext } from 'react'
import type { DVCClient } from '@devcycle/devcycle-js-sdk'

interface DVCContext {
  client?: DVCClient
}

const context = createContext<DVCContext>({ client: undefined })
const { Provider, Consumer } = context

export { Provider, Consumer, DVCContext }
export default context
