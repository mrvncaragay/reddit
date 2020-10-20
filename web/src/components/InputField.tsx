import React, { InputHTMLAttributes } from 'react';
import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/core';
import { useField } from 'formik';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  textarea?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({ label, textarea, size: _, ...props }) => {
  const [field, { error }] = useField(props);
  let InputType = Input;

  if (textarea) {
    InputType = Textarea;
  }
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputType {...field} {...props} id={field.name} placeholder={props.placeholder} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};

export default InputField;
