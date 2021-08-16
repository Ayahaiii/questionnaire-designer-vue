<!-- navigation bar (header) -->
<template>
  <nav class="nav-bar" id="top">
    <div class="navbar-brand">
      <img src="../assets/images/logo-rs.png" alt="logo">
      <a class="navbar-logo" href="#">
        <span class="navbar-name">问卷设计工具</span>
      </a>
    </div>
    <ul class="navbar-left">
      <li>
        <label for="xmlFile">
          <i class="fa fa-folder-open-o"></i>
          <p>导入</p>
          <input
            type="file"
            id="xmlFile"
            accept=".xml"
            style="display: none;"
            @change="onFileChange($event)"
          >
        </label>
      </li>
      <li>
        <a href="#" id="saveQuestionnaire" @click.prevent="save()">
          <i class="fa fa-floppy-o"></i>
          <p>保存</p>
        </a>
      </li>
    </ul>
    <ul class="navbar-right">
      <li @click="showResourcebase()">
        <a href="javascript:;">
          <i class="fa fa-cloud-upload"></i>
          <p>资源库</p>
        </a>
      </li>
      <li
        v-if="QuestionnaireInfo.questionnaireId || QuestionnaireInfo.moduleId"
      >
        <Dropdown trigger="click">
          <a href="javascript:void(0)">
            <i class="fa fa-external-link"></i>
            <p>导出</p>
          </a>
          <DropdownMenu slot="list">
            <DropdownItem>
              <a v-if="GetQueryValue1('pId')" :href="baseUrl +'/w1/questionnaire/export?questionnaireId='+QuestionnaireInfo.questionnaireId+'&moduleId='+QuestionnaireInfo.moduleId+'&fileType=XML&projectId='+GetQueryValue1('pId')">导出XML</a>
              <a v-else :href="baseUrl +'/w1/questionnaire/export?questionnaireId='+QuestionnaireInfo.questionnaireId+'&moduleId='+QuestionnaireInfo.moduleId+'&fileType=XML'">导出XML</a>
            </DropdownItem>
            <DropdownItem>
              <a v-if="GetQueryValue1('pId')" :href="baseUrl +'/w1/questionnaire/export?questionnaireId='+QuestionnaireInfo.questionnaireId+'&moduleId='+QuestionnaireInfo.moduleId+'&fileType=JPDF&projectId='+GetQueryValue1('pId')">导出简易版PDF</a>
              <a v-else :href="baseUrl +'/w1/questionnaire/export?questionnaireId='+QuestionnaireInfo.questionnaireId+'&moduleId='+QuestionnaireInfo.moduleId+'&fileType=JPDF'">导出简易版PDF</a>
            </DropdownItem>
            <DropdownItem>
              <a v-if="GetQueryValue1('pId')" :href="baseUrl +'/w1/questionnaire/export?questionnaireId='+QuestionnaireInfo.questionnaireId+'&moduleId='+QuestionnaireInfo.moduleId+'&fileType=XPDF&projectId='+GetQueryValue1('pId')">导出详细版PDF</a>
              <a v-else :href="baseUrl +'/w1/questionnaire/export?questionnaireId='+QuestionnaireInfo.questionnaireId+'&moduleId='+QuestionnaireInfo.moduleId+'&fileType=XPDF'">导出详细版PDF</a>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </li>

      <li v-if="QuestionnaireInfo.moduleId || QuestionnaireInfo.questionnaireId">
        <a :href="previewHref" target="_blank">
          <i class="fa fa-play-circle-o"></i>
          <p>预览</p>
        </a>
      </li>
      
      <li>
        <a href="#" @click.prevent="exit()">
          <i class="fa fa-sign-out"></i>
          <p>退出</p>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import * as SurvmlReader from "../tool/survml-reader";
import * as SurvmlWriter from "../tool/survml-writer";
import QuestionType from "../constant/question-type";

import toastr from "toastr";

let qs = require("qs");

