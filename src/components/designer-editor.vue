<!-- edit box -->
<template>
  <div class="wrapper-editor" ref="wrapper-editor" id="wrapper-editor" :class="{open:openEditBox}">
    <div class="editor-resize-bar" id="editor-resize-bar"></div>
    <div class="tool-bar">
      <div class="save">
        <span v-if="isScreenfull" @click="changeScreenfull('exit')">
          <i class="monetware-icon-exit-screenfull"></i> 退出全屏
        </span>
        <span v-else @click="changeScreenfull('full')">
          <i class="monetware-icon-screenfull"></i> 全屏
        </span>
      </div>
      <div class="save" @click="saveEdit">
        <i class="fa fa-check"></i> 完成编辑
      </div>
      <div class="cancel" @click="cancelEdit">
        <i class="fa fa-times-circle-o"></i> 取消
      </div>
    </div>
    <div class="editor-box" id="editor-box">
      <div class="editor-header">
        <ul class="editor-nav" v-if="questionEdit">
          <li
            v-for="(item,index) in editorTabs"
            :key="index"
            :class="{active:isActive === index}"
            @click="toggleTab(index,item.view,'question')"
          >
            <a href="javascript:void(0)">
              <i :class="item.icon"></i>
              {{item.text}}
            </a>
          </li>
        </ul>
        <!-- <ul class="editor-nav" v-if="isEditSection">
          <li
            v-for="(item,index) in sectionEditorTabs"
            :key="`section-editor-${index}`"
            :class="{active:isActiveSection === index}"
            @click="toggleTab(index,item.view,'section')"
          >
            <a href="javascript:void(0)">
              <i :class="item.icon"></i>
              {{item.text}}
            </a>
          </li>
        </ul> -->
      </div>
      <div class="editor-body">
        <div class="question-editor" v-if="questionEdit">
          <keep-alive>
            <component :is="currentView"></component>
          </keep-alive>
        </div>
        <!-- questionnaire edit start -->
        <div class="questionnaire-editor" v-else-if="!isEditSection">
          <Form :model="currentQuestionnaireInfo" label-position="left" :label-width="150">
            <FormItem label="标题：">
              <Input type="text" v-model="currentQuestionnaireInfo.title"/>
            </FormItem>
            <FormItem label="标签：">
              <Input type="text" v-model="currentQuestionnaireInfo.tag" placeholder="请输入问卷标签"/>
            </FormItem>
            <FormItem label="标识题：">
              <Select v-model="currentQuestionnaireInfo.responseIdentityArr" multiple>
                <Option
                  v-for="(question,index) in QuestionList"
                  :value="question.id"
                  :key="index"
                  v-if="question.type == QuestionType.TEXT.name || question.type == QuestionType.DROPDOWN.name"
                >{{question.id}} {{question.title[currentLanguage] || question.title['zh']}}</Option>
              </Select>
            </FormItem>
            <FormItem label="题号：">
              <Select v-model="currentQuestionnaireInfo.showid">
                <Option value="true">显示</Option>
                <Option value="false">隐藏</Option>
              </Select>
            </FormItem>
            <FormItem v-if="permission[role].logo_bg" label="自定义图标：">
              <div v-if="currentQuestionnaireInfo.logoUrl" class="demo-upload-list">
                <template>
                  <img :src="baseUrl + currentQuestionnaireInfo.logoUrl">
                  <div class="demo-upload-list-cover">
                    <Icon @click="delUrl(currentQuestionnaireInfo.logoUrl, 'logo')" type="ios-trash-outline"></Icon>
                  </div>
                </template>
              </div>
              <Upload
                v-else
                ref:upload
                :show-upload-list="false"
                :default-file-list="defaultList"
                :on-success="handleSuccessLogo"
                :format="['jpg','jpeg','png']"
                :max-size="2048"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                type="drag"
                :action="baseUrl + '/w1/questionnaire/file/upload' + '?access_token=' + token"
                style="display: inline-block;width:58px;">
                <div style="width: 58px;height:58px;line-height: 58px;">
                  <Icon type="ios-camera" size="20" />
                </div>
              </Upload>
            </FormItem>
            <FormItem v-if="permission[role].logo_bg" label="自定义背景：">
              <div v-if="currentQuestionnaireInfo.bgUrl" class="demo-upload-list">
                <template>
                  <img :src="baseUrl + currentQuestionnaireInfo.bgUrl">
                  <div class="demo-upload-list-cover">
                    <Icon @click="delUrl(currentQuestionnaireInfo.bgUrl, 'bg')" type="ios-trash-outline"></Icon>
                  </div>
                </template>
              </div>
              <Upload
                v-else
                ref:upload
                :show-upload-list="false"
                :default-file-list="defaultList"
                :on-success="handleSuccessBg"
                :format="['jpg','jpeg','png']"
                :max-size="2048"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                type="drag"
                :action="baseUrl + '/w1/questionnaire/file/upload' + '?access_token=' + token"
                style="display: inline-block;width:58px;">
                <div style="width: 58px;height:58px;line-height: 58px;">
                  <Icon type="ios-camera" size="20" />
                </div>
              </Upload>
            </FormItem>
            <FormItem label="导语：">
              <div id="welcomeText"></div>
            </FormItem>
            <FormItem label="结束语：">
              <div id="endText"></div>
            </FormItem>
            <!-- <FormItem label="是否显示进度：">
              <Select v-model="currentQuestionnaireInfo.isShowProgress">
                <Option
                  v-for="item in checkedOption"
                  :value="item.value"
                  :key="item.value">
                  {{item.label}}
                </Option>
              </Select>
            </FormItem> -->
          </Form>
        </div>
        <!-- questionnaire edit end -->
        <!-- section edit start -->
        <div class="questionnaire-editor" v-else>
          <keep-alive>
            <component :is="currentSectionView"></component>
          </keep-alive>
        </div>
        <!-- section edit end -->
      </div>
    </div>
  </div>
