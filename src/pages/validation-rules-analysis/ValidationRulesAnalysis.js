import React from 'react';
import classNames from 'classnames';

// Material UI
import { Card, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';
import Checkbox from 'material-ui/Checkbox';
import { FontIcon, IconButton } from 'material-ui';

import { SUCCESS } from 'd2-ui/lib/feedback-snackbar/FeedbackSnackbarTypes';

import Page from '../Page';
import AlertBar from '../../components/alert-bar/AlertBar';
import ValidationRuleGroupsSelect, {
    ALL_VALIDATION_RULE_GROUPS_ID, SELECTED_ORGUNIT_ID,
} from
    '../../components/validation-rule-groups-select/ValidationRuleGroupsSelect';

import OrganisationUnitGroupsSelect, {
    ALL_ORGANISATION_UNIT_GROUPS_ID,
} from
    '../../components/organisation-unit-groups-select/OrganisationUnitGroupsSelect';

import AvailableOrganisationUnitsTree from
    '../../components/available-organisation-units-tree/AvailableOrganisationUnitsTree';
import PageHelper from '../../components/page-helper/PageHelper';
import { getDocsKeyForSection } from '../sections.conf';

/* i18n */
import i18n from '../../locales';
import { i18nKeys } from '../../i18n';

// styles
import jsPageStyles from '../PageStyles';
import cssPageStyles from '../Page.css';
import ValidationRulesAnalysisTable from './validation-rules-analysis-table/ValidationRulesAnalysisTable';

import { apiConf } from '../../server.conf';
import { convertDateToApiDateFormat } from '../../helpers/dates';

// let selectedOrgUnitId;
class ValidationRulesAnalysis extends Page {
    static STATE_PROPERTIES = [
        'loading',
        'elements',
        'showTable',
    ];

    constructor() {
        super();
        /*
        const api = this.context.d2.Api.getApi();
        api.get('me?fields=id,name,organisationUnits[id,name]&paging=false').then((meResponse) => {
            selectedOrgUnitId = meResponse.organisationUnits[0].id;
            // const selectedOrgUnitName = meResponse.organisationUnits[0].id;
            // this.organisationUnitOnChange(selectedOrgUnitId);
        }).catch(() => { this.manageError(); });
        */
        this.state = {
            showTable: false,
            startDate: new Date(),
            endDate: new Date(),
            organisationUnitId: null,
            validationRuleGroupId: ALL_VALIDATION_RULE_GROUPS_ID,
            organisationUnitGroupId: ALL_ORGANISATION_UNIT_GROUPS_ID,
            notification: false,
            persist: false,
            elements: [],
            loading: false,
            accessOrgUnitTree:  false,
        };

        this.validate = this.validate.bind(this);
        this.back = this.back.bind(this);

        this.startDateOnChange = this.startDateOnChange.bind(this);
        this.endDateOnChange = this.endDateOnChange.bind(this);
        this.organisationUnitOnChange = this.organisationUnitOnChange.bind(this);
        this.validationRuleGroupOnChange = this.validationRuleGroupOnChange.bind(this);
        this.organisationUnitGroupOnChange = this.organisationUnitGroupOnChange.bind(this);
        this.updateSendNotifications = this.updateSendNotifications.bind(this);
        this.updatePersistNewResults = this.updatePersistNewResults.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const nextState = {};

        Object.keys(nextProps).forEach((property) => {
            if (nextProps.hasOwnProperty(property) && ValidationRulesAnalysis.STATE_PROPERTIES.includes(property)) {
                nextState[property] = nextProps[property];
            }
        });

        this.getSelectedOrgUnit();
        if (nextState !== {}) {
            this.setState(nextState);
        }
    }

    static generateElementKey = e =>
        `${e.validationRuleId}-${e.periodId}-${e.organisationUnitId}`;

    static convertElementFromApiResponse = e => ({
        key: ValidationRulesAnalysis.generateElementKey(e),
        validationRuleId: e.validationRuleId,
        organisation: e.organisationUnitDisplayName,
        organisationUnitId: e.organisationUnitId,
        period: e.periodDisplayName,
        periodId: e.periodId,
        importance: e.importance,
        validationRule: e.validationRuleDescription,
        leftValue: e.leftSideValue,
        operator: e.operator,
        rightValue: e.rightSideValue,
    });

    validate() {
        const api = this.context.d2.Api.getApi();
        if (this.isFormValid()) {
            const firstDay = new Date(this.state.startDate.getFullYear(), this.state.startDate.getMonth(),2);
            const dateend = new Date(convertDateToApiDateFormat(this.state.endDate));
            //@Sou fix last day of selected month
            const lastDayOfMonth = new Date(dateend.getFullYear(), dateend.getMonth()+1, 1);
            const request = {
                startDate: convertDateToApiDateFormat(firstDay),
                endDate: convertDateToApiDateFormat(lastDayOfMonth),
                ou: this.state.organisationUnitId,
                notification: this.state.notification,
                persist: this.state.persist,
            };

            if (this.state.validationRuleGroupId !== ALL_VALIDATION_RULE_GROUPS_ID) {
                request.vrg = this.state.validationRuleGroupId;
            }

            if (this.state.organisationUnitGroupId !== ALL_ORGANISATION_UNIT_GROUPS_ID) {
                request.orgUnitGroup = this.state.organisationUnitGroupId;
            }

            this.context.updateAppState({
                pageState: {
                    loading: true,
                },
            });

            api.post(apiConf.endpoints.validationRulesAnalysis, { ...request }).then((response) => {
                if (this.isPageMounted()) {
                    const elements = response.map(ValidationRulesAnalysis.convertElementFromApiResponse);
                    const feedback = elements && elements.length > 0 ? {
                        showSnackbar: false,
                    } : {
                        showSnackbar: true,
                        snackbarConf: {
                            type: SUCCESS,
                            message: i18n.t(i18nKeys.messages.validationSuccess),
                        },
                    };
                    this.context.updateAppState({
                        ...feedback,
                        pageState: {
                            loading: false,
                            elements,
                            showTable: elements && elements.length > 0,
                        },
                    });
                }
            }).catch(() => { this.manageError(); });
        }
    }

    back() {
        this.setState({ showTable: false });
    }

    startDateOnChange(event, date) {
        this.setState({ startDate: new Date(date) });
    }

    endDateOnChange(event, date) {
        this.setState({ endDate: new Date(date) });
    }

    organisationUnitOnChange(organisationUnitId) {
        this.setState({ organisationUnitId });
    }

    validationRuleGroupOnChange(event, index, value) {
        //@Sou fix orggroup based upon validation selection
        if (value=='MIJs1ZGgH5Y')
        {
            this.setState({ organisationUnitGroupId: 'gBerHA2rUH0' });
        }
        else if (value=='Igz5s6k6ESZ')
        {
            this.setState({ organisationUnitGroupId: 'UBuxUMmdz1U' });
        }
        else if (value=='UXjTH8Uw3Ca')
        {
            this.setState({ organisationUnitGroupId: 'nIVbiyAyRrb' });
        }
        else if (value=='t6jn5LLxzDz')
        {
            this.setState({ organisationUnitGroupId: 'JRLIvJzK4H0' });
        }
        else
        {
            this.setState({ organisationUnitGroupId: ALL_ORGANISATION_UNIT_GROUPS_ID });
        }

        this.setState({ validationRuleGroupId: value });
    }

    organisationUnitGroupOnChange(event, index, value) {
        this.setState({ organisationUnitGroupId: value });
    }

    updateSendNotifications(event, checked) {
        this.setState({ notification: checked });
    }

    updatePersistNewResults(event, checked) {
        this.setState({ persist: checked });
    }

    showAlertBar() {
        return this.state.showTable &&
            this.state.elements &&
            this.state.elements.length >= apiConf.results.analysis.limit;
    }

    isFormValid() {
        return this.state.startDate &&
            this.state.endDate &&
            this.state.organisationUnitId;
    }

    isActionDisabled() {
        return !this.isFormValid() || this.state.loading;
    }

    getValidationRuleList() {
        const resourceName = 'Validation Rules List';
        const api = this.context.d2.Api.getApi();
        api.get(`documents?filter=name:like:${resourceName}&fields=id,name,url&paging=false`).then((response) => {
            if (!response || response.documents.length === 0) {
                return;
            }

            window.open(response.documents[0].url, '_blank');
        });
    }
    
    getSelectedOrgUnit() {
        const api = this.context.d2.Api.getApi();
        //id,displayName,userCredentials[username,userRoles[id,displayName,programs,authorities]]
        api.get('me?fields=id,displayName,userCredentials[username,userRoles[id,displayName,programs,authorities]],organisationUnits[id,displayName,level]&paging=false').then((meResponse) => {
            const selectedOrgUnitId = meResponse.organisationUnits[0].id;
            // const selectedOrgUnitName = meResponse.organisationUnits[0].displayName;
            //@Sou enable tree for level=2,3
            const selectedOrgLevel = meResponse.organisationUnits[0].level;
            //this.organisationUnitOnChange(selectedOrgUnitId);
            // if( selectedOrgUnitName === 'Uttar Pradesh' && selectedOrgUnitId ==='v8EzhiynNtf'){
            //     this.setState({accessOrgUnitTree: true});
            // }
            if( selectedOrgLevel=='2' || selectedOrgLevel=='3'){
                this.setState({accessOrgUnitTree: true});
            }
            else{
                this.organisationUnitOnChange(selectedOrgUnitId);
            }
        }).catch(() => { this.manageError(); });
    }

    render() {
        const accessOrgUnitTree = this.state.accessOrgUnitTree;
        return (
            <div>
                <h1 className={cssPageStyles.pageHeader}>
                    <IconButton
                        onClick={this.back}
                        style={{ display: this.state.showTable ? 'inline' : 'none' }}
                    >
                        <FontIcon className={'material-icons'}>
                            arrow_back
                        </FontIcon>
                    </IconButton>
                    {i18n.t(i18nKeys.validationRulesAnalysis.header)}
                    <PageHelper
                        sectionDocsKey={getDocsKeyForSection(this.props.sectionKey)}
                    />
                    <input type="button" value="Validation Rule List" onClick={this.getValidationRuleList.bind(this)} />
                </h1>
                <AlertBar show={this.showAlertBar()} />
                <Card>
                    <CardText style={{ display: !this.state.showTable ? 'block' : 'none' }}>
                        <div className="row">
                            <div className={classNames(accessOrgUnitTree ? 'col-md-6' : 'col-md-12', cssPageStyles.section)} style={{ display: accessOrgUnitTree ? 'block' : 'none' }}>
                                <div className={cssPageStyles.formLabel}>
                                    {i18n.t(i18nKeys.validationRulesAnalysis.form.organisationUnit)}
                                </div>
                                <AvailableOrganisationUnitsTree onChange={this.organisationUnitOnChange} />
                            </div>
                            <div className={classNames(accessOrgUnitTree ? 'col-md-6' : 'col-md-12', cssPageStyles.section)}>
                                <DatePicker
                                    id="start-date"
                                    textFieldStyle={jsPageStyles.inputForm}
                                    floatingLabelText={
                                        i18n.t(i18nKeys.validationRulesAnalysis.form.startDate)
                                    }
                                    onChange={this.startDateOnChange}
                                    value={this.state.startDate}
                                    defaultDate={new Date()}
                                    maxDate={this.state.endDate}
                                />
                                <DatePicker
                                    id="end-date"
                                    textFieldStyle={jsPageStyles.inputForm}
                                    floatingLabelText={
                                        i18n.t(i18nKeys.validationRulesAnalysis.form.endDate)
                                    }
                                    onChange={this.endDateOnChange}
                                    value={this.state.endDate}
                                    defaultDate={new Date()}
                                    minDate={this.state.startDate}
                                    maxDate={new Date()}
                                />
                                <div id="validation-rule-groups">
                                    <ValidationRuleGroupsSelect
                                        style={jsPageStyles.inputForm}
                                        onChange={this.validationRuleGroupOnChange}
                                    />
                                </div>
                                
                                {/*<div id="organisation-unit-groups">*/}
                                    {/*<OrganisationUnitGroupsSelect*/}
                                        {/*style={jsPageStyles.inputForm}*/}
                                        {/*onChange={this.organisationUnitGroupOnChange}*/}
                                    {/*/>*/}
                                {/*</div>*/}
                                <div id="send-notifications-option" style={{ display: 'none' }}>
                                    <Checkbox
                                        label={i18n.t(i18nKeys.validationRulesAnalysis.form.notification)}
                                        labelPosition="left"
                                        checked={this.state.notification}
                                        onCheck={this.updateSendNotifications}
                                    />
                                </div>
                                <div id="persist-results-option" style={{ display: 'none' }}>
                                    <Checkbox
                                        label={i18n.t(i18nKeys.validationRulesAnalysis.form.persist)}
                                        labelPosition="left"
                                        checked={this.state.persist}
                                        onCheck={this.updatePersistNewResults}
                                    />
                                </div>
                            </div>
                        </div>
                        <RaisedButton
                            id="start-analysis-button"
                            className={cssPageStyles.mainButton}
                            label={i18n.t(i18nKeys.validationRulesAnalysis.actionButton)}
                            primary
                            disabled={this.isActionDisabled()}
                            onClick={this.validate}
                        />
                    </CardText>
                    <CardText id="results-table" style={{ display: this.state.showTable ? 'block' : 'none' }}>
                        <ValidationRulesAnalysisTable elements={this.state.elements} />
                    </CardText>
                </Card>
            </div>
        );
    }
}

export default ValidationRulesAnalysis;
