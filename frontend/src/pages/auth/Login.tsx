import { Box, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";

const Login = () => {
  return (
    <AuthLayout>
      <Typography variant="h4" textAlign="center" mb={1}>
        Welcome Back
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        mb={4}
      >
        Sign in to Smart Project Management
      </Typography>

      <CustomInput label="Email Address" />

      <CustomInput
        label="Password"
        type="password"
      />

      <CustomButton>
        Login
      </CustomButton>

      <Box mt={3} textAlign="center">
        <Link
          component={RouterLink}
          to="/forgot-password"
          underline="hover"
        >
          Forgot Password?
        </Link>
      </Box>

      <Box mt={2} textAlign="center">
        <Typography variant="body2">
          Don't have an account?{" "}
          <Link
            component={RouterLink}
            to="/register"
            underline="hover"
          >
            Register
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default Login;
