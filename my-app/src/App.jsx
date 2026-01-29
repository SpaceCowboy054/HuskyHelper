// import './App.css';
import Navbar from 'react-bootstrap/Navbar';
import {Route, Routes, Link} from 'react-router-dom';
import Home from './pages/Home.jsx';
import CreateSchedule from './pages/CreateSchedule.jsx'
import Search from './pages/Search.jsx'
import Schedules from './pages/Schedules.jsx'

function App() {
  return (
    <div className = "min-h-screen bg-gradient-to-b from-blue-800 to-neutral-900">
      <Navbar>
        <div className = "flex justify-evenly items-center">
          <Link to = "/" className = "text-white mt-6 hover:text-gray-300">Home</Link>
          <Link to = "/create_schedule" className = "text-white mt-6 hover:text-gray-300">Create a Schedule</Link>
        </div>
        <Routes>
          <Route path = "/" element ={<Home/>}/>
          <Route path = "/create_schedule" element = {<CreateSchedule/>}/>
          <Route path = "/search" element = {<Search/>}/>
          <Route path = "/schedules" element = {<Schedules/>}/>
        </Routes>
      </Navbar>
    </div>
  )
}

export default App;