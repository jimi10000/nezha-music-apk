import { memo, useEffect, useState } from 'react'
import { Switch, TouchableOpacity, View } from 'react-native'

import SubTitle from '../../components/SubTitle'
import Text from '@/components/common/Text'
import { createStyle, toast } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import {
  getRhythmLightStatus,
  setRhythmLightEnabled,
  setRhythmLightIntensity,
  setRhythmLightBpm,
  setRhythmLightDrivingMode,
  type RhythmLightStatus,
} from '@/utils/nativeModules/rhythmLight'

const INTENSITY_OPTIONS = ['柔和', '标准', '强烈']
const BPM_OPTIONS = ['舒缓(80)', '流行(120)', '动感(160)', '极速(200)']
const BPM_VALUES = [80, 120, 160, 200]

/** 车机物理氛围灯控制：按音乐节奏产生 BPM 节拍脉冲，行驶中自动降级。 */
export default memo(() => {
  const theme = useTheme()
  const [status, setStatus] = useState<RhythmLightStatus | null>(null)
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    let active = true
    void getRhythmLightStatus()
      .then((value) => { if (active && value) setStatus(value) })
      .catch(() => {})
      .finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [])

  const refresh = async() => {
    const value = await getRhythmLightStatus()
    if (value) setStatus(value)
  }

  const handleToggle = async(value: boolean) => {
    if (busy) return
    setBusy(true)
    const ok = await setRhythmLightEnabled(value)
    await refresh()
    if (!ok) toast('氛围灯开启失败，请确认哪吒工具箱已放行对应权限', 'long')
    setBusy(false)
  }

  const setIntensity = async(index: number) => {
    if (busy) return
    setBusy(true)
    await setRhythmLightIntensity([0.35, 0.7, 1.0][index])
    await refresh()
    setBusy(false)
  }

  const setBpm = async(index: number) => {
    if (busy) return
    setBusy(true)
    await setRhythmLightBpm(BPM_VALUES[index])
    await refresh()
    setBusy(false)
  }

  const setDriving = async(value: boolean) => {
    if (busy) return
    setBusy(true)
    await setRhythmLightDrivingMode(value)
    await refresh()
    setBusy(false)
  }

  if (!status) {
    return (
      <SubTitle title="车机氛围灯（RhythmLight）">
        <Text style={styles.desc}>本机暂不支持车机氛围灯硬件，或 Native 模块未初始化。</Text>
      </SubTitle>
    )
  }

  const intensityIndex = status.intensity <= 0.5 ? 0 : status.intensity >= 0.9 ? 2 : 1
  const bpmIndex = Math.max(0, BPM_VALUES.findIndex((v) => v >= status.bpm))

  return (
    <SubTitle title="车机氛围灯（RhythmLight）">
      <View style={styles.row}>
        <View style={styles.textArea}>
          <Text style={styles.title}>启用氛围灯</Text>
          <Text style={[styles.desc, { color: theme['c-font-label'] }]}>按播放节奏产生 BPM 节拍脉冲，控制车机氛围灯；行驶中自动降级</Text>
        </View>
        <Switch
          value={Boolean(status.enabled)}
          onValueChange={(value) => { void handleToggle(value) }}
          disabled={busy}
          trackColor={{ false: theme['c-600'], true: theme['c-primary-alpha-600'] }}
          thumbColor={status.enabled ? theme['c-primary'] : theme['c-300']}
        />
      </View>

      <OptionGroup title="灯光强度" options={INTENSITY_OPTIONS} value={intensityIndex} disabled={busy} onChange={(v) => { void setIntensity(v) }} />
      <OptionGroup title="节奏 BPM" options={BPM_OPTIONS} value={bpmIndex} disabled={busy} onChange={(v) => { void setBpm(v) }} />

      <View style={styles.row}>
        <View style={styles.textArea}>
          <Text style={styles.title}>行驶降级模式</Text>
          <Text style={[styles.desc, { color: theme['c-font-label'] }]}>车速 &gt;5km/h 时 BPM 减半、亮度上限降至 50%，减少驾驶干扰</Text>
        </View>
        <Switch
          value={Boolean(status.drivingMode)}
          onValueChange={(value) => { void setDriving(value) }}
          disabled={busy}
          trackColor={{ false: theme['c-600'], true: theme['c-primary-alpha-600'] }}
          thumbColor={status.drivingMode ? theme['c-primary'] : theme['c-300']}
        />
      </View>
    </SubTitle>
  )
})

const OptionGroup = ({ title, options, value, disabled, onChange }: {
  title: string
  options: string[]
  value: number
  disabled: boolean
  onChange: (value: number) => void
}) => {
  const theme = useTheme()
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.chips}>
        {options.map((label, index) => {
          const active = value === index
          return (
            <TouchableOpacity
              key={label}
              disabled={disabled}
              onPress={() => { onChange(index) }}
              style={[
                styles.chip,
                { borderColor: active ? theme['c-primary'] : theme['c-600'] },
                active ? { backgroundColor: theme['c-primary-alpha-200'] } : null,
              ]}
            >
              <Text style={[styles.chipText, active ? { color: theme['c-primary'] } : { color: theme['c-font-label'] }]}>{label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = createStyle({
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 25,
  },
  textArea: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 15,
    marginBottom: 5,
  },
  desc: {
    fontSize: 12,
    lineHeight: 18,
  },
  group: {
    paddingRight: 25,
    paddingBottom: 12,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
})