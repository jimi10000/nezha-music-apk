import playerActions from '@/store/player/action'
import playerState from '@/store/player/state'
import { updateRhythmLightPlayback } from '@/utils/nativeModules/rhythmLight'


export const setIsPlay = (val: boolean) => {
  if (playerState.isPlay == val) return
  playerActions.setIsPlay(val)
  // 播放状态变化时同步驱动车机氛围灯节拍
  updateRhythmLightPlayback(val, 0.5, 'neutral')
}


export const setStatusText = (val: string) => {
  if (playerState.statusText == val) return
  playerActions.setStatusText(val)
}
