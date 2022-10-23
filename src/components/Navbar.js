import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function BasicNavbar({sitename, navbar, forecast, setForecast, cycles}) {

    console.log('From navbar', forecast);

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
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Brand href="/">
                    <img alt={sitename} src={navbar.branding.icon} height="35px"/>
            </Navbar.Brand>
            <Navbar.Collapse id="basic-navbar-nav">
            <Navbar.Brand href="/"><b>BandSOS Platform</b></Navbar.Brand>
            <Nav className="me-auto">
                <Nav.Link href="#home">Home</Nav.Link>
                <NavDropdown title="Platform">
                    <NavDropdown.Item href="https://github.com/bandsos">Codes and Data</NavDropdown.Item>
                    <NavDropdown.Item href="https://github.com/schism-dev/schism">Model</NavDropdown.Item>
                    <NavDropdown.Item href="#status">System Status</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Risk and Vulnerability">
                    <NavDropdown.Item href="#">Layers</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Important Links">
                    <NavDropdown.Item href="https://www.bwdb.gov.bd">BWDB</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="https://www.ird.fr">IRD</NavDropdown.Item>
                    <NavDropdown.Item href="https://lienss.univ-lr.fr">LIENSs</NavDropdown.Item>
                    <NavDropdown.Item href="https://www.legos.omp.eu/">LEGOS</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="About Us">
                    <NavDropdown.Item href="https://www.spaceclimateobservatory.org/band-sos-bengal-delta">Project Detail</NavDropdown.Item>
                    <NavDropdown.Item href="#people">People</NavDropdown.Item>
                </NavDropdown>
                <Nav.Link href="#contact">Contact</Nav.Link>
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