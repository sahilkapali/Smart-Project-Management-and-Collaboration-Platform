import type { ChangeEvent } from "react";

import { TextField, type TextFieldProps } from "@mui/material";

interface Props extends Omit<TextFieldProps, "value" | "onChange"> {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const CustomInput = ({ label, value, onChange, ...props }: Props) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      fullWidth
      variant="outlined"
      size="small"
      {...props}
    />
  );
};

export default CustomInput;
