import React from 'react';
import { Route } from 'react-router-dom';
import StaffPanel from '../panels/StaffPanel';
import StaffLibraryCategories from '../pages/staff/library/Categories';
import StaffLibraryBooks from '../pages/staff/library/Books';
import StaffLibraryBorrowed from '../pages/staff/library/Borrowed';
import StaffLibraryPurchases from '../pages/staff/library/Purchases';
import StaffLibrarySales from '../pages/staff/library/Sales';
import StaffLibraryReports from '../pages/staff/library/Reports';
import StaffComplaintsList from '../pages/staff/complaints/ComplaintsList';
import StaffComplaintActions from '../pages/staff/complaints/Actions';
import StaffComplaintFeedback from '../pages/staff/complaints/Feedback';
import StaffComplaintReports from '../pages/staff/complaints/Reports';

const StaffRoutes = () => (
  <Route path="/staff/*" element={<StaffPanel />}>
    <Route index element={<StaffLibraryCategories />} />
    <Route path="library">
      <Route path="categories" element={<StaffLibraryCategories />} />
      <Route path="books" element={<StaffLibraryBooks />} />
      <Route path="borrowed" element={<StaffLibraryBorrowed />} />
      <Route path="purchases" element={<StaffLibraryPurchases />} />
      <Route path="sales" element={<StaffLibrarySales />} />
      <Route path="reports" element={<StaffLibraryReports />} />
    </Route>
    <Route path="complaints">
      <Route index element={<StaffComplaintsList />} />
      <Route path="actions" element={<StaffComplaintActions />} />
      <Route path="feedback" element={<StaffComplaintFeedback />} />
      <Route path="reports" element={<StaffComplaintReports />} />
    </Route>
  </Route>
);

export default StaffRoutes;
