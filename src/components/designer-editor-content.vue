<!-- edit box >>> content -->
<template>
  <div class="tab-content" id="question-content-editor">
    <Form :model="QuestionInfo" label-position="left" :label-width="95">
      <!-- basic question setting start -->
      <div class="wrapper-base">
        <FormItem label="题型：" class="need-append">
          <Select
            v-model="QuestionInfo.type"
            @on-change="changeQuestion(QuestionInfo.type)"
          >
            <Option
              v-for="(question,key,index) in QuestionType"
              :value="question.name"
              :key="index"
              v-if="question.name != 'search'"
            >{{question.desc}}</Option>
          </Select>
        </FormItem>
        <FormItem label="标题：" prop="id" :rules="{pattern:/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,message: '选项编号存在非法字符', trigger: 'blur'}">
          <Row>
            <i-col span="4">
              <Input type="text" v-model="QuestionInfo.id"/>
            </i-col>
            <i-col span="20" class="pl30">
              <Input type="text" v-model="QuestionInfo.title[currentLanguage]"/>
            </i-col>
          </Row>
        </FormItem>
        <FormItem label="资源：">
          <div class="resource" v-if="QuestionInfo.resurl">
            <i-col span="2">
              <img :src="QuestionInfo.resurl" v-if="QuestionInfo.restype == 'img'" alt>
              <audio :src="QuestionInfo.resurl" v-if="QuestionInfo.restype == 'voice'" controls="controls"></audio>
              <video :src="QuestionInfo.resurl" v-if="QuestionInfo.restype == 'video'" controls="controls"></video>
            </i-col>
            <i-col span="22">
              <a href="javascript:void(0)" class="delete" @click.prevent="removeResource()">
                <i class="fa fa-trash"></i>
              </a>
            </i-col>
          </div>
          <Icon
            type="md-add-circle"
            v-else
            class="add-resource-title"
            @click="insertTitleResource()"
          />
        </FormItem>
        <FormItem label="提示：">
          <Row>
            <i-col span="20">
              <div id="questionInfoHint"></div>
              <!-- <Input type="text" v-model="QuestionInfo.hint[currentLanguage]" /> -->
            </i-col>
            <i-col span="4" class="pl30">
              <Checkbox v-model="QuestionInfo.hintHidden">隐藏</Checkbox>
            </i-col>
          </Row>
        </FormItem>
        <FormItem label="变量名：" v-if="QuestionInfo.type != QuestionType.INFO.name">
          <Row>
            <i-col span="10">
              <Input type="text" v-model="QuestionInfo.varname"/>
            </i-col>
            <i-col span="4" class="text-center">
              <span class="label">变量标签：</span>
            </i-col>
            <i-col span="10">
              <Input type="text" v-model="QuestionInfo.vardesc"/>
            </i-col>
          </Row>
        </FormItem>
        <FormItem label="配置：">
          <Row>
            <i-col span="10" class="checkbox-group">
              <Checkbox
                v-model="QuestionInfo.required"
                v-if="QuestionInfo.type != QuestionType.INFO.name && (QuestionInfo.type != QuestionType.MATRIX.name || QuestionInfo.matrixtype != 'dimensions')"
              >必答</Checkbox>
              <Checkbox v-model="QuestionInfo.visible">隐藏</Checkbox>
              <Checkbox
                v-model="QuestionInfo.encryp"
                v-if="QuestionInfo.type == QuestionType.INTEGER.name || 
                QuestionInfo.type == QuestionType.FLOAT.name || QuestionInfo.type == QuestionType.TEXT.name"
              >加密</Checkbox>
              <Checkbox style="width: 25%;" v-model="QuestionInfo.needaudio">禁止录音</Checkbox>
              <Checkbox v-if="QuestionInfo.type == QuestionType.PROVCITY.name" v-model="QuestionInfo.hastown">五级行政</Checkbox>
              <Checkbox v-if="QuestionInfo.type == QuestionType.CASCADE.name" v-model="QuestionInfo.layout">竖排显示</Checkbox>
            </i-col>
            <i-col span="4" class="text-center">
              <span class="label">用户可见：</span>
            </i-col>
            <i-col span="10">
              <Select v-model="QuestionInfo.visibleTo">
                <Option value="0">所有人</Option>
                <Option value="2">质检员可见、APP不可见、二维码不可见</Option>
                <Option value="3">质检员可见、APP可见、二维码不可见</Option>
              </Select>
            </i-col>
          </Row>
        </FormItem>
      </div>
      <!-- basic question setting end -->

      <!-- info question setting start -->
      <div class="wrapper-label" v-if="QuestionInfo.type == QuestionType.INFO.name">
        <FormItem label="正文文本：">
          <div id="infoQuestionContentEditor" v-html="QuestionInfo.content"></div>
        </FormItem>
      </div>
      <!-- info question setting end -->

      <!-- list question (singleselect,multipleselect,dropdown) setting start -->
      <div
        class="wrapper-list"
        v-if="QuestionInfo.type == QuestionType.SINGLE.name  
        || QuestionInfo.type == QuestionType.DROPDOWN.name  || QuestionInfo.type == QuestionType.MULTIPLE.name 
        || QuestionInfo.type == QuestionType.ASSIGNMENT.name || QuestionInfo.type == QuestionType.SORT.name"
      >
        <FormItem>
          <span slot="label" class="btn-toggle" @click="toggle()">
            <i class="fa fa-caret-down"></i> 选项：
          </span>
          <Row>
            <i-col span="4">
              <Select v-model="QuestionInfo.itemSource">
                <Option value="custom">自定义</Option>
                <Option value="fromVariable">来自变量</Option>
              </Select>
            </i-col>
            <i-col span="3" offset="1">
              <Checkbox v-model="QuestionInfo.isCascade">是否级联</Checkbox>
            </i-col>
            <i-col span="3" v-if="QuestionInfo.isCascade" style="margin-right: 20px;">
              <Select v-model="QuestionInfo.parent">
                <Option
                  v-for="(question,index) in QuestionList"
                  :key="index"
                  :value="question.id"
                  v-if="question.type == QuestionType.SINGLE.name  || question.type == QuestionType.DROPDOWN.name || question.type == QuestionType.MULTIPLE.name"
                >{{question.id + question.title[currentLanguage] || question.title['zh']}}</Option>
              </Select>
            </i-col>
            <i-col span="5">
              <Checkbox v-model="QuestionInfo.isSupportVisible" @change="changeVisible">是否支持可见依赖</Checkbox>
            </i-col>
            <i-col v-if="QuestionInfo.type != QuestionType.DROPDOWN.name" span="7" style="display: flex;">
              <Checkbox v-model="QuestionInfo.layout" style="min-width: 80px;">水平显示</Checkbox>
              <Select v-if="QuestionInfo.layout" v-model="QuestionInfo.col" placeholder="一行显示数量">
                <Option :value="0">所有选项</Option>
                <Option :value="2">2个选项</Option>
                <Option :value="3">3个选项</Option>
                <Option :value="4">4个选项</Option>
                <Option :value="5">5个选项</Option>
              </Select>
            </i-col>
          </Row>
        </FormItem>
        <!-- items from custom -->
        <div class="wrapper-item-list" v-if="QuestionInfo.isBatchEdit == false">
          <!-- item list edit -->
          <draggable
            class="list-group"
            element="div"
            v-model="QuestionInfo.itemlist"
            :options="dragOptions"
            :move="onMove"
            @start="isDragging=true"
            @end="isDragging=false"
          >
            <transition-group type="transition" :name="'flip-list'">
              <FormItem
                label=" "
                v-if="QuestionInfo.itemSource == 'custom'"
                v-for="(listItem,index) in QuestionInfo.itemlist"
                :key="listItem.guid"
                :prop="'itemlist.' + index + '.id'"
                :rules="{pattern:/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,message: '选项编号存在非法字符', trigger: 'blur'}"
              >
                <Row>
                  <i-col span="2">
                    <Input type="text" v-model="listItem.id" ref="itemId"/>
                  </i-col>
                  <i-col span="19" class="pl30">
                    <!-- <Input v-if="getCondition(listItem.name[currentLanguage])" type="text" v-model="listItem.name['zh']" @on-focus="onEdit()" ref="itemName" /> -->
                    <Input type="text" v-model="listItem.name[currentLanguage]" placeholder="请输选项内容" ref="itemName"/>
                  </i-col>
                  <i-col span="3" class="wrapper-icons">
                    <a href="#" @click.prevent="deleteOption({optionIndex:index})">
                      <i class="fa fa-trash"></i>
                    </a>
                    <a href="#" class="reorder">
                      <i class="fa fa-reorder"></i>
                    </a>
                    <a
                      href="#"
                      @click.prevent="insertOptionResource(listItem)"
                      v-if="QuestionInfo.type == QuestionType.SINGLE.name ||  QuestionInfo.type == QuestionType.MULTIPLE.name"
                    >
                      <i class="fa fa-plus-circle"></i>
                    </a>
                  </i-col>
                </Row>
                <!-- 单选题、多选题样式 -->
                <Row class="mt15" v-if="QuestionInfo.type == QuestionType.SINGLE.name || QuestionInfo.type == QuestionType.MULTIPLE.name">
                  <i-col v-if="!QuestionInfo.layout" span="6" offset="2" class="pl30">
                    <Select v-model="listItem.inputtype" placeholder="不追加输入">
                      <Option value>不追加输入</Option>
                      <Option value="int">追加输入整数</Option>
                      <Option value="float">追加输入小数</Option>
                      <Option value="string">追加输入文本</Option>
                    </Select>
                  </i-col>
                  <i-col :span="QuestionInfo.layout ? '10' : '4'" class="text-center">
                    <Checkbox v-model="listItem.inputrequired">是否必填</Checkbox>
                  </i-col>
                  <i-col span="3" class="text-center">
                    <span class="label">选中跳转:</span>
                  </i-col>
                  <i-col span="6">
                    <Select v-model="listItem.goto" placeholder="请选中跳转目标">
                      <Option value>请选中跳转目标</Option>
                      <Option
                        v-for="(question,index) in QuestionList.slice(questionIndex+1)"
                        :key="index"
                        :value="question.id"
                      >{{question.id + question.title[currentLanguage] || question.title['zh']}}</Option>
                    </Select>
                  </i-col>
                  <i-col span="3" class="text-center" v-if="QuestionInfo.type == QuestionType.MULTIPLE.name">
                    <Checkbox v-model="listItem.order" class="mr0">是否固定底部</Checkbox>
                  </i-col>
                </Row>
                <!-- 单选题、排序题样式 -->
                <Row class="mt15" v-if="QuestionInfo.type == QuestionType.SINGLE.name || QuestionInfo.type == QuestionType.SORT.name || QuestionInfo.type == QuestionType.ASSIGNMENT.name">
                  <i-col span="3" offset="3">
                    <span class="label">选项分值:</span>
                  </i-col>
                  <i-col span="15">
                    <Input type="text" v-model="listItem.score"/>
                  </i-col>
                  <!-- <i-col span="3" class="text-center" v-show="QuestionInfo.type == QuestionType.ASSIGNMENT.name">
                    <Checkbox class="mr0" v-model="listItem.calc">>显示计算器</Checkbox>
                  </i-col> -->
                </Row>
                <!-- 多选题样式 -->
                <Row class="mt15" v-if="QuestionInfo.type == QuestionType.MULTIPLE.name">
                  <i-col span="12">
                    <Row>
                      <i-col span="5" offset="6">
                        <span class="label">选项分值:</span>
                      </i-col>
                      <i-col span="11" offset="1">
                        <Input type="text" v-model="listItem.score"/>
                      </i-col>
                    </Row>
                  </i-col>
                  <i-col v-if="!QuestionInfo.layout" span="12">
                    <Row>
                      <i-col span="5" offset="1">
                        <span class="label">选项分组:</span>
                      </i-col>
                      <i-col span="5">
                        <Select v-model="listItem.group">
                          <Option v-for="(group, groupIndex) in optionGroup" :key="groupIndex" :value="group.value">{{group.label}}</Option>
                        </Select>
                      </i-col>
                      <i-col span="6" offset="1" v-show="listItem.group == '自定义'">
                        <Input @on-blur="validDefinedGroup(listItem.userDefinedGroup)" type="text" placeholder="自定义分组" v-model="listItem.userDefinedGroup" />
                      </i-col>
                    </Row>
                  </i-col>
                </Row>
                <Row class="mt15" v-if="QuestionInfo.isCascade">
                  <i-col span="2" offset="3">
                    <span class="label" style="position: relative; right: 10px;">级联编号:</span>
                  </i-col>
                  <i-col span="16">
                    <Input type="text" v-model="listItem.parentId"/>
                  </i-col>
                </Row>
                <Row class="mt15 resource" v-if="listItem.resurl">
                  <i-col offset="2" span="3" class="pl30">
                    <img :src="listItem.resurl" v-if="listItem.restype == 'img'" alt>
                    <audio
                      :src="listItem.resurl"
                      v-if="listItem.restype == 'voice'"
                      controls="controls"
                    ></audio>
                    <video
                      :src="listItem.resurl"
                      v-if="listItem.restype == 'video'"
                      controls="controls"
                    ></video>
                  </i-col>
                  <i-col span="19">
                    <a
                      href="javascript:void(0)"
                      class="delete"
                      @click.prevent="removeResource(listItem)"
                    >
                      <i class="fa fa-trash"></i>
                    </a>
                  </i-col>
                </Row>
                <Row class="mt15" v-if="QuestionInfo.isSupportVisible">
                  <i-col span="3" offset="3">
                    <span class="label">可见依赖：</span>
                  </i-col>
                  <i-col span="15">
                    <Input @on-blur.prevent="validate(listItem.visibleDependent)" v-model="listItem.visibleDependent" type="text" placeholder="请输入自定义条件" />
                  </i-col>
                </Row>
              </FormItem>
            </transition-group>
          </draggable>
        </div>
        <!-- batch edit -->
        <div class="wrapper-batch-edit" v-if="QuestionInfo.isBatchEdit == true">
          <FormItem label>
            <Input type="textarea" :rows="10" v-model="QuestionInfo.batchEditContent"/>
          </FormItem>
        </div>
        <FormItem v-if="QuestionInfo.itemSource == 'custom'" class="wrapper-add-option">
          <a
            href="javascript:void(0)"
            @click.prevent="addOption()"
            v-show="!QuestionInfo.isBatchEdit"
          >
            <i class="fa fa-plus-square-o"></i>
            <span>添加选项</span>
          </a>
          <a
            href="javascript:void(0)"
            @click.prevent="batchEditStart()"
            v-show="!QuestionInfo.isBatchEdit"
          >
            <i class="fa fa-file-text-o"></i>
            <span>批量编辑</span>
          </a>
          <a
            href="javascript:void(0)"
            @click.prevent="batchEditEnd()"
            v-show="QuestionInfo.isBatchEdit"
          >
            <i class="fa fa-check"></i>
            <span>完成编辑</span>
          </a>
        </FormItem>
        <!-- items from variables -->
        <FormItem v-if="QuestionInfo.itemSource == 'fromVariable'" class="wrapper-item-variables">
          <Row>
            <i-col span="3" offset="2" class="pl30">
              <span class="label">变量名称:</span>
            </i-col>
            <i-col span="16">
              <Select v-model="QuestionInfo.options">
                <Option
                  v-for="(variable,index) in VariableList"
                  :key="index"
                  :value="variable.id"
                >{{variable.id}}</Option>
              </Select>
            </i-col>
          </Row>
        </FormItem>
        <!-- singleselect and multipleselect question -->
        <FormItem
          label="选项顺序:"
          v-if="QuestionInfo.type == QuestionType.SINGLE.name || QuestionInfo.type == QuestionType.MULTIPLE.name"
        >
          <Row>
            <i-col span="10">
              <Select v-model="QuestionInfo.order">
                <Option value="normal">顺序</Option>
                <Option value="random">随机</Option>
                <Option value="reverse">倒序</Option>
              </Select>
            </i-col>
            <i-col span="4" class="pl30">
              <span class="label">选项编号：</span>
            </i-col>
            <i-col span="10">
              <Select v-model="QuestionInfo.showid">
                <Option value="true">显示</Option>
                <Option value="false">隐藏</Option>
              </Select>
            </i-col>
          </Row>
        </FormItem>
        <!-- multipleselect and sort question -->
        <FormItem
          label="最少选项："
          v-if="QuestionInfo.type == QuestionType.MULTIPLE.name || QuestionInfo.type == QuestionType.SORT.name"
        >
          <Row>
            <i-col span="10">
              <InputNumber :min="0" v-model="QuestionInfo.min"></InputNumber>
            </i-col>
            <i-col span="4" class="pl30">
              <span class="label">最多选项：</span>
            </i-col>
            <i-col span="10">
              <InputNumber :min="0" v-model="QuestionInfo.max"></InputNumber>
            </i-col>
          </Row>
        </FormItem>
        <!-- assignment question -->
        <FormItem label="值类型：" v-if="QuestionInfo.type == QuestionType.ASSIGNMENT.name">
          <Row>
            <i-col span="21">
              <Select v-model="QuestionInfo.valuetype">
                <Option value="int">整数</Option>
                <Option value="float">小数</Option>
                <Option value="string">文本</Option>
              </Select>
            </i-col>
          </Row>
        </FormItem>
      </div>
      <!-- list question setting end -->

      <!-- integer | float question setting start -->
      <div
        class="wrapper-number-question"
        v-if="QuestionInfo.type == QuestionType.INTEGER.name ||  QuestionInfo.type == QuestionType.FLOAT.name || (QuestionInfo.type == QuestionType.ASSIGNMENT.name && QuestionInfo.valuetype == 'int')"
      >
        <FormItem label="显示计算器：">
          <Checkbox v-model="QuestionInfo.calc"></Checkbox>
        </FormItem>
      </div>
      <!-- integer | float question setting end -->

      <!-- datetime question setting start -->
      <div class="wrapper-datetime" v-if="QuestionInfo.type == QuestionType.DATETIME.name">
        <FormItem label="日期格式：">
          <Row>
            <i-col span="24">
              <Select v-model="QuestionInfo.format">
                <Option value="yy-mm-dd">年-月-日</Option>
                <Option value="hh:mm:ss">时:分:秒</Option>
                <Option value="yy-mm-dd hh:mm:ss">年-月-日 时:分:秒</Option>
              </Select>
            </i-col>
          </Row>
        </FormItem>
      </div>
      <!-- datetime question setting end -->

      <!-- scale question setting start -->
      <div class="wrapper-scale" v-if="QuestionInfo.type == QuestionType.SCALE.name">
        <FormItem label="打分形式：">
          <Row>
            <i-col span="24">
              <Select v-model="QuestionInfo.layout">
                <Option value="drag">拖拽</Option>
                <Option value="star">星级</Option>
              </Select>
            </i-col>
          </Row>
        </FormItem>
        <FormItem label="最低分：">
          <Row>
            <i-col span="10">
              <Input v-model="QuestionInfo.minscale"/>
            </i-col>
            <i-col span="4" class="text-center">
              <span class="label">描述：</span>
            </i-col>
            <i-col span="10">
              <Input v-model="QuestionInfo.mindesc[currentLanguage]"/>
            </i-col>
          </Row>
        </FormItem>
        <FormItem label="最高分：">
          <Row>
            <i-col span="10">
              <Input v-model="QuestionInfo.maxscale"/>
            </i-col>
            <i-col span="4" class="text-center">
              <span class="label">描述：</span>
            </i-col>
            <i-col span="10">
              <Input v-model="QuestionInfo.maxdesc[currentLanguage]"/>
            </i-col>
          </Row>
        </FormItem>
      </div>
      <!-- scale question setting end -->

      <!-- matrix question setting start -->
      <div class="wrapper-matrix" v-if="QuestionInfo.type == QuestionType.MATRIX.name">
        <FormItem label="布局：">
          <Row>
            <i-col span="18">
              <Select v-model="QuestionInfo.layout" placeholder="默认">
                <Option value>默认</Option>
                <Option value="responsive">自适应</Option>
                <!-- <Option value="horizental">水平显示</Option> -->
                <Option value="fixed-row-title">首列固定</Option>
                <Option value="compact-row-title" v-if="QuestionInfo.matrixtype == 'singledimension'">一列显示</Option>
              </Select>
            </i-col>
            <i-col span="6" class="pl30">
              <Checkbox v-model="QuestionInfo.hscroll">允许横向滚动</Checkbox>
            </i-col>
          </Row>
        </FormItem>
        <FormItem label="表格行：">
          <div class="wrapper-item-row" v-if="QuestionInfo.isBatchEditRow == false">
            <draggable
              class="list-group"
              element="div"
              v-model="QuestionInfo.rows"
              :options="dragOptions"
              :move="onMove"
              @start="isDragging=true"
              @end="isDragging=false"
            >
              <transition-group type="transition" :name="'flip-list'">
                <Row class="mb15" v-for="(row,index) in QuestionInfo.rows" :key="row.guid">
                  <i-col span="2">
                    <Input type="text" v-model="row.id" ref="rowId"/>
                  </i-col>
                  <i-col span="10" class="pl30">
                    <Input
                      type="text"
                      v-model="row.name[currentLanguage]"
                      placeholder="请输入行标题"
                      ref="rowName"
                    />
                  </i-col>
                  <!-- row.filters.filter(val => val.type == 'before')[0].scripts[index].test -->
                  <i-col span="9" class="pl30">
                    <Input
                      type="text"
                      v-model="row.script"
                      placeholder="请输入条件显示"
                      ref="rowCondition"
                    />
                  </i-col>
                  <i-col span="3" class="wrapper-icons">
                    <a href="#" @click.prevent="deleteRow(index)">
                      <i class="fa fa-trash"></i>
                    </a>
                    <a href="#" class="reorder">
                      <i class="fa fa-reorder"></i>
                    </a>
                  </i-col>
                </Row>
              </transition-group>
            </draggable>
          </div>
          <div class="wrapper-batch-edit" v-if="QuestionInfo.isBatchEditRow == true">
            <Input type="textarea" :rows="10" v-model="QuestionInfo.batchEditRowContent"/>
          </div>
          <Row class="wrapper-add-option">
            <a href="javascript:void(0)" @click.prevent="addRow" v-show="!QuestionInfo.isBatchEditRow">
              <i class="fa fa-plus-square-o"></i>
              <span>添加行</span>
            </a>
            <a href="javascript:void(0)" @click.prevent="batchEditStart('row')" v-show="!QuestionInfo.isBatchEditRow">
              <i class="fa fa-file-text-o"></i>
              <span>批量编辑</span>
            </a>
            <a href="javascript:void(0)"
              @click.prevent="batchEditEnd('row')"
              v-show="QuestionInfo.isBatchEditRow">
              <i class="fa fa-check"></i>
              <span>完成编辑</span>
            </a>
          </Row>
        </FormItem>
        <!-- matrix question (singledimension) -->
        <FormItem label="列选项：" v-if="QuestionInfo.type == QuestionType.MATRIX.name && QuestionInfo.matrixtype == 'singledimension'">
          <div class="wrapper-item-col" v-if="QuestionInfo.cols[0].isBatchEdit == false">
            <draggable class="list-group" element="div" v-model="QuestionInfo.cols[0].itemlist" :options="dragOptions" :move="onMove" @start="isDragging=true" @end="isDragging=false">
              <transition-group type="transition" :name="'flip-list'">
                <Row
                  class="mb15"
                  v-for="(listItem,index) in QuestionInfo.cols[0].itemlist"
                  :key="listItem.guid"
                >
                  <i-col span="2">
                    <Input type="text" v-model="listItem.id" ref="colId"/>
                  </i-col>
                  <i-col span="19" class="pl30">
                    <Input
                      type="text"
                      v-model="listItem.name[currentLanguage]"
                      placeholder="请输入选项内容"
                      ref="colName"
                    />
                  </i-col>
                  <i-col span="3" class="wrapper-icons">
                    <a href="#" @click.prevent="deleteCol(index)">
                      <i class="fa fa-trash"></i>
                    </a>
                    <a href="#" class="reorder">
                      <i class="fa fa-reorder"></i>
                    </a>
                  </i-col>
                </Row>
              </transition-group>
            </draggable>
          </div>
          <div class="wrapper-batch-edit" v-if="QuestionInfo.cols[0].isBatchEdit == true">
            <Input type="textarea" :rows="10" v-model="QuestionInfo.cols[0].batchEditContent"/>
          </div>
          <Row class="wrapper-add-option">
            <a href="javascript:void(0)" @click.prevent="addCol()" v-show="!QuestionInfo.cols[0].isBatchEdit">
              <i class="fa fa-plus-square-o"></i>
              <span>添加列选项</span>
            </a>
            <a href="javascript:void(0)" @click.prevent="batchEditStart()" v-show="!QuestionInfo.cols[0].isBatchEdit">
              <i class="fa fa-file-text-o"></i>
              <span>批量编辑</span>
            </a>
            <a href="javascript:void(0)" @click.prevent="batchEditEnd()" v-show="QuestionInfo.cols[0].isBatchEdit">
              <i class="fa fa-check"></i>
              <span>完成编辑</span>
            </a>
          </Row>
        </FormItem>
        <!-- matrix question (dimensions) -->
        <FormItem label="列问题：" v-if="QuestionInfo.type == QuestionType.MATRIX.name && QuestionInfo.matrixtype == 'dimensions'">
          <div class="col-question-list" v-if="QuestionInfo.cols.length>0">
            <!-- col questions -->
            <draggable
              class="list-group"
              element="div"
              v-model="QuestionInfo.cols"
              :options="dragOptions"
              :move="onMove"
              @start="isDragging=true"
              @end="isDragging=false"
            >
              <transition-group type="transition" :name="'flip-list'">
                <div
                  class="col-question"
                  v-for="(colQuestion,index) in QuestionInfo.cols"
                  :key="colQuestion.guid"
                >
                  <Row class="mb15">
                    <i-col span="3" v-if="colQuestion.type == QuestionType.SINGLE.name">
                      <span class="label">单选题：</span>
                    </i-col>
                    <i-col span="3" v-if="colQuestion.type == QuestionType.MULTIPLE.name">
                      <span class="label">多选题：</span>
                    </i-col>
                    <i-col span="3" v-if="colQuestion.type == QuestionType.DROPDOWN.name">
                      <span class="label">下拉单选题：</span>
                    </i-col>
                    <i-col span="3" v-if="colQuestion.type == QuestionType.INTEGER.name">
                      <span class="label">整数题：</span>
                    </i-col>
                    <i-col span="3" v-if="colQuestion.type == QuestionType.FLOAT.name">
                      <span class="label">小数题：</span>
                    </i-col>
                    <i-col span="3" v-if="colQuestion.type == QuestionType.TEXT.name">
                      <span class="label">文本题：</span>
                    </i-col>
                    <i-col span="3">
                      <Input type="text" v-model="colQuestion.id"/>
                    </i-col>
                    <i-col span="15" class="pl30">
                      <Input
                        type="text"
                        v-model="colQuestion.title[currentLanguage]"
                        ref="itemName"
                      />
                    </i-col>
                    <i-col span="3" class="wrapper-icons">
                      <a href="#" @click.prevent="deleteCol(index)">
                        <i class="fa fa-trash"></i>
                      </a>
                      <a href="#" class="reorder">
                        <i class="fa fa-reorder"></i>
                      </a>
                    </i-col>
                  </Row>
                  <!-- col questions options of singleselect or multiselect or dropdown-->
                  <div
                    v-if="colQuestion.type == QuestionType.SINGLE.name || colQuestion.type == QuestionType.MULTIPLE.name || colQuestion.type == QuestionType.DROPDOWN.name"
                  >
                    <div class="wrapper-item-list" v-if="colQuestion.isBatchEdit == false">
                      <draggable
                        class="list-group"
                        element="div"
                        v-model="colQuestion.itemlist"
                        :options="dragOptions"
                        :move="onMove"
                        @start="isDragging=true"
                        @end="isDragging=false"
                      >
                        <transition-group type="transition" :name="'flip-list'">
                          <Row
                            class="item mb15"
                            v-for="(listItem,itemIndex) in colQuestion.itemlist"
                            :key="listItem.guid"
                          >
                            <i-col span="3" offset="3" class="text-center">
                              <span class="label" :class="{'colorWhite':itemIndex > 0 }">选项：</span>
                            </i-col>
                            <i-col span="3" class="pl30">
                              <Input type="text" v-model="listItem.id" :ref="'colId'+index"/>
                            </i-col>
                            <i-col span="12" class="pl30">
                              <Input
                                type="text"
                                v-model="listItem.name[currentLanguage]"
                                placeholder="请输入选项内容"
                                :ref="'colName'+index"
                              />
                            </i-col>
                            <i-col span="3" class="wrapper-icons">
                              <a
                                href="#"
                                @click.prevent="deleteOption({questionIndex:index,optionIndex:itemIndex})"
                              >
                                <i class="fa fa-trash"></i>
                              </a>
                              <a href="#" class="reorder">
                                <i class="fa fa-reorder"></i>
                              </a>
                            </i-col>
                          </Row>
                        </transition-group>
                        <Row key="isRequired" class="item mb15">
                          <i-col span="3" offset="3">
                            <span class="label">是否必填：</span>
                          </i-col>
                          <i-col span="15" class="pl30">
                            <Checkbox v-model="colQuestion.isAnswer">必答</Checkbox>
                          </i-col>
                        </Row>
                        <Row key="isHorizental" class="item mb15">
                          <i-col span="3" offset="3">
                            <span class="label">显示风格：</span>
                          </i-col>
                          <i-col span="15" class="pl30">
                            <Checkbox v-model="colQuestion.isHorizental">水平显示</Checkbox>
                          </i-col>
                        </Row>
                      </draggable>
                    </div>
                    <div class="wrapper-batch-edit" v-if="colQuestion.isBatchEdit == true">
                      <Row class="pl30">
                        <i-col span="2" offset="2" class="text-center">
                          <span class="label">选项：</span>
                        </i-col>
                        <i-col span="20">
                          <Input type="textarea" :rows="10" v-model="colQuestion.batchEditContent"/>
                        </i-col>
                      </Row>
                    </div>
                    <Row class="wrapper-add-option pl30">
                      <i-col span="18" offset="6">
                        <a
                          href="javascript:void(0)"
                          @click.prevent="addOption(index)"
                          v-show="!colQuestion.isBatchEdit"
                        >
                          <i class="fa fa-plus-square-o"></i>
                          <span>添加列选项</span>
                        </a>
                        <a
                          href="javascript:void(0)"
                          @click.prevent="batchEditStart(index)"
                          v-show="!colQuestion.isBatchEdit"
                        >
                          <i class="fa fa-file-text-o"></i>
                          <span>批量编辑</span>
                        </a>
                        <a
                          href="javascript:void(0)"
                          @click.prevent="batchEditEnd(index)"
                          v-show="colQuestion.isBatchEdit"
                        >
                          <i class="fa fa-check"></i>
                          <span>完成编辑</span>
                        </a>
                      </i-col>
                    </Row>
                  </div>
                  <div v-if="colQuestion.type == QuestionType.INTEGER.name || colQuestion.type == QuestionType.TEXT.name || colQuestion.type == QuestionType.FLOAT.name">
                    <Row key="isRequired" class="item mb15">
                      <i-col span="3" offset="3">
                        <span class="label">是否必填：</span>
                      </i-col>
                      <i-col span="15" class="pl30">
                        <Checkbox v-model="colQuestion.isAnswer">必答</Checkbox>
                      </i-col>
                    </Row>
                  </div>
                </div>
              </transition-group>
            </draggable>
          </div>
          <Row class="mt15">
            <i-col span="3">
              <i-button @click="addCol({type:colQuestionType})">添加一列</i-button>
            </i-col>
            <i-col span="18" class="pl30">
              <Select v-model="colQuestionType">
                <Option :value="QuestionType.SINGLE.name">单选题</Option>
                <Option :value="QuestionType.MULTIPLE.name">多选题</Option>
                <Option :value="QuestionType.DROPDOWN.name">下拉单选题</Option>
                <Option :value="QuestionType.INTEGER.name">整数题</Option>
                <Option :value="QuestionType.FLOAT.name">小数题</Option>
                <Option :value="QuestionType.TEXT.name">文本题</Option>
              </Select>
            </i-col>
          </Row>
          <!-- <Row class="mt15">
            <i-col span="4">
              <span class="label">是否水平显示：</span>
            </i-col>
            <i-col span="16">
              <Checkbox v-model="QuestionInfo.isHorizental">是</Checkbox>
            </i-col>
          </Row> -->
        </FormItem>
      </div>
      <!-- matrix question setting end -->

      <!-- photo qusetion setting start -->
      <div class="wrapper-photo" v-if="QuestionInfo.type == QuestionType.PHOTO.name">
        <FormItem label="来源：">
          <Row>
            <i-col span="10">
              <RadioGroup v-model="QuestionInfo.source">
                <Radio :label="0">两种</Radio>
                <Radio :label="1">相册</Radio>
                <Radio :label="2">拍照</Radio>
              </RadioGroup>
            </i-col>
          </Row>
        </FormItem>
        <FormItem label="照片数量：">
          <Row>
            <i-col span="10">
              <InputNumber v-model="QuestionInfo.count" :min="0" :step="1"></InputNumber>
            </i-col>
            <i-col span="4" class="text-center">
              <span class="label">照片精确度：</span>
            </i-col>
            <i-col span="10">
              <Select v-model="QuestionInfo.quality">
                <Option value="high">高</Option>
                <Option value="medium">中</Option>
                <Option value="low">底</Option>
              </Select>
            </i-col>
          </Row>
        </FormItem>
      </div>
      <!-- photo question setting end -->

      <!-- recording qusetion setting start -->
      <div class="wrapper-recording" v-if="QuestionInfo.type == QuestionType.RECORDING.name">
        <FormItem label="音频数量：">
          <Row>
            <i-col span="10">
              <InputNumber v-model="QuestionInfo.count" :min="0" :step="1"></InputNumber>
            </i-col>
            <i-col span="4" class="text-center">
              <span class="label">音频质量：</span>
            </i-col>
            <i-col span="10">
              <Select v-model="QuestionInfo.quality">
                <Option value="high">高</Option>
                <Option value="medium">中</Option>
                <Option value="low">底</Option>
              </Select>
            </i-col>
          </Row>
        </FormItem>
      </div>
      <!-- recording question setting end -->

      <!-- location qusetion setting start -->
      <div class="wrapper-location" v-if="QuestionInfo.type == QuestionType.LOCATION.name">
        <FormItem label="定位方式：">
          <Row>
            <i-col span="24">
              <Select v-model="QuestionInfo.method">
                <Option value="gps">GPS</Option>
                <Option value="cell">基站</Option>
                <Option value="all">混合</Option>
              </Select>
            </i-col>
          </Row>
        </FormItem>
      </div>
      <!-- location question setting end -->

      <!-- cascade qusetion setting start -->
      <div class="wrapper-cascade" v-if="QuestionInfo.type == QuestionType.CASCADE.name">
        <FormItem label="级联级别：">
          <Row class="mb15" v-for="(item,index) in QuestionInfo.cdata" :key="index">
            <i-col span="3" class="text-center">
              <span class="label">第 {{index+1}} 级名称：</span>
            </i-col>
            <i-col span="7" class="text-center">
              <Input type="text" v-model="item.title"/>
            </i-col>
            <i-col span="4" class="text-center">
              <span class="label">关联数据：</span>
            </i-col>
            <i-col span="9">
              <Select v-model="item.options">
                <Option
                  v-for="(variable,index) in VariableList"
                  :key="index"
                  :value="variable.id"
                >{{variable.id}}</Option>
              </Select>
            </i-col>
            <i-col span="1" class="wrapper-icons text-center">
              <a href="javascript:void(0)" @click.prevent="deleteCasItem(index)">
                <i class="fa fa-trash"></i>
              </a>
            </i-col>
          </Row>
          <Row>
            <a href="javascript:void(0)" @click.prevent="addCasItem">
              <i class="fa fa-plus-square-o"></i>
              <span>添加选项</span>
            </a>
          </Row>
        </FormItem>
      </div>
      <!-- cascade question setting end -->

      <!-- file question setting start -->
      <div class="wrapper-cascade" v-if="QuestionInfo.type == QuestionType.FILE.name"></div>
      <!-- file question setting end -->
    </Form>
  </div>
