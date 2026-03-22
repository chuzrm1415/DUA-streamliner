import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Link from "next/link";
import { auth } from "@/auth/auth.config";

/**
 * Page – Main dashboard.
 * Shows a welcome message and the primary CTA to start DUA generation.
 */
export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? "User";

  return (
    <Box className="flex flex-col gap-6">
      {/* Header */}
      <Box className="flex items-center justify-between flex-wrap gap-3">
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Welcome, {userName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and generate DUA documents from your uploaded files.
          </Typography>
        </Box>

        <Button
          component={Link}
          href="/protected/document-processing"
          variant="contained"
          size="large"
          startIcon={<AddCircleOutlineIcon />}
        >
          Generate DUA
        </Button>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={3}>
        {SUMMARY_CARDS.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  {card.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent activity placeholder */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Sessions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {/* TODO: fetch recent sessions via TanStack Query */}
            No recent sessions. Start by clicking &quot;Generate DUA&quot;.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

const SUMMARY_CARDS = [
  { label: "Total DUAs", value: "—" },
  { label: "Pending Review", value: "—" },
  { label: "Completed Today", value: "—" },
  { label: "Errors", value: "—" },
];
