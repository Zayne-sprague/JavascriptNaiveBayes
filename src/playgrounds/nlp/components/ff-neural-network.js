import React, { Component } from 'react';
import {connect} from "react-redux";
import _ from 'lodash';
import join from 'src/util/classnames'
import FfNnLayer from "src/playgrounds/nlp/components/ff-nn-layer";
import {NODE_COLORS, NODE_SHAPES} from "src/playgrounds/nlp/components/ff-nn-node";

class FfNeuralNetwork extends Component {

    constructor(props){
        super(props);

        const { layers, layer_structure, max_node_per_layer=25, min_node_per_layer=10, inputs=['a1', 'a2', 'b1', 'b2'], outputs=['bit_1', 'bit_2'], X, Y }  = this.props;

        this.inputs = inputs;
        this.outputs = outputs;

        const random_weights = (layer_size, next_layer_size) => {
            return _.map(_.range(layer_size), (n)=>{ return _.map(_.range(next_layer_size), (i)=>{ return Math.random() - 0.5 })})
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
            ls[k]['weight_gradients'] = _.map(_.range(ls[`${i}`]['size']), n=>{ return _.map(_.range( ls[`${i+1}`]['size'], (i)=>{ return 0}))})
        })

        this.state = {
            layer_structure: ls
        }


    }

    componentDidMount(){
        const { X } = this.props;
        if (X){
            this.oneExample();
        }
    }

    sigmoid(t) {
        return 1/(1+Math.pow(Math.E, -t));
    }

    d_sigmoid(t){
        let dt = this.sigmoid(t);
        return dt * ( 1 - this.sigmoid(dt) )
    }

    oneExample(){
        const { X, Y } = this.props;

        // we will overwrite the entire layer structure (not optimal but easier)
        let ls = this.resetActivations();

        let ans = this.propagateForward(ls, X, Y)

        this.setState({layer_structure: _.get(ans, 'ls'), loss: _.get(ans, 'loss')})

    }

    runBatch(){
        const { batch_examples } = this.props;

        let avg_loss = 0;
        let last_loss = 0;
        let trend_average = 0;
        let trend_iteration = 1;
        let ls = this.state.layer_structure;
        _.map(batch_examples, (ex, i)=>{
            ls = this.resetActivations();
            let ans = this.propagateForward(ls, ex['X'], ex['Y'])
            ls = _.get(ans, 'ls');

            // ls = this.backPropagation(ls);
            ls = this.costGradient(ls);

            avg_loss += _.get(ans, 'loss');

            if (i % 50 == 0 && i>0){
                ls = this.backPropagation(ls);

                trend_average = ((avg_loss / 50) - last_loss) / (trend_iteration);
                trend_iteration += 1;
                last_loss = (avg_loss/ 50);
                avg_loss = 0;
            }

        })

        // avg_loss = avg_loss / _.size(batch_examples)


        // weight deltas
        let deltas  = _.map(ls[1]['weights'], (n, ni)=>{
            return _.map(n, (w, wi)=>{
                return this.state.layer_structure[1].weights[ni][wi] - w
            })
        })

        this.setState({layer_structure: ls, loss: trend_average})
    }

    propagateForward(ls, X, Y){
        const { inputs, outputs } =  this.props;

        let activations = _.map(inputs, (input, i)=>{ return _.includes(X, input) ? 1.0 : 0.0 });
        _.map(_.keys(ls), (layer, i)=>{
            let temp_activations = [];
            // inputs
            if (i == 0){
               _.map(activations, (n, i)=>{
                   if (n){
                       ls['0']['nodes'][i] = 1.0;
                   }else{
                       ls['0']['nodes'][i] = 0.0;
                   }
               })

            }else{
                let previous_layer = ls[`${i-1}`];
                let previous_nodes = previous_layer['nodes']
                let weights = previous_layer['weights']

                _.map(ls[`${i}`]['nodes'], (n, n_i)=>{
                    let value = 0;

                    _.map(weights, (w, wi)=>{
                        value += previous_nodes[wi] * _.get(w, n_i);
                    })

                    ls[`${i}`]['nodes'][n_i] = this.sigmoid(value);
                })
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

        return {ls: ls, loss: -loss}
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
        const { X, batch_examples_id, batch_examples } = this.props;
        const { X : prev_X, batch_examples_id: pbei  } = prevProps;

        if (!_.isEqual(X, prev_X)){
            this.oneExample();
        }else if(batch_examples_id != pbei && _.size(batch_examples) > 0){
            this.runBatch();
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

    costGradient(ls){

        let last_layer_key = _.size(_.keys(ls)) - 1;
        let correct_labels = ls[last_layer_key]['correct_labels']

        let output_indexes = _.map(correct_labels, (n)=>{ return _.findIndex(ls[last_layer_key]['labels'], (i)=>{return i == n})});

        // init for expected outputs, will change per layer
        let output = _.map(_.range(_.size(ls[last_layer_key]['labels'])), (n)=>{ return _.includes(output_indexes, n) ? 1.0 : 0.0})

        _.map(_.reverse(_.slice(_.keys(ls), 0, -1)), (layer)=>{
            let temp_output  = Array(_.size(_.get(ls[layer], 'nodes')));
            let layer_weights = _.get(ls[layer], 'weights');

            _.map(_.get(ls[layer], 'nodes'), (n, ni)=>{
                let next_layer = _.get(ls, _.parseInt(layer) + 1);
                let weights = layer_weights[ni];

                let Al_minus_1 = n;

                //let cost = Math.pow(Al - y, 2);
                let dC0_aL_minus_one = 0;

                _.map(weights, (w, wi)=>{
                    let Al = _.get(next_layer, 'nodes')[wi];
                    let wl = w;
                    let y = output[wi];

                    let dC0_Al = 2 * (Al - y);
                    let dAl_Zl = Al * (1 - Al); // derivative of sigmoid
                    let dZl_Wl = Al_minus_1;

                    let dC0_Wl = dZl_Wl * dAl_Zl * dC0_Al;
                    ls[layer]['weight_gradients'][ni][wi] += dC0_Wl;

                    dC0_aL_minus_one += wl * dAl_Zl * dC0_Al;

                })

                temp_output[ni] = dC0_aL_minus_one;

            })

            output = temp_output;
        })

        return ls;

    }

    backPropagation(ls){
        let learning_rate = 0.1;
        _.map(_.reverse(_.slice(_.keys(ls), 0, -1)), (layer)=>{
            _.map(_.get(ls[layer], 'weights'), (n,ni)=>{
                _.map(n, (w,wi)=>{
                    ls[layer]['weights'][ni][wi] += learning_rate * ls[layer]['weight_gradients'][ni][wi];
                    ls[layer]['weight_gradients'][ni][wi] = 0;
                })
            })
        })

        return ls;
    }

}

export default connect(s => s)(FfNeuralNetwork)
