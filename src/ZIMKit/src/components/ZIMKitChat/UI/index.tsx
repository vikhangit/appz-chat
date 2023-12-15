import React, { FormEvent } from "react";
import ZIMKitChatListVM from '../VM/ZIMKitChatListVM';
import { dateFormat } from "../../ZIMKitCommon/ToolUtil/dateFormat";
import { ZIMKitTextMessageModel, ZIMKitImgMessageModel, ZIMKitAudioMessageModel, ZIMKitVideoMessageModel, ZIMKitFileMessageModel } from "../Model";
import { ZIMMediaMessage } from "../../ZIMAdapter/index.entity";
import "../../ZIMKitCommon/UI/common.css"
import "./style.css"
import { toastOperation, rightClickDialogOperation, dialogOperation } from "../../ZIMKitCommon/ToolUtil/eventBus";
import ZIMKiti18n from '../../../plugin/i18n';
import ZIMKitManager from "../../ZIMKitCommon/VM/ZIMKitManager";
import ExpressionBox from "./components/ExpressionBox";
import LargeImgBox from './components/LargeImgBox';
import ZIMLazyLoadImg from "../VM/ZIMLazyLoadImg";
// import heic2any from 'heic2any';
import { fileSizeFormat } from '../ToolUtil/fileSizeFormat';
import { Mode } from '../Constant';
import ZIMKitChatVM from "../VM/ZIMKitChatVM";
import eventBus, { EmitName } from "../../ZIMKitCommon/ToolUtil/eventBus";
const i18n = ZIMKiti18n.getInstance().getI18next() as any;

