import React, { FormEvent } from 'react';
import './../../common.css';
import './style.css';
import ZIMKiti18n from '../../../../../plugin/i18n';
const i18n = ZIMKiti18n.getInstance().getI18next() as any;

interface TabData {
  id: number;
  text: string;
  actived?: boolean;
}

class TabItem extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.changeNav = this.changeNav.bind(this);
  }
  changeNav() {
    this.props.onNavChange(this.props.item);
  }
  render() {
    return (
      <div
        className={'title' + (this.props.item.actived ? ' actived' : '')}
        onClick={this.changeNav}>
        {this.props.item.text}
      </div>
    );
  }
}

class TabList extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      tabList: (this.props.tabList as TabData[]).map((element, index) => {
        return { ...element, actived: !index ? true : false };
      })
    };
    this.handleNavChange = this.handleNavChange.bind(this);
  }
  handleNavChange(current: TabData) {
    (this.state.tabList as TabData[]).forEach(item => {
      item.actived = item.id === current.id;
    });
    this.setState({
      tabList: this.state.tabList
    });
    this.props.onNavChange(current);
  }
  render() {
    let tabListView = null;
    if (this.state.tabList) {
      tabListView = (this.state.tabList as TabData[]).map(element => (
        <TabItem
          key={element.id}
          item={element}
          onNavChange={this.handleNavChange}
        />
      ));
    }
    return <div className="top">{tabListView}</div>;
  }
}

class TableContent extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      peerErrTip: false,
      peerDisabled: true,
      groupErrTip: false,
      groupDisabled: true,
      groupID: '',
      toUserID: '',
      groupName: '',
      userIDList: ''
    };
    this.closeDialog = this.closeDialog.bind(this);
    this.createPeerChat = this.createPeerChat.bind(this);
    this.createGroupChat = this.createGroupChat.bind(this);
    this.joinGroup = this.joinGroup.bind(this);
    this.handleUserIDInputChange = this.handleUserIDInputChange.bind(this);
    this.handleGroupUserIDInputChange = this.handleGroupUserIDInputChange.bind(
      this
    );
    this.handleGroupIDInputChange = this.handleGroupIDInputChange.bind(this);
    this.handleGroupNameInputChange = this.handleGroupNameInputChange.bind(
      this
    );
  }
  closeDialog() {
    this.props.onCloseDialog();
  }
  createPeerChat() {
    this.props.onCreatePeerChat(this.state.toUserID);
  }
  createGroupChat() {
    this.props.onCreateGroupChat(this.state.groupName, this.state.userIDList);
  }
  joinGroup() {
    this.props.onJoinGroup(this.state.groupID);
  }
  handleUserIDInputChange(event: FormEvent) {
    const toUserID = (event.target as HTMLInputElement).value;
    if (toUserID.length) {
      const result = toUserID.length < 6 || toUserID.length > 12;
      this.setState({
        toUserID,
        peerErrTip: result,
        peerDisabled: result
      });
    } else {
      this.setState({
        toUserID,
        peerErrTip: false,
        peerDisabled: true
      });
    }
  }
  handleGroupUserIDInputChange(event: FormEvent) {
    const userIDList = (event.target as HTMLInputElement).value;
    let groupDisabled = true,
      groupErrTip = true;
    if (this.state.groupName.length && userIDList.length) {
      groupDisabled = false;
    }
    if (userIDList) {
      const arr = userIDList.split(';');
      let flag = false;
      arr.forEach(item => {
        if (item.length < 6 || item.length > 12) {
          flag = true;
          groupDisabled = true;
        }
      });
      groupErrTip = flag;
    } else {
      groupErrTip = false;
    }
    this.setState({
      userIDList,
      groupErrTip,
      groupDisabled
    });
  }
  handleGroupIDInputChange(event: FormEvent) {
    this.setState({
      groupID: (event.target as HTMLInputElement).value
    });
  }
  handleGroupNameInputChange(event: FormEvent) {
    const groupName = (event.target as HTMLInputElement).value
    this.setState({
      groupName,
      groupDisabled: !(groupName.length && this.state.userIDList.length)
    });
  }
  render() {
    let tableContentView = null;
    let errTipView = null;
    const {
      groupID,
      peerDisabled,
      groupDisabled,
      peerErrTip,
      groupErrTip,
      toUserID,
      userIDList
    } = this.state;
    const { currentActived } = this.props;
    if ((peerErrTip && toUserID) || (groupErrTip && userIDList)) {
      // @ts-ignore
      errTipView = (
        <div className="err-tip">{i18n.t('demo_input_user_id_error_tips')}</div>
      );
    }
    if (currentActived === 1) {
      // @ts-ignore
      tableContentView = (
        <div className="peer" key="peer">
          <div className="input-box">
            <input
              className={i18n.language === 'en' ? 'en-input' : ''}
              type="text"
              name="userID"
              placeholder={i18n.t('conversation_enter_touserid_w')}
              onInput={this.handleUserIDInputChange}
            />
            {errTipView}
          </div>
          <div className="btn-box">
            <button className="btn cancel-btn" onClick={this.closeDialog}>
              {i18n.t('conversation_cancel')}
            </button>
            <button
              className="btn create-peer-btn"
              onClick={this.createPeerChat}
              disabled={peerDisabled}>
              {i18n.t('conversation_start_single_chat')}
            </button>
          </div>
        </div>
      );
    } else if (currentActived === 2) {
      // @ts-ignore
      tableContentView = (
        <div className="group" key="group">
          <div className="input-box">
            <input
              className={i18n.language === 'en' ? 'en-input' : ''}
              type="text"
              name="groupName"
              placeholder={i18n.t('group_input_group_name')}
              onInput={this.handleGroupNameInputChange}
              maxLength={12}
            />
            <input
              className={i18n.language === 'en' ? 'en-input' : ''}
              type="text"
              name="userIDList"
              placeholder={i18n.t('group_input_user_id_of_group')}
              onInput={this.handleGroupUserIDInputChange}
            />
            {errTipView}
          </div>
          <div className="btn-box">
            <button className="btn cancel-btn" onClick={this.closeDialog}>
              {i18n.t('conversation_cancel')}
            </button>
            <button
              className="btn create-peer-btn"
              onClick={this.createGroupChat}
              disabled={groupDisabled}>
              {i18n.t('conversation_start_group_chat')}
            </button>
          </div>
        </div>
      );
    } else if (currentActived === 3) {
      // @ts-ignore
      tableContentView = (
        <div className="attend" key="attend">
          <div className="input-box">
            <input
              className={i18n.language === 'en' ? 'en-input' : ''}
              type="text"
              name="groupID"
              placeholder={i18n.t('group_input_group_id_w')}
              onInput={this.handleGroupIDInputChange}
            />
          </div>
          <div className="btn-box">
            <button className="btn cancel-btn" onClick={this.closeDialog}>
              {i18n.t('conversation_cancel')}
            </button>
            <button
              className="btn create-peer-btn"
              onClick={this.joinGroup}
              disabled={!groupID}>
              {i18n.t('conversation_join_group_chat')}
            </button>
          </div>
        </div>
      );
    }
    return <div className="content">{tableContentView}</div>;
  }
}

