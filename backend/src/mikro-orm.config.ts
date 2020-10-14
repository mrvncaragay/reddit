import { __prod__ } from './constants';
import { Post } from './entities/Post';
import { MikroORM } from '@mikro-orm/core';
import path from 'path';

const config = {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post],
  dbName: 'reddit',
  type: 'postgresql',
  user: 'root',
  password: 'Password',
  debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];

export default config;