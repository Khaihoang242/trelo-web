import { Box, } from "@mui/material";
import Chip from '@mui/material/Chip';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import BoltIcon from '@mui/icons-material/Bolt';
import FilterListIcon from '@mui/icons-material/FilterList';
import Button from "@mui/material/Button";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { capitalizeFirstLetter } from "~/utils/formatters";
import BoardUserGroup from "./BoardUserGroup";
import InviteBoardUser from "./InviteBoardUser";
const MENU_STYLES={
  color:'white',
    bgcolor:'transparent',
    border:'none',
    paddingX:'5px',
    borderRadius:'4px',
    '.MuiSvgIcon-root':{
      color:'white',
      '&:hover':{
        bgcolor:'primary.50'
      }
    }
}
export default function BoardBar({board}) {
  return (
    <Box 
     sx={{ justifyContent:'space-between',
        gap:2,
        overflowX:'auto',
        width: "100%",
        height: (theme) => theme.trello?.boardBarHeight,
        display: "flex",
        alignItems: "center",
        paddingX: 2,
        bgcolor:(theme)=>(
          theme.palette.mode ==='dark'? '#34495e':'#1976d2'
        )}}>
      <Box sx={{ display:'flex', alignItems:'center', gap:2}}>
      <Chip sx={MENU_STYLES}
      icon={<DashboardIcon />} 
      label={board?.title} 
      clickable/>
      <Chip sx={MENU_STYLES}
      icon={<VpnLockIcon />} 
      label={capitalizeFirstLetter(board?.type)}  
      clickable/>
      <Chip sx={MENU_STYLES}
      icon={<AddToDriveIcon />} 
      label="Add To Google Drive" 
      clickable/>
      <Chip sx={MENU_STYLES}
      icon={<BoltIcon />} 
      label="Automation" 
      clickable/>
        <Chip sx={MENU_STYLES}
      icon={<FilterListIcon />} 
      label="Filters" 
      clickable/>
      </Box>
      <Box sx={{ display:'flex', alignItems:'center', gap:2}}>
      {/* // xu li moi user vao lam thanh vien cua board */}
        <InviteBoardUser boardId = {board._id} />
   

      <BoardUserGroup boardUsers={board?.FE_allUsers}/>


</Box>
  
    </Box>
  );
}
