import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import {
  FiEdit2, FiSave, FiX, FiMapPin, FiPhone, FiMail, FiGlobe,
  FiUser, FiCalendar, FiHash, FiUsers, FiInfo, FiUpload
} from 'react-icons/fi';
import { setCachedMadrasaInfo, normalizeLogoUrl } from '../../lib/madrasaInfo';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const AdminMadrasaInfo = () => {
  const { t } = useTranslation('admin');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const onLanguageChanged = () => forceUpdate(n => n + 1);
    i18n.on('languageChanged', onLanguageChanged);
    return () => i18n.off('languageChanged', onLanguageChanged);
  }, []);

  const FileField = ({ label, icon, value, name, type = 'text', options, editing, form, handleChange }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
      {icon && <span className="inline-flex mr-1 align-middle">{icon}</span>}{label}
    </label>
    {editing ? (
      type === 'select' ? (
        <select
          name={name}
          value={form[name]}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-cyan-500 focus:outline-none"
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={form[name]}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-cyan-500 focus:outline-none resize-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-cyan-500 focus:outline-none"
        />
      )
    ) : (
      <p className="text-sm text-slate-800 py-2">{value || <span className="text-slate-400 italic">{t('madrasaInfo.notSet')}</span>}</p>
    )}
  </div>
);

