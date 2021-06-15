
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
    console.log(response); // TODO: Remove!
    if (response.result.items) {

      var getNowPlayingDiv = document.getElementById('pats-calendar'); // Make sure your HTML has This ID!
      // Create a table with events:
      var calendarRows = ['<table class="gcal-event"><tbody>'];
      response.result.items.forEach(function (entry) {
        var eventDate = dayjs(entry.start.dateTime).format('LLL'); // eg: March 26, 2020 6:00 PM
        var eventEndsAt = dayjs(entry.end.dateTime).format('LT'); // eg: 7:00 PM
        calendarRows.push('' +
          '<tr>' + // class="gcal-event__tr"
          '<td>' + // class="gcal-event__td-time"
          '<time datetime="' + entry.start.dateTime + '>' + //" class="gcal-event__time-start" eventDate + '</time> - ' +
          '<time datetime="' + entry.end.dateTime + '>' + eventEndsAt + '</time>' + //" class="gcal-event__time-end"
          '</td>' +
          '<td>' + entry.summary + '</td>' + // class="gcal-event__td-event-name"
          '</tr>');
      });
      calendarRows.push('</tbody></table>');
      getNowPlayingDiv.innerHTML = calendarRows.join('');
    }
  });
}