</template>

<script>
import { pasteTextHandle } from '../tool/utils.js'
import { mapState, mapMutations, mapActions } from "vuex";
import QuestionType from "../constant/question-type.js";
import * as Utils from "../tool/utils";
import sectionEditorContent from './designer-editor-content-page';
import editorContent from "./designer-editor-content";
import sectionEditorFilter from './designer-editor-filter-page';
import editorFilter from "./designer-editor-filter";
import editorValidation from "./designer-editor-validation";
import screenfull from 'screenfull';
import wangEditor from 'wangeditor';
import permission from '../permission';

export default {
  name: "editor",
  components: { sectionEditorContent, editorContent, sectionEditorFilter, editorFilter, editorValidation },
  data() {
    return {
      token: null,
      editorTabs: [
        // tab items of question edit
        { text: "内容", icon: "fa fa-file-text-o", view: editorContent },
        { text: "逻辑", icon: "fa fa-code-fork", view: editorFilter },
        { text: "验证", icon: "fa fa-check-circle-o", view: editorValidation }
      ],
      sectionEditorTabs: [
        { text: "内容", icon: "fa fa-file-text-o", view: sectionEditorContent },
        { text: "逻辑", icon: "fa fa-code-fork", view: sectionEditorFilter },
        // { text: "验证", icon: "fa fa-check-circle-o", view: editorValidation }
      ],
      isActive: 0, // the current tab item
      isActiveSection: 0,
      currentView: editorContent, // the current component
      currentSectionView: sectionEditorContent,
      QuestionType: QuestionType,
      checkedOption: [
        {
          value: 0,
          label: "否"
        },
        {
          value: 1,
          label: "是"
        }
      ],
      hasPeriodic: false,
      curPeriodicVal: 0,
      curPeriodicPage: '',
      curPeriodicTimes: 1,
      curIsShowProgress: 0,
      isScreen: false,
      defaultList: [],
      permission: permission
    };
  },
  computed: {
    ...mapState({
      role: "role",
      isEditSection: "isEditSection",
      openEditBox: "openEditBox", // toggle the edit box
      questionEdit: "questionEdit", // question edit or questionnaire edit
      currentLanguage: state =>
        state.QuestionnaireInfoMoudle.QuestionnaireInfo.currentLanguage,
      QuestionnaireInfo: state =>
        state.QuestionnaireInfoMoudle.QuestionnaireInfo,
      QuestionList: state => state.QuestionInfoModule.QuestionList,
      currentQuestionnaireInfo: state =>
        state.QuestionnaireInfoMoudle.currentQuestionnaireInfo,
      isScreenfull: state => state.QuestionnaireInfoMoudle.isScreenfull,
      QuestionInfo: state => state.QuestionInfoModule.currentQuestionInfo,
      SectionList: state=>state.QuestionInfoModule.SectionList,
      uploadList () {
        return this.$refs.upload ? this.$refs.upload.fileList : []
      }
    })
  },
  mounted() {
    this.token = this.$cookies.get("tokenWeb")
    // resize the height of edit box
    $("#editor-resize-bar").on("mouseover", function() {
      $("#editor-resize-bar").css({
        backgroundColor: "#F05E1F"
      });
    });

    function resetEditorResizeBarColor() {
      $("#editor-resize-bar").css({
        backgroundColor: "transparent"
      });
    }
    $("#editor-resize-bar").on("mouseout", resetEditorResizeBarColor);
    $("#editor-resize-bar").on("mousedown", function(e) {
      let originHeight = $("#wrapper-editor").height();
      let minHeight = 100;
      let maxHeight = 600;

      $("#editor-resize-bar").off("mouseout");
      $(document).on("mousemove", function(me) {
        let y = e.clientY - me.clientY;
        let resizeHeight = y + originHeight;
        if (resizeHeight > minHeight && resizeHeight < maxHeight) {
          $("#wrapper-editor").css({
            height: resizeHeight
          });
          $("#questionnaire-block").css({
            bottom: resizeHeight
          });
        }
      });
      $(document).on("mouseup", function() {
        $("#editor-resize-bar").css({
          backgroundColor: "transparent"
        });
        $("#editor-resize-bar").on("mouseout", resetEditorResizeBarColor);
        $(document).off("mousemove");
        $(document).off("mouseup");
      });
    });

    this.initWangEditor();

    // 监听全屏变化
    if (screenfull.enabled) {
      screenfull.on('change', () => {
        screenfull.isFullscreen ? this.toggleScreenfull(true) : this.toggleScreenfull(false);
      });
    }
  },
  methods: {
    ...mapMutations(["changeEditStatus", "questionnaireEdit", "toggleScreenfull"]),
    ...mapActions(["saveQuestionnaireEdit", "saveQuestionEdit", "saveSectionInfo", "getPeriodicPageList", "setLogoUrl", "setBgUrl"]),
    
    initWangEditor () {
      let welcomeTextEditor = new wangEditor('#welcomeText')
      welcomeTextEditor.customConfig.zIndex = 0
      welcomeTextEditor.customConfig.pasteTextHandle = function (content) {
        pasteTextHandle(content)
      }
      welcomeTextEditor.customConfig.onchange = html => {
        this.currentQuestionnaireInfo.welcomeText = html
      }
      welcomeTextEditor.customConfig.menus = [
        'head',  // 标题
        'bold',  // 粗体
        'fontSize',  // 字号
        'fontName',  // 字体
        'italic',  // 斜体
        'foreColor',  // 文字颜色
        'backColor',  // 背景颜色
        'justify',  // 对齐方式
        'undo',  // 撤销
        'redo'  // 重复
      ];
      welcomeTextEditor.create()
      welcomeTextEditor.txt.html(this.QuestionnaireInfo.welcomeText)

      let endTextEditor = new wangEditor('#endText')
      endTextEditor.customConfig.zIndex = 0
      endTextEditor.customConfig.pasteTextHandle = function (content) {
        pasteTextHandle(content)
      }
      endTextEditor.customConfig.onchange = html => {
        this.currentQuestionnaireInfo.endText = html
      }
      endTextEditor.customConfig.menus = [
        'head',  // 标题
        'bold',  // 粗体
        'fontSize',  // 字号
        'fontName',  // 字体
        'italic',  // 斜体
        'foreColor',  // 文字颜色
        'backColor',  // 背景颜色
        'justify',  // 对齐方式
        'undo',  // 撤销
        'redo'  // 重复
      ];
      endTextEditor.create()
      endTextEditor.txt.html(this.QuestionnaireInfo.endText)
    },

    handleSuccessLogo (res, file) {
      if (res.code == 0) {
        this.setLogoUrl({ url: res.data })
      }
    },

    handleSuccessBg (res, file) {
      if (res.code == 0) {
        this.setBgUrl({ url: res.data })
      }
    },

    delUrl (url, type) {
      this.httpPost('/w1/questionnaire/file/delete', {
        fileName: url
      }).then(res => {
        if (res.code == 0) {
          if (type == 'logo') {
            this.setLogoUrl({ url: '' })
          } else if (type == 'bg') {
            this.setBgUrl({ url: '' })
          }
        }
      })
    },

    handleFormatError (file) {
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      });
    },

    handleMaxSize (file) {
      this.$Notice.warning({
        title: '超出文件大小限制',
        desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
      });
    },

    toggleTab(index, view, type) {
      if (type == 'question') {
        this.isActive = index;
        this.currentView = view;
      } else if (type == 'section') {
        this.isActiveSection = index;
        this.currentSectionView = view;
      }
    },

    changeScreenfull(val) {
      if (val == 'full' && screenfull.enabled) {
        screenfull.request(this.$refs['wrapper-editor'])
      } else if (val == 'exit' && screenfull.enabled) (
        screenfull.exit(this.$refs['wrapper-editor'])
      )
    },

    saveEdit() {
      this.isScreenfull && this.changeScreenfull('exit');
      if (this.questionEdit == false && !this.isEditSection) {
        let newQuestionnaireInfo = {
          title: this.currentQuestionnaireInfo.title,
          tag: this.currentQuestionnaireInfo.tag,
          responseIdentityArr: this.currentQuestionnaireInfo.responseIdentityArr,
          periodicVal: this.curPeriodicVal,
          periodicPage: this.curPeriodicPage,
          periodicTimes: this.curPeriodicTimes,
          isShowProgress: this.currentQuestionnaireInfo.isShowProgress,
          showid: this.currentQuestionnaireInfo.showid,
          logoUrl: this.currentQuestionnaireInfo.logoUrl,
          bgUrl: this.currentQuestionnaireInfo.bgUrl,
          welcomeText: this.currentQuestionnaireInfo.welcomeText,
          endText: this.currentQuestionnaireInfo.endText
        };
        this.saveQuestionnaireEdit(newQuestionnaireInfo);
        Utils.gotoPosition("#questionnaire-block", `.questionnaire-title`);
      } else if (this.isEditSection) {
        this.saveSectionInfo();
        // Utils.gotoPosition(
        //   "#questionnaire-block",
        //   `[data-question-guid="${this.QuestionInfo.guid}"]`
        // );
      } else {
        this.saveQuestionEdit();
        Utils.gotoPosition(
          "#questionnaire-block",
          `[data-question-guid="${this.QuestionInfo.guid}"]`
        );
      }
    },

    cancelEdit() {
      this.isScreenfull && this.changeScreenfull('exit');
      if (this.questionEdit) {
        Utils.gotoPosition(
          "#questionnaire-block",
          `[data-question-guid="${this.QuestionInfo.guid}"]`
        );
      } else if (this.isEditSection) {
        // console.log('isEditSection', this.isEditSection)
      } else {
        Utils.gotoPosition("#questionnaire-block", `#questionnaire-title`);
      }
      this.changeEditStatus({ openEditBox: false, questionEdit: false });
    },

    changeProgress (value) {
      this.curIsShowProgress = value
    },

    changePeriodic (value) {
      this.curPeriodicVal = value
      if (value == 1) {
        this.hasPeriodic = true
        this.getPeriodicPageList()
      } else {
        this.hasPeriodic = false
      }
    },

    changePeriodicPage (value) {
      this.curPeriodicPage = value
    },

    changePeriodicTimes (value) {
      this.curPeriodicTimes = value
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/style/variables.scss";

.questionnaire-editor /deep/ .ivu-select-dropdown {
  max-height: 180px !important;
}
.wrapper-editor {
  &.open {
    display: block;
  }
  position: absolute;
  left: $leftWidth;
  right: $rightWidth;
  bottom: 0;
  height: 400px;
  display: none;
  background-color: #fcfcfc;
  border: 1px solid #ddd;
  z-index: 99;
  .editor-resize-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    z-index: 4;
    &:hover {
      cursor: ns-resize;
    }
  }
  .tool-bar {
    position: absolute;
    right: 0;
    top: 0;
    height: 30px;
    line-height: 30px;
    z-index: 3;
    .save,
    .cancel {
      .fa {
        color: #f05e1f;
      }
      display: inline-block;
      height: 100%;
      margin: 0 10px;
      cursor: pointer;
    }
  }
  .editor-box {
    height: 100%;
    overflow-y: auto;
    .editor-header {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 30px;
      z-index: 2;
      box-sizing: border-box;
      background-color: #f9f9f9;
      border-bottom: 1px solid #ddd;
      .editor-nav {
        list-style: none;
        margin-bottom: 0;
        height: 30px;
        line-height: 30px;
        margin-left: -1px;
        li {
          display: inline-block;
          a {
            display: block;
            padding: 0 10px;
            color: #000;
            text-decoration: none;
            .fa {
              color: #f05e1f;
            }
            &:active,
            &:focus,
            &:hover {
              color: #000;
              text-decoration: none;
            }
          }
          &.active {
            border: 1px solid #ddd;
            border-top-width: 0;
            border-bottom-color: transparent;
            background-color: #fcfcfc;
            font-weight: bold;
          }
        }
      }
    }
    .editor-body {
      padding: 50px 20px 0 20px;
      .tab-content {
        .validator + .validator,
        .script + .script,
        .action + .action {
          padding-top: 15px;
          border-top: 1px dashed #aaa;
        }
      }
    }
  }
}
.demo-upload-list {
  display: inline-block;
  position: relative;
  width: 58px;
  height: 58px;
  &:hover {
    .demo-upload-list-cover {
      display: inline-block;
    }
  }
  img {
    width: 100%;
    height: 100%;
  }
  .demo-upload-list-cover {
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    text-align: center;
    line-height: 58px;
    background: rgba(0,0,0,.6);
    i {
      color: #fff;
      font-size: 20px;
      cursor: pointer;
    }
  }
}
[class*='monetware-icon'] {
  color: #f05e1f;
}
</style>

<style>
  .ivu-input-number {
    width: 100% !important;
  }
  #welcomeText .w-e-text-container, #endText .w-e-text-container {
    height: 150px !important;
  }
</style>
