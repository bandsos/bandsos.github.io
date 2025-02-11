// Hotfix warning container
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function Maintenance(props) {
    return (
        <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        >
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
            Maintenance notice!
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>
            The computational backend of BandSOS is currently under maintenance. The last generated forecast is displayed.
            The system will come back online as soon as possible! We are sorry for this inconvenience.
            </p>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
        </Modal>
    );
}

export default Maintenance;