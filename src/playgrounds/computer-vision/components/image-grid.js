import React, { Component } from 'react';
import {connect} from "react-redux";
import MouseTooltip from "react-sticky-mouse-tooltip";
import _ from 'lodash';
import SlidingWindow from "./sliding-window";

class ImageGridCV extends Component {


    constructor(props){
        super(props);

        this.state = {
            isMouseInside: false
        };

        this.state = {images: []};
    }

    mouseEvent(){
        this.setState({isMouseInside: !this.state.isMouseInside})
    }

    componentDidMount(){
        _.map(_.keys(this.refs), (ref)=>{
            const id = _.get(this.refs[ref].getElementsByTagName('canvas'), '[0].id')
            if (id){
                this.setState({images: [...this.state.images, id]});
            }
        })
    }

    render() {
        const { children, img_ref } = this.props;

        if (this.state.isMouseInside && img_ref && !!img_ref.current ){
            console.log(JSON.stringify(img_ref.current.grabMousePosition()));
        }
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

                {_.map(this.state.images, img=>{
                    return(
                        <SlidingWindow key={`sliding-window-${img}`} image_id={img}>

                        </SlidingWindow>
                    )
                })}

                {React.Children.map(children, (child,i)=>{
                    return (
                        <div className={'image-grid-child'} key={`image-grid-child-${i}`} ref={`child-${i}`}>
                            {child}
                        </div>
                    )
                })}
            </div>
        );
    }
}

export default connect(s => s)(ImageGridCV)
