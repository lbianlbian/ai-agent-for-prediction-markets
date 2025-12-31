const DEFAULT_MATCHES_URL = "https://gamma-api.polymarket.com/events?tag_id=100350&closed=false&limit=10&order=endDate,volume&ascending=True";
const SKIM = 0.05;
const TOKEN_PRICE_ADJ = 0.01  // token price from polymarket is always 1 cent too low
const MIN_STAKE = 5;
const MAX_STAKE = 20;
const SEARCH_URL = "https://gamma-api.polymarket.com/public-search?events_status=active&events_tag=soccer";
const CONVERSATION_URL = "https://api.mistral.ai/v1/conversations";

/**
 * returns [str]
 */
function getDefaultMatches(){
  let output = [];
  let fullISOStr = (new Date()).toISOString();
  let no_milliseconds = `${fullISOStr.split(".")[0]}Z`;
  let url = `${DEFAULT_MATCHES_URL}&end_date_min=${no_milliseconds}`;
  let resp = JSON.parse(UrlFetchApp.fetch(url).getContentText());
  for(let game of resp){
    let foundGameTag = false;
    for(let tag of game.tags){
        if(tag.slug == "games"){
            foundGameTag = true;
            break;
        }
    }
    if(!foundGameTag){
        continue;
    }
    if(!game.title.includes(" vs. ")){
        continue;
    }
    if(game.title.includes("More Markets")){
        continue;
    }
    output.push(game.title);
  }
  return output;
}

function randomListChoice(inputList){
  let ind = Math.floor(Math.random() * inputList.length);
  return inputList[ind];
}

/**
 * payload will have query and default_matches, maybe or maybe not conv_id
 * returns object with attributes:
 *  team1
 *  team2
 *  betting_team
 * `stake
 *  links
 *  response
 */
function getAgentResp(payload){
  // build query
  let agent = randomListChoice(AGENTS);
  let default_match = randomListChoice(payload.default_matches);
  let prompt = `
CONTEXT (READ FIRST):
Current time: ${(new Date()).toISOString()}
Default bet (ONLY if user doesn't specify a bet themselves): ${default_match}

USER QUERY: ${payload.query}`;

  // init default output
  let [team1, team2] = default_match.split(" vs. ");
  let defaultAgentResp = {
    team1,
    team2,
    betting_team: team1,
    stake: 5,
    links: [],
    response: "Based on my analysis of the news, this is the best bet for you to make."
  };
  let agentResp = defaultAgentResp;

  // call agent
  let url = CONVERSATION_URL;
  let agent_payload = {
    "inputs": prompt,
    "stream": false
  };
  if(payload.conv_id == undefined){
    agent_payload.agent_id = agent.agent_id;
  }
  else{
    url += `/${payload.conv_id}`;
  }
  let options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      "Authorization": agent.auth,
      "content-type": "application/json"
    },
    payload: JSON.stringify(agent_payload),
    muteHttpExceptions: true
  };
  let response = UrlFetchApp.fetch(url, options);
  
  // parse response for only json
  let respRaw = response.getContentText();
  let resp = JSON.parse(respRaw);
  for(let output of resp.outputs){
    if(output.type != "message.output"){
      continue;
    }
    try{
      let cleanResp = output.content.replace("```json", "").replace("```", "");
      agentResp = JSON.parse(cleanResp);
      break;
    } catch(err){
      continue;
    }
  }

  // if paylod doesn't have conversation id, add it to payload
  if(payload.conv_id == undefined){
    payload.conv_id = resp.conversation_id;
  }

  return agentResp;
}

function levenshteinDistance(s1, s2) {
  if (s1.length < s2.length) {
    return levenshteinDistance(s2, s1);
  }

  if (s2.length === 0) {
    return s1.length;
  }

  let previousRow = [...Array(s2.length + 1).keys()];

  for (let i = 0; i < s1.length; i++) {
    const c1 = s1[i];
    const currentRow = [i + 1];

    for (let j = 0; j < s2.length; j++) {
      const c2 = s2[j];
      const insertions = previousRow[j + 1] + 1;
      const deletions = currentRow[j] + 1;
      const substitutions = previousRow[j] + (c1 !== c2 ? 1 : 0);
      currentRow.push(Math.min(insertions, deletions, substitutions));
    }

    previousRow = currentRow;
  }

  return previousRow[previousRow.length - 1];
}

function customLevenshteinMatcher(team, polymarketTeamName) {
  const teamLower = team.toLowerCase();
  const nameLower = polymarketTeamName.toLowerCase();

  let output = levenshteinDistance(teamLower, nameLower);

  for (const word of nameLower.split(/\s+/)) {
    if (word === "fc" || word === "cf") continue; // skip common suffixes
    output = Math.min(output, levenshteinDistance(teamLower, word));
  }

  return output;
}


