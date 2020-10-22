import React, { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import { createUrlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';
import Layout from '../components/Layout';
import NextLink from 'next/link';
import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from '@chakra-ui/core';
import UpdootSection from '../components/UpdootSection';

const Index = () => {
  const [variables, setVariables] = useState({ limit: 10, cursor: null as string | null });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>No posts yet</div>;
  }

  return (
    <Layout>
      <Flex align="center">
        <Heading>The Reddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">create post</Link>
        </NextLink>
      </Flex>
      <br />
      {fetching && !data ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) => (
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={p} />
              <Box>
                <Heading fontSize="xl">{p.title}</Heading> <Text fontSize={12}>posted by {p.creator.username}</Text>
                <Text mt={4}>{p.textSnippet}</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}

      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            isLoading={fetching}
            m="auto"
            my={8}
            onClick={() => {
              setVariables({ limit: variables.limit, cursor: data.posts.posts[data.posts.posts.length - 1].createdAt });
            }}
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrlClient, { ssr: true })(Index);
