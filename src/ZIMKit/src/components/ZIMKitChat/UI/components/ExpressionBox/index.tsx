import React from 'react';
import { expressionList } from '../../../Constant/expression';
import './style.css';
class ExpressionBox extends React.Component<any, any> {
    constructor(props: any) {
      super(props);
      this.chooseExpression = this.chooseExpression.bind(this);
    }
    chooseExpression(item: string) {
        this.props.onAddExpression(item);
    }
    render() {
      return (
        <div className="expression-box">
            { 
                expressionList.map((item, index) => {
                    return <div className="item" key={index} onClick={ this.chooseExpression.bind(this, item) }>{ item }</div>
                })
            }
        </div>
      );
    }
}

export default ExpressionBox;