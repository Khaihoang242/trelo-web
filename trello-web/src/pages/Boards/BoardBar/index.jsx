import { Box } from "@mui/material";

export default function BoardBar() {
  return (
    <Box
      sx={{
        backgroundColor: "primary.dark",
        width: "100%",
        height: (theme) => theme.trello?.boardBarHeight || "48px",
        display: "flex",
        alignItems: "center",
        color: "white",
        px: 2,
      }}
    >
      Board Bar
    </Box>
  );
}
