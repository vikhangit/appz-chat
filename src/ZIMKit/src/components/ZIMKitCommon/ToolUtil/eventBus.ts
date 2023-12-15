import { EventEmitter } from 'events';
const eventEmit = new EventEmitter();

export enum EmitName {
  ToastOperation = 'toastOperation',
  DialogOperation = 'dialogOperation',
  GroupInfoOperation = 'groupInfoOperation',
  RightClickDialogOperation = 'rightClickDialogOperation',
  ExpressionBoxOperation = 'expressionBoxOperation'
}

export interface ToastData {
  text: string;
  type: string;
}

export interface DialogData {
  title?: string;
  desc: string;
  confirmText?: string;
  cancelText?: string;
  hasCloseBtn: boolean;
  confirmFunc?: () => void;
  cancelFunc?: () => void;
}

export interface RightClickDialogData {
  x: number;
  y: number;
  conversationItem?: any;
  messageItem?: any;
}

export const groupInfoOperation = (type?: string) => {
  eventEmit.emit(EmitName.GroupInfoOperation, type);
};
export const expressionBoxOperation = (type: string): void => {
  eventEmit.emit(EmitName.ExpressionBoxOperation, type);
};

export const toastOperation = (showToast: boolean, toastData?: ToastData) => {
  eventEmit.emit(EmitName.ToastOperation, showToast, toastData);
};

export const dialogOperation = (
  showBaseDialog: boolean,
  dialogData?: DialogData
) => {
  eventEmit.emit(EmitName.DialogOperation, showBaseDialog, dialogData);
};

export const rightClickDialogOperation = (
  showRightClickDialog: boolean,
  data?: RightClickDialogData
) => {
  eventEmit.emit(EmitName.RightClickDialogOperation, showRightClickDialog, data)
};

export default eventEmit;
