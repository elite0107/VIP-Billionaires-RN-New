import React, { useState, useEffect } from 'react'
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import firestore from '@react-native-firebase/firestore'
import { connect } from 'react-redux'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { themes } from '../../constants/colors'
import StatusBar from '../../containers/StatusBar'
import { withTheme } from '../../theme'
import styles from './styles'
import { setUser as setUserAction } from '../../actions/login'
import images from '../../assets/images'
import ActivityIndicator from '../../containers/ActivityIndicator'
import MainScreen from '../../containers/MainScreen'
import firebaseSdk, {
  NOTIFICATION_TYPE_COMMENT,
  NOTIFICATION_TYPE_FOLLOW,
  NOTIFICATION_TYPE_LIKE,
} from '../../lib/firebaseSdk'
import { VectorIcon } from '../../containers/VectorIcon'
import NoActivity from './NoActivity'
import I18n from '../../i18n'
import { dateStringFromNowShort } from '../../utils/datetime'
import { navigateToProfile } from '../../utils/const'

const ActivityView = props => {
  const tabBarHeight = useBottomTabBarHeight()
  const { theme, navigation } = props
  const [data, setData] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Text style={[styles.headerText, { color: themes[theme].titleColor }]}>{I18n.t('Notifications')}</Text>
      ),
      title: null,
      headerRight: () => (<></>),
      headerStyle: {
        backgroundColor: themes[theme].backgroundColor,
        elevation: 0,
        shadowOpacity: 0,
      },
    })
  }, [theme])

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const { user } = props
    const querySnapShot = await firestore()
      .collection(firebaseSdk.TBL_ACTIVITY)
      .get()
    const userSnaps = await firestore().collection(firebaseSdk.TBL_USER).get()
    const users = []
    userSnaps.forEach(s => users.push(s.data()))

    let list = []
    querySnapShot.forEach(doc => {
      const activity = doc.data()
      if (
        activity.receiver === user.userId &&
        (!user.blocked || !user.blocked.includes(activity.sender))
      ) {
        const sender = users.find(u => u.userId === activity.sender)
        list.push({ id: doc.id, ...activity, sender })
      }
    })

    list.sort((a, b) => b.date - a.date)
    setData(list)
    setLoading(false)
    setRefreshing(false)
  }

  const onPressItem = item => {
    const { navigation, user } = props
    switch (item.type) {
      case NOTIFICATION_TYPE_COMMENT:
      case NOTIFICATION_TYPE_LIKE:
        return navigation.push('PostDetail', { post: { id: item.postId } })
      case NOTIFICATION_TYPE_FOLLOW:
        return navigateToProfile(navigation, user, item.sender)
    }
  }

  const renderItem = ({ item, index }) => {
    let message = ''
    switch (item.type) {
      case NOTIFICATION_TYPE_COMMENT:
        message = I18n.t('commented_in_your_post', { name: '' })
        break
      case NOTIFICATION_TYPE_LIKE:
        message = I18n.t('likes_your_post', { name: '' })
        break
      case NOTIFICATION_TYPE_FOLLOW:
        message = I18n.t('Just_Followed_You')
        break
    }

    return (
      <TouchableOpacity
        key={index}
        onPress={() => onPressItem(item)}
        style={[
          styles.itemContainer,
          index < data.length - 1 ? styles.border : null,
          { marginBottom: index === data.length - 1 ? tabBarHeight : undefined },
          { borderBottomColor: themes[theme].borderColor },
        ]}>
        <Image
          source={item.sender.avatar ? { uri: item.sender.avatar } : images.default_avatar}
          style={styles.itemImage}
        />
        <View style={styles.itemContent}>
          <Text style={[styles.itemText, { color: themes[theme].activeTintColor }]}>
            <Text style={[styles.itemTitle, { color: themes[theme].titleColor }]}>
              {item.sender.displayName}
            </Text>
            {`${message} `}
          </Text>

          {item.text && (
            <Text numberOfLines={2} style={[styles.captionText, { color: themes[theme].textColor }]}>
              {item.text}
            </Text>)
          }
          <Text style={[styles.captionText, { color: themes[theme].textColor, lineHeight: 21 }]}>
            {item?.date ? dateStringFromNowShort(item?.date) : null}
          </Text>
        </View>
        {item.postImage ? (
          <View style={styles.postImageContainer}>
            <Image source={{ uri: item.postImage }} style={styles.postImages} />
            {item.postType === 'video' ? (
              <VectorIcon
                name="playcircleo"
                type={'AntDesign'}
                size={12}
                color={'white'}
                style={styles.playIcon}
              />
            ) : null}
          </View>
        ) : null}
      </TouchableOpacity>
    )
  }

  const renderFooter = () => {
    const { theme } = props
    if (loading) {
      return <ActivityIndicator theme={theme} size={'large'} />
    }
    return null
  }

  const onRefresh = () => {
    setRefreshing(true)
    init()
  }

  return (
    <MainScreen navigation={navigation}>
      <StatusBar />
      <View style={[styles.container, { backgroundColor: themes[theme].backgroundColor }]}>
        {data.length > 0 ? (
          <FlatList
            data={data}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={themes[theme].activeTintColor}
              />
            }
          />
        ) : (
          <NoActivity onPress={() => {}} />
        )}
      </View>
    </MainScreen>
  )
}
const mapStateToProps = state => ({
  user: state.login.user,
})

const mapDispatchToProps = dispatch => ({
  setUser: params => dispatch(setUserAction(params)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(ActivityView))
