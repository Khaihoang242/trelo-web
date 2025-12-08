import { Box } from "@mui/material";
import React, { useRef,useCallback, useEffect,useState } from "react";
import ListColumns from "./ListColumns/ListColumns";
import {DndContext, useSensor , useSensors,DragOverlay, defaultDropAnimationSideEffects,closestCorners, pointerWithin, rectIntersection, getFirstCollision, closestCenter} from '@dnd-kit/core';
import {arrayMove} from '@dnd-kit/sortable';
import Column from "./ListColumns/Column/Column";
import Card from "./ListColumns/Column/ListCards/Card/Card";
import { cloneDeep, isEmpty } from "lodash";
import { generatePlaceholderCard } from "~/utils/formatters";
import { MouseSensor, TouchSensor } from "~/customLibrabries/DndKitSensors";
const ACTIVE_DRAG_ITEM_TYPE ={
  COLUMN:'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD:'ACTIVE_DRAG_ITEM_TYPE_CARD'
}
export default function BoardContent({board,moveColumns,moveCardInTheSameColumn,moveCardToDifferentColumn}) {
  // const poiterSensor = useSensor(PointerSensor, {activationConstraint:{ distance:10}})
  // yeu cau con chuot di chuyen 10px thi ms kich hoat event
  const mouseSensor = useSensor(MouseSensor, {activationConstraint:{distance:10}})
  // nhan giu 250ms va dung sai cua cam ung thi moi kich hoat event
  const touchSensor = useSensor(TouchSensor, {activationConstraint:{delay:250, tolerance:500 }})
  // const sensors = useSensors(poiterSensor)
  const sensors = useSensors(mouseSensor,touchSensor)
  
  const [orderedColumnsState, setOrderedColumnsState]= useState([])
  // cung 1 thoi diem chi co 1 ptu dc keo (column hoac card)
  const [activeDragItemId, setActiveDragItemId]= useState(null)
  const [activeDragItemType, setActiveDragItemType]= useState(null)
  const [activeDragItemData, setActiveDragItemData]= useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard]= useState(null)
  // diem va cham cuoi cung 
  const lastOverId = useRef(null)
useEffect(() =>{
  //column da dc sap xep
  setOrderedColumnsState(board.columns)
},[board])
// tim 1 cai column theo cardId 
const findColumnByCardId = (cardId) => {
  return orderedColumnsState.find(column => column?.cards?.some(card => card._id === cardId))
}
// function chung xu li viec cap nhap state trong column khac nhau 
const moveCardBetweenDifferentColumns=(
  overColumn,
  overCardId,
  active,
  over,
  activeColumn,
  activeDraggingCardId,
  activeDraggingCardData,
  triggerForm
) =>{
  setOrderedColumnsState(prevColumns =>{ 
    // tim vi tri cua overCard trong column dich( cho card dc tha)
    const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)
    // logic tinh toan cho cardIndex moi 
    let newCardIndex 
    const isBelowOverItem = active.rect.current.translate && 
    active.rect.current.translated.top >over.rect.top + over.rect.height
    const modifier = isBelowOverItem ? 1: 0

    newCardIndex = overCardIndex >=0 ? overCardIndex + modifier : overColumn?.cards?.length +1
    //clone mang OderedColumnState cu ra mot cai moi de xu li data roi return 
    const nextColumns = cloneDeep([...prevColumns]) 
    const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
    const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)
    if (nextActiveColumn ){
      // xoa card o cai column active 
      nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
      //  kiem tra ptu cuoi bi keo thi them mot card placeholder vao 
      if (isEmpty(nextActiveColumn.cards)){
        nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]

      }

      //them placeholdercardneu column bi rong 

// cap nhap lai mang cardOderIds cho chuan dux lieu 
      nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
    }
    if (nextOverColumn) {
      // kiem tra xem card dang keo no co ton tai o overColumn chua , neu co thi can xoa no truoc
      nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)
      const rebuild_activeDraggingCardData ={
        ...activeDraggingCardData,
        columnId: nextOverColumn._id
      }
      // them card dang keo vao overcolumn theo vi tri index moi
      nextOverColumn.cards= nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData )
      // xoa placeholdercard di neu dc keo vao  mot card
      nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)
      // cap nhap lai mang cardOderIds cho chuan dux lieu 
      nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
    }
    // neu function nay dc goi tu handle drag end
    if(triggerForm ==='handleDragEnd'){
      moveCardToDifferentColumn(
        activeDraggingCardId,
        oldColumnWhenDraggingCard._id,
        nextOverColumn._id,
        nextColumns
        )
    }
    return nextColumns
  })


}