const Section = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">{icon}</span>
      <h3 className="font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
  </div>
);
  const [info, setInfo] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoErrored, setLogoErrored] = useState(false);

  useEffect(() => { fetchInfo(); }, []);

  useEffect(() => {
    setLogoErrored(false);
  }, [editing ? normalizeLogoUrl(logoPreview || form.logo) : normalizeLogoUrl(info?.logo)]);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/madrasa-info`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) {
        throw new Error(t('madrasaInfo.failedToLoad'));
      }
      const data = await res.json();
      setInfo(data);
      setForm(flattenInfo(data));
      setLogoPreview(data?.logo || '');
      setCachedMadrasaInfo(data);
    } catch {
      setError(t('madrasaInfo.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const flattenInfo = (d = {}) => ({
    name: d.name || '',
    nameArabic: d.nameArabic || '',
    code: d.code || '',
    type: d.type || 'madrasa',
    phone: d.phone || '',
    whatsapp: d.whatsapp || '',
    email: d.email || '',
    website: d.website || '',
    province: d.address?.province || '',
    district: d.address?.district || '',
    village: d.address?.village || '',
    fullAddress: d.address?.fullAddress || '',
    principalName: d.principalName || '',
    principalPhone: d.principalPhone || '',
    establishedYear: d.establishedYear || '',
    registrationNumber: d.registrationNumber || '',
    totalCapacity: d.totalCapacity || '',
    description: d.description || '',
    logo: d.logo || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'logo') {
      setLogoPreview(value);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('madrasaInfo.selectImage'));
      return;
    }

    setError('');
    setLogoUploading(true);

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    try {
      const body = new FormData();
      body.append('image', file);
      body.append('category', 'madrasa-logo');

      const res = await fetch(`${API_BASE}/uploads/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(t('madrasaInfo.uploadFailed'));
      }

      const uploadedUrl = new URL(data.data.url, API_BASE).toString();
      setForm(prev => ({ ...prev, logo: uploadedUrl }));
      setLogoPreview(uploadedUrl);
    } catch (uploadError) {
      setError(uploadError.message || t('madrasaInfo.uploadFailed'));
      setLogoPreview(info?.logo || '');
    } finally {
      setLogoUploading(false);
      URL.revokeObjectURL(previewUrl);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        nameArabic: form.nameArabic,
        code: form.code,
        type: form.type,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        website: form.website,
        address: {
          province: form.province,
          district: form.district,
          village: form.village,
          fullAddress: form.fullAddress,
        },
        principalName: form.principalName,
        principalPhone: form.principalPhone,
        establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
        registrationNumber: form.registrationNumber,
        totalCapacity: form.totalCapacity ? Number(form.totalCapacity) : undefined,
        description: form.description,
        logo: form.logo,
      };
      const res = await fetch(`${API_BASE}/admin/madrasa-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setInfo(updated);
      setForm(flattenInfo(updated));
      setCachedMadrasaInfo(updated);
      setEditing(false);
    } catch {
      setError(t('madrasaInfo.failedToSave'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('madrasaInfo.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('madrasaInfo.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setForm(flattenInfo(info)); setError(''); }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <FiX size={16} /> {t('madrasaInfo.cancel')}
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-cyan-600 hover:to-sky-700 disabled:opacity-60">
                <FiSave size={16} /> {saving ? t('madrasaInfo.saving') : t('madrasaInfo.saveChanges')}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-cyan-600 hover:to-sky-700">
              <FiEdit2 size={16} /> {t('madrasaInfo.editInformation')}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Identity Card */}
      <div className="bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex-shrink-0">
            {(editing ? (logoPreview || form.logo) : info?.logo) && !logoErrored ? (
              <img
                key={normalizeLogoUrl(editing ? (logoPreview || form.logo) : info.logo)}
                src={normalizeLogoUrl(editing ? (logoPreview || form.logo) : info.logo)}
                alt={t('madrasaInfo.madrasaLogo')}
                className="h-24 w-24 rounded-2xl object-cover border-2 border-white/40 bg-white/20"
                onError={() => setLogoErrored(true)}
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold border-2 border-white/40">
                {(form.name || info?.name || t('common.shortNameFallback') || 'M')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200 mb-1">
              {info?.code || form.code || t('madrasaInfo.emisShortName')}
            </p>
            <h2 className="text-2xl font-bold truncate">{info?.name || t('madrasaInfo.madrasaName')}</h2>
            {info?.nameArabic && <p className="text-lg text-cyan-100 mt-0.5 font-arabic">{info.nameArabic}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-cyan-100">
              {info?.address?.fullAddress && (
                <span className="flex items-center gap-1.5"><FiMapPin size={14} />{info.address.fullAddress}</span>
              )}
              {info?.phone && <span className="flex items-center gap-1.5"><FiPhone size={14} />{info.phone}</span>}
              {info?.email && <span className="flex items-center gap-1.5"><FiMail size={14} />{info.email}</span>}
            </div>
          </div>
          {info?.establishedYear && (
            <div className="text-center bg-white/15 rounded-xl px-5 py-3 border border-white/20">
              <p className="text-2xl font-bold">{info.establishedYear}</p>
              <p className="text-xs text-cyan-200">{t('madrasaInfo.established')}</p>
            </div>
          )}
        </div>
        {editing && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <label className="block text-xs font-semibold text-cyan-100 mb-1.5 uppercase tracking-wide">
              <FiUpload className="inline mr-1" size={12} />{t('madrasaInfo.uploadLogoUrl')}
            </label>
            <input
              type="url"
              name="logo"
              value={form.logo}
              onChange={handleChange}
              placeholder={t('madrasaInfo.logoPlaceholder')}
              className="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 focus:border-white/60 focus:outline-none"
            />
            <div className="mt-3">
              <label className="block text-xs font-semibold text-cyan-100 mb-1.5 uppercase tracking-wide">
                {t('madrasaInfo.uploadLogoFile')}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-cyan-700 hover:file:bg-cyan-50"
              />
              <p className="mt-2 text-xs text-cyan-100/80">
                {t('madrasaInfo.uploadImageHint')}
              </p>
              {logoUploading && (
                <p className="mt-2 text-xs font-medium text-cyan-100">{t('madrasaInfo.uploadingLogo')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <Section title={t('madrasaInfo.basicInformation')} icon={<FiInfo size={18} />}>
        <FileField label={t('madrasaInfo.institutionName')} icon={<FiInfo size={13} />} name="name" value={info?.name} editing={editing} form={form} handleChange={handleChange} />
        <FileField label={t('madrasaInfo.arabicName')} icon={<FiInfo size={13} />} name="nameArabic" value={info?.nameArabic} editing={editing} form={form} handleChange={handleChange} />
        <FileField label={t('madrasaInfo.institutionCode')} icon={<FiHash size={13} />} name="code" value={info?.code} editing={editing} form={form} handleChange={handleChange} />
        <FileField label={t('madrasaInfo.institutionType')} icon={<FiInfo size={13} />} name="type" value={info?.type} editing={editing} form={form} handleChange={handleChange}
          type="select" options={[
            { value: 'madrasa', label: t('madrasaInfo.madrasa') },
            { value: 'school', label: t('madrasaInfo.school') },
            { value: 'institute', label: t('madrasaInfo.institute') },
            { value: 'university', label: t('madrasaInfo.university') },
          ]} />
        <FileField label={t('madrasaInfo.registrationNumber')} icon={<FiHash size={13} />} name="registrationNumber" value={info?.registrationNumber} editing={editing} form={form} handleChange={handleChange} />
        <FileField label={t('madrasaInfo.establishedYear')} icon={<FiCalendar size={13} />} name="establishedYear" type="number" value={info?.establishedYear} editing={editing} form={form} handleChange={handleChange} />
        <FileField label={t('madrasaInfo.totalCapacity')} icon={<FiUsers size={13} />} name="totalCapacity" type="number" value={info?.totalCapacity} editing={editing} form={form} handleChange={handleChange} />
        <div className="md:col-span-2">
          <FileField label={t('common.description')} icon={<FiInfo size={13} />} name="description" type="textarea" value={info?.description} editing={editing} form={form} handleChange={handleChange} />
        </div>
      </Section>

      {/* Contact Info */}
      <Section title={t('madrasaInfo.contactInformation')} icon={<FiPhone size={18} />}>
        <FileField label={t('madrasaInfo.phone')} icon={<FiPhone size={13} />} name="phone" type="tel" value={info?.phone} editing={editing} form={form} handleChange={handleChange} />
        <FileField label={t('madrasaInfo.whatsapp')} icon={<FiPhone size={13} />} name="whatsapp" type="tel" value={info?.whatsapp} editing={editing} form={form} handleChange={handleChange} />
        <FileField label={t('madrasaInfo.email')} icon={<FiMail size={13} />} name="email" type="email" value={info?.email} editing={editing} form={form} handleChange={handleChange} />
        <FileField label={t('madrasaInfo.website')} icon={<FiGlobe size={13} />} name="website" type="url" value={info?.website} editing={editing} form={form} handleChange={handleChange} />
      </Section>

      {/* Address */}
      <Section title={t('madrasaInfo.addressInfo')} icon={<FiMapPin size={18} />}>
        <FileField label={t('madrasaInfo.province')} icon={<FiMapPin size={13} />} name="province" value={info?.address?.province} editing={editing} form={form} handleChange={handleChange} />
        <FileField label={t('madrasaInfo.district')} icon={<FiMapPin size={13} />} name="district" value={info?.address?.district} editing={editing} form={form} handleChange={handleChange} />
        <FileField label={t('madrasaInfo.villageArea')} icon={<FiMapPin size={13} />} name="village" value={info?.address?.village} editing={editing} form={form} handleChange={handleChange} />
        <FileField label={t('madrasaInfo.fullAddress')} icon={<FiMapPin size={13} />} name="fullAddress" value={info?.address?.fullAddress} editing={editing} form={form} handleChange={handleChange} />
      </Section>

      {/* Principal Info */}
      <Section title={t('madrasaInfo.principalInformation')} icon={<FiUser size={18} />}>
        <FileField label={t('madrasaInfo.principalName')} icon={<FiUser size={13} />} name="principalName" value={info?.principalName} editing={editing} form={form} handleChange={handleChange} />
        <FileField label={t('madrasaInfo.principalPhone')} icon={<FiPhone size={13} />} name="principalPhone" type="tel" value={info?.principalPhone} editing={editing} form={form} handleChange={handleChange} />
      </Section>

      {info?.updatedBy?.name && (
        <p className="text-xs text-slate-400 text-right">
          {t('madrasaInfo.lastUpdatedBy')} <span className="font-medium text-slate-500">{info.updatedBy.name}</span>
          {info.updatedAt && <> · {new Date(info.updatedAt).toLocaleDateString()}</>}
        </p>
      )}
    </div>
  );
};

export default AdminMadrasaInfo;
