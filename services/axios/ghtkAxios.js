import axios from 'axios'
import queryString from 'query-string'

const axiosClient = axios.create({
    baseURL: process.env.API_GHTK,

    headers: {
        'content-type' : 'application/json',
        Token: process.env.TOKEN_GHTK,
    },
    // dung querystring handle params thay vi dung mac dinh cua axios
    paramsSerializer: params => queryString.stringify(params)
})

axiosClient.interceptors.request.use(async (config)=> {
    return config
})

axiosClient.interceptors.response.use((response) => {
    if(response && response.data) return response.data 
    return response
}, (error) => {
    throw error
})

export default axiosClient;