class CreateChatDialog extends React.Component<any, any> {
  tabList = [
    {
      id: 1,
      text: i18n.t('conversation_start_single_chat')
    },
    {
      id: 2,
      text: i18n.t('conversation_start_group_chat')
    },
    {
      id: 3,
      text: i18n.t('conversation_join_group_chat')
    }
  ];
  constructor(props: any) {
    super(props);
    this.state = {
      currentActived: 1
    };
    this.handleNavChange = this.handleNavChange.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.handleJoinGroup = this.handleJoinGroup.bind(this);
    this.handleCreatePeerChat = this.handleCreatePeerChat.bind(this);
    this.handleCreateGroupChat = this.handleCreateGroupChat.bind(this);
  }
  handleNavChange(current: TabData) {
    this.setState({
      currentActived: current.id
    });
  }
  handleCloseDialog() {
    this.props.onCloseDialog();
  }
  handleJoinGroup(groupID: string) {
    this.props.onJoinGroup(groupID);
  }
  handleCreatePeerChat(toUserID: string) {
    this.props.onCreatePeerChat(toUserID);
  }
  handleCreateGroupChat(groupName: string, userIDList: string) {
    this.props.onCreateGroupChat(groupName, userIDList);
  }
  render() {
    return (
      <div className="dialog">
        <TabList tabList={this.tabList} onNavChange={this.handleNavChange} />
        <TableContent
          currentActived={this.state.currentActived}
          onCloseDialog={this.handleCloseDialog}
          onJoinGroup={this.handleJoinGroup}
          onCreatePeerChat={this.handleCreatePeerChat}
          onCreateGroupChat={this.handleCreateGroupChat}
        />
      </div>
    );
  }
}

export default CreateChatDialog;
