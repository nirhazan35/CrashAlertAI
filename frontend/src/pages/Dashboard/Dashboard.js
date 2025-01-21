import DashboardLayout from './SidebarLayout.js';
import Alert from '../../components/AccidentView/Alert';
import { useAccidentLogs } from '../../context/AccidentContext';
import AccidentLog from '../../components/AccidentLogs/AccidentLog';


const Dashboard = () => {
  const { selectedAlert } = useAccidentLogs();
  return (
    <DashboardLayout>
      {/* The Alert component */}
      <div className="alert-container">
        <Alert alert={selectedAlert} />
      </div>

      {/* The Alert component will be displayed alongside the logs */}
      <div className="dashboard-content-container">
        
        {/* Accident Logs */}
        <div className="dashboard-logs">
          <h3>Accident Logs</h3>
          <AccidentLog/>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;