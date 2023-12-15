import React from 'react';
import './style.css';
import ZIMKiti18n from '../../../../../plugin/i18n';
import { EventName } from "../../../../ZIMKitCommon/Constant/event";
import ZIMKitEventHandler from "../../../../ZIMKitCommon/VM/ZIMKitEventHandler";
const i18n = ZIMKiti18n.getInstance().getI18next() as any;
class LargeImgBox extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            isWidthExceed: false,
            isHeightExceed: false,
            isError: false
        }
        this.handleClose = this.handleClose.bind(this);
        this.handleDownload = this.handleDownload.bind(this);
        this.loadImg = this.loadImg.bind(this);
        this.reload = this.reload.bind(this);
    }
    componentWillMount() {
        if (this.props.largeImg.mMessage.type === 11) {
            if (this.props.largeImg.mMessage.largeImageHeight > 532) {
                const w = (532 / this.props.largeImg.mMessage.largeImageHeight) * this.props.largeImg.mMessage.largeImageWidth;
                if (w > 800) {
                    this.setState({
                        isWidthExceed: true
                    })
                } else {
                    this.setState({
                        isHeightExceed: true
                    })
                }
              }
              if (this.props.largeImg.mMessage.largeImageWidth > 800) {
                const h = (800 / this.props.largeImg.mMessage.largeImageWidth) * this.props.largeImg.mMessage.largeImageHeight;
                if (h > 532) {
                    this.setState({
                        isHeightExceed: true
                    })
                } else {
                    this.setState({
                        isWidthExceed: true
                    })
                }
            }
        }
    }
    componentDidMount() {
        if (this.props.largeImg.mMessage.type === 11) {
            this.loadImg();
        } else {
            // this.loadVideo();
        }
        ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitNetworkChanged, [
            (networkStatus: number) => {
                if (networkStatus === 1) {
                    this.reload();
                }
            }
        ])
    }
    handleClose() {
        this.props.close();
    }
    handleDownload() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', this.props.largeImg.mMessage.fileDownloadUrl, true);
        xhr.responseType = 'blob';
        xhr.onload = () => {
          if (xhr.status === 200) {
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(xhr.response);
            a.download = this.props.largeImg.mMessage.fileName; //文件名
            a.click();
          }
        };
        xhr.send();
    }
    loadImg() {
        const img = document.querySelector('#img') as HTMLImageElement;
        const errBox = document.querySelector('.err-box') as HTMLDivElement;
        if (img) {
          img.src = this.props.largeImg.mMessage.largeImageDownloadUrl;
          img.onload = () => {
            this.setState({
                isError: false
            })
            errBox.style.zIndex = '1';
          };
          img.onerror = () => {
            this.setState({
                isError: true
            })
            errBox.style.zIndex = '3';
          };
        }
    }
    loadVideo() {
        const videoDom = document.querySelector('#video') as HTMLVideoElement;
        if (videoDom) {
          videoDom.src = this.props.largeImg.mMessage.fileDownloadUrl;
          videoDom.onloadedmetadata = () => {
            videoDom.play();
          };
        }
    }
    reload() {
        if (this.props.largeImg.mMessage.type === 11) {
            this.loadImg();
        } else {
            this.loadVideo();
        }
    }
    render() {
        const { isError } = this.state;
        let btnView: any = null;
        if (isError) {
            btnView = (<div className="btn reload-btn" onClick={ this.reload }>{ i18n.t('album_redownload_image') }</div>)
        } else {
            btnView = (<div className="operation-item download-icon" title="download" onClick={ this.handleDownload }></div>)
        }
        return (
            <div className="large-img-container">
                <div className="large-img-box">
                    <div className="top">
                        <div className="close-icon" onClick={ this.handleClose }></div>
                    </div>
                    <div className="content">
                        <div className={ `content-box ${this.state.isWidthExceed ? 'largeW' : null } ${this.state.isHeightExceed ? 'largeH': null } ` } >
                            { this.props.largeImg.mMessage.type === 11 ? <img id="img" /> : 
                            <video id="video" src={this.props.largeImg.mMessage.fileDownloadUrl} autoPlay controls controlsList="nodownload noplaybackrate noremoteplayback" disablePictureInPicture></video> }
                        </div>
                        <div className="content-box err-box">
                            <div className="err-img"></div>
                        </div>
                    </div>
                    <div className="operation">
                        {btnView}
                    </div>
                </div>
            </div>
        );
    }
}
export default LargeImgBox;