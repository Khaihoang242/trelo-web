// src/pages/Boards/Board.jsx
import Box from "@mui/material/Box";
import { Container, Typography } from "@mui/material";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";
import { useEffect } from "react";
import {updateBoardDetailsAPI,updateColumnDetailsAPI,moveCardToDifferentAPI} from "~/apis";
import CircularProgress from '@mui/material/CircularProgress';
import { fetchBoardDetailsAPI , updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from "~/redux/activeBoard/activeBoardSlice";
import { useDispatch, useSelector } from "react-redux";
import { cloneDeep } from "lodash";
import {useParams} from 'react-router-dom'
import PageLoadingSpinner from "~/components/Loading/PageLoadingSpinner";
import ActiveCard from "~/components/Modal/ActiveCard/ActiveCard";
function Board() {
  const dispatch = useDispatch()
  // const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentActiveBoard)
  const {boardId} = useParams()
  useEffect(() =>{
    // const boardId ='6880f8802dcde6aa243d02f8'
    // call api
    dispatch(fetchBoardDetailsAPI(boardId))
  },[dispatch, boardId])
  // function goi API tao moi column va lam lai du lieu State Board

    // function goi API tao moi card va lam lai du lieu State Board
    const moveColumns = (dnd0rderedColumns) =>{
      const dnd0rderedColumnsIds = dnd0rderedColumns.map(c=>c._id)
      const newBoard = {...board}
      newBoard.columns= dnd0rderedColumns
      newBoard.columnOrderIds=dnd0rderedColumnsIds
      // setBoard(newBoard)
      dispatch(updateCurrentActiveBoard(newBoard))
      //goi API update board
       updateBoardDetailsAPI(newBoard._id,{ columnOrderIds: dnd0rderedColumnsIds})

    }
    // khi di chuyen card trong cung column
    //thi chi goi api de cap nhap mang cardOrderIds cua column chua no
    const moveCardInTheSameColumn =(dnd0rderedCards,dndOrderedCardIds, columnId) =>{
      //uapdte cho chuan du lieu state board
      const newBoard = cloneDeep(board)
      const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
      if (columnToUpdate){
        columnToUpdate.cards= dnd0rderedCards
        columnToUpdate.cardOrderIds= dndOrderedCardIds
      }
      // setBoard(newBoard)
      dispatch(updateCurrentActiveBoard(newBoard))
      //goi api update column
      updateColumnDetailsAPI(columnId, { cardOrderIds:dndOrderedCardIds })

    } 
    //Khi di chuyen card sang column khac
      // B1: cap nhap mang carorderIds cua column ban dau chua no ( xoa _id cua card ra khoi mang)
      //B2: cap nhap mang carorderIds cua column ban dau tiep theo( them _id cua card ra khoi mang)
      // B3: Cap nhap lai truong columnId moi cua cua dax keo\
      // => lam mot API rieng 
    const moveCardToDifferentColumn =(currentCardId, prevColumnId, nextColumnId,dnd0rderedColumns
    ) =>{
      const dnd0rderedColumnsIds = dnd0rderedColumns.map(c=>c._id)
      const newBoard = {...board}

      newBoard.columns= dnd0rderedColumns
      newBoard.columnOrderIds=dnd0rderedColumnsIds
      // setBoard(newBoard)
      dispatch(updateCurrentActiveBoard(newBoard))
      //goi API xu li phia backend
      moveCardToDifferentAPI({
        currentCardId, 
        prevColumnId,
        prevCardOrderIds: (dnd0rderedColumns.find(c=> c._id === prevColumnId)?.cardOrderIds || [])
        .filter(id => !id.includes('placeholder_card')),
        nextColumnId,
        nextCardOrderIds:dnd0rderedColumns.find(c=> c._id === nextColumnId)?.cardOrderIds,
      })


    }
    // xu li xoa 1 column va card trong no 

    if (!board) {
      return <PageLoadingSpinner caption="Loading Board...."/>
    }
  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
   {/* check dong mo dua tren satte isShowModalActiveCard trong redux */}
     <ActiveCard/>
    {/* <ActiveCard/> */}
    {/* cac thanh phan con lai cua board detail */}
      <AppBar />
      <BoardBar board={board} />
      <BoardContent 
      board={board} 

      moveColumns={moveColumns}
      moveCardInTheSameColumn={moveCardInTheSameColumn}
      moveCardToDifferentColumn={moveCardToDifferentColumn}
      />
    </Container>
  );
}

export default Board;
