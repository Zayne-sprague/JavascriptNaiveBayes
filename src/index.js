import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import TestComp from "./test-comp";
import configureStore from "./store/configureStore";

const store = configureStore()
window.store = store;

const renderApp = () =>
    ReactDOM.render(
        <Provider store={store}>
            <Router>
                <Switch>
                    <Route exact path={'/'} component={App} />
                    <Route path={'/test'} component={TestComp}/>
                </Switch>
            </Router>
        </Provider>
        ,

        document.getElementById('root')
    );


if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./App', renderApp)
}

renderApp();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
