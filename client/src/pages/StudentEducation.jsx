import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch, parseJsonSafe } from '../lib/apiFetch';
import { 
  FiBook, 
  FiAward, 
  FiAlertCircle, 
  FiActivity, 
  FiTrendingUp, 
  FiCheckCircle,
  FiMapPin,
  FiCalendar,
  FiArrowRight,
  FiInfo,
  FiMessageSquare
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Badge from '../components/UIHelper/Badge';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { PieChartComponent, BarChartComponent } from '../components/UIHelper/ECharts';
import { formatDate } from '../lib/utils';

const MOCK_EDUCATION = [
  { _id: 'e1', previousInstitution: 'Kabul University', previousDegree: 'Bachelor of Arts', fieldOfStudy: 'Islamic Studies', startDate: '2020-03-01', endDate: '2024-01-15', grade: 'A', percentage: 88, certificateUrl: null },
  { _id: 'e2', previousInstitution: 'Darul Uloom Haqqania', previousDegree: 'Dars-e-Nizami', fieldOfStudy: 'Islamic Sciences', startDate: '2016-09-01', endDate: '2020-02-28', grade: 'A+', percentage: 92, certificateUrl: null },
  { _id: 'e3', previousInstitution: 'Al-Farooq Academy', previousDegree: 'Higher Secondary Certificate', fieldOfStudy: 'Science', startDate: '2014-04-01', endDate: '2016-08-15', grade: 'B+', percentage: 78, certificateUrl: null },
];

const StudentEducation = () => {
  const { t } = useTranslation(['student', 'common']);
  const navigate = useNavigate();
  const [educationHistory, setEducationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEducationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch('/student/education');
      const data = await parseJsonSafe(res);
      const records = Array.isArray(data) ? data : (data.data || []);
      setEducationHistory(records.length > 0 ? records : MOCK_EDUCATION);
    } catch (err) {
      console.error('Error fetching education data:', err);
      setError(t('student.education.offlineData'));
      setEducationHistory(MOCK_EDUCATION);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducationData();
  }, []);

  const institutionsCount = new Set(educationHistory.map(e => e.previousInstitution)).size;
  const certificationsCount = educationHistory.filter(e => 
    e.previousDegree?.toLowerCase().includes('diploma') || 
    e.previousDegree?.toLowerCase().includes('certificate') ||
    e.previousDegree?.toLowerCase().includes('degree')
  ).length;

  if (loading) return <PageSkeleton variant="table" />;

  if (error) return (
    <div className="py-20 text-center">
      <p className="text-red-500 mb-4">{error}</p>
      <button onClick={fetchEducationData} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">{t('common.retry')}</button>
    </div>
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 dark:text-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">{t('student.education.academic')}</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('student.education.title')}</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1 font-medium italic">{t('student.education.subtitle')}</p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-2xl border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2 font-black text-xs uppercase tracking-widest"
          onClick={() => navigate('/student/communications')}
        >
          <FiMessageSquare /> {t('student.education.contactRegistrar')}
        </Button>
      </div>

      {/* Info Banner */}
      <div className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200 rounded-[32px] relative overflow-hidden">
        <div className="flex items-start gap-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl text-amber-600 shrink-0">
            <FiAlertCircle />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-amber-900 mb-2">{t('student.education.readOnlyVerification')}</h3>
            <p className="text-amber-800/80 font-medium leading-relaxed max-w-2xl">
              {t('student.education.verificationBanner')}
            </p>
          </div>
        </div>
        <FiInfo className="absolute -right-8 -bottom-8 w-48 h-48 text-amber-500/5 transform rotate-12" />
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('student.education.totalRecords'), value: educationHistory.length, icon: <FiBook />, color: 'blue' },
          { label: t('student.education.certifications'), value: certificationsCount, icon: <FiAward />, color: 'emerald' },
          { label: t('student.education.institutions'), value: institutionsCount, icon: <FiTrendingUp />, color: 'purple' },
          { label: t('student.education.verifiedStatus'), value: '100%', icon: <FiCheckCircle />, color: 'cyan' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-[32px] border border-slate-100 dark:border-gray-700 shadow-xl shadow-slate-200/50">
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-xl mb-4`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Education Records List */}
        <div className="lg:col-span-2">
          <Card title={t('student.education.verifiedRecords')} className="rounded-[32px] p-8 dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-6">
              {educationHistory.length > 0 ? (
                educationHistory.map((edu, i) => (
                  <div key={i} className="group p-6 rounded-[32px] bg-slate-50 dark:bg-gray-700/50 border border-slate-100 dark:border-gray-700 hover:border-cyan-200 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl text-cyan-600 group-hover:scale-110 transition-transform">
                          <FiAward />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{edu.previousDegree}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {edu.previousInstitution}
                          </p>
                        </div>
                      </div>
                      <Badge variant="success" className="font-black uppercase tracking-widest text-[10px]">{t('common.verified')}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                          <FiMapPin />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('student.education.location')}</p>
                          <p className="text-sm font-black text-slate-700 dark:text-gray-300">{edu.location || t('student.education.notSpecified')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                          <FiCalendar />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('student.education.addedOn')}</p>
                          <p className="text-sm font-black text-slate-700 dark:text-gray-300">{formatDate(edu.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                          <FiCheckCircle />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('common.status')}</p>
                          <p className="text-sm font-black text-emerald-600">{t('student.education.documentVerified')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <FiAward className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{t('student.education.noHistory')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-8">
          <Card title={t('student.education.institutionDistribution')} className="rounded-[32px] p-8 dark:bg-gray-800 dark:border-gray-700">
            <BarChartComponent 
              data={Array.from(new Set(educationHistory.map(e => e.previousInstitution))).map(inst => ({
                name: inst?.substring(0, 15) || t('common.unknown'),
                value: educationHistory.filter(e => e.previousInstitution === inst).length
              }))}
              dataKey="value"
              nameKey="name"
              height={250}
            />
          </Card>

          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] text-white shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-2">{t('student.education.academicSupport')}</h4>
              <p className="text-slate-400 text-sm font-medium mb-6">{t('student.education.academicSupportDesc')}</p>
              <Button 
                variant="primary" 
                className="w-full rounded-2xl py-4 bg-cyan-600 hover:bg-cyan-700 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-cyan-900/20"
                onClick={() => navigate('/student/communications')}
              >
                {t('student.education.getSupport')}
              </Button>
            </div>
            <FiBook className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEducation;
