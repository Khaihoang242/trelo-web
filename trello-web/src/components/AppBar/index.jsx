import Box from "@mui/material/Box";

import ModeSelect from "../../components/ModeSelect";
export default function AppBar() {
  return (
    <Box
      sx={{
        backgroundColor: "primary.light",
        width: "100%",
        height: (theme) => theme.trello?.appBarHeight || "48px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <ModeSelect />
    </Box>
  );
}
