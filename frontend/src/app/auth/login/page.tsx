"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
<parameter name="file_text">"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { signIn } from "next-auth/react";

/**
 * Page – Login screen.
 * Delegates authentication entirely to Azure Entra ID via NextAuth.
 */
export default function LoginPage() {
  return (
    <Box
      className="flex min-h-screen items-center justify-center bg-slate-100"
      sx={{ p: 2 }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo / title */}
          <Box className="flex flex-col items-center gap-2 mb-6">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h5" fontWeight={700} color="white">
                D
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              DUA Generator
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Automated customs document generation
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* SSO button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/protected/dashboard" })}
            sx={{ py: 1.5 }}
          >
            Sign in with Microsoft
          </Button>

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
            Single Sign-On via Azure Entra ID · MFA enforced
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
