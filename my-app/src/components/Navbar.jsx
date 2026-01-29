import {Route, Routes, Link} from 'react-router-dom';
import Navbar_element from 'react-bootstrap/Navbar';

export default function Navbar(){
    return (
    <Navbar_element>
      <Routes>
        <Route path = "/" element ={<Link to = "/">Home</Link>} />
        <Route path = "/" element = {<Link to = "/">Create a Schedule</Link>}/>
      </Routes>
    </Navbar_element> 
    )
}