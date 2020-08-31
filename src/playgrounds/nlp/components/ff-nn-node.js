import React, { Component } from 'react';
import {connect} from "react-redux";
import _ from 'lodash';
import join from 'src/util/classnames'

export const NODE_SHAPES = {
    CIRCLE:  1,
    SQUARE:  2
}

export const NODE_COLORS = {
    RED: 'red',
    BLUE: 'blue',
}

class FfNnNode extends Component {

    render() {
        const { className, activation_weight=0.0, shape, color, label, correct_label } = this.props;
        return (
            <div className={'ff-nn-node-container'}>
                <div className={join('ff-nn-node', className, {'square': shape==NODE_SHAPES.square, 'correct_label': !!correct_label})}>
                    {label ? <div className={'label'}>{label}</div> : null }
                    <div className={'activation_weight'}>{_.floor(activation_weight * 100)}%</div>
                    <div className={join('inside-node')} style={{'opacity': activation_weight, 'backgroundColor': color}}/>
                </div>
            </div>
        );
    }

}

export default connect(s => s)(FfNnNode)
