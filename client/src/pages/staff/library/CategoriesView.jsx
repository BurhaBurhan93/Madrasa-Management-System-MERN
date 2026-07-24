import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { libraryCategoriesConfig } from './Categories';

const CategoriesView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('library.categories.viewTitle')} subtitle={t('library.categories.subtitle')} endpoint={libraryCategoriesConfig.endpoint} id={id} fields={libraryCategoriesConfig.formFields} listPath="/staff/library/categories" editPath={`/staff/library/categories/edit/${id}`} />;
};

export default CategoriesView;
