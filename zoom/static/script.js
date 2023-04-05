/*
    Attendance parser for Coding Dojo, by Chris Thompson
    and Jim Reeder v.1.0
*/

let userlist = isAdmin?document.getElementById('usersSelect'):{};
let meetingslist = document.getElementById('meetingsList')
let occurrenceslist = document.getElementById('occurrencesList')

//options to control display of localized date strings
let timeOptions ={
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit"
}

// *******************************************************************************************
// START BACKEND CALLS

// GET USERS
// Gets the users from zoom so that we can look at their meetings
const getUsers = ()=>{
    fetch('http://localhost:8000/users',{method:'POST'})
    
    .then(res=>res.json())
        .then(data=>{
            let users = data.users.sort((a,b) => (a.first_name > b.first_name) ? 1 : ((b.first_name > a.first_name) ? -1 : 0))
            users.forEach(user => {
                if(user.dept == "Instruction"){
                    let option = document.createElement('option')
                    option.value = user.id;
                    option.innerText=`${user.first_name} ${user.last_name}`
                    userlist.append(option)
                }
            })
        })
    .catch(err=>{
        console.log(err)
    })
}
const getUser = ()=>{
    fetch('http://localhost:8000/user',{method:'POST'})
    
    .then(res=>res.json())
        .then(data=>{
            console.log('welcome instructor', data.user)
            userlist.value = data.user.id;
            console.log('userlist',userlist)
            getMeetings();
        })
    .catch(err=>{
        console.log(err)
    })
}

isAdmin?getUsers():getUser();


// Add meeting element is used in getMeetings() to add options to the list
// create meeting html
const addMeetingElem =(meeting)=>{
    let elem = document.createElement('option')
    elem.value = meeting.id
    elem.innerText = `${meeting.topic}`
    return elem 
}

//Get Meetings makes the request to the back end to get the meetings for the 
// drop down list
const getMeetings = ()=>{
    console.log('getting meetings ',userlist.value);
    meetingslist.innerHTML = '';
    occurrenceslist.innerHTML = '';
    fetch('http://localhost:8000/meetings/'+userlist.value,{method:"POST"})
    .then((res)=>res.json())
    .then(res=>{
        let meetings = res.meetings.sort(((a,b) => (a.topic > b.topic) ? 1 : ((b.topic > a.topic) ? -1 : 0)))
        meetings.forEach(meeting => {
            meetingslist.append(addMeetingElem(meeting))
        });
    })
}

// Add Occurances
// Creates options for the occurances list, used in Get Meeting below
const addOccurrenceElem = (meeting)=>{
    let elem = document.createElement('option')
    elem.value = meeting.uuid
    elem.innerText = `${meeting.start_time.day}`
    return elem 
}

// GET MEETING occurances
// Returns a list of occurances from the back end and displays them in the
// occurances select
const getMeeting = ()=>{
    occurrenceslist.innerHTML = '';
    fetch('http://localhost:8000/meeting/'+meetingslist.value,{method:"POST"})
        .then((res)=>res.json())
        .then(res=>{
            let occurrences = res.occurrences.sort((a,b) => (a.start_time < b.start_time) ? 1 : ((b.start_time < a.start_time) ? -1 : 0))
            occurrences.forEach(meeting => {
                meeting.start_time = convertToWorkingTime(new Date(meeting.start_time))
                occurrenceslist.append(addOccurrenceElem(meeting))
            });
    })
}

// END BACK END CALLS
// *******************************************************************************************
// *******************************************************************************************
// START FRONT END UPDATING

/* GET ATTENDANCE
    This is the main entry point for showing the attendance
    once a meeting has been selected this function is called by the "Get Attendance btn"
    it then retrieves the attendance object from zoom and processes it and finally displays it
*/ 
const getAttendance = async ()=>{
    const elem = document.getElementById('table-body');
    elem.innerHTML = "";
    let preEncode = occurrenceslist.value
    let encodedId = encodeURIComponent(encodeURIComponent(preEncode))
    const attendanceRes = await fetch("http://localhost:8000/part/"+encodedId,{method:'POST'});// fetch from the back end
    const attendanceJson = await attendanceRes.json(); // conver the response into json
    const attendeesWithId = await addHashedIdsToAttendees(attendanceJson); // Add unique ID's
    const hashedIdToAttendee = mergeJoinTimes(attendeesWithId); // Merge all the records 
    const attendees = Object.values(hashedIdToAttendee); // Convert to an Array
    attendees.sort((a,b) => a.name.localeCompare(b.name)); // sort the records
    attendees.forEach(attendee =>{updateAttendeesTime(attendee)});//Convert join and leaves to MT
    attendees.forEach(attendee =>mergeTimes(attendee)); //Merge contiguous blocks of time.
    showAttendance(attendees); // display the records
}