class MessageView extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            currentChat: null,
            currentMessageList: [],
            message: "",
            oldScrollHeight: 0,
            newScrollHeight: 0,
            userInfo: {},
            showExpressionBox: false,
            showLargeImgBox: false,
            largeImg: {},
            audioItem: {},
            isScrolled: false,
            isMultiSelectMode: Mode['normal'],
            selectedItem: {}
        }
        this.listScroll = this.listScroll.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.dateFormat = this.dateFormat.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.triggerExpressionUI = this.triggerExpressionUI.bind(this);
        this.handleAddExpression = this.handleAddExpression.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleVideoFileChange = this.handleVideoFileChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleCloseLargeImgBox = this.handleCloseLargeImgBox.bind(this);
        this.showLargeImg = this.showLargeImg.bind(this);
        this.operation = this.operation.bind(this);
        this.playAudio = this.playAudio.bind(this);
        this.getAudioWidth = this.getAudioWidth.bind(this);
        this.selectMessage = this.selectMessage.bind(this);
        this.closeMultiSelectMode = this.closeMultiSelectMode.bind(this);
        this.handleExpressionBoxOperation = this.handleExpressionBoxOperation.bind(this);
    }
    componentDidMount() {
        window.addEventListener("click", this.handleClick);
        ZIMKitChatListVM.getInstance().registerLoginUserUpdatedCallback(userInfo => {
            this.setState({ userInfo });
        })
        ZIMKitChatListVM.getInstance().registerCurrentChatChangedCallback(this.currentChatChangedCallback());
        ZIMKitChatListVM.getInstance().registerCurrentChatUpdatedCallback(this.currentChatUpdatedCallback());
        ZIMKitChatListVM.getInstance().registerModeChangedCallback(this.modeChangedCallback());
        ZIMLazyLoadImg.getInstance().registerImgMessageUpdatedCallback((message: ZIMKitImgMessageModel) => {
            this.state.currentMessageList.forEach((item: ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel) => {
              if ((item.mMessage.type === 11 || item.mMessage.type === 14) && (item.mMessage.messageID === message.mMessage.messageID)) {
                item = message;
                const img = document.querySelector(`.img${message.mMessage.messageID}`) as HTMLImageElement;
                if (img) {
                    message.loadStatus === 2 && ((img.parentElement as HTMLElement).style.zIndex = '2');
                    message.loadStatus === 3 && ((img.parentElement as HTMLElement).style.zIndex = '-1');
                }
              }
            });
            this.setState({
                currentMessageList: this.state.currentMessageList
            })
        });
        eventBus.on(EmitName.ExpressionBoxOperation, this.handleExpressionBoxOperation);
    }
    componentWillUnmount(): void {
        window.removeEventListener("click", this.handleClick);
        ZIMKitChatListVM.getInstance().unInit();
        ZIMKitChatListVM.getInstance().removeCurrentChatChangedCallback(this.currentChatChangedCallback())
        ZIMKitChatListVM.getInstance().removeCurrentChatUpdatedCallback(this.currentChatUpdatedCallback());
        ZIMKitChatListVM.getInstance().removeModeChangedCallback(this.modeChangedCallback());
        eventBus.off(EmitName.ExpressionBoxOperation, this.handleExpressionBoxOperation);
    }
    currentChatChangedCallback() {
        return (currentChat: ZIMKitChatVM) => {
            console.log('kitlog current chat changed', this.state.currentChat, currentChat, this.state.isScrolled);
            this.setState({ currentChat, isScrolled: false, message: "", currentMessageList: ZIMKitManager.getInstance().networkStatus ? [] : currentChat.currentMessageList }, () => {
                const textarea = document.querySelector('.text-area') as HTMLTextAreaElement;
                textarea && (textarea.focus());
                this.scrollToBottom();
            });
        }
    }
    currentChatUpdatedCallback() {
        return (currentChat: ZIMKitChatVM) => {
            console.log('kitlog current chat update', this.state.currentChat, currentChat, this.state.isScrolled);
            if (this.state.currentChat && this.state.currentChat.chatID !== currentChat.chatID) {
                return;
            }
            const msgContent = document.querySelector('.message-content');
            if (msgContent) {
                if (!this.state.currentMessageList.length) {
                    ZIMLazyLoadImg.getInstance().init('.message-content', '.msg-img');
                    ZIMLazyLoadImg.getInstance().initMessageListHandle(currentChat.currentMessageList);
                    this.setState({ currentMessageList: currentChat.currentMessageList }, () => {
                        ZIMLazyLoadImg.getInstance().setScrollListenSwitchHandle(false);
                        !this.state.isScrolled && this.scrollToBottom();
                        ZIMLazyLoadImg.getInstance().loadLatestImgHandle();
                        requestAnimationFrame(() => {
                            ZIMLazyLoadImg.getInstance().setScrollListenSwitchHandle(true);
                        });
                    });
                } else {
                    this.setState({ currentMessageList: currentChat.currentMessageList }, () => {
                        ZIMLazyLoadImg.getInstance().updateMessageHandle(currentChat.currentMessageList)
                        ZIMLazyLoadImg.getInstance().setScrollListenSwitchHandle(false);
                        !this.state.isScrolled && this.scrollToBottom();
                        ZIMLazyLoadImg.getInstance().loadImgByMessageHandle(currentChat.currentMessageList);
                        requestAnimationFrame(() => {
                            ZIMLazyLoadImg.getInstance().setScrollListenSwitchHandle(true);
                        });
                    });
                }
            }
        }
    }
    modeChangedCallback() {
        return (mode: number, message: ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel) => {
            this.setState({
                isMultiSelectMode: mode,
            })
            message && this.selectMessage(message);
        };
    }
    handleExpressionBoxOperation(type: string) {
        this.setState({ 
            showExpressionBox: type ? false : !this.state.showExpressionBox
        });
    }
    handleClick(event: MouseEvent) {
        const box = document.querySelector('.expression-box');
        const path = (event as any).path || (event.composedPath && event.composedPath());
        if ((event.target as HTMLElement).className !== 'expression') {
            let flag = false;
            try {
                path.forEach((item: HTMLElement) => {
                    if (item.className && item.className.includes("expression-box")) {
                        flag = true;
                        throw new Error("break");
                    }
                })
            } catch (error) { }
            if (box && !flag) {
                this.triggerExpressionUI();
            }
        } else {
            this.triggerExpressionUI();
        }
       
    }
    triggerExpressionUI() {
        this.setState({
            showExpressionBox: !this.state.showExpressionBox
        }, () => {
            if (this.state.showExpressionBox) {
                const textarea = document.querySelector('.text-area') as HTMLTextAreaElement;
                textarea && (textarea.focus());
            }
        })
    }
    scrollToBottom() {
        const msgElement = document.querySelector(".message-content") as HTMLDivElement;
        if (msgElement) {
            const scrollTop = Number(msgElement.scrollHeight) - Number(msgElement.clientHeight);
            msgElement.scrollTo({ top: scrollTop, behavior: "auto" });
        }
    }
    listScroll() {
        const msgElement = document.querySelector(".message-content") as HTMLDivElement;
        if (msgElement) {
            const scrollTop = Math.round(msgElement.scrollTop);
            const scrollHeight = msgElement.scrollHeight;
            const { currentChat } = this.state;
            if (scrollTop == 0) {
                this.state.currentChat.queryHistoryMessage(currentChat.chatID, currentChat.chatType).then(() => {
                    this.setState({
                        oldScrollHeight: scrollHeight,
                    }, () => {
                        this.setState({
                            newScrollHeight: msgElement.scrollHeight,
                        }, () => {
                            msgElement.scrollTop = this.state.newScrollHeight - this.state.oldScrollHeight;
                        });
                    });
                })
            }
            if (scrollTop < scrollHeight - msgElement.clientHeight) {
                this.setState({
                    isScrolled: true
                })
            } else {
                this.setState({
                    isScrolled: false
                })
            }
        }
    }
    sendMessage() {
        if (this.state.currentChat.chatType === 2) {
            this.state.currentChat.sendGroupMessage(this.state.message);
        } else {
            this.state.currentChat?.sendPeerMessage(this.state.message);
        }
        this.setState({ message: "", isScrolled: false });
    }
    dateFormat(currentMessage: ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel, currentIndex: number) {
        if (!currentMessage.mMessage.timestamp) {
            return
        }
        if (currentIndex === 0) {
            return dateFormat(currentMessage.mMessage.timestamp as number, true);
        } else {
            const previousMessage = this.state.currentMessageList[currentIndex - 1];
            if (previousMessage && (currentMessage.mMessage.timestamp as number) - previousMessage.mMessage.timestamp > 300000) {
                return dateFormat(currentMessage.mMessage.timestamp as number, true);
            }
        }
    }
    handleInputChange(event: FormEvent) {
        this.setState({
            message: (event.target as HTMLTextAreaElement).value
        });
    }
    clickUploadImageFile() {
        const uploadDom = document.getElementById('uploadImageFile') as HTMLInputElement;
        uploadDom.value = '';
        if (uploadDom) {
          uploadDom.click();
        }
    }
    clickUploadVideoFile() {
        const uploadDom = document.getElementById('uploadVideoFile') as HTMLInputElement;
        uploadDom.value = '';
        if (uploadDom) {
          uploadDom.click();
        }
    }
    clickUploadFile() {
        const uploadDom = document.getElementById('uploadFile') as HTMLInputElement;
        uploadDom.value = '';
        if (uploadDom) {
          uploadDom.click();
        }
    }
    async handleImageChange(event: FormEvent) {
        const files = Array.from((event.target as HTMLInputElement).files as FileList);
        if (files) {
            if (files.length > 9) {
                toastOperation(true, {
                    text: i18n.t('message_send_img_exceed_tips_w'),
                    type: 'default'
                });
                return
            }
            for (let i = 0; i < files.length; i++) {
                // const suffix = files[i].name.split('.')[1];
                // const newFileName = files[i].name.replace(suffix, '.jpeg');
                // if (suffix.toLowerCase().includes('heic') || suffix.toLowerCase().includes('heif')) {
                //     await heic2any({ blob: files[i], toType: 'image/jpeg' })
                //         .then((blob) => {
                //         const file = new File([blob as Blob], newFileName, { type: 'image/jpeg' });
                //         files[i] = file;
                //         })
                //         .catch((err) => {
                //         toastOperation(true, {
                //             text: '图片格式转换失败，请重试',
                //             type: 'default',
                //         });
                //         return;
                //     });
                // }
                this.state.currentChat.sendMediaMessage(
                    files[i],
                    (message: ZIMMediaMessage, currentFileSize: number, totalFileSize: number) => {
                        console.log('===handleImageChange', message, currentFileSize, totalFileSize);
                    },
                    { fileType: 11 },
                );
                this.setState({
                    isScrolled: false
                })
            }
        }
    }
    handleVideoFileChange(event: FormEvent) {
        const files = Array.from((event.target as HTMLInputElement).files as FileList);
        if (files) {
          if (files.length > 9) {
            toastOperation(true, {
                text: i18n.t('message_send_video_exceed_tips_w'),
                type: 'default',
            });
            return;
          }
          for (let i = 0; i < files.length; i++) {
            const video = new Audio(URL.createObjectURL(files[i]));
            video.onloadedmetadata = () => {
                this.state.currentChat.sendMediaMessage(
                    files[i],
                    (message: ZIMMediaMessage, currentFileSize: number, totalFileSize: number) => {
                        console.log('===handleVideoFileChange', JSON.parse(JSON.stringify(message)), currentFileSize, totalFileSize);
                    },
                    { fileType: 14, videoDuration: video.duration },
                );
                this.setState({
                    isScrolled: false
                })
            };
          }
        }
    }
    handleFileChange(event: FormEvent) {
        const files = Array.from((event.target as HTMLInputElement).files as FileList);
        if (files) {
          for (let i = 0; i < files.length; i++) {
            if (!files[i].size) {
                toastOperation(true, {
                  text: i18n.t('message_file_empty_error_tips'),
                  type: 'default',
                });
                return;
            }
            this.state.currentChat.sendMediaMessage(
              files[i],
              (message: ZIMMediaMessage, currentFileSize: number, totalFileSize: number) => {
                console.log('===handleVideoFileChange', JSON.parse(JSON.stringify(message)), currentFileSize, totalFileSize);
              },
              { fileType: 12 },
            );
            this.setState({
                isScrolled: false
            })
          }
        }
    }
    handleAddExpression(expression: string) {
        this.setState({
            showExpressionBox: false
        })
        const textarea = document.querySelector('.text-area') as HTMLTextAreaElement;
        textarea && (textarea.focus());
        const msgArr = this.state.message.split('');
        const cursorPosition = textarea.selectionStart;
        msgArr.splice(cursorPosition, 0, expression);
        this.setState({
            message: msgArr.join('')
        })
        setTimeout(() => {
            textarea.setSelectionRange(cursorPosition + 2, cursorPosition + 2);
        }, 0);
    }
    showLargeImg(item: ZIMKitImgMessageModel | ZIMKitVideoMessageModel) {
        const arr = item.mMessage.fileName.split('.');
        const type = arr && arr[arr.length - 1].toLocaleLowerCase();
        if (type && /mov/.test(type)) {
            toastOperation(true, {
                text: i18n.t('message_video_play_error_tips_w'),
                type: 'default',
            })
            return;
        }
        if ((item.mMessage.type === 11 && !item.mMessage.largeImageDownloadUrl) || (item.mMessage.type === 14 && !item.mMessage.fileDownloadUrl)) {
            return;
        }
        if (item.mMessage.type === 14 && Object.keys(this.state.audioItem).length) {
            const dom = document.querySelector(`#audio${this.state.audioItem.mMessage.messageID}`) as HTMLAudioElement;
            if (dom) {
                dom.pause();
                dom.currentTime = 0;
            }
            this.state.currentMessageList.filter((item: any) => {
                if (item.mMessage.type === 13 && item.isPlaying) {
                  item.isPlaying = false;
                }
            });
            this.setState({
                audioItem: {}
            })
        }
        this.setState({
            showLargeImgBox: true,
            largeImg: item
        })
    }
    handleCloseLargeImgBox() {
        this.setState({
            showLargeImgBox: false,
            largeImg: {},
        })
    }
    operation(messageItem: any, event: any) {
        event.preventDefault();
        if (ZIMKitChatListVM.getInstance().mode) {
            return;
        }
        const data = {
            x: event.pageX,
            y: event.pageY,
            messageItem,
        };
        rightClickDialogOperation(true, data);
        const msgBox = document.querySelector('.message-content') as HTMLDivElement;
        msgBox.style.overflowY = 'hidden';
    }
    playAudio(item: ZIMKitAudioMessageModel) {
        item.loadStatus = 1;
        const audioDom = document.querySelector(`#audio${item.mMessage.messageID}`) as HTMLAudioElement;
        this.state.currentMessageList.filter((item: any) => {
            if (item.mMessage.type === 13 && item.isPlaying) {
              item.isPlaying = false;
            }
        });
        if (Object.keys(this.state.audioItem).length) {
            const dom = document.querySelector(`#audio${this.state.audioItem.mMessage.messageID}`) as HTMLAudioElement;
            if (dom) {
                dom.pause();
                dom.currentTime = 0;
            }
            if (this.state.audioItem.mMessage.messageID !== item.mMessage.messageID) {
                this.startPlayingAudio(item, audioDom);
            } else {
                item.loadStatus = 0;
                item.isPlaying = false;
                this.setState({
                    audioItem: {}
                })
            }
        } else {
            this.startPlayingAudio(item, audioDom);
        }
    }
    startPlayingAudio(item: ZIMKitAudioMessageModel, audioDom: HTMLAudioElement) {
        if (ZIMKitManager.getInstance().networkStatus && (!audioDom.src || audioDom.src !== item.mMessage.fileDownloadUrl)) {
            audioDom.src = item.mMessage.fileDownloadUrl;
        }
        if (audioDom.error) {
            audioDom.src = '';
            toastOperation(true, {
              text: i18n.t('message_audio_play_error_tips'),
              type: 'default',
            });
            item.loadStatus = 3;
            item.isPlaying = false;
            this.setState({
                audioItem: {}
            })
        } else {
            audioDom.play();
        }
        audioDom.onwaiting = (e: any) => {
            item.loadStatus = 1;
            item.isPlaying = false;
            this.setState({
                audioItem: item
            })
            // console.log('===waiting', audioDom, this.state.audioItem);
        };
        audioDom.onplaying = () => {
            item.loadStatus = 2;
            item.isPlaying = true;
            this.setState({
                audioItem: item
            })
            // console.log('===playing', audioDom, this.state.audioItem);
        };
        audioDom.onpause = () => {
            item.loadStatus = 0;
            item.isPlaying = false;
            this.setState({
                audioItem: {}
            })
            // console.log('===pause', audioDom, this.state.audioItem);
        }
        audioDom.onended = () => {
            item.loadStatus = 2;
            item.isPlaying = false;
            this.setState({
                audioItem: {}
            })
            // console.log('===end', audioDom, this.state.audioItem);
        };
      }
    getAudioWidth(item: ZIMKitAudioMessageModel) {
        const duration = item.mMessage.audioDuration;
        const width = 70 + (duration / 60) * 204;
        return width > 204 ? 204 : width;
    }
    getFileIcon(item: ZIMKitFileMessageModel) {
        let icon = '';
        const arr = item.mMessage.fileName && item.mMessage.fileName.split('.');
        const type = arr && arr[arr.length - 1].toLocaleLowerCase();
        if (type) {
          const obj = {
            ppt: /ppt|pptx|pptm/,
            word: /doc|docx|rtf|dot|html|tmp|wps/,
            txt: /txt/,
            pdf: /pdf/,
            excel: /xlsx|xlsm|xlsb|xltx|xltm|xls|xlt|xml|xlr|xlw|xla|xlam/,
            zip: /rar|zip|arj|gz|arj|z/,
            video: /mp4|m4v|mov|qt|avi|flv|wmv|asf|mpeg|mpg|vob|mkv|asf|rm|rmvb|vob|ts|dat|3gp|3gpp|3g2|3gpp2|webm/,
            audio: /mp3|wma|wav|mid|ape|flac|ape|alac|m4a/,
            image: /tiff|heif|heic|jpg|jpeg|png|gif|bmp|webp/,
          };
          Object.entries(obj).forEach(([k, v]) => {
            if (v.test(type)) {
              icon = k + '-icon';
            }
          });
        }
        return icon ? icon : 'unknow-icon';
    }
    selectMessage(item: ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel) {
        this.setState({
            selectedItem: item
        })
        item.selected = !item.selected;
        if (item.selected) {
            ZIMKitChatListVM.getInstance().currentChat.selectedList.push(item.mMessage);
        } else {
            const index = ZIMKitChatListVM.getInstance().currentChat.selectedList.findIndex((selectedItem) => selectedItem.messageID === item.mMessage.messageID);
            ZIMKitChatListVM.getInstance().currentChat.selectedList.splice(index, 1);
        }
    }
    closeMultiSelectMode() {
        ZIMKitChatListVM.getInstance().mode = Mode['normal'];
        this.setState({
            isMultiSelectMode: Mode['normal']
        })
        this.state.currentMessageList.map((item: ZIMKitTextMessageModel| ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel) => {
            item.selected = false;
        });
        ZIMKitChatListVM.getInstance().currentChat.selectedList = [];
    }
    deleteMessage() {
        if (!ZIMKitChatListVM.getInstance().currentChat.selectedList.length) {
            return;
        }
        dialogOperation(true, {
            desc: i18n.t('message_delete_confirmation_desc'),
            confirmText: i18n.t('conversation_delete'),
            cancelText: i18n.t('conversation_cancel'),
            hasCloseBtn: false,
            confirmFunc: () => {
                ZIMKitChatListVM.getInstance().currentChat.deleteMessages();
            }
        });
    }
    render() {
        const { currentChat, currentMessageList, isMultiSelectMode } = this.state;
        const { userID, userAvatarUrl } = ZIMKitManager.getInstance().userInfo;
        let chatContentView: any = null;
        if (!currentChat || !currentChat.chatID) {
            chatContentView = (<div className="default-content">
                <div className="img"></div>
                <div className="text">{ i18n.t("message_empty_w") }</div>
            </div>);
        } else {
            const { chatName, chatID, chatAvatarUrl, chatType } = currentChat;
            let expressionBoxView: any = null;
            let largeImgBoxView: any = null;
            if (this.state.showExpressionBox) {
                expressionBoxView = (<ExpressionBox onAddExpression={this.handleAddExpression}></ExpressionBox>)
            }
            if (this.state.showLargeImgBox) {
                largeImgBoxView = (<LargeImgBox largeImg={ this.state.largeImg } close={ this.handleCloseLargeImgBox }></LargeImgBox>)
            }
            chatContentView = (
                <React.Fragment>
                    <div className="header">
                        <div className="title">{ chatName ? chatName : chatType === 0 ? i18n.t('message_title_chat') : i18n.t('message_title_group_chat')  }</div>
                        { chatType === 2 ? <div className="more-icon"></div> : null }
                    </div>
                    <div className="message-content" onScroll={ this.listScroll }>
                        {
                            (currentMessageList as (ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel)[]).map((item, index) => {
                                const time = this.dateFormat(item, index);
                                const isReceive = item.mMessage.senderUserID !== userID;
                                const isError = (item as ZIMKitTextMessageModel).type === 99;
                                const audioWidth = this.getAudioWidth(item as ZIMKitAudioMessageModel);
                                return <div className="message-item" key={ item.mMessage.messageID ? (item.mMessage.messageID as string) : index }>
                                    {
                                        time ? <div className="time-box">{ time }</div> : null
                                    }
                                    <div className="message-box">
                                        {
                                            isMultiSelectMode ? 
                                                <div className="multi-select">
                                                    <div className={`select-icon ${ (item as any).selected ? 'selected' : null }`} onClick={ this.selectMessage.bind(this, item) }></div>
                                                </div> : null
                                        }
                                        {
                                            isReceive ? <div className="left-msg">
                                                <div className="head-portrait">
                                                    { item.mMessage.conversationType === 0 ? 
                                                    <img src={ chatAvatarUrl ? chatAvatarUrl : require('../../ZIMKitCommon/UI/resources/avatar-default.png')}></img>
                                                    : <img src={ item.senderUserAvatarUrl ? item.senderUserAvatarUrl : require('../../ZIMKitCommon/UI/resources/avatar-default.png')}></img>}
                                                </div>
                                                <div className="message-bubble">
                                                    { item.mMessage.conversationType === 2 ? <div className="send-name">{ item.senderUserName || item.mMessage.senderUserID }</div> : null }
                                                    {
                                                        item.mMessage.type === 1 ? 
                                                        <div className="msg-text" onContextMenu={ this.operation.bind(this, item) }>{ (item as ZIMKitTextMessageModel).mMessage.message }</div> : null
                                                    }
                                                    {
                                                        item.mMessage.type === 11 ?
                                                        <div>
                                                            <div className="msg-img"
                                                                style={{width: `${(item as ZIMKitImgMessageModel).thumbnailImgConWidth}px`, height: `${ (item as ZIMKitImgMessageModel).thumbnailImgConHeight}px`}} 
                                                                onClick={ this.showLargeImg.bind(this, item as ZIMKitImgMessageModel) } 
                                                                onContextMenu={ this.operation.bind(this, item) }>
                                                                    <img className={ `img${item.mMessage.messageID}` }
                                                                        style={{width: `${(item as ZIMKitImgMessageModel).thumbnailImgWidth}px`, height: `${ (item as ZIMKitImgMessageModel).thumbnailImgHeight}px`}} />
                                                                </div>
                                                            <div className="err-img"
                                                                style={{width: `${(item as ZIMKitImgMessageModel).thumbnailImgConWidth}px`, height: `${ (item as ZIMKitImgMessageModel).thumbnailImgConHeight}px`}} 
                                                                onClick={ this.showLargeImg.bind(this, item as ZIMKitImgMessageModel) }
                                                                onContextMenu={ this.operation.bind(this, item) } >
                                                                <div className="default-img"></div>
                                                            </div>
                                                        </div>
                                                        : null
                                                    }
                                                    {   item.mMessage.type === 12 ? 
                                                            <div className="msg-file" onContextMenu={ this.operation.bind(this, item) }>
                                                                <div className="file-info">
                                                                    <div className="file-name">{ (item as ZIMKitFileMessageModel).mMessage.fileName }</div>
                                                                    <div className="file-size">{ fileSizeFormat((item as ZIMKitFileMessageModel).mMessage.fileSize) }</div>
                                                                </div>
                                                                <div className={`file-icon ${this.getFileIcon(item as ZIMKitFileMessageModel)}`}></div>
                                                            </div>
                                                            : null
                                                    }
                                                    {   item.mMessage.type === 13 ?
                                                            <div className={`msg-audio ${ (item as ZIMKitAudioMessageModel).loadStatus === 1 ? 'audioLoading' : null }`}
                                                                onClick={ this.playAudio.bind(this, item as ZIMKitAudioMessageModel) }
                                                                onContextMenu={ this.operation.bind(this, item) }
                                                                style={{width: `${audioWidth}px`}}>
                                                                <audio id={`audio${item.mMessage.messageID}`} src={(item as ZIMKitAudioMessageModel).mMessage.fileDownloadUrl}></audio>
                                                                <div className={`play-animation ${ (item as ZIMKitAudioMessageModel).isPlaying ? 'playing' : null}`} ></div>
                                                                <div className="audio-length">{ (item as ZIMKitAudioMessageModel).mMessage.audioDuration }''</div>
                                                            </div> 
                                                            : null
                                                    }
                                                    {   item.mMessage.type === 14 ?
                                                        <div>
                                                            <div className="msg-video"
                                                                onClick={ this.showLargeImg.bind(this, item as ZIMKitImgMessageModel) }
                                                                onContextMenu={ this.operation.bind(this, item) }
                                                                style={{width: `${(item as ZIMKitVideoMessageModel).thumbnailImgConWidth}px`, height: `${ (item as ZIMKitVideoMessageModel).thumbnailImgConHeight}px`}} >
                                                                <img className={ `img${item.mMessage.messageID}` } style={{width: `${(item as ZIMKitVideoMessageModel).thumbnailImgWidth}px`, height: `${ (item as ZIMKitVideoMessageModel).thumbnailImgHeight}px`}}></img>
                                                                <div className="play-icon"></div>
                                                            </div>
                                                            <div className="err-video"
                                                                style={{width: `${(item as ZIMKitImgMessageModel).thumbnailImgConWidth}px`, height: `${ (item as ZIMKitImgMessageModel).thumbnailImgConHeight}px`}} 
                                                                onClick={ this.showLargeImg.bind(this, item as ZIMKitImgMessageModel) }
                                                                onContextMenu={ this.operation.bind(this, item) } >
                                                                <div className="default-img"></div>
                                                                <div className="play-icon"></div>
                                                            </div>
                                                        </div>
                                                        : null
                                                    }
                                                    {   item.mMessage.type !== 1 && item.mMessage.type !== 11 && item.mMessage.type !== 12 && item.mMessage.type !== 13 && item.mMessage.type !== 14 ? <div className="msg-text">{ i18n.t('common_message_unknown') }</div> : null}
                                                </div>
                                            </div> : null
                                        }
                                        {
                                            !isReceive && !isError ? <div className="right-msg">
                                                { (item as ZIMKitTextMessageModel).type !== 99 && item.mMessage.sentStatus === 2 ? <div className="err-icon"></div> : null }
                                                { item.mMessage.sentStatus === 0 ? <div className="loading"></div> : null}
                                                <div className="message-bubble">
                                                    { 
                                                        item.mMessage.type === 1 ? 
                                                        <div className="msg-text" onContextMenu={ this.operation.bind(this, item) }>{ (item as ZIMKitTextMessageModel).mMessage.message }</div> : null }
                                                    {
                                                        item.mMessage.type === 11 ?
                                                        <div>
                                                            <div className="msg-img"
                                                                style={{width: `${(item as ZIMKitImgMessageModel).thumbnailImgConWidth}px`, height: `${ (item as ZIMKitImgMessageModel).thumbnailImgConHeight}px`}} 
                                                                onClick={ this.showLargeImg.bind(this, item as ZIMKitImgMessageModel) } 
                                                                onContextMenu={ this.operation.bind(this, item) }>
                                                                    <img className={ `img${item.mMessage.messageID}` }
                                                                        style={{width: `${(item as ZIMKitImgMessageModel).thumbnailImgWidth}px`, height: `${ (item as ZIMKitImgMessageModel).thumbnailImgHeight}px`}} />
                                                                </div>
                                                            <div className="err-img"
                                                                style={{width: `${(item as ZIMKitImgMessageModel).thumbnailImgConWidth}px`, height: `${ (item as ZIMKitImgMessageModel).thumbnailImgConHeight}px`}} 
                                                                onClick={ this.showLargeImg.bind(this, item as ZIMKitImgMessageModel) }
                                                                onContextMenu={ this.operation.bind(this, item) } >
                                                                <div className="default-img"></div>
                                                            </div>
                                                        </div>
                                                        : null
                                                    }
                                                    {   item.mMessage.type === 12 ? 
                                                            <div className="msg-file" onContextMenu={ this.operation.bind(this, item) }>
                                                                <div className="file-info">
                                                                    <div className="file-name">{ (item as ZIMKitFileMessageModel).mMessage.fileName }</div>
                                                                    <div className="file-size">{ fileSizeFormat((item as ZIMKitFileMessageModel).mMessage.fileSize) }</div>
                                                                </div>
                                                                <div className={`file-icon ${this.getFileIcon(item as ZIMKitFileMessageModel)}`}></div>
                                                            </div>
                                                            : null
                                                    }
                                                    {   item.mMessage.type === 13 ?
                                                            <div className={`msg-audio ${ (item as ZIMKitAudioMessageModel).loadStatus === 1 ? 'audioLoading' : null }`}
                                                                onClick={ this.playAudio.bind(this, item as ZIMKitAudioMessageModel) }
                                                                onContextMenu={ this.operation.bind(this, item) }
                                                                style={{width: `${audioWidth}px`}}>
                                                                <audio id={`audio${item.mMessage.messageID}`} src={(item as ZIMKitAudioMessageModel).mMessage.fileDownloadUrl}></audio>
                                                                <div className="audio-length">{ (item as ZIMKitAudioMessageModel).mMessage.audioDuration }''</div>
                                                                <div className={`play-animation ${ (item as ZIMKitAudioMessageModel).isPlaying ? 'playing' : null}`} ></div>
                                                            </div> : null
                                                    }
                                                    {   item.mMessage.type === 14 ?
                                                        <div>
                                                            <div className="msg-video" 
                                                                onClick={ this.showLargeImg.bind(this, item as ZIMKitImgMessageModel) }
                                                                onContextMenu={ this.operation.bind(this, item) }
                                                                style={{width: `${(item as ZIMKitVideoMessageModel).thumbnailImgConWidth}px`, height: `${ (item as ZIMKitVideoMessageModel).thumbnailImgConHeight}px`}} >
                                                                <img className={ `img${item.mMessage.messageID}` } style={{width: `${(item as ZIMKitVideoMessageModel).thumbnailImgWidth}px`, height: `${ (item as ZIMKitVideoMessageModel).thumbnailImgHeight}px`}}></img>
                                                                <div className="play-icon"></div>
                                                            </div>
                                                            <div className="err-video"
                                                                style={{width: `${(item as ZIMKitImgMessageModel).thumbnailImgConWidth}px`, height: `${ (item as ZIMKitImgMessageModel).thumbnailImgConHeight}px`}} 
                                                                onClick={ this.showLargeImg.bind(this, item as ZIMKitImgMessageModel) }
                                                                onContextMenu={ this.operation.bind(this, item) } >
                                                                <div className="default-img"></div>
                                                                <div className="play-icon"></div>
                                                            </div>
                                                        </div>
                                                        : null
                                                    }
                                                    {   item.mMessage.type !== 1 && item.mMessage.type !== 11 && item.mMessage.type !== 12 && item.mMessage.type !== 13 && item.mMessage.type !== 14 ? <div className="msg-text">{ i18n.t('common_message_unknown') }</div> : null}
                                                </div>
                                                <div className="head-portrait">
                                                    <img src={userAvatarUrl ? userAvatarUrl : require('../../ZIMKitCommon/UI/resources/avatar-default.png')} />
                                                </div>
                                            </div> : null
                                        }
                                        {
                                            isError ? <div className="center-msg">{ (item as ZIMKitTextMessageModel).mMessage.message }</div> : null
                                        }
                                    </div>
                                </div>
                            })
                        }
                    </div>
                    {   isMultiSelectMode ? 
                            <div className="multi-select-operation-box">
                                <div className="operation-content">
                                    <div className="operation-item">
                                        <div className="operation-icon delete" onClick={ this.deleteMessage }></div>
                                        <div className="operation-desc">{ i18n.t('conversation_delete') } </div>
                                    </div>
                                </div>
                                <div className="close-icon" onClick={ this.closeMultiSelectMode }></div>
                            </div> : 
                            <div className="send-box">
                                <div className="tool-box">
                                    <div className="expression">
                                        <div className="expression-content">
                                            {expressionBoxView}
                                        </div>
                                    </div>
                                    <div className="image-file" onClick={ this.clickUploadImageFile }>
                                        <input id="uploadImageFile" type="file" multiple={true} accept="image/png,image/jpg,image/jpeg,image/bmp,image/gif" onChange={this.handleImageChange} />
                                    </div>
                                    <div className="video-file" onClick={ this.clickUploadVideoFile }>
                                        <input id="uploadVideoFile" type="file" multiple={true} accept=".mp4,.MP4,.mov,.MOV" onChange={ this.handleVideoFileChange } />
                                    </div>
                                    <div className="other-file" onClick={ this.clickUploadFile }>
                                        <input id="uploadFile" type="file" onChange={ this.handleFileChange } />
                                    </div>
                                </div>
                                <textarea className="text-area" value={this.state.message} onChange={ this.handleInputChange }></textarea>
                                <button className="btn send-button" onClick={ this.sendMessage } disabled={ !this.state.message }>{ i18n.t("message_send") }</button>
                            </div>
                        }
                    {largeImgBoxView}
                </React.Fragment>
            );
        }
        return (<div className="chat">{ chatContentView }</div>);
    }
}

export default MessageView;