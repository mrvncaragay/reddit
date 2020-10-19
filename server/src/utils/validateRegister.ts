import { UserInfo } from '../resolvers/UserInfo';

export const validateRegister = (options: UserInfo) => {
  if (!options.email.includes('@')) {
    return [{ field: 'email', message: 'Invalid Email.' }];
  }
  if (options.username.includes('@')) {
    return [{ field: 'username', message: 'Username must not include @' }];
  }

  if (options.username.length <= 2) {
    return [{ field: 'username', message: 'Username length must be greater than 2.' }];
  }

  if (options.password.length <= 2) {
    return [{ field: 'password', message: 'Password length must be greater than 2.' }];
  }

  return null;
};
