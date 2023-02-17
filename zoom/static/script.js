//console.log('loaded script')

let userlist = document.getElementById('usersSelect')
let meetingslist = document.getElementById('meetingsList')
let occurrenceslist = document.getElementById('occurrencesList')
//let attendanceslist = document.getElementById('attendancesList')

const getUsers = ()=>{
    //console.log('prefetch');
    fetch('http://localhost:8000/users',{method:'POST'})
    
    .then(res=>res.json())
        .then(data=>{
            //console.log('incoming users',data)
            //console.log('thening' , data);
            let users = data.users
            users.forEach(user => {
                //console.log('eaching', user);
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


// GET MEETINGS
// create meeting html

const addMeetingElem =(meeting)=>{
    let elem = document.createElement('option')
    elem.value = meeting.id
    elem.innerText = `${meeting.topic}`
    
    return elem 
}

const getMeetings = ()=>{
    meetingsList.innerHTML = '';
    occurrenceslist.innerHTML = '';
   // console.log('getting meetings for ', userlist.options[userlist.selectedIndex].text, userlist.value )
    fetch('http://localhost:8000/meetings/'+userlist.value,{method:"POST"})
    .then((res)=>res.json())
    .then(res=>{
        res.meetings.forEach(meeting => {
            meetingsList.append(addMeetingElem(meeting))
        });
    })
}

//GET MEETING

const addOccurrenceElem = (meeting)=>{
    let elem = document.createElement('option')
    elem.value = meeting.uuid
    elem.innerText = `${meeting.start_time}`
    
    return elem 
}

let occurrences = [];
const getMeeting = ()=>{
    occurrenceslist.innerHTML = '';
    
    //console.log('getting meeting', )
    fetch('http://localhost:8000/meeting/'+meetingslist.value,{method:"POST"})

    
    .then((res)=>res.json())
    .then(res=>{
        //console.log('got meeting',res)
        res.occurrences.forEach(meeting => {
            occurrenceslist.append(addOccurrenceElem(meeting))
        });
    })
}

//GET ATTENDANCE

const processRecord = (record)=>{
    let elem = document.createElement('div')
    elem.innerHTML = `<h2>${record.name}</h2><h3>${record.user_email}</h3> <h4>Login: ${record.join_time} - Logout: ${record.leave_time}</h4>`
    elem.classList.add("card")
    return elem 
}


// move this inside get attendance
// and change this to be an array! because that is what is being created now!
let attendanceObj ={}

const getAttendance = ()=>{
    const elem = document.getElementById('table-body');
    elem.innerHTML = "";
    let records = 0
    attendance = []
    let preEncode = occurrenceslist.value
    let encodedId = preEncode.replace('/','%252F')
    //console.log('encoded?',preEncode,encodedId);
    //{page_count: 1, page_size: 300, total_records: 155, next_page_token: '', participants: Array(155)}
    fetch("http://localhost:8000/part/"+encodedId,{method:'POST'})
    .then(res=>res.json())
    .then(res=>{
        //console.log('parts????',res)
        attendanceObj = res
            cleanDataObj(attendanceObj)
            attendanceObj = flattenParticipants(attendanceObj)
            showAttendance(attendanceObj)
        })
        
        
    
}

// let zoomData = {"page_count":1,"page_size":30,"total_records":9,"next_page_token":"","participants":[{"id":"UaNQgyQYSM-qKsOyfaDzGQ","user_id":"16778240","name":"fake_user_2","user_email":"fake_user_2@email.com","join_time":"2023-01-27T18:47:28Z","leave_time":"2023-01-27T18:47:58Z","duration":30,"attentiveness_score":"","failover":false,"status":"in_meeting","customer_key":""},{"id":"UaNQgyQYSM-qKsOyfaDzGQ","user_id":"16779264","name":"fake_user_2","user_email":"fake_user_2@email.com","join_time":"2023-01-27T18:47:58Z","leave_time":"2023-01-27T19:32:32Z","duration":2674,"attentiveness_score":"","bo_mtg_id":"C0Vqcg+k7BWzcIf2vU7Phg==","failover":false,"status":"in_meeting","customer_key":""},{"id":"QKSGs6BxSHSZkcM95K1i6A","user_id":"16780288","name":"fake_user_1","user_email":"fake_user_1@email.com","join_time":"2023-01-27T19:32:25Z","leave_time":"2023-01-27T19:33:04Z","duration":39,"attentiveness_score":"","failover":false,"status":"in_meeting","customer_key":""},{"id":"QKSGs6BxSHSZkcM95K1i6A","user_id":"16781312","name":"fake_user_1","user_email":"fake_user_1@email.com","join_time":"2023-01-27T19:33:04Z","leave_time":"2023-01-27T21:17:07Z","duration":6243,"attentiveness_score":"","bo_mtg_id":"B0a5v9OghzRkuFnO2Zjegg==","failover":false,"status":"in_meeting","customer_key":""},{"id":"UaNQgyQYSM-qKsOyfaDzGQ","user_id":"16782336","name":"fake_user_2","user_email":"fake_user_2@email.com","join_time":"2023-01-27T20:05:02Z","leave_time":"2023-01-27T20:05:18Z","duration":16,"attentiveness_score":"","failover":false,"status":"in_meeting","customer_key":""},{"id":"UaNQgyQYSM-qKsOyfaDzGQ","user_id":"16783360","name":"fake_user_2","user_email":"fake_user_2@email.com","join_time":"2023-01-27T20:05:19Z","leave_time":"2023-01-27T21:04:17Z","duration":3538,"attentiveness_score":"","bo_mtg_id":"C0Vqcg+k7BWzcIf2vU7Phg==","failover":false,"status":"in_meeting","customer_key":""},{"id":"AJ9PgIk8RKmF69AbEvJAjQ","user_id":"16784384","name":"fake_user_3","user_email":"","join_time":"2023-01-27T21:08:28Z","leave_time":"2023-01-27T21:08:38Z","duration":10,"attentiveness_score":"","failover":false,"status":"in_meeting","customer_key":""},{"id":"","user_id":"16785408","name":"fake_user_3","user_email":"","join_time":"2023-01-27T21:08:39Z","leave_time":"2023-01-27T21:09:05Z","duration":26,"attentiveness_score":"","bo_mtg_id":"B0a5v9OghzRkuFnO2Zjegg==","failover":false,"status":"in_meeting","customer_key":""},{"id":"AJ9PgIk8RKmF69AbEvJAjQ","user_id":"16786432","name":"fake_user_3","user_email":"","join_time":"2023-01-27T21:09:05Z","leave_time":"2023-01-27T21:09:07Z","duration":2,"attentiveness_score":"","failover":false,"status":"in_meeting","customer_key":""}]}

// console.log(zoomData);

// flattenParticipatents takes a zoom data response.
// take the returned zoom data and removes duplicates so that you have 
// one entry for each unique vistor with an array of join times and leaves times
// attendees = {
//     "asdfeaewasdfa":{
//         "name":"Attendee name"
//         "join_times":[],
//         "leave_times":[],
//         'durations':[]
//     },
// }
// returns an object with the attendee id as the key and the fields shown above
const flattenParticipants = (zObj) => {
    let attendees = {};
    let attArr = [];
    zObj.participants.forEach(attendee => {
        if(!attendees.hasOwnProperty(attendee.id)){
            attendees[attendee.id] = {
                "name":attendee.name,
                "join_times":[attendee.join_time],
                "leave_times":[attendee.leave_time],
                "durations":[attendee.duration]
            }
        } else {
            attendees[attendee.id].join_times.push(attendee.join_time);
            attendees[attendee.id].leave_times.push(attendee.leave_time);
            attendees[attendee.id].durations.push(attendee.duration);
        }
    });
    // console.log(attendees);

    for (const att in attendees){
        
        attArr.push(attendees[att]);
    }

    console.log(attArr);
    attArr.sort((a,b) => a.name.localeCompare(b.name));
    console.log(attArr);

    return attArr;
}

// Clean data obj is designed to check if there are any entries in the zoom obj
// that do not have a valid id, 
const cleanDataObj = (zObj) =>{
    let tempid = '1000000000000000000000'
    zObj.participants.forEach(entry => {
        if(entry.id === ""){
            //console.log('found blank', entry.name);
            let name = entry.name;
            
            for(let i = 0; i < zObj.participants.length; i ++){
                if(zObj.participants[i].name === name && zObj.participants[i].id && zObj.participants[i].id != '' ){
                    //console.log('found match', zObj.participants[i].id);
                    entry.id = zObj.participants[i].id
                    
                }
            }
          
        }
    });
     //console.log(zObj);
}

// this function take an attendee object returned by the flaten function
// and creates the html to update the page for the table.  
// need to convert Z to mst. Zulu time is 7 hours ahead of MST so we will need to
// subtract 7 hours from the times to put them in MST.
const displayData = (attendeeObj) => {

}

// This function takes in a datetime object and converts it from Zulu or UTC 
// to mst mountian time
const convertToMST = (dateObj) => {
    let date = new Date(dateObj);
    // console.log(date);
    let mstDate = date.toLocaleString('en-US', {timeZone: 'America/Denver'})
    //console.log(mstDate);
    return mstDate;
}


// updated to accept a sorted array
const showAttendance = (participantsArr) => {
    // Variables 
    let i = 1 // record number
    // let startTime = new Date();
    // startTime.setHours(6);
    // startTime.setMinutes(0);
    // startTime = convertToMST(startTime)
    //console.log(startTime.getHours());
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
        //console.log(part);
        let userOffSet = new Date().getTimezoneOffset()/60
        for(let j = 0; j<partLen; j++ ){
            let joinTime = part.join_times[j];
            let jt = new Date(joinTime);
            //console.log('jt ', jt)
            let st = new Date(jt);
            st.setHours(6 + 7-userOffSet);
            st.setMinutes(0);
            st.setSeconds(0);
            //console.log('st ', st)
            
            let startMins = st.getTime()/60000;
            let joinMins = jt.getTime()/60000;
            let offset = joinMins-startMins;
            let joinPercent = Math.round((offset/720)*100);
            let durationPercent = Math.round(((part.durations[j]/60)/720)*100);
            if(durationPercent === 0){
                durationPercent = 1;
            }
            // console.log("start Time: " + startMins, "Joined Time: " + joinMins, "joined after: " +  offset, "percentage: " + joinPercent, "duration percentage: " + durationPercent );
            totalTime += part.durations[j];

            //console.log(`Jointime %: ${Math.floor(joinPercent)}, Duration %: ${durationPercent}, Total: ${Math.floor(joinPercent)+ Math.floor(durationPercent)}`);
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

    //console.log(participantsObj);
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
