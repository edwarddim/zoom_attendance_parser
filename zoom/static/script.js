console.log('loaded script')

let userlist = document.getElementById('usersSelect')
let meetingslist = document.getElementById('meetingsList')
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
    elem.innerHTML = `<h2>${meeting.topic}</h2><h3>${meeting.id}</h3>`
    elem.classList.add("meeting")
    return elem 
}

const getMeetings = ()=>{
    console.log('getting meetings for ', userlist.options[userlist.selectedIndex].text, userlist.value )
    fetch('http://localhost:8000/meetings/'+userlist.value,{method:"POST"})
    .then((res)=>res.json())
    .then(res=>{
        res.meetings.forEach(meeting => {
            meetingsList.append(addMeetingElem(meeting))
        });
    })
}