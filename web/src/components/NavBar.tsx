import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Box, Flex, Link, Button, Heading } from '@chakra-ui/core';
import NextLink from 'next/link';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({ pause: isServer() }); // not run on the server
  let registerLoginLink = null;

  if (fetching) {
    registerLoginLink = null;
    // user not logged in
  } else if (!data?.me) {
    registerLoginLink = (
      <>
        <NextLink href="/login">
          <Link color="white" mr={2}>
            Login
          </Link>
        </NextLink>

        <NextLink href="/register">
          <Link color="white">Register</Link>
        </NextLink>
      </>
    );

    // user is logged in
  } else {
    registerLoginLink = (
      <Flex alignItems="center">
        <NextLink href="/create-post">
          <Button mr={4} as={Link}>
            create post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button variant="link" onClick={() => logout()} isLoading={logoutFetching}>
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex alignItems="center" justifyContent="center" position="sticky" top={0} zIndex={1} bg="tomato" padding={4}>
      <Flex maxW={800} flex={1} alignItems="center">
        <NextLink href="/">
          <Link>
            <Heading>TheReddit</Heading>
          </Link>
        </NextLink>

        <Box ml={'auto'}>{registerLoginLink}</Box>
      </Flex>
    </Flex>
  );
};

export default NavBar;
