import React from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import classManagementConfig from './classManagementConfig';

const ClassManagement = () => {
  const { t } = useTranslation(['staff', 'common']);
  const columns = classManagementConfig.columns.map(col => ({
    ...col,
    header: t(`registrar.classManagement.columns.${col.key}`)
  }));
  return (
    <ListPage
      eyebrow={t('registrar.classManagement.eyebrow')}
      title={t('registrar.classManagement.title')}
      subtitle={t('registrar.classManagement.subtitle')}
      endpoint={classManagementConfig.endpoint}
      columns={columns}
      createPath={classManagementConfig.createPath}
      editPathForRow={classManagementConfig.editPathForRow}
      viewPathForRow={classManagementConfig.viewPathForRow}
      searchPlaceholder={t('registrar.classManagement.searchPlaceholder')}
      clientSidePagination={true}
      enableExport={true}
    />
  );
};

export default ClassManagement;
