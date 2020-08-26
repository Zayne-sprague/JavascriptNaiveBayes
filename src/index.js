import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { Route } from 'react-router'

import NaiveBayes from "./playgrounds/nlp/layouts/naivebayes";
import configureStore from "./store/configureStore";
import KeyPoints from "./playgrounds/computer-vision/layouts/key-points";

const store = configureStore()
window.store = store;

ReactDOM.render(
    <Provider store={store}>
        <HashRouter basename={'#'}>
            <Route path={'/'} component={App}>
                <Route path={'/naive-bayes'} component={NaiveBayes}/>
                <Route path={'/nlp/key-points'} component={KeyPoints}/>
            </Route>
        </HashRouter>
    </Provider>
    ,

    document.getElementById('app')
);
