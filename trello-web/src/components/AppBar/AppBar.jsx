
import Box from "@mui/material/Box";
import ModeSelect from "~/components/ModeSelect/ModeSelect";
import AppsIcon from '@mui/icons-material/Apps';
import { ReactComponent as TrelloLogo} from '~/assets/trello.svg'
import { SvgIcon, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import Workspaces from "./Menu/Workspaces";
import Recent from "./Menu/Recent";
import Starred from "./Menu/Starred";
import Templates from "./Menu/Templates";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Profiles from "./Menu/Profiles";
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { Link } from "react-router-dom";
import Notifications from "./Notifications/Notifications";
import AutoCompleteSearchBoard from "./SearchBoards/AutoCompleteSearchBoard";
export default function AppBar() {
  return (
    <Box px={2}
      sx={{
        width: "100%",
        height: (theme) => theme.trello?.appBarHeight || "48px",
        display: "flex",
        alignItems: "center",
        justifyContent:'space-between',
        gap:2,
        overflowX:'auto',
        bgcolor:(theme)=>(
          theme.palette.mode ==='dark'? '#2c3e50':'#1565c0'
        )
      }}
    >
    <Box sx={{ display:'flex', alignItems:'center', gap:2}}>
    <Link to ='/boards'>
      <Tooltip title = "Board List">
      <AppsIcon sx={{ color:'white', verticalAlign:'middle'}}/>
      </Tooltip>
      </Link>
    <Link to='/'>
        <Box sx={{ display:'flex', alignItems:'center', gap:0.5}}>
        <SvgIcon component={TrelloLogo}  inheritViewBox  fontSize='small' sx={{ color:'white'}}/>
        <Typography variant='span' sx={{ fontSize: '1.2rem', fontWeight:'bold', color:'white'}}>Trello</Typography>
        </Box>
    </Link>
    
    <Box sx={{ display: { xs: 'none', md:'flex'}, gap:1}}>
    <Workspaces/>
    <Recent/>
    <Starred/>
    <Templates/>
    <Button 
    sx={{
      color:'white',
      border:'none',
      '&:hover':{ boder:'none'}
      }}
    variant="outlined" 
    startIcon={<LibraryAddIcon/>}
    >Create</Button>
    </Box>
    </Box>
    <Box sx={{ display:'flex', alignItems:'center', gap:2}}>
    <AutoCompleteSearchBoard/>
    
    <ModeSelect />
    {/* // xu li hien thi cac thong bao  */}
    <Notifications/>
      <Tooltip title='Help' sx={{ cursor:'pointer',color:'white'}}>
        <HelpOutlineIcon/>
      </Tooltip>
     <Profiles/>
    </Box>

      
    </Box>
  );
}
