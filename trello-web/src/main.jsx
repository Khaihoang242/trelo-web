// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "~/App.jsx";
import CssBaseline from "@mui/material/CssBaseline";
import { GlobalStyles } from "@mui/material";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import theme from "~/theme.js";
// cau hinh react toastify 
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
import { ConfirmProvider } from "material-ui-confirm";
import {store} from "~/redux/store"
import { Provider } from "react-redux";
//cau hinhh react-router-dom voi BrowserRouter
import {BrowserRouter} from 'react-router-dom'
import { PersistGate } from "redux-persist/integration/react";
// cau hinh redux persist
import {persistStore} from "redux-persist";
const persistor = persistStore(store)
// ky thuat Inject Store :
import { injectStore } from "./utils/authorizeAxios";
injectStore(store) 
createRoot(document.getElementById("root")).render(

  <Provider store={store}>
  <PersistGate persistor={persistor}> 
     <BrowserRouter basename= '/'>
    <CssVarsProvider theme={theme}>
    <ConfirmProvider defaultOptions={{
      allowClose: false ,
      dialogProps: {maxWidth: 'xs'},
      confirmationButtonProps : {color: 'secondary', variant:'outlined'},
      cancellationButtonProps :{ color: 'inherit'}
    }}>
    <GlobalStyles styles={{ a : { textDecoration : 'none'}}}/>
      <CssBaseline  />
      <App />
      <ToastContainer position="bottom-left" theme="colored"/>
    </ConfirmProvider>
    </CssVarsProvider>
    </BrowserRouter>  
 </PersistGate>
  </Provider>

);
