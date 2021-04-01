// React
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, withRouter } from 'react-router-dom';

// D2
import { getManifest, getUserSettings } from 'd2/lib/d2';
import D2UIApp from 'd2-ui/lib/app/D2UIApp';

// logging
import log from 'loglevel';

/* i18n */
import { configI18n } from './configI18n';

import './index.css';
import App from './App';
import appTheme from './theme';

import registerServiceWorker from './registerServiceWorker';

const AppComponent = withRouter(App);

log.setLevel(process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.DEBUG);

const configurations = (userSettings) => {
    const uiLocale = userSettings.keyUiLocale;
    sessionStorage.setItem('uiLocale', uiLocale || 'en');

    configI18n(userSettings);
};

// init d2
getManifest('manifest.webapp').then((manifest) => {
    const api = process.env.REACT_APP_DHIS2_API_VERSION ? `/${process.env.REACT_APP_DHIS2_API_VERSION}` : '/';
    const baseUrl =
      process.env.NODE_ENV === 'production'
          ? `${manifest.getBaseUrl()}/api/${manifest.dhis2.apiVersion}`
          : `${process.env.REACT_APP_DHIS2_BASE_URL}/api${api}`;

    ReactDOM.render(
        <D2UIApp
            muiTheme={appTheme}
            initConfig={{
                baseUrl,
                schemas: [
                    'organisationUnit',
                    'dataSet',
                    'validationRuleGroup',
                ],
            }}
        >
            <HashRouter>
                <AppComponent />
            </HashRouter>
        </D2UIApp>,
        document.getElementById('app'),
    );
}).then(getUserSettings).then(configurations);

registerServiceWorker();
