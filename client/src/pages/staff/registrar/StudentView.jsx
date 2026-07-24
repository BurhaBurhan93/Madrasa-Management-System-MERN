import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { studentProfilesConfig } from './StudentProfiles';

const mapRowToView = (row) => ({
  ...row,
  permanentAddress_province: row.permanentAddress?.province || '',
  permanentAddress_district: row.permanentAddress?.district || '',
  permanentAddress_village: row.permanentAddress?.village || '',
  currentAddress_province: row.currentAddress?.province || '',
  currentAddress_district: row.currentAddress?.district || '',
  currentAddress_village: row.currentAddress?.village || '',
  email: row.email || row.user?.email || '',
  phone: row.phone || row.user?.phone || '',
  image: row.image || row.user?.image || ''
});

const StudentView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();

  const viewFields = studentProfilesConfig.formFields.map(field => ({
    name: field.name,
    label: t(`registrar.studentProfiles.fields.${field.name}`),
    renderView: field.name === 'image'
      ? (value, item) => {
          const imgSrc = value || item?.user?.image;
          return imgSrc
            ? <img src={imgSrc} alt={t('registrar.studentProfiles.view.profileAlt')} className="h-24 w-24 rounded-lg object-cover border border-slate-200" />
            : '-';
        }
      : undefined
  }));

  return (
    <RecordViewPage
      title={t('registrar.studentProfiles.view.title')}
      endpoint={studentProfilesConfig.endpoint}
      id={id}
      fields={viewFields}
      listPath="/staff/registrar/students"
      editPath={`/staff/registrar/students/edit/${id}`}
      readMode="collection"
      mapRowToView={mapRowToView}
    />
  );
};

export default StudentView;
