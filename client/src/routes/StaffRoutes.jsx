import React from 'react';
import { Route } from 'react-router-dom';
import StaffPanel from '../panels/StaffPanel';
import StaffLibraryCategories from '../pages/staff/library/Categories';
import StaffLibraryCategoriesCreate from '../pages/staff/library/CategoriesCreate';
import StaffLibraryCategoriesEdit from '../pages/staff/library/CategoriesEdit';
import StaffLibraryCategoriesView from '../pages/staff/library/CategoriesView';
import StaffLibraryBooks from '../pages/staff/library/Books';
import StaffLibraryBooksCreate from '../pages/staff/library/BooksCreate';
import StaffLibraryBooksEdit from '../pages/staff/library/BooksEdit';
import StaffLibraryBooksView from '../pages/staff/library/BooksView';
import StaffLibraryBorrowed from '../pages/staff/library/Borrowed';
import StaffLibraryBorrowedCreate from '../pages/staff/library/BorrowedCreate';
import StaffLibraryBorrowedEdit from '../pages/staff/library/BorrowedEdit';
import StaffLibraryBorrowedView from '../pages/staff/library/BorrowedView';
import StaffLibraryPurchases from '../pages/staff/library/Purchases';
import StaffLibraryPurchasesCreate from '../pages/staff/library/PurchasesCreate';
import StaffLibraryPurchasesEdit from '../pages/staff/library/PurchasesEdit';
import StaffLibraryPurchasesView from '../pages/staff/library/PurchasesView';
import StaffLibrarySales from '../pages/staff/library/Sales';
import StaffLibrarySalesCreate from '../pages/staff/library/SalesCreate';
import StaffLibrarySalesEdit from '../pages/staff/library/SalesEdit';
import StaffLibrarySalesView from '../pages/staff/library/SalesView';
import StaffLibraryReports from '../pages/staff/library/Reports';
import StaffComplaintsList from '../pages/staff/complaints/ComplaintsList';
import StaffComplaintsView from '../pages/staff/complaints/ComplaintsView';
import StaffComplaintActions from '../pages/staff/complaints/Actions';
import StaffComplaintActionsCreate from '../pages/staff/complaints/ActionsCreate';
import StaffComplaintActionsEdit from '../pages/staff/complaints/ActionsEdit';
import StaffComplaintActionsView from '../pages/staff/complaints/ActionsView';
import StaffComplaintFeedback from '../pages/staff/complaints/Feedback';
import StaffComplaintFeedbackCreate from '../pages/staff/complaints/FeedbackCreate';
import StaffComplaintFeedbackEdit from '../pages/staff/complaints/FeedbackEdit';
import StaffComplaintFeedbackView from '../pages/staff/complaints/FeedbackView';
import StaffComplaintReports from '../pages/staff/complaints/Reports';
import StaffFinanceIndex from '../pages/staff/finance/Finance';
import StaffFinanceTransactions from '../pages/staff/finance/Transactions';
import StaffFinanceAccounts from '../pages/staff/finance/Accounts';
import StaffFinanceFeeStructures from '../pages/staff/finance/FeeStructures';
import StaffFinanceStudentFees from '../pages/staff/finance/StudentFees';
import StaffFinanceFeePayments from '../pages/staff/finance/FeePayments';
import StaffFinanceExpenses from '../pages/staff/finance/Expenses';
import StaffFinanceReports from '../pages/staff/finance/FinancialReports';
import StaffFinanceTransactionsCreate from '../pages/staff/finance/TransactionsCreate';
import StaffFinanceTransactionsEdit from '../pages/staff/finance/TransactionsEdit';
import StaffFinanceTransactionsView from '../pages/staff/finance/TransactionsView';
import StaffFinanceAccountsCreate from '../pages/staff/finance/AccountsCreate';
import StaffFinanceAccountsEdit from '../pages/staff/finance/AccountsEdit';
import StaffFinanceAccountsView from '../pages/staff/finance/AccountsView';
import StaffFinanceFeeStructuresCreate from '../pages/staff/finance/FeeStructuresCreate';
import StaffFinanceFeeStructuresEdit from '../pages/staff/finance/FeeStructuresEdit';
import StaffFinanceFeeStructuresView from '../pages/staff/finance/FeeStructuresView';
import StaffFinanceStudentFeesCreate from '../pages/staff/finance/StudentFeesCreate';
import StaffFinanceStudentFeesEdit from '../pages/staff/finance/StudentFeesEdit';
import StaffFinanceStudentFeesView from '../pages/staff/finance/StudentFeesView';
import StaffFinanceFeePaymentsCreate from '../pages/staff/finance/FeePaymentsCreate';
import StaffFinanceFeePaymentsEdit from '../pages/staff/finance/FeePaymentsEdit';
import StaffFinanceFeePaymentsView from '../pages/staff/finance/FeePaymentsView';
import StaffFinanceExpensesCreate from '../pages/staff/finance/ExpensesCreate';
import StaffFinanceExpensesEdit from '../pages/staff/finance/ExpensesEdit';
import StaffFinanceExpensesView from '../pages/staff/finance/ExpensesView';
import StaffFinanceReportsCreate from '../pages/staff/finance/FinancialReportsCreate';
import StaffFinanceReportsEdit from '../pages/staff/finance/FinancialReportsEdit';
import StaffFinanceReportsView from '../pages/staff/finance/FinancialReportsView';
import StaffPayrollIndex from '../pages/staff/payroll/Payroll';
import StaffPayrollSalaryStructures from '../pages/staff/payroll/SalaryStructures';
import StaffPayrollSalaryPayments from '../pages/staff/payroll/SalaryPayments';
import StaffPayrollSalaryDeductions from '../pages/staff/payroll/SalaryDeductions';
import StaffPayrollSalaryAdvances from '../pages/staff/payroll/SalaryAdvances';
import StaffPayrollSalaryStructuresCreate from '../pages/staff/payroll/SalaryStructuresCreate';
import StaffPayrollSalaryStructuresEdit from '../pages/staff/payroll/SalaryStructuresEdit';
import StaffPayrollSalaryStructuresView from '../pages/staff/payroll/SalaryStructuresView';
import StaffPayrollSalaryPaymentsCreate from '../pages/staff/payroll/SalaryPaymentsCreate';
import StaffPayrollSalaryPaymentsEdit from '../pages/staff/payroll/SalaryPaymentsEdit';
import StaffPayrollSalaryPaymentsView from '../pages/staff/payroll/SalaryPaymentsView';
import StaffPayrollSalaryDeductionsCreate from '../pages/staff/payroll/SalaryDeductionsCreate';
import StaffPayrollSalaryDeductionsEdit from '../pages/staff/payroll/SalaryDeductionsEdit';
import StaffPayrollSalaryDeductionsView from '../pages/staff/payroll/SalaryDeductionsView';
import StaffPayrollSalaryAdvancesCreate from '../pages/staff/payroll/SalaryAdvancesCreate';
import StaffPayrollSalaryAdvancesEdit from '../pages/staff/payroll/SalaryAdvancesEdit';
import StaffPayrollSalaryAdvancesView from '../pages/staff/payroll/SalaryAdvancesView';
import Employees from '../pages/staff/HR/Employees';
import DepartmentRegistration from '../pages/staff/HR/DepartmentRegistration';
import DepartmentCreate from '../pages/staff/HR/DepartmentCreate';
import DepartmentEdit from '../pages/staff/HR/DepartmentEdit';
import DepartmentView from '../pages/staff/HR/DepartmentView';
import DesignationRegistration from '../pages/staff/HR/DesignationRegistration';
import DesignationCreate from '../pages/staff/HR/DesignationCreate';
import DesignationEdit from '../pages/staff/HR/DesignationEdit';
import DesignationView from '../pages/staff/HR/DesignationView';
import LeaveTypeRegistration from '../pages/staff/HR/LeaveTypeRegistration';
import LeaveTypeCreate from '../pages/staff/HR/LeaveTypeCreate';
import LeaveTypeEdit from '../pages/staff/HR/LeaveTypeEdit';
import LeaveTypeView from '../pages/staff/HR/LeaveTypeView';
import EmployeeRegistration from '../pages/staff/HR/EmployeeRegistration';
import EmployeeEdit from '../pages/staff/HR/EmployeeEdit';
import EmployeeView from '../pages/staff/HR/EmployeeView';
import HRAttendance from '../pages/staff/HR/Attendance';
import LeaveManagement from '../pages/staff/HR/LeaveManagment';
import HRPayroll from '../pages/staff/HR/Payroll';
import HRReports from '../pages/staff/HR/Reports';
import Inventory from '../pages/staff/Kitchen/Inventory';
import InventoryCreate from '../pages/staff/Kitchen/InventoryCreate';
import InventoryEdit from '../pages/staff/Kitchen/InventoryEdit';
import InventoryView from '../pages/staff/Kitchen/InventoryView';
import MealPlaning from '../pages/staff/Kitchen/MealPlaning';
import MealPlaningCreate from '../pages/staff/Kitchen/MealPlaningCreate';
import MealPlaningEdit from '../pages/staff/Kitchen/MealPlaningEdit';
import MealPlaningView from '../pages/staff/Kitchen/MealPlaningView';
import DailyPlaning from '../pages/staff/Kitchen/DailyPlaning';
import DailyPlaningCreate from '../pages/staff/Kitchen/DailyPlaningCreate';
import DailyPlaningEdit from '../pages/staff/Kitchen/DailyPlaningEdit';
import DailyPlaningView from '../pages/staff/Kitchen/DailyPlaningView';
import WeeklyMenuPage from '../pages/staff/Kitchen/WeeklyMenu';
import WeeklyMenuCreate from '../pages/staff/Kitchen/WeeklyMenuCreate';
import WeeklyMenuEdit from '../pages/staff/Kitchen/WeeklyMenuEdit';
import WeeklyMenuView from '../pages/staff/Kitchen/WeeklyMenuView';
import Suppliers from '../pages/staff/Kitchen/Suppliers';
import SuppliersCreate from '../pages/staff/Kitchen/SuppliersCreate';
import SuppliersEdit from '../pages/staff/Kitchen/SuppliersEdit';
import SuppliersView from '../pages/staff/Kitchen/SuppliersView';
import WasteTracking from '../pages/staff/Kitchen/WasteTracking';
import WasteTrackingCreate from '../pages/staff/Kitchen/WasteTrackingCreate';
import WasteTrackingEdit from '../pages/staff/Kitchen/WasteTrackingEdit';
import WasteTrackingView from '../pages/staff/Kitchen/WasteTrackingView';
import StaffLeaveManagement from '../pages/StaffLeaveManagement';

