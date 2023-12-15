import React from "react";
import './../../common.css'
import './style.css'
import ZIMKiti18n from '../../../../../plugin/i18n';
import ZIMKitConversationListVM from "../../../../ZIMKitConversation/VM/ZIMKitConversationListVM";
import { rightClickDialogOperation, dialogOperation, groupInfoOperation, expressionBoxOperation } from '../../../ToolUtil/eventBus'
import ZIMKitChatListVM from "../../../../ZIMKitChat/VM/ZIMKitChatListVM";
import { Mode } from '../../../../ZIMKitChat/Constant';
import ZIMKitEventHandler from '../../../VM/ZIMKitEventHandler';
import { EventName } from '../../../Constant/event';
const i18n = ZIMKiti18n.getInstance().getI18next() as any;

class RightClickDialog extends React.Component<any, any> {
    constructor (props: any) {
        super(props);
        this.deleteConversation = this.deleteConversation.bind(this);
        this.downLoad = this.downLoad.bind(this);
        this.deleteMsg = this.deleteMsg.bind(this);
        this.multiSelect = this.multiSelect.bind(this);
    }
    componentDidMount() {
        groupInfoOperation('close'); 
        expressionBoxOperation('close');
    }
    deleteConversation() {
        ZIMKitConversationListVM.getInstance().deleteConversation(this.props.rightClickData.conversationItem.conversationID, this.props.rightClickData.conversationItem.type);
    }
    downLoad() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', this.props.rightClickData.messageItem.mMessage.fileDownloadUrl, true);
        xhr.responseType = 'blob';
        xhr.onload = () => {
          if (xhr.status === 200) {
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(xhr.response);
            a.download = this.props.rightClickData.messageItem.mMessage.fileName; //文件名
            a.click();
          }
        };
        xhr.send();
        rightClickDialogOperation(false);
    }
    deleteMsg() {
        const message = JSON.parse(JSON.stringify(this.props.rightClickData.messageItem.mMessage));
        dialogOperation(true, {
            desc: i18n.t('message_delete_confirmation_desc'),
            confirmText: i18n.t('conversation_delete'),
            cancelText: i18n.t('conversation_cancel'),
            hasCloseBtn: false,
            confirmFunc: () => {
                ZIMKitChatListVM.getInstance().currentChat.deleteMessages(message);
            }
        });
        rightClickDialogOperation(false);
    }
    multiSelect() {
        ZIMKitChatListVM.getInstance().mode = Mode['multiSelect'];
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitModeChanged, Mode['multiSelect'], this.props.rightClickData.messageItem);
        rightClickDialogOperation(false);
    }
    render() {
        if (this.props.rightClickData) {
            const conversation = this.props.rightClickData.conversationItem;
            const message = this.props.rightClickData.messageItem;
            return (
                <div className="right-click-box" style={{ top: `${this.props.rightClickData.y}px`, left: `${this.props.rightClickData.x}px` }}>
                    { conversation ? <div className="item" onClick={ this.deleteConversation }>{ i18n.t("conversation_close_chat_w") }</div> : null }
                    { message ? 
                        <div>
                            { message.mMessage.fileDownloadUrl && (message.mMessage.type === 11 || message.mMessage.type === 12 || message.mMessage.type === 14) ? <div className="item" onClick={ this.downLoad }>{ i18n.t('album_download_image_w') }</div> : null}
                            <div className="item" onClick={ this.deleteMsg }>{ i18n.t('conversation_delete')}</div>
                            <div className="item" onClick={ this.multiSelect }>{ i18n.t('message_multi_select')}</div>
                        </div>
                        : null }
                </div>
           )
        }
    }
}

export default RightClickDialog;