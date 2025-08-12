import { Box } from "@mui/material";

export default function BoardContent() {
  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        width: "100%",
        height: (theme) =>
          `calc(100vh - ${theme.trello?.appBarHeight} - ${
            theme.trello?.boardBarHeight
          })`,
        display: "flex",
        alignItems: "center",

        color: "white",
      }}
    >
      Board Content
    </Box>
  );
}
