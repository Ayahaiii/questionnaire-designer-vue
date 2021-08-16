import axios from 'axios'
let qs = require('qs')
import VueCookies from 'vue-cookies';

let host = window.location.host
let baseUrl = `http://${host}/ringsurveyapi`;

const httpGet = async function (url = '', data = {}) {
  const instance = axios.create({
    baseURL: baseUrl,
    withCredentials: false,
    headers: {
      'Accept': 'application/json;charset=UTF-8',
      'content-type': 'application/json',
      'Authorization': VueCookies.get("tokenWeb") ? 'Bearer ' + VueCookies.get("tokenWeb") : ""
    }
  });
  try {
    const result = await instance.get(url, {
      params: data
    });
    var res = result.data;
    if (res && res.code === 0) {
      return Promise.resolve(res);
    }
    else {
      if (res.code === 15000) {
        this.$message({
          message: '系统异常',
          type: 'warning'
        });
        return res;
      }
      else if (res.code === 10000) {
        this.$message({
          message: res.message,
          type: 'warning'
        });
        return res;
      }
      return Promise.resolve(res);
    }
  }
  catch (error) {
    let res_1 = error.response;
    if (res_1.status === 400 || res_1.status === 401) {
      if (res_1.data) {
        this.$message({
          message: res_1.data.message,
          type: 'warning'
        });
        VueCookies.remove("tokenWeb");
        VueCookies.remove("userInfo");
        VueCookies.remove("tokenWeb", "/", "ringdata.com");
        VueCookies.remove("userInfo", "/", "ringdata.com");
      }
      else {
        this.$message({
          message: '登陆信息已失效,请重新登陆',
          type: 'warning'
        });
      }
      this.$router.push({
        path: '/login',
        query: {
          fullPath: this.$route.fullPath
        }
      });
      return res_1;
    }
    res_1 = {
      code: -1,
      message: '网络请求异常，请稍后再试或联系客服！'
    };
    console.log('网络请求错误');
    return res_1;
  }
}

const httpPost = async function (url = '', data = {}) {
  const instance = axios.create({
    baseURL: baseUrl,
    withCredentials: false,
    headers: {
      'Accept': 'application/json;charset=UTF-8',
      'content-type': 'application/json',
      'Authorization': VueCookies.get("tokenWeb") ? 'Bearer ' + VueCookies.get("tokenWeb") : ""
    }
  });
  try {
    const result = await instance.post(url, data);
    var res = result.data;
    if (res && res.code === 0) {
      return Promise.resolve(res);
    }
    else {
      if (res.code === 15000) {
        this.$message({
          message: '网络请求异常，请稍后再试或联系客服！',
          type: 'warning'
        });
        return res;
      }
      return Promise.resolve(res);
    }
  }
  catch (error) {
    let res_1 = error.response;
    if (res_1.status === 400 || res_1.status === 401) {
      if (res_1.data) {
        this.$message({
          message: res_1.data.message,
          type: 'warning'
        });
        VueCookies.remove("tokenWeb");
        VueCookies.remove("userInfo");
        VueCookies.remove("tokenWeb", "/", "ringdata.com");
        VueCookies.remove("userInfo", "/", "ringdata.com");
      }
      else {
        this.$message({
          message: '登陆信息已失效,请重新登陆',
          type: 'warning'
        });
      }
      this.$router.push({
        path: '/login',
        query: {
          fullPath: this.$route.fullPath
        }
      });
      return res_1;
    }
    res_1 = {
      code: -1,
      message: '网络请求异常，请稍后再试或联系客服！'
    };
    console.log('网络请求错误');
    return res_1;
  }
}

export {
  httpGet,
  httpPost,
  baseUrl
}
