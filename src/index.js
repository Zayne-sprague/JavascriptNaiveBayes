import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { Route } from 'react-router'

import NaiveBayes from "./playgrounds/nlp/layouts/naivebayes";
import configureStore from "./store/configureStore";
import KeyPoints from "./playgrounds/computer-vision/layouts/key-points";
import FeedforwardNetwork from "src/playgrounds/nlp/layouts/feedforward-network";

const store = configureStore()
window.store = store;

ReactDOM.render(
    <Provider store={store}>
        <HashRouter basename={'#'}>
            <Route path={'/'} component={App}>
                <Route path={'/nlp/naive-bayes'} component={NaiveBayes}/>
                <Route path={'/nlp/feedforward-network'} component={FeedforwardNetwork}/>

                <Route path={'/vision/key-points'} component={KeyPoints}/>
            </Route>
        </HashRouter>
    </Provider>
    ,

    document.getElementById('app')
);
