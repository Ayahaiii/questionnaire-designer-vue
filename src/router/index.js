import Vue from 'vue'
import Router from 'vue-router'

import survml from '@/components/survml'

Vue.use(Router)

export default new Router({
  // mode:'history',
  routes: [
    {
      path: '/',
      name: 'survml',
      component: survml
    }
  ]
})
