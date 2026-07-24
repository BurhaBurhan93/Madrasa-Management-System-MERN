// Simulate how toResources extracts the staff namespace
const data = {
  staff: {
    hr: {
      departments: { coldepartmentCode: 'Code' },
      attendance: { title: 'Attendance' }
    },
    leaveManagement: { title: 'Leave Mgmt' }
  }
};

const NS = ['staff'];
function toResources(data) {
  const r = {};
  for (const ns of NS) {
    if (data[ns]) r[ns] = data[ns];
  }
  return r;
}
const resources = { en: toResources(data) };
console.log("staff namespace resources keys:", Object.keys(resources.en.staff));
console.log();
console.log("Key with staff prefix: 'staff.hr.departments.coldepartmentCode'");
console.log("  lookup:", JSON.stringify(resources.en.staff['staff.hr.departments.coldepartmentCode']));
console.log("Key without prefix: 'hr.departments.coldepartmentCode'");
console.log("  lookup:", resources.en.staff.hr?.departments?.coldepartmentCode);
