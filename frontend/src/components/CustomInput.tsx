import { TextField } from "@mui/material";

interface Props {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
}

const CustomInput = ({
  label,
  type = "text",
  value,
  onChange,
  error,
  helperText,
}: Props) => {
  return (
    <TextField
      fullWidth
      margin="normal"
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
    />
  );
};

export default CustomInput;