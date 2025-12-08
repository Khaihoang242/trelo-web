// src/App.jsx
import Board from "~/pages/Boards/_id";
import NotFound from "~/pages/404/NotFound";
import {Routes, Route, Navigate, Outlet} from 'react-router-dom'
import Auth from "~/pages/Auth/Auth";
import AccountVerification from '~/pages/Auth/AccountVerification'
import { useSelector } from "react-redux";
import { selectCurrentUser } from "./redux/user/userSlice";
import Settings from "./pages/Settings/Settings";
import Boards from "./pages/Boards";
// giai phap clean ve xac dinh cac route nao can dang nhap tai khoan thi moi cho truy cap 
const ProtectedRoute = ({user})=>{
  if (!user) return <Navigate to='/login' replace={true}/>
  return <Outlet/>
} 
function App() {
  const currentUser =useSelector(selectCurrentUser)
  return (
   
    <Routes>
        {/* // Redirect Route */}
      <Route path='/' element={
        
        <Navigate to  = '/boards/6880f8802dcde6aa243d02f8' replace ={true}/>} />

        <Route element={<ProtectedRoute user={currentUser}/>}> 
        {/* // Board Details */}
          <Route path='/boards/:boardId' element ={<Board />}/>
          <Route path='/boards' element ={< Boards />}/>
          // using settings
          // using settings
          <Route path='/settings/account' element ={<Settings/>}/>
          <Route path='/settings/security' element ={<Settings/>}/>

        </Route> 
      {/* Authentication  */}
      <Route path="/login" element={<Auth/>}/>
      <Route path="/register" element={<Auth/>}/>
      <Route path ='/account/verification' element={<AccountVerification/>} />
      {/* 404 not found page  */}
      <Route path="*" element={<NotFound/>}/>

    </Routes>
  );
}

export default App;
