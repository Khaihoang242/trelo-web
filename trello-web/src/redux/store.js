//redux la cai state management tools
import { configureStore } from "@reduxjs/toolkit";
import { activeBoardReducer } from "./activeBoard/activeBoardSlice";
import { userReducer } from "./user/userSlice";
import { activeCardReducer } from "./activeCard/activeCardSlice";
import { notificationsReducer } from "./notifications/notificationsSlice";
// Cấu hình redux-persist
// https://www.npmjs.com/package/redux-persist
// Bài viết hướng dẫn này dễ hiểu hơn:
// https://edvins.io/how-to-use-redux-persist-with-redux-toolkit

import { combineReducers } from 'redux' // lưu ý chúng ta có sẵn redux trong node_modules bởi vì khi cài @reduxjs/toolkit là đã có luôn
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // default là localStorage
// Cấu hình persist
const rootPersistConfig = {
    key: 'root', // key của cái persist do chúng ta chỉ định, cứ để mặc định là root
    storage: storage, // Biến storage ở trên – lưu vào localStorage
    whitelist: ['user'] // định nghĩa các slice dữ liệu ĐƯỢC PHÉP duy trì qua mỗi lần f5 trình duyệt
    // blacklist: ['user'] // định nghĩa các slice KHÔNG ĐƯỢC PHÉP duy trì qua mỗi lần f5 trình duyệt
  }
  //combie cac reducers trong du an 
  const reducers = combineReducers({
    activeBoard : activeBoardReducer,
    user :  userReducer,
    activeCard: activeCardReducer,
    notifications: notificationsReducer
  })
  // thuc hien persist reducers
  const persistedReducers = persistReducer(rootPersistConfig, reducers)
  //
  
export const store = configureStore({
    reducer: persistedReducers,
    //fix warning error when implement reux-persist

    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck : false})
})