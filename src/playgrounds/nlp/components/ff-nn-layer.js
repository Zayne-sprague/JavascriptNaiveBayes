import React, { Component } from 'react';
import {connect} from "react-redux";
import _ from 'lodash';
import join from 'src/util/classnames'
import FfNnNode from "src/playgrounds/nlp/components/ff-nn-node";

class FfNnLayer extends Component {

    render() {
        const { className, layer  } = this.props;
        return (
            <div className={join('ff-nn-layer', className)}>
                {_.map(_.get(layer, 'nodes'), (n, i)=>{
                    return (
                        <FfNnNode
                            key={`node-${i}`}
                            label={_.get(layer, `labels[${i}]`)}
                            activation_weight={n} color={_.get(layer, 'color')}
                            shape={_.get(layer, 'shape')}
                            correct_label={_.includes(_.get(layer, 'correct_labels', []), _.get(layer, `labels[${i}]`))}
                            bias_weight={_.get(layer, `bias_weights[${i}]`)}
                        />
                    )
                })}
            </div>
        );
    }

}

export default connect(s => s)(FfNnLayer)
