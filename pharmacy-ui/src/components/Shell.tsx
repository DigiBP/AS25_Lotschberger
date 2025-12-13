import { AppBar, Toolbar, Typography, Box, Button, Stack } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg"; 

export default function Shell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ gap: 2, py: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ width: 50, height: 50, borderRadius: 0 }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1 }}>
                PharmaLocker
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pharmacy Workflow - Camunda Prototype UI
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1}>
            <Button
              component={Link}
              to="/patient"
              variant={pathname === "/patient" ? "contained" : "text"}
              sx={{ px: 2 }}
            >
              Patient
            </Button>
            <Button
              component={Link}
              to="/pharmacist"
              variant={pathname === "/pharmacist" ? "contained" : "text"}
              sx={{ px: 2 }}
            >
              Pharmacist
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 2 }}>{children}</Box>
    </Box>
  );
}
