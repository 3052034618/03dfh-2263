export default defineAppConfig({
  pages: [
    'pages/daily/index',
    'pages/challenge/index',
    'pages/deduction/index',
    'pages/scripts/index',
    'pages/mine/index',
    'pages/ranking/index',
    'pages/review/index',
    'pages/mistakes/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F5F3FF',
    navigationBarTitleText: '质检训练营',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#6B7280',
    selectedColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/daily/index',
        text: '每日任务'
      },
      {
        pagePath: 'pages/challenge/index',
        text: '录音闯关'
      },
      {
        pagePath: 'pages/deduction/index',
        text: '扣分找茬'
      },
      {
        pagePath: 'pages/scripts/index',
        text: '标准话术'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
