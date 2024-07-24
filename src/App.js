import logo from './logo.svg';
import LocateNearestHospital from './pages/LocateNearestHospital.js';
import AdminLogin  from './pages/AdminLogin.js';
import Crud from './pages/Crud.js';
import Home from './pages/Home.js';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CreateAccount from './pages/CreateAccount.js';
import LocateNearestHospitalMyLoc from './pages/LocateNearestHospitalMyLoc.js';

function App() {

 
  return (
    <div className="App">
      
        <BrowserRouter>
        <Routes>
        <Route index element={<LocateNearestHospitalMyLoc/>}/>
        </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
