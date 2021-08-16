<!-- auxiliary bar (right) -->
<template>
  <div class="right" id="right-menu">
    <ul class="menu">
      <li class="active" data-target="#question-catalog">
        <i class="fa fa-list"></i>
        <p>目录</p>
      </li>
      <li data-target="#variable-list">
        <i class="fa fa-hashtag"></i>
        <p>变量</p>
      </li>
      <li data-target="#theme-list" style="padding-top:7px;">
        <i class="monetware-icon-style"></i>
        <p>风格</p>
      </li>
      <li data-target="#language-list">
        <i class="fa fa-globe"></i>
        <p>语言</p>
      </li>
    </ul>
    <!-- questionnaire catalog -->
    <div class="menu-item active" id="question-catalog">
      <!-- questions are already in page -->
      <Collapse simple v-model="open">
        <Panel :name="section.guid" v-for="(section,sectionIndex) in SectionList" :key="section.guid">
          <span>
            {{section.id + (section.title[currentLanguage] || section.title['zh'])}}
            <i class="fa fa-trash" @click="deleteSection({section:section,index:sectionIndex})"></i>
          </span>
          <div slot="content">
            <draggable
              class="list-group"
              element="div"
              v-model="section.content"
              :options="dragOptions"
              :move="onMove"
              @start="isDragging=true"
              @end="onEnd"
            >
              <transition-group type="transition" :name="'flip-list'">
                <div
                  class="catalog-item"
                  v-for="(question,index) in section.content"
                  :key="question.guid"
                  :data-id="question.id"
                  @click="scrollInto(`#${question.id}`)"
                  @dblclick="_insertSection({questionIndex:index,sectionIndex:sectionIndex,question:question,flag:'section'})"
                >
                  <span v-html="getQuestionIcon(question)"></span>
                  <span>{{question.id + question.title[currentLanguage] || question.title['zh']}}</span>
                  <i v-if="question.filters.length > 0" class="fa fa-code-fork"></i>
                  <i v-if="question.validation.length > 0" class="fa fa-check-circle-o"></i>
                  <div class="question-tool-bar">
                    <div class="question-tool reorder" title="移动">
                      <i class="fa fa-reorder"></i>
                    </div>
                    <div class="question-tool" title="分页">
                      <i class="monetware-icon-page" @click.stop="_insertSection({questionIndex:index,sectionIndex:sectionIndex,question:question,flag:'section'})"></i>
                    </div>
                    <div
                      class="question-tool"
                      title="复制"
                      @click.stop="copyQuestion({questionIndex:index,sectionIndex:sectionIndex,question:question,flag:'section'})"
                    >
                      <i class="fa fa-copy"></i>
                    </div>
                    <div
                      class="question-tool"
                      title="删除"
                      @click.stop="deleteQuestion({questionIndex:index,sectionIndex:sectionIndex,question:question,flag:'section'})"
                    >
                      <i class="fa fa-trash"></i>
                    </div>
                  </div>
                </div>
              </transition-group>
            </draggable>
          </div>
        </Panel>
      </Collapse>

      <!-- questions are not in page -->
      <draggable
        class="list-group"
        element="div"
        v-model="CatalogList"
        :options="dragOptions"
        :move="onMove"
        @start="isDragging=true"
        @end="onEnd"
      >
        <transition-group type="transition" :name="'flip-list'">
          <div
            class="catalog-item not-in-page"
            v-for="(question,index) in CatalogList"
            :key="question.guid"
            :data-id="question.id"
            @click="scrollInto(`#${question.id}`)"
            @dblclick="insertSection({question:question,questionIndex:index,flag:'catalog'})"
          >
            <span style="color:#f05e1f;" v-html="getQuestionIcon(question)"></span>
            <span>{{question.id + question.title[currentLanguage] || question.title['zh']}}</span>
            <i v-if="question.filters.length > 0" style="color:#f05e1f;" class="fa fa-code-fork"></i>
            <i v-if="question.validation.length > 0" style="color:#f05e1f;" class="fa fa-check-circle-o"></i>
            <div class="question-tool-bar">
              <div class="question-tool reorder" title="移动">
                <i class="fa fa-reorder"></i>
              </div>
              <div
                class="question-tool"
                title="复制"
                @click.stop="copyQuestion({question:question,questionIndex:index,flag:'catalog'})"
              >
                <i class="fa fa-copy"></i>
              </div>
              <div class="question-tool" title="分页">
                <i class="monetware-icon-page" @click.stop="insertSection({question:question,questionIndex:index,flag:'catalog'})"></i>
              </div>
              <div
                class="question-tool"
                title="删除"
                @click.stop="deleteQuestion({questionIndex:index,question:question,flag:'catalog'})"
              >
                <i class="fa fa-trash"></i>
              </div>
            </div>
          </div>
        </transition-group>
      </draggable>
    </div>
    <!-- questionnaire variables -->
    <div class="menu-item" id="variable-list">
      <Form :label-width="60" label-position="left" :model="currentVariable" v-show="showEditForm">
        <FormItem label="编码">
          <Input type="text" v-model="currentVariable.id" :disabled="isEdit==true? true:false"/>
        </FormItem>
        <FormItem label="类型">
          <Select :transfer="true" v-model="currentVariable.type">
            <Option value="int">整数</Option>
            <Option value="float">小数</Option>
            <Option value="boolean">真假</Option>
            <Option value="string">文本</Option>
            <Option value="value">对象</Option>
            <Option value="list">列表</Option>
          </Select>
        </FormItem>
        <FormItem label="只读">
          <Checkbox v-model="currentVariable.readonly"></Checkbox>
        </FormItem>
        <FormItem label="初始值" v-if="currentVariable.type !='list'">
          <Input type="text" v-model="currentVariable.value"/>
        </FormItem>
        <!-- when the type is list -->
        <div class="list" v-if="currentVariable.type =='list'">
          <Row class="list-item text-right">
            <i-button size="small" shape="circle" @click="addListVariable()">添加行</i-button>
            <label for="uploadVariable">
              <span class="btn-upload" shape="circle">上传文件</span>
              <input
                type="file"
                id="uploadVariable"
                accept=".xls, .xlsx"
                style="display: none;"
                @change="uploadVariable($event)"
              >
            </label>
            <i-button size="small" shape="circle" @click="downloadVariableTemp()">下载模版</i-button>
          </Row>
          <Row class="list-item header">
            <i-col span="4">id</i-col>
            <i-col span="10">title</i-col>
            <i-col span="10">parentId</i-col>
          </Row>
          <Row class="list-item" v-for="(listItem,index) in listVariable" :key="index">
            <i-col span="4">
              <Input type="text" v-model="listItem.id"/>
            </i-col>
            <i-col span="10" class="pl10">
              <Input type="text" v-model="listItem.title"/>
            </i-col>
            <i-col span="8" class="pl10">
              <Input type="text" v-model="listItem.parentId"/>
            </i-col>
            <i-col span="2" class="pl10">
              <i class="fa fa-trash" @click="deleteListVariable(index)"></i>
            </i-col>
          </Row>
        </div>
        <FormItem>
          <i-button type="warning" @click="saveVariable()">保存</i-button>
          <i-button @click="cancel()">取消</i-button>
        </FormItem>
      </Form>
      <table id="variable-table">
        <thead>
          <tr>
            <th>编码</th>
            <th>类型</th>
            <th>初始值</th>
            <th @click="showEditForm = true">
              <i class="fa fa-plus-circle add-variable"></i>
            </th>
          </tr>
        </thead>
        <tbody id="tbody" v-if="VariableList.length == 0">
          <tr>
            <td colspan="4" class="text-left">尚未添加变量</td>
          </tr>
        </tbody>
        <tbody id="tbody" v-if="VariableList.length > 0">
          <tr v-for="(variable,index) in VariableList" :key="index">
            <td>{{variable.id}}</td>
            <td>{{transformVariableType(variable.type)}}</td>
            <td v-if="variable.type != 'list'">{{variable.value}}</td>
            <td v-if="variable.type == 'list'">
              <i class="fa fa-list-ul"></i>
            </td>
            <td>
              <i class="fa fa-trash" @click="deleteVariable(index)"></i>
              <i class="fa fa-pencil-square-o" @click="editVariable(variable,index)"></i>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- questionnaire theme -->
    <div class="menu-item" id="theme-list">
      <Tabs value="background">
        <TabPane label="设置背景" name="background">
          <div
            class="theme-item active"
            data-theme="orange"
            v-for="(theme,index) in ThemeList"
            :key="index"
          >
            <div class="wrapper-img">
              <img :src="theme.img" alt="...">
              <p>{{theme.title}}</p>
            </div>
            <i class="fa fa-check-circle" v-show="theme.isCheck" @click="selectTheme(theme)"></i>
            <i class="fa fa-circle" v-show="!theme.isCheck" @click="selectTheme(theme)"></i>
          </div>
        </TabPane>
        <TabPane label="文字格式" name="text">
          <div class="text-item">
            <span class="text-title">字体大小：</span>
            <div>
              <RadioGroup v-model="fontSize" type="button">
                <Radio label="small">小</Radio>
                <Radio label="middle">中</Radio>
                <Radio label="large">大</Radio>
              </RadioGroup>
            </div>
          </div>
          <div class="text-item">
            <span class="text-title">标题颜色：</span>
            <div>
              <colorPicker v-model="titleColor" />
            </div>
          </div>
          <div class="text-item">
            <span class="text-title">题干颜色：</span>
            <div>
              <colorPicker v-model="stemColor" />
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
    <!-- questionnaire languages -->
    <div class="menu-item" id="language-list">
      <Row>
        <i-col span="11" offset="1">
          <i-button :long="true" @click="exportLanguage()">
            <i class="monetware-icon-export-lang"></i> 导出问卷内容
          </i-button>
        </i-col>
        <i-col span="10" offset="1">
          <i-button :long="true" type="warning" @click="importFile()">
            <i class="monetware-icon-import-lang"></i> 导入问卷
          </i-button>
          <input
            type="file"
            accept=".xls, .xlsx"
            ref="language_file"
            @change="importLanguage($event)"
            style="display:none;"
          >
        </i-col>
      </Row>
      <ul class="languages" v-show="languages.length>1">
        <li class="language-item" v-for="(language,index) in languages" :key="index">
          <span>{{transformLanguage(language.lang)}}</span>
          <span v-show="!language.isActive" @click="changeLanguage(language,index)">
            <i class="fa fa-circle"></i>
          </span>
          <span v-show="language.isActive" @click="changeLanguage(language,index)">
            <i class="fa fa-check-circle"></i>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import XLSX from "xlsx";
