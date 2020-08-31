import React, { Component } from 'react';
import {connect} from "react-redux";
import _ from 'lodash';
import join from 'src/util/classnames'
import FfNnLayer from "src/playgrounds/nlp/components/ff-nn-layer";
import {NODE_COLORS, NODE_SHAPES} from "src/playgrounds/nlp/components/ff-nn-node";

class FfNeuralNetwork extends Component {

    constructor(props){
        super(props);

        const { layers, layer_structure, max_node_per_layer=25, min_node_per_layer=3, inputs=['a1', 'a2', 'b1', 'b2'], outputs=['bit_1', 'bit_2'], X, Y }  = this.props;

        this.inputs = inputs;
        this.outputs = outputs;

        const random_weights = (layer_size, next_layer_size) => {
            return _.map(_.range(layer_size), (n)=>{ return _.map(_.range(next_layer_size), (i)=>{ return Math.random() })})
        }

        let ls = {
            [`${0}`]: {size: _.size(this.inputs), nodes: Array(_.size(this.inputs)).fill(0), labels: inputs, shape: NODE_SHAPES.SQUARE},
            [`${layers + 1}`]: {size: _.size(this.outputs), nodes: Array(_.size(this.outputs)).fill(0),labels: outputs, color: NODE_COLORS.BLUE, correct_labels: Y}
        };

        _.map(_.range(1,layers + 1), (i)=>{
            if (_.get(layer_structure, `${i}`)){
                let size =  _.get(layer_structure, `${i}`);
                ls[i] = {size: size, nodes: Array(size)}
            }else{
                let len = _.max([min_node_per_layer, _.floor(Math.random() * max_node_per_layer)]);
                ls[i] = {size: len, nodes: Array(len).fill(0)}
            }
        })

        _.map(_.keys(ls), (k, i)=>{
            if (i == _.size(_.keys(ls))-1){
                return;
            }

            ls[k]['weights'] = random_weights(ls[`${i}`]['size'], ls[`${i+1}`]['size'])
        })

        this.state = {
            layer_structure: ls
        }


    }

    componentDidMount(){
        const { X } = this.props;
        if (X){
            this.propagateForward();
        }
    }

    sigmoid(t) {
        return 1/(1+Math.pow(Math.E, -t));
    }

    propagateForward(){
        const { X, inputs, Y, outputs } = this.props;
        const { layer_structure } = this.state;

        // we will overwrite the entire layer structure (not optimal but easier)
        let ls = this.resetActivations();

        let activations = [];
        let weights = [];
        _.map(_.keys(ls), (layer, i)=>{
            let temp_activations = [];
            let temp_weights = []
            // inputs
            if (i == 0){
                _.map(X, (input)=>{
                    let ind = _.findIndex(inputs, (n)=>{return n == input});
                    if (ind > -1){
                        ls['0']['nodes'][ind] = 1.0;
                        activations.push(1.0);
                        weights.push(ls['0']['weights'][ind])
                    }

                })

            }else{

                _.map(ls[`${i}`]['nodes'], (n, n_i)=>{
                    let val = n;
                    _.map(weights, (w, w_i)=>{
                        let weight = _.get(w, n_i, 0);
                        let weight_activation = activations[w_i];

                        val += weight * weight_activation;
                    })

                    ls[`${i}`]['nodes'][n_i] = this.sigmoid(val);

                    temp_activations.push(val)

                    if (i != _.size(_.keys(ls)) - 1){
                        temp_weights.push(ls[`${i}`]['weights'][n_i])
                    }

                })

                activations = temp_activations;
                weights = temp_weights;
                temp_activations = [];
                temp_activations = [];

            }

        })

        // Update the final layer
        let last_layer_key = _.size(_.keys(ls)) - 1;
        let total_probability = 0;

        ls[last_layer_key]['correct_labels'] = Y;

        _.map(ls[last_layer_key]['nodes'], (node, i)=>{
            total_probability += Math.exp(node);
        })

        _.map(ls[last_layer_key]['nodes'], (node, i)=>{
            ls[last_layer_key]['nodes'][i] = Math.exp(node) / total_probability;
        })

        let loss = 0;

        _.map(Y, (label)=>{
            let ind = _.findIndex(outputs, (n)=>{return n === label});
            if (ind > -1){
                loss += Math.log(ls[last_layer_key]['nodes'][ind])
            }

        })

        this.setState({layer_structure: ls, loss: -loss})

    }


    resetActivations(){
        let ls = _.cloneDeep(this.state.layer_structure);

        _.map(_.keys(ls), (layer, i)=>{
            _.map(ls[`${i}`]['nodes'], (n, n_i)=>{
                ls[`${i}`]['nodes'][n_i] = 0.0;
            })
        })

        return ls;

    }

    componentDidUpdate(prevProps){
        const { X } = this.props;
        const { X : prev_X } = prevProps;

        if (!_.isEqual(X, prev_X)){
            this.propagateForward();
        }
    }

    render() {
        const { className, X } = this.props;
        return (
            <div className={join('ff-neural-network', className)}>
                Loss: {_.get(this.state, 'loss', 0.0)}
                {
                    _.map(_.keys(this.state.layer_structure), (i)=>{
                        return <FfNnLayer layer={_.get(this.state.layer_structure, `${i}`)} />
                    })
                }
            </div>
        );
    }

}

export default connect(s => s)(FfNeuralNetwork)
