import React, { useEffect, useState } from 'react'
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Linking,
  SafeAreaView,
  Pressable,
} from 'react-native';
import {connect} from 'react-redux';
import {openComposer} from 'react-native-email-link';

import { COLOR_YELLOW, themes } from '../../constants/colors'
import StatusBar from '../../containers/StatusBar'
import { withTheme } from '../../theme'
import styles from './styles'
import images from '../../assets/images'
import SidebarItem from './SidebarItem'
import scrollPersistTaps from '../../utils/scrollPersistTaps'
import { logout as logoutAction } from '../../actions/login'
import { showConfirmationAlert } from '../../lib/info'
import { GradientHeader } from '../../containers/GradientHeader'
import I18n from '../../i18n'
import { SITE_SHOP_URL } from '../../constants/app'
import { VectorIcon } from '../../containers/VectorIcon'
import OptionCardBtn from '../../containers/OptionCardBtn'
import InviteView from '../InviteView'

const SidebarView = props => {
  const {user, theme, navigation} = props;
  const menus = [
    // {
    //   id: 'shop',
    //   name: I18n.t('Shop'),
    //   icon: 'shopping',
    //   route: 'Shop',
    //   routes: ['Shop'],
    // },
    {
      id: 'vip_members',
      name: I18n.t('Vip_members'),
      icon: 'star-circle',
      route: 'VipMembers',
      routes: ['VipMembers'],
    },
    // {
    //   id: 'connections',
    //   name: 'My connections',
    //   icon: 'account-multiple',
    //   route: 'VipMembers',
    //   routes: ['MyConnections'],
    // },
    {
      id: 'privacy_and_settings',
      name: I18n.t('Privacy_and_settings'),
      icon: 'shield-lock',
      route: 'Privacy',
      routes: ['Privacy'],
    },
    {
      id: 'help_and_support',
      name: I18n.t('Help_and_support'),
      icon: 'comment-question',
      route: 'Privacy',
      routes: ['HelpAndSupport'],
    },
  ]
  const [inviteView, setInviteView] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: 'VIP Billionaires',
      headerBackground: () => <GradientHeader />,
    });
  }, []);

  const onClick = item => {
    switch (item.id) {
      // case 'terms_of_use':
      //   return onNavigate('About', { type: 0 })
      case 'privacy_and_settings':
        console.log('priv settings');
        return onNavigate('MenuStack', {screen: 'PrivacyAndSettings'});
      // case 'eula':
      //   return onNavigate('About', { type: 2 })
      case 'shop':
        return Linking.openURL(SITE_SHOP_URL);
      case 'help_and_support':
        console.log('fired');
        // return onNavigate('MenuStack', {screen: 'HelpAndSupport'});
        return openComposer({
          to: 'vip-support@miraigroupjapan.com',
          subject: `Help and Support Email user: ${user.id}`,
          body: `Hello, I am ${user.displayName}, user id: ${user.id}. I am having issues with... your message`,
        });
      case 'connections':
        console.log('My connect');
        // return onNavigate('MyConnections');
        return onNavigate('MenuStack', {screen: 'VipMembers'});
      case 'vip_members':
        return onNavigate('MenuStack', {screen: 'VipMembers'});
      default:
        onNavigate(item.route, {type: item.init});
    }
  };

  const onNavigate = (routeName, params) => {
    const {navigation} = props;
    navigation.navigate(routeName, params);
  };

  const onLogOut = () => {
    const {logout} = props;
    showConfirmationAlert({
      title: I18n.t('Logout'),
      message: I18n.t('are_you_sure_to_log_out'),
      callToAction: I18n.t('Confirm'),
      onPress: () => {
        if (global.unSubscribeRoom) {
          global.unSubscribeRoom();
          global.unSubscribeRoom = undefined;
        }
        logout();
      },
    });
  };

  return (
    <View style={{flex:1}}>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: themes[theme].backgroundColor,
          paddingHorizontal: 16,
        }}>
        <StatusBar />
        <View style={styles.headerContainer}>
          <View style={styles.profileInnerContainer}>
            <Image
              source={user.avatar ? { uri: user.avatar } : images.default_avatar}
              style={styles.avatar}
            />
            <View style={{ marginLeft: 12 }}>
              <Text
                style={[
                  styles.profileName,
                  { color: themes[theme].titleColor },
                ]}>
                {user.displayName}
              </Text>
              <Pressable onPress={() => onNavigate('Profile')}>
                <Text style={[styles.roleName, {color: COLOR_YELLOW}]}>
                  {I18n.t('View_Profile')}
                </Text>
              </Pressable>
            </View>
          </View>
          <Pressable onPress={() => navigation.closeDrawer()} style={styles.closeIconAndText}>
            <VectorIcon
              type="AntDesign"
              name="close"
              size={11}
              color={themes[theme].textColor}
              style={styles.closeIcon}
            />
            <Text style={[{ color: themes[theme].textColor }]}>{I18n.t('Clear')}</Text>
          </Pressable>
        </View>
        <ScrollView
          style={{
            flexGrow: 1,
            backgroundColor: themes[theme].backgroundColor,
            paddingHorizontal: 16,
          }}
          {...scrollPersistTaps}>
          <OptionCardBtn
            subTextColor={{ color: COLOR_YELLOW }}
            image={images.reward_badge}
            title={I18n.t('Premium_Membership')}
            smallText={I18n.t('Upgrade_plan')}
            onPressEvent={() => {
              return onNavigate('MenuStack', {screen: 'PremiumSubscription'});
            }}
          />
          <OptionCardBtn
            image={images.fast_email_sending}
            title={I18n.t('Invite_to_engage_more_people')}
            smallTitle
            smallText={I18n.t('Invite_now')}
            rightIcon
            rightIconName="share"
            onPressEvent={() => {
              setInviteView(true);
            }}
          />
          <Text style={[styles.menuText, { color: themes[theme].titleColor }]}>Menu</Text>
          {menus.map(m => (
            <SidebarItem
              key={m.id}
              id={`sidebar-view-key-${m.id}`}
              text={m.name}
              left={
                <VectorIcon
                  name={m.icon}
                  type={'MaterialCommunityIcons'}
                  size={20}
                  style={{ color: themes[theme].textColor }}
                />
              }
              hasRight
              containerStyle={styles.menu}
              onPress={() => onClick(m)}
              theme={theme}
            />
          ))}
        </ScrollView>
        <TouchableOpacity
          onPress={onLogOut}
          style={[styles.logoutBtn, { backgroundColor: themes[theme].messageOwnBackground }]}>
          <VectorIcon
            name={'logout-variant'}
            type={'MaterialCommunityIcons'}
            size={24}
            style={{ color: themes[theme].textColor }}
          />
          <Text
            style={[styles.logoutText, { color: themes[theme].activeTintColor }]}>
            {I18n.t('Logout').toUpperCase()}
          </Text>
        </TouchableOpacity>
        <View style={styles.bottomView}>
          <View style={styles.privacyTermsEulaContainer}>
            <View style={{display: 'flex', flexWrap: 'wrap'}}>
              <Text style={[styles.text, { color: themes[theme].textColor }]} onPress={() => {onNavigate('About', { type: 1 })}}>{I18n.t('Privacy_Policy')}</Text>
              <Text style={[styles.text, { color: themes[theme].textColor }]} onPress={() => {onNavigate('About', { type: 0 })}}>
                {I18n.t('Terms_of_services')}
              </Text>
              <Text style={[styles.text, { color: themes[theme].textColor }]} onPress={() => {onNavigate('About', { type: 2 })}}>{I18n.t('Eula')}</Text>
            </View>
          </View>
          <View style={styles.languageContainer}>
            <Image source={images.en_language} />
            <Text style={[styles.languageText, { color: themes[theme].textColor }]}>English (US)</Text>
          </View>
        </View>
      </SafeAreaView>

      <InviteView
        isOpen={inviteView}
        onClose={()=>setInviteView(false)}
      />
    </View>
  )
}

const mapStateToProps = state => ({
  user: state.login.user,
});

const mapDispatchToProps = dispatch => ({
  logout: params => dispatch(logoutAction(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(SidebarView))