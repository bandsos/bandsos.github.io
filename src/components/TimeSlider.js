import { useState } from "react";
// import { useEffect } from "react";
import { Container } from "react-bootstrap";

import "./TimeSlider.css";

const TimeSlider = function ({forecast, setTimestep}) {
    console.log("from timeslider", forecast);
    const steps = forecast.forecasts.elev.layers[0].timestamps; 
    const min = 0;
    const max = min + steps.length - 1;
    const initindex = 8;
    // TODO Fix const initindex = steps.findIndex( (step) => step.time === forecast.date );
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
                        onChange(step); 
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
        </div>
        </Container>
    );
}

export default TimeSlider;