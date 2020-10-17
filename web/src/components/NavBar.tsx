import { useMeQuery } from '../generated/graphql';
import { Box, Flex, Link, Button } from '@chakra-ui/core';
import NextLink from 'next/link';

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  let registerLoginLink = null;

  // data is fe
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
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button variant="link">Logout</Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tomato" padding={4} ml={'auto'}>
      <Box ml={'auto'}>{registerLoginLink}</Box>
    </Flex>
  );
};

export default NavBar;
