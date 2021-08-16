/**
 * State Management Pattern
 */
import Vue from 'vue'
import vuex from 'vuex'
Vue.use(vuex);

import QuestionnaireInfo from './questionnaire-info';
import QuestionInfo from './question-info';
import ResourceBase from './resource-base';
import SectionInfo from './section-info';

export default new vuex.Store({
  state: {
    isSelected: '',
    openEditBox: false,
    questionEdit: false,
    isEditSection: false,
    showResourcePanel: false,
    role: 1
  },
  mutations: {
    toggleSelected(state, value) {
      state.isSelected = value;
    },
    changeEditStatus(state, options) {
      state.openEditBox = options.openEditBox;
      state.questionEdit = options.questionEdit;
      state.isEditSection = options.isEditSection;
      if (state.openEditBox == true) {
        $('#editor-box').scrollTop(0);
        $('#wrapper-editor').css({
          left: $('.left').width()
        });
        $('#questionnaire-block').css({
          bottom: $('#wrapper-editor').height()
        });
      } else {
        $('#questionnaire-block').css({
          bottom: 0
        });
      }
    },
    setRole(state, value) {
      state.role = value
    }
  },
  modules: {
    QuestionnaireInfoMoudle: QuestionnaireInfo,
    QuestionInfoModule: QuestionInfo,
    ResourceBaseModule: ResourceBase,
    SectionInfoModule: SectionInfo
  }
})