const StaffRoutes = () => (
  <Route path="/staff/*" element={<StaffPanel />}>
    <Route index element={<StaffLibraryCategories />} />
    <Route path="library">
      <Route path="categories" element={<StaffLibraryCategories />} />
      <Route path="categories/create" element={<StaffLibraryCategoriesCreate />} />
      <Route path="categories/edit/:id" element={<StaffLibraryCategoriesEdit />} />
      <Route path="categories/view/:id" element={<StaffLibraryCategoriesView />} />
      <Route path="books" element={<StaffLibraryBooks />} />
      <Route path="books/create" element={<StaffLibraryBooksCreate />} />
      <Route path="books/edit/:id" element={<StaffLibraryBooksEdit />} />
      <Route path="books/view/:id" element={<StaffLibraryBooksView />} />
      <Route path="borrowed" element={<StaffLibraryBorrowed />} />
      <Route path="borrowed/create" element={<StaffLibraryBorrowedCreate />} />
      <Route path="borrowed/edit/:id" element={<StaffLibraryBorrowedEdit />} />
      <Route path="borrowed/view/:id" element={<StaffLibraryBorrowedView />} />
      <Route path="purchases" element={<StaffLibraryPurchases />} />
      <Route path="purchases/create" element={<StaffLibraryPurchasesCreate />} />
      <Route path="purchases/edit/:id" element={<StaffLibraryPurchasesEdit />} />
      <Route path="purchases/view/:id" element={<StaffLibraryPurchasesView />} />
      <Route path="sales" element={<StaffLibrarySales />} />
      <Route path="sales/create" element={<StaffLibrarySalesCreate />} />
      <Route path="sales/edit/:id" element={<StaffLibrarySalesEdit />} />
      <Route path="sales/view/:id" element={<StaffLibrarySalesView />} />
      <Route path="reports" element={<StaffLibraryReports />} />
    </Route>
    <Route path="complaints">
      <Route index element={<StaffComplaintsList />} />
      <Route path="view/:id" element={<StaffComplaintsView />} />
      <Route path="actions" element={<StaffComplaintActions />} />
      <Route path="actions/create" element={<StaffComplaintActionsCreate />} />
      <Route path="actions/edit/:id" element={<StaffComplaintActionsEdit />} />
      <Route path="actions/view/:id" element={<StaffComplaintActionsView />} />
      <Route path="feedback" element={<StaffComplaintFeedback />} />
      <Route path="feedback/create" element={<StaffComplaintFeedbackCreate />} />
      <Route path="feedback/edit/:id" element={<StaffComplaintFeedbackEdit />} />
      <Route path="feedback/view/:id" element={<StaffComplaintFeedbackView />} />
      <Route path="reports" element={<StaffComplaintReports />} />
    </Route>
    <Route path="finance" element={<StaffFinanceIndex />} />
    <Route path="finance/transactions" element={<StaffFinanceTransactions />} />
    <Route path="finance/transactions/create" element={<StaffFinanceTransactionsCreate />} />
    <Route path="finance/transactions/edit/:id" element={<StaffFinanceTransactionsEdit />} />
    <Route path="finance/transactions/view/:id" element={<StaffFinanceTransactionsView />} />
    <Route path="finance/accounts" element={<StaffFinanceAccounts />} />
    <Route path="finance/accounts/create" element={<StaffFinanceAccountsCreate />} />
    <Route path="finance/accounts/edit/:id" element={<StaffFinanceAccountsEdit />} />
    <Route path="finance/accounts/view/:id" element={<StaffFinanceAccountsView />} />
    <Route path="finance/fee-structures" element={<StaffFinanceFeeStructures />} />
    <Route path="finance/fee-structures/create" element={<StaffFinanceFeeStructuresCreate />} />
    <Route path="finance/fee-structures/edit/:id" element={<StaffFinanceFeeStructuresEdit />} />
    <Route path="finance/fee-structures/view/:id" element={<StaffFinanceFeeStructuresView />} />
    <Route path="finance/student-fees" element={<StaffFinanceStudentFees />} />
    <Route path="finance/student-fees/create" element={<StaffFinanceStudentFeesCreate />} />
    <Route path="finance/student-fees/edit/:id" element={<StaffFinanceStudentFeesEdit />} />
    <Route path="finance/student-fees/view/:id" element={<StaffFinanceStudentFeesView />} />
    <Route path="finance/fee-payments" element={<StaffFinanceFeePayments />} />
    <Route path="finance/fee-payments/create" element={<StaffFinanceFeePaymentsCreate />} />
    <Route path="finance/fee-payments/edit/:id" element={<StaffFinanceFeePaymentsEdit />} />
    <Route path="finance/fee-payments/view/:id" element={<StaffFinanceFeePaymentsView />} />
    <Route path="finance/expenses" element={<StaffFinanceExpenses />} />
    <Route path="finance/expenses/create" element={<StaffFinanceExpensesCreate />} />
    <Route path="finance/expenses/edit/:id" element={<StaffFinanceExpensesEdit />} />
    <Route path="finance/expenses/view/:id" element={<StaffFinanceExpensesView />} />
    <Route path="finance/reports" element={<StaffFinanceReports />} />
    <Route path="finance/reports/create" element={<StaffFinanceReportsCreate />} />
    <Route path="finance/reports/edit/:id" element={<StaffFinanceReportsEdit />} />
    <Route path="finance/reports/view/:id" element={<StaffFinanceReportsView />} />
    <Route path="payroll" element={<StaffPayrollIndex />} />
    <Route path="payroll/salary-structures" element={<StaffPayrollSalaryStructures />} />
    <Route path="payroll/salary-structures/create" element={<StaffPayrollSalaryStructuresCreate />} />
    <Route path="payroll/salary-structures/edit/:id" element={<StaffPayrollSalaryStructuresEdit />} />
    <Route path="payroll/salary-structures/view/:id" element={<StaffPayrollSalaryStructuresView />} />
    <Route path="payroll/salary-payments" element={<StaffPayrollSalaryPayments />} />
    <Route path="payroll/salary-payments/create" element={<StaffPayrollSalaryPaymentsCreate />} />
    <Route path="payroll/salary-payments/edit/:id" element={<StaffPayrollSalaryPaymentsEdit />} />
    <Route path="payroll/salary-payments/view/:id" element={<StaffPayrollSalaryPaymentsView />} />
    <Route path="payroll/salary-deductions" element={<StaffPayrollSalaryDeductions />} />
    <Route path="payroll/salary-deductions/create" element={<StaffPayrollSalaryDeductionsCreate />} />
    <Route path="payroll/salary-deductions/edit/:id" element={<StaffPayrollSalaryDeductionsEdit />} />
    <Route path="payroll/salary-deductions/view/:id" element={<StaffPayrollSalaryDeductionsView />} />
    <Route path="payroll/salary-advances" element={<StaffPayrollSalaryAdvances />} />
    <Route path="payroll/salary-advances/create" element={<StaffPayrollSalaryAdvancesCreate />} />
    <Route path="payroll/salary-advances/edit/:id" element={<StaffPayrollSalaryAdvancesEdit />} />
    <Route path="payroll/salary-advances/view/:id" element={<StaffPayrollSalaryAdvancesView />} />
    <Route path="hr/employees" element={<Employees />} />
    <Route path="hr/employees/edit/:id" element={<EmployeeEdit />} />
    <Route path="hr/employees/view/:id" element={<EmployeeView />} />
    <Route path="hr/departments" element={<DepartmentRegistration />} />
    <Route path="hr/departments/create" element={<DepartmentCreate />} />
    <Route path="hr/departments/edit/:id" element={<DepartmentEdit />} />
    <Route path="hr/departments/view/:id" element={<DepartmentView />} />
    <Route path="hr/designations" element={<DesignationRegistration />} />
    <Route path="hr/designations/create" element={<DesignationCreate />} />
    <Route path="hr/designations/edit/:id" element={<DesignationEdit />} />
    <Route path="hr/designations/view/:id" element={<DesignationView />} />
    <Route path="hr/leave-types" element={<LeaveTypeRegistration />} />
    <Route path="hr/leave-types/create" element={<LeaveTypeCreate />} />
    <Route path="hr/leave-types/edit/:id" element={<LeaveTypeEdit />} />
    <Route path="hr/leave-types/view/:id" element={<LeaveTypeView />} />
    <Route path="hr/employee-registration" element={<EmployeeRegistration />} />
    <Route path="hr/attendance" element={<HRAttendance />} />
    <Route path="hr/leave" element={<LeaveManagement />} />
    <Route path="hr/payroll" element={<HRPayroll />} />
    <Route path="hr/reports" element={<HRReports />} />
    <Route path="kitchen/inventory" element={<Inventory />} />
    <Route path="kitchen/inventory/create" element={<InventoryCreate />} />
    <Route path="kitchen/inventory/edit/:id" element={<InventoryEdit />} />
    <Route path="kitchen/inventory/view/:id" element={<InventoryView />} />
    <Route path="kitchen/meals" element={<MealPlaning />} />
    <Route path="kitchen/meals/create" element={<MealPlaningCreate />} />
    <Route path="kitchen/meals/edit/:id" element={<MealPlaningEdit />} />
    <Route path="kitchen/meals/view/:id" element={<MealPlaningView />} />
    <Route path="kitchen/menu" element={<DailyPlaning />} />
    <Route path="kitchen/menu/create" element={<DailyPlaningCreate />} />
    <Route path="kitchen/menu/edit/:id" element={<DailyPlaningEdit />} />
    <Route path="kitchen/menu/view/:id" element={<DailyPlaningView />} />
    <Route path="kitchen/weekly-menu" element={<WeeklyMenuPage />} />
    <Route path="kitchen/weekly-menu/create" element={<WeeklyMenuCreate />} />
    <Route path="kitchen/weekly-menu/edit/:id" element={<WeeklyMenuEdit />} />
    <Route path="kitchen/weekly-menu/view/:id" element={<WeeklyMenuView />} />
    <Route path="kitchen/suppliers" element={<Suppliers />} />
    <Route path="kitchen/suppliers/create" element={<SuppliersCreate />} />
    <Route path="kitchen/suppliers/edit/:id" element={<SuppliersEdit />} />
    <Route path="kitchen/suppliers/view/:id" element={<SuppliersView />} />
    <Route path="kitchen/waste" element={<WasteTracking />} />
    <Route path="kitchen/waste/create" element={<WasteTrackingCreate />} />
    <Route path="kitchen/waste/edit/:id" element={<WasteTrackingEdit />} />
    <Route path="kitchen/waste/view/:id" element={<WasteTrackingView />} />
    <Route path="leave" element={<StaffLeaveManagement />} />
  </Route>
);

export default StaffRoutes;

