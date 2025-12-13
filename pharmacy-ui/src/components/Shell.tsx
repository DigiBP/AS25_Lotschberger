import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

export default function Shell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={1} color="default">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Pharmacy Workflow
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Button component={Link} to="/patient" variant={pathname === "/patient" ? "contained" : "text"}>
            Patient
          </Button>
          <Button component={Link} to="/pharmacist" variant={pathname === "/pharmacist" ? "contained" : "text"}>
            Pharmacist
          </Button>
        </Toolbar>
      </AppBar>

      {children}
    </Box>
  );
}
