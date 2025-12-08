import { createSlice , createAsyncThunk} from '@reduxjs/toolkit'
import { API_ROOT } from "~/utils/constants";
import authorizedAxiosInstance from '~/utils/authorizeAxios';
import { toast } from 'react-toastify';
// khoi tao gia tri State cua mot cai Slice trong redux
const initialState = {
  currentUser : null
}

// Cac hanh don goi api va cap nhap du lieu vao Redux dung ,middleWare createAsyncThunk fi lem voi extraReducers
export const loginUserAPI = createAsyncThunk(
    'user/loginUserAPI',
    async (data) =>{
        const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
        return response.data 

    }
)
export const logoutUserAPI = createAsyncThunk(
  'user/logoutUserAPI',
  async (showSuccessMessage = true) => {
    const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
    if (showSuccessMessage) {
      toast.success('Logged out successfully!')
    }
    return response.data
  }
)
export const updateUserAPI = createAsyncThunk(
  'user/updateUserAPI',
  async(data) =>{
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/update`, data)
    return response.data
  }
)

// Khoi tao mot cai Slice trong kho luu tru Redux Store
export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
      builder.addCase(loginUserAPI.fulfilled, (state, action) => {
        const user = action.payload 
        state.currentUser = user
      })
      builder.addCase(logoutUserAPI.fulfilled, (state) => {
        /**
         * API logout sau khi gọi thành công thì sẽ clear thông tin currentUser về null ở đây
         * Kết hợp ProtectedRoute đã làm ở App.js => code sẽ điều hướng chuẩn về trang Login
         */
        state.currentUser = null
      })
      builder.addCase(updateUserAPI.fulfilled, (state, action) =>{
        const user =action.payload
        state.currentUser =user
      })
      
    }
  })
  

// Action creators are generated for each case reducer function
//Action la noi danh cho cac component ben duoi goi bang dispatch() toi de no cap nhap lai du lieu thong qua reducer 
// export const {} = userSlice.actions
// Selector : La noi danh cho cac component ben duoi goi bang hook useSelector() de lay du lieu tu trong kho redux store ra su dung 
export const selectCurrentUser = (state) =>{
    return state.user.currentUser

}
// cai file nay ten la activeBoardSlice nhung chung ta se export mot thu la reducer 
// export default activeBoardSlice.reducer

export const userReducer = userSlice.reducer