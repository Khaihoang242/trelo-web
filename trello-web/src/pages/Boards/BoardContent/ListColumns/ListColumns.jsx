import React, { useState } from 'react'
import { Box, Button} from "@mui/material";
import Column from './Column/Column';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import CloseIcon from '@mui/icons-material/Close'
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import {createNewColumnAPI} from "~/apis"
import { generatePlaceholderCard } from "~/utils/formatters";
import {  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from "~/redux/activeBoard/activeBoardSlice";
import { useSelector,useDispatch } from "react-redux";
import { cloneDeep } from "lodash";
export default function ListColumns({columns}) {
  const board = useSelector(selectCurrentActiveBoard)
  const dispatch = useDispatch()
  const [openNewColumnForm,setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm =() =>setOpenNewColumnForm(!openNewColumnForm)
const [newColumntitle,setNewColumntitle] = useState('')
const addNewColumn = async()=>{
  if(!newColumntitle){
    toast.error('Please entern Column Title') 
    return
  }
  // tao du lieu goi API
  const newColumnData ={
    title:newColumntitle
  }
    // function goi API tao moi column va lam lai du lieu State Board
  const createdColumn = await createNewColumnAPI({
    ...newColumnData,
    boardId: board._id
  })
  // khi tao column moi thi no chua co card can xu li card rong 
  createdColumn.cards = [generatePlaceholderCard(createdColumn)]
  createdColumn.cardOrderIds =[generatePlaceholderCard(createdColumn)._id]
  // cap nhap state board
  // const newBoard = {...board}
  const newBoard = cloneDeep(board)
  newBoard.columns.push(createdColumn)
  newBoard.columnOrderIds.push(createdColumn._id)
  dispatch(updateCurrentActiveBoard(newBoard))
//goi API



 // dong trang thai them column va clear input 
 toggleOpenNewColumnForm()
 setNewColumntitle('')

}
  return (
<SortableContext
  items={columns?.map(c => c._id) || []}
  strategy={horizontalListSortingStrategy}
>
    <Box sx={{
        bgcolor:'inherit',
        width:'100%',
        height:'100%',
        display:'flex',
        overflowX:'auto',
        overflowY:'hidden',
        '&::-webkit-scrollbar-track':{m:2}
      }}>
       {columns?.map(column =><Column key={column._id}  
       column={column} 
        />)}
       {!openNewColumnForm
       ?
       <Box onClick={toggleOpenNewColumnForm} sx ={{
            minWidth:'250px',
            maxWidth:'250px',
            mx:2,
            borderRadius:'6px',
            height:'fit-content',
            bgcolor:'#ffffff3d'
        }}>
        <Button startIcon={<NoteAddIcon/>} 
        sx={{
            color:'white',
            width:'100%',
            justifyContent:'flex-start',
            pl:2.5,
            py:'8px'
        }}
        > Add new Colum</Button>

        </Box>
       : <Box sx={{
            minWidth:'250px',
            maxWidth:'250px',
            mx:2,
            p:1,
            borderRadius:'6px',
            height:'fit-content',
            bgcolor:'#ffffff3d',
            display:'flex',
            flexDirection: 'column',
            gap:1

       }}> 
       <TextField 
    label="Enter column title" 
    type ="text" 
    size="small"
    variant='outlined'
    autoFocus
    value={newColumntitle}
    onChange={(e) =>setNewColumntitle(e.target.value)}
    sx={{
      '& label':{color:'white'},
      '& input':{color:'white'},
      '& label.Mui-focused':{color:'white'},
      '& .MuiOutlinedInput-root':{
        '& fieldset':{borderColor:'white'},
        '&:hover fieldset':{borderColor:'white'},
        '&.Mui-focused fieldset':{borderColor:'white'},
      }
    }}/>
    <Box sx ={{ display:'flex', alignItems:'center', gap:1 }}>
    <Button 
    className='interceptor-loading'
    onClick ={addNewColumn}variant="contained" color="success" size="small"
    sx={{
      boxShadow:'none',
      border: '0.5px solid',
      borderColor : (theme) => theme.palette.success.main,
      '&:hover': {bgcolor: (theme)=> theme.palette.success.light}
    }}> Add Column </Button>
    <CloseIcon
          fontSize="small"
          sx={{ color:'white',
          cursor:'pointer',
          '&:hover': {color: (theme)=> theme.palette.warning.light}
          }}
          onClick={toggleOpenNewColumnForm}
        />
       </Box>
      </Box>
       }
      </Box>
    </SortableContext>
  )
}
