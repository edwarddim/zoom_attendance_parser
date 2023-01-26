const csvSelectForm = document.getElementById("attendance-get")
const csvFile = document.getElementById("csvFile")
const tableBody = document.getElementById("table-body");

const convertTime = (timeh) => {
    let [time, mod] = timeh.split(' ');
    let [hrs, min] = time.split(':');

    if (hrs ==='12'){
        hrs ="00";
    }
    if (mod === 'PM'){
        hrs = parseInt(hrs, 10)+12;
    }
    return `${hrs}:${min}:00`;
}


const updatePage = (somecsvobj) => {
    let i = 1;
    tableBody.innerHTML = "";
    let offset = document.getElementById("offset");
    offset = ((offset.value*60)/ 720)*100;
    console.log(offset);
    for (key in somecsvobj.attendance_record){

        // ok so this monstrocity removes "(guest)" and " - instructor" and removes whitespace at the cost of dev tears!
        let monsteress = key.split('(')[0].split(' -')[0].trim().replace(/\s+/g, '-').toLowerCase();

        let tr = document.createElement('tr');
        let th0 = document.createElement('th');
        th0.setAttribute('scope', 'row');
        th0.innerText = i;
        i++;
        let td1 = document.createElement('td');
        td1.innerText = monsteress;
        let td2 = document.createElement('td');

        // all the timeline crap has to go here wamp wamp
        let thisRecord = somecsvobj.attendance_record[key];
        let joinedAt = null;
        let joinedLen = null;
        let tempHtml = ""
        console.log(thisRecord);
        for(let i = 0; i < thisRecord.joinTime.length; i++ ){
            joinedAt = ((((Date.parse(thisRecord.joinTime[i]) - Date.parse("01 Jan 1970 06:00:00 GMT")) / 60000) / 720)*100) + offset;
            if(joinedAt < 0){
                console.log(joinedAt);
                joinedAt = 0;
            }
            joinedLen = (((Date.parse(thisRecord.leaveTime[i]) - Date.parse(thisRecord.joinTime[i])) / 60000) / 720)*100;
            let attendedHtml = `<div style="position: absolute; left: ${joinedAt}%; height: 100%; width: ${joinedLen}%; background: black;" ></div>`;
            tempHtml += attendedHtml;
        }


        td2.innerHTML = `<div id="${monsteress}" class="timeline-container">${tempHtml}</div>`;
        let td3 = document.createElement('td');
        td3.innerText = somecsvobj.attendance_record[key].totalTime
        tr.appendChild(th0);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);



        tableBody.appendChild(tr);
    }
}


const parse = (sometext) =>{
    let i = 0;
    let textArr = [];
    let tempStr = "";
    let csvObj = {
        "meeting_info":{},
        "attendance_record":{}
        };


    // Split the text into an array
    while(sometext[i] != null){
        tempStr += sometext[i];
        if(sometext[i]== "\r"){
            tempStr = tempStr.substring(0, tempStr.length-1);
            if(tempStr.substring(0,1) == '\n'){
                tempStr = tempStr.substring(1, tempStr.length)
            };
            textArr.push(tempStr);
            // console.log(tempStr);
            tempStr = "";
        }
        i++;
    }


    i = 0;  
    // Get the attendance header info
    let tempHeader = textArr[0].split(',');
    let tempData = textArr[1].split(',');
    for(let j = 0; j < tempHeader.length; j++){
        csvObj.meeting_info[tempHeader[j]] = tempData[j]
    }

    let notHeader = false;

    textArr = textArr.slice(3);

    // console.log(textArr);

    for(let i = 1; i < textArr.length; i++){
        // in the temp data we want to get the participant, join time, and leave time for now
        tempData = textArr[i].split(',');


        let monster = tempData[0];

        if(!csvObj.attendance_record.hasOwnProperty(tempData[0])){
            let anyDate = '01 Jan 1970 ';
            let startTime = anyDate + convertTime(tempData[11]) + " GMT";
            let endTime = anyDate + convertTime(tempData[12].slice(0,8)) + " GMT";
            let tempTotalTime =  (Date.parse(endTime) - Date.parse(startTime)) / 60000;
            csvObj.attendance_record[monster] = {'joinTime':[startTime], 'leaveTime':[endTime], 'periodTime':[tempTotalTime],  "totalTime": tempTotalTime};
        } else {
            let anyDate = '01 Jan 1970 ';
            let startTime = anyDate + convertTime(tempData[11]) + " GMT";
            let endTime = anyDate + convertTime(tempData[12].slice(0,8)) + " GMT";
            let tempTotalTime =  (Date.parse(endTime) - Date.parse(startTime)) / 60000;
            csvObj.attendance_record[monster].joinTime.push(startTime);
            csvObj.attendance_record[monster].leaveTime.push(endTime);
            csvObj.attendance_record[monster].periodTime.push(tempTotalTime)
            csvObj.attendance_record[monster].totalTime = csvObj.attendance_record[tempData[0]].totalTime + tempTotalTime
        }
    }

    updatePage(csvObj);
    console.log(csvObj);
};

const checkAttendance = (e) => {
    e.preventDefault()
    console.log("checking attedance");
    const input = csvFile.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result
        // console.log(text);
        parse(text)
    };
    reader.readAsText(input)
}


csvSelectForm.addEventListener("submit",checkAttendance)