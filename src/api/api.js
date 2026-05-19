import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:4444" //Api Gateway URI
})

// request interceptors before sending any request through api.
api.interceptors.request.use( //asks two functions success function and error function 
    (config) => { //Before Axios sends a request, it prepares an object like this:
        const token = localStorage.getItem("token")
        // Here is the request I’m about to send.You may modify it.

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;// adds the token to req for authorization
        }
        return config; // Final modified configuration as per my requirement
    },
    (error) => Promise.reject(error)
);

//Server Interceptor
//some problems are only visible AFTER the server replies.
api.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response?.status === 401) // If browser response is unauthorized
        {
            localStorage.removeItem("token"); //This token is no longer valid. Remove it from browser memory.
            // eslint-disable-next-line no-restricted-globals
            location.href = "/login";
        }
        return Promise.reject(error);
    }
)

export default api;
