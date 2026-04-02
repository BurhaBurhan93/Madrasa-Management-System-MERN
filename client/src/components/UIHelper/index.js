/**
 * UI Helper Components Index
 * Centralized export for all UI components
 */

// Core Components
export { default as Button, IconButton, ButtonGroup } from './Button';
export { default as Card } from './Card';
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Modal } from './Modal';
export { default as Loading } from './Loading';
export { default as ErrorPage } from './ErrorPage';
export { default as Avatar } from './Avatar';
export { default as Badge } from './Badge';
export { default as Progress } from './Progress';
export { default as Search } from './Search';
export { default as Notifications } from './Notifications';
export { default as Table } from './Table';
export { default as DataTable } from './DataTable';

// Chart Components
export {
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
  DoughnutChartComponent,
  AreaChartComponent,
  RadarChartComponent,
  GaugeChartComponent,
} from './ECharts';

// Recharts Components (existing)
export {
  BarChartComponent as RechartsBarChart,
  LineChartComponent as RechartsLineChart,
  PieChartComponent as RechartsPieChart,
} from './Chart';

// Data Grid
export { default as AgGridTable } from './AgGridTable';

// Layout Components
export { default as Container } from './Container';
export { default as Grid } from './Grid';

// Typography Components
export {
  Heading,
  Text,
  Label,
  Badge as TextBadge,
  Divider,
  Spacer,
} from './Typography';

// Diagram Components (React Flow wrappers)
export {
  FlowDiagram,
  SimpleFlowDiagram,
  ProcessFlowDiagram,
  NodeTypes,
  EdgeTypes,
} from './FlowDiagram';
