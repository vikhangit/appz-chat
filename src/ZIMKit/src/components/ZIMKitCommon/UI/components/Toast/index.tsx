import React from 'react';
import './style.css';
import eventBus, { EmitName } from "../../../ToolUtil/eventBus";

class Toast extends React.Component<any, any> {
    toastTimer: any;
    duration = 2000;
    constructor(props: any) {
        super(props);
    }
    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (this.props.showToast) {
            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(() => {
                eventBus.emit(EmitName.ToastOperation, false);
            }, this.duration);
        }
    }
    componentWillUnmount(): void {
        clearTimeout(this.toastTimer);
        this.toastTimer = null;
    }
    render() {
        let toastView = null;
        if (this.props.showToast) {
            const { name, text, type } = this.props.toastData;
            // @ts-ignore
            toastView = <div>
                <div className={ "default" + (type === "loading" ? " loading" : "") }>
                    <div className={ "toast" + (type === "error" ? " error" : "" )}>
                        <span className="text">{ text }</span>
                    </div>
                </div>
            </div>
        }
        return toastView;
    }
}

export default Toast;