export default {
  name: "",
  data() {
    return {
      baseHost: window.location.host,
    };
  },
  computed: {
    ...mapState({
      QuestionnaireInfo: state =>
        state.QuestionnaireInfoMoudle.QuestionnaireInfo,
      QuestionList: state => state.QuestionInfoModule.QuestionList,
      VariableList: state => state.QuestionInfoModule.VariableList,
      SectionList: state => state.QuestionInfoModule.SectionList
    }),

    // toggle the resource base
    showResourcePanel: {
      get: function() {
        return this.$store.state.showResourcePanel;
      },
      set: function(newValue) {
        this.$store.state.showResourcePanel = newValue;
      }
    },

    // data to be watched
    saveDataStatus() {
      return (
        this.QuestionnaireInfo +
        this.QuestionList +
        this.VariableList +
        this.SectionList
      );
    },

    previewHref() {
      let from = this.GetQueryValue1('from') || 1
      let previewQuery = ''
      if (this.QuestionnaireInfo.questionnaireId) {
        previewQuery += `qid=${this.QuestionnaireInfo.questionnaireId}`
      }

      if (this.QuestionnaireInfo.moduleId) {
        previewQuery += `&mid=${this.QuestionnaireInfo.moduleId}`
      }

      previewQuery += `&from=${from}`

      return `http://${this.baseHost}/ringsurvey/qnaire/preview/index.html?${previewQuery}`
    }
  },
  watch: {},
  methods: {
    ...mapMutations(["changeEditStatus"]),
    ...mapActions(["resetData"]),

    // import questionnaire
    onFileChange(e) {
      let _this = this;

      // if the edit box is open,then close it
      _this.changeEditStatus({ openEditBox: false, questionEdit: false });
      SurvmlReader.readSurvmlFile(e.currentTarget, function(fileContent) {
        _this.resetData();
        _this.QuestionnaireInfo.originSurvml = fileContent;

        try {
          console.log(fileContent)
          SurvmlReader.parseSurvml(fileContent);
        } catch (e) {
          console.log(e)
          alert(`无法加载问卷：${e}`);
          return false;
        }
      });
    },

    // save questionnaire
    save() {
      let _this = this;
      let xmlContent = "";
      // this.reSecion();
      try {
        xmlContent = SurvmlWriter.writeSurvml();
      } catch (e) {
        alert(e);
        return false;
      }
      console.log(xmlContent);
      let questionNum, pageNum;
      questionNum = this.QuestionList.filter(question => question.type != 'section').length;
      pageNum = this.SectionList.length;
      var params = {
        id: _this.QuestionnaireInfo.questionnaireId,
        moduleId: _this.QuestionnaireInfo.moduleId,
        projectId: _this.QuestionnaireInfo.projectId,
        name: _this.QuestionnaireInfo.title,
        labelText: _this.QuestionnaireInfo.tag,
        identity: _this.QuestionnaireInfo.responseIdentity,
        // maxRepeatCount: _this.QuestionnaireInfo.periodicTimes,
        // isHasRepeat: _this.QuestionnaireInfo.periodicVal,
        // repeatPage: _this.QuestionnaireInfo.periodicPage,
        xmlContent: xmlContent,
        logoUrl: _this.QuestionnaireInfo.logoUrl,
        bgUrl: _this.QuestionnaireInfo.bgUrl,
        questionNum: questionNum,
        pageNum: pageNum,
        welcomeText: _this.QuestionnaireInfo.welcomeText,
        endText: _this.QuestionnaireInfo.endText
      };
      this.httpPost('/w1/questionnaire/save', params).then(res => {
        if (res.code == 0) {
          let data = res.data
          _this.QuestionnaireInfo.questionnaireId = data.questionnaireId || "";
          _this.QuestionnaireInfo.moduleId = data.moduleId || "";
          this.$Message.success('保存成功')
        } else {
          this.$Message.error(res.message)
        }
      }).catch(error => {
        this.$Message.error('无法访问服务器')
      })
      // this.$axios({
      //   method: "post",
      //   url: _this.QuestionnaireInfo.saveurl,
      //   data: qs.stringify(params)
      // })
      //   .then(function(result) {
      //     if (result.data.success) {
      //       alert("问卷保存成功");
      //       let data = result.data.data;
      //       if (!_this.QuestionnaireInfo.questionnaireId) {
      //         _this.QuestionnaireInfo.questionnaireId =
      //           data.questionnaireId || "";
      //       }
      //     } else {
      //       alert(result.msg || "问卷保存失败");
      //     }
      //   })
      //   .catch(function(err) {
      //     alert("无法访问服务器");
      //   });
    },

    // toggle resource base
    showResourcebase() {
      if (this.showResourcePanel == true) {
        this.showResourcePanel = false;
      } else {
        this.showResourcePanel = true;
      }
    },

    // exit the designer
    exit() {
      this.save()
      // window.close();
      if (this.QuestionnaireInfo.projectId) {
        window.location.href = `http://${this.baseHost}/ringsurvey/qn?id=${this.QuestionnaireInfo.projectId}`
      } else {
        window.location.href = `http://${this.baseHost}/ringsurvey/qnaire/mine`
      }
    },

    GetQueryValue1(queryName) {
      var reg = new RegExp("(^|&)" + queryName + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) {
        return decodeURI(r[2]);
      } else {
        return null;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.nav-bar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 110;
  width: 100%;
  height: 80px;
  padding: 0px 20px;
  background: #f9f9f9;
  border-bottom: 2px solid #ddd;
  .navbar-brand {
    float: left;
    height: 80px;
    padding: 0 70px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    .navbar-name {
      font-size: 20px;
      color: #010101;
    }
  }
  .navbar-left,
  .navbar-right {
    float: left;
    height: 80px;
    & > li {
      display: inline-block;
      cursor: pointer;
      width: 80px;
      height: 80px;
      text-align: center;
      padding-top: 18px;
      label,
      a {
        color: #444;
        line-height: 20px;
        display: block;
        cursor: pointer;
        i {
          font-size: 25px;
          color: #ff8540;
        }
      }
      .ivu-select-dropdown {
        a {
          font-size: 14px;
          text-align: left;
        }
      }
    }
  }
  .navbar-right {
    float: right;
  }
}
</style>
