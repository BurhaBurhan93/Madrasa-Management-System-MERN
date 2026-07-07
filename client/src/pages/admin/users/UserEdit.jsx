import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import Card from '../../../components/UIHelper/Card';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";
import api from '../../../lib/api';

const UserEdit = () => {
  const { t } = useTranslation('admin');
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);
  const [formData, setFormData] = useState({
    name: '', fatherName: '', grandfatherName: '', email: '', password: '', role: 'student',
    phone: '', whatsapp: '', dob: '', bloodType: '', idNumber: '', image: '',
    permanentAddress: { province: '', district: '', village: '' },
    currentAddress: { province: '', district: '', village: '' },
    status: 'active'
  });
  const [imagePreview, setImagePreview] = useState(null);

  const totalSteps = 4;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t('users.imageTooLarge'));
        return;
      }
      
      // Compress image before upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          
          // Resize if too large
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height / width) * maxDim);
              width = maxDim;
            } else {
              width = Math.round((width / height) * maxDim);
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL(file.type, 0.7); // 70% quality
          
          setFormData({ ...formData, image: compressedDataUrl });
          setImagePreview(compressedDataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      const user = res.data.data;
      setFormData({
        ...user,
        password: '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        permanentAddress: user.permanentAddress || { province: '', district: '', village: '' },
        currentAddress: user.currentAddress || { province: '', district: '', village: '' }
      });
      if (user.image) setImagePreview(user.image);
    } catch (error) {
      alert(t('users.errorFetchingUser'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      await api.put(`/users/${id}`, updateData);
      alert(t('users.userUpdated'));
      navigate('/admin/users');
    } catch (error) {
      alert(error.response?.data?.message || t('users.errorUpdatingUser'));
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{t('users.step1Basic')}</h3>
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.name')} *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.fatherName')}</label>
                <input type="text" value={formData.fatherName || ''} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.grandfatherName')}</label>
                <input type="text" value={formData.grandfatherName || ''} onChange={(e) => setFormData({ ...formData, grandfatherName: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Account Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.email')} *</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.password')} <span className="text-xs text-gray-500">{t('users.leaveBlank')}</span></label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.role')} *</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="student">{t('users.student')}</option>
                  <option value="teacher">{t('users.teacher')}</option>
                  <option value="staff">{t('users.staff')}</option>
                  <option value="admin">{t('users.admin')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.status')}</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="active">{t('users.active')}</option>
                  <option value="inactive">{t('users.inactive')}</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{t('users.step2Personal')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.idNumber')}</label>
                <input type="text" value={formData.idNumber || ''} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.dateOfBirth')}</label>
                <CalendarDatePicker
                  value={formData.dob}
                  onChange={(date) => setFormData({ ...formData, dob: date })}
                  placeholder={t('users.selectDob')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.bloodType')}</label>
                <select value={formData.bloodType || ''} onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">{t('users.selectBlood')}</option>
                  <option value="A+">{t('users.bloodTypeA+')}</option>
                  <option value="A-">{t('users.bloodTypeA-')}</option>
                  <option value="B+">{t('users.bloodTypeB+')}</option>
                  <option value="B-">{t('users.bloodTypeB-')}</option>
                  <option value="AB+">{t('users.bloodTypeAB+')}</option>
                  <option value="AB-">{t('users.bloodTypeAB-')}</option>
                  <option value="O+">{t('users.bloodTypeO+')}</option>
                  <option value="O-">{t('users.bloodTypeO-')}</option>
                </select>
              </div>
            </div>

            {/* Profile Image */}
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt={t('users.preview')} className="h-24 w-24 rounded-full object-cover border-4 border-blue-200 shadow" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl">
                    👤
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.uploadPhoto')}</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium file:text-sm" />
                <p className="text-xs text-gray-500 mt-1">{t('users.photoNote')}</p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{t('users.step3Contact')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.phone')}</label>
                <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.whatsapp')}</label>
                <input type="tel" value={formData.whatsapp || ''} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{t('users.step4Address')}</h3>
            {/* Permanent Address */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">{t('users.permanentAddress')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.province')}</label>
                  <input type="text" value={formData.permanentAddress.province} onChange={(e) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, province: e.target.value } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.district')}</label>
                  <input type="text" value={formData.permanentAddress.district} onChange={(e) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, district: e.target.value } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.village')}</label>
                  <input type="text" value={formData.permanentAddress.village} onChange={(e) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, village: e.target.value } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Current Address */}
            <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3">{t('users.currentAddress')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.province')}</label>
                  <input type="text" value={formData.currentAddress.province} onChange={(e) => setFormData({ ...formData, currentAddress: { ...formData.currentAddress, province: e.target.value } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.district')}</label>
                  <input type="text" value={formData.currentAddress.district} onChange={(e) => setFormData({ ...formData, currentAddress: { ...formData.currentAddress, district: e.target.value } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.village')}</label>
                  <input type="text" value={formData.currentAddress.village} onChange={(e) => setFormData({ ...formData, currentAddress: { ...formData.currentAddress, village: e.target.value } })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="p-6">{t('common.loading')}</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="mb-6">
        <button onClick={() => navigate('/admin/users')} className="text-blue-600 hover:text-blue-800 mb-4">
          {t('users.backToUsers')}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{t('users.editUser')}</h1>
        <p className="text-gray-600 mt-1">{t('users.createUserDesc')}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step}
              </div>
              <p className={`text-xs mt-2 ${currentStep >= step ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {step === 1 ? t('users.basicInfo') : step === 2 ? t('users.personalInfo') : step === 3 ? t('users.contact') : t('users.address')}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold"
              >
                {t('users.previous')}
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold"
              >
                {t('users.next')}
              </button>
            ) : (
              <>
                <button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold">
                  {t('users.updateUser')}
                </button>
                <button type="button" onClick={() => navigate('/admin/users')} className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold">
                  {t('users.cancel')}
                </button>
              </>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserEdit;
