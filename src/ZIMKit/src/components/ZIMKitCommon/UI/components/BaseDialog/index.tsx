import React from 'react';
import './style.css';
import eventBus, { EmitName } from "../../../ToolUtil/eventBus";

class BaseDialog extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.closeHandle = this.closeHandle.bind(this);
        this.cancelHandle = this.cancelHandle.bind(this);
        this.confirmHandle = this.confirmHandle.bind(this);
    }
    closeHandle() {
        eventBus.emit(EmitName.DialogOperation, false);
    }
    cancelHandle() {
        const { cancelFunc } = this.props.dialogData;
        cancelFunc && cancelFunc();
        this.closeHandle();
    }
    confirmHandle() {
        const { confirmFunc } = this.props.dialogData;
        confirmFunc && confirmFunc();
        this.closeHandle();
    }
    render() {
        let dialogView = null;
        if (this.props.showBaseDialog) {
            const { title, desc, hasCloseBtn, cancelText, confirmText } = this.props.dialogData;
            dialogView = <div className="wrapper">
                <div className="dialog">
                    {
                        hasCloseBtn ? <div className="close-icon" onClick={ this.closeHandle }></div> : null
                    }
                    <div className="title">{ title }</div>
                    <div className="desc">{ desc }</div>
                    <div className="line"></div>
                    <div className="btn-box">
                        {
                            cancelText ? <button className="btn cancel" onClick={ this.cancelHandle }>{ cancelText }</button> : null
                        }
                        {
                            confirmText ? <button className="btn confirm" onClick={ this.confirmHandle }>{ confirmText }</button> : null
                        }
                    </div>
                </div>
            </div>
        }
        return dialogView;
    }
}

export default BaseDialog;