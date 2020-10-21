import { Post } from '../entities/Post';
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Field,
  InputType,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
  Info,
} from 'type-graphql';
import { MyContext } from 'src/types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit) + 1; // fetch num limit posts + 1, if more than it then it has more but less than it does not

    const replacements: any[] = [realLimit];

    if (cursor) {
      replacements.push(new Date(cursor));
    }

    const posts = await getConnection().query(
      `
select p.*, 
json_build_object(
  'id', u.id,
  'username', u.username,
  'email', u.email
) creator
from post p
inner join public.user u on u.id = p."creatorId"
${cursor ? `where p."createdAt" < $2` : ''}
order by p."createdAt" DESC
limit $1 
    `,
      replacements,
    );

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder('p')
    //   .innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', 'DESC')
    //   .take(realLimit);

    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', { cursor: new Date(cursor) });
    // }

    //const posts = await qb.getMany();
    // give user posts - 1

    return { posts: posts.slice(0, realLimit - 1), hasMore: posts.length === realLimit };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id') id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  createPost(@Arg('input') input: PostInput, @Ctx() { req }: MyContext): Promise<Post> {
    // 2 sql queries
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne(id);

    if (!post) {
      return null;
    }

    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
