import { useState } from "react";
import { Container, Button } from "react-bootstrap"; // Import Button from react-bootstrap

import "./TimeSlider.css";

const TimeSlider = function ({forecast, setTimestep}) {
    console.log("from timeslider", forecast);
    const steps = forecast.forecasts.elev.layers[0].timestamps; 
    const min = 0;
    const max = min + steps.length - 1;
    const initindex = 8;
    const starttime = steps[0].time;
    const endtime = steps[max].time;

    const [index, onChange] = useState(initindex);

    //step change with buttons
    const handleStepChange = (direction) => {
        let newIndex = index;
        if (direction === 'left' && index > min) {
            newIndex = index - 1;
        } else if (direction === 'right' && index < max) {
            newIndex = index + 1;
        }
        onChange(newIndex);
        setTimestep({folder:steps[newIndex].folder});
    };
    
    return (
        <Container className="timeslider-outer">
            <div className="timeslider-parent">
                <div id='starttime'>
                    <div>{starttime.split(" ")[0]} </div>
                    <div>{starttime.split(" ")[1].split(":")[0]}h UTC</div>
                </div>
                
                <div id="timeslider">
                    <input 
                        type="range" 
                        id='range' 
                        className="slider"
                        list="values" 
                        min={min} 
                        max={max} 
                        value={index}
                        onChange={ ({target: {value: step} }) => {
                            onChange(parseInt(step)); // Ensure step is treated as a number
                            setTimestep({folder:steps[step].folder});
                        }}
                        />
                    <output></output>
                    <div class='range-slider__progress'></div>
                    <div id="buble">Currently viewing: <b>{steps[index].time}</b></div>
                </div>
                
                <div id='endtime'>
                    <div>{endtime.split(" ")[0]} </div>
                    <div>{endtime.split(" ")[1].split(":")[0]}h UTC</div>
                </div>
                
                <div class="buttonContainer">
                    <div class="sliderButton">
                        <button  onClick={() => handleStepChange('left')}>&lt;</button>
                    </div>
                        
                    <div>
                        <button class="sliderButton" onClick={() => handleStepChange('right')}>&gt;</button>
                    </div>
                
                </div>
            </div>
        </Container>
    );
}

export default TimeSlider;