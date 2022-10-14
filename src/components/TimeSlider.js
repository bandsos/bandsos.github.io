import { useState } from "react";
// import { useEffect } from "react";
import { Container } from "react-bootstrap";

import "./TimeSlider.css";

const TimeSlider = function ({forecast, setTimestep}) {
    console.log("from timeslider", forecast);
    const steps = forecast.forecasts.elev.layers[0].timestamps; 
    const min = 0;
    const max = min + steps.length - 1;
    const initindex = steps.findIndex( (step) => step.time === forecast.date );
    const starttime = steps[0].time;
    const endtime = steps[max].time;

    const [index, onChange] = useState(initindex);
    

    // To create a bubble and move with the slider
    // useEffect( () => {
    //     const buble = document.querySelector('#buble');
    //     let newloc = Number(((index - min)*100)/(max-min));
        
    //     if (buble) {
    //         buble.style.left = `${newloc}%`;
    //     }
    // });

    return (
        <Container>
            <div className="timeslider-parent">
            <span id='starttime'>{starttime}</span>
            <div id="timeslider">
                <input 
                    type="range" 
                    id='range' 
                    className="slider" 
                    min={min} 
                    max={max} 
                    value={index} 
                    onChange={ ({target: {value: step} }) => {
                        onChange(step); 
                        setTimestep({folder:steps[step].folder});
                    }}/>
                <div id="buble">Currently viewing: <b>{steps[index].time}</b></div>
            </div>
            <span id='endtime'>{endtime}</span>
            </div>
        </Container>
    );
}

export default TimeSlider;