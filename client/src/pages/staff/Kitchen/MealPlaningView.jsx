import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { getBudgetsConfig } from './MealPlaning';

const MealPlaningView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const config = getBudgetsConfig(t);
  return (
    <RecordViewPage
      title={t('staff.kitchen.mealPlaning.viewTitle', 'Budget Request Details')}
      subtitle={config.subtitle}
      endpoint={config.endpoint}
      id={id}
      fields={config.formFields}
      listPath="/staff/kitchen/meals"
      editPath={`/staff/kitchen/meals/edit/${id}`}
      readMode="collection"
      readEndpoint={config.endpoint}
    />
  );
};

export default MealPlaningView;
