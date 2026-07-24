import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { getSuppliersConfig } from './Suppliers';

const SuppliersEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const config = getSuppliersConfig(t);
  return <FormPage titleCreate={t('kitchen.suppliers.titleCreate', 'Create Supplier')} titleEdit={t('kitchen.suppliers.titleEdit', 'Edit Supplier')} endpoint={config.endpoint} formFields={config.formFields} initialForm={config.initialForm} mapRowToForm={config.mapRowToForm} mapFormToPayload={config.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/kitchen/suppliers" readMode="collection" readEndpoint={config.endpoint} />;
};

export default SuppliersEdit;
