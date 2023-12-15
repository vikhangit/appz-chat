import React from 'react';
import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import ZIMKitConversationListVM from '../VM/ZIMKitConversationListVM';
import ZIMKitGroupListVM from '../../ZIMKitGroup/VM/ZIMKitGroupListVM';
import CreateChatDialog from '../../ZIMKitCommon/UI/components/CreateChatDialog';
import './style.css';
import ZIMKitEventHandler from '../../ZIMKitCommon/VM/ZIMKitEventHandler';
import { EventName } from '../../ZIMKitCommon/Constant/event';
import { dateFormat } from '../../ZIMKitCommon/ToolUtil/dateFormat';
import { ZIMError, ZIMGroupCreatedResult } from '../../ZIMAdapter/index.entity';
import {
  dialogOperation,
  toastOperation,
  rightClickDialogOperation
} from '../../ZIMKitCommon/ToolUtil/eventBus';
import ZIMKiti18n from '../../../plugin/i18n';
import ZIMKitConversationVM from '../VM/ZIMKitConversationVM';
const i18n = ZIMKiti18n.getInstance().getI18next() as any;

class ConversationItem extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.switchConversation = this.switchConversation.bind(this);
    this.operationConversation = this.operationConversation.bind(this);
  }
  switchConversation() {
    const { conversation } = this.props;
    if (ZIMKitConversationListVM.getInstance().activeConversationID ===  conversation.conversationID) {
      return;
    }
    ZIMKitConversationListVM.getInstance().activeConversationID = conversation.conversationID;
    if (conversation.unreadMessageCount) {
      conversation.clearConversationUnreadMessageCount();
    }
    ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, conversation);
  }
  operationConversation(event: any) {
    event.preventDefault();
    const data = {
      x: event.pageX,
      y: event.pageY,
      conversationItem: this.props.conversation
    }
    rightClickDialogOperation(true, data);
    const conversationBox = document.querySelector('.conversation-content') as HTMLDivElement;
    conversationBox.style.overflowY = 'hidden';
  }
  nameFormat(item: ZIMKitConversationVM) {
    return (item.conversationName || item.conversationID)
      .slice(0, 1)
      .toLowerCase();
  }
  render() {
    let unreadCountView: any = null;
    const conversation = this.props.conversation;
    const activeConversationID = this.props.activeConversationID;
    if (conversation.unreadMessageCount) {
      unreadCountView = (
        <div className="unread-count">
          {conversation.unreadMessageCount > 99
            ? '99+'
            : conversation.unreadMessageCount}
        </div>
      );
    }
    return (
      <div
        className={
          'conversation-item' +
          (activeConversationID &&
          conversation.conversationID === activeConversationID
            ? ' actived'
            : '')
        }
        onClick={this.switchConversation}
        onContextMenu={this.operationConversation}>
        <div className="head-portrait">
          {conversation.type === 0 ? (<img src={conversation.conversationAvatarUrl ? conversation.conversationAvatarUrl : require('../../ZIMKitCommon/UI/resources/avatar-default.png')}/>) : 
          <div className="group"></div>}
          {unreadCountView}
        </div>
        <div className="conversation-info">
          <div className="info-top">
            <div className="item-name">
              {conversation.conversationName || conversation.conversationID}
            </div>
            {conversation.lastMessage ? (
              <div className="item-date">
                {dateFormat(conversation.lastMessage.timestamp, false)}
              </div>
            ) : null}
          </div>
          {conversation.lastMessage ? (
            <div className="item-message">
              {conversation.lastMessage.sentStatus === 2 ? (
                <div className="err-icon"></div>
              ) : null}
              <div className="message-text">
                {conversation.lastMessage.type === 1 ? conversation.lastMessage.message : '' }
                {conversation.lastMessage.type === 11 ? i18n.t('common_message_photo') : ''}
                {conversation.lastMessage.type === 12 ? i18n.t('common_message_file')  : ''}
                {conversation.lastMessage.type === 13 ? i18n.t('common_message_audio') : ''}
                {conversation.lastMessage.type === 14 ? i18n.t('common_message_video') : ''}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

class ConversationList extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      isAbnormal: false,
      totalUnreadMessageCount: 0,
      conversationList: new Map(),
      showCreateChatDialog: false,
      conversationItem: null, // Right click conversation
      activeConversationID: null,
    };
    this.logout = this.logout.bind(this);
    this.listScroll = this.listScroll.bind(this);
    this.triggerDialog = this.triggerDialog.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.handleCreatePeerChat = this.handleCreatePeerChat.bind(this);
    this.handleCreateGroupChat = this.handleCreateGroupChat.bind(this);
    this.handleJoinGroup = this.handleJoinGroup.bind(this);
  }
  componentDidMount() {
    if (ZIMKitManager.getInstance().isLoggedIn) {
      ZIMKitConversationListVM.getInstance().loadConversationList();
    }
    ZIMKitConversationListVM.getInstance().registerLoginStateChangedCallback(async (state: number) => {
      state && ZIMKitConversationListVM.getInstance().loadConversationList();
    });
    ZIMKitConversationListVM.getInstance().registerCvTotalUnreadMessageCountUpdatedCallback(
      data => {
        this.setState({
          totalUnreadMessageCount: data.totalUnreadMessageCount
        });
      }
    );
    ZIMKitConversationListVM.getInstance().registerConversationListUpdatedCallback(
      conversationList => {
        this.setState({ conversationList });
      }
    );
    ZIMKitConversationListVM.getInstance().registerCurrentCvChangedCallback(
      currentConversation => {
        this.setState({ activeConversationID: currentConversation.conversationID });
      }
    );
    ZIMKitConversationListVM.getInstance().registerAbnormalCallback(isAbnormal => {
      this.setState({ isAbnormal });
    });
  }
  componentWillUnmount(): void {
    ZIMKitConversationListVM.getInstance().unInit();
  }
  listScroll() {
    const msgElement = document.querySelector(
      '.conversation-content'
    ) as HTMLDivElement;
    const scrollTop = Math.round(msgElement.scrollTop);
    const scrollHeight = msgElement.scrollHeight;
    const clientHeight = msgElement.clientHeight;
    if (scrollTop >= scrollHeight - clientHeight) {
      ZIMKitConversationListVM.getInstance().loadNextPage();
    }
    if (scrollTop == 0) {
      // todo reload
    }
  }
  triggerDialog(show: boolean) {
    this.setState({ showCreateChatDialog: show });
  }
  handleCloseDialog() {
    this.triggerDialog(false);
  }
  handleCreatePeerChat(toUserID: string) {
    console.log("ToUserID: ", toUserID);
     const conversationItem = this.state.conversationList.get(toUserID);
    if (conversationItem) {
      ZIMKitConversationListVM.getInstance().activeConversationID = conversationItem.conversationID;
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, conversationItem);
      console.log("conversationItem: ", conversationItem)
    } else {
      const conversation = {
        conversationID: toUserID,
        conversationName: '',
        type: 0,
      } as ZIMKitConversationVM;
      ZIMKitConversationListVM.getInstance().activeConversationID = toUserID;
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, conversation);
      console.log("conversation", conversation)
    }
    this.triggerDialog(false);
  }
  handleCreateGroupChat(groupName: string, userIDList: string) {
    const userIDListArr = userIDList.split(';').filter(userID => userID);
    ZIMKitGroupListVM.getInstance()
      .createGroup('', groupName, userIDListArr)
      .then((data: ZIMGroupCreatedResult) => {
        const { groupInfo, errorUserList } = data;
        const { baseInfo } = groupInfo;
        if (errorUserList.length) {
          const errorUserIDList = errorUserList
            .map(item => item.userID)
            .join(' ');
          dialogOperation(true, {
            desc: `${i18n
              .t('message_user_not_exit_please_again')
              .replace('%s', errorUserIDList)}`,
            confirmText: i18n.t('common_return'),
            hasCloseBtn: false
          });
          return;
        } else {
          this.triggerDialog(false);
          const conversation = {
            conversationID: baseInfo.groupID,
            conversationName: baseInfo.groupName,
            type: 2,
          } as ZIMKitConversationVM;
          ZIMKitConversationListVM.getInstance().activeConversationID = conversation.conversationID;
          ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, conversation);
        }
      })
      .catch(() => {
        this.triggerDialog(false);
      });
  }
  handleJoinGroup(groupID: string) {
    ZIMKitGroupListVM.getInstance()
      .joinGroup(groupID)
      .then(data => {
        const { groupInfo } = data;
        const { baseInfo } = groupInfo;
        this.triggerDialog(false);
        const conversation = {
          conversationID: data.groupInfo.baseInfo.groupID,
          conversationName: data.groupInfo.baseInfo.groupName,
          type: 2,
        } as ZIMKitConversationVM;
        ZIMKitConversationListVM.getInstance().activeConversationID = conversation.conversationID;
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, conversation);
      })
      .catch((error: ZIMError) => {
        switch (error.code) {
          case 6000523:
            dialogOperation(true, {
              desc: `${i18n
                .t('group_group_id_not_exit')
                .replace('%s', groupID)}`,
              confirmText: i18n.t('common_return'),
              hasCloseBtn: false
            });
            break;
          case 6000522:
            {
              toastOperation(true, {
                text: `${i18n.t('group_repeat_join_group_chat')}`,
                type: 'default',
              });
            }
            break;
          default:
            toastOperation(true, {
              text: error.message,
              type: 'default'
            });
            break;
        }
      });
  }
  logout() {
    ZIMKitManager.getInstance().disconnectUser();
  }
  render() {
    let totalView: any = null,
      createChatDialogView: any = null;
    let conversationListView = null;
    if (this.state.totalUnreadMessageCount) {
      totalView = (
        <div className="total">
          {this.state.totalUnreadMessageCount > 99
            ? '99+'
            : this.state.totalUnreadMessageCount}
        </div>
      );
    }
    if (this.state.showCreateChatDialog) {
      createChatDialogView = (
        <CreateChatDialog
          onCloseDialog={this.handleCloseDialog}
          onCreatePeerChat={this.handleCreatePeerChat}
          onCreateGroupChat={this.handleCreateGroupChat}
          onJoinGroup={this.handleJoinGroup}
        />
      );
    }
    if (this.state.conversationList.size) {
      const list = Array.from(this.state.conversationList.values());
      conversationListView = list.map(
        (element, index) => (
          <ConversationItem
            key={(element as ZIMKitConversationVM).conversationID + index}
            conversation={element}
            activeConversationID={this.state.activeConversationID}
          />
        )
      );
    }
    return (
      <div className="conversation">
        <div className="left-banner">
          <div className="top">
            <div className="item">
              <div className="icon message-icon"></div>
              <div className="text">
                {i18n.t('conversation_message_total_count')}
              </div>
              {totalView}
            </div>
            <div className="item" onClick={this.triggerDialog.bind(this, true)}>
              <div className="icon create-chat-icon"></div>
              <div className="text create-chat-text">
                {i18n.t('conversation_start_chat_w')}
              </div>
            </div>
          </div>
          <div className="item" onClick={this.logout}>
            <div className="icon exit-icon"></div>
            <div className="text exit-text">{i18n.t('common_logout')}</div>
          </div>
        </div>
        {!this.state.isAbnormal ? (
          this.state.conversationList.size ? (
            <div className="conversation-content" onScroll={this.listScroll}>
              {conversationListView}
            </div>
          ) : (
            <div className="default-content">
              <div className="text">{i18n.t('conversation_empty')}</div>
            </div>
          )
        ) : (
          <div className="abnormal-content">
            <div
              className="btn reload-btn"
              onClick={ZIMKitConversationListVM.getInstance().loadConversationList.bind(
                ZIMKitConversationListVM.getInstance()
              )}>
              {i18n.t('conversation_reload')}
            </div>
          </div>
        )}
        {createChatDialogView}
      </div>
    );
  }
}

export default ConversationList;
