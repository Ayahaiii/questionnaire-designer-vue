import axios from 'axios';
import * as Utils from '../tool/utils';
import { ImageType, AudioType, VideoType } from '../constant/resource-type'
import { URL_RESOURCE_UPLOAD, URL_RESOURCE_DOWNLOAD, URL_RESOURCE_DELETE, URL_RESOURCE_UPDATE, URL_RESOURCE_REPLACE,URL_RESOURCE_SEARCH, URL_TAG_ADD, URL_TAG_DELETE, URL_TAG_LIST } from '../constant/server-url'
import { httpPost } from '../http/httpService'
import { Message } from 'iview'


axios.defaults.withCredentials = true;
let $axios = axios.create();
let qs = require('qs');

export default {
  state: {
    modalAddTags: false, // toggle the modal of add a tag
    isInsertResource: false, // to show the insrt btn or not
    previousResource: '', // using as a medium to change selected resource's tagId when changing resource's tags
    currentResource: '', // the id of selected resource to bt used to delete a resource
    dataSourceList: [], // using as the source data list when toggling the tag
    TagList: [], // deposit tags
    ResourceList: [], // deposit resources
    tagsOfResource: [], // deposit tags of a resource
    selectedTagId: '', // the id of selected tag
  },
  mutations: {
    // open add tag modal
    openAddModal(state) {
      state.modalAddTags = true;
    },

    // close add tag modal
    closeAddModal(state) {
      state.modalAddTags = false;
    },

    // get tag's list
    getTagList(state) {
      httpPost(URL_TAG_LIST).then(res => {
        if (res.code == 0) {
          let tagList = res.data
          state.TagList = tagList
        } else {
          Message.error(res.message || '获取标签列表失败')
        }
      })
    },

    // create a new tag
    createTag(state, option) {
      let name = option.tagName;
      let organizationId = option.organizationId;

      httpPost(URL_TAG_ADD, {
        id: organizationId,
        name: name
      }).then(res => {
        if (res.code == 0) {
          this.commit('getResourceList');
          state.modalAddTags = false;
        } else {
          Message.error(res.message || '创建标签失败');
        }
      }).catch(() => {
        Message.error('创建标签失败');
      })
    },

    // delete a tag
    deleteTag(state, option) {
      httpPost(`${URL_TAG_DELETE}/${option.tagId}`).then(res => {
        if (res.code == 0) {
          this.commit('getResourceList')
        } else {
          Message.error(res.message || '删除标签失败')
        }
      }).catch(() => {
        Message.error('删除标签失败')
      })
    },

    // get resources's list
    getResourceList(state) {
      state.ResourceList = [];
      state.dataSourceList = [];
      httpPost('/w1/questionnaire/resource/list', null).then(res => {
        if (res.code == 0) {
          let resourceList = res.data
          let _resourceList = [], _tagList = []
          resourceList.forEach(item => {
            let tmpTagObj = {
              id: item.tagId,
              name: item.tagName
            }
            if (item.tagId != 0) {
              _tagList.push(tmpTagObj)
            } else {
              item.resourceList.forEach(value => _resourceList.push(value))
            }
          })

          // 处理资源列表
          state.ResourceList = _resourceList;
          state.dataSourceList = _resourceList;
          this.commit('renderResourceList');
          if (state.currentResource) {
            let selectedResource = state.ResourceList.find(resource => resource.id == state.currentResource.id);
            state.currentResource = selectedResource;
          }

          // 处理标签列表
          if (_tagList.length > 0) {
            for (let tag of _tagList) {
              tag.isSelected = false;
            }
            state.TagList = _tagList;
          }
        } else {
          Message.error(res.message || "获取问卷资源失败")
        }
      })
    },

    renderResourceList(state) {
      let ResourceList = state.dataSourceList;
      let filteredResourceList = state.selectedTagId ? ResourceList.filter(resource => {
        let tagIdArr = JSON.parse(resource.tagId)
        let include = tagIdArr.includes(state.selectedTagId)
        return include
      }) : ResourceList

      state.ResourceList = filteredResourceList;
    },

    // upload a new resource
    uploadResource(state, option) {
      let file = option.file;
      let fileName = file.name;
      let fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
      let resourceType = '';

      if (ImageType.indexOf(fileType) != -1) {
        resourceType = 1;
      } else if (AudioType.indexOf(fileType) != -1) {
        resourceType = 2;
      } else if (VideoType.indexOf(fileType) != -1) {
        resourceType = 3;
      }
      if (!resourceType) {
        alert('不支持的文件类型');
        return false;
      }

      let formData = new FormData();
      formData.append('file', file);
      formData.append('type', resourceType);
      formData.append('fileName', fileName);
      formData.append('tagIds', JSON.stringify([]));

      httpPost(URL_RESOURCE_UPLOAD, formData).then(res => {
        if (res.code == 0) {
          Message.success(res.message)
          this.commit('getResourceList')
        } else {
          Message.error(res.message || '文件上传失败')
        }
      }).catch(() => {
        Message.error('文件上传失败')
      })
    },

    // delete a resource
    deleteResource(state, option) {
      let _this = this;
      let resourceId = option.resourceId;

      httpPost(URL_RESOURCE_DELETE + resourceId, null).then(res => {
        if (res.code == 0) {
          _this.commit('getResourceList');
          state.currentResource = '';
        } else {
          Message.error(res.message || '删除资源失败')
        }
      }).catch(() => {
        Message.error('删除资源失败')
      })
    },

    // replace a resource
    updateResource(state, option) {
      let resourceId = option.resourceId;
      let file = option.file;
      let fileName = file.name;
      let fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
      let resourceType = '';

      if (ImageType.indexOf(fileType) != -1) {
        resourceType = 1;
      } else if (AudioType.indexOf(fileType) != -1) {
        resourceType = 2;
      } else if (VideoType.indexOf(fileType) != -1) {
        resourceType = 3;
      }
      if (!resourceType) {
        alert('不支持的文件类型');
        return false;
      }

      let resource = state.ResourceList.find(item => {
        return item.id == resourceId
      })

      let formData = new FormData();
      formData.append('file', file);
      formData.append('type', resourceType);
      formData.append('fileName', resource.name);
      formData.append('tagIds', resource.tagId);
      formData.append('sourceId', resourceId);

      httpPost(URL_RESOURCE_UPDATE, formData).then(res => {
        if (res.code == 0) {
          this.commit('getResourceList')
        } else {
          Message.error(res.message || '替换失败')
        }
      }).catch(() => {
        Message.error(res.message || '替换失败')
      })
    },

    // change the name of a resource
    changeResourceName(state, option) {
      let newName = option.name;

      httpPost(URL_RESOURCE_REPLACE, {
        id: state.currentResource.id,
        name: newName,
        tagId: state.currentResource.tagId
      }).then(res => {
        if (res.code == 0) {
          let resource = state.ResourceList.find(resource => resource.id == state.currentResource.id);
          resource.name = newName;
          Message.success(res.message);
        } else {
          Message.error(res.message || '修改名字失败')
        }
      }).catch(() => {
        Message.error('修改名字失败')
      })
    },

    // change resource's tags
    changeResourceTag(state, option) {
      let addOrDel = option.addOrDel;
      let tagId = option.tagId;
      let resource = state.currentResource;
      let tagIdList = resource.tagId.replace(/\[|\]/g, '').split(',').map(item => {
        return +item
      });

      if (addOrDel == 'add') {
        if (!tagIdList.includes(tagId)) {
          tagIdList.push(tagId)
        }
      } else if (addOrDel == 'delete') {
        tagIdList.splice(tagIdList.indexOf(tagId), 1)
      }
      tagIdList.splice(tagIdList.indexOf(0), 1)
      let newTagId = JSON.stringify(tagIdList);

      httpPost(URL_RESOURCE_REPLACE, {
        id: resource.id,
        name: resource.name,
        tagId: newTagId
      }).then(res => {
        if (res.code == 0) {
          this.commit('getResourceList')
        } else {
          if (addOrDel == 'add') {
            Message.error(res.message || '添加标签失败')
          } else if (addOrDel == 'delete') {
            Message.error(res.message || '删除标签失败')
          }
        }
      }).catch(() => {
        if (addOrDel == 'add') {
          Message.error('添加标签失败')
        } else if (addOrDel == 'delete') {
          Message.error('删除标签失败')
        }
      })
    },

    // search resources
    searchResource(state, option) {
      let keyWord = option.fileName;

      httpPost(URL_RESOURCE_SEARCH, {
        keyword: keyWord
      }).then(res => {
        if (res.code == 0) {
          state.ResourceList = res.data;
          state.dataSourceList = res.data;
          this.commit('renderResourceList');
          if (state.currentResource) {
            let selectedResource = state.ResourceList.find(resource => resource.id == state.currentResource.id);
            state.currentResource = selectedResource;
          }
        } else {
          Message.error(res.message || '获取资源列表失败')
        }
      }).catch(() => {
        Message.error('获取资源列表失败')
      })
    },

    // get questionnaire's page list
    // getPageList(state,option) {
    //   let questionnaireId = option.id
    //   $axios({
    //     method: 'post',
    //     url: URL_GET_QUESTIONNAIRE_PAGE_LIST,
    //     data: qs.stringify({
    //       questionnaireId: questionnaireId
    //     })
    //   }).then((result) => {
    //     if (result.data.success) {
    //       state.periodicPageList = result.data.data
    //     }
    //   })
    // }
  },

  actions: {
    getTagList({
      commit,
      rootState
    }) {
      let organizationId = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.organizationId;
      commit('getTagList', organizationId);
    },
    createTag({
      commit,
      rootState
    }, tagName) {
      let organizationId = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.organizationId;
      commit('createTag', {
        tagName: tagName,
        organizationId: organizationId
      });
    },
    deleteTag({
      commit,
      rootState
    }, tagId) {
      let organizationId = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.organizationId;
      commit('deleteTag', {
        tagId: tagId,
        organizationId: organizationId
      });
    },
    getResourceList({
      commit,
      rootState
    }) {
      let organizationId = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.organizationId;
      commit('getResourceList', organizationId);
    },
    renderResourceList({
      commit
    }) {
      commit('renderResourceList');
    },
    uploadResource({
      commit,
      rootState
    }, file) {
      let organizationId = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.organizationId;
      commit('uploadResource', {
        file: file,
        organizationId: organizationId
      });
    },
    deleteResource({
      commit,
      rootState
    }, resourceId) {
      let organizationId = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.organizationId;
      commit('deleteResource', {
        resourceId: resourceId,
        organizationId: organizationId
      })
    },
    updateResource({
      commit,
      rootState
    }, option) {
      let organizationId = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.organizationId;
      commit('updateResource', {
        ...option,
        organizationId
      })
    },
    changeResourceName({
      commit,
      rootState
    }, fileName) {
      let organizationId = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.organizationId;
      commit('changeResourceName', {
        organizationId: organizationId,
        name: fileName
      })
    },
    changeResourceTag({
      commit,
      rootState
    }, option) {
      let organizationId = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.organizationId;
      commit('changeResourceTag', {
        ...option,
        organizationId
      })
    },
    searchResource({
      commit,
      rootState
    }, fileName) {
      let organizationId = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.organizationId;
      commit('searchResource', {
        organizationId: organizationId,
        fileName: fileName
      })
    }
  }
}
