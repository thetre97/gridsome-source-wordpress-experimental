// Packages
import { createSchema } from './schema'
import { excludedFields, excludedTypes, reporter, createTimer } from './utils'
import { importData } from './data'
import { contentActions } from './content'

export interface SourceOptions {
  typeName: string
  baseUrl: string
  log: boolean
  concurrency: number
  images: boolean | { original: boolean; cache: boolean; folder: string }
  content: boolean | { images: boolean; links: boolean }
}

const GridsomeSourceWordPress = (api: any, config: SourceOptions) => {
  const { typeName = 'WordPress', baseUrl = '', log = false, concurrency = 8 } = config

  if (!baseUrl) throw new Error('Missing the `baseUrl` config option.')
  if (!typeName) throw new Error('Missing the `typeName` config option.')
  const timer = createTimer(log)

  api.loadSource(async (actions: any) => {
    const runtimeTimer = timer()

    const scalarTypes = ['String', 'Int', 'Float', 'Boolean', 'ID']
    const prefix = (name: string) => (scalarTypes.includes(name) ? name : `${typeName}${name}`)

    const utils = { baseUrl, typeName, prefix, concurrency, log, timer, perPage: 100, excluded: { fields: excludedFields, types: excludedTypes } }

    // Create Schema
    try {
      const schema = await createSchema(actions, utils)

      const data = await importData(schema, actions, utils)

      await contentActions(data, actions, { config, utils })
    } catch (error) {
      reporter.error(error.message)
    }

    if (log) reporter.success('Finished adding WordPress schema')
    runtimeTimer.log('Finished adding schema & data in %s')
  })
}

module.exports = GridsomeSourceWordPress
