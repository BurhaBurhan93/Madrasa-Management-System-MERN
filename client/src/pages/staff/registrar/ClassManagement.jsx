import React from 'react';
import ListPage from '../shared/ListPage';
import classManagementConfig from './classManagementConfig';

const ClassManagement = () => (
  <ListPage
    eyebrow="Registrar"
    title={classManagementConfig.title}
    subtitle={classManagementConfig.subtitle}
    endpoint={classManagementConfig.endpoint}
    columns={classManagementConfig.columns}
    createPath={classManagementConfig.createPath}
    editPathForRow={classManagementConfig.editPathForRow}
    viewPathForRow={classManagementConfig.viewPathForRow}
    searchPlaceholder="Search classes by name or code..."
    clientSidePagination={true}
    enableExport={true}
  />
);

export default ClassManagement;
