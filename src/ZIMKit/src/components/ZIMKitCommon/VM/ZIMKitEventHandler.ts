import { EventName } from "../Constant/event";
import {
  ZIMErrorCallback,
  ZIMConnectionStateChanged,
  ZIMTokenWillExpire,
  ZIMReceivePeerMessage,
  ZIMReceiveGroupMessage,
  ZIMConversationTotalUnreadMessageCountUpdated,
  ZIMConversationChanged,
  ZIMGroupFullInfo,
  ZIMUserInfo,
  ZIMGroupMemberStateChanged
} from '../../ZIMAdapter/index.entity';
import { ZIMKitTextMessageModel, ZIMKitImgMessageModel, ZIMKitAudioMessageModel, ZIMKitVideoMessageModel, ZIMKitFileMessageModel } from '../../ZIMKitChat/Model';
import ZIMKitConversationVM from "../../ZIMKitConversation/VM/ZIMKitConversationVM";
import ZIMKitChatVM from "../../ZIMKitChat/VM/ZIMKitChatVM";

export interface ZIMKitEventHandlerInterface {
  [EventName.zimError]: ZIMErrorCallback[];
  [EventName.zimConnectionStateChanged]: ZIMConnectionStateChanged[];
  [EventName.zimTokenWillExpire]: ZIMTokenWillExpire[];
  [EventName.zimReceivePeerMessage]: ZIMReceivePeerMessage[];
  [EventName.zimReceiveGroupMessage]: ZIMReceiveGroupMessage[];
  [EventName.zimConversationTotalUnreadMessageCountUpdated]: ZIMConversationTotalUnreadMessageCountUpdated[];
  [EventName.zimConversationChanged]: ZIMConversationChanged[];
  [EventName.zimGroupMemberStateChanged]: ZIMGroupMemberStateChanged[];
  [EventName.zimKitLoginStateChanged]: ((state: number) => void)[];
  [EventName.zimKitLoginUserUpdate]: ((userInfo: ZIMUserInfo) => void)[];
  [EventName.zimKitDeleteConversation]: ((conversationID: string) => void)[];
  [EventName.zimKitCurrentConversationChanged]: ((conversation: ZIMKitConversationVM) => void)[];
  [EventName.zimKitCurrentConversationUpdate]: ((
    conversation: ZIMKitConversationVM
  ) => void)[];
  [EventName.zimKitConversationListUpdate]: ((
    conversationList: Map<string, ZIMKitConversationVM>
  ) => void)[];
  [EventName.zimKitConversationListQueryAbnormally]: ((
    isAbnormal: boolean
  ) => void)[];
  [EventName.zimKitCurrentChatChanged]: ((
    chat: ZIMKitChatVM
  ) => void)[];
  [EventName.zimKitCurrentChatUpdated]: ((
    chat: ZIMKitChatVM
  ) => void)[];
  [EventName.zimKitCurrentGroupInfoUpdated]: ((
    groupInfo: ZIMGroupFullInfo
  ) => void)[];
  [EventName.zimKitImgMessageUpdated]: ((
    message: ZIMKitImgMessageModel
  ) => void)[];
  [EventName.zimKitNetworkChanged]: ((networkStatus: number) => void)[];
  [EventName.zimKitModeChanged]: ((mode: number, message: ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel) => void)[];
}

export default class ZIMKitEventHandler {
  static instance: ZIMKitEventHandler;
  eventList: ZIMKitEventHandlerInterface = {
    [EventName.zimError]: [],
    [EventName.zimConnectionStateChanged]: [],
    [EventName.zimTokenWillExpire]: [],
    [EventName.zimReceivePeerMessage]: [],
    [EventName.zimReceiveGroupMessage]: [],
    [EventName.zimConversationTotalUnreadMessageCountUpdated]: [],
    [EventName.zimConversationChanged]: [],
    [EventName.zimGroupMemberStateChanged]: [],
    [EventName.zimKitLoginStateChanged]: [],
    [EventName.zimKitLoginUserUpdate]: [],
    [EventName.zimKitDeleteConversation]: [],
    [EventName.zimKitConversationListUpdate]: [],
    [EventName.zimKitCurrentConversationChanged]: [],
    [EventName.zimKitCurrentConversationUpdate]: [],
    [EventName.zimKitConversationListQueryAbnormally]: [],
    [EventName.zimKitCurrentChatChanged]: [],
    [EventName.zimKitCurrentChatUpdated]: [],
    [EventName.zimKitCurrentGroupInfoUpdated]: [],
    [EventName.zimKitImgMessageUpdated]: [],
    [EventName.zimKitNetworkChanged]: [],
    [EventName.zimKitModeChanged]: [],
  };
  constructor() {
    if (!ZIMKitEventHandler.instance) {
      ZIMKitEventHandler.instance = this;
    }
    return ZIMKitEventHandler.instance;
  }
  static getInstance() {
    if (!ZIMKitEventHandler.instance) {
      ZIMKitEventHandler.instance = new ZIMKitEventHandler();
    }
    return ZIMKitEventHandler.instance;
  }
  addEventListener<K extends keyof ZIMKitEventHandlerInterface>(
    event: K,
    callBackList: ZIMKitEventHandlerInterface[K]
  ) {
    if (!this.eventList[event]) {
      return false;
    }
    if (!Array.isArray(callBackList)) {
      return false;
    }
    callBackList.forEach((callBack) => {
      // @ts-ignore
      !this.eventList[event].includes(callBack) &&
        // @ts-ignore
        this.eventList[event].push(callBack);
    });
    return true;
  }
  removeEventListener<K extends keyof ZIMKitEventHandlerInterface>(
    event: K,
    callBackList: ZIMKitEventHandlerInterface[K]
  ) {
    if (!this.eventList[event]) {
      return false;
    }
    const li = this.eventList[event];
    if (callBackList && callBackList.length) {
      callBackList.forEach((callBack) => {
        // @ts-ignore
        li.splice(li.indexOf(callBack), 1);
      });
    } else {
      this.eventList[event] = [];
    }
    return true;
  }
  actionListener<K extends keyof ZIMKitEventHandlerInterface>(
    event: K,
    ...args: Array<any>
  ) {
    this.eventList[event] &&
      this.eventList[event].forEach((func) => {
        // @ts-ignore
        func(...args);
      });
  }
}
