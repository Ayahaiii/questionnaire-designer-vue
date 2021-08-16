<template>
  <div class="container">
    <!-- top menu -->
    <designer-header></designer-header>

    <!-- questionnaire content -->
    <div class="designer-content">
      <!-- left nav -->
      <designer-left></designer-left>

      <div class="middle" id="questionnaire-block">
        <h3
          class="questionnaire-title"
          id="questionnaire-title"
          :class="{selected: isSelected  == '0'}"
          @click="questionnaireEdit(QuestionnaireInfo)"
        >{{QuestionnaireInfo.title}}</h3>

        <div class="question-list" id="question-list" v-show="QuestionList.length>0">
          <div
            :class="wrapperClass(question, index)"
            :data-question-guid="question.guid"
            :id="question.id"
            ref="wrapper"
            v-for="(question,index) in QuestionList"
            :key="index"
            @click="questionEdit({question:question,e:$event})">
            
            <div v-if="question.type != 'section'">
              <p class="question-title">
                {{question.id}} {{question.title[currentLanguage] || question.title['zh']}}
                <span v-if="question.required" style="color: #d93636;">（必填）</span>
              </p>
              <p class="resource">
                <img v-if="question.restype == 'img'" :src="question.resurl" alt>
                <audio v-if="question.restype == 'voice'" :src="question.resurl" controls="controls"></audio>
                <video v-if="question.restype == 'video'" :src="question.resurl" controls="controls"></video>
              </p>
              <p class="question-hint" v-show="!question.hintHidden" v-html="question.hint[currentLanguage] || question.hint['zh']"></p>

              <!-- info question -->
              <div class="label-question" v-if="question.type==QuestionType.INFO.name">
                <div v-html="question.content"></div>
              </div>

              <!-- singleselect question -->
              <div class="singleselect-question" v-if="question.type==QuestionType.SINGLE.name">
                <RadioGroup style="width: 100%;">
                  <div class="radio" v-for="(item,itemIndex) in question.itemlist" :key="itemIndex">
                    <Radio :label="item.name[currentLanguage] || item.name['zh']">
                      <span v-text="question.showid? item.id : ''"></span>
                      <span>{{item.name[currentLanguage] || item.name['zh']}}</span>
                      <span v-if="item.score != ''" style="color: #8ba4b7;">... {{item.score}}</span>
                      <span v-if="item.goto != ''" style="color: #8ba4b7;">... 选中跳转到 {{item.goto}}</span>
                    </Radio>
                    <p class="hasinput" v-if="item.hasinput != ''">
                      <Input
                        v-if="item.inputtype == 'int'"
                        :placeholder="'选中该选项时可以输入整数,'+(item.inputrequired ? '必填' : '非必填')"
                      />
                      <Input
                        v-if="item.inputtype == 'float'"
                        :placeholder="'选中该选项时可以输入小数,'+(item.inputrequired ? '必填' : '非必填')"
                      />
                      <Input
                        v-if="item.inputtype == 'string'"
                        :placeholder="'选中该选项时可以输入文本,'+(item.inputrequired ? '必填' : '非必填')"
                      />
                    </p>
                    <p class="resource" v-if="item.resurl != ''">
                      <img v-if="item.restype == 'img'" :src="item.resurl" alt>
                      <audio v-if="item.restype == 'voice'" :src="item.resurl" controls="controls"></audio>
                      <video v-if="item.restype == 'video'" :src="item.resurl" controls="controls"></video>
                    </p>
                  </div>
                </RadioGroup>
              </div>

              <!-- dropdown question -->
              <div class="dropdown-question" v-if="question.type==QuestionType.DROPDOWN.name">
                <Select>
                  <Option
                    v-for="(item,itemIndex) in question.itemlist"
                    :key="itemIndex"
                    :value="item.id"
                  >{{ item.name[currentLanguage] || item.name['zh'] }}</Option>
                </Select>
              </div>

              <!-- multiselect question -->
              <div class="multiselect-question" v-if="question.type==QuestionType.MULTIPLE.name">
                <div
                  class="checkbox"
                  v-for="(item,itemIndex) in question.itemlist"
                  :key="itemIndex"
                >
                  <Checkbox>
                    <span v-text="question.showid? item.id : ''"></span>
                    <span>{{item.name[currentLanguage] || item.name['zh']}}</span>
                    <span v-if="item.score != ''" style="color: #8ba4b7;">... {{item.score}}</span>
                    <span v-if="item.goto != ''" style="color: #8ba4b7;">... 选中跳转到 {{item.goto}}</span>
                  </Checkbox>
                  <p class="hasinput" v-show="item.hasinput != ''">
                    <Input
                      v-if="item.inputtype == 'int'"
                      :placeholder="'选中该选项时可以输入整数,'+(item.inputrequired ? '必填' : '非必填')"
                    />
                    <Input
                      v-if="item.inputtype == 'float'"
                      :placeholder="'选中该选项时可以输入小数,'+(item.inputrequired ? '必填' : '非必填')"
                    />
                    <Input
                      v-if="item.inputtype == 'string'"
                      :placeholder="'选中该选项时可以输入文本,'+(item.inputrequired ? '必填' : '非必填')"
                    />
                  </p>
                  <p class="resource" v-if="item.resurl != ''">
                    <img v-if="item.restype == 'img'" :src="item.resurl" alt>
                    <audio v-if="item.restype == 'voice'" :src="item.resurl" controls="controls"></audio>
                    <video v-if="item.restype == 'video'" :src="item.resurl" controls="controls"></video>
                  </p>
                </div>
              </div>

              <!-- text question -->
              <div class="text-question" v-if="question.type==QuestionType.TEXT.name">
                <Input v-if="question.encryp" type="password"/>
                <Input v-else type="text"/>
              </div>

              <!-- textarea question -->
              <div class="textarea-question" v-if="question.type==QuestionType.TEXTAREA.name">
                <Input type="textarea"/>
              </div>

              <!-- integer question -->
              <div class="integer-question" v-if="question.type==QuestionType.INTEGER.name">
                <Input v-if="question.encryp" type="password"/>
                <Input v-else :number="true"/>
              </div>

              <!-- float question -->
              <div class="float-question" v-if="question.type==QuestionType.FLOAT.name">
                <Input v-if="question.encryp" type="password"/>
                <Input v-else :number="true"/>
              </div>

              <!-- datetime questipon -->
              <div class="datetime-question" v-if="question.type==QuestionType.DATETIME.name">
                <Input v-if="question.format == 'yy-mm-dd'" type="text" placeholder="年-月-日"/>
                <Input v-if="question.format == 'hh:mm:ss'" type="text" placeholder="时:分:秒"/>
                <Input
                  v-if="question.format == 'yy-mm-dd hh:mm:ss'"
                  type="text"
                  placeholder="年-月-日 时:分:秒"
                />
              </div>

              <!-- assignment question -->
              <div class="assignment-question" v-if="question.type==QuestionType.ASSIGNMENT.name">
                <Row class="assign" v-for="(item,itemIndex) in question.itemlist" :key="itemIndex">
                  <span class="label">{{item.id}} {{item.name[currentLanguage] || item.name['zh']}}</span>
                  <Input type="text"/>
                </Row>
              </div>

              <!-- sort question -->
              <div class="sort-question" v-if="question.type==QuestionType.SORT.name">
                <p class="sort" v-for="(item,itemIndex) in question.itemlist" :key="itemIndex">
                  <span>{{item.id}} {{item.name[currentLanguage] || item.name['zh']}}</span>
                </p>
              </div>

              <!-- scale question -->
              <div class="scale-question" v-if="question.type==QuestionType.SCALE.name">
                <table>
                  <tr>
                    <td
                      class="mindesc"
                    >{{question.mindesc[currentLanguage] || question.mindesc['zh']}}</td>
                    <td class="scale-body">
                      <div class="star" v-if="question.layout == 'star'">
                        <span v-for="n in question.maxscale" :key="n" class="fa fa-star-o"></span>
                      </div>
                      <div class="slider" v-else>
                        <div class="current"></div>
                        <div class="thumb"></div>
                      </div>
                    </td>
                    <td
                      class="maxdesc"
                    >{{question.maxdesc[currentLanguage] || question.mindesc['zh']}}</td>
                  </tr>
                  <tr>
                    <td class="mindesc">{{question.minscale}}</td>
                    <td class="scale-body"></td>
                    <td class="maxdesc">{{question.maxscale}}</td>
                  </tr>
                </table>
              </div>

              <!-- matrix question (dimensions) -->
              <div class="matrix-question" v-if="question.matrixtype == 'dimensions'">
                <table>
                  <tbody>
                    <tr>
                      <th></th>
                      <th
                        v-for="(colQuestion,index) in question.cols"
                        :key="index"
                      >{{colQuestion.title[currentLanguage] || colQuestion.title['zh']}}</th>
                    </tr>
                    <tr v-for="(row,index) in question.rows" :key="index">
                      <td style="text-align: center;">{{row.name[currentLanguage] || row.name['zh']}}</td>
                      <td style="text-align: center;" v-for="(colQuestion,index) in question.cols" :key="index">
                        <!-- singleselect question -->
                        <Dropdown v-if="colQuestion.type == QuestionType.SINGLE.name">
                          <i-button type="default">
                            请选择
                            <Icon type="ios-arrow-down"></Icon>
                          </i-button>
                          <DropdownMenu slot="list">
                            <RadioGroup vertical>
                              <DropdownItem
                                class="matrix-dropdown"
                                v-for="(item,index) in colQuestion.itemlist"
                                :key="index"
                              >
                                <Radio :label="item.name[currentLanguage] || item.name['zh']"></Radio>
                              </DropdownItem>
                            </RadioGroup>
                          </DropdownMenu>
                        </Dropdown>
                        <!-- multiselect question -->
                        <Dropdown v-if="colQuestion.type == QuestionType.MULTIPLE.name">
                          <i-button type="default">
                            请选择
                            <Icon type="ios-arrow-down"></Icon>
                          </i-button>
                          <DropdownMenu slot="list">
                            <CheckboxGroup vertical>
                              <DropdownItem
                                v-for="(item,index) in colQuestion.itemlist"
                                :key="index"
                              >
                                <Checkbox>{{item.name[currentLanguage] || item.name['zh']}}</Checkbox>
                              </DropdownItem>
                            </CheckboxGroup>
                          </DropdownMenu>
                        </Dropdown>
                        <!-- dropdown question -->
                        <Dropdown v-if="colQuestion.type == QuestionType.DROPDOWN.name">
                          <i-button type="default">
                            请选择
                            <Icon type="ios-arrow-down"></Icon>
                          </i-button>
                          <DropdownMenu slot="list">
                            <DropdownItem v-for="(item,index) in colQuestion.itemlist" :key="index">
                              {{item.name[currentLanguage] || item.name['zh']}}
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                        <!-- integer、float、text、datetime question -->
                        <Input v-if="colQuestion.type == QuestionType.INTEGER.name || colQuestion.type == QuestionType.FLOAT.name || colQuestion.type == QuestionType.TEXT.name || colQuestion.type == QuestionType.DATETIME.name" type="text"/>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- matrix question (singledimension) -->
              <div class="matrix-question" v-if="question.matrixtype == 'singledimension'">
                <table>
                  <tbody>
                    <tr>
                      <th></th>
                      <th
                        v-for="(listItem,index) in question.cols[0].itemlist"
                        :key="index"
                      >{{listItem.name[currentLanguage] || listItem.name['zh']}}</th>
                    </tr>
                    <tr v-for="(row,index) in question.rows" :key="index">
                      <td>{{row.name[currentLanguage] || row.name['zh']}}</td>
                      <td v-for="(listItem,index) in question.cols[0].itemlist" :key="index">
                        <label v-if="question.cols[0].type == QuestionType.SINGLE.name">
                          <input type="radio" :name="row.id+question.cols[0].id">
                        </label>
                        <label v-if="question.cols[0].type == QuestionType.MULTIPLE.name">
                          <input type="checkbox" :name="row.id+question.cols[0].id">
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- photo question -->
              <!-- <div class="photo-question" v-if="question.type==QuestionType.PHOTO.name"></div> -->

              <!-- recording question -->
              <!-- <div class="recording-question" v-if="question.type==QuestionType.RECORDING.name"> </div> -->

              <!-- location question -->
              <!-- <div class="location-question" v-if="question.type==QuestionType.LOCATION.name"> </div> -->

              <!-- provCity question -->
              <div class="provCity-question" v-if="question.type==QuestionType.PROVCITY.name">
                <Form :label-width="80" label-position="left">
                  <FormItem label="省份：">
                    <Select placeholder="-请选择省份-">
                      <Option value="0">-请选择省份-</Option>
                    </Select>
                  </FormItem>
                  <FormItem label="城市：">
                    <Select placeholder="-请选择城市-">
                      <Option value="0">-请选择城市-</Option>
                    </Select>
                  </FormItem>
                  <FormItem label="区/县：">
                    <Select placeholder="-请选择区/县-">
                      <Option value="0">-请选择区/县-</Option>
                    </Select>
                  </FormItem>
                </Form>
              </div>

              <!-- cascade question -->
              <div class="cascade-question" v-if="question.type==QuestionType.CASCADE.name">
                <Row v-for="(item,index) in question.cdata" :key="index">
                  <div v-if="item.id != '' && item.title != '' && item.options != ''">
                    <i-col span="4">第{{item.id}} 级:</i-col>
                    <i-col span="8">{{item.title}}</i-col>
                    <i-col span="4">关联数据:</i-col>
                    <i-col span="8">{{item.options}}</i-col>
                  </div>
                </Row>
              </div>

              <div class="question-append-icon">
                <span v-if="question.filters.length > 0" class="filter-icon">
                  <i class="fa fa-code-fork"></i>
                </span>
                <span v-if="question.validation.length > 0" class="validation-icon">
                  <i class="fa fa-check-circle-o"></i>
                </span>
              </div>
            </div>

            <span v-if="question.type == 'section'" @click="sectionEdit({section: question})" class="section-title">{{question.title[currentLanguage] || question.title['zh']}}</span>
          </div>
        </div>
      </div>
      <designer-right></designer-right>
    </div>

    <!-- edit box -->
    <designer-editor v-if="isLoadEditor"></designer-editor>

    <!-- resource base -->
    <designer-resource v-if="showResourcePanel"></designer-resource>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
