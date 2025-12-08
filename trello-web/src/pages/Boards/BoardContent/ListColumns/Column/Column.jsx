import React ,{ useState } from 'react'
import { Box, Typography } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import AddCardIcon from '@mui/icons-material/AddCard';
import Button from "@mui/material/Button";
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ListCards from './ListCards/ListCards';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import Divider from '@mui/material/Divider';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Cloud from '@mui/icons-material/Cloud';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close'
import { toast } from 'react-toastify';
import { useConfirm } from 'material-ui-confirm';
import {createNewCardAPI,deleteColumnDetailsAPI,updateColumnDetailsAPI} from "~/apis";
import {  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from "~/redux/activeBoard/activeBoardSlice";
import { useSelector,useDispatch } from "react-redux";
import { cloneDeep } from "lodash";
import ToggleFocusInput from '~/components/Form/ToggleFocusInput';
export default function Column({column}) {
  const board = useSelector(selectCurrentActiveBoard)
  const dispatch = useDispatch()
  const {attributes,listeners,setNodeRef,transform,transition,isDragging} = useSortable({
    id: column._id,
    data:{...column}
  });
  
  const dndKitCollumnStyles = {
    // touchAction:'none', // danh cho sensor default dang PointerSensor
    transform: CSS.Translate.toString(transform),
    transition,
    height:'100%',
    opacity : isDragging ? 0.5 : undefined
  };

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
    const orderedCards= column.cards

    const [openNewCardForm,setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm =() =>setOpenNewCardForm(!openNewCardForm)
const [newCardtitle,setNewCardTitle] = useState('')
const addNewCard = async ()=>{
  if(!newCardtitle){
    toast.error('Please entern Title Card',{ position:'bottom-right'}) 
    return
  }
//goi API
  // tao du lieu goi API
  const newCardData ={
    title:newCardtitle,
    columnId: column._id
  }
  // goi api tao moi card
  const createdCard = await createNewCardAPI({
    ...newCardData,
    boardId: board._id
  })
  // cap nhap state board
// const newBoard = {...board}
const newBoard = cloneDeep(board)
const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
if (columnToUpdate){
  columnToUpdate.cards.push(createdCard)
  columnToUpdate.cardOrderIds.push(createdCard._id)
}

dispatch(updateCurrentActiveBoard(newBoard))
 // dong trang thai them Card va clear input 
 toggleOpenNewCardForm()
 setNewCardTitle('')
}
// xu li xoa column va cards 
const confirmDeleteColumn = useConfirm()
const handleDeleteColumn =() =>{
  confirmDeleteColumn({
    title:'Delete Column',
    description: 'This action will permanently delete your Column and its Card! Are you sure?',
    confirmationText: 'Confirm',
    cancellationText:'Cancel',

    // allowClose: false ,
    // dialogProps: {maxWidth: 'xs'},
    // confirmationButtonProps : {color: 'secondary', variant:'outlined'},
    // cancellationButtonProps :{ color: 'inherit'}
  }).then(() =>{
    // update cho chuan du lieu state board
    const newBoard = {...board}
    newBoard.columns= newBoard.columns.filter( c => c._id !== column._id)
    newBoard.columnOrderIds=newBoard.columnOrderIds.filter( _id => _id !== column._id)
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // goi api 
    deleteColumnDetailsAPI(column._id).then( res => {
      toast.success(res?.deleteResult)
    })
  }).catch(() =>{})

}
const onUpdateColumnTitle =(newTitle) =>{
  
  /// goi api update column va xu li du lieu board trong redux
  updateColumnDetailsAPI(column._id,{ title: newTitle }).then( () =>{ 
    const newBoard = cloneDeep(board)
      const columnToUpdate = newBoard.columns.find(c => c._id === column._id)
      if (columnToUpdate){
        columnToUpdate.title= newTitle
      }
      // setBoard(newBoard)
      dispatch(updateCurrentActiveBoard(newBoard))

  })

}
  return (
    <div ref={setNodeRef}  style={dndKitCollumnStyles}{...attributes} >
     <Box 
     {...listeners}
     sx={{
        minWidth:'300px',
        maxWidth:'300px',
        bgcolor:(theme)=>(theme.palette.mode ==='dark'? '#333643':'#ebecf0'),
        ml:2,
        borderRadius:'6px',
        height:'fit-content',
        maxHeight:(theme)=> `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`
      }}>
      {/* BoxColumnHeader  */}
      <Box sx={{
        height:(theme)=> theme.trello.columnHeaderHeight,
        p:2,
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between'
      }}>
      {/* <Typography  variant="h6" sx={{
        fontWeight: 'bold',
        cursor:'pointer',
        fontSize:'1rem'
      }}>{column?.title} </Typography> */}
      <ToggleFocusInput 
      value ={column?.title}
      onChangedValue={onUpdateColumnTitle}
      data-no-dnd = 'true'
      />
      <Box>
      <Tooltip title='More options'>
    <ExpandMoreIcon
      id="basic-column-dropdown"
      aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      onClick={handleClick}
      sx={{color:'text.primary',
      cursor:'pointer'}}
    />
    </Tooltip>
    <Menu
      id="basic-menu-column-dropdown"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      disableAutoFocusItem
      slotProps={{
        list: {
          'aria-labelledby': 'basic-button-workspaces',
        },
      }}
    >
    <MenuItem
    onClick={toggleOpenNewCardForm} 


    sx={{
        '&:hover' :{
          color: 'success.light',
          '& .add-card-icon': {
            color: 'success.light',
          }
        }
      }}>
        <ListItemIcon>
          <AddCardIcon className='add-card-icon' fontSize="small" />
        </ListItemIcon>
        <ListItemText>Add new card</ListItemText>
      </MenuItem>
      <MenuItem>
        <ListItemIcon>
          <ContentCut fontSize="small" />
        </ListItemIcon>
        <ListItemText>Cut</ListItemText>
      </MenuItem>
      <MenuItem>
        <ListItemIcon>
          <ContentCopy fontSize="small" />
        </ListItemIcon>
        <ListItemText>Copy</ListItemText>
      </MenuItem>
      <MenuItem>
        <ListItemIcon>
          <ContentPaste fontSize="small" />
        </ListItemIcon>
        <ListItemText>Paste</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem 
             onClick = { handleDeleteColumn}
             sx={{
        '&:hover' :{
          color: 'warning.dark',
          '& .delete-forever-icon': {
            color: 'warning.dark',
          }
        }
      }}>
        <ListItemIcon>
          <DeleteForeverIcon fontSize="small" className='delete-forever-icon' />
        </ListItemIcon>
        <ListItemText>Delete this column</ListItemText>
      </MenuItem>
      <MenuItem>
        <ListItemIcon>
          <Cloud fontSize="small" />
        </ListItemIcon>
        <ListItemText>Archive this column</ListItemText>
      </MenuItem>
    </Menu>
  </Box>

      </Box>
        {/* ListCard */}
        <ListCards cards={orderedCards}/>
        {/* Box Footer  */}
        <Box sx={{
          height: (theme)=> theme.trello.columnFooterHeight,
          p:2,

        }}> 
        {!openNewCardForm
        ?
        <Box sx={{
          height: '100%',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between'
        }}>
        <Button startIcon={<AddCardIcon/>} onClick ={toggleOpenNewCardForm}>Add new card</Button>
       <Tooltip title='Drag to move'>
          <DragHandleIcon sx={{cursor:'pointer'}}/>
       </Tooltip>
        </Box>
        :
        <Box sx={{
          height:'100%',
          display:'flex',
          alignItems:'center',
          gap:1
        }}> 
               <TextField 
    label="Enter card title" 
    type ="text" 
    size="small"
    variant='outlined'
    autoFocus
    data-no-dnd = 'true'
    value={newCardtitle}
    onChange={(e) =>setNewCardTitle(e.target.value)}
    sx={{
      '& label':{color:'text.primary'},
      '& input':
      {color:(theme) => theme.palette.primary.main,
      bgcolor: (theme) => (theme.palette.mode == 'dark' ? '#333643' :'white')
      },
      '& label.Mui-focused':{color:(theme)=>{ theme.palette.primary.main}},
      '& .MuiOutlinedInput-root':{
        '& fieldset':{borderColor:(theme)=>{ theme.palette.primary.main}},
        '&:hover fieldset':(theme)=>{ theme.palette.primary.main},
        '&.Mui-focused fieldset':(theme)=>{ theme.palette.primary.main},
      },
      '& .MuiOutlinedInput-input':{
        borderRadius:1
      }
    }}/>
    <Box sx ={{ display:'flex', alignItems:'center', gap:1 }}>
    <Button 
    className='interceptor-loading'
    onClick ={addNewCard}
    variant="contained" 
    color="success" 
    size="small"
    sx={{
      boxShadow:'none',
      border: '0.5px solid',
      borderColor : (theme) => theme.palette.success.main,
      '&:hover': {bgcolor: (theme)=> theme.palette.success.light}
    }}> Add  </Button>
    <CloseIcon
          fontSize="small"
          sx={{ color:(theme)=>(theme.palette.warning.light),
          cursor:'pointer'
          }}
          onClick={toggleOpenNewCardForm}
        />
       </Box>
        </Box>
        
        }
        </Box>
        
        
      </Box>
      </div>
  )
}
