import React, { Component } from 'react';
import _ from 'lodash'
import {connect} from "react-redux";
import FfNeuralNetwork from "src/playgrounds/nlp/components/ff-neural-network";

class FeedforwardNetwork extends Component {

    constructor(props){
        super(props);

        this.state = {
            X: ['a1', 'b1', 'b2'],
            Y: ['c1']
        }
    }

    render() {
        const { controls } = this.props;

        let inputs = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8',
                      'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'  ];
        let outputs = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];

        return (
            <div>
                <h2>Feedforward Network</h2>

                <FfNeuralNetwork layers={1} X={this.state.X} Y={this.state.Y} inputs={inputs} outputs={outputs} />

                <button onClick={this.newExample.bind(this)}>New Example!</button>
            </div>
        );
    }

    newExample(){
        let X = [];
        let Y = [];


        for (var i = 0; i < 8; i++){
            let a = 0;
            let b = 0;

            if (Math.random() > 0.5){
                X.push(`a${i+1}`)
                a = 1;
            }
            if (Math.random() <= 0.5){
                X.push(`b${i+1}`)
                b = 1;
            }

            if (a & b){
                Y.push(`c${i+1}`)
            }
        }

        this.setState({
            X: X,
            Y: Y
        })
    }

}

export default connect(s => s)(FeedforwardNetwork)