import * as SurvmlReader from "../tool/survml-reader";
import QuestionType from "../constant/question-type.js";

import designerHeader from "./designer-header";
import designerLeft from "./designer-left";
import designerRight from "./designer-right";
import designerEditor from "./designer-editor";
import designerResource from "./designer-resource";

export default {
  name: "index",
  components: {
    designerHeader,
    designerLeft,
    designerRight,
    designerEditor,
    designerResource
  },
  data() {
    return {
      QuestionType: QuestionType,
      isEditPageName: false,
      pageName: '',
      editIndex: null,
      isLoadEditor: true
    };
  },
  computed: {
    ...mapState({
      showResourcePanel: "showResourcePanel",
      isSelected: "isSelected",
      currentLanguage: state =>
        state.QuestionnaireInfoMoudle.QuestionnaireInfo.currentLanguage,
      QuestionnaireInfo: state =>
        state.QuestionnaireInfoMoudle.QuestionnaireInfo,
      QuestionList: state => state.QuestionInfoModule.QuestionList
    }),
    wrapperClass() {
      return function (question, index) {
        let cls = ''
        if (question.id == this.isSelected) {
          cls += 'selected '
        }
        if (question.type != 'section') {
          cls += 'wrapper_question'
        } else if (question.type == 'section') {
          if (this.QuestionList[index + 1] && question.begin == this.QuestionList[index + 1].id) {
            cls += 'wrapper_section section_header'
          } else {
            cls += 'wrapper_section section_footer'
          }
        }
        return cls
      }
    }
  },
  created() {
    //initialize the questionnaire
    let _this = this;
    let questionnaireId = this.GetQueryValue1('qId');
    let projectId = this.GetQueryValue1('pId');
    let moduleId = this.GetQueryValue1('mId');

    let role = this.$cookies.get('userInfo').surveyPermission.role
    this.setRole(role)

    if (projectId) {
      _this.QuestionnaireInfo.projectId = projectId
    }

    if (moduleId) {
      _this.QuestionnaireInfo.moduleId = moduleId
    }

    if (questionnaireId) {
      this.isLoadEditor = false
      this.httpPost('/w1/questionnaire/get',{
        questionnaireId: questionnaireId,
        projectId: projectId,
        moduleId: moduleId
      }).then(res => {
        if (res.code == 0) {
          let data = res.data
          _this.QuestionnaireInfo.title = data.name || '问卷标题';
          _this.QuestionnaireInfo.originSurvml = data.xmlContent || "";
          _this.QuestionnaireInfo.tag = data.labelText || "";
          _this.QuestionnaireInfo.responseIdentity = data.identity || "";
          _this.QuestionnaireInfo.questionnaireId = data.id || "";
          _this.QuestionnaireInfo.moduleId = data.moduleId || "";
          _this.QuestionnaireInfo.isShowProgress = data.isShowProgress || 0;
          _this.QuestionnaireInfo.logoUrl = data.logoUrl || "";
          _this.QuestionnaireInfo.bgUrl = data.bgUrl || "";
          _this.QuestionnaireInfo.welcomeText = data.welcomeText || "";
          _this.QuestionnaireInfo.endText = data.endText || "";
          if (_this.QuestionnaireInfo.originSurvml) {
            try {
              SurvmlReader.parseSurvml(_this.QuestionnaireInfo.originSurvml);
            } catch (e) {
              this.$Message.error('无法加载问卷')
              console.log(e);
            }
          }
        } else {
          this.$Message.error(res.message || "无法获取问卷内容")
        }
        this.isLoadEditor = true
      }).catch(error => {
        this.$Message.error('无法访问服务器')
      })
    }
  },
  methods: {
    ...mapMutations(['setRole']),
    ...mapActions(["questionEdit", "questionnaireEdit", "saveEditPageName", "sectionEdit"]),
    editPageName (question, index) {
      this.isEditPageName = true
      this.editIndex = index
    },
    savePageName (question) {
      this.saveEditPageName({
        question: question,
        pageName: this.pageName
      })
      this.isEditPageName = false
      this.pageName = ''
    },
    /**
     * 获取url参数值
     */
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
@import "../assets/style/variables.scss";
.container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
  box-sizing: border-box;
  .designer-content {
    width: 100%;
    top: 80px;
    bottom: 0;
    position: absolute;
    .middle {
      position: absolute;
      top: 0px;
      bottom: 0;
      left: $leftWidth;
      right: $rightWidth;
      border-right: 1px solid #ddd;
      overflow-y: auto;
      .questionnaire-title {
        text-align: center;
        height: 50px;
        line-height: 50px;
        margin: 15px auto 0px;
        font-size: 18px;
        font-weight: bold;
        margin: 20px;
        border: 1px dashed #fff;
        &:hover {
          border: 1px dashed #cccccc;
          background: #fcfcfc;
        }
        &.selected {
          border: 1px dashed #cccccc;
          background: #fcfcfc;
        }
      }
      .wrapper_section {
        position: relative;
        padding: 10px 15px;
        margin: 20px;
        display: flex;
        align-items: center;
        &:hover {
          background: #fcfcfc;
        }
        .section-title {
          flex: none;
          margin-left: 5px;
          letter-spacing: 5px;
          margin-bottom: 0;
          user-select: none;
        }
      }
      .section_header {
        &:before {
          flex: auto;
          content: " ";
          height: 8px;
          position: relative;
          border-left: 1px dashed #ddd;
          border-top: 1px dashed #ddd;
          top: 4px;
        }
        &:after {
          flex: auto;
          content: " ";
          height: 8px;
          position: relative;
          border-right: 1px dashed #ddd;
          border-top: 1px dashed #ddd;
          top: 4px;
        }
      }
      .section_footer {
        &:before {
          flex: auto;
          content: " ";
          height: 8px;
          position: relative;
          border-left: 1px dashed #ddd;
          border-bottom: 1px dashed #ddd;
          top: -4px;
        }
        &:after {
          flex: auto;
          content: " ";
          height: 8px;
          position: relative;
          border-right: 1px dashed #ddd;
          border-bottom: 1px dashed #ddd;
          top: -4px;
        }
      }
      .wrapper_question {
        position: relative;
        padding: 10px 15px 50px 15px;
        margin: 20px;
        border: 1px dashed #fff;
        &:hover {
          background: #fcfcfc;
        }
        &.selected {
          border: 1px dashed #cccccc;
          background: #fcfcfc;
        }
        p {
          margin-bottom: 15px;
        }
        .question-title {
          font-weight: 700;
        }
        .question-hint {
          color: #777;
        }
        .radio {
          margin-bottom: 15px;
        }
        .hasinput {
          margin-top: 10px;
        }
        .resource {
          margin-top: 10px;
          img,
          audio,
          video {
            width: 50px;
            height: 50px;
            object-fit: fill;
          }
        }
        .assign {
          margin-bottom: 15px;
          .label {
            padding: 6px 0px;
          }
        }
        .question-append-icon {
          position: absolute;
          bottom: 10px;
          left: 15px;
          .filter-icon,
          .validation-icon {
            display: inline-block;
            margin-right: 10px;
            height: 24px;
            width: 24px;
            border-radius: 5px;
            color: #fff;
            text-align: center;
            line-height: 24px;
          }
          .filter-icon {
            background-color: #378ad9;
          }
          .validation-icon {
            background-color: #f48d1a;
          }
        }

        .scale-question {
          .mindesc,
          .minscale,
          .maxdesc,
          .maxscale {
            text-align: left;
          }
          .scale-body {
            width: 200px;
            text-align: center;
            padding: 0 5px;
            @at-root .slider {
              position: relative;
              width: 100%;
              height: 10px;
              background-color: #777;
              .current {
                height: 100%;
                width: 50%;
                background-color: #f05e1f;
              }
              .thumb {
                position: absolute;
                left: 50%;
                top: -5px;
                width: 10px;
                height: 20px;
                background-color: #f05e1f;
                cursor: pointer;
              }
            }
          }
        }
        .matrix-question {
          table {
            width: 100%;
            border-spacing: 0;
            border-collapse: collapse;
            td,
            th {
              border: 1px solid #ddd;
              border-spacing: 0;
              border-collapse: collapse;
              padding: 8px;
              text-align: left;
              padding-left: 15px;
              vertical-align: middle;
            }
            th {
              text-align: center;
            }
          }
        }
      }
    }
  }
}
.selected {
    border: 1px dashed #cccccc;
    background: #fcfcfc;
  }
</style>

<style>
.ivu-dropdown-item span {
  display: inline-block !important;
  padding: 0 !important;
}
</style>
