import React, { Component } from 'react';
import {connect} from "react-redux";
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import {create_image, loaded_image} from "../reducers/image";

class ImageCV extends Component {

    constructor(props){
       super(props);
       this.state = {mX: 0, mY: 0};
       this.image_id = uuidv4();
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(create_image(this.image_id));
    }

    buildCanvas(){
        const img = _.get(this.refs, 'image');
        const canvas = this.refs['canvas']
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);


        this.grayScale();
    }

    mouseMove(e){
        const canvas = this.refs['canvas']

        var x = e.pageX - canvas.offsetLeft;
        var y = e.pageY - canvas.offsetTop;

        this.setState({
            mX: x,
            mY: y
        })
    }

    grabMousePosition(){
        return {x: this.state.mX, y: this.state.mY}
    }

    render() {
        const { url, alt } = this.props;
        return (
            <div className={'image-container'} onMouseMove={this.mouseMove.bind(this)}>
                <img src={url} ref={'image'} alt={alt || "alt image"} style={{'display': 'none'}} onLoad={this.buildCanvas.bind(this)}/>

                <canvas id={this.image_id} ref={'canvas'}></canvas>
            </div>
        );
    }

    grayScale(){
        const { dispatch } = this.props;

        const canvas = this.refs['canvas'];
        var context = canvas.getContext('2d');

        let imageData = context.getImageData(0,0,canvas.width,canvas.height);

        let data = imageData.data;

        for (var i=0; i<data.length; i+=4){
            let val = 0.3 * data[i] + 0.59 * data[i+1] + 0.11 * data[i+2]
            data[i] = val;
            data[i+1] = val;
            data[i+2] = val;
            data[i+3] = data[i+3];
        }

        context.putImageData(imageData, 0, 0);

        dispatch(loaded_image(this.image_id));
    }
}

export default connect(s => s)(ImageCV)
