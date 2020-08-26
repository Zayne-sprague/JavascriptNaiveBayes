import React, { Component } from 'react';
import _ from 'lodash'
import {set_control} from "src/reducers/reducers";
import {connect} from "react-redux";
import {fetch_data, set_docs} from "../reducers/docs";
import {create_bow_matrix, create_label_array, create_model, create_model_vocab} from "../reducers/bow";
import {build_feature_vectors, calculate_biases, create_nb_model, test_new_doc} from "../reducers/naivebayes";

class Naivebayes extends Component {

    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }

    componentDidMount(){
        const { dispatch } = this.props;
        dispatch(fetch_data("spam",set_docs.bind(this)))

    }

    render() {
        const { controls } = this.props;
        return (
            <div>
                <h2>Home</h2>
                {_.get(controls, 'test_text', 'none')}

                <button onClick={this.onPress.bind(this)}>Press ME!</button>

                <input type="text" name="name" value={this.state.value} onChange={this.handleChange} />

                <button onClick={this.onTest.bind(this)}>TEST</button>
            </div>
        );
    }

    onPress(){
        const { dispatch } = this.props;
        dispatch(set_control({'test_text': _.get(this.props, 'controls.test_text', '') + 'a'}))

        dispatch(create_model("test"));
        dispatch(create_nb_model("nb"));

        const vocab = _.get(dispatch(create_model_vocab("test", _.get(this.props, 'docs.docs'))), 'vocab', {});
        const labels = _.get(dispatch(create_label_array("test", _.get(this.props, 'docs.docs'))), 'labels', {});
        const bow_model = _.get(dispatch(create_bow_matrix("test", _.get(this.props, 'docs.docs'), vocab)), 'matrix', {});

        const biases = _.get(dispatch(calculate_biases("nb", labels)), 'biases', {})

        dispatch(build_feature_vectors("nb", bow_model, biases))

    }

    onTest(){
        const { naivebayes, bow} = this.props;
        const features = _.get(naivebayes, 'models.nb.feature_vectors');
        const vocab = _.get(bow, 'models.test.vocab');

        const doc = this.state.value || 'Had your mobile 11 months or more? U R entitled to Update to the latest colour mobiles with camera for Free! Call The Mobile Update Co FREE on 08002986030'
        console.log(test_new_doc(doc, vocab, features) === 0 ? "NOT SPAM" : "SPAM");
    }
}

export default connect(s => s)(Naivebayes)