const mergeTimes = (attendee)=>{
    let newJoins = [attendee.join_times[0]]
    let newLeaves = [attendee.leave_times[0]]
    let newDurations = []
    for(i=1; i< attendee.join_times.length; i++){
        let nextJoin =attendee.join_times[i]
        let lastLeave = newLeaves[newLeaves.length-1]
        if(nextJoin.hours === lastLeave.hours && (nextJoin.minutes == lastLeave.minutes || nextJoin.minutes -1 == lastLeave.minutes)){
                //next join is equal or within 1 minute of last leave => merge them
                newLeaves.pop()
                newLeaves.push(attendee.leave_times[i])
            
        }else{
            newDurations.push(differenceInMinutes(newJoins[newJoins.length-1],newLeaves[newLeaves.length-1]))
            newJoins.push(nextJoin)
            newLeaves.push(attendee.leave_times[i])
        }
    }
    newDurations.push(differenceInMinutes(newJoins[newJoins.length-1],newLeaves[newLeaves.length-1]))
    attendee.join_times = newJoins
    attendee.leave_times = newLeaves
    attendee.durations= newDurations
    console.log(attendee)
}

const differenceInMinutes = (start,end)=>{
    return (((end.hours - start.hours)* 60) + (end.minutes > start.minutes? end.minutes-start.minutes: -start.minutes + end.minutes))
}

const getMTOffset = () => {
    dt = new Date();
    let month = dt.getUTCMonth(); // utc month (jan is 0)
    let date = dt.getUTCDate(); // utc date
    let hour = dt.getUTCHours(); // utc hours (midnight is 0)
    let day = dt.getUTCDay(); // utc weekday (sunday is 0)
    // assume MST offset
    let offset = 7;
    // adjust to MDT offset as needed
    if ((month > 2 && month < 10) || (month === 2 && date > 14)) {
      offset = 6;
    } else if (month === 2 && date > 7 && date < 15) {
      if ((day && date - day > 7) || (day === 0 && hour - offset >= 2)) {
        offset = 6;
      }
    } else if (month === 10 && date < 8) {
      if ((day && date - day < 0) || (day === 0 && hour - offset < 1)) {
        offset = 6;
      }
    }
    return offset;
  };

const updateAttendeesTime = (attendee) =>{
    attendee.join_times = attendee.join_times.map(join => convertToWorkingTime(new Date(join)))
    attendee.leave_times = attendee.leave_times.map(leave => convertToWorkingTime(new Date(leave)))
}

//date time string => {day:string, hours:int, minutes:int} in MT
const convertToWorkingTime = (dateTime) =>{
    let userOffSet = new Date().getTimezoneOffset()/60
    const workingTime = {
        day:dateTime.toLocaleString('en',timeOptions),
        hours:dateTime.getHours() -getMTOffset() + userOffSet,
        minutes:dateTime.getMinutes()
    }
    return workingTime
}

// HASHES USER NAME INTO UNIQUE ID USED IN addHashedIdsToAttendees
async function sha256(message){
    const msgBuffer = new TextEncoder().encode(message);                     
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);     
    const hashArray = Array.from(new Uint8Array(hashBuffer));                
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Adds a unique ID to each record
const addHashedIdsToAttendees = async (zObj) => {
    const mappedAttendeePromises = zObj.participants.map(async (attendee) => {
        const hash = await sha256(attendee.name);
        return {
            ...attendee,
            hashedId: hash
        }
    });

    const mappedAttendees = await Promise.all(mappedAttendeePromises);
    return mappedAttendees;
}

