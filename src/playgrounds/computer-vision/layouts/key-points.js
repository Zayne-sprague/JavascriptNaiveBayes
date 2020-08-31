import React, { Component } from 'react';
import {connect} from "react-redux";
import ImageGridCV from "../components/image-grid";
import ImageCV from "../components/image";


class KeyPoints extends Component {

    render() {
        const { dispatch, image } = this.props;
        const img1 = '/img/test2.jpg';
        const img2 = '/img/cv_image_1.jpg';

        return (
            <div className={'key-points-container'}>
                <h2>Key Points</h2>
                <ImageGridCV image={image}>
                    <ImageCV dispatch={dispatch} url={img2} alt={'test image'}/>
                </ImageGridCV>
            </div>
        );
    }
}

export default connect(s => s)(KeyPoints)