</template>

<script>
import wangEditor from "wangeditor";
import draggable from "vuedraggable";
import { mapState, mapActions } from "vuex";
import QuestionType from "../constant/question-type.js";
import ListQuestion from "../question/list-question";
import MatrixQuestion from "../question/matrix-question";
// import ListItem from 
import * as Utils from "../tool/utils";

export default {
  name: "",
  components: { draggable },
  data() {
    return {
      isDragging: false,
      delayedDragging: false,
      isShowDefaultLang: true,
      QuestionType: QuestionType,
      colQuestionType: "singleselect", // the type of adding col question of matrix question
      beforeScriptList: [],
      showStyle: '列',
      isShowUserDefined: false,
      optionGroup: [
        {
          value: 0,
          label: '默认'
        }, {
          value: 1,
          label: '分组1'
        }, {
          value: 2,
          label: '分组2'
        }, {
          value: 3,
          label: '分组3'
        }, {
          value: '自定义',
          label: '自定义'
        }
      ],
      userDefinedGroup: null,
      userDefinedIndexList: [],
      visibleDependentVal: null,
      dependentRes: 0,
      definedCondition: '',
      isSupportVisible: false
    };
  },
  computed: {
    ...mapState({
      currentLanguage: state =>
        state.QuestionnaireInfoMoudle.QuestionnaireInfo.currentLanguage,
      QuestionInfo: state => {
        return state.QuestionInfoModule.currentQuestionInfo;
      },
      infoQuestionContent: state =>
        state.QuestionInfoModule.infoQuestionContent,
      QuestionList: state => state.QuestionInfoModule.QuestionList,
      VariableList: state => state.QuestionInfoModule.VariableList,
      filterList: state => state.QuestionInfoModule.FilterList,
      beforeScript: state => {
        let _beforeScript = state.QuestionInfoModule.currentQuestionInfo.filters.filter(val => {
          return val.type = 'before'
        })
        // return this.beforeScriptList = _beforeScript
        if (_beforeScript.length !== 0) {
          return _beforeScript.scripts
        } else {
          return []
        }
      },
      isScreenfull: state => state.QuestionnaireInfoMoudle.isScreenfull,
    }),

    // get the wangEditor content of info question
    infoQuestionContent: {
      get: function() {
        return this.$store.state.QuestionInfoModule.infoQuestionContent;
      },
      set: function(content) {
        this.$store.state.QuestionInfoModule.infoQuestionContent = content;
      }
    },

    // get the index of current qustion in QuestionList
    questionIndex() {
      return this.QuestionList.findIndex(
        obj => obj.guid == this.QuestionInfo.guid
      );
    },

    // toggle the resource base
    showResourcePanel: {
      get: function() {
        return this.$store.state.showResourcePanel;
      },
      set: function(newValue) {
        this.$store.state.showResourcePanel = newValue;
      }
    },

    // to show the insert btn or not
    isInsertResource: {
      get: function() {
        return this.$store.state.ResourceBaseModule.isInsertResource;
      },
      set: function(newValue) {
        this.$store.state.ResourceBaseModule.isInsertResource = newValue;
      }
    },

    // option of singleselect or multiselect question when inserting a resource
    currentOption: {
      get: function() {
        return this.$store.state.QuestionInfoModule.currentOption;
      },
      set: function(newOption) {
        this.$store.state.QuestionInfoModule.currentOption = newOption;
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
    },

    // scripts of befor filter
    beforeFilter: {
      get: function() {
        for (let filter of this.filterList) {
          if (filter.type == "before") {
            return filter.scripts;
          }
        }
      },
      set: function(newfilter) {}
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
    },
    QuestionInfo(newQuestionInfo) {
      let editorHint = new wangEditor("#questionInfoHint");
      editorHint.customConfig.pasteTextHandle = function (content) {
        // content 即粘贴过来的内容（html 或 纯文本），可进行自定义处理然后返回
        if (content == '' && !content) return ''
        let str = content
        str = str.replace(/<xml>[\s\S]*?<\/xml>/ig, '')
        str = str.replace(/<style>[\s\S]*?<\/style>/ig, '')
        str = str.replace(/<\/?[^>]*>/g, '')
        str = str.replace(/[ | ]*\n/g, '\n')
        str = str.replace(/&nbsp;/ig, '')
        return str
      }
      editorHint.customConfig.zIndex = 0;
      editorHint.customConfig.onchange = html => {
        newQuestionInfo.hint[this.currentLanguage] = html;
      }
      editorHint.customConfig.menus = [
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
      editorHint.create();
      // 初始化富文本的值
      editorHint.txt.html(newQuestionInfo.hint[this.currentLanguage]);
    },
    'QuestionInfo.layout': {
      handler (value) {
        if (value && this.QuestionInfo.type !== QuestionType.CASCADE.name) {
          this.QuestionInfo.itemlist.forEach(item => {
            item.inputtype = ''
            item.group = 0
          })
        }
      }
    }
  },
  mounted() {
    // using wangEditor of info question
    if (this.QuestionInfo.type == QuestionType.INFO.name) {
      this.editor = new wangEditor("#infoQuestionContentEditor");
      this.editor.customConfig.zIndex = 0;
      this.editor.customConfig.onchange = html => {
        this.infoQuestionContent = html;
      };
      // this.editor.customConfig.pasteFilterStyle = false;
      this.editor.create();
    }
    let editorHint = new wangEditor("#questionInfoHint");
    editorHint.customConfig.zIndex = 0;

    editorHint.customConfig.pasteTextHandle = function (content) {
      // content 即粘贴过来的内容（html 或 纯文本），可进行自定义处理然后返回
      if (content == '' && !content) return ''
      let str = content
      str = str.replace(/<xml>[\s\S]*?<\/xml>/ig, '')
      str = str.replace(/<style>[\s\S]*?<\/style>/ig, '')
      str = str.replace(/<\/?[^>]*>/g, '')
      str = str.replace(/[ | ]*\n/g, '\n')
      str = str.replace(/&nbsp;/ig, '')
      return str
    }

    editorHint.customConfig.onchange = html => {
      this.QuestionInfo.hint[this.currentLanguage] = html;
    }
    editorHint.customConfig.menus = [
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
    editorHint.create();
    // 初始化富文本的值
    editorHint.txt.html(this.QuestionInfo.hint[this.currentLanguage]);
  },
  methods: {
    ...mapActions({
      changeQuestion: "changeQuestion", // change the type of a question
      addOption: "createOption", // add a new option of list questions
      addBatchOption: "createBatchOption", // batch edit options of list question
      deleteOption: "deleteOption", // delete a option of list question
      addCasItem: "addCasItem", // add a new item of cascade question
      deleteCasItem: "deleteCasItem", // delete a item of cascade question
      addRow: "createRow", // add a new row of matrix question
      addBatchRow: "createBatchRow", // batch edit rows of matrix question
      deleteRow: "deleteRow", // delete a row of matrix question
      addCol: "createCol", // add a new col of matrix question
      addBatchCol: "createBatchCol", // batch edit cols of matrix question
      deleteCol: "deleteCol", // delete a col of matrix question
      removeResource: "removeResource" // remove resource of the qiestion or options
    }),

    // 条件验证
    validate(value) {
      let res = Utils._validate_filter_expr(value);
      if (!res.valid) {
        alert(res.err);
      }
    },

    // 切换是否支持可见依赖
    changeVisible () {
      this.isSupportVisible = !this.isSupportVisible
    },

    // 验证自定义选项分组
    validDefinedGroup (value) {
      if (/0|1|2|3/.test(value)) {
        alert('自定义选项分组不能是0、1、2、3');
      }
    },

    // dragging move
    onMove({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;
      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
    },

    // insert question resource
    insertTitleResource() {
      this.showResourcePanel = true;
      this.isInsertResource = true;
    },

    // insert option resource of singleselect or multiselect
    insertOptionResource(option) {
      this.showResourcePanel = true;
      this.isInsertResource = true;
      this.currentOption = option;
    },

    // start batch edit
    batchEditStart(flag) {
      // batch edit options of list questions
      if (this.QuestionInfo instanceof ListQuestion) {
        this.QuestionInfo.isBatchEdit = true;
        let itemIdRef = this.$refs.itemId;
        let itemNameRef = this.$refs.itemName;

        for (let i = 0; i < itemIdRef.length; i++) {
          let itemId = itemIdRef[i].value;
          let itemName = itemNameRef[i].value;
          if (itemName) {
            if (itemId) {
              this.QuestionInfo.batchEditContent += `[${itemId}]`;
            }
            this.QuestionInfo.batchEditContent += `${itemName}\n`;
          }
        }
      }

      if (this.QuestionInfo instanceof MatrixQuestion) {
        // batch edit rows of matrix questions
        if (flag == "row") {
          this.QuestionInfo.isBatchEditRow = true;
          let rowIdRef = this.$refs.rowId;
          let rowNameRef = this.$refs.rowName;

          for (let i = 0; i < rowIdRef.length; i++) {
            let rowId = rowIdRef[i].value;
            let rowName = rowNameRef[i].value;
            if (rowName) {
              if (rowId) {
                this.QuestionInfo.batchEditRowContent += `[${rowId}]`;
              }
              this.QuestionInfo.batchEditRowContent += `${rowName}\n`;
            }
          }
        }

        // batch edit col options of matrix questions
        if (this.QuestionInfo.matrixtype == "singledimension" && !flag) {
          this.QuestionInfo.cols[0].isBatchEdit = true;
          let colIdRef = this.$refs.colId;
          let colNameRef = this.$refs.colName;

          for (let i = 0; i < colIdRef.length; i++) {
            let colId = colIdRef[i].value;
            let colName = colNameRef[i].value;
            if (colName) {
              if (colId) {
                this.QuestionInfo.cols[0].batchEditContent += `[${colId}]`;
              }
              this.QuestionInfo.cols[0].batchEditContent += `${colName}\n`;
            }
          }
        }

        // batch edit options of col questions of matrix questions
        if (this.QuestionInfo.matrixtype == "dimensions" && flag != "row") {
          this.QuestionInfo.cols[flag].isBatchEdit = true;
          let colIdRef = this.$refs["colId" + flag];
          let colNameRef = this.$refs["colName" + flag];

          for (let i = 0; i < colIdRef.length; i++) {
            let colId = colIdRef[i].value;
            let colName = colNameRef[i].value;
            if (colName) {
              if (colId) {
                this.QuestionInfo.cols[flag].batchEditContent += `[${colId}]`;
              }
              this.QuestionInfo.cols[flag].batchEditContent += `${colName}\n`;
            }
          }
        }
      }
    },

    // finish batch edit
    batchEditEnd(flag) {
      //  finish edit options of list questions
      if (this.QuestionInfo instanceof ListQuestion) {
        this.QuestionInfo.isBatchEdit = false;
        if (
          this.QuestionInfo.batchEditContent &&
          this.QuestionInfo.batchEditContent.trim() != ""
        ) {
          let itemInTextArr = this.QuestionInfo.batchEditContent.split("\n");

          this.QuestionInfo.batchEditContent = ""; // clear the textarea
          this.addBatchOption({
            colQuestionIndex: flag,
            itemInTextArr: itemInTextArr
          });
        }
      }

      if (this.QuestionInfo instanceof MatrixQuestion) {
        // finish batch edit rows of matrix questions
        if (flag == "row") {
          this.QuestionInfo.isBatchEditRow = false;
          if (
            this.QuestionInfo.batchEditRowContent &&
            this.QuestionInfo.batchEditRowContent.trim() != ""
          ) {
            let rowInTextArr = this.QuestionInfo.batchEditRowContent.split(
              "\n"
            );

            this.QuestionInfo.batchEditRowContent = ""; // clear the textarea
            this.addBatchRow(rowInTextArr);
          }
        }

        // finish batch edit col options of matrix questions
        if (this.QuestionInfo.matrixtype == "singledimension" && !flag) {
          this.QuestionInfo.cols[0].isBatchEdit = false;
          if (
            this.QuestionInfo.cols[0].batchEditContent &&
            this.QuestionInfo.cols[0].batchEditContent.trim() != ""
          ) {
            let colInTextArr = this.QuestionInfo.cols[0].batchEditContent.split(
              "\n"
            );

            this.QuestionInfo.cols[0].batchEditContent = ""; // clear the textarea
            this.addBatchCol(colInTextArr);
          }
        }

        // finish batch edit col options of col questions matrix questions
        if (this.QuestionInfo.matrixtype == "dimensions" && flag != "row") {
          this.QuestionInfo.cols[flag].isBatchEdit = false;
          if (
            this.QuestionInfo.cols[flag].batchEditContent &&
            this.QuestionInfo.cols[flag].batchEditContent.trim() != ""
          ) {
            let colInTextArr = this.QuestionInfo.cols[
              flag
            ].batchEditContent.split("\n");

            this.QuestionInfo.cols[flag].batchEditContent = ""; // clear the textarea
            this.addBatchOption({
              colQuestionIndex: flag,
              itemInTextArr: colInTextArr
            });
          }
        }
      }
    },

    // getCondition(value) {
    //     console.log(this.currentLanguage);

    //     console.log(value);

    //     if(this.currentLanguage != 'zh' && !value) {
    //         this.isShowDefaultLang = true;
    //     } else if(value == 'edit') {
    //         this.isShowDefaultLang = false;
    //     } else {
    //         this.isShowDefaultLang = false;
    //     }
    //     return  this.isShowDefaultLang;
    // },

    // onEdit() {
    //     this.getCondition('edit');
    // },

    // collapse the options of list question
    toggle() {
      if ($(".wrapper-item-list").hasClass("open")) {
        $(".wrapper-item-list").slideUp(500);
        $(".wrapper-item-list").removeClass("open");
        $(".btn-toggle")
          .find("i")
          .removeClass("fa-caret-down")
          .addClass("fa-caret-right");
      } else {
        $(".wrapper-item-list").slideDown(500);
        $(".wrapper-item-list").addClass("open");
        $(".btn-toggle")
          .find("i")
          .removeClass("fa-caret-right")
          .addClass("fa-caret-down");
      }
    }
  }
};
</script>

<style lang="scss" scoped>
#question-content-editor {
  .add-resource-title {
    color: #337ab7;
    font-size: 20px;
    cursor: pointer;
  }
  .checkbox-group {
    label {
      width: 19%;
    }
    label:last-child {
      width: 25%;
    }
  }
  .ivu-form-item {
    margin-bottom: 20px;
    .ivu-input-number {
      width: 100%;
    }
  }
  .btn-toggle {
    cursor: pointer;
    i {
      padding-left: 5px;
    }
  }
  .resource {
    img,
    audio,
    video {
      height: 50px;
      width: 50px;
    }
    .delete {
      line-height: 50px;
    }
  }
  .wrapper-icons {
    text-align: center;
    a {
      color: #888;
      padding: 0px 5px;
      &.reorder,
      &.reorder-question,
      &.reorder-option {
        cursor: move;
      }
    }
  }
  .wrapper-add-option {
    a {
      color: #337ab7;
      &:nth-child(1) {
        margin-right: 20px;
      }
      &:hover {
        color: #23527c;
      }
    }
  }

  .colorWhite {
    color: transparent !important;
  }
}
</style>
<style type="text/css">
#question-content-editor .ivu-form-label-left .ivu-form-item-label {
  padding-right: 0px !important;
}
#question-content-editor .need-append .ivu-select .ivu-select-dropdown {
  top: 32px !important;
  height: 300px !important;
}
#questionInfoHint .w-e-text-container {
  height: 120px !important;
}
</style>
