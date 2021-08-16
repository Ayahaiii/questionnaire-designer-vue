<!-- side bar (left) -->
<template>
  <div class="left">
    <div class="left-resize-bar" id="left-resize-bar" :style="resizeBarStyle"></div>
    <ul>
      <li
        v-for="(question,key,index) in QuestionType"
        @click="addQuestion({type:question.name})"
        :key="index"
      >
      <!-- <li
        v-for="(question,key,index) in QuestionType"
        @click="addQuestion({type:question.name})"
        :key="index"
         v-if="question.name != 'search'"
      > -->
        <i :class="question.icon"></i>
        <span v-text="question.desc"></span>
      </li>
      <!-- <li @click="addSection()">
        <i class="monetware-icon-page"></i>
        <span>分页</span>
      </li> -->
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import QuestionType from "../constant/question-type.js";
import * as Utils from "../tool/utils";
export default {
  name: "",
  data() {
    return {
      QuestionType: QuestionType,
      resizeBarStyle: {
        background: "transparent"
      }
    };
  },
  props: ["questionnaire_block"],
  computed: {
    ...mapState({
      QuestionList: state => state.QuestionInfoModule.QuestionList,
      addGuid: state => state.QuestionInfoModule.addGuid
    }),

    QuestionListLength() {
      return this.QuestionList.length;
    }
  },
  watch: {
    QuestionListLength: {
      handler(newLength, oldLength) {
        if (newLength != oldLength && newLength != 0 && (newLength - oldLength == 1)) {
          Utils.gotoPosition(
            "#questionnaire-block",
            `[data-question-guid="${this.addGuid}"]`
          );
        }
      }
    }
  },
  mounted() {
    // resize the width of left side menu
    $("#left-resize-bar").on("mouseover", function() {
      $("#left-resize-bar").css({
        backgroundColor: "#F05E1F"
      });
    });

    function resetLeftResizeBarColor() {
      $("#left-resize-bar").css({
        backgroundColor: "transparent"
      });
    }
    $("#left-resize-bar").on("mouseout", resetLeftResizeBarColor);
    $("#left-resize-bar").on("mousedown", function(e) {
      let barWidth = $("#left-resize-bar").width();
      let minWidth = 100;
      let maxWidth = 300;

      $("#left-resize-bar").off("mouseout");
      $(document).on("mousemove", function(me) {
        let x = me.clientX;
        if (x > minWidth && x < maxWidth) {
          $(".left").css({
            width: x + barWidth
          });
          $("#questionnaire-block, #wrapper-editor").css({
            left: x + barWidth
          });
        }
      });
      $(document).on("mouseup", function() {
        $("#left-resize-bar").css({
          backgroundColor: "transparent"
        });
        $("#left-resize-bar").on("mouseout", resetLeftResizeBarColor);
        $(document).off("mousemove");
        $(document).off("mouseup");
      });
    });
  },
  methods: {
    ...mapActions(["addQuestion", "addSection"])
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/style/variables.scss";
.left {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: $leftWidth;
  border-right: 1px solid #ddd;
  .left-resize-bar {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 4px;
    &:hover {
      cursor: ew-resize;
    }
  }
  ul {
    height: 100%;
    margin: 0;
    overflow-y: auto;
  }
  li {
    float: left;
    padding: 5px 0px 10px;
    height: 80px;
    width: 90px;
    text-align: center;
    color: #757575;
    cursor: pointer;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -khtml-user-select: none; /* Konqueror */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently not supported by any browser */
    &:hover {
      background: #fcfcfc;
    }
    i {
      font-size: 30px;
      width: 30px;
      height: 42px;
      line-height: 42px;
    }
    span {
      display: block;
      font-size: 12px;
      margin-top: 5px;
    }
  }
}
</style>