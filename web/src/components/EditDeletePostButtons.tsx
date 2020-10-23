import React from 'react';
import { Box, IconButton, Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({ id, creatorId }) => {
  const [, deletePost] = useDeletePostMutation();
  const [{ data: currentUser }] = useMeQuery();

  if (currentUser?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Box>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton as={Link} mr={4} variantColor="gray" icon="edit" aria-label="Edit Post" />
      </NextLink>
      <IconButton icon="delete" aria-label="Delete Post" onClick={() => deletePost({ id: id })} />
    </Box>
  );
};

export default EditDeletePostButtons;
