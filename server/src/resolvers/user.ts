import { User } from '../entities/User';
import { MyContext } from 'src/types';
import { Resolver, Ctx, Arg, Mutation, Field, Query, ObjectType } from 'type-graphql';
import argon2 from 'argon2';
import { COOKIE_NAME } from '../constants';
import { UserInfo } from './UserInfo';
import { validateRegister } from '../utils/validateRegister';

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
  async register(
    @Arg('options') options: UserInfo,
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    // handle email or username exists
    // const validUser = await em.findOne(User, {
    //   username: options.username,
    //   email: options.email,
    // });

    // if (validUser) {
    //   return {
    //     errors: [{ field: 'username', message: 'That username is taken.' }],
    //   };
    // }

    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      email: options.email,
      password: hashedPassword,
    });
    await em.persistAndFlush(user);

    // store user id session
    // this will set a cookie on the user to automaticly log them in after registering
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    console.log('dsadsa', usernameOrEmail, password);
    const user = await em.findOne(
      User,
      usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail },
    );

    if (!user) {
      return {
        errors: [{ field: 'usernameOrEmail', message: 'That username or email does not exist.' }],
      };
    }

    const valid = await argon2.verify(user.password, password);

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

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        // remove both cookie and session in Redis
        res.clearCookie(COOKIE_NAME);
        resolve(true);
      }),
    );
  }
}
