import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function BasicNavbar({sitename, navbar, forecast, setForecast, cycles}) {

    // console.log('From navbar', forecast);

    const handleChange = (e) => {
        const newstate = {...forecast};
        switch (e.target.name) {
            case "forecastdate":
                newstate.date = e.target.value;
                newstate.folder = `${e.target.value.replaceAll("-","")}${forecast.cycle}`;
                break;
            case "forecastcycle":
                newstate.cycle = e.target.value;
                newstate.folder = `${forecast.date.replaceAll("-","")}${e.target.value}`;
                break;
            default:
                break;
        }
        
        setForecast(newstate);
    };

    return (
        <Navbar bg="light" expand="lg">
        <Container>
            <p> navigation bar component </p>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Brand href="/">
                    <img alt={sitename} src={navbar.branding.icon} height="35px"/>
            </Navbar.Brand>
            <Navbar.Collapse id="basic-navbar-nav">
            <Navbar.Brand href="/"><b>BandSOS</b></Navbar.Brand>
            <Nav className="me-auto">
                <NavDropdown title="Data">
                    <NavDropdown.Item href="https://zenodo.org/doi/10.5281/zenodo.10371338">Intertidal Topography</NavDropdown.Item>
                    <NavDropdown.Item href="https://github.com/bandsos/social-science-data">Social Science Data</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="About">
                    <NavDropdown.Item href="https://www.spaceclimateobservatory.org/band-sos-bengal-delta">Project</NavDropdown.Item>
                    <NavDropdown.Item href="https://github.com/bandsos/">Website</NavDropdown.Item>
                    <NavDropdown.Item href="https://github.com/schism-dev/schism">Model</NavDropdown.Item>
                    <NavDropdown.Item href="https://github.com/bandsos/status">System Status</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Partners">
                    <NavDropdown.Item href="https://www.bwdb.gov.bd">BWDB</NavDropdown.Item>
                    <NavDropdown.Item href="https://ffwc.gov.bd">FFWC</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="https://www.ird.fr">IRD</NavDropdown.Item>
                    <NavDropdown.Item href="https://lienss.univ-lr.fr">LIENSs</NavDropdown.Item>
                    <NavDropdown.Item href="https://www.legos.omp.eu/">LEGOS</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Past Named Cyclones">
                    <NavDropdown.Item href="https://bandsos.github.io/?cycle=2022102400">2022 - Cyclone Sitrang - Oct 22 to Oct 25</NavDropdown.Item>
                    <NavDropdown.Item href="https://bandsos.github.io/?cycle=2023051300">2023 - Cyclone Mocha - May 9 to May 15</NavDropdown.Item>
                    <NavDropdown.Item href="https://bandsos.github.io/?cycle=2023102400">2023 - Cyclone Hamoon - Oct 21 to Oct 25</NavDropdown.Item>
                    <NavDropdown.Item href="https://bandsos.github.io/?cycle=2023111700">2023 - Cyclone Midhili - Nov 14 to Nov 18</NavDropdown.Item>
                    <NavDropdown.Item href="https://bandsos.github.io/?cycle=2024052600">2024 - Cyclone Remal - May 24 to May 28</NavDropdown.Item>
                </NavDropdown>
            </Nav>
            </Navbar.Collapse>
            <Row>
                <Col>
                    <Form.Control 
                        type="date" 
                        name="forecastdate"
                        min="2020-01-01"
                        defaultValue={forecast.date}
                        placeholder="Forecast Date" 
                        onChange={handleChange}
                        />
                </Col>
                <Col>
                    <Form.Select placeholder='Cycle' name="forecastcycle" onChange={handleChange}>
                        {
                            cycles.map( (item) =>
                               {
                                    if (forecast.cycle === item) {
                                        return(<option key={item} value={item} selected>{item}Z</option>);
                                    } else {
                                        return(<option key={item} value={item}>{item}Z</option>);
                                    }
                                    
                               }
                            )
                        }
                    </Form.Select>
                </Col>
            </Row>
        </Container>
        </Navbar>
    );
}

export default BasicNavbar;