import { memo } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { useNavActiveId, useStatusbarHeight } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import { createStyle, exitApp as backHome } from '@/utils/tools'
import { NAV_MENUS } from '@/config/constant'
import type { InitState } from '@/store/common/state'
// import commonState from '@/store/common/state'
import { exitApp, setNavActiveId } from '@/core/common'
import { BorderWidths } from '@/theme'
import { useSettingValue } from '@/store/setting/hook'
import { setActiveList } from '@/core/list'
import { RECENT_LIST_ID } from '@/utils/recentPlay'

const NAV_WIDTH = 68

const styles = createStyle({
  container: {
    flexGrow: 0,
    // flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    // padding: 10,
    borderRightWidth: BorderWidths.normal,
    paddingBottom: 10,
    width: NAV_WIDTH,
  },
  header: {
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    textAlign: 'center',
    marginLeft: 16,
  },
  menus: {
    flex: 1,
  },
  list: {
    // paddingTop: 10,
    paddingBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    paddingTop: 15,
    paddingBottom: 15,
    // paddingLeft: 25,
    // paddingRight: 25,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  iconContent: {
    // width: 24,
    // backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
  },
  text: {
    paddingLeft: 15,
  },
})

const Header = () => {
  const theme = useTheme()
  const statusBarHeight = useStatusbarHeight()
  return (
    <View style={{ paddingTop: statusBarHeight }}>
      <View style={styles.header}>
        <Icon name="logo" color={theme['c-primary-dark-100-alpha-300']} size={22} />
      </View>
    </View>
  )
}

type IdType = InitState['navActiveId'] | 'nav_exit' | 'back_home' | 'nav_recent'

const MenuItem = ({ id, icon, onPress, isRecentActive }: {
  id: IdType
  icon: string
  onPress: (id: IdType) => void
  isRecentActive?: boolean
}) => {
  // const t = useI18n()
  const activeId = useNavActiveId()
  const theme = useTheme()

  const active = isRecentActive ? (activeId == 'nav_love') : (activeId == id)

  return active
    ? <View style={styles.menuItem}>
        <View style={styles.iconContent}>
          <Icon name={icon} size={20} color={theme['c-primary-font-active']} />
        </View>
        {/* <Text style={styles.text} size={14} color={theme['c-primary-font']}>{t(id)}</Text> */}
      </View>
    : <TouchableOpacity style={styles.menuItem} onPress={() => { onPress(id) }}>
        <View style={styles.iconContent}>
          <Icon name={icon} size={20} color={theme['c-font-label']} />
        </View>
        {/* <Text style={styles.text} size={14}>{t(id)}</Text> */}
      </TouchableOpacity>
}

export default memo(() => {
  const theme = useTheme()
  // console.log('render drawer nav')
  const showExitBtn = useSettingValue('common.showExitBtn')

  const handlePress = (id: IdType) => {
    switch (id) {
      case 'nav_exit':
        exitApp('Exit Btn')
        return
      case 'back_home':
        backHome()
        return
      case 'nav_recent':
        // 最近播放：先切到我的列表页，再激活最近播放虚拟列表
        global.app_event.changeMenuVisible(false)
        setNavActiveId('nav_love')
        requestAnimationFrame(() => {
          setActiveList(RECENT_LIST_ID)
        })
        return
    }

    global.app_event.changeMenuVisible(false)
    setNavActiveId(id)
  }

  return (
    <View style={{ ...styles.container, borderRightColor: theme['c-border-background'] }}>
      <Header />
      <ScrollView style={styles.menus}>
        <View style={styles.list}>
          {NAV_MENUS.map(menu => <MenuItem key={menu.id} id={menu.id} icon={menu.icon} onPress={handlePress} />)}
          {/* 最近播放快捷入口，放 nav_love 之后，参考网易云/QQ音乐 */}
          <MenuItem key="nav_recent" id="nav_recent" icon="music_time" onPress={handlePress} />
        </View>
      </ScrollView>
      {/* 返回桌面：常驻左侧栏底部（车载版规范，不受开关控制） */}
      <MenuItem id="back_home" icon="home" onPress={handlePress} />
      {
        showExitBtn ? <MenuItem id="nav_exit" icon="exit2" onPress={handlePress} /> : null
      }
    </View>
  )
})

