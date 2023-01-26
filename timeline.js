console.log("Timeline Test");
let timeline = document.getElementById("stud-name");
let updateBtn = document.getElementById("update-button");
let allInputs = document.querySelectorAll("input");
let dayStart = "1970-01-01T06:00";
let dayEnd = "1970-01-01T18:00";
let refDate = "1970-01-01T"

let firstS = null;
let firstE = null;
let secS = null;
let secE = null;
let thirdS = null;
let thirdE = null;

const addtoTimeline = (e) =>{
    // 720 min in a 12 hour span need to calculate percentage of time between start
    // and this time and the end time to build a block and insert it. only if it exists.

    let tempTime = refDate + e.target.value;
    let tempStart = Date.parse(dayStart);
    tempTime = Date.parse(tempTime);

    let tempPer = (((tempTime - tempStart) / 60000) / 720)*100;

    if(e.target.id === "first-period-start"){
        firstS = tempPer;
    } else if(e.target.id === "first-period-end"){
        firstE = tempPer;
    } else if(e.target.id === "second-period-start"){
        secS = tempPer;
    } else if(e.target.id === "second-period-end"){
        secE = tempPer;
    } else if(e.target.id === "third-period-start"){
        thirdS = tempPer;
    } else if(e.target.id === "third-period-end"){
        thirdE = tempPer;
    } else {
        return false;
    }

    // check that all the times are set
    if( firstS !=null && firstE!=null && secS!=null && secE!=null && thirdS!=null && thirdE!=null){
        updateBtn.disabled = false
    } else {
        updateBtn.disabled = true
    }
    return true;
}

const updateTimeline = () => {
    console.log("Updating....");
    let timelines = document.querySelectorAll("#time-legend");
    console.log(timelines);
    timelines.forEach(timeline => {
        // remove previous boxes
        let boxes = document.querySelectorAll(".fp");
        boxes.forEach(box => {
            let tempParent = box.parentElement;
            tempParent.removeChild(box);
        });
    });
    if(firstS === null || firstE === null){
        console.log("set a time");
        return false;
    }
    let firstPeriodLength = firstE - firstS;
    let secondPeriodLength = secE - secS;
    let thirdPeriodLength = thirdE - thirdS;
    let firstBlock = `<div class="fp" style="border: 2px solid blue; height: 115%; width: ${firstPeriodLength}%; display:inline-block; position: absolute; top: -10%; left: ${firstS}%;" ></div>`;
    let secondBlock = `<div class="fp" style="border: 2px solid green; height: 115%; width: ${secondPeriodLength}%; display:inline-block; position: absolute; top: -10%; left: ${secS}%;" ></div>`;
    let thirdBlock = `<div class="fp" style="border: 2px solid purple; height: 115%; width: ${thirdPeriodLength}%; display:inline-block; position: absolute; top: -10%; left: ${thirdS}%;" ></div>`;
    timelines.forEach(timeline => {
        timeline.innerHTML += firstBlock + secondBlock + thirdBlock;
    });

}

updateBtn.addEventListener('click', updateTimeline);

allInputs.forEach(element => {
    element.addEventListener('change', addtoTimeline);
});