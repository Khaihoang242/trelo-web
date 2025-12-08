import axios from "axios";
import { toast } from "react-toastify";
import { interceptorLoadingElements } from "./formatters";
import { refreshTokenAPI } from "~/apis";
import { logoutUserAPI } from "~/redux/user/userSlice";

/**
 * Không thể import { store } from '~/redux/store' theo cách thông thường ở đây
 * Giải pháp: Inject store: là kỹ thuật cần sử dụng biến redux store ở các file ngoài phạm vi component
 * như file authorizeAxios hiện tại
 * Hiểu đơn giản: khi ứng dụng bắt đầu chạy lên, code sẽ chạy vào main.jsx đầu tiên, từ bên đó chúng ta gọi
 * hàm injectStore ngay lập tức để gán biến mainStore vào biến axiosReduxStore cục bộ trong file này.
 * https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
 */
let axiosReduxStore

export const injectStore = mainStore => {axiosReduxStore = mainStore
}

//Khoi tao doi tuong axios de custom va cau hinh chung du an
let authorizedAxiosInstance = axios.create()
// thoi gian cho toi da cua 1 request: 10 phut 
authorizedAxiosInstance.defaults.timeout = 1000* 60 * 10
// withCredentials : cho phep axios tu don gui cooki trong moi request len BE ( phuc vu viec luu token JWT vao trong httpOnly Cookie cua trinh duyet)
authorizedAxiosInstance.defaults.withCredentials = true 

// Cau hinh Interceptor 
//Interceptor request : can thiet giua cai request api
authorizedAxiosInstance.interceptors.request.use((config) => {
    // ky thuat chan spam click 
    interceptorLoadingElements(true)
    return config;
  },  (error) => {
    // Do something with request error
    return Promise.reject(error);
  })
// Khởi tạo một cái promise cho việc gọi api refresh_token
// Mục đích tạo Promise này để khi nào gọi api refresh_token xong xuôi thì mới retry lại những api bị lỗi trước đó.
// https://www.thedutchlab.com/en/insights/using-axios-interceptors-for-refreshing-your-api-token
let refreshTokenPromise = null 


//Interceptor response : can thiet giua cai response api

authorizedAxiosInstance.interceptors.response.use( (response) => {
     // ky thuat chan spam click 
     interceptorLoadingElements(false)
    return response;
  },  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // moi ma http status code nam ngoai khaong 200-299 se roi vao day
    // ky thuat chan spam click 
    interceptorLoadingElements(false)

    //TH1 neu nhu nhan ma 401 tu BE thi goi api dang xuat
    if ( error.response?.status === 401){
       axiosReduxStore.dispatch (logoutUserAPI(false))
      }
    //TH2 neu nhu nhan ma 41- tu BE thi se goi api refresh token de lam moi lai accessToken 
       // dau tien lay dc cac request api dang bi loi thong qua error.config
    const originalRequests = error.config
    console.log(originalRequests)
    if ( error.response?.status === 410 && !originalRequests._retry){
      originalRequests._retry = true

      // kiem tra xem cos represhtokenPromise thi thuc hien gan viec goi api refresh_token dong thoi gan vao cho cai represhtokenPromise
      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshTokenAPI()
        .then( data => {
          // dong thoi accessToken da nam trong htppOnly cookie( tu BE)
          return data?.accessToken

        })
        .catch( () =>{
          // neu nhan bat ki loi nao tu api refresh token thi logout lun
          axiosReduxStore.dispatch(logoutUserAPI(false))
        })
        .finally(() =>{
          // du api co ok hay loi thi van lun gan lai cai refreshTokenPromise ve null nhu dau
          refreshTokenPromise = null
        })
      }
      // Cần return trường hợp refreshTokenPromise chạy thành công và xử lý thêm ở đây:
      // eslint-disable-next-line no-unused-vars
      return refreshTokenPromise.then(accessToken =>{
        /**
     * Bước 1: Đối với Trường hợp nếu dự án cần lưu accessToken vào localstorage hoặc đâu đó thì sẽ viết thêm code xử lý ở đây.
     * Hiện tại ở đây không cần bước 1 vì chúng ta đã đưa accessToken vào cookie (xử lý từ phía BE) 
     * sau khi api refreshToken được gọi thành công.
     */
    // ... (logic để xử lý accessToken nếu cần, theo comment thì hiện tại có thể bỏ qua)
    // ... phần code tiếp theo bị cắt, nhưng có comment:
    // Bước 2: Bước Quan trọng: Return lại axios instance của chúng ta kết hợp các originalRequests để gọi lại những api ban đầu bị lỗi
        return authorizedAxiosInstance(originalRequests)
      }) 

     }

 

    

    // Xu li tap trung hien thi thong bao looi tra ve tu moi API o day 
    // console.log error la thay cau truc data dan toi message loi 
    let errorMessage = error?.message 
    if (error.response?.data?.message) {
        errorMessage = error.response?.data?.message
    }
    // dung toasttify de hien thi bat ke max loi len man hinh ngoai tru 410-  Gone phu vuc vie tu dong refresh lai token 
    if ( error.response?.status !== 410){
        toast.error(errorMessage)
    }



    return Promise.reject(error);
  });

export default authorizedAxiosInstance 