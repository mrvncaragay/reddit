import { cacheExchange } from '@urql/exchange-graphcache';
import { dedupExchange, Exchange, fetchExchange } from 'urql';
import { betterUpdateQuery } from './betterUpdateQuery';
import {
  DeletePostMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from '../generated/graphql';
import { pipe, tap } from 'wonka';
import Router from 'next/router';

import { stringifyVariables } from '@urql/core';
import { Resolver, Variables, NullArray } from '../types';
import gql from 'graphql-tag';
import { isServer } from './isServer';

export interface PaginationParams {
  offsetArgument?: string;
  limitArgument?: string;
}

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItinTheCache = cache.resolve(cache.resolveFieldByKey(entityKey, fieldKey) as string, 'posts');
    info.partial = !isItinTheCache;

    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, 'posts') as string[];
      const _hasMore = cache.resolve(key, 'hasMore');

      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results,
    };
  };
};

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error) {
        if (error?.message.includes('Not authenticated')) {
          Router.replace('/login');
        }
      }
    }),
  );
};

export const createUrlClient = (ssrExchange: any, ctx: any) => {
  let cookie = '';
  if (isServer()) {
    cookie = ctx.req.headers.cookie;
  }

  return {
    url: 'http://localhost:8000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (_result, args, cache, info) => {
              cache.invalidate({ __typename: 'Post', id: (args as DeletePostMutationVariables).id });
            },
            vote: (_result, args, cache, info) => {
              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                  }
                `,
                { id: postId } as any,
              );

              if (data) {
                if (data.voteStatus === value) {
                  return;
                }
                const newPoint = (data.points as number) + (!data.voteStatus ? 1 : 2) * value;

                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoint, voteStatus: value } as any,
                );
              }
            },
            createPost: (_result, args, cache, info) => {
              const allFields = cache.inspectFields('Query');
              const fieldInfos = allFields.filter((info) => info.fieldName === 'posts');
              fieldInfos.forEach((fi) => {
                cache.invalidate('Query', 'posts', fi.arguments || {});
              });
            },
            login: (_result, arges, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(cache, { query: MeDocument }, _result, (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              });
            },

            register: (_result, arges, cache, info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(cache, { query: MeDocument }, _result, (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              });
            },

            logout: (_result, arges, cache, info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(cache, { query: MeDocument }, _result, () => ({ me: null }));
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
