import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientesView from './components/ClientesView';
import ClienteDetail from './components/ClienteDetail';
// import GrafoView from './components/GrafoView';
import { DataProvider } from './contexts/DataContext';

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<ClientesView />} />
            <Route path="clientes/:clienteId" element={<ClienteDetail />} />
            {/* <Route path="grafo" element={<GrafoView />} /> */}
          </Route>
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;