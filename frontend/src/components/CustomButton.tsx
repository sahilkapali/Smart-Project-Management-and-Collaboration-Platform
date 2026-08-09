import { Button, CircularProgress } from "@mui/material";
import type{ ReactNode } from "react";

interface Props {
  children: ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

const CustomButton = ({
  children,
  loading = false,
  onClick,
}: Props) => {
  return (
    <Button
      fullWidth
      variant="contained"
      size="large"
      disabled={loading}
      onClick={onClick}
      sx={{
        mt: 3,
        py: 1.5,
        borderRadius: 2,
      }}
    >
      {loading ? (
        <CircularProgress
          size={24}
          color="inherit"
        />
      ) : (
        children
      )}
    </Button>
  );
};

export default CustomButton;