/**
 * agentResp object contains
 *  team1
 *  team2
 *  betting_team
 *  stake
 *  response and links but those aren't important for this function
 * returns
 * {
    startTime: game["endDate"]  
    homeTeam
    awayTeam
    pic
    bettingOn: int, 0 1, or 2
    tokAddrs: [home tok addr, draw, away]
    "numbers": 
      [  element 0 is home, element 1 is draw, element 2 is away
        "stake": {
            "amount": stake,
            min: 5,
            max: 20
        },
        "price": token_price
        skim: 0.05
      ]
 * }
 */
function getPolymarketInfo(agentResp){
  let output = null;
  let bestLevScore = Infinity;
  let queryStr = `${agentResp.team1} vs. ${agentResp.team2}`.replace(' ', '%20');
  let url = `${SEARCH_URL}&q=${queryStr}`;
  let resp = JSON.parse(UrlFetchApp.fetch(url).getContentText());
  let games = resp.events
  for(let game of games){
    let foundGameTag = false;
    for(let tag of game.tags){
      if(tag.slug == "games"){
        foundGameTag = true;
        break;
      }
    }
    if(!foundGameTag){
      continue;
    }
    if(!game.title.includes(" vs. ")){
      continue;
    }
    if(game.title.includes("More Markets")){
      continue;
    }

    let [homeTeam, awayTeam] = game["title"].split(" vs. ");

    // levenshtein match wanted game and side with best game in games
    // need to compare individual words for accuracy (ex: user enters palmeiras but polymarkets has se palmeiras)
        
    let levScore = Math.min(
      customLevenshteinMatcher(agentResp.team1, homeTeam),
      customLevenshteinMatcher(agentResp.team1, awayTeam),
      customLevenshteinMatcher(agentResp.team2, homeTeam),
      customLevenshteinMatcher(agentResp.team2, awayTeam)
    );
        
    if(levScore >= bestLevScore){
      // isn't a better match, use >= to prioritize earlier games
      continue
    } 
    bestLevScore = levScore;

    let bettingOn = 0;
    let homeLevScore = customLevenshteinMatcher(agentResp.betting_team, homeTeam);
    let drawLevScore = customLevenshteinMatcher(agentResp.betting_team, "draw");
    let awayLevScore = customLevenshteinMatcher(agentResp.betting_team, awayTeam);
    let minTeamLevScore = Math.min(homeLevScore, awayLevScore, drawLevScore);
    if(homeLevScore == minTeamLevScore){
      bettingOn = 0;
    }
    else if(drawLevScore == minTeamLevScore){
      bettingOn = 1;
    }
    else if(awayLevScore == minTeamLevScore){
      bettingOn = 2;
    }

    output = {
      startTime: game.endDate,
      tokAddrs: [
        JSON.parse(game.markets[0].clobTokenIds)[0],
        JSON.parse(game.markets[1].clobTokenIds)[0],
        JSON.parse(game.markets[2].clobTokenIds)[0]
      ],
      numbers: [],
      pic: game.image,
      homeTeam,
      awayTeam,
      bettingOn
    };

    for(let j = 0; j < 3; j++){
      let currNumbers = {
        price: parseFloat(JSON.parse(game.markets[j].outcomePrices)[0]) + TOKEN_PRICE_ADJ,
        stake: {
          min: MIN_STAKE,
          max: MAX_STAKE
        }
      };
      let skim = SKIM;
      let stake = Math.min(Math.max(agentResp.stake, MIN_STAKE), MAX_STAKE);
      if((1 - skim) / output.numbers.price <= 1){
          let odds = 1 / output.numbers.price;
          skim = (odds - 1) / 2
      }
      currNumbers.stake.amount = stake;
      currNumbers.skim = skim;

      output.numbers.push(currNumbers);
    }
  }
  return output;
}

/**
 * payload has
 *  query: str, the user's query
 *  conv_id: str or "", conversation id to pass to mistral
 *  default_matches: [str], default matches to pass to mistral
 * 
 * returns:
 *  payload: 
 *    query
 *    conv_id
 *    default_matches
 *  agentResp:
 *    team1
 *    team2
 *    betting_team
 *    stake
 *    response
 *    links
 *  polymarketInfo:
 *    startTime
 *    homeTeam
 *    awayTeam
 *    bettingOn
 *    pic
 *    tokAddrs: [str]
 *    numbers: [ 0 is home, 1 draw, 2 away]
 *      price
 *      skim
 *      stake
 *        amount
 *        max
 *        min
 */
function doPost(e){
  // parse incoming payload\
  let payload = JSON.parse(e.postData.contents);

  // get default matches if needed
  if(payload.default_matches == undefined || payload.default_matches.length == 0){
    payload.default_matches = getDefaultMatches();
  }

  // ask agent
  let agentResp = getAgentResp(payload);

  // get polymarket info
  let polymarketInfo = getPolymarketInfo(agentResp);

  // build and return output
  let output = {
    payload,
    agentResp,
    polymarketInfo
  };
  return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}

function tester(){
  let test_vals = {
    query: "wassup"
  };
  let test_payload = {
    postData: {
      contents: JSON.stringify(test_vals)
    }
  }
  doPost(test_payload)
}

function doGet(e){
  return ContentService.createTextOutput("seems like GAS breaks without a doGet");
}













