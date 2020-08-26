import React, { Component } from 'react';
import {connect} from "react-redux";
import * as tf from '@tensorflow/tfjs';
import {CREATE_GAUSS_KERNAL, GAUSSIAN_KERNAL_5X5} from "../util/kernals";

class SlidingWindow extends Component {

    constructor(props) {
        super(props);

        const { image_id, slide=true, speed=0.001, width=32, height=32 } = this.props
        this.canvas = document.getElementById(image_id)
        this.simple_matrix = []

        if (this.canvas){
            this.slide_interval = null;

            let kernel = CREATE_GAUSS_KERNAL(width);

            //TODO - look into why this doesn't work for the y pos??? Maybe we are relative
            const origin_data = this.canvas.getBoundingClientRect();

            this.state = {
                x: -width / 2, y: 0, orig_x: origin_data.x, orig_y: 0,
                width: width, height: height,
                step: 1,
                speed: speed,
                sliding: slide,
                kernel: kernel
            }

            if (slide){
                // TODO - wait for image to load into canvas
                _.delay(()=>{this.loadImage()}, 400);
                _.delay(()=>{this.slide()}, 700);

            }
        }

    }

    loadImage(){
        const context = this.canvas.getContext("2d");
        var imageData = context.getImageData(0,0, this.canvas.width, this.canvas.height);

        let data = imageData.data;

        let image = []

        let row = []
        let padded_row = Array(this.state.width / 2).fill(0);
        for (var i=0, j=0; i<data.length; i+=4, j+=1) {
            row[j] = data[i];

            if (j == this.canvas.width - 1){
                image.push([...padded_row, ...row]);
                row = [];
                j = -1;
            }
        }

        let zero_padded_height = Array(this.state.width / 2).fill(0).map(() => new Array(this.canvas.width).fill(0));
        this.simple_matrix = [...zero_padded_height, ...image]
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { slide } = this.props;
        const { slide : was_sliding } = prevProps;

        if (slide && !was_sliding){
            this.setState({x: 0, y: 0})
            this.slide();
        }else if(!slide && !!was_sliding){
           this.stop_sliding()
        }
    }

    stop_sliding(){
        clearInterval(this.slide_interval);
        this.setState({
            sliding: false,
            x: this.state.orig_x,
            y: this.state.orig_y
        })
    }
    slide(){
        this.slide_interval = setInterval(()=>{


            let new_x;
            let new_y = this.state.y;

            if (this.state.x == this.canvas.width){
                new_x = this.state.orig_x - this.state.width/2;
                if (new_y  + this.state.height <= this.canvas.height ){
                    new_y += this.state.height;
                }else{
                    return this.stop_sliding();
                }
            }else{
                new_x = this.state.x + this.state.step;
            }

            const ys = _.range(this.state.y, this.state.y + this.state.height);

            //_.range(_.max([0 ,this.state.y - _.floor(this.state.height / 2)]), _.min([this.state.y + _.floor(this.state.height / 2), this.canvas.height -1]));
            _.map(ys, (y)=>{
                this.correlate(this.state.x + this.state.width/2, y, this.state.width, this.canvas.width, this.canvas.height, this.state.step, this.state.kernel);
            })

            this.setState({
                x: new_x,
                y: new_y
            })
        }, this.state.speed)
    }

    correlate(w_x, w_y, w_s, width, height, step, kernel){
        const context = this.canvas.getContext("2d");


        const y_start = w_y;
        const rows = y_start + _.min([w_s, height - y_start])

        const x_start = w_x;
        const columns = x_start + _.min([w_s, width - x_start])

        const x_to_update = x_start //+ _.min([w_s / 2, _.ceil((width - x_start) / 2)]);
        const y_to_update = y_start //+ _.min([w_s / 2, _.ceil((height - y_start) / 2)]);
        var imageData = context.getImageData(x_to_update, y_to_update, step , step);

        // let pixels = Array(rows - y_start);

        // for (var y = y_start, i=0; y < rows; y++, i++) {
        //     let row = Array(columns - x_start)
        //     for (var x = x_start, j=0; x < columns; x++, j++){
        //         row[j] = this.simple_matrix[y][x];
        //     }
        //     pixels[i] = row;
        // }

        // let patch = tf.tensor(pixels);

        // patch.square();

        // let correlated = patch.dataSync();

        // let data = imageData.data;

        // let ith_pixel = 0;
        // correlated.map(a => {
        //    data[ith_pixel] = a;
        //    data[ith_pixel+1] = a;
        //    data[ith_pixel+2] = a;
        //    data[ith_pixel+3] = data[ith_pixel+3];
        //    ith_pixel += 4;
        // })


        // patch.dispose();

        //const kernel = CREATE_GAUSS_KERNAL(this.state.width); //GAUSSIAN_KERNAL_5X5;
        let data = imageData.data;

        // let pix = _.floor(_.size(data)/2) //_.floor((this.state.width * this.state.height) / 2) * 4;
        let pix = 0;
        let sum = 0;
        for (var y = y_start, i=0; y < rows; y++, i++) {
            for (var x = x_start, j=0; x < columns; x++, j++){
                sum += this.simple_matrix[y][x] * kernel[i][j];

            }
        }

        sum = _.floor(sum)
        data[pix] = sum;
        data[pix+1] = sum;
        data[pix+2] = sum;

        context.putImageData(imageData, x_to_update ,y_to_update);
    }

    render() {
        const { image_id } = this.props;
        return (
            <div
                className={'sliding-window'}
                style={{
                    "transform": `translate3d(${this.state.orig_x + this.state.x}px, ${this.state.orig_y + this.state.y}px, 0px)`,
                    "width": `${this.state.width}px`, "height": `${this.state.height}px`
                }}
            >

            </div>
        );
    }


}

export default connect(s => s)(SlidingWindow)
