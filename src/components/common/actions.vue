<template>
  <div class="wrapper-actions">
    <!-- setting question attributes -->
    <div class="wrapper-setq" v-if="script.type == 'setq'">
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">目标题号：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.target"/>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">问题属性：</span>
        </i-col>
        <i-col span="11">
          <Select v-model="script.attribute" placeholder="请选择属性">
            <Option value>请选择属性</Option>
            <Option value="title">标题</Option>
            <Option value="value">值</Option>
            <Option value="skip">跳过</Option>
            <Option value="visible">可见</Option>
            <Option value="enabled">可编辑</Option>
          </Select>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">属性的值：</span>
        </i-col>
        <i-col span="11">
          <Select
            v-model="script.value"
            v-if="script.attribute == 'skip' || script.attribute == 'visible' || script.attribute == 'enabled'"
          >
            <Option value="true">是</Option>
            <Option value="false">否</Option>
          </Select>
          <Input v-model="script.value" v-else/>
        </i-col>
      </Row>
    </div>

    <!-- setting option attributes -->
    <div class="wrapper-setoption" v-if="script.type == 'setoption'">
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">目标题号：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.target"/>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">行列编号：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.col" placeholder="设置表格题时才用到"/>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">目标选项：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.option"/>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">选项属性：</span>
        </i-col>
        <i-col span="11">
          <Select v-model="script.attribute" placeholder="请选择属性">
            <Option value>请选择属性</Option>
            <Option value="title">标题</Option>
            <Option value="value">值</Option>
            <Option value="visible">可见</Option>
          </Select>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">属性的值：</span>
        </i-col>
        <i-col span="11">
          <Select v-model="script.value" v-if="script.attribute == 'visible'">
            <Option value="true">是</Option>
            <Option value="false">否</Option>
          </Select>
          <Input v-model="script.value" v-else/>
        </i-col>
      </Row>
    </div>

    <!-- setting row attributes -->
    <div class="wrapper-setrow" v-if="script.type == 'setrow'">
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">目标题号：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.target"/>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">目标行号：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.row"/>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">行的属性：</span>
        </i-col>
        <i-col span="11">
          <Select v-model="script.attribute" placeholder="请选择属性">
            <Option value>请选择属性</Option>
            <Option value="title">标题</Option>
            <Option value="visible">可见</Option>
          </Select>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">属性的值：</span>
        </i-col>
        <i-col span="11">
          <Select v-model="script.value" v-if="script.attribute == 'visible'">
            <Option value="true">是</Option>
            <Option value="false">否</Option>
          </Select>
          <Input v-model="script.value" v-else/>
        </i-col>
      </Row>
    </div>

    <!-- setting language -->
    <div class="wrapper-setlang" v-if="script.type == 'setlang'">
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">选择语言：</span>
        </i-col>
        <i-col span="11">
          <Select v-model="script.value" placeholder="所有">
            <Option value>所有</Option>
            <Option
              v-for="(language,index) in QuestionnaireInfo.languages"
              :key="index"
              :value="language"
            >{{LanguageType[language]}}</Option>
          </Select>
        </i-col>
      </Row>
    </div>

    <!-- setting variables -->
    <div class="wrapper-setv" v-if="script.type == 'setv'">
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">变量名称：</span>
        </i-col>
        <i-col span="11">
          <Select v-model="script.id"  placeholder="选择变量">
            <Option value="选择变量">选择变量</Option>
            <Option
              v-for="(variable,index) in VariableList"
              :key="index"
              :value="variable.id"
            >{{variable.id}}</Option>
          </Select>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">变量的值：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.value"/>
        </i-col>
      </Row>
    </div>

    <!-- setting repeat once time -->
    <div class="wrapper-repeat-once" v-if="script.type == 'repeat-once'">
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">目标题号：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.target"/>
        </i-col>
      </Row>
    </div>

    <!-- setting repeat -->
    <div class="wrapper-repeat" v-if="script.type == 'repeat'">
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">目标题号：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.target"/>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">参数：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.param" placeholder="输入整数或者整数组成的数组"/>
        </i-col>
      </Row>
    </div>

    <!-- setting goto -->
    <div class="wrapper-goto" v-if="script.type == 'goto'">
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">目标题号：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.target"/>
        </i-col>
      </Row>
    </div>

    <!-- setting alert -->
    <div class="wrapper-alert" v-if="script.type == 'alert'">
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">提示内容：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.message"/>
        </i-col>
      </Row>
    </div>

    <!-- setting clear -->
    <div class="wrapper-clear" v-if="script.type == 'clear'">
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">目标题号：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.target"/>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">目标行号：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.row" placeholder="设置表格题时才用到"/>
        </i-col>
      </Row>
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">目标列号：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.col" placeholder="设置表格题时才用到"/>
        </i-col>
      </Row>
    </div>

    <!-- setting skip -->
    <!-- <div class="wrapper-skip" v-if="script.type == 'skip'"></div> -->

    <!-- setting exit code -->
    <div class="wrapper-setexit" v-if="script.type == 'setexit'">
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">状态编码：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.status" placeholder="退出问卷是的状态编码"/>
        </i-col>
      </Row>
    </div>

    <!-- setting exit -->
    <div class="wrapper-setexit" v-if="script.type == 'exit'">
      <Row class="mb15">
        <i-col span="3" offset="5">
          <span class="label">状态编码：</span>
        </i-col>
        <i-col span="11">
          <Input v-model="script.status" placeholder="退出问卷时的状态编码"/>
        </i-col>
      </Row>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import LanguageType from "../../constant/language-type";

export default {
  name: "",
  data() {
    return {
      LanguageType: LanguageType, // language that supported in the questionnaire designer
      varValue: ""
    };
  },
  props: ["script"],
  computed: {
    ...mapState({
      QuestionnaireInfo: state =>
        state.QuestionnaireInfoMoudle.QuestionnaireInfo,
      VariableList: state => state.QuestionInfoModule.VariableList
    })
  }
};
</script>

<style lang="scss" scoped>
</style>