<!-- resource base -->
<template>
 <transition name="fade">
    <div class="container-resource">
        <!-- modal of add tags -->
        <Modal v-model="modalAddTags" width="400px;" title="创建新标签" @on-cancel="cancel('tagForm')">
            <Form ref="tagForm" :rules="tagFormRules" :model="tagForm">
                <FormItem prop="tagName">
                    <Input v-model="tagForm.tagName" placeholder="请输入标签名称" />
                </FormItem>
            </Form>
            <div slot="footer">
                <i-button type="default"  @click="cancel('tagForm')">取消</i-button>
                <i-button type="warning"  @click="addTag('tagForm')">确定</i-button>
            </div>
        </Modal>

        <!-- modal of delete tags -->
        <Modal v-model="modalDeleteTags" width="400px;" title="删除标签" @on-ok="deleteTag(currentTagId)" @on-cancel="modalDeleteTags = false">
            确定删除该标签吗？
        </Modal>

        <!-- modal of delete resources -->
        <Modal v-model="modalDeleteResources" width="400px;" title="删除资源" @on-ok="deleteResource(currentResource.id)" @on-cancel="modalDeleteResources = false">
            确定删除当前选中的资源吗？
        </Modal>

        <!-- left nav start -->
        <i-col span="4" class="left">
            <div class="warpper-search">
                <Input prefix="ios-search" v-model="searchText" @on-keydown.13.prevent="searchResource(searchText)" placeholder="请输入名称" style="width: 100%" />
            </div>
            <div class="wrapper-leftnav">
                <ul class="wrapper-projects">
                    <li :class="{'active':showAll}" @click="selectedTag('')"> <span class="count"> {{totalCount}} </span> 全部资源 </li>
                </ul>
                <div class="wrapper-tool">
                    <div class="tool-bar">
                        <span @click="openAddModal()"> 创建 </span> &nbsp;&nbsp; | &nbsp;&nbsp; 
                        <span v-if="!isManageTags" @click="manageTags()"> 管理 </span>  
                        <span v-else @click="manageTags()"> 完成 </span>
                    </div>
                    <span> 标签 </span>
                </div>
                <ul class="wrapper-tags">
                    <li class="tag-item" v-for="tag in TagList" :key="tag.id" @click="selectedTag(tag)" :class="{'active':tag.isSelected}"> 
                        <span class="count" v-if="!isManageTags" v-text="tag.num"> 0 </span>
                        <span class="remove" v-else @click="isDeleteTag(tag)"><i class="fa fa-times-circle-o"></i></span>
                        <span> {{tag.name}} </span>
                    </li>
                </ul>
            </div>
        </i-col>
        <!-- left nav end -->

        <!-- assets block start -->
        <i-col span="16" class="middle">
            <Tabs value="image"> 
                <TabPane label="图片" name="image">
                    <div class="thumb" v-for="image in imageList" :key="image.id" @click="selectedResource(image)">
                        <div class="assets-card" :class="{'selected':image.isSelected}" >
                            <img :src="baseUrl + image.url" />
                            <a href="javascript:" class="remove" v-show="image.isSelected" @click.prevent="isDeleteResource(image)">
                                <i class="fa fa-times-circle"></i> 
                            </a>
                        </div>
                        <p class="assets-name">{{image.name}}</p>
                    </div>
                </TabPane>
                <TabPane label="音频" name="audio">
                    <div class="thumb" v-for="audio in audioList" :key="audio.id" @click="selectedResource(audio)">
                        <div class="assets-card" :class="{'selected':audio.isSelected}" >
                            <audio :src="baseUrl + audio.url" controls="controls"></audio>
                            <a href="javascript:" class="remove" v-show="audio.isSelected" @click.prevent="isDeleteResource(audio)">
                                <i class="fa fa-times-circle"></i> 
                            </a>
                        </div>
                        <p class="assets-name">{{audio.name}}</p>
                    </div>
                </TabPane>
                <TabPane label="视频" name="video">
                    <div class="thumb" v-for="video in videoList" :key="video.id" @click="selectedResource(video)">
                        <div class="assets-card" :class="{'selected':video.isSelected}" >
                            <video :src="baseUrl + video.url" controls="controls"></video>
                            <a href="javascript:" class="remove" v-show="video.isSelected" @click.prevent="isDeleteResource(video)">
                                <i class="fa fa-times-circle"></i>
                            </a>
                        </div>
                        <p class="assets-name">{{video.name}}</p>
                    </div>
                </TabPane>
            </Tabs>
        </i-col>
        <!-- assets block end -->

        <!-- right block start -->
        <i-col span="4" class="right">
            <div class="msg-info" v-show="!currentResource"> 未选中任何资源 </div>
            <div class="resource-info" v-show="currentResource">
                <div class="preview">
                    <img v-if="currentResource.type == 1" :src="baseUrl + currentResource.url" />
                    <audio v-if="currentResource.type == 2" :src="baseUrl + currentResource.url" controls="controls"></audio>
                    <video v-if="currentResource.type == 3" :src="baseUrl + currentResource.url" controls="controls"></video>
                </div>
                <div class="btn-group">
                    <label for="replaceFile">替换</label>
                    <input type="file" id="replaceFile" accept=".jpg, .jpeg, .png,.mp3,.mp4" style="display:none;" @change="replaceResource($event)" />
                    <button type="button" v-show="isInsertResource" @click.prevent="insert()">插入</button>
                </div>
                <div class="wrapper-edit">
                    <div class="control">名称</div>
                    <div class="input"> <Input v-model="currentResource.name" @on-keydown.13.prevent="changeResourceName(currentResource.name)" /> </div>
                    <div class="control clearfix"> 
                        <span>标签</span>
                        <Dropdown trigger="click" :transfer="true" placement="bottom-end">
                            <a href="javascript:void(0)">
                                <i class="fa fa-plus"></i>
                            </a>
                            <DropdownMenu slot="list" style="min-width:200px">
                                <DropdownItem v-for="(tag,index) in TagList" :key="index">
                                    <span @click="changeResourceTag({tagId:tag.id,addOrDel:'add'})">{{tag.name}}</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown> 
                    </div>
                    <div class="resource-tags" v-if="tagsOfResource.length>0">
                        <p class="tag" v-for="tag in tagsOfResource" :key="tag.id">
                            <span>{{tag.name}}</span>
                            <a href="javascript:" class="remove" @click.prevent="changeResourceTag({tagId:tag.id,addOrDel:'delete'})">x</a>
                        </p>
                    </div>
                </div>
            </div>
            <div class="drop-zone" ref="resource_drop_zone" :class="{'file-over':isFileOver}">
                <input type="file" id="resourceFile" accept=".jpg, .jpeg, .png,.mp3,.mp4" style="display:none;" @change="onFileChange($event)" />
                <i class="fa fa-cloud-upload"></i><br/>
                <span>将文件拖到这里或<label class="btn-upload" for="resourceFile">上传</label></span>
            </div>
        </i-col>
        <!-- right block end -->
    </div>
  </transition >
</template>

<script>
import { mapState,mapActions, mapMutations } from "vuex";
    export default {
        name: '',
        data() {
            return {
                showAll: true,              // active the class of default
                modalDeleteTags: false,     // toggle show or hide the tag's modal
                modalDeleteResources:false, // toggle show or hide the resource's modal
                isManageTags:false,         // toggle show or hide the delete btn of tags
                isFileOver: false,          // using for showing the file is over the zone when dragging to upload
                tagForm:{
                    tagName:'',
                },
                tagFormRules:{
                    tagName: [
                        { required: true, message: '请输入标签名', trigger: 'blur' }
                    ],
                },
                currentTagId: '',            // the id of selected tag to be used to delete a tag
                searchText:''
            }
        },
        computed:{
            ...mapState({
                TagList: state=>state.ResourceBaseModule.TagList,
                totalCount:state=>state.ResourceBaseModule.dataSourceList.length,
                ResourceList: state=>state.ResourceBaseModule.ResourceList
            }),

            // toggle the resource base
            showResourcePanel:{
                get:function() {
                    return this.$store.state.showResourcePanel
                },
                set:function(newValue) {
                    this.$store.state.showResourcePanel = newValue;
                }
            },

            // to show the insert btn or not
            isInsertResource:{
                get:function() {
                    return this.$store.state.ResourceBaseModule.isInsertResource
                },
                set:function(newValue) {
                    this.$store.state.ResourceBaseModule.isInsertResource = newValue;
                }
            },

            // toggle the add tags modal
            modalAddTags:{
                get:function() {
                    return this.$store.state.ResourceBaseModule.modalAddTags
                },
                set:function(flag) {}
            },

            // the resouce that is selected
            currentResource:{
                get:function() {
                    return this.$store.state.ResourceBaseModule.currentResource
                },
                set:function(item) {
                   this.$store.state.ResourceBaseModule.currentResource = item;
                }
            },
            
            previousResource:{
                get:function() {
                    return this.$store.state.ResourceBaseModule.previousResource
                },
                set:function(item) {
                   this.$store.state.ResourceBaseModule.previousResource = item;
                }
            },

            // the tags of a resource
            tagsOfResource:{
                get:function() {
                    return this.$store.state.ResourceBaseModule.tagsOfResource
                },
                set:function(tags) {
                   this.$store.state.ResourceBaseModule.tagsOfResource = tags;
                }
            },

            // the id of selected tag
            selectedTagId:{
                get:function() {
                    return this.$store.state.ResourceBaseModule.selectedTagId
                },
                set:function(tagId) {
                   this.$store.state.ResourceBaseModule.selectedTagId = tagId;
                }
            },

            // get images
            imageList: {
                get: function () {
                    let imgArr = [];
                    for(let resource of this.ResourceList) {
                        if(resource.type == 1) {
                            if(resource.id == this.currentResource.id) {
                                this.$set(resource, 'isSelected', true);
                            } else {
                                this.$set(resource, 'isSelected', false);
                            }
                            imgArr.push(resource)
                        }
                    }
                    return imgArr;
                },
                set: function (newResource) {}
            },

            // get audios
            audioList: {
                get: function () {
                    let audioArr = [];
                    for(let resource of this.ResourceList) {
                        if(resource.type == 2) {
                            this.$set(resource, 'isSelected', false);
                            audioArr.push(resource)
                        }
                    }
                    return audioArr;
                },
                set: function (newResource) {}
            },

            // get videos
            videoList: {
                get: function () {
                    let videoArr = [];
                    for(let resource of this.ResourceList) {
                        if(resource.type == 3) {
                            this.$set(resource, 'isSelected', false);
                            videoArr.push(resource)
                        }
                    }
                    return videoArr;
                },
                set: function (newResource) {}
            }
        },
        mounted(){
            // this.getTagList();
            this.getResourceList();

            // process drag upload
            let _this = this;
            _this.$refs.resource_drop_zone.ondragenter =function(e){
                e.preventDefault();;
                e.stopPropagation();
                _this.isFileOver = true;
            }
            _this.$refs.resource_drop_zone.ondragover =function(e){
                e.preventDefault();
                e.stopPropagation();
                _this.isFileOver = true;
            }
            _this.$refs.resource_drop_zone.ondragleave =function(e){
                e.preventDefault();
                e.stopPropagation();
                _this.isFileOver = false;
            }
            _this.$refs.resource_drop_zone.ondrop =function(e){
                e.preventDefault();
                e.stopPropagation();
                _this.isFileOver = false;
                
                let file = e.dataTransfer.files[0];
                _this.uploadResource(file);
            }
            
        },
        methods:{
            ...mapMutations(['openAddModal','closeAddModal']),
            ...mapActions(['createTag','getTagList','deleteTag','getResourceList','renderResourceList','deleteResource',
            'uploadResource','updateResource','changeResourceName','changeResourceTag','searchResource','insertResource']),

            // open tag's create modal
            addTag(formName) {
                let _this = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        _this.createTag(_this.tagForm.tagName);
                    } 
                })
            },

            // close tag's create modal
            cancel(formName) {
                this.closeAddModal();
                this.$refs[formName].resetFields();
            },

            // selecte a tag
            selectedTag(tag) {
                if(tag) {
                    this.selectedTagId = tag.id;
                    this.showAll = false;
                    for(let item of this.TagList) {
                        item.isSelected = false;
                    }
                    tag.isSelected = true;
                } else {
                    this.selectedTagId = '';
                    this.showAll = true;
                    for(let item of this.TagList) {
                        item.isSelected = false;
                    }
                }
                this.renderResourceList();
            },
        
            // manage tags
            manageTags() {
                if(this.isManageTags == true) {
                    this.isManageTags = false;
                } else {
                    this.isManageTags = true;
                }
            },

            // show tag's delete modal
            isDeleteTag(tag) {
                this.modalDeleteTags = true;
                this.currentTagId = tag.id;
            },

            // selected a resource
            selectedResource(resource) {
                this.previousResource = resource;

                // show the preview resource
                this.currentResource = {
                    id: resource.id,
                    isSelected: resource.isSelected,
                    name: resource.name,
                    organizationId: resource.organizationId,
                    tagId: resource.tagId,
                    type: resource.type,
                    url: resource.url
                };

                // show selected resource
                if(resource.type == 'image') {
                    for(let image of this.imageList) {
                        image.isSelected = false;
                    }
                }
                if(resource.type == 'audio') {
                    for(let audio of this.audioList) {
                        audio.isSelected = false;
                    }
                }
                if(resource.type == 'video') {
                    for(let video of this.videoList) {
                        video.isSelected = false;
                    }
                }
                resource.isSelected = true;

                // show the resource's tags
                let tagArr = [];
                let tagIdArr = resource.tagId.replace(/\[|\]/g, '').split(',');
                if(tagIdArr) {
                    for(let tagId of tagIdArr) {
                        let tag = this.TagList.find(item => item.id == tagId);
                        if(tag) {
                            tagArr.push(tag);
                        }
                    }
                    this.tagsOfResource = tagArr;
                }
            },

            // open resource's delete modal
            isDeleteResource(resource) {
                this.modalDeleteResources = true;
                this.currentResource = resource;
            },

            // get the file of input when upload resources
            onFileChange(e) {
                let file = e.target.files[0];
                this.uploadResource(file);
            },

            // get the file of input when replace resources
            replaceResource(e) {
                let file = e.target.files[0];
                let resourceId = this.currentResource.id;
                let organizationId = this.currentResource.organizationId
                let option = {
                  file: file,
                  resourceId: resourceId,
                  organizationId: organizationId
                }
                this.updateResource(option);
            },

            // insert a resource
            insert() {
                this.isInsertResource = false;
                this.showResourcePanel = false;

                let restype = '';
                if(this.currentResource.type == 1) {
                    restype = 'img';
                } else if(this.currentResource.type == 2) {
                    restype = 'voice';
                } else if(this.currentResource.type == 3) {
                    restype = 'video';
                }

                let option = {
                    restype: restype,
                    resurl: this.currentResource.url
                }
                this.insertResource(option);
            }
        }
    }
</script>

<style lang="scss" scoped>
    .container-resource{
        min-width: 1200px;
        position: absolute;
        padding-top: 80px;
        top: 0px;
        left: 0px;
        z-index: 100;
        background: rgba(255,255,255,0.9);
        width: 100%;
        height: 100%;
        overflow: hidden;
        .left{
            height:100%;
            overflow-y: auto;
            .warpper-search{
                margin: 15px;
            }
            .wrapper-projects{
                li{
                    height: 40px;
                    line-height: 40px;
                    padding: 0px 10px;
                    cursor: pointer;
                    .count{
                        float: right;
                        color: #f78000;
                    }
                    &.active,&:hover{
                        background: #f1f1f1;
                    }
                }
            }
            .wrapper-tool{
                height: 40px;
                line-height: 40px;
                padding: 0px 10px;
                .tool-bar{
                    float: right;
                    span{
                        cursor: pointer;
                        color: #f78000;
                    }
                }
                span{
                    color: #888;
                }
            }
            .wrapper-tags{
                li{
                    height: 40px;
                    line-height: 40px;
                    padding: 0px 10px;
                    cursor: pointer;
                    .count{
                        float: right;
                        color: #f78000;
                        height: 40px;
                        line-height: 40px;
                        padding: 0px 10px;
                    }
                    .remove{
                        float: right;
                        height: 40px;
                        line-height: 40px;
                        padding: 0px 10px;
                        cursor: pointer;
                        color: #ee1508;
                    }
                    &.active,&:hover{
                        background: #f1f1f1;
                    }
                }
            }
        }
        .middle{
            height:100%;
            overflow-y: auto;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
        }
        .right{
            height: 100%;
            overflow-y: auto;
            position:relative;
            .msg-info{
                min-height: 85%;
                text-align: center;
                padding-top: 180px;
                color: #888;
                padding-bottom: 120px;
            }
            .resource-info{
                min-height: 85%;
                color: #888;
                padding: 20px 10px 120px;
                .preview{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 170px;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
                    background-size: 18px 18px;
                    background-position: 0 9px, 9px 18px;
                    background-clip: content-box;
                    background-image: linear-gradient(45deg, #d9d9d9 26%, transparent 25%, transparent 74%, #d9d9d9 74%, #d9d9d9), 
                            linear-gradient(45deg, #d9d9d9 25%, transparent 25%, transparent 75%, #d9d9d9 75%, #d9d9d9);
                    
                    img {
                        display: block;
                        width: 100%;
                        max-height: 100%;
                    }
                    audio, video{
                        display: block;
                        width: 100%;
                        height: 100%;
                        object-fit: fill
                    }
                    .remove {
                        display: none;
                    }
                }
                .btn-group{
                    margin: 15px 0px;
                    width: 100%;
                    display: flex;
                    button, label{
                        flex: auto;
                        margin-bottom: 0;
                        display: block;
                        background: none;
                        border: 1px solid #f55d54;
                        text-align: center;
                        color: #f55d54;
                        font-weight: normal;
                        padding: 5px 0px;
                        cursor: pointer;
                        &:focus{
                            outline: none;
                        }
                    }
                    button ~ label, button ~ button,
                    label ~ label, label ~ button {
                        margin-left: 15px;
                    }
                }
                .wrapper-edit{
                    .control{
                        color: #888;
                        font-weight: normal;
                        margin-bottom: 10px;
                        span{
                            float: left;
                        }
                        .ivu-dropdown{
                            float: right;
                            a{
                                color: #f78000;
                            }
                        }
                    }
                    .input{
                        margin-bottom: 15px;
                    }
                    .resource-tags{
                        .tag{
                            display: inline-block;
                            margin: 0px 10px 10px 0px;
                            background: #f55d541a;
                            color: #f55d54;
                            padding-left: 5px;
                            a{
                                color: #f55d54;
                                padding: 0px 5px;
                            }
                        }
                    }
                }
            }
            .drop-zone{
                width: 85%;
                height: 100px;
                border: 1px dashed #ddd;
                margin: 0 auto;
                text-align: center;
                padding-top: 20px; 
                background: #fff;
                i{
                    font-size: 30px;
                    color: #888;
                    display: inline-block;
                }
                span{
                    display: inline-block;
                    .btn-upload{
                        font-weight: normal;
                        color: #f7800f;
                        cursor: pointer;
                    }
                }
                &.file-over {
                    background-color: #ddd;
                }
            }
        }
    }
.fade-enter-active, .fade-leave-active {
  transition: opacity .8s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
<style lang="scss">
    .ivu-dropdown-item{
        span{
            display: block;
            padding: 7px 16px;
        }
    }
    .ivu-modal{
        .ivu-modal-header,
        .ivu-modal-footer{
            border: 0px;
        }
        .ivu-modal-body{
            font-size: 14px;
        }
    }
    .ivu-tabs{
        .ivu-tabs-bar{
            border-bottom: 0px;
            margin-top: 20px;
            .ivu-tabs-nav-scroll{
                .ivu-tabs-nav{
                    margin: 0 auto;
                    left:50%;
                    margin-left:-114px;
                }
            }
            .ivu-tabs-nav{
                .ivu-tabs-ink-bar{
                    background: #f78000;
                }
                .ivu-tabs-tab:hover,
                .ivu-tabs-tab-active{
                    color:#f78000;
                }
            } 
        }
        .ivu-tabs-content{
            .ivu-tabs-tabpane{
                padding:0px 30px;
                &:before,&:after{
                    display: block;
                    content: '';
                    clear: both;
                }
                .thumb{
                    width: 18.4%;
                    height: 200px;
                    float: left;
                    margin-right: 2%;
                    margin-bottom: 20px;
                    &:nth-child(5n){
                        margin-right: 0;
                    }
                    .assets-card{
                        height: 85%;
                        position: relative;
                        cursor: pointer;
                        border: 1px solid #ddd;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.2);
                        &:hover{
                            border-color: #f78000;
                        }
                        img{
                            display: block;
                            width: 100%;
                        }
                        audio, video{
                            display: block;
                            width: 100%;
                            height: 100%;
                            object-fit: fill
                        }
                        .remove{
                            display: none;
                            width: 20px;
                            height: 20px;
                            text-align: center;
                            line-height: 20px;
                            color: #ee1508;
                            font-size:20px;
                            position: absolute;
                            top: -5px;
                            right: -6px;
                        }
                        &.selected{
                            box-shadow: 0 0 8px 0 rgba(245, 92, 84, 0.2), 0 0 2px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px #f55d54;
                            .remove{
                                display: block;
                            }
                        }
                    }
                    .assets-name{
                        text-align: center;
                        margin: 10px 0px 0px;
                    }
                }
            }
        }
    }
</style>
