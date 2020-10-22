import { Entity, BaseEntity, ManyToOne, PrimaryColumn, Column } from 'typeorm';
import { ObjectType } from 'type-graphql';
import { User } from './User';
import { Post } from './Post';

// m to n
// many to many
// user <-> posts
// user -> join tabke <- posts
// user -> updoot <- posts

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Column({ type: 'int' })
  value: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.updoots)
  user: User;

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => Post, (post) => post.updoots)
  post: Post;
}