// Joins all records with the same id
const mergeJoinTimes = (attendeesWithId) => {
    const table = {};

    for (const attendee of attendeesWithId) {
        const { hashedId, name, duration, join_time, leave_time} = attendee;

        if (table.hasOwnProperty(hashedId) === false) {
            table[hashedId] = {
                name,
                join_times: [join_time],
                leave_times: [leave_time],
                durations: [duration],
                times: [
                    {
                        join_time,
                        leave_time,
                        duration
                    }
                ]
            }
        }
        else {
            const attendeeToUpdate = table[hashedId];
            attendeeToUpdate.join_times.push(join_time);
            attendeeToUpdate.leave_times.push(leave_time);
            attendeeToUpdate.durations.push(duration)

            attendeeToUpdate.times.push({
                join_time,
                leave_time,
                duration
            })
        }
    }

    return table;
}

// // This function takes in a datetime object and converts it from Zulu or UTC 
// // to mst mountian time
// const convertToMST = (dateObj) => {
//     let date = new Date(dateObj);
//     let mstDate = date.toLocaleString('en-US', {timeZone: 'America/Denver'})
//     return mstDate;
// }

// updated to accept a sorted array
const showAttendance = (participantsArr) => {
    changeTimeline()
    // Variables 
    let i = 1 // record number
    let tableBody = document.getElementById("table-body");
    // create HTML elements
    tableBody.innerHTML = '<tr><td class="col-1"></td><td class="col-2"></td><td id="time-legend" class="col-8"></td><td class="col-1"></td></tr>';
    
    for (const participant in participantsArr){
        // create document elements
        let tr = document.createElement("tr");
        let th0 = document.createElement("th");
        th0.setAttribute('scope', 'row');
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let td3 = document.createElement('td');

        // extract the individual participant
        let part = participantsArr[participant];
        let partLen = part.join_times.length;
        let totalTime = 0;
        th0.innerText = i; // set the record number
        td1.innerText = part.name; // set the name 
        let tempHTML = "";
        let userOffSet = new Date().getTimezoneOffset()/60
        let startMins = document.getElementById('eveningChecked').checked? 540:360; //starting 6 am MT [6 * 60]

        for(let j = 0; j<partLen; j++ ){
            let joinTime = part.join_times[j];
            let leaveTime = part.leave_times[j];
            let joinMins = joinTime.hours * 60 + joinTime.minutes;
            
            let offset = joinMins-startMins;
            let joinPercent = Math.round((offset/720)*100);
            let durationPercent = Math.round(((leaveTime.hours - joinTime.hours) * 60 + (leaveTime.minutes - joinTime.minutes ))/720 *100);
            if(durationPercent === 0){
                durationPercent = 1;
            }
            totalTime += part.durations[j];
            let durationCheck = Math.floor(joinPercent)+ Math.floor(durationPercent);
            if(durationCheck>100){
                durationPercent = 100 - Math.floor(joinPercent);
            }
            
            //console.log(displayJoin)
            let attendedHtml = `<div style="position: absolute; left: ${joinPercent}%; height: 100%; width: ${durationPercent}%; background: black;" onmouseenter="showJoin(event)" onmouseleave="hideJoin(event)" data-joinTime="${joinTime.hours}:${joinTime.minutes>9?joinTime.minutes:'0'+joinTime.minutes}" data-leaveTime="${leaveTime.hours}:${leaveTime.minutes>9?leaveTime.minutes:'0'+leaveTime.minutes}"></div>`;
            if(joinPercent<100){
                tempHTML += attendedHtml;
            }
        }

        
        td2.innerHTML = `<div id="${part.name}" class="timeline-container">${tempHTML}</div>`;
        
        td3.innerText = totalTime + " Min(s)";
        tr.appendChild(th0);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tableBody.appendChild(tr)
        i++; // increment record
    }

}

// add markers to the time line for when students should be in class
let updateBtn = document.getElementById("update-button");

