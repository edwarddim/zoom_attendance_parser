console.log('loaded script')

let userlist = document.getElementById('usersSelect')
let meetingslist = document.getElementById('meetingsList')
let occurrenceslist = document.getElementById('occurrencesList')
const getUsers = ()=>{
    console.log('prefetch');
    fetch('http://localhost:8000/users',{method:'POST'})
    
    .then(res=>res.json())
        .then(data=>{
            console.log('incoming users',data)
            console.log('thening' , data);
            let users = data.users
            users.forEach(user => {
                //console.log('eaching', user);
                let option = document.createElement('option')
                option.value = user.id;
                option.innerText=`${user.first_name} ${user.last_name}`
                userlist.append(option)
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
    let elem = document.createElement('div')
    elem.innerHTML = `<h2>${meeting.topic}</h2><h3>${meeting.id}</h3><button onclick="getMeeting(${meeting.id})">Recent</button>`
    elem.classList.add("meeting")
    return elem 
}

const getMeetings = ()=>{
    meetingsList.innerHTML = '';
    console.log('getting meetings for ', userlist.options[userlist.selectedIndex].text, userlist.value )
    fetch('http://localhost:8000/meetings/'+userlist.value,{method:"POST"})
    .then((res)=>res.json())
    .then(res=>{
        res.meetings.forEach(meeting => {
            meetingsList.append(addMeetingElem(meeting))
        });
    })
}

//GET MEETING

const addOccurrenceElem = (meetingID,meeting)=>{
    let elem = document.createElement('div')
    elem.innerHTML = `<h2>${meeting.occurrence_id}</h2><h3>${meeting.start_time}</h3><button onclick="getOccurance(${meetingID},${meeting.occurrence_id})">Attendance</button>`
    elem.classList.add("meeting")
    return elem 
}

let occurrences = [];
const getMeeting = (meetingId)=>{
    //console.log('getting meeting', )
    fetch('http://localhost:8000/meeting/'+meetingId,{method:"POST"})

    
    .then((res)=>res.json())
    .then(res=>{
        //console.log('got meeting',res)
        res.occurrences.forEach(meeting => {
            occurrenceslist.append(addOccurrenceElem(meetingId,meeting))
        });
    })
}

//GetOccurance uuid

const getOccurance = (meetingId,occurrenceId)=>{
    console.log('Getting occurance', occurrenceId);
    fetch(`http://localhost:8000/occurrence/${meetingId}/${occurrenceId}`,{method:"POST"})
    .then((res)=>res.json())
    .then(res=>{
        console.log('got occurrence',res)
        getAttendance(res.uuid)
    })

}



//GET ATTENDANCE

const getAttendance = (meeting)=>{
    console.log('Some day....');
    fetch("http://localhost:8000/part/"+83349520392,{method:'POST'})
    .then(res=>res.json())
    .then(res=>{
        console.log('parts????',res)
    })
}