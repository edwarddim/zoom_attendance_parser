/*
    Attendance parser for Coding Dojo, but Chris Thompson
    and Jim Reeder v.1.0
*/

let userlist = document.getElementById('usersSelect')
let meetingslist = document.getElementById('meetingsList')
let occurrenceslist = document.getElementById('occurrencesList')

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

getUsers()


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
    elem.innerText = `${meeting.start_time}`
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
    showAttendance(attendees); // display the records
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

// This function takes in a datetime object and converts it from Zulu or UTC 
// to mst mountian time
const convertToMST = (dateObj) => {
    let date = new Date(dateObj);
    let mstDate = date.toLocaleString('en-US', {timeZone: 'America/Denver'})
    return mstDate;
}

// updated to accept a sorted array
const showAttendance = (participantsArr) => {
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
        for(let j = 0; j<partLen; j++ ){
            let joinTime = part.join_times[j];
            let jt = new Date(joinTime);
            let st = new Date(jt);
            st.setHours(6 + 7-userOffSet);
            st.setMinutes(0);
            st.setSeconds(0);
            
            let startMins = st.getTime()/60000;
            let joinMins = jt.getTime()/60000;
            let offset = joinMins-startMins;
            let joinPercent = Math.round((offset/720)*100);
            let durationPercent = Math.round(((part.durations[j]/60)/720)*100);
            if(durationPercent === 0){
                durationPercent = 1;
            }
            totalTime += part.durations[j];
            let durationCheck = Math.floor(joinPercent)+ Math.floor(durationPercent);
            if(durationCheck>100){
                durationPercent = 100 - Math.floor(joinPercent);
            }
            let attendedHtml = `<div style="position: absolute; left: ${joinPercent}%; height: 100%; width: ${durationPercent}%; background: black;" ></div>`;
            if(joinPercent<100){
                tempHTML += attendedHtml;
            }
        }

        totalTime = Math.round(totalTime / 60);
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
    const dayStart = new Date("1970-01-01T06:00");

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
    let firstBlock = `<div class="fp" style="z-index:10; border: 2px solid blue; height: ${tableHeight-tabelLimit}px; width: ${fwPer}%; display:inline-block; position: absolute; top: 0px; left: ${fpPer}%;" ></div>`;
    let secondBlock = `<div class="fp" style="z-index:10; border: 2px solid green; height: ${tableHeight-tabelLimit}px; width: ${swPer}%; display:inline-block; position: absolute; top: 0px; left: ${spPer}%;" ></div>`;
    let thridBlock = `<div class="fp" style="z-index:10; border: 2px solid purple; height: ${tableHeight-tabelLimit}px; width: ${twPer}%; display:inline-block; position: absolute; top: 0px; left: ${tpPer}%;" ></div>`;

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

updateBtn.addEventListener('click', addMarkers);
