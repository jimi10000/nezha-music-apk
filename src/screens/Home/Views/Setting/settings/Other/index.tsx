import { memo, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'

import Section from '../../components/Section'
import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'
import SettingErrorBoundary from '../../components/ErrorBoundary'
import ResourceCache from './ResourceCache'
import MetaCache from './MetaCache'
import DislikeList from './DislikeList'
import Log from './Log'
import DesktopFloatWindow from './DesktopFloatWindow'
// import Karaoke from './Karaoke' // 临时屏蔽 K歌
import EdgeVisualizer from './EdgeVisualizer'
import RhythmLight from './RhythmLight'
import AiPet from './AiPet'
// import MaxCache from './MaxCache'
import { useI18n } from '@/lang'

export default memo(() => {
  const t = useI18n()
  const [active, setActive] = useState<string | null>(null)
  const open = (id: string) => setActive(id)
  const renderModule = () => {
    switch (active) {
      case 'float': return <DesktopFloatWindow />
      case 'pet': return <AiPet />
      // case 'karaoke': return <Karaoke /> // 临时屏蔽
      case 'visualizer': return <EdgeVisualizer />
      case 'rhythm': return <RhythmLight />
      case 'cache': return <><ResourceCache /><MetaCache /></>
      case 'dislike': return <DislikeList />
      case 'log': return <Log />
      default: return null
    }
  }
  return (
    <Section title={t('setting_other')}>
      <View style={styles.notice}><Text style={styles.noticeText}>选择要打开的功能。高级原生功能将按需加载，避免进入此页时触发车机兼容性问题。</Text></View>
      <View style={styles.grid}>
        {[
          ['float', '桌面悬浮窗'], ['pet', 'AI 宠物'], ['visualizer', '边缘灯效'],
          ['rhythm', '氛围灯'],
          ['cache', '缓存管理'], ['dislike', '不喜欢列表'], ['log', '日志'],
        ].map(([id, label]) => <TouchableOpacity key={id} style={styles.button} onPress={() => { open(id) }}><Text>{label}</Text></TouchableOpacity>)}
      </View>
      {active ? <SettingErrorBoundary key={active} label={active}>{renderModule()}</SettingErrorBoundary> : null}
    </Section>
  )
})

const styles = createStyle({
  notice: { paddingRight: 25, paddingBottom: 12 },
  noticeText: { fontSize: 12, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingRight: 25 },
  button: { minWidth: 100, minHeight: 48, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#666666' },
})
