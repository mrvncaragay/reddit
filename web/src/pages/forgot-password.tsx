import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrlClient } from '../utils/createUrqlClient';

const ForgotPassword: React.FC<{}> = ({}) => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <>
              <Box>If an account with that email exists, we send you an email</Box>
              <Button variantColor="blue" variant="link" onClick={() => setComplete(!complete)}>
                try again
              </Button>
            </>
          ) : (
            <Form>
              <InputField name="email" placeholder="email" label="Email" type="email" />
              <Button float="right" mt={4} type="submit" variantColor="blue" variant="outline" isLoading={isSubmitting}>
                Reset password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrlClient)(ForgotPassword);
