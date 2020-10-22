import React from 'react';
import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/core';
import { PostObjectFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
  post: PostObjectFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [, vote] = useVoteMutation();

  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center" mr={4}>
      <IconButton
        variantColor={post.voteStatus === 1 ? 'green' : undefined}
        icon="chevron-up"
        aria-label="Upvote Post"
        onClick={() => {
          if (post.voteStatus === 1) {
            return;
          }
          vote({ postId: post.id, value: 1 });
        }}
      />
      {post.points}
      <IconButton
        variantColor={post.voteStatus === -1 ? 'red' : undefined}
        icon="chevron-down"
        aria-label="DownVote Post"
        onClick={() => {
          if (post.voteStatus === -1) {
            return;
          }

          vote({ postId: post.id, value: -1 });
        }}
      />
    </Flex>
  );
};

export default UpdootSection;
