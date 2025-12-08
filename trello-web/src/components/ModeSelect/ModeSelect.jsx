// src/components/ModeSelect.jsx
import { useColorScheme } from "@mui/material/styles";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";

function ModeSelect() {
  const { mode, setMode } = useColorScheme();

  const handleChange = (event) => {
    setMode(event.target.value);
  };

  return (
    <FormControl size="small" sx={{minWidth:'120px'}}>
      <InputLabel 
      id="label-select-dark-light-mode"
      sx={{color:'white',
      '&.Mui-focused': {color:'white'}}}
      >
      Mode</InputLabel>
      <Select
        labelId="label-select-dark-light-mode"
        id="select-dark-light-mode"
        value={mode || "system"}
        label="Mode"
        onChange={handleChange}
        sx={{
          color:'white',
          '.MuiOutlinedInput-notchedOutline':{ boderColor:'white'},
          '&:hover .MuiOutlinedInput-notchedOutline':{ boderColor:'white'},
          '&.Mui-focused .MuiOutlinedInput-notchedOutline':{ boderColor:'white'},
          '.MuiSvgIcon-root':{color:'white'}
        }}
      >
        <MenuItem value="light">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LightModeIcon fontSize="small" /> Light
          </Box>
        </MenuItem>
        <MenuItem value="dark">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DarkModeOutlinedIcon fontSize="small" /> Dark
          </Box>
        </MenuItem>
        <MenuItem value="system">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SettingsBrightnessIcon fontSize="small" /> System
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  );
}

export default ModeSelect;
