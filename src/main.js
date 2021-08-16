/**
 * The Vue build version to load with the `import` command
 * (runtime-only or standalone) has been set in webpack.base.conf with an alias.
 */
import Vue from 'vue'
import router from './router'
import axios from 'axios';
import vuex from 'vuex'
Vue.use(vuex);

import store from './data/store'
import * as SurvmlWriter from "./tool/survml-writer"

/* the third-party plugins */
import 'toastr/build/toastr.css'
import $ from 'jquery';

/*  UI components and widgets  */
import toastr from "toastr";
import iView from 'iview';
import 'iview/dist/styles/iview.css';
Vue.use(iView);

import vcolorpicker from 'vcolorpicker';
Vue.use(vcolorpicker);

import VueCookies from 'vue-cookies';
Vue.use(VueCookies);

/* font icons */
import 'font-awesome/css/font-awesome.min.css';
import './assets/style/icons.scss'

import './assets/style/variables.scss'
import './assets/style/tool.scss'
import './assets/style/reset.scss'

import * as Http from './http/httpService'
Vue.prototype.httpGet = Http.httpGet
Vue.prototype.httpPost = Http.httpPost
Vue.prototype.baseUrl = Http.baseUrl

/* global definitions */
Vue.config.productionTip = true
Vue.config.devtools = true

var myAxios = axios.create();
Vue.prototype.$axios = myAxios

/* eslint-disable no-new */
const App = new Vue({
  el: '#app',
  router,
  store
})

// 每隔30s自动保存
setInterval(function () {
  let qs = require("qs");
  let xmlContent = "";
  try {
    xmlContent = SurvmlWriter.writeSurvml();
  } catch (e) {
    console.log(`自动保存失败：${e}`);
    return false;
  }

  if (xmlContent) {
    let questionNum, pageNum;
    questionNum = store.state.QuestionInfoModule.QuestionList.filter(question => question.type != 'section').length;
    pageNum = store.state.QuestionInfoModule.SectionList.length;
    var params = {
      id: store.state.QuestionnaireInfoMoudle.QuestionnaireInfo.questionnaireId,
      moduleId: store.state.QuestionnaireInfoMoudle.QuestionnaireInfo.moduleId,
      projectId: store.state.QuestionnaireInfoMoudle.QuestionnaireInfo.projectId,
      name: store.state.QuestionnaireInfoMoudle.QuestionnaireInfo.title,
      labelText: store.state.QuestionnaireInfoMoudle.QuestionnaireInfo.tag,
      identity: store.state.QuestionnaireInfoMoudle.QuestionnaireInfo.responseIdentity,
      xmlContent: xmlContent,
      logoUrl: store.state.QuestionnaireInfoMoudle.QuestionnaireInfo.logoUrl,
      bgUrl: store.state.QuestionnaireInfoMoudle.QuestionnaireInfo.bgUrl,
      questionNum: questionNum,
      pageNum: pageNum,
      welcomeText: store.state.QuestionnaireInfoMoudle.QuestionnaireInfo.welcomeText,
      endText: store.state.QuestionnaireInfoMoudle.QuestionnaireInfo.endText
    };
    Http.httpPost('/w1/questionnaire/save', params).then(res => {
      if (res.code == 0) {
        console.log("自动保存成功");
        let data = res.data
        store.state.QuestionnaireInfoMoudle.QuestionnaireInfo.questionnaireId = data.questionnaireId || "";
        store.state.QuestionnaireInfoMoudle.QuestionnaireInfo.moduleId = data.moduleId || "";
        toastr.info("自动保存成功", "", {
          timeOut: 1000,
          positionClass: "toast-bottom-right"
        });
      } else {
        console.log(result.data.msg || "自动保存失败");
      }
    }).catch(error => {
      console.log("自动保存失败");
    })
  }
}, 30 * 1000)
