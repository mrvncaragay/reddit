import { User } from '../entities/User';
import { MyContext } from 'src/types';
import { Resolver, Ctx, Arg, Mutation, InputType, Field, Query, ObjectType } from 'type-graphql';
import argon2 from 'argon2';

@InputType()
class UserInfo {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext): Promise<User | null> {
    // User not log in
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Query(() => [User])
  users(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {});
  }

  @Mutation(() => UserResponse)
  async register(@Arg('options') options: UserInfo, @Ctx() { em, req }: MyContext): Promise<UserResponse> {
    const validUser = await em.findOne(User, { username: options.username });

    if (validUser) {
      return {
        errors: [{ field: 'username', message: 'That username is taken.' }],
      };
    }

    if (options.username.length <= 2) {
      return {
        errors: [{ field: 'username', message: 'Username length must be greater than 2.' }],
      };
    }

    if (options.password.length <= 5) {
      return {
        errors: [{ field: 'password', message: 'Password length must be greater than 5.' }],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    await em.persistAndFlush(user);

    // store user id session
    // this will set a cookie on the user to automaticly log them in after registering
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(@Arg('options') options: UserInfo, @Ctx() { em, req }: MyContext): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });

    if (!user) {
      return {
        errors: [{ field: 'username', message: 'That username does not exist.' }],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [{ field: 'password', message: 'Incorrect password.' }],
      };
    }

    // save user id to the session object
    req.session.userId = user.id;

    return {
      user,
    };
  }
}
