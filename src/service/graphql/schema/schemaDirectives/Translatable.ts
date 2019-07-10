import { defaultFieldResolver, GraphQLField } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import { prop } from 'ramda'

import { ServiceContext } from '../../../typings'
import { messagesLoader } from '../messagesLoader'

export class Translatable extends SchemaDirectiveVisitor {
  public visitFieldDefinition (field: GraphQLField<any, ServiceContext>) {
    const { resolve = defaultFieldResolver } = field
    field.resolve = async (root, args, context, info) => {
      const { clients: { segment }, clients } = context
      if (!context.loaders || !context.loaders.messages) {
        context.loaders = {
          ...context.loaders,
          messages: messagesLoader(clients),
        }
      }

      const response = await resolve(root, args, context, info)

      // Messages only knows how to process non empty strings.
      if ((typeof response !== 'string' && typeof response !== 'object') || Array.isArray(response) || response == null) {
        return response
      }

      const resObj = typeof response === 'string'
        ? {
          content: response,
          description: '',
          from: undefined,
          id: response,
        }
        : response
      const { content, from, id } = resObj
      const to = await segment.getSegment().then(prop('cultureInfo'))

      if (!content && !id) {
        throw new Error(`@translatable directive needs a content or id to translate, but received ${JSON.stringify(response)}`)
      }

      // If the message is already in the target locale, return the content.
      if (!to || from === to) {
        return content
      }

      return context.loaders.messages!.load({
        ...resObj,
        from,
        to,
      })
    }
  }
}