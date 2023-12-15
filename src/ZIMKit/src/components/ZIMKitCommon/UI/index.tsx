import React from "react";
import ConversationList from "../../ZIMKitConversation/UI";
import MessageView from "../../ZIMKitChat/UI";
import GroupInfoView from "../../ZIMKitGroup/UI";
import Toast from "../../ZIMKitCommon/UI/components/Toast";
import BaseDialog from "../../ZIMKitCommon/UI/components/BaseDialog";
import RightClickDialog from '../../ZIMKitCommon/UI/components/RightClickDialog';
import eventBus, { EmitName } from "../../ZIMKitCommon/ToolUtil/eventBus";
import './style.css';
import ZIMKitManager from '../VM/ZIMKitManager';
import { toastOperation } from '../../ZIMKitCommon/ToolUtil/eventBus';
import ZIMKitEventHandler from '../VM/ZIMKitEventHandler';
import { EventName } from '../Constant/event';
import ZIMKiti18n from '../../../plugin/i18n';

const i18n = ZIMKiti18n.getInstance().getI18next() as any;
class Common extends React.Component<any, any> {
    num = 0;
    lastClickTime= 0;
    constructor(props: any) {
        super(props);
        this.state = {
            showGroupInfo: false,
            showToast: false,
            showBaseDialog: false,
            showRightClickDialog: false,
            toastData: {
                text: "",
                type: "default"
            },
            dialogData: {
                title: "",
                desc: "",
                cancelText: "",
                confirmText: "",
                hasCloseBtn: false
            },
            rightClickDialogData: {},
            connectionState: 2,
            connectionStateObj: {
              0: `(${i18n.t('conversation_disconnected')})`,
              1: `(${i18n.t('conversation_connecting')})`,
              3: `(${i18n.t('conversation_connecting')})`,
            },
        };
        this.handleGroupInfoOperation = this.handleGroupInfoOperation.bind(this);
        this.handleToastOperation = this.handleToastOperation.bind(this);
        this.handleDialogOperation = this.handleDialogOperation.bind(this);
        this.handleRightClickDialogOperation = this.handleRightClickDialogOperation.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.uploadLog = this.uploadLog.bind(this);
    }
    handleGroupInfoOperation(type: string) {
      this.setState({ 
          showGroupInfo: type ? false : !this.state.showGroupInfo
      });
    }
    handleToastOperation(showToast: boolean, toastData: any) {
        this.setState({ showToast, toastData });
    }
    handleDialogOperation(showBaseDialog: boolean, dialogData: any) {
        this.setState({ showBaseDialog, dialogData });
    }
    handleRightClickDialogOperation(showRightClickDialog: boolean, rightClickDialogData: any) {
      console.log('===handleRightClickDialogOperation', this.state.showRightClickDialog);
        this.setState({ showRightClickDialog, rightClickDialogData })
    }
    handleClick(event: MouseEvent) {
      const path = (event as any).path || (event.composedPath && event.composedPath());
      console.log('==path', path, event, (event as any).target.parent)
      if ((event as any).target.parentNode && (event as any).target.parentNode.parentNode) {
        if (!(event as any).target.parentNode.className.includes('right-click-box') && !(event as any).target.parentNode.parentNode.className.includes('right-click-box')) {
          const box = document.querySelector('.right-click-box');
          console.log('===box', box)
          let flag = false;
          path.forEach((item: HTMLElement) => {
            if (item === box) {
              flag = true;
            }
          });
          if (box && !flag) {
            this.setState({ showRightClickDialog: !this.state.showRightClickDialog });
            if (!this.state.showRightClickMenu) {
              const msgBox = document.querySelector('.message-content') as HTMLDivElement;
              msgBox.style.overflowY = 'scroll';
              const conversationBox = document.querySelector('.conversation-content') as HTMLDivElement;
              conversationBox.style.overflowY = 'auto';
            }
          }
        } else {
            this.setState({ showRightClickDialog: !this.state.showRightClickDialog });
            if (!this.state.showRightClickMenu) {
              const msgBox = document.querySelector('.message-content') as HTMLDivElement;
              msgBox.style.overflowY = 'scroll';
              const conversationBox = document.querySelector('.conversation-content') as HTMLDivElement;
              conversationBox.style.overflowY = 'auto';
            }
        }
      }
    }
    uploadLog() {
        const clickTime = new Date().getTime();
        if (!this.lastClickTime || clickTime - this.lastClickTime < 500) {
          this.num++;
        } else {
          this.num = 0;
        }
        this.lastClickTime = clickTime;
        if (this.num === 4) {
          this.num = 0;
          ZIMKitManager.getInstance()
            .uploadLog()
            .then((data: any) => {
              toastOperation(true, {
                text: '上传日志成功',
                type: 'default',
              });
            })
            .catch((err) => {
              toastOperation(true, {
                text: `上传日志失败：${err}`,
                type: 'default',
              });
            });
        }
      }
      
    componentDidMount(): void {
        window.addEventListener("click", this.handleClick);
        eventBus.on(EmitName.GroupInfoOperation, this.handleGroupInfoOperation);
        eventBus.on(EmitName.ToastOperation, this.handleToastOperation);
        eventBus.on(EmitName.DialogOperation, this.handleDialogOperation);
        eventBus.on(EmitName.RightClickDialogOperation, this.handleRightClickDialogOperation);
        ZIMKitEventHandler.getInstance().addEventListener(EventName.zimConnectionStateChanged, [
          (data) => {
            this.setState({
              connectionState: data.state
            })
          },
        ]);
    }
    componentWillUnmount(): void {
        window.removeEventListener("click", this.handleClick);
        eventBus.off(EmitName.GroupInfoOperation, this.handleGroupInfoOperation);
        eventBus.off(EmitName.ToastOperation, this.handleToastOperation);
        eventBus.off(EmitName.DialogOperation, this.handleDialogOperation);
        eventBus.off(EmitName.RightClickDialogOperation, this.handleRightClickDialogOperation)
    }
    render() {
        const { showGroupInfo, showToast, showBaseDialog, showRightClickDialog, toastData, dialogData, rightClickDialogData, connectionStateObj, connectionState } = this.state;
        return (<div id="zegoim">
            <div className="zego-im-container">
                <div className="top-banner">
                    <div className="logo" onClick={this.uploadLog}>
                        { navigator.language.includes('en') ? '' : 'ZEGO' } In-app Chat { connectionStateObj[connectionState] }
                    </div>
                </div>
                <div className="box">
                    <ConversationList></ConversationList>
                    <MessageView></MessageView>
                    <div className="group-wrap">
                      <GroupInfoView showGroupInfo={ showGroupInfo }></GroupInfoView>
                    </div>
                </div>
                <Toast showToast={ showToast } toastData={ toastData }></Toast>
                <BaseDialog showBaseDialog={ showBaseDialog } dialogData={ dialogData }></BaseDialog>
                {showRightClickDialog ? <RightClickDialog rightClickData={ rightClickDialogData }></RightClickDialog> : null}
            </div>
        </div>)
    }
}

export default Common;
