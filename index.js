require('dotenv').config();
const axios = require('axios');
const NodeCache = require( "node-cache" );
const { RTMClient } = require('@slack/rtm-api');

axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.SLACK_BOT_TOKEN;

// stdTTL: how long the cache lasts (seconds)
// checkperiod: how frequently do we tidy up cache (seconds)
const userCache = new NodeCache( { stdTTL: 24*60*60, checkperiod: 30*60 } );

const rtm = new RTMClient(process.env.SLACK_BOT_TOKEN);
 
const welcome = `Welcome to the {someting} channel! As you're writing your message, please be sure to follow the channel rules:`
const rules = `
  Rule1
  Rule2
  Rule3
`;

rtm.on('user_typing', (event) => {
  // we don't want to bother people too often, so we cache if we've 
  // prompted someone in the last {stdTTL+-checkperiod} time.

  // only bother the user if they don't exist in the cache.
  if ( userCache.get( event.user ) == undefined ){

    // then add them to the cache so we don't bother again
    userCache.set( event.user, '' );

    // send them the ephemeral message
    axios.post('https://slack.com/api/chat.postEphemeral', {
      attachments: [{"pretext": welcome, "text": rules}],
      channel: event.channel,
      user: event.user
    })
    .then(function(response) {
      // do something with the response.
    })
    .catch(function(error) {
      // do something with the errors.
    });

  }
});
 
(async () => {
  await rtm.start();
})();
