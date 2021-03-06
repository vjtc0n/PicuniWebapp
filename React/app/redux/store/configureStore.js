import {createStore, applyMiddleware, compose} from 'redux';
import devTools from 'remote-redux-devtools';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { routerMiddleware } from 'react-router-redux'
import {hashHistory} from 'react-router';
import * as asyncInitialState from 'redux-async-initial-state';

const loggerMiddleware = createLogger();
const routingMiddleware = routerMiddleware(hashHistory)
/**
 * ## Reducer
 * The reducers contains the all reducers
 */
import rootReducer from '../reducers/index';

/*
*
* Trying to load old data from LocalStorage
* If the old accessToken's still valid from Facebook, keep using it
* If not, get new accessToken from Facebook
*
* */

const loadStore = (currentState) => {
    var localState = JSON.parse(localStorage.getItem('profile'));
    console.log(localState)
    if (localState != null) {
        return new Promise(resolve => {
            fetch('https://graph.facebook.com/app?access_token=' + localState.accessToken.id)
                .then(response => response.json())
                .then(json => {
                    if (typeof json.error == 'undefined'){
                        resolve({
                            ...currentState,
                            profile: localState
                        })
                    } else {
                        resolve({
                            ...currentState,
                            profile: {
                                accessToken: {
                                    id: '',
                                    ttl: 0,
                                    userId: ''
                                },
                                user: {
                                    username: '',
                                    email: '',
                                    userId: ''
                                },
                                error: ''
                            }
                        })
                    }
                });
        });
    } else {
        return currentState
    }
}

/*
*
* Loading the Redux Store
*
* */

export default function configureStore(initialState) {
    const enhancer = compose(
        applyMiddleware(thunkMiddleware, loggerMiddleware, routingMiddleware),
        devTools(),
        window.devToolsExtension ? window.devToolsExtension() : f => f
    );
    const store = createStore(rootReducer, initialState, enhancer);
    if (module.hot) {
        module.hot.accept(() => {
            const nextRootReducer = require('../reducers/index').default;
            store.replaceReducer(nextRootReducer);
        });
    }
    devTools.updateStore(store);

    return store
}