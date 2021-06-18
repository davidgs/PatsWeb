
/* This solution makes use of "simple access" to google, providing only an API Key.
* This way we can only get access to public calendars. To access a private calendar,
* we would need to use OAuth 2.0 access.
*
* "Simple" vs. "Authorized" access: https://developers.google.com/api-client-library/javascript/features/authentication
* Examples of "simple" vs OAuth 2.0 access: https://developers.google.com/api-client-library/javascript/samples/samples#authorizing-and-making-authorized-requests
*
* We will make use of "Option 1: Load the API discovery document, then assemble the request."
* as described in https://developers.google.com/api-client-library/javascript/start/start-js
*/
var calendarId = '42g6umn83iqocerpntvbrlm8lc@group.calendar.google.com';


// Client ID and API key from the Developer Console
var CLIENT_ID = '384658127484-n6abmi12r797i8ks8g2dm8pbc87o2bnk.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBNg22TuxqvcFLZZh9EqnlHXGqa9Ap10_Q';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

//--------------------- Add a 0 to numbers
function padNum(num) {
  if (num <= 9) {
    return "0" + num;
  }
  return num;
}
//--------------------- end

//--------------------- From 24h to Am/Pm
function AmPm(num) {
  if (num <= 12) { return "am " + num; }
  return "pm " + padNum(num - 12);
}
//--------------------- end

//--------------------- num Month to String
function monthString(num) {
  if (num === "01") { return "JAN"; }
  else if (num === "02") { return "FEB"; }
  else if (num === "03") { return "MAR"; }
  else if (num === "04") { return "APR"; }
  else if (num === "05") { return "MAJ"; }
  else if (num === "06") { return "JUN"; }
  else if (num === "07") { return "JUL"; }
  else if (num === "08") { return "AUG"; }
  else if (num === "09") { return "SEP"; }
  else if (num === "10") { return "OCT"; }
  else if (num === "11") { return "NOV"; }
  else if (num === "12") { return "DEC"; }
}
//--------------------- end

//--------------------- from num to day of week
function dayString(num) {
  if (num == "1") { return "mon" }
  else if (num == "2") { return "tue" }
  else if (num == "3") { return "wed" }
  else if (num == "4") { return "thu" }
  else if (num == "5") { return "fri" }
  else if (num == "6") { return "sat" }
  else if (num == "0") { return "sun" }
}
//--------------------- end
function printCalendar() {
  // The "Calendar ID" from your calendar settings page, "Calendar Integration" secion:


}
/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

var userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
if (!userTimeZone) {
  userTimeZone = 'America/New_York';
}

/**
*  Initializes the API client library and sets up sign-in state
*  listeners.
*/
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function (error) {
    console.log(JSON.stringify(error, null, 2));
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    listUpcomingEvents();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
      * Print the summary and start datetime/date of the next ten events in
      * the authorized user's calendar. If no events are found an
      * appropriate message is printed.
      */
function listUpcomingEvents() {
  gapi.client.calendar.events.list({
    'calendarId': calendarId,
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 20,
    'orderBy': 'startTime'
  }).then(function (response) {
    for (var i = 0; i < response.items.length; i++) {
      var li = document.createElement('li');
      var item = response.items[i];
      var classes = [];
      var allDay = item.start.date ? true : false;
      var startDT = allDay ? item.start.date : item.start.dateTime;
      var dateTime = startDT.split("T"); //split date from time
      var date = dateTime[0].split("-"); //split yyyy mm dd
      var startYear = date[0];
      var startMonth = monthString(date[1]);
      var startDay = date[2];
      var startDateISO = new Date(startMonth + " " + startDay + ", " + startYear + " 00:00:00");
      var startDayWeek = dayString(startDateISO.getDay());
      if (allDay == true) { //change this to match your needs
        var str = [
          '<font size="4" face="courier">',
          startDayWeek, ' ',
          startMonth, ' ',
          startDay, ' ',
          startYear, '</font><font size="5" face="courier"> @ ', item.summary, '</font><br><br>'
        ];
      }
      else {
        var time = dateTime[1].split(":"); //split hh ss etc...
        var startHour = AmPm(time[0]);
        var startMin = time[1];
        var str = [ //change this to match your needs
          '<font size="4" face="courier">',
          startDayWeek, ' ',
          startMonth, ' ',
          startDay, ' ',
          startYear, ' - ',
          startHour, ':', startMin, '</font><font size="5" face="courier"> @ ', item.summary, '</font><br><br>'
        ];
      }
      li.innerHTML = str.join('');
      li.setAttribute('class', classes.join(' '));
      document.getElementById('pats-calendar').appendChild(li);
    }
    // document.getElementById('updated').innerHTML = "updated " + today;
    // document.getElementById('calendar').innerHTML = calName;

    // console.log(response); // TODO: Remove!
    // if (response.result.items) {

    //   var getNowPlayingDiv = document.getElementById('pats-calendar'); // Make sure your HTML has This ID!
    //   // Create a table with events:
    //   var calendarRows = ['<table class="gcal-event"><tbody>'];
    //   response.result.items.forEach(function (entry) {
    //     var eventDate = dayjs(entry.start.dateTime).format('LLL'); // eg: March 26, 2020 6:00 PM
    //     var eventEndsAt = dayjs(entry.end.dateTime).format('LT'); // eg: 7:00 PM
    //     calendarRows.push('' +
    //       '<tr>' + // class="gcal-event__tr"
    //       '<td>' + // class="gcal-event__td-time"
    //       '<time datetime="' + entry.start.dateTime + '>' + //" class="gcal-event__time-start" eventDate + '</time> - ' +
    //       '<time datetime="' + entry.end.dateTime + '>' + eventEndsAt + '</time>' + //" class="gcal-event__time-end"
    //       '</td>' +
    //       '<td>' + entry.summary + '</td>' + // class="gcal-event__td-event-name"
    //       '</tr>');
    //   });
    //   calendarRows.push('</tbody></table>');
    //   getNowPlayingDiv.innerHTML = calendarRows.join('');
    // }
  });
}
