import React from 'react';
import { Formik, Form } from 'formik';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { Box, Button } from '@chakra-ui/core';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrlClient } from '../utils/createUrqlClient';

const Login: React.FC<unknown> = ({}) => {
  const router = useRouter();

  const [, login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          console.log(response);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            // login work
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username" placeholder="username" label="Username" />
            <Box mt={4}>
              <InputField name="password" placeholder="password" label="Password" type="password" />
            </Box>
            <Button float="right" mt={4} type="submit" variantColor="blue" variant="outline" isLoading={isSubmitting}>
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrlClient)(Login);
