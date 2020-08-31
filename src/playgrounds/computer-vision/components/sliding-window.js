import React, { Component } from 'react';
import {connect} from "react-redux";
import * as tf from '@tensorflow/tfjs';
import {CREATE_GAUSS_KERNAL, SOBEL_X_KERNEL, SOBEL_Y_KERNEL} from "../util/kernels";

export const BOX_SIZE_OPTIONS = {
    FULL_IMAGE: "full_image",
}

export const FILTERS = {
    GUASSIAN_5X5: CREATE_GAUSS_KERNAL(5),
    GUASSIAN_XX: CREATE_GAUSS_KERNAL,
    SOBEL_X: SOBEL_X_KERNEL,
    SOBEL_Y: SOBEL_Y_KERNEL
}

class SlidingWindow extends Component {

    constructor(props) {
        super(props);

        if (_.get(props, 'image_id')){
            this.set_up();
        }
    }

    set_up(){
        const {
            image_id,
            slide=true,
            simple_matrix=null,
            speed=0.0000001,
            size=BOX_SIZE_OPTIONS.FULL_IMAGE,
            filter = FILTERS.GUASSIAN_XX(32, 3)
        } = this.props;

        this.canvas = document.getElementById(image_id)
        this.simple_matrix = simple_matrix ? simple_matrix : []

        this.slide_interval = null;

        //let kernel = CREATE_GAUSS_KERNAL(width);
        let kernel = filter

        //TODO - look into why this doesn't work for the y pos??? Maybe we are relative
        const origin_data = this.canvas.getBoundingClientRect();


        this.setState({
            x:0, y: 0, orig_x: origin_data.x, orig_y: 0,
            width: _.size(kernel), height: _.size(kernel),
            boxWidth: size == BOX_SIZE_OPTIONS.FULL_IMAGE ? 11 : size,
            boxHeight: size == BOX_SIZE_OPTIONS.FULL_IMAGE ? this.canvas.height + 1 : size,
            step: 1,
            speed: speed,
            sliding: slide,
            kernel: kernel
        }, ()=>{
            if (!simple_matrix){
                this.simple_matrix = this.loadImage();
            }

            if (slide){
                this.slide()
            }
        })


    }

    loadImage(){
        const context = this.canvas.getContext("2d");
        var imageData = context.getImageData(0,0, this.canvas.width, this.canvas.height);

        let data = imageData.data;

        let image = []

        let row = []
        let padded_row = Array(_.floor(this.state.width / 2)).fill(0);
        for (var i=0, j=0; i<data.length; i+=4, j+=1) {
            row[j] = data[i];

            if (j == this.canvas.width - 1){
                image.push([...padded_row, ...row, ...padded_row]);
                row = [];
                j = -1;
            }
        }

        let zero_padded_height = Array(_.floor(this.state.width / 2)).fill(0).map(() => new Array(_.size(image[0])).fill(0));
        return [...zero_padded_height, ...image, ...zero_padded_height]
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { slide, filter_id, image_id } = this.props;
        const { slide : was_sliding, filter_id : previous_filter_id, image_id : previous_image_id} = prevProps;

        if (slide && !was_sliding){
            this.setState({x: 0, y: 0})
            this.slide();
        }else if(!slide && !!was_sliding){
           this.stop_sliding()
        }

        if(filter_id !== previous_filter_id){
            this.set_up();
        }else if(image_id !== previous_image_id){
            this.set_up();
        }
    }

    stop_sliding(){
        const { onFinishedFilter } = this.props;

        clearInterval(this.slide_interval);

        if(_.isFunction(onFinishedFilter)){
            onFinishedFilter(this.simple_matrix, this.loadImage())
        }

        this.setState({
            sliding: false,
            x: this.state.orig_x,
            y: this.state.orig_y,
            filter_index: 0,
        })



    }
    slide(){
        this.slide_interval = setInterval(()=>{


            let new_x;
            let new_y = this.state.y;

            if (this.state.x == this.canvas.width){
                new_x = this.state.orig_x - _.floor(this.state.width/2);
                if (new_y  + this.state.boxHeight <= this.canvas.height ){
                    new_y += this.state.boxHeight;
                }else{
                    return this.stop_sliding(true);
                }
            }else{
                new_x = this.state.x + this.state.step;
            }

            const ys = _.range(this.state.y, this.state.y + this.state.boxHeight);

            //_.range(_.max([0 ,this.state.y - _.floor(this.state.height / 2)]), _.min([this.state.y + _.floor(this.state.height / 2), this.canvas.height -1]));
            _.map(ys, (y)=>{
                this.correlate(this.state.x , y, this.state.width, this.canvas.width, this.canvas.height, this.state.step, this.state.kernel);
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
        const { children } = this.props;

        if (_.get(this.state, 'orig_x') === undefined){
            return (<div>{children}</div>)
        }

        return (
            <div>
            <div
                className={'sliding-window'}
                style={{
                    "transform": `translate3d(${this.state.orig_x + this.state.x - this.state.boxWidth/2}px, ${this.state.orig_y + this.state.y}px, 0px)`,
                    "width": `${this.state.boxWidth}px`, "height": `${this.state.boxHeight}px`
                }}
            >
            </div>
                {children}

            </div>
        );
    }


}

export default connect(s => s)(SlidingWindow)