import { mapState, mapActions, mapMutations } from "vuex";
import QuestionType from "../constant/question-type.js";
import LanguageType from "../constant/language-type";
import Variable from "../variable/variable";
export default {
  name: "",
  components: { draggable },
  data() {
    return {
      open: [],
      isDragging: false,
      delayedDragging: false,
      QuestionType: QuestionType,
      ThemeList: [
        {
          type: "orange",
          title: "默认风格",
          img: require("../assets/images/orange.png"),
          isCheck: true
        },
        {
          type: "blue",
          title: "蓝蓝的天空",
          img: require("../assets/images/blue.png"),
          isCheck: false
        }
      ],
      showEditForm: false,
      isEdit: false,
      currentVariable: { id: "", type: "", readonly: false, value: "" },
      listVariable: [{ id: "", title: "", parentId: "" }],
      fontSize: 'small',
      titleColor: '#f05e1f',
      stemColor: '#f05e1f'
    };
  },
  computed: {
    ...mapState({
      currentLanguage: state =>
        state.QuestionnaireInfoMoudle.QuestionnaireInfo.currentLanguage,
      QuestionnaireInfo: state =>
        state.QuestionnaireInfoMoudle.QuestionnaireInfo,
      QuestionList: state => state.QuestionInfoModule.QuestionList,
      SectionList: state => state.QuestionInfoModule.SectionList,
      VariableList: state => state.QuestionInfoModule.VariableList
    }),

    languages: {
      get() {
        let arr = [];
        for (let language of this.QuestionnaireInfo.languages) {
          if (language == "zh") {
            arr.push({ lang: language, isActive: true });
          } else {
            arr.push({ lang: language, isActive: false });
          }
        }
        return arr;
      },
      set(newValue) {}
    },

    CatalogList: {
      get() {
        return this.$store.state.QuestionInfoModule.CatalogList;
      },
      set(newList) {
        this.$store.state.QuestionInfoModule.CatalogList = newList;
      }
    },

    //  configure of dragging
    dragOptions() {
      return {
        animation: 300,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
        handle: ".reorder"
      };
    }
  },
  watch: {
    isDragging(newValue) {
      if (newValue) {
        this.delayedDragging = true;
        return;
      }
      this.$nextTick(() => {
        this.delayedDragging = false;
      });
    }
  },
  mounted() {
    // toggle the right side menu
    $(document).on("click", "#right-menu .menu li", function(e) {
      e.preventDefault();

      // the current tab
      $("#right-menu .menu li").removeClass("active");
      $(this).addClass("active");
      // the current content
      let target = $(this).data("target");
      $(`#right-menu .menu-item`).removeClass("active");
      $(`#right-menu .menu-item${target}`).addClass("active");
    });
  },
  methods: {
    ...mapActions([
      "reorderQuestion",
      "deleteQuestion",
      "copyQuestion",
      "exportLanguage",
      "importLanguage",
      "insertSection",
      "deleteSection",
      "saveVariableList"
    ]),

    _insertSection (params) {
      this.open = [this.SectionList[params.sectionIndex].guid];
      this.insertSection(params);
    },

    scrollInto(id) {
      document.querySelector(id).scrollIntoView({
        behavior: 'smooth'
      });
    },

    onMove({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;

      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
    },

    onEnd(e) {
      this.isDragging = false;
      this.reorderQuestion();
      setTimeout(() => {
        let targetId = e.item.dataset.id;
        this.SectionList.forEach(section => {
          section.content.forEach(question => {
            if (question.id == targetId) {
              this.open = [section.guid];
            }
          })
        }, 0)
      })
    },

    // get the icon font of questionnaire catalog
    getQuestionIcon(question) {
      let html = ``;
      switch (question.type) {
        case QuestionType.INFO.name:
          html += `<i class="monetware-icon-label"></i>`;
          break;
        case QuestionType.SINGLE.name:
          html += `<i class="monetware-icon-singleselect"></i>`;
          break;
        case QuestionType.DROPDOWN.name:
          html += `<i class="monetware-icon-dropdown"></i>`;
          break;
        case QuestionType.MULTIPLE.name:
          html += `<i class="monetware-icon-multiselect"></i>`;
          break;
        case QuestionType.TEXT.name:
          html += `<i class="monetware-icon-text"></i>`;
          break;
        case QuestionType.TEXTAREA.name:
          html += `<i class="monetware-icon-textarea"></i>`;
          break;
        case QuestionType.INTEGER.name:
          html += `<i class="fa fa-italic"></i>`;
          break;
        case QuestionType.FLOAT.name:
          html += `<i class="fa fa-facebook"></i>`;
          break;
        case QuestionType.DATETIME.name:
          html += `<i class="monetware-icon-datetime"></i>`;
          break;
        case QuestionType.ASSIGNMENT.name:
          html += `<i class="monetware-icon-assignment"></i>`;
          break;
        case QuestionType.SORT.name:
          html += `<i class="monetware-icon-sort"></i>`;
          break;
        case QuestionType.SCALE.name:
          html += `<i class="fa fa-star-o"></i>`;
          break;
        case QuestionType.MATRIX.name:
          if (
            question.matrixtype == "singledimension" &&
            question.cols[0].type == QuestionType.SINGLE.name
          ) {
            html += `<i class="monetware-icon-matrix-single"></i>`;
          } else if (
            question.matrixtype == "singledimension" &&
            question.cols[0].type == QuestionType.MULTIPLE.name
          ) {
            html += `<i class="monetware-icon-matrix-multi"></i>`;
          } else {
            html += `<i class="monetware-icon-matrix"></i>`;
          }
          break;
        case QuestionType.PHOTO.name:
          html += `<i class="monetware-icon-photo"></i>`;
          break;
        case QuestionType.LOCATION.name:
          html += `<i class="monetware-icon-location"></i>`;
          break;
        case QuestionType.PROVCITY.name:
          html += `<i class="monetware-icon-quhua"></i>`;
          break;
        case QuestionType.SEARCH.name:
          html += `<i class="fa fa-search"></i>`;
          break;
        case QuestionType.RECORDING.name:
          html += `<i class="fa fa-microphone"></i>`;
          break;
        case QuestionType.CASCADE.name:
          html += `<i class="monetware-icon-quhua"></i>`;
          break;
        case QuestionType.FILE.name:
          html += `<i class="fa fa-file-o"></i>`;
          break;
        case QuestionType.SIGNATURE.name:
          html += `<i class="monetware-icon-signature"></i>`;
          break;
        case "section":
          html += `<i class="monetware-icon-page"></i>`;
          break;
      }
      return html;
    },

    // add a new variable or edit a variable
    saveVariable() {
      if (this.currentVariable.type == "list") {
        this.currentVariable.value = this.listVariable;
      }
      if (!this.currentVariable.id) {
        alert("请填写变量编码");
        return false;
      }

      let variable = new Variable(this.currentVariable);

      if (this.isEdit) {
        let index = this._getVariableIndexById(this.currentVariable.id);
        this.VariableList.splice(index, 1, variable);
      } else {
        if (this.checkVariableExists(this.currentVariable.id)) {
          alert(`变量${this.currentVariable.id}已存在`);
          return false;
        } else {
          this.VariableList.push(variable);
          this.saveVariableList(this.VariableList);
        }
      }
      this.currentVariable = { id: "", type: "", readonly: false, value: "" };
      this.listVariable = [{ id: "", title: "", parentId: "" }];
      this.isEdit = false;
      this.showEditForm = false;
    },
    _getVariableIndexById(id) {
      let index = -1;
      for (let variable of this.VariableList) {
        index += 1;
        if (variable.id == id) {
          return index;
        }
      }
      return -1;
    },
    checkVariableExists(id) {
      for (let variable of this.VariableList) {
        if (variable.id == id) {
          return true;
        }
      }
      return false;
    },

    // cancel add or edit a variable
    cancel() {
      this.currentVariable = { id: "", type: "", readonly: false, value: "" };
      this.isEdit = false;
      this.showEditForm = false;
    },

    // delete a variable
    deleteVariable(index) {
      this.VariableList.splice(index, 1);
    },

    // edit a variable
    editVariable(variable, index) {
      let editV = new Variable(variable);
      this.showEditForm = true;
      this.isEdit = true;
      this.currentVariable = editV;
      if (editV.type == "list") {
        this.listVariable = editV.value;
      }
    },

    // add a new item when the type of variable is list
    addListVariable() {
      let newItem = { id: "", title: "", parentId: "" };
      this.listVariable.push(newItem);
    },

    // delete a item when the type of variable is list
    deleteListVariable(index) {
      this.listVariable.splice(index, 1);
    },

    // download the template of variable
    downloadVariableTemp() {
      let fileName = "列表变量模版.xlsx";
      let sheetName = "worksheet1";
      let titleRow = [["id", "title", "parentId"]];
      let workbook = XLSX.utils.book_new();
      let workSheet = XLSX.utils.aoa_to_sheet(titleRow);

      XLSX.utils.book_append_sheet(workbook, workSheet, sheetName);

      XLSX.writeFile(workbook, fileName);
    },

    // upload items when the type of variable is list
    uploadVariable(e) {
      let _this = this;
      let file = e.target.files[0];
      let reader = new FileReader();

      reader.onload = function(e) {
        let data = e.target.result;
        let workbook = XLSX.read(data, { type: "binary" });
        let sheetName = workbook.SheetNames[0];
        let contentList = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (contentList.length > 0) {
          _this.listVariable = contentList;
        }
      };
      reader.readAsBinaryString(file);
      e.target.value = "";
    },

    // transform the variable type to Chinese in the variables table
    transformVariableType(type) {
      let name = "";
      switch (type) {
        case "int":
          name = "整数";
          break;
        case "float":
          name = "小数";
          break;
        case "string":
          name = "文本";
          break;
        case "boolean":
          name = "真假";
          break;
        case "value":
          name = "对象";
          break;
        case "list":
          name = "列表";
          break;
      }
      return name;
    },

    // setting the theme of the questionnaire
    selectTheme(theme) {
      for (let theme of this.ThemeList) {
        theme.isCheck = false;
      }
      theme.isCheck = true;
      this.QuestionnaireInfo.metas[0].text = theme.type;
    },

    // import a translation file
    importFile() {
      this.$refs.language_file.click();
    },

    // transform a language into Chinese
    transformLanguage(language) {
      let text = "";
      for (let code in LanguageType) {
        if (language == code) {
          text = LanguageType[code];
          return text;
        }
      }
    },

    // change current language
    changeLanguage(language, index) {
      for (let lang of this.languages) {
        lang.isActive = false;
      }
      language.isActive = true;
      this.QuestionnaireInfo.currentLanguage = language.lang;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/style/variables.scss";
.right {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: $rightWidth;
  overflow-y: auto;
  .menu {
    position: absolute;
    top: 0;
    width: 100%;
    display: flex;
    height: 70px;
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-right: none;
    margin-top: -1px;
    margin-left: -1px;
    margin-bottom: 0;
    z-index: 1;
    .ivu-collapse-header {
      padding-left: 10px;
    }
    li {
      width: 100px;
      height: 70px;
      padding-top: 15px;
      color: #757575;
      text-align: center;
      cursor: pointer;
      i {
        font-size: 25px;
      }
      &:hover {
        background-color: #eee;
      }
    }
    li.active {
      color: #010101;
      background: #fff;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
      border-bottom: 1px solid transparent;
      margin-left: -1px;
      margin-right: -1px;
      margin-bottom: -1px;
      i {
        color: #f05e1f;
      }
      &:hover {
        background-color: #fff;
      }
    }
  }
  .menu-item {
    display: none;
    padding: 10px;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding-top: 80px;
    &#question-catalog {
      .catalog-item {
        padding: 10px 0px 10px 10px;
        cursor: pointer;
        overflow-x: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        &.not-in-page {
          padding-left: 0px;
        }
        .question-tool-bar {
          display: none;
          position: absolute;
          top: 0;
          right: 0;
          margin-top: 7px;
          z-index: 100;
          display: none;
          font-size: 0;
          background-color: #f9f9f9;
          .question-tool {
            display: inline-block;
            padding: 5px;
            i {
              color: #444;
              font-size: 14px;
              margin-right: 0;
            }
          }
          .reorder {
            color: #000;
            cursor: move;
          }
        }
        &:hover {
          background-color: #f9f9f9;
          position: relative;
          .question-tool-bar {
            display: block;
          }
        }
        &.selected {
          background-color: #f9f9f9;
          position: relative;
        }
      }
    }
    &#variable-list {
      .list {
        max-height: 350px;
        overflow-y: auto;
        .header {
          div {
            text-align: center;
          }
        }
        .list-item {
          margin-bottom: 15px;
          line-height: 32px;
          i {
            cursor: pointer;
            color: #888;
          }
          .btn-upload {
            padding: 6px 10px 7px;
            font-size: 12px;
            background-color: #fff;
            border: 1px solid #dcdee2;
            border-radius: 32px;
            line-height: 1.5;
            transition: color 0.2s linear, background-color 0.2s linear,
              border 0.2s linear, box-shadow 0.2s linear;
            cursor: pointer;
            &:hover {
              color: #57a3f3;
              border-color: #57a3f3;
            }
          }
        }
      }
      #variable-table {
        width: 100%;
        border-spacing: 0;
        border-collapse: collapse;
        th,
        td {
          text-align: center;
          padding: 8px;
          i {
            padding: 4px;
            cursor: pointer;
            color: #444;
          }
        }
        th {
          border-bottom: 2px solid #ddd;
        }
      }
    }
    &#theme-list {
      .theme-item {
        position: relative;
        margin-bottom: 20px;
        .wrapper-img {
          width: 122px;
          height: 195px;
          text-align: center;
          margin-left: 30px;
        }
        i {
          font-size: 30px;
          position: absolute;
          right: 30px;
          top: 55px;
          color: #b9b5b5;
          cursor: pointer;
          &.fa-check-circle {
            color: #f05e1f;
          }
        }
      }
      .text-item {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        .text-title {
          width: 80px;
        }
      }
    }
    &#language-list {
      .languages {
        padding: 0px;
        margin: 15px 15px 0px;
        .language-item {
          padding: 8px 0px;
          i {
            float: right;
            font-size: 25px;
            color: #b9b5b5;
            cursor: pointer;
          }
          .fa-check-circle {
            color: #f05e1f;
          }
        }
      }
    }
  }
  .menu-item.active {
    display: block;
  }
}
</style>
<style type="text/csss">
.right .ivu-collapse {
  border: 0px;
}
.right .ivu-collapse > .ivu-collapse-item > .ivu-collapse-header {
  padding-left: 0px;
  position: relative;
}
.right .ivu-collapse > .ivu-collapse-item > .ivu-collapse-header > i {
  margin-right: 0px;
}
.right .ivu-collapse > .ivu-collapse-item > .ivu-collapse-header i.fa {
  display: none;
  position: absolute;
  right: 5px;
  top: 10px;
}
.right .ivu-collapse > .ivu-collapse-item > .ivu-collapse-header:hover i.fa {
  display: block;
  cursor: pointer;
}
.right .ivu-collapse .ivu-collapse-content {
  padding: 0px 0px 0px 7px;
}
.right .ivu-collapse-content > .ivu-collapse-content-box {
  padding-bottom: 0px;
}
.right .ivu-tabs-nav .ivu-tabs-tab-active {
  border-bottom: 3px solid;
}
.right .ivu-tabs-tab {
  font-weight: bold;
}
.right .ivu-tabs-ink-bar {
  background-color: initial !important;
}
.right .m-colorPicker .open {
  left: -30px;
  width: 220px !important;
}
.right .m-colorPicker .box {
  left: -30px;
  width: 220px !important;
}
.right .m-colorPicker .colorBtn {
  cursor: pointer;
}
</style>
