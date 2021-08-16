<!-- 分页逻辑编辑组件 -->
<template>
  <div class="tab-content" id="question-filter-editor">
    <Collapse v-model="value">
      <!-- before filters setting start -->
      <Panel name="1">
        <span>前置逻辑</span>
        <div slot="content" class="wrapper-sctipt-list">
          <div class="tool-bar need-append">
            <a href="#" title="添加逻辑" @click.prevent="addFilter('before')">
              <i class="fa fa-plus"></i>
            </a>
            <Dropdown style="margin-left: 20px" placement="bottom">
              <a href="javascript:void(0)" title="切换视图">
                <i class="fa fa-chevron-down"></i>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem :selected="!editBeforeFilterInCode">
                  <span @click="visualView('before')">可视化视图</span>
                </DropdownItem>
                <DropdownItem :selected="editBeforeFilterInCode">
                  <span @click="codeView('before')">代码视图</span>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <div v-if="!beforeFilter && editBeforeFilterInCode == false">尚未添加逻辑</div>

          <div class="sctipt-list" v-if="beforeFilter && editBeforeFilterInCode == false">
            <!-- actions of the question when having no conditions -->
            <div class="script" v-for="(script,index) in beforeFilter.scripts" :key="index">
              <div v-if="script.objName=='action'">
                <Row class="mb15">
                  <i-col span="3" offset="2" class="text-center">
                    <span class="label">逻辑条件：</span>
                  </i-col>
                  <i-col span="14">
                    <Select
                      v-model="script.objName"
                      @on-change="val => changeFilter({name:val,index:index,type:'before'})"
                    >
                      <Option value="action">无条件</Option>
                      <Option value="if">有条件</Option>
                    </Select>
                  </i-col>
                  <i-col span="2" class="pl30">
                    <a
                      href="#"
                      class="delete"
                      @click.prevent="deleteFilter({type:'before',index:index})"
                    >
                      <i class="fa fa-trash"></i>
                    </a>
                  </i-col>
                </Row>
                <Row class="mb15">
                  <i-col span="3" offset="2" class="text-center">
                    <span class="label">逻辑动作：</span>
                  </i-col>
                  <i-col span="14" class="need-append">
                    <Select
                      v-model="script.type"
                      placement="bottom"
                      placeholder="请选择动作类型"
                    >
                      <Option value>请选择动作类型</Option>
                      <Option
                        v-for="(action,index) in actions"
                        :key="index"
                        :value="action.value"
                      >{{action.name}}</Option>
                    </Select>
                  </i-col>
                </Row>

                <!-- the settig content of different action types -->
                <actions :script="script"></actions>
              </div>

              <!-- actions of the question when having conditions -->
              <div v-if="script.objName=='if'">
                <Row class="mb15">
                  <i-col span="3" offset="2" class="text-center">
                    <span class="label">逻辑条件：</span>
                  </i-col>
                  <i-col span="4">
                    <Select v-model="script.objName" @on-change="changeFilter({name:script.objName,index:index,type:'before'})">
                      <Option value="action">无条件</Option>
                      <Option value="if">有条件</Option>
                    </Select>
                  </i-col>
                  <i-col span="10" class="pl30">
                    <Input @on-blur.prevent="validate(script.test)" type="text" v-model="script.test" placeholder="请输入表达式"/>
                  </i-col>
                  <i-col span="2" class="pl30">
                    <a
                      href="#"
                      class="delete"
                      @click.prevent="deleteFilter({type:'before',index:index})"
                    >
                      <i class="fa fa-trash"></i>
                    </a>
                  </i-col>
                </Row>
                <!-- true actions start -->
                <div class="wrapper-condition-true">
                  <Row>
                    <i-col span="3" offset="2" class="text-center" v-if="script.trueActions == 0">
                      <span class="label">条件成立时：</span>
                    </i-col>
                  </Row>
                  <div
                    class="wrapper-action"
                    v-for="(action,index) in script.trueActions"
                    :key="index"
                  >
                    <Row>
                      <i-col span="3" offset="2" class="text-center">
                        <span class="label" :class="{'colorWhite':index > 0 }">条件成立时：</span>
                      </i-col>
                      <i-col class="mb15 need-append" span="14">
                        <Select
                          v-model="action.type"
                          placement="bottom"
                          placeholder="请选择动作类型"
                        >
                          <Option value>请选择动作类型</Option>
                          <Option
                            v-for="(action,index) in actions"
                            :key="index"
                            :value="action.value"
                          >{{action.name}}</Option>
                        </Select>
                      </i-col>
                      <i-col span="2" class="pl30">
                        <a href="#" class="delete" @click="deleteAction(script,'true',index)">
                          <i class="fa fa-trash"></i>
                        </a>
                      </i-col>
                    </Row>
                    <!-- the settig content of different action types -->
                    <actions :script="action"></actions>

                    <Row>
                      <i-col offset="5" span="16" class="border"></i-col>
                    </Row>
                  </div>
                  <Row class="mb15">
                    <i-col offset="5">
                      <a href="#" @click.prevent="addAction('true',script)">
                        <i class="fa fa-plus-square-o"></i>
                        <span>添加动作</span>
                      </a>
                    </i-col>
                  </Row>
                </div>
                <!-- true actions end -->

                <!-- false actions start -->
                <div class="wrapper-condition-false">
                  <Row>
                    <i-col span="3" offset="2" class="text-center" v-if="script.falseActions == 0">
                      <span class="label">条件不成立时：</span>
                    </i-col>
                  </Row>
                  <div
                    class="wrapper-action"
                    v-for="(action,index) in script.falseActions"
                    :key="index"
                  >
                    <Row>
                      <i-col span="3" offset="2" class="text-center">
                        <span class="label" :class="{'colorWhite':index > 0 }">条件不成立时：</span>
                      </i-col>
                      <i-col class="mb15 need-append" span="14">
                        <Select
                          v-model="action.type"
                          placement="bottom"
                          placeholder="请选择动作类型"
                        >
                          <Option value>请选择动作类型</Option>
                          <Option
                            v-for="(action,index) in actions"
                            :key="index"
                            :value="action.value"
                          >{{action.name}}</Option>
                        </Select>
                      </i-col>
                      <i-col span="2" class="pl30">
                        <a href="#" class="delete" @click="deleteAction(script,'false',index)">
                          <i class="fa fa-trash"></i>
                        </a>
                      </i-col>
                    </Row>
                    <!-- the settig content of different action types -->
                    <actions :script="action"></actions>

                    <Row>
                      <i-col offset="5" span="16" class="border"></i-col>
                    </Row>
                  </div>
                  <Row class="mb15">
                    <i-col offset="5">
                      <a href="#" @click.prevent="addAction('false',script)">
                        <i class="fa fa-plus-square-o"></i>
                        <span>添加动作</span>
                      </a>
                    </i-col>
                  </Row>
                </div>
                <!-- false actions end -->
              </div>
            </div>
          </div>
          <div class="wrapper-cdata" v-if="beforeFilter && editBeforeFilterInCode == true">
            <Input type="textarea" :rows="20" v-model="beforeFilter.cdata"/>
          </div>
        </div>
      </Panel>
      <!-- before filters setting end -->

      <!-- middle filters setting start -->
      <Panel name="2">
        <span>中置逻辑</span>
        <div slot="content" class="wrapper-sctipt-list">
          <div class="tool-bar need-append">
            <a href="#" title="添加逻辑" @click.prevent="addFilter('middle')">
              <i class="fa fa-plus"></i>
            </a>
            <Dropdown style="margin-left: 20px" placement="bottom">
              <a href="javascript:void(0)" title="切换视图">
                <i class="fa fa-chevron-down"></i>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem :selected="!editMiddleFilterInCode">
                  <span @click="visualView('middle')">可视化视图</span>
                </DropdownItem>
                <DropdownItem :selected="editMiddleFilterInCode">
                  <span @click="codeView('middle')">代码视图</span>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <div v-if="!middleFilter && editMiddleFilterInCode == false">尚未添加逻辑</div>
          <div class="sctipt-list" v-if="middleFilter && editMiddleFilterInCode == false">
            <!-- actions of the question when having no conditions -->
            <div class="script" v-for="(script,index) in middleFilter.scripts" :key="index">
              <div v-if="script.objName=='action'">
                <Row class="mb15">
                  <i-col span="3" offset="2" class="text-center">
                    <span class="label">逻辑条件：</span>
                  </i-col>
                  <i-col span="14">
                    <Select
                      v-model="script.objName"
                      @on-change="changeFilter({name:script.objName,index:index,type:'middle'})"
                    >
                      <Option value="action">无条件</Option>
                      <Option value="if">有条件</Option>
                    </Select>
                  </i-col>
                  <i-col span="2" class="pl30">
                    <a
                      href="#"
                      class="delete"
                      @click.prevent="deleteFilter({type:'middle',index:index})"
                    >
                      <i class="fa fa-trash"></i>
                    </a>
                  </i-col>
                </Row>
                <Row class="mb15">
                  <i-col span="3" offset="2" class="text-center">
                    <span class="label">逻辑动作：</span>
                  </i-col>
                  <i-col span="14" class="need-append">
                    <Select
                      v-model="script.type"
                      placement="bottom"
                      placeholder="请选择动作类型"
                    >
                      <Option value>请选择动作类型</Option>
                      <Option
                        v-for="(action,index) in actions"
                        :key="index"
                        :value="action.value"
                      >{{action.name}}</Option>
                    </Select>
                  </i-col>
                </Row>

                <!-- the settig content of different action types -->
                <actions :script="script"></actions>
              </div>

              <!-- actions of the question when having conditions -->
              <div v-if="script.objName=='if'">
                <Row class="mb15">
                  <i-col span="3" offset="2" class="text-center">
                    <span class="label">逻辑条件：</span>
                  </i-col>
                  <i-col span="4">
                    <Select
                      v-model="script.objName"
                      @on-change="changeFilter({name:script.objName,index:index,type:'middle'})"
                    >
                      <Option value="action">无条件</Option>
                      <Option value="if">有条件</Option>
                    </Select>
                  </i-col>
                  <i-col span="10" class="pl30">
                    <Input @on-blur.prevent="validate(script.test)" type="text" v-model="script.test" placeholder="请输入表达式"/>
                  </i-col>
                  <i-col span="2" class="pl30">
                    <a
                      href="#"
                      class="delete"
                      @click.prevent="deleteFilter({type:'middle',index:index})"
                    >
                      <i class="fa fa-trash"></i>
                    </a>
                  </i-col>
                </Row>
                <!-- true actions start -->
                <div class="wrapper-condition-true">
                  <Row>
                    <i-col span="3" offset="2" class="text-center" v-if="script.trueActions == 0">
                      <span class="label">条件成立时：</span>
                    </i-col>
                  </Row>
                  <div
                    class="wrapper-action"
                    v-for="(action,index) in script.trueActions"
                    :key="index"
                  >
                    <Row>
                      <i-col span="3" offset="2" class="text-center">
                        <span class="label" :class="{'colorWhite':index > 0 }">条件成立时：</span>
                      </i-col>
                      <i-col class="mb15 need-append" span="14">
                        <Select
                          v-model="action.type"
                          placement="bottom"
                          placeholder="请选择动作类型"
                        >
                          <Option value>请选择动作类型</Option>
                          <Option
                            v-for="(action,index) in actions"
                            :key="index"
                            :value="action.value"
                          >{{action.name}}</Option>
                        </Select>
                        <!-- {{action}} -->
                      </i-col>
                      <i-col span="2" class="pl30">
                        <a href="#" class="delete" @click="deleteAction(script,'true',index)">
                          <i class="fa fa-trash"></i>
                        </a>
                      </i-col>
                    </Row>
                    <!-- the settig content of different action types -->
                    <actions :script="action"></actions>

                    <Row>
                      <i-col offset="5" span="16" class="border"></i-col>
                    </Row>
                  </div>
                  <Row class="mb15">
                    <i-col offset="5">
                      <a href="#" @click.prevent="addAction('true',script)">
                        <i class="fa fa-plus-square-o"></i>
                        <span>添加动作</span>
                      </a>
                    </i-col>
                  </Row>
                </div>
                <!-- true actions end -->

                <!-- false actions start -->
                <div class="wrapper-condition-false">
                  <Row>
                    <i-col span="3" offset="2" class="text-center" v-if="script.falseActions == 0">
                      <span class="label">条件不成立时：</span>
                    </i-col>
                  </Row>
                  <div
                    class="wrapper-action"
                    v-for="(action,index) in script.falseActions"
                    :key="index"
                  >
                    <Row>
                      <i-col span="3" offset="2" class="text-center">
                        <span class="label" :class="{'colorWhite':index > 0 }">条件不成立时：</span>
                      </i-col>
                      <i-col class="mb15 need-append" span="14">
                        <Select
                          v-model="action.type"
                          placement="bottom"
                          placeholder="请选择动作类型"
                        >
                          <Option value>请选择动作类型</Option>
                          <Option
                            v-for="(action,index) in actions"
                            :key="index"
                            :value="action.value"
                          >{{action.name}}</Option>
                        </Select>
                      </i-col>
                      <i-col span="2" class="pl30">
                        <a href="#" class="delete" @click="deleteAction(script,'false',index)">
                          <i class="fa fa-trash"></i>
                        </a>
                      </i-col>
                    </Row>
                    <!-- the settig content of different action types -->
                    <actions :script="action"></actions>

                    <Row>
                      <i-col offset="5" span="16" class="border"></i-col>
                    </Row>
                  </div>
                  <Row class="mb15">
                    <i-col offset="5">
                      <a href="#" @click.prevent="addAction('false',script)">
                        <i class="fa fa-plus-square-o"></i>
                        <span>添加动作</span>
                      </a>
                    </i-col>
                  </Row>
                </div>
                <!-- false actions end -->
              </div>
            </div>
          </div>
          <div class="wrapper-cdata" v-if="middleFilter && editMiddleFilterInCode == true">
            <Input type="textarea" :rows="20" v-model="middleFilter.cdata"/>
          </div>
        </div>
      </Panel>
      <!-- middle filters setting end -->

      <!-- after filters setting start -->
      <Panel name="3">
        <span>后置逻辑</span>
        <div slot="content" class="wrapper-sctipt-list">
          <div class="tool-bar need-append">
            <a href="#" title="添加逻辑" @click.prevent="addFilter('after')">
              <i class="fa fa-plus"></i>
            </a>
            <Dropdown style="margin-left: 20px" placement="bottom">
              <a href="javascript:void(0)" title="切换视图">
                <i class="fa fa-chevron-down"></i>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem :selected="!editAfterFilterInCode">
                  <span @click="visualView('after')">可视化视图</span>
                </DropdownItem>
                <DropdownItem :selected="editAfterFilterInCode">
                  <span @click="codeView('after')">代码视图</span>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <div v-if="!afterFilter && editAfterFilterInCode == false">尚未添加逻辑</div>

          <div class="sctipt-list" v-if="afterFilter && editAfterFilterInCode == false">
            <!-- actions of the question when having no conditions -->
            <div class="script" v-for="(script,index) in afterFilter.scripts" :key="index">
              <div v-if="script.objName=='action'">
                <Row class="mb15">
                  <i-col span="3" offset="2" class="text-center">
                    <span class="label">逻辑条件：</span>
                  </i-col>
                  <i-col span="14">
                    <Select
                      v-model="script.objName"
                      @on-change="changeFilter({name:script.objName,index:index,type:'after'})"
                    >
                      <Option value="action">无条件</Option>
                      <Option value="if">有条件</Option>
                    </Select>
                  </i-col>
                  <i-col span="2" class="pl30">
                    <a
                      href="#"
                      class="delete"
                      @click.prevent="deleteFilter({type:'after',index:index})"
                    >
                      <i class="fa fa-trash"></i>
                    </a>
                  </i-col>
                </Row>
                <Row class="mb15">
                  <i-col span="3" offset="2" class="text-center">
                    <span class="label">逻辑动作：</span>
                  </i-col>
                  <i-col span="14" class="need-append">
                    <Select
                      v-model="script.type"
                      placement="bottom"
                      placeholder="请选择动作类型"
                    >
                      <Option value>请选择动作类型</Option>
                      <Option
                        v-for="(action,index) in actions"
                        :key="index"
                        :value="action.value"
                      >{{action.name}}</Option>
                    </Select>
                  </i-col>
                </Row>

                <!-- the settig content of different action types -->
                <actions :script="script"></actions>
              </div>

              <!-- actions of the question when having conditions -->
              <div v-if="script.objName=='if'">
                <Row class="mb15">
                  <i-col span="3" offset="2" class="text-center">
                    <span class="label">逻辑条件：</span>
                  </i-col>
                  <i-col span="4">
                    <Select
                      v-model="script.objName"
                      @on-change="changeFilter({name:script.objName,index:index,type:'after'})"
                    >
                      <Option value="action">无条件</Option>
                      <Option value="if">有条件</Option>
                    </Select>
                  </i-col>
                  <i-col span="10" class="pl30">
                    <Input @on-blur.prevent="validate(script.test)" type="text" v-model="script.test" placeholder="请输入表达式"/>
                  </i-col>
                  <i-col span="2" class="pl30">
                    <a
                      href="#"
                      class="delete"
                      @click.prevent="deleteFilter({type:'after',index:index})"
                    >
                      <i class="fa fa-trash"></i>
                    </a>
                  </i-col>
                </Row>
                <!-- true actions start -->
                <div class="wrapper-condition-true">
                  <Row>
                    <i-col span="3" offset="2" class="text-center" v-if="script.trueActions == 0">
                      <span class="label">条件成立时：</span>
                    </i-col>
                  </Row>
                  <div
                    class="wrapper-action"
                    v-for="(action,index) in script.trueActions"
                    :key="index"
                  >
                    <Row>
                      <i-col span="3" offset="2" class="text-center">
                        <span class="label" :class="{'colorWhite':index > 0 }">条件成立时：</span>
                      </i-col>
                      <i-col class="mb15 need-append" span="14">
                        <Select
                          v-model="action.type"
                          placement="bottom"
                          placeholder="请选择动作类型"
                        >
                          <Option value>请选择动作类型</Option>
                          <Option
                            v-for="(action,index) in actions"
                            :key="index"
                            :value="action.value"
                          >{{action.name}}</Option>
                        </Select>
                      </i-col>
                      <i-col span="2" class="pl30">
                        <a href="#" class="delete" @click="deleteAction(script,'true',index)">
                          <i class="fa fa-trash"></i>
                        </a>
                      </i-col>
                    </Row>
                    <!-- the settig content of different action types -->
                    <actions :script="action"></actions>

                    <Row>
                      <i-col offset="5" span="16" class="border"></i-col>
                    </Row>
                  </div>
                  <Row class="mb15">
                    <i-col offset="5">
                      <a href="#" @click.prevent="addAction('true',script)">
                        <i class="fa fa-plus-square-o"></i>
                        <span>添加动作</span>
                      </a>
                    </i-col>
                  </Row>
                </div>
                <!-- true actions end -->

                <!-- false actions start -->
                <div class="wrapper-condition-false">
                  <Row>
                    <i-col span="3" offset="2" class="text-center" v-if="script.falseActions == 0">
                      <span class="label">条件不成立时：</span>
                    </i-col>
                  </Row>
                  <div
                    class="wrapper-action"
                    v-for="(action,index) in script.falseActions"
                    :key="index"
                  >
                    <Row>
                      <i-col span="3" offset="2" class="text-center">
                        <span class="label" :class="{'colorWhite':index > 0 }">条件不成立时：</span>
                      </i-col>
                      <i-col class="mb15 need-append" span="14">
                        <Select
                          v-model="action.type"
                          placement="bottom"
                          placeholder="请选择动作类型"
                        >
                          <Option value>请选择动作类型</Option>
                          <Option
                            v-for="(action,index) in actions"
                            :key="index"
                            :value="action.value"
                          >{{action.name}}</Option>
                        </Select>
                      </i-col>
                      <i-col span="2" class="pl30">
                        <a href="#" class="delete" @click="deleteAction(script,'false',index)">
                          <i class="fa fa-trash"></i>
                        </a>
                      </i-col>
                    </Row>
                    <!-- the settig content of different action types -->
                    <actions :script="action"></actions>

                    <Row>
                      <i-col offset="5" span="16" class="border"></i-col>
                    </Row>
                  </div>
                  <Row class="mb15">
                    <i-col offset="5">
                      <a href="#" @click.prevent="addAction('false',script)">
                        <i class="fa fa-plus-square-o"></i>
                        <span>添加动作</span>
                      </a>
                    </i-col>
                  </Row>
                </div>
                <!-- false actions end -->
              </div>
            </div>
          </div>
          <div class="wrapper-cdata" v-if="afterFilter && editAfterFilterInCode == true">
            <Input type="textarea" :rows="20" v-model="afterFilter.cdata"/>
          </div>
        </div>
      </Panel>
      <!-- after filters setting end -->
    </Collapse>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import * as Utils from "../tool/utils";

