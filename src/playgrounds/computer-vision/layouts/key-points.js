import React, { Component } from 'react';
import {connect} from "react-redux";
import ImageGridCV from "../components/image-grid";
import ImageCV from "../components/image";


class KeyPoints extends Component {

    render() {
        // const { controls } = this.props;
        return (
            <div className={'key-points-container'}>
                <h2>Key Points</h2>
                <ImageGridCV>
                    <ImageCV url={"/img/cv_image_1.jpg"} alt={'test image'}/>
                </ImageGridCV>
            </div>
        );
    }
}

export default connect(s => s)(KeyPoints)
