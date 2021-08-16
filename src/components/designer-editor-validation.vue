<!-- edit box >>> validation -->
<template>
  <div class="tab-content" id="question-validation-editor">
    <i-button type="default" shape="circle" @click="addValidator">添加验证规则</i-button>
    <div class="validator-list">
      <draggable
        class="list-group"
        element="div"
        v-model="ValidatorList"
        :options="dragOptions"
        :move="onMove"
        @start="isDragging=true"
        @end="isDragging=false"
      >
        <transition-group type="transition" :name="'flip-list'">
          <div class="validator" v-for="(validator,index) in ValidatorList" :key="validator.guid">
            <Row
              class="mb15"
              v-if="QuestionInfo.type == QuestionType.TEXT.name || QuestionInfo.type == QuestionType.INTEGER.name || QuestionInfo.type == QuestionType.FLOAT.name"
            >
              <i-col span="3" offset="2" class="text-center">
                <span class="label">规则类型：</span>
              </i-col>
              <i-col span="14">
                <Select v-model="validator.type">
                  <Option value="expression">自定义</Option>
                  <Option value="embedded">预定义</Option>
                </Select>
              </i-col>
              <i-col span="2" class="pl30">
                <a href="#" class="delete" @click.prevent="deleteValidator(index)">
                  <i class="fa fa-trash"></i>
                </a>
                <a href="#" class="reorder">
                  <i class="fa fa-reorder"></i>
                </a>
              </i-col>
            </Row>
            <Row class="mb15">
              <i-col span="3" offset="2" class="text-center">
                <span class="label">验证条件：</span>
              </i-col>
              <i-col
                span="14"
                v-if="(validator.type == 'expression') && (QuestionInfo.type == QuestionType.TEXT.name || QuestionInfo.type == QuestionType.INTEGER.name || QuestionInfo.type == QuestionType.FLOAT.name)"
              >
                <Input @on-blur.prevent="validate(validator.test)" ref="validateIpt" type="text" v-model="validator.test"/>
              </i-col>
              <i-col
                span="14"
                v-if="QuestionInfo.type != QuestionType.TEXT.name && QuestionInfo.type != QuestionType.INTEGER.name && QuestionInfo.type != QuestionType.FLOAT.name"
              >
                <Input @on-blur.prevent="validate(validator.test)" ref="validateIpt" type="text" v-model="validator.test"/>
              </i-col>
              <i-col span="13" v-if="validator.type == 'embedded'">
                <div class="need-append" v-if="QuestionInfo.type == QuestionType.TEXT.name" placeholder="请选择验证条件">
                  <Select v-model="validator.test" placement="bottom">
                    <Option value>请选择验证条件</Option>
                    <Option value="email">邮件地址</Option>
                    <Option value="post">邮编</Option>
                    <Option value="dial">电话或手机号码</Option>
                    <Option value="mobile">手机号码</Option>
                    <Option value="phone">电话号码</Option>
                    <Option value="idcard">身份证</Option>
                    <Option value="chinese">中文</Option>
                    <Option value="english">英文</Option>
                    <!-- <Option value="pointnum">小数位数</Option> -->
                  </Select>
                </div>
                
                <Row
                  v-if="QuestionInfo.type == QuestionType.INTEGER.name || QuestionInfo.type == QuestionType.FLOAT.name"
                >
                  <i-col span="9">
                    <Select v-model="validator.test" placeholder="数值区间">
                      <Option value="scope">数值区间</Option>
                      <Option value="pointnum">小数位数</Option>
                    </Select>
                  </i-col>
                </Row>
                <Row v-show="validator.test == 'scope'" style="margin-top: 20px;">
                  <i-col span="11">
                    <Row>
                      <i-col span="12">
                        <span style="color: #555555;">最小区间：</span>
                      </i-col>
                      <i-col span="10">
                        <Input-number v-model="validator.scopeMin"></Input-number>
                      </i-col>
                    </Row>
                  </i-col>
                  <i-col span="11">
                    <Row>
                      <i-col span="12">
                        <span style="color: #555555;">最大区间：</span>
                      </i-col>
                      <i-col span="10">
                        <Input-number v-model="validator.scopeMax"></Input-number>
                      </i-col>
                    </Row>
                  </i-col>
                </Row>
                <Row v-show="validator.test == 'pointnum'" style="margin-top: 20px;">
                  <i-col span="11">
                    <Row>
                      <i-col span="12">
                        <span style="color: #555555;">最小位数：</span>
                      </i-col>
                      <i-col span="10">
                        <InputNumber :min="0" v-model="validator.minNum"></InputNumber>
                      </i-col>
                    </Row>
                  </i-col>
                  <i-col span="11">
                    <Row>
                      <i-col span="12">
                        <span style="color: #555555;">最大位数：</span>
                      </i-col>
                      <i-col span="10">
                        <InputNumber :min="validator.minNum" v-model="validator.maxNum"></InputNumber>
                      </i-col>
                    </Row>
                  </i-col>
                </Row>
              </i-col>
              <i-col
                span="3"
                class="pl30"
                v-if="QuestionInfo.type != QuestionType.TEXT.name && QuestionInfo.type != QuestionType.INTEGER.name && QuestionInfo.type != QuestionType.FLOAT.name"
              >
                <a href="#" class="delete" @click.prevent="deleteValidator(index)">
                  <i class="fa fa-trash"></i>
                </a>
                <a href="#" class="reorder">
                  <i class="fa fa-reorder"></i>
                </a>
              </i-col>
            </Row>
            <Row class="mb15">
              <i-col span="3" offset="2" class="text-center">
                <span class="label">验证提示：</span>
              </i-col>
              <i-col span="14">
                <Input type="text" v-model="validator.message"/>
              </i-col>
            </Row>
            <Row class="mb15">
              <i-col span="3" offset="2" class="text-center">
                <span class="label">设置：</span>
              </i-col>
              <i-col span="14">
                <Checkbox v-model="validator.force">强制触发</Checkbox>
                <Checkbox v-model="validator.skip_on_input">输入框失去焦点时不提示</Checkbox>
              </i-col>
            </Row>
          </div>
        </transition-group>
      </draggable>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import draggable from "vuedraggable";
