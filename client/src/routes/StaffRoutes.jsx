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
import StaffFinanceAccountsCreate from '../pages/staff/finance/AccountsCreate';
import StaffFinanceAccountsEdit from '../pages/staff/finance/AccountsEdit';
import StaffFinanceFeeStructuresCreate from '../pages/staff/finance/FeeStructuresCreate';
import StaffFinanceFeeStructuresEdit from '../pages/staff/finance/FeeStructuresEdit';
import StaffFinanceStudentFeesCreate from '../pages/staff/finance/StudentFeesCreate';
import StaffFinanceStudentFeesEdit from '../pages/staff/finance/StudentFeesEdit';
import StaffFinanceFeePaymentsCreate from '../pages/staff/finance/FeePaymentsCreate';
import StaffFinanceFeePaymentsEdit from '../pages/staff/finance/FeePaymentsEdit';
import StaffFinanceExpensesCreate from '../pages/staff/finance/ExpensesCreate';
import StaffFinanceExpensesEdit from '../pages/staff/finance/ExpensesEdit';
import StaffFinanceReportsCreate from '../pages/staff/finance/FinancialReportsCreate';
import StaffFinanceReportsEdit from '../pages/staff/finance/FinancialReportsEdit';
import StaffPayrollIndex from '../pages/staff/payroll/Payroll';
import StaffPayrollSalaryStructures from '../pages/staff/payroll/SalaryStructures';
import StaffPayrollSalaryPayments from '../pages/staff/payroll/SalaryPayments';
import StaffPayrollSalaryDeductions from '../pages/staff/payroll/SalaryDeductions';
import StaffPayrollSalaryAdvances from '../pages/staff/payroll/SalaryAdvances';
import StaffPayrollSalaryStructuresCreate from '../pages/staff/payroll/SalaryStructuresCreate';
import StaffPayrollSalaryStructuresEdit from '../pages/staff/payroll/SalaryStructuresEdit';
import StaffPayrollSalaryPaymentsCreate from '../pages/staff/payroll/SalaryPaymentsCreate';
import StaffPayrollSalaryPaymentsEdit from '../pages/staff/payroll/SalaryPaymentsEdit';
import StaffPayrollSalaryDeductionsCreate from '../pages/staff/payroll/SalaryDeductionsCreate';
import StaffPayrollSalaryDeductionsEdit from '../pages/staff/payroll/SalaryDeductionsEdit';
import StaffPayrollSalaryAdvancesCreate from '../pages/staff/payroll/SalaryAdvancesCreate';
import StaffPayrollSalaryAdvancesEdit from '../pages/staff/payroll/SalaryAdvancesEdit';
import StaffLeaveManagement from '../pages/StaffLeaveManagement';

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
    <Route path="finance" element={<StaffFinanceIndex />} />
    <Route path="finance/transactions" element={<StaffFinanceTransactions />} />
    <Route path="finance/transactions/create" element={<StaffFinanceTransactionsCreate />} />
    <Route path="finance/transactions/edit/:id" element={<StaffFinanceTransactionsEdit />} />
    <Route path="finance/accounts" element={<StaffFinanceAccounts />} />
    <Route path="finance/accounts/create" element={<StaffFinanceAccountsCreate />} />
    <Route path="finance/accounts/edit/:id" element={<StaffFinanceAccountsEdit />} />
    <Route path="finance/fee-structures" element={<StaffFinanceFeeStructures />} />
    <Route path="finance/fee-structures/create" element={<StaffFinanceFeeStructuresCreate />} />
    <Route path="finance/fee-structures/edit/:id" element={<StaffFinanceFeeStructuresEdit />} />
    <Route path="finance/student-fees" element={<StaffFinanceStudentFees />} />
    <Route path="finance/student-fees/create" element={<StaffFinanceStudentFeesCreate />} />
    <Route path="finance/student-fees/edit/:id" element={<StaffFinanceStudentFeesEdit />} />
    <Route path="finance/fee-payments" element={<StaffFinanceFeePayments />} />
    <Route path="finance/fee-payments/create" element={<StaffFinanceFeePaymentsCreate />} />
    <Route path="finance/fee-payments/edit/:id" element={<StaffFinanceFeePaymentsEdit />} />
    <Route path="finance/expenses" element={<StaffFinanceExpenses />} />
    <Route path="finance/expenses/create" element={<StaffFinanceExpensesCreate />} />
    <Route path="finance/expenses/edit/:id" element={<StaffFinanceExpensesEdit />} />
    <Route path="finance/reports" element={<StaffFinanceReports />} />
    <Route path="finance/reports/create" element={<StaffFinanceReportsCreate />} />
    <Route path="finance/reports/edit/:id" element={<StaffFinanceReportsEdit />} />
    <Route path="payroll" element={<StaffPayrollIndex />} />
    <Route path="payroll/salary-structures" element={<StaffPayrollSalaryStructures />} />
    <Route path="payroll/salary-structures/create" element={<StaffPayrollSalaryStructuresCreate />} />
    <Route path="payroll/salary-structures/edit/:id" element={<StaffPayrollSalaryStructuresEdit />} />
    <Route path="payroll/salary-payments" element={<StaffPayrollSalaryPayments />} />
    <Route path="payroll/salary-payments/create" element={<StaffPayrollSalaryPaymentsCreate />} />
    <Route path="payroll/salary-payments/edit/:id" element={<StaffPayrollSalaryPaymentsEdit />} />
    <Route path="payroll/salary-deductions" element={<StaffPayrollSalaryDeductions />} />
    <Route path="payroll/salary-deductions/create" element={<StaffPayrollSalaryDeductionsCreate />} />
    <Route path="payroll/salary-deductions/edit/:id" element={<StaffPayrollSalaryDeductionsEdit />} />
    <Route path="payroll/salary-advances" element={<StaffPayrollSalaryAdvances />} />
    <Route path="payroll/salary-advances/create" element={<StaffPayrollSalaryAdvancesCreate />} />
    <Route path="payroll/salary-advances/edit/:id" element={<StaffPayrollSalaryAdvancesEdit />} />
    <Route path="leave" element={<StaffLeaveManagement />} />
  </Route>
);

export default StaffRoutes;
