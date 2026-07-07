export const unwrapArrayResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const unwrapObjectResponse = (payload) => {
  if (payload && typeof payload === 'object') {
    if ('data' in payload && payload.data && typeof payload.data === 'object') {
      return payload.data;
    }
    return payload;
  }
  return null;
};

export const getStudentUserName = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.name || 'Student';
  } catch {
    return 'Student';
  }
};

