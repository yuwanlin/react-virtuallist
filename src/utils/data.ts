import Mock from 'mockjs'

export interface Item {
  id: number
  title: string
  content: string
}
export const data = Mock.mock({
  'list|60-100': [{
    'id|+1': 1,
    'title|2-5': '你好',
    'content|1-10': '这是content'
  }]
})