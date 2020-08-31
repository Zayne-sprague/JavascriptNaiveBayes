import React, { Component } from 'react';
import {connect} from "react-redux";
import MouseTooltip from "react-sticky-mouse-tooltip";
import _ from 'lodash';
import SlidingWindow, {FILTERS} from "./sliding-window";
import numbers from 'numbers'

const INITIAL_GAUSS_SIZE = 32;

class ImageGridCV extends Component {


    constructor(props){
        super(props);

        this.state = {
            image_id: null,
            simple_matrix: null,
            filter: FILTERS.GUASSIAN_XX(INITIAL_GAUSS_SIZE, 2),
            isMouseInside: false,
            images: {},
            filter_state: 0 // todo make this generic
        };
    }

    mouseEvent(){
        this.setState({isMouseInside: !this.state.isMouseInside})
    }

    componentDidMount(){
        const id = _.get(this.refs['image'].getElementsByTagName('canvas'), '[0].id')
        this.setState({image_id:  id});
    }

    render() {
        const { children, image } = this.props;
        const { image_id } = this.state;

        const img = _.get(image, `images.${image_id}`)

        return (
            <div className={'image-grid-container'} onClick={this.mouseEvent.bind(this)} onMouseEnter={this.mouseEvent.bind(this)} onMouseLeave={this.mouseEvent.bind(this)}>
                <MouseTooltip
                    visible={!!_.get(this.state,'isMouseInside')}
                    offsetX={-16}
                    offsetY={-16}
                >
                    <div className={'image-grid-tt-container'}>
                        <div className={'border-box'}/>
                        <div className={'magnifier'}>
                            MAGNIFY
                        </div>
                    </div>
                </MouseTooltip>


                <SlidingWindow
                    image_id={_.get(img, 'loaded') ? image_id : null}
                    filter={this.state.filter}
                    simple_matrix={this.state.simple_matrix}
                    filter_id={this.state.filter_state}
                    onFinishedFilter={this.onFinishedFilter.bind(this)}
                >


                </SlidingWindow>
                <div className={'image-grid-child'} ref={`image`}>
                    {children}
                </div>
            </div>
        );
    }

    onFinishedFilter(old_image, new_image){
        const fs = this.state.filter_state;

        if (fs === 0){
            const gauss_img = new_image;
            const sobel_x = FILTERS.SOBEL_X;

            this.setState({
                filter: sobel_x,
                original_image:old_image,
                gauss_img: gauss_img,
                filter_state: 1,
                simple_matrix: gauss_img
            })
        }else if(fs === 1){
            const sobel_x = new_image;
            const sobel_y = FILTERS.SOBEL_Y;

            this.setState({
                filter: sobel_y,
                sobel_x: sobel_x,
                filter_state: 2,
                simple_matrix:this.state.gauss_img
            })
        }else if(fs === 2){
            const filter = FILTERS.GUASSIAN_XX(4, 1);

            // let Iy = tf.tensor2d(new_image);
            // let Ix = tf.tensor2d(this.state.sobel_x);
            //
            // let Ixy = Ix.mul(Iy);
            // let Ix2 = Ix.square();
            // let Iy2 = Iy.square();
            //
            // const simple_mat = Ixy.arraySync();

            let Ixy = []
            let Ix2 = []
            let Iy2 = []

            for (var i = 0; i < _.size(this.state.sobel_x); i++){
                let ixy_row = [];
                let ix2_row = [];
                let iy2_row = [];
                for(var j = 0; j < _.size(this.state.sobel_x[i]); j++){
                    ixy_row.push(this.state.sobel_x[i][j] * new_image[i][j])
                    ix2_row.push(this.state.sobel_x[i][j] * this.state.sobel_x[i][j])
                    iy2_row.push(new_image[i][j] * new_image[i][j])
                }
                Ixy.push(ixy_row);
                Ix2.push(ix2_row);
                Iy2.push(iy2_row);
            }

            this.setState({
                filter: filter,
                simple_matrix: Ixy,
                Ixy: Ixy,
                Ix2: Ix2,
                Iy2: Iy2,
                filter_state: 3,
            })
        }else if(fs === 3){

            this.setState({
                Ixy_g: new_image,
                filter_state: 4,
                simple_matrix: this.state.Ix2
            })
        }else if(fs === 4){

            this.setState({
                Ix2_g: new_image,
                filter_state:5,
                simple_matrix: this.state.Iy2
            })
        }else if(fs === 5){

            // this.setState({
            //     Iy2_g: new_image
            // })


            const size = _.size(this.state.sobel_x);

            let coords = {}

            for (var i = 0; i < _.size(this.state.sobel_x); i++) {
                for (var j = 0; j < _.size(this.state.sobel_x[i]); j++) {
                    let hessian = [
                        [this.state.Ix2_g[i][j], this.state.Ixy_g[i][j]],
                        [this.state.Ixy_g[i][j], new_image[i][j]]
                    ]

                    let det = numbers.matrix.determinant(hessian);
                    let trace = this.state.Ix2_g[i][j] + new_image[i][j]

                    if (trace > 0){
                        let weight = det/trace;

                        if (weight > 50){
                            coords[`${i},${j}`] = _.min([weight , 255])
                        }
                    }

                }
            }

            let canvas = document.getElementById(this.state.image_id)
            const context = canvas.getContext("2d");

            var imageData = context.getImageData(0, 0,  canvas.width, canvas.height);
            let data = imageData.data;

            let ith = 0;
            let offset = _.floor(INITIAL_GAUSS_SIZE / 2);
            let img_to_use = this.state.original_image
            for (var i = offset; i < _.size(img_to_use) - offset; i++) {
                for (var j = offset; j < _.size(img_to_use[i]) - offset; j++) {
                    let intensity = img_to_use[i][j]
                    if (_.get(coords, `${i},${j}`)){
                        intensity=_.get(coords, `${i},${j}`)

                        data[ith] = 255;
                        data[ith + 1] = 0;
                        data[ith + 2] = intensity;
                    }else{
                        data[ith] = intensity;
                        data[ith + 1] = intensity;
                        data[ith + 2] = intensity;
                    }

                    // init pix


                    // if (_.size(data) > ith + 4){
                    //     data[ith + 4] = 255;
                    //     data[ith + 4 + 1] = intensity;
                    //     data[ith + 4 + 2] = 0;
                    // }
                    // if(ith > 4){
                    //     data[ith - 4] = 255;
                    //     data[ith - 4 + 1] = intensity;
                    //     data[ith - 4 + 2] = 0;
                    // }


                    ith += 4;
                }
            }

            context.putImageData(imageData, 0 ,0);

        }
    }
}

export default connect(s => s)(ImageGridCV)
