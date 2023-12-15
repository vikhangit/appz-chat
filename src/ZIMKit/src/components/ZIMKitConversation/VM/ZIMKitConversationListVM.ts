import ZIMKitManager from "../../ZIMKitCommon/VM/ZIMKitManager";
import ZIMKitEventHandler from "../../ZIMKitCommon/VM/ZIMKitEventHandler";
import ZIMKitConversationVM from './ZIMKitConversationVM';
import ZIMKitGroupListVM from '../../ZIMKitGroup/VM/ZIMKitGroupListVM';
import { EventName } from "../../ZIMKitCommon/Constant/event";
import {
  ZIMConversationDeletedResult,
  ZIMConversationListQueriedResult,
  ZIMConversationType,
  ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult,
  ZIMConversation,
  ZIMEventOfConversationChangedResult,
  ZIMError,
} from "../../ZIMAdapter/index.entity";

export default class ZIMKitConversationListVM {
  static instance: ZIMKitConversationListVM;
  private pagePullCount = 100;
  private loadStatus = 0;
  private conversationList: Map<string, ZIMKitConversationVM> = new Map();
  private totalUnreadMessageCount = 0;
  private isAbnormal = false;
  public activeConversationID = "";
  constructor() {
    if (!ZIMKitConversationListVM.instance) {
      ZIMKitConversationListVM.instance = this;
      ZIMKitConversationListVM.instance.initListenerHandle();
    }
    return ZIMKitConversationListVM.instance;
  }
  static getInstance(): ZIMKitConversationListVM {
    if (!ZIMKitConversationListVM.instance) {
      ZIMKitConversationListVM.instance = new ZIMKitConversationListVM();
    }
    return ZIMKitConversationListVM.instance;
  }
  // register Kit listener
  initListenerHandle() {
    ZIMKitEventHandler.getInstance().addEventListener(
      EventName.zimConversationTotalUnreadMessageCountUpdated,
      [
        (data: ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult) => {
          this.totalUnreadMessageCount = data.totalUnreadMessageCount;
        },
      ]
    );
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimConversationChanged, [
      (data: ZIMEventOfConversationChangedResult) => {
        console.log('kitlog conversation changed callback', data);
        if (this.loadStatus !== 2) {
          return;
        }
        // Here the queryHistoryMessage triggers an infinite loop call
        let updateListFlag = false;
        let updateCurrentConversationFlag = false;
        let changeCurrentConversationFlag = false;
        data.infoList.forEach((info) => {
          switch (info.event) {
            case 1:
              if (this.conversationList.size) {
                let isExist = false;
                if (
                  this.conversationList.get(info.conversation.conversationID)
                ) {
                  isExist = true;
                  this.conversationList.set(info.conversation.conversationID, new ZIMKitConversationVM(info.conversation));
                  if (
                    this.activeConversationID === info.conversation.conversationID
                  ) {
                    updateCurrentConversationFlag = true;
                  }
                  updateListFlag = true;
                }
                if (!isExist) {
                  this.conversationList.set(info.conversation.conversationID, new ZIMKitConversationVM(info.conversation));
                  updateListFlag = true;
                  if (!this.activeConversationID) {
                    this.activeConversationID = info.conversation.conversationID;
                    changeCurrentConversationFlag = true;
                  }
                }
              } else {
                this.conversationList.set(info.conversation.conversationID, new ZIMKitConversationVM(info.conversation));
                this.activeConversationID = info.conversation.conversationID;
                updateListFlag = true;
                changeCurrentConversationFlag = true;
              }
              break;
            case 0:
              this.conversationList.set(info.conversation.conversationID, new ZIMKitConversationVM(info.conversation));
              updateListFlag = true;
              if (!this.activeConversationID) {
                this.activeConversationID = info.conversation.conversationID;
                changeCurrentConversationFlag = true;
              }
              if (info.conversation.type === 2) {
                ZIMKitGroupListVM.getInstance().queryGroupList();
              }
              break;
            case 2:
              this.conversationList.set(info.conversation.conversationID, new ZIMKitConversationVM(info.conversation));
              if (this.activeConversationID === info.conversation.conversationID) {
                updateCurrentConversationFlag = true;
              }
              updateListFlag = true;
              break;
            default:
              break;
          }
        });
        if (updateListFlag) {
          this.sortConversationList();
          ZIMKitEventHandler.getInstance().actionListener(
            EventName.zimKitConversationListUpdate,
            this.conversationList
          );
        }
        const currentConversation = this.conversationList.get(this.activeConversationID) as ZIMKitConversationVM;
        if (updateCurrentConversationFlag) {
          ZIMKitEventHandler.getInstance().actionListener(
            EventName.zimKitCurrentConversationUpdate,
            currentConversation
          );
          currentConversation.unreadMessageCount && currentConversation.clearConversationUnreadMessageCount();
        }
        if (changeCurrentConversationFlag) {
          ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, currentConversation);
          currentConversation.unreadMessageCount && currentConversation.clearConversationUnreadMessageCount();
        }
      },
    ]);
  }
  loadConversationList() {
    if (this.loadStatus === 1) {
      return Promise.reject();
    }
    this.loadStatus = 1;
    const config = {
      nextConversation: undefined,
      count: localStorage.count || this.pagePullCount,
    };
    return ZIMKitManager.getInstance()
      .zim?.queryConversationList(config)
      .then((data: ZIMConversationListQueriedResult) => {
        console.log('kitlog queryConversationList data', data);
        this.loadStatus = 2;
        this.isAbnormal = false;
        this.conversationList = new Map();
        if (data.conversationList.length) {
          data.conversationList.forEach((item: ZIMConversation) => {
            if (item.type === 0 || item.type === 2) {
              this.conversationList.set(item.conversationID , new ZIMKitConversationVM(item));
            }
          });
          this.sortConversationList();
          if (!this.activeConversationID) {
            this.activeConversationID = Array.from(this.conversationList)[0][0];
          }
          if ((this.conversationList.get(this.activeConversationID) as ZIMKitConversationVM).unreadMessageCount) {
            const conversation = this.conversationList.get(this.activeConversationID) as ZIMKitConversationVM;
            conversation.clearConversationUnreadMessageCount();
          }
   
          ZIMKitEventHandler.getInstance().actionListener(
            EventName.zimKitCurrentConversationChanged,
            this.conversationList.get(this.activeConversationID)
          );
        }
        ZIMKitEventHandler.getInstance().actionListener(
          EventName.zimKitConversationListUpdate,
          this.conversationList
        );
        ZIMKitEventHandler.getInstance().actionListener(
          EventName.zimKitConversationListQueryAbnormally,
          false
        );
      })
      .catch((err: ZIMError) => {
        console.log('kitlog queryConversationList err', err);
        this.loadStatus = 2;
        this.isAbnormal = true;
        ZIMKitEventHandler.getInstance().actionListener(
          EventName.zimKitConversationListQueryAbnormally,
          true
        );
      });
  }
  loadNextPage() {
    const config = {
      nextConversation: Array.from(this.conversationList)[this.conversationList.size - 1][1],
      count: this.pagePullCount,
    };
    return ZIMKitManager.getInstance()
      .zim?.queryConversationList(config)
      .then((data: ZIMConversationListQueriedResult) => {
        console.log('kitlog loadNextPage data', data);
        if (data.conversationList.length) {
          data.conversationList.forEach((item: ZIMConversation) => {
            if (item.type === 0 || item.type === 2) {
              this.conversationList.set(item.conversationID, new ZIMKitConversationVM(item));
            }
          });
          this.sortConversationList();
          ZIMKitEventHandler.getInstance().actionListener(
            EventName.zimKitConversationListUpdate,
            this.conversationList
          );
        }
      });
  }
  deleteConversation(conversationID: string, conversationType: number) {
    const config = { isAlsoDeleteServerConversation: true };
    return ZIMKitManager.getInstance()
      .zim?.deleteConversation(conversationID, conversationType, config)
      .then((data: ZIMConversationDeletedResult) => {
        this.conversationList.delete(data.conversationID);
        if (this.conversationList.size) {
          if (data.conversationID === this.activeConversationID) {
            this.activeConversationID = Array.from(this.conversationList)[0][0];
            const conversation = this.conversationList.get(this.activeConversationID) as ZIMKitConversationVM;
            conversation.unreadMessageCount && conversation.clearConversationUnreadMessageCount();
            ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, this.conversationList.get(Array.from(this.conversationList)[0][0]));
          }
        } else {
          this.activeConversationID = '';
        }
        ZIMKitEventHandler.getInstance().actionListener(
          EventName.zimKitConversationListUpdate,
          this.conversationList
        );
        ZIMKitEventHandler.getInstance().actionListener(
          EventName.zimKitDeleteConversation,
          conversationID
        );
        return data;
      });
  }
  private sortConversationList() {
    const sortedArr = Array.from(this.conversationList.values()).sort((a, b) => b.orderKey - a.orderKey);
    this.conversationList = new Map(sortedArr.map((value) => [value.conversationID, value]));
  }
  registerLoginStateChangedCallback(callback: (state: number) => void) {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitLoginStateChanged, [callback]);
  }
  registerCvTotalUnreadMessageCountUpdatedCallback(
    callback: (
      data: ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult
    ) => void
  ) {
    ZIMKitEventHandler.getInstance().addEventListener(
      EventName.zimConversationTotalUnreadMessageCountUpdated,
      [callback]
    );
  }
  registerConversationListUpdatedCallback(
    callback: (conversationList: Map<string, ZIMKitConversationVM>) => void
  ) {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitConversationListUpdate, [
      callback,
    ]);
  }
  registerAbnormalCallback(callback: (isAbnormal: boolean) => void) {
    ZIMKitEventHandler.getInstance().addEventListener(
      EventName.zimKitConversationListQueryAbnormally,
      [callback]
    );
  }
  registerCurrentCvChangedCallback(
    callback: (conversation: ZIMKitConversationVM) => void
  ) {
    ZIMKitEventHandler.getInstance().addEventListener(
      EventName.zimKitCurrentConversationChanged,
      [callback]
    );
  }
  unInit() {
    this.conversationList = new Map();
    this.totalUnreadMessageCount = 0;
    this.isAbnormal = false;
    this.activeConversationID = "";
    this.loadStatus = 0;
  }
}
