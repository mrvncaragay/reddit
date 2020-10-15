import express from 'express';
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql';
import { MikroORM } from '@mikro-orm/core';
//import { Post } from './entities/Post'
import mikroConfig from './mikro-orm.config';
import { PostResolver } from './resolvers/post';


const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver],
      validate: false
    }),

    context: () => ({ em: orm.em }) // allows to expose the object to the resolvers
  });

  apolloServer.applyMiddleware({ app })

  app.listen(8000,() => {
    console.log('server started on localhost:8000...')
  });
}

main().catch((err) => {
  console.error(err)
});