import LanguageType from "../constant/language-type";
import Filter from "../filter/filter";
import FilterIf from "../filter/filter-if";
import FilterAction from "../filter/filter-action";

import actions from "./common/actions";

export default {
  name: "",
  components: { actions },
  data() {
    return {
      value: [1, 2, 3],
      editBeforeFilterInCode: false,
      editMiddleFilterInCode: false,
      editAfterFilterInCode: false,
      actions: [
        { value: "setq", name: "设置问题属性" },
        { value: "setoption", name: "设置选项属性" },
        { value: "setrow", name: "设置表格行属性" },
        { value: "setlang", name: "设置问卷语言" },
        { value: "setv", name: "设置变量的值" },
        { value: "repeat-once", name: "循环一次" },
        { value: "repeat", name: "循环" },
        { value: "goto", name: "跳转" },
        { value: "alert", name: "警告信息" },
        { value: "clear", name: "清空问题" },
        { value: "skip", name: "跳过本题" },
        { value: "setexit", name: "设置退出编码" },
        { value: "exit", name: "退出问卷" }
      ]
    };
  },
  computed: {
    ...mapState({
      filterList: state => state.SectionInfoModule.FilterList
    }),

    // scripts of befor filter
    beforeFilter: {
      get: function() {
        for (let filter of this.filterList) {
          if (filter.type == "before") {
            return filter;
          }
        }
      },
      set: function(newfilter) {}
    },

    // scripts of middle filter
    middleFilter: {
      get: function() {
        for (let filter of this.filterList) {
          if (filter.type == "middle") {
            return filter;
          }
        }
      },
      set: function(newfilter) {}
    },

    // scripts of after filter
    afterFilter: {
      get: function() {
        for (let filter of this.filterList) {
          if (filter.type == "after") {
            return filter;
          }
        }
      },
      set: function(newfilter) {}
    }
  },
  mounted() {
    // showing the code view if the filter has cdata
    if (this.beforeFilter && this.beforeFilter.cdata) {
      this.editBeforeFilterInCode = true;
    }
    if (this.middleFilter && this.middleFilter.cdata) {
      this.editMiddleFilterInCode = true;
    }
    if (this.afterFilter && this.afterFilter.cdata) {
      this.editAfterFilterInCode = true;
    }
  },
  methods: {
    ...mapActions({
      addFilter: "sectionCreateFilter" // add a new filter of the questions
    }),
    visualView(filterType) {
      // show visual view of before filter
      if (filterType == "before") {
        if (
          this.editBeforeFilterInCode == true &&
          confirm("切换后不会保存当前编辑的内容！确定要切换视图吗？")
        ) {
          this.editBeforeFilterInCode = false;

          let _this = this;
          _this.filterList.forEach(function(filter, index) {
            if (filter.type == "before") {
              _this.filterList.splice(index, 1);
              return false;
            }
          });
        }
      }
      // show visual view of middle filter
      if (filterType == "middle") {
        if (
          this.editMiddleFilterInCode == true &&
          confirm("切换后不会保存当前编辑的内容！确定要切换视图吗？")
        ) {
          this.editMiddleFilterInCode = false;

          let _this = this;
          _this.filterList.forEach(function(filter, index) {
            if (filter.type == "middle") {
              _this.filterList.splice(index, 1);
              return false;
            }
          });
        }
      }
      // show visual view of after filter
      if (filterType == "after") {
        if (
          this.editAfterFilterInCode == true &&
          confirm("切换后不会保存当前编辑的内容！确定要切换视图吗？")
        ) {
          this.editAfterFilterInCode = false;

          let _this = this;
          _this.filterList.forEach(function(filter, index) {
            if (filter.type == "after") {
              _this.filterList.splice(index, 1);
              return false;
            }
          });
        }
      }
    },
    codeView(filterType) {
      // show code view of before filter
      if (filterType == "before") {
        if (
          this.editBeforeFilterInCode == false &&
          confirm("切换后不会保存当前编辑的内容！确定要切换视图吗？")
        ) {
          this.editBeforeFilterInCode = true;

          let newFilter = new Filter({
            type: "before",
            cdata: "function(env){\n\n}"
          });
          // let _this = this;
          // if (_this.filterList.length > 0) {
          //   _this.filterList.forEach(function(filter, index) {
          //     if (filter.type == "before") {
          //       _this.filterList.splice(index, 1, newFilter);
          //       return false;
          //     }
          //   });
          // } else {
            this.filterList.push(newFilter);
          // }
        }
      }
      // show code view of middle filter
      if (filterType == "middle") {
        if (
          this.editMiddleFilterInCode == false &&
          confirm("切换后不会保存当前编辑的内容！确定要切换视图吗？")
        ) {
          this.editMiddleFilterInCode = true;

          let newFilter = new Filter({
            type: "middle",
            cdata: "function(env){\n\n}"
          });
          // let _this = this;
          // if (this.filterList.length > 0) {
          //   this.filterList.forEach(function(filter, index) {
          //     if (filter.type == "middle") {
          //       this.filterList.splice(index, 1, newFilter);
          //       return false;
          //     }
              
          //   });
          // } else {
            this.filterList.push(newFilter);
          // }
        }
      }
      // show code view of after filter
      if (filterType == "after") {
        if (
          this.editAfterFilterInCode == false &&
          confirm("切换后不会保存当前编辑的内容！确定要切换视图吗？")
        ) {
          this.editAfterFilterInCode = true;

          let newFilter = new Filter({
            type: "after",
            cdata: "function(env){\n\n}"
          });
          // if (this.filterList.length > 0) {
          //   this.filterList.forEach(function(filter, index) {
          //     if (filter.type == "after") {
          //       this.filterList.splice(index, 1, newFilter);
          //       return false;
          //     }
          //   });
          // } else {
            this.filterList.push(newFilter);
          // }
        }
      }
    },

    // change the type of filter (action or if)
    changeFilter(option) {
      let objName = option.name;
      let index = option.index;
      let type = option.type;

      // when the filter has conditions
      if (objName == "if") {
        let newFilter = new FilterIf({ objName: objName });

        if (type == "before") {
          this.beforeFilter.scripts.splice(index, 1, newFilter);
        }
        if (type == "middle") {
          this.middleFilter.scripts.splice(index, 1, newFilter);
        }
        if (type == "after") {
          this.afterFilter.scripts.splice(index, 1, newFilter);
        }
      }
      // when the filter has no conditions
      if (objName == "action") {
        let newFilter = new FilterAction({ objName: objName });

        if (type == "before") {
          this.beforeFilter.scripts.splice(index, 1, newFilter);
        }
        if (type == "middle") {
          this.middleFilter.scripts.splice(index, 1, newFilter);
        }
        if (type == "after") {
          this.afterFilter.scripts.splice(index, 1, newFilter);
        }
      }
    },

    // delete a filter of the question
    deleteFilter(option) {
      let type = option.type;
      let index = option.index;

      if (type == "before") {
        // delete before filter
        let _this = this;
        _this.beforeFilter.scripts.splice(index, 1);
        if (_this.beforeFilter.scripts.length == 0) {
          _this.filterList.forEach(function(script, index) {
            if (script.type == "before") {
              _this.filterList.splice(index, 1);
            }
          });
        }
      }
      if (type == "middle") {
        // delete middle filter
        let _this = this;
        _this.middleFilter.scripts.splice(index, 1);
        if (_this.middleFilter.scripts.length == 0) {
          _this.filterList.forEach(function(script, index) {
            if (script.type == "middle") {
              _this.filterList.splice(index, 1);
            }
          });
        }
      }
      if (type == "after") {
        // delete after filter
        let _this = this;
        _this.afterFilter.scripts.splice(index, 1);
        if (_this.afterFilter.scripts.length == 0) {
          _this.filterList.forEach(function(script, index) {
            if (script.type == "after") {
              _this.filterList.splice(index, 1);
            }
          });
        }
      }
    },

    // add a new action of filter script when having conditions
    addAction(actionType, script) {
      let newAction = new FilterAction();

      if (actionType == "true") {
        script.trueActions.push(newAction);
      }
      if (actionType == "false") {
        script.falseActions.push(newAction);
      }
    },

    // delete a action of filter scripts when having conditions
    deleteAction(script, actionType, index) {
      if (actionType == "true") {
        script.trueActions.splice(index, 1);
      }
      if (actionType == "false") {
        script.falseActions.splice(index, 1);
      }
    },

    // 条件验证
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
#question-filter-editor {
  .wrapper-sctipt-list {
    position: relative;
    .tool-bar {
      position: absolute;
      top: -54px;
      right: 0;
      height: 38px;
      line-height: 38px;
    }
    .sctipt-list {
      line-height: 32px;
      .script {
        & + .script {
          border-top: 1px dashed #ddd;
          padding-top: 15px;
        }
      }
      .colorWhite {
        color: #fff !important;
      }
      .border {
        border: 1px dashed #ddd;
        margin-bottom: 20px;
      }
    }
  }
}
</style>

<style>
  #question-filter-editor .need-append .ivu-select .ivu-select-dropdown {
    top: 32px !important;
    height: 200px !important;
  }
</style>
