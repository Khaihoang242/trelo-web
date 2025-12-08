import { createSlice , createAsyncThunk} from '@reduxjs/toolkit'
import { API_ROOT } from "~/utils/constants";
import { isEmpty } from "lodash";
import { mapOrder } from "~/utils/sorts";
import { generatePlaceholderCard } from "~/utils/formatters";
import authorizedAxiosInstance from '~/utils/authorizeAxios';

// Khởi tạo giá trị State của một cái Slice trong redux
const initialState = {
    currentActiveBoard : null
}

// Các hành động gọi api và cập nhật dữ liệu vào Redux dùng middleware createAsyncThunk
export const fetchBoardDetailsAPI = createAsyncThunk(
    'activeBoard/fetchBoardDetailsAPI',
    async (boardId) =>{
        const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
        return response.data 
    }
)

// Khởi tạo một cái Slice trong kho lưu trữ Redux Store
export const activeBoardSlice = createSlice({
    name: 'activeBoard',
    initialState,
    reducers: {
      updateCurrentActiveBoard: (state, action) => {
        const board = action.payload 
        state.currentActiveBoard = board
      },
      updateCardInBoard: (state, action) => {
        // Cập nhật dữ liệu lồng nhau (nested data)
        const incomingCard = action.payload
      
        // Tìm dần từ board → column → card  
        const column = state.currentActiveBoard.columns.find(
          (i) => i._id === incomingCard.columnId
        )
      
        if (column) {
          const card = column.cards.find((i) => i._id === incomingCard._id)
          if (card) {
            // card.title = incomingCard.title
            // card['title'] = incomingCard['title']
                      /*
          * Đơn giản là dùng Object.keys để lấy toàn bộ các properties (keys) của incomingCard về một Array
          * rồi forEach nó ra.
          * Sau đó tuỳ vào trường hợp cần thì kiểm tra thêm còn không thì cập nhật ngược lại giá trị vào
          * card luôn như bên dưới.
          */
            Object.keys(incomingCard).forEach(key => {
              card[key] = incomingCard[key]

            })
          }
        }
      }
      
    },
    extraReducers: (builder) => {
        // Xử lý khi API gọi thành công
        builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
            let board = action.payload 

            // Thanh vien trong board se gop lai cua 2 mang owmers vaf members

            board.FE_allUsers = board.owners.concat(board.members)
            
            // Sắp xếp column
            board.columns = mapOrder(board?.columns, board?.columnOrderIds,'_id')
            
            // Xử lý và sắp xếp Card trong mỗi Column
            board.columns.forEach(column => {
                if (isEmpty(column.cards)){
                    // Thêm Placeholder Card khi không có Card nào
                    const placeholderCard = generatePlaceholderCard(column)
                    column.cards = [placeholderCard]
                    column.cardOrderIds = [placeholderCard._id]
                } else {
                    // Sắp xếp Cards
                    column.cards = mapOrder(column.cards, column.cardOrderIds,'_id')
                }
            })
            
            state.currentActiveBoard = board
        })

        // === LOGIC XỬ LÝ LỖI 410 (Gone) ĐÃ ĐƯỢC THÊM VÀO ĐÂY ===
        builder.addCase(fetchBoardDetailsAPI.rejected, (state, action) => {
            // Lỗi 410 (Gone) thường chỉ ra Board đã bị xóa.
            // Action.error.message sẽ là chuỗi lỗi từ Axios.
            // Ví dụ: "Request failed with status code 410"
            
            // Bạn có thể kiểm tra trực tiếp mã lỗi từ response nếu bạn không xử lý trong Axios Interceptor,
            // nhưng vì bạn đã có Interceptor, ta dùng cách đơn giản hơn:
            if (action.error.message?.includes('410') || action.error.message?.includes('Gone')) {
                // Đặt lại state về null khi Board không tồn tại (đã bị xóa)
                state.currentActiveBoard = null
                // Tùy chọn: Bạn có thể muốn dispatch một action chuyển hướng (navigate) 
                // người dùng ở Component sang trang danh sách Board tại đây, 
                // hoặc xử lý chuyển hướng ở component gọi API.
            }
        })
    }
})
 

// Action creators are generated for each case reducer function
export const { updateCurrentActiveBoard,updateCardInBoard} = activeBoardSlice.actions
// Selector: Dùng hook useSelector() để lấy dữ liệu từ Redux Store
export const selectCurrentActiveBoard = (state) =>{
    return state.activeBoard.currentActiveBoard
}
// Export Reducer mặc định
export default activeBoardSlice.reducer

// Export Reducer phụ (nếu cần)
export const activeBoardReducer = activeBoardSlice.reducer