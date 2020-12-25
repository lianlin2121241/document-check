import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'check-main',
      component: require('@/components/CheckMain/CheckMain').default
    },
    {
      path: '/setting',
      name: 'setting',
      component: require('@/components/SettingPage/SettingPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
