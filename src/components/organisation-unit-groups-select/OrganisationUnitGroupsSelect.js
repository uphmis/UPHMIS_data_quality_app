import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Material UI
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

/* i18n */
import i18n from '../../locales';
import { i18nKeys } from '../../i18n';

export const ALL_ORGANISATION_UNIT_GROUPS_ID = -1;
export const ALL_ORGANISATION_UNIT_GROUPS_OPTION = {
    id: ALL_ORGANISATION_UNIT_GROUPS_ID,
    displayName: i18nKeys.organisationUnitGroupsSelect.allOrganisationUnitGroupsOption,
};

class OrganisationUnitGroupsSelect extends PureComponent {
    static propTypes = {
        style: PropTypes.object,
        onChange: PropTypes.func.isRequired,
    }

    static defaultProps = {
        style: {},
    }

    static contextTypes = {
        d2: PropTypes.object,
    }

    constructor() {
        super();

        this.state = {
            organisationUnitGroups: [ALL_ORGANISATION_UNIT_GROUPS_OPTION],
            selected: ALL_ORGANISATION_UNIT_GROUPS_ID,
        };

        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        // const d2 = this.context.d2;
        const api = this.context.d2.Api.getApi();
        const translatedAllOrganisationUnitGroupsOption = ALL_ORGANISATION_UNIT_GROUPS_OPTION;
        translatedAllOrganisationUnitGroupsOption.displayName = i18n.t(ALL_ORGANISATION_UNIT_GROUPS_OPTION.displayName);
        //@Sou groups fixed to chc,phc,sc,dh
        api.get('organisationUnitGroups?filter=id:in:[gBerHA2rUH0,UBuxUMmdz1U,nIVbiyAyRrb,JRLIvJzK4H0]&fields=id,displayName').then((organisationUnitGroupsResponse) => {
            this.setState({
                organisationUnitGroups: [translatedAllOrganisationUnitGroupsOption, ...organisationUnitGroupsResponse.organisationUnitGroups],
            });
        }).catch(() => { this.manageError(); });
    }

    onChange(event, index, value) {
        this.setState({
            selected: value,
            selectedName: value === ALL_ORGANISATION_UNIT_GROUPS_ID ?
                i18nKeys.organisationUnitGroupsSelect.allOrganisationUnitGroupsOption :
                this.state.organisationUnitGroups[index].displayName,
        });

        this.props.onChange(event, index, value);
    }

    render() {
        return (
            <SelectField
                style={this.props.style}
                floatingLabelText={
                    i18n.t(i18nKeys.organisationUnitGroupsSelect.organisationUnitGroupsLabel)
                }
                onChange={this.onChange}
                value={this.state.selected}
            >
                {this.state.organisationUnitGroups.map(item => (
                    <MenuItem
                        key={item.id}
                        value={item.id}
                        primaryText={item.displayName}
                    />
                ))
                }
            </SelectField>
        );
    }
}

export default OrganisationUnitGroupsSelect;