const addMarkers = (event) => {
    event.preventDefault();
    // add a date so we can count ms just basing everything at start for lower numbers
    const refDate = "1970-01-01T";
    const dayStart = document.getElementById('eveningChecked').checked? new Date("1970-01-01T09:00"):new Date("1970-01-01T06:00");

    const p1s = (document.getElementById("first-period-start").value ? new Date(refDate + document.getElementById("first-period-start").value) : null);
    const p1e = (document.getElementById("first-period-end").value ? new Date(refDate + document.getElementById("first-period-end").value) : null);
    const p2s = (document.getElementById("second-period-start").value ? new Date(refDate + document.getElementById("second-period-start").value) : null);
    const p2e = (document.getElementById("second-period-end").value ? new Date(refDate + document.getElementById("second-period-end").value) : null);
    const p3s = (document.getElementById("third-period-start").value ? new Date(refDate + document.getElementById("third-period-start").value) : null);
    const p3e = (document.getElementById("third-period-end").value ? new Date(refDate + document.getElementById("third-period-end").value) : null);
    
    // check to make sure no shannagens are going on from the form
    if(!p1s || !p1e || !p2s || !p2e || !p3s || !p3e){
        return false;
    }

    // calculate the start times and widths of the blocks
    const fpPer = (((p1s - dayStart) / 60000) / 720) * 100;
    const fwPer = (((p1e - p1s)/60000)/720) * 100;
    const spPer = (((p2s - dayStart) / 60000) / 720) * 100;
    const swPer = (((p2e - p2s)/60000)/720) * 100;
    const tpPer = (((p3s - dayStart) / 60000) / 720) * 100;
    const twPer = (((p3e - p3s)/60000)/720) * 100;
    
    // get the length of the table
    const tabelLimit = 30;
    const tableHeight = document.getElementById('attend-table').offsetHeight;
    const windowHeight = window.innerHeight;
    const timeline = document.getElementById('time-legend');
    let lineLength = 0;

    // generate the html blocks
    let firstBlock = `<div class="fp" style="z-index:10; border: 2px solid blue; height: ${tableHeight-tabelLimit}px; width: ${fwPer}%; display:inline-block; position: absolute; top: 0px; left: ${fpPer}%; pointer-events: none; " ></div>`;
    let secondBlock = `<div class="fp" style="z-index:10; border: 2px solid green; height: ${tableHeight-tabelLimit}px; width: ${swPer}%; display:inline-block; position: absolute; top: 0px; left: ${spPer}%; pointer-events: none; " ></div>`;
    let thridBlock = `<div class="fp" style="z-index:10; border: 2px solid purple; height: ${tableHeight-tabelLimit}px; width: ${twPer}%; display:inline-block; position: absolute; top: 0px; left: ${tpPer}%; pointer-events: none; " ></div>`;

    // clear the time on update
    let timelines = document.querySelectorAll("#time-legend");
    timelines.forEach(timeline => {
        // remove previous boxes
        let boxes = document.querySelectorAll(".fp");
        boxes.forEach(box => {
            let tempParent = box.parentElement;
            tempParent.removeChild(box);
        });
    });

    // draw the boxes to the screen
    timeline.innerHTML = firstBlock + secondBlock + thridBlock;
}

const showJoin = (event)=>{
    let timeBox = document.createElement('div')
    timeBox.id = 'timebox'
    timeBox.style.setProperty('position', 'absolute')
    
    timeBox.innerHTML=`<p>${event.target.dataset.jointime}</p><p>${event.target.dataset.leavetime}</p>`
    // timeBox.style.border = `2px solid black`
    document.body.appendChild(timeBox);
    timeBox.style.top = `${event.pageY - timeBox.offsetHeight - 20}px`;
    timeBox.style.left = `${event.clientX - (.5*(timeBox.offsetWidth)) }px`;
    timeBox.style.setProperty('z-index', '1021')
    event.target.addEventListener('mousemove', updateJoin, event)
}

const hideJoin = (event)=>{
    event.target.removeEventListener('mousemove',updateJoin, event)
    document.getElementById('timebox').remove()

}

const updateJoin = (event)=>{
    let timeBox = document.getElementById('timebox')
    timeBox.style.top = `${event.pageY - timeBox.offsetHeight - 20}px`;
    timeBox.style.left = `${event.clientX - (.5*(timeBox.offsetWidth)) }px`;
}

const changeTimeline = ()=>{
    for(let i = 0; i<13; i++){
        if (document.getElementById('eveningChecked').checked){
            i < 4 ?document.getElementById('l'+i).innerText = i + 9 :document.getElementById('l'+i).innerText = i - 3
            i < 3 ?document.getElementById('l'+i).innerText += 'am' :document.getElementById('l'+i).innerText += 'pm'
        }else{
            i < 7 ?document.getElementById('l'+i).innerText = i + 6 :document.getElementById('l'+i).innerText = i - 6
            i < 6 ?document.getElementById('l'+i).innerText += 'am' :document.getElementById('l'+i).innerText += 'pm'
        }
   

    }
    
}

updateBtn.addEventListener('click', addMarkers);
