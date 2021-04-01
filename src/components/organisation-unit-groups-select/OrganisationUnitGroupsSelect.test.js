/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';

// Material UI
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import OrganisationUnitGroupsSelect from './OrganisationUnitGroupsSelect';

jest.mock('d2-ui/lib/org-unit-tree/OrgUnitTree.component', () => ('OrgUnitTree'));

const ownShallow = () => {
  const onChange = jest.fn();
  return shallow(
      <OrganisationUnitGroupsSelect onChange={onChange} />,
      {
        disableLifecycleMethods: true,
        context: {
          d2: {},
        }
      }
  );
};

it('OrganisationUnitGroupsSelect renders without crashing', () => {
  ownShallow();
});

it('OrganisationUnitGroupsSelect renders SelectField component', () => {
  const wrapper = ownShallow();
  expect(wrapper.find(SelectField)).toHaveLength(1);
});

it('OrganisationUnitGroupsSelect renders Select All option', () => {
  const wrapper = ownShallow();
  expect(wrapper.find(MenuItem)).toHaveLength(1);
});

it('OrganisationUnitGroupsSelect renders correct number of select options', () => {
  const wrapper = ownShallow();
  const fakeOrganisationUnitGroups = [
    { id: 'organisation Unit Group 1', displayName: 'organisation Unit Group 1' },
    { id: 'organisation Unit Group 2', displayName: 'organisation Unit Group 2' },
  ];
  wrapper.setState({organisationUnitGroups: fakeOrganisationUnitGroups});
  expect(wrapper.find(MenuItem)).toHaveLength(fakeOrganisationUnitGroups.length);
});