import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ForecastDateTimePicker from './ForecastDateTimePicker';
import './Navbar.css';

function BasicNavbar({sitename, navbar, forecast, setForecast, cycles, maxForecast}) {
    return (
        <Navbar bg="light" expand="lg" className="bandsos-navbar">
        <Container className="bandsos-navbar-container">
            <div className="bandsos-navbar-topbar">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Brand href="/" className="bandsos-navbar-logo">
                    <img alt={sitename} src={navbar.branding.icon} height="35px"/>
            </Navbar.Brand>
            <Row className="bandsos-navbar-picker-row">
                <Col className="bandsos-navbar-picker-col">
                    <ForecastDateTimePicker
                        forecast={forecast}
                        setForecast={setForecast}
                        cycles={cycles}
                        maxForecast={maxForecast}
                    />
                </Col>
            </Row>
            </div>
            <Navbar.Collapse id="basic-navbar-nav">
            <Navbar.Brand href="/" className="bandsos-navbar-menu-brand"><b>BandSOS</b></Navbar.Brand>
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
        </Container>
        </Navbar>
    );
}

export default BasicNavbar;