import QuestionType from "../constant/question-type.js";
import Validator from "../validator/validator";
import * as Utils from "../tool/utils";

export default {
  name: "",
  components: { draggable },
  data() {
    return {
      QuestionType: QuestionType
    };
  },
  computed: {
    ...mapState({
      QuestionInfo: state => state.QuestionInfoModule.currentQuestionInfo
    }),

    ValidatorList: {
      get() {
        return this.$store.state.QuestionInfoModule.ValidatorList;
      },
      set(newList) {
        this.$store.state.QuestionInfoModule.ValidatorList = newList;
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
  methods: {
    // reorder the validator
    onMove({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;

      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
    },

    // add a new validator
    addValidator() {
      let options = {};
      if (
        this.QuestionInfo.type == QuestionType.TEXT.name ||
        this.QuestionInfo.type == QuestionType.INTEGER.name ||
        this.QuestionInfo.type == QuestionType.FLOAT.name
      ) {
        options = {
          type: "expression"
        };
      }
      let newValidator = new Validator(options);
      this.ValidatorList.push(newValidator);
    },

    // delete a validator
    deleteValidator(index) {
      this.ValidatorList.splice(index, 1);
    },

    // 验证条件
    validate(value) {
      let res = Utils._validate_filter_expr(value);
      if (!res.valid) {
        alert(res.err);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.ivu-btn {
  font-size: 14px;
}
.validator-list {
  margin-top: 30px;
  .validator {
    line-height: 32px;
    margin-top: 20px;
    border-bottom: 1px dashed #ddd;
    a {
      color: #888;
      padding: 0px 5px;
    }
    .reorder {
      cursor: move;
    }
    .ivu-input-number {
      width: 100%;
    }
  }
}
</style>

<style>
  #question-validation-editor .need-append .ivu-select .ivu-select-dropdown {
    top: 32px !important;
    height: 150px !important;
  }
</style>
