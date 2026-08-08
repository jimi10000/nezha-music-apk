import { memo } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { useI18n } from '@/lang'
import { useNavActiveId, useStatusbarHeight } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
import { createStyle, exitApp as backHome } from '@/utils/tools'
import { NAV_MENUS } from '@/config/constant'
import type { InitState } from '@/store/common/state'
// import { navigations } from '@/navigation'
// import commonState from '@/store/common/state'
import { exitApp, setNavActiveId } from '@/core/common'
import { useSettingValue } from '@/store/setting/hook'
import { prepareFloatWindow } from '@/core/car/carServices'
import { setActiveList } from '@/core/list'
import { RECENT_LIST_ID } from '@/utils/recentPlay'

const styles = createStyle({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    // padding: 10,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 50,
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
    paddingTop: 10,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    paddingTop: 13,
    paddingBottom: 13,
    paddingLeft: 25,
    paddingRight: 25,
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  iconContent: {
    width: 24,
    alignItems: 'center',
  },
  text: {
    paddingLeft: 20,
  },
  floatWindowBtn: {
    flexDirection: 'row',
    paddingTop: 13,
    paddingBottom: 13,
    paddingLeft: 25,
    paddingRight: 25,
    alignItems: 'center',
  },
})

const FloatWindowToggleBtn = () => {
  const theme = useTheme()

  const onPress = async() => {
    await prepareFloatWindow()
  }

  return (
    <TouchableOpacity
      style={styles.floatWindowBtn}
      activeOpacity={0.5}
      onPress={onPress}
    >
      <View style={styles.iconContent}>
        <Icon name="list" size={20} color={theme['c-font-label']} />
      </View>
      <Text style={styles.text}>{'悬浮窗'}</Text>
    </TouchableOpacity>
  )
}

const Header = () => {
  const theme = useTheme()
  const statusBarHeight = useStatusbarHeight()
  return (
    <View style={{ paddingTop: statusBarHeight, backgroundColor: theme['c-primary-light-700-alpha-500'] }}>
      <View style={styles.header}>
        <Icon name="logo" color={theme['c-primary-dark-100-alpha-300']} size={28} />
        <Text style={styles.headerText} size={28} color={theme['c-primary-dark-100-alpha-300']}>风火轮音乐</Text>
      </View>
    </View>
  )
}

type IdType = InitState['navActiveId'] | 'nav_exit' | 'back_home' | 'nav_recent'

const MenuItem = ({ id, icon, onPress }: {
  id: IdType
  icon: string
  onPress: (id: IdType) => void
}) => {
  const t = useI18n()
  const activeId = useNavActiveId()
  const theme = useTheme()

  const label = id === 'nav_recent' ? '最近播放' : undefined
  // 最近播放与 nav_love 同屏显示时，都算在 Mylist 页的激活态
  const active = id === 'nav_recent' ? activeId == 'nav_love' : activeId == id

  return active
    ? <View style={styles.menuItem}>
        <View style={styles.iconContent}>
          <Icon name={icon} size={20} color={theme['c-primary-font-active']} />
        </View>
        <Text style={styles.text} color={theme['c-primary-font']}>{label ?? t(id as Parameters<typeof t>[0])}</Text>
      </View>
    : <TouchableOpacity style={styles.menuItem} onPress={() => { onPress(id) }}>
        <View style={styles.iconContent}>
          <Icon name={icon} size={20} color={theme['c-font-label']} />
        </View>
        <Text style={styles.text}>{label ?? t(id as Parameters<typeof t>[0])}</Text>
      </TouchableOpacity>
}

export default memo(() => {
  const theme = useTheme()
  // console.log('render drawer nav')
  const showBackBtn = useSettingValue('common.showBackBtn')
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
    <View style={{ ...styles.container, backgroundColor: theme['c-content-background'] }}>
      <Header />
      <ScrollView style={styles.menus}>
        <View style={styles.list}>
          {NAV_MENUS.map(menu => <MenuItem key={menu.id} id={menu.id} icon={menu.icon} onPress={handlePress} />)}
          <MenuItem key="nav_recent" id="nav_recent" icon="music_time" onPress={handlePress} />
        </View>
      </ScrollView>
      <FloatWindowToggleBtn />
      {
        showBackBtn ? <MenuItem id="back_home" icon="home" onPress={handlePress} /> : null
      }
      {
        showExitBtn ? <MenuItem id="nav_exit" icon="exit2" onPress={handlePress} /> : null
      }
    </View>
  )
})
