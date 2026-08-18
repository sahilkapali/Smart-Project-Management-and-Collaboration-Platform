import { useEffect, useState } from "react";

import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import { ArrowBack } from "@mui/icons-material";

import { useNavigate, useParams } from "react-router-dom";

import { getRepositoryVersions } from "../../services/repository.service";

import type { RepositoryVersion } from "../../types/repository.types";

const RepositoryVersionHistoryPage = () => {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const [versions, setVersions] = useState<RepositoryVersion[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadVersions = async () => {
    if (!id) {
      setError("Repository ID is missing.");

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      const data = await getRepositoryVersions(id);

      setVersions(data);
    } catch (err: any) {
      console.error("Failed to load repository versions:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load repository versions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, [id]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Back
        </Button>

        <Typography variant="h4" fontWeight={700}>
          Version History
        </Typography>
      </Stack>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {!error && versions.length === 0 && (
        <Typography color="text.secondary">
          No repository versions have been created yet.
        </Typography>
      )}

      <Stack spacing={2}>
        {versions.map((version) => (
          <Box
            key={version._id}
            p={2}
            border={1}
            borderColor="divider"
            borderRadius={2}
          >
            <Typography variant="h6" fontWeight={600}>
              {version.versionNumber}
            </Typography>

            <Typography variant="subtitle1">{version.title}</Typography>

            {version.changelog && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                {version.changelog}
              </Typography>
            )}

            {version.commitHash && (
              <Typography variant="body2" mt={1}>
                Commit: {version.commitHash}
              </Typography>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={1}
            >
              Created: {new Date(version.createdAt).toLocaleString()}
            </Typography>

            {version.file && (
              <Button
                href={version.file}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ mt: 1 }}
              >
                View File
              </Button>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default RepositoryVersionHistoryPage;