const handleDragStart =(event) => {
  setActiveDragItemId(event?.active?.id)
  setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD  : ACTIVE_DRAG_ITEM_TYPE.COLUMN )
  setActiveDragItemData(event?.active?.data?.current)
  // keo card ms thuc hien set gia tri Oldecolumn
  if (event?.active?.data?.current?.columnId){
    //
    setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))

  }
}
//trigger trong qua trinh keo 
const handleDragOver = (event)=>{
  // khong lam gi khi keo column 
  if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return
  //con card thi xu ly them de keo card qua lai cac column
  const {active, over}= event
  // dam bao khong ton tai active hoac over thi ko lam gi
  if (!over || !active) return 

  //activeDraggingCardData: card dang dc keo
  const {id: activeDraggingCardId, data:{current: activeDraggingCardData}} = active
  //overCardId : la cai card dang tuong tac tren hoac duoi so voi cai card dc keo o tren
  const {id: overCardId } = over
  //Tim 2 cai columns theo cardId
  const activeColumn = findColumnByCardId(activeDraggingCardId)
  const overColumn = findColumnByCardId(overCardId)
  if  (!activeColumn || !overColumn ) return 
  // neu hai column khac nhau thi code chay vao day 
  if (activeColumn._id !== overColumn._id){
    moveCardBetweenDifferentColumns(
      overColumn,
      overCardId,
      active,
      over,
      activeColumn,
      activeDraggingCardId,
      activeDraggingCardData,
      'handleDragOver'
    )

  }
}


  const handleDragEnd = (event) => {
    // console.log("handleDragEnd:", event);
    const {active, over} = event
    //kiem tra neu khong ton tai over ( keo ra ngoai tranh loi)
    if (!over || !active) return 
    // xu keo tha card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
            //activeDraggingCardData: card dang dc keo
            const {id: activeDraggingCardId, data:{current: activeDraggingCardData}} = active
            //overCardId : la cai card dang tuong tac tren hoac duoi so voi cai card dc keo o tren
            const {id: overCardId } = over
            //Tim 2 cai columns theo cardId
            const activeColumn = findColumnByCardId(activeDraggingCardId)
            const overColumn = findColumnByCardId(overCardId)
            if  (!activeColumn || !overColumn ) return 

            if (oldColumnWhenDraggingCard._id !== overColumn._id){
              // keo tha hai column khac nhau
              moveCardBetweenDifferentColumns(
                overColumn,
                overCardId,
                active,
                over,
                activeColumn,
                activeDraggingCardId,
                activeDraggingCardData,
                'handleDragEnd'
              )
             

            }else {
              // keo tha trong cung 1 column
              //  Lay vi tri cu (tu oldColumnWhenDraggingCard)
      const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c =>c._id === activeDragItemId)
      //  Lay vi tri moi (tu over)
      const newCardIndex = overColumn?.cards?.findIndex(c =>c._id === overCardId)
      // dung arraymove de sap xep lai mang ban dau 
      const dnd0rderedCards = arrayMove(oldColumnWhenDraggingCard?.cards,oldCardIndex,newCardIndex)
      const dndOrderedCardIds = dnd0rderedCards.map( card => card._id)

      setOrderedColumnsState(prevColumns =>{ 
              //clone mang OderedColumnState cu ra mot cai moi de xu li data roi return 
      const nextColumns = cloneDeep([...prevColumns]) 
      // tim toi column dang keo tha
      const targetColumn = nextColumns.find(c=> c._id === overColumn._id)
      // cap nhap lai hai gia tri moi la card va cardOrder ids trong target column
      targetColumn.cards = dnd0rderedCards
      targetColumn.cardOrderIds = dndOrderedCardIds
        return nextColumns
      })

      moveCardInTheSameColumn(dnd0rderedCards,dndOrderedCardIds,oldColumnWhenDraggingCard._id)

            }

    }  
    // xu li keo tha column trong cung 1 cai boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
       // neu vi tri sau khi vi tri moi khac vi tri ban dau 
    if(active.id !== over.id){
      //  Lay vi tri cu (tu active)
      const oldColumnIndex = orderedColumnsState.findIndex(c =>c._id === active.id)
      //  Lay vi tri moi (tu over)
      const newColumnIndex = orderedColumnsState.findIndex(c =>c._id === over.id)
      // dung arraymove de sap xep lai mang ban dau 
      const dnd0rderedColumns = arrayMove(orderedColumnsState,oldColumnIndex,newColumnIndex)
      // dung xu li goi api 
      setOrderedColumnsState(dnd0rderedColumns)

      moveColumns(dnd0rderedColumns)
      // const dnd0rderedColumnsIds= dnd0rderedColumns.map(c => c._id)
    
    }


    } 
// cau nhat lai state column sau khi da keo tha tra ve null 

      setActiveDragItemId(null)
      setActiveDragItemType(null)
      setActiveDragItemData(null)
      setOldColumnWhenDraggingCard(null)
  }
  const customdropAnimation ={
    sideEffects: defaultDropAnimationSideEffects({
      styles:{
        active:{
          opacity:'0.5'
        }
      }
    })
  }
  const collisionDetectionStrategy = useCallback((args)=>{
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({...args})
    }
    // tim cac diem giao nhau va cham tra ve mang va cham 
    const pointerIntersections = pointerWithin(args)
    if (!pointerIntersections?.length) return 
    // tim overId dau tien trong dam pointerIntersections tren 
     let overId = getFirstCollision(pointerIntersections, 'id')
     if (overId){
      const checkColumn = orderedColumnsState.find(column => column._id === overId)
      if (checkColumn){
        overId = closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id

      }
      lastOverId.current = overId
      return [{ id : overId}]
     }
     return lastOverId ? [{ id : lastOverId.current}]: []




  },[activeDragItemType,orderedColumnsState])

  return (
    <DndContext 
    // thua toan phat hien va cham fix loi card bu hon khong keo qua dc 
    // collisionDetection={closestCorners}
    // tu custom nang cao thuat toan phat hien va cham
    collisionDetection={collisionDetectionStrategy}
    onDragStart={handleDragStart}
    onDragOver={handleDragOver}
    onDragEnd={handleDragEnd} 
    sensors={sensors}>
    <Box
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
        width: "100%",
        height: (theme) => theme.trello.boardContentHeight,
        display: "flex",
        p: "10px 0",
      }}
    >
      <ListColumns columns={orderedColumnsState} 
      />
      <DragOverlay dropAnimation={customdropAnimation}>
        {(!activeDragItemType) && null }
        {( activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN ) && <Column column={activeDragItemData}/> }
        {( activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD ) && <Card card={activeDragItemData}/> }
      </DragOverlay>
    </Box>
  </DndContext>
  );
}
