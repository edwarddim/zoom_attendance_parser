let zoomData = {"page_count":1,"page_size":30,"total_records":9,"next_page_token":"","participants":[{"id":"UaNQgyQYSM-qKsOyfaDzGQ","user_id":"16778240","name":"fake_user_2","user_email":"fake_user_2@email.com","join_time":"2023-01-27T18:47:28Z","leave_time":"2023-01-27T18:47:58Z","duration":30,"attentiveness_score":"","failover":false,"status":"in_meeting","customer_key":""},{"id":"UaNQgyQYSM-qKsOyfaDzGQ","user_id":"16779264","name":"fake_user_2","user_email":"fake_user_2@email.com","join_time":"2023-01-27T18:47:58Z","leave_time":"2023-01-27T19:32:32Z","duration":2674,"attentiveness_score":"","bo_mtg_id":"C0Vqcg+k7BWzcIf2vU7Phg==","failover":false,"status":"in_meeting","customer_key":""},{"id":"QKSGs6BxSHSZkcM95K1i6A","user_id":"16780288","name":"fake_user_1","user_email":"fake_user_1@email.com","join_time":"2023-01-27T19:32:25Z","leave_time":"2023-01-27T19:33:04Z","duration":39,"attentiveness_score":"","failover":false,"status":"in_meeting","customer_key":""},{"id":"QKSGs6BxSHSZkcM95K1i6A","user_id":"16781312","name":"fake_user_1","user_email":"fake_user_1@email.com","join_time":"2023-01-27T19:33:04Z","leave_time":"2023-01-27T21:17:07Z","duration":6243,"attentiveness_score":"","bo_mtg_id":"B0a5v9OghzRkuFnO2Zjegg==","failover":false,"status":"in_meeting","customer_key":""},{"id":"UaNQgyQYSM-qKsOyfaDzGQ","user_id":"16782336","name":"fake_user_2","user_email":"fake_user_2@email.com","join_time":"2023-01-27T20:05:02Z","leave_time":"2023-01-27T20:05:18Z","duration":16,"attentiveness_score":"","failover":false,"status":"in_meeting","customer_key":""},{"id":"UaNQgyQYSM-qKsOyfaDzGQ","user_id":"16783360","name":"fake_user_2","user_email":"fake_user_2@email.com","join_time":"2023-01-27T20:05:19Z","leave_time":"2023-01-27T21:04:17Z","duration":3538,"attentiveness_score":"","bo_mtg_id":"C0Vqcg+k7BWzcIf2vU7Phg==","failover":false,"status":"in_meeting","customer_key":""},{"id":"AJ9PgIk8RKmF69AbEvJAjQ","user_id":"16784384","name":"fake_user_3","user_email":"","join_time":"2023-01-27T21:08:28Z","leave_time":"2023-01-27T21:08:38Z","duration":10,"attentiveness_score":"","failover":false,"status":"in_meeting","customer_key":""},{"id":"","user_id":"16785408","name":"fake_user_3","user_email":"","join_time":"2023-01-27T21:08:39Z","leave_time":"2023-01-27T21:09:05Z","duration":26,"attentiveness_score":"","bo_mtg_id":"B0a5v9OghzRkuFnO2Zjegg==","failover":false,"status":"in_meeting","customer_key":""},{"id":"AJ9PgIk8RKmF69AbEvJAjQ","user_id":"16786432","name":"fake_user_3","user_email":"","join_time":"2023-01-27T21:09:05Z","leave_time":"2023-01-27T21:09:07Z","duration":2,"attentiveness_score":"","failover":false,"status":"in_meeting","customer_key":""}]}

console.log(zoomData.participants);

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
    console.log(attendees);
    return attendees;
}

// Clean data obj is designed to check if there are any entries in the zoom obj
// that do not have a valid id, 
const cleanDataObj = (zObj) =>{
    zObj.participants.forEach(entry => {
        if(entry.id === ""){
            let name = entry.name;
            for(let i = 0; i < zObj.participants.length; i ++){
                if(zObj.participants[i].name === name && zObj.participants.id != ""){
                    entry.id = zObj.participants[i].id
                }
            }
        }
    });
    // console.log(zObj);
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
    console.log(date);
    let mstDate = date.toLocaleString('en-US', {timeZone: 'America/Denver'})
    console.log(mstDate);
    return mstDate;
}

cleanDataObj(zoomData)
flattenParticipants(zoomData)

convertToMST("2023-01-27T21:08:39Z")