import Filter from '../filter/filter';
import FilterIf from '../filter/filter-if';
import FilterAction from '../filter/filter-action';

export default {
  state: {
    currentSectionInfo: null,
    FilterList: []
  },
  mutations: {
    sectionEdit (state, section) {
      let newSection = cloneSection(section);
      state.currentSectionInfo = newSection;
    },
    saveSectionInfo (state, query) {
      let sectionList = query.sectionList
      let editSection = sectionList.filter(section => section.guid == state.currentSectionInfo.guid)[0]
      editSection.id = state.currentSectionInfo.id
      editSection.title['zh'] = state.currentSectionInfo.title['zh']
      editSection.isRepeat = state.currentSectionInfo.isRepeat
      editSection.repeatTimes = state.currentSectionInfo.repeatTimes
    },
    sectionCreateFilter (state, filterType) {
      if (state.FilterList.length > 0) {
        state.FilterList.forEach((filter, index) => {
          if (Object.values(filter).includes(filterType)) {
            let script = new FilterAction()
            state.FilterList[index].scripts.push(script)
          } else {
            let newFilter = new Filter({
              type: filterType
            })
            let script = new FilterAction()
            newFilter.scripts.push(script)
            state.FilterList.push(newFilter)
          }
        })
      } else {
        let newFilter = new Filter({
          type: filterType
        })
        let script = new FilterAction()
        newFilter.scripts.push(script)
        state.FilterList.push(newFilter)
      }
    }
  },
  actions: {
    // 编辑分页
    sectionEdit ({ commit, rootState }, query) {
      let section = query.section
      commit('toggleSelected', section.id)
      commit('sectionEdit', section)
      commit('changeEditStatus', {
        openEditBox:true,
        questionEdit: false,
        isEditSection: true
      })
    },
    // 保存分页
    saveSectionInfo ({ commit, rootState }) {
      commit('saveSectionInfo', { sectionList: rootState.QuestionInfoModule.SectionList})
      commit('changeEditStatus', {
        openEditBox: false,
        questionEdit: false,
        isEditSection: false
      });
    },
    // 创建逻辑
    sectionCreateFilter ({ commit }, filterType) {
      commit('sectionCreateFilter', filterType)
    }
  }
}

// 克隆分页
function cloneSection (section) {
  let newSection = JSON.parse(JSON.stringify(section))
  return newSection
}