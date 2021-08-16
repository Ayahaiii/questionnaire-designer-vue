<!-- 分页组件编辑的内容 -->
<template>
  <div class="tab-content" id="section-content-editor">
    <Form :model="currentSectionInfo" label-position="left" :label-width="120">
      <FormItem label="标题：">
        <!-- section.title[currentLanguage] -->
        <Input type="text" v-model="currentSectionInfo.title['zh']" />
      </FormItem>
      <FormItem label="ID：">
        <Input type="text" v-model="currentSectionInfo.id" />
      </FormItem>
      <FormItem label="是否循环：">
        <Input type="text" v-model="currentSectionInfo.isRepeat" />
      </FormItem>
      <FormItem label="循环次数：">
        <Input type="text" v-model="currentSectionInfo.repeatTimes" />
      </FormItem>
    </Form>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data () {
    return {
    }
  },
  computed: {
    ...mapState({
      currentSectionInfo: state => state.SectionInfoModule.currentSectionInfo
    })
  }
}
</script>

<style lang='scss' scoped>
</style>
