import type { ChangeEvent } from "react";

import { TextField, type TextFieldProps, useTheme } from "@mui/material";

interface Props extends Omit<TextFieldProps, "value" | "onChange"> {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const CustomInput = ({ label, value, onChange, ...props }: Props) => {
  const theme = useTheme();

  const isDarkMode = theme.palette.mode === "dark";

  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      fullWidth
      variant="outlined"
      size="small"
      {...props}
      sx={{
        "& .MuiInputBase-root": {
          color: isDarkMode
            ? theme.palette.text.primary
            : theme.palette.text.primary,

          backgroundColor: isDarkMode
            ? theme.palette.background.paper
            : "#fafafa",
        },

        "& .MuiInputBase-input": {
          color: theme.palette.text.primary,

          WebkitTextFillColor: theme.palette.text.primary,

          "&::placeholder": {
            color: theme.palette.text.secondary,
            opacity: 1,
          },
        },

        "& .MuiInputLabel-root": {
          color: theme.palette.text.secondary,
        },

        "& .MuiInputLabel-root.Mui-focused": {
          color: theme.palette.primary.main,
        },

        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.divider,
        },

        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.text.secondary,
        },

        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: theme.palette.primary.main,
          },

        "& .MuiInputBase-input:-webkit-autofill": {
          WebkitTextFillColor: theme.palette.text.primary,
          WebkitBoxShadow: `0 0 0 1000px ${
            isDarkMode ? theme.palette.background.paper : "#fafafa"
          } inset`,
          transition: "background-color 5000s ease-in-out 0s",
        },

        ...props.sx,
      }}
    />
  );
};

export default CustomInput;
