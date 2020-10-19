import { InputType, Field } from 'type-graphql';

@InputType()
export class UserInfo {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}
