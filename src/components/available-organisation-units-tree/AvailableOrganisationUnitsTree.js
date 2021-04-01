import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import OrgUnitTree from 'd2-ui/lib/org-unit-tree/OrgUnitTree.component';

/* i18n */
import i18n from '../../locales';
import { i18nKeys } from '../../i18n';

import styles from './AvailableOrganisationUnitsTree.css';

class AvailableOrganisationUnitsTree extends PureComponent {
  static contextTypes = {
      d2: PropTypes.object,
  }

  static propTypes = {
      onChange: PropTypes.func,
  }

  static defaultProps = {
      onChange: null,
  }

  constructor() {
      super();

      this.state = {
          selected: [],
          rootWithMember: null,
      };

      this.handleOrgUnitClick = this.handleOrgUnitClick.bind(this);
  }

  componentDidMount() {
      const d2 = this.context.d2;
      if (this.state.rootWithMember == null) {
          /*
          // const api = this.context.d2.Api.getApi();
          // api.get('me?fields=id,name,organisationUnits[id,name]&paging=false').then((meResponse) => {
          // const userOrgUnit = meResponse.organisationUnits[0].id;

          const orgUnitApi = 'organisationUnits/N5WWbRtsjWp/?fields=id,displayName,path,children::isNotEmpty,memberCount&paging=false';
          api.get(orgUnitApi).then((orgResponse) => {
              const organisationUnits = orgResponse.organisationUnit;
              this.setState({
                  rootWithMembers: organisationUnits[0],
              });
          }).catch(() => { this.manageError(); });

          // }).catch(() => { this.manageError(); });
          */
          d2.models.organisationUnits.list({
              paging: false,
              level: 1,
              fields: 'id,displayName,path,children::isNotEmpty,memberCount',
          }).then((organisationUnitsResponse) => {
              const organisationUnits = organisationUnitsResponse.toArray();
              this.setState({
                  rootWithMembers: organisationUnits[0],
              });
          }).catch(() => { this.manageError(); });
      }
  }

  handleOrgUnitClick(event, orgUnit) {
      if (!this.state.selected.includes(orgUnit.path)) {
          this.setState({ selected: [orgUnit.path] });
          if (this.props.onChange) {
              const selectedOrganisationUnitSplitted = orgUnit.path.split('/');
              const selectedOrganisationUnitId =
                selectedOrganisationUnitSplitted[selectedOrganisationUnitSplitted.length - 1];
              this.props.onChange(selectedOrganisationUnitId);
          }
      }
  }

  render() {
      if (this.state.rootWithMembers) {
          return (
              <div className={styles.tree}>
                  <OrgUnitTree
                      hideMemberCount={Boolean(true)}
                      root={this.state.rootWithMembers}
                      selected={this.state.selected}
                      initiallyExpanded={[`/${this.state.rootWithMembers.id}`]}
                      onSelectClick={this.handleOrgUnitClick}
                  />
              </div>
          );
      }

      return <span>{i18n.t(i18nKeys.availableOrganisationUnitsTree.updatingMessage)}</span>;
  }
}

export default AvailableOrganisationUnitsTree;
