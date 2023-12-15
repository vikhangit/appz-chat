import React from "react";
import { groupInfoOperation, toastOperation } from "../../ZIMKitCommon/ToolUtil/eventBus";
import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import ZIMKitConversationVM from '../../ZIMKitConversation/VM/ZIMKitConversationVM';
import ZIMKitGroupListVM from "../VM/ZIMKitGroupListVM";
import ZIMKitGroupVM from '../VM/ZIMKitGroupVM';
import ZIMKitEventHandler from '../../ZIMKitCommon/VM/ZIMKitEventHandler';
import { EventName } from '../../ZIMKitCommon/Constant/event';
import "./style.css";
import ZIMKiti18n from '../../../plugin/i18n';
import '../../ZIMKitCommon/UI/common.css';
const i18n = ZIMKiti18n.getInstance().getI18next() as any;

class GroupInfoView extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            currentGroup: null,
            groupListVM: ZIMKitGroupListVM.getInstance(),
        };
        this.copy = this.copy.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(event: MouseEvent) {
        const path = (event as any).path || (event.composedPath && event.composedPath());
        if (!(event.target as HTMLElement).className.includes("more-icon")) {
            const group = document.querySelector('.group-container');
            let flag = false;
            path.forEach((item: HTMLElement) => {
                if (item === group) {
                    flag = true;
                }
            })
            if (group && !flag) {
                groupInfoOperation();
            }
        } else {
            groupInfoOperation();
        };
    }
    componentDidMount(): void {
        ZIMKitGroupListVM.getInstance().registerLoginStateChangedCallback(async (state: number) => {
            state && ZIMKitGroupListVM.getInstance().queryGroupList();
        });
        if (ZIMKitManager.getInstance().isLoggedIn) {
            ZIMKitGroupListVM.getInstance().queryGroupList();
        }
        window.addEventListener("click", this.handleClick);
        ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitCurrentConversationChanged, [
            async (conversation: ZIMKitConversationVM) => {
                if (conversation.type === 2) {
                    const group = this.state.groupListVM.groupList.get(conversation.conversationID) as ZIMKitGroupVM;
                    if (group) {
                        this.setState({ currentGroup: group });
                    } else {
                        ZIMKitGroupListVM.getInstance().queryGroupList().then(()=>{
                            this.setState({ currentGroup: this.state.groupListVM.groupList.get(conversation.conversationID) as ZIMKitGroupVM });
                        })
                    }
                }
            },
          ]);
    }
    componentWillUnmount(): void {
        window.removeEventListener("click", this.handleClick)
        ZIMKitGroupListVM.getInstance().unInit();
    }
    copy() {
        const currentGroup = this.state.currentGroup;
        navigator.clipboard && currentGroup && navigator.clipboard.writeText(currentGroup.baseInfo.groupID).then(() => {
            toastOperation(true, {
                text: i18n.t("group_copy_success"),
                type: "default",
            });
        });
    }
    render() {
        const currentGroup = this.state.currentGroup;
        let groupInfoView = null;
        if (this.props.showGroupInfo) {
            // @ts-ignore
            groupInfoView = <div className="group-container">
                <div className="form-box">
                    <div className="id">
                        <div className="label">{ i18n.t("group_group_id") }</div>
                        <div className="value">{ currentGroup ? currentGroup.baseInfo.groupID : "" }</div>
                    </div>
                    <div className="btn copy-btn" onClick={ this.copy }>{ i18n.t("group_copy") }</div>
                </div>
            </div>
        }
        return groupInfoView;
    }
}

export default GroupInfoView;