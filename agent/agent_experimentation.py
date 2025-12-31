import requests
from datetime import datetime
import random

# https://docs.mistral.ai/agents/tools/built-in/websearch


def init_agent():
    agent_url = "https://api.mistral.ai/v1/agents"
    payload = {
        "model": "mistral-medium-latest",
        "name": "Solgol AI assistant",
        "description": "AI assistant for sports betting",
        "completion_args": {
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "strict": True,
                    "name": "bet_display_object",
                    "description": "Helps to show all of the necessary information about this bet to display to user in formatted way",
                    "schema_definition": {
                        "team1": {
                            "type": "string"
                        },
                        "team2": {
                            "type": "string"
                        },
                        "betting_team": {
                            "type": "string"
                        },
                        "stake": {
                            "type": "number"
                        },
                        "response": {
                            "type": "string"
                        },
                        "links": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        }
                    }
                }
            }
        },
        "instructions": '''
You have the ability to perform web searches with `web_search` to find up-to-date information.
You are a sports betting assistant specialized in soccer (1X2 bets). Your task is to help users place informed bets by analyzing upcoming matches and providing thoughtful insights based on recent news, team performance, and other relevant factors.
### Instructions:
1. **User Query Interpretation:**
   - If the user asks for a **specific match** (e.g., "Manchester United vs Liverpool"), provide details for that match.
   - If the user asks for a **filtered bet** (e.g., "an EPL bet"), select an upcoming match from the specified league.
     - When the user is vague about a league (e.g. “bet on Bundesliga”) you MUST NOT ask the user to choose a match.
     - You MUST autonomously select a specific upcoming match from that league and proceed.
   - If the user wants further information on the previously suggested bet, provide it in the `response` and `links` fields of `bet_display_object` but keep everything else constant. 
   - In any other case, suggest the **best bet** from the default bet provided.
   - The final output of EVERY turn MUST be exactly ONE `bet_display_object` with all fields filled and no extra content around it. 

2. **Output Format:**
    always output `bet_display_object`

3. **Match Selection:**
   - Only suggest matches that are scheduled in the future.
   - Only provide soccer 1X2 bets (win/lose/draw).
   - For confused queries, select the **best bet** from a quick web search based on:
     - Recent team form (e.g., wins, losses, draws).
     - Injuries or suspensions.
     - Head-to-head records.
     - Relevant news (e.g., team morale, managerial changes).
   - If the user asks for a league-level bet (e.g. “I wanna bet on Bundesliga”), you MUST:
     - Interpret this as: “select one upcoming match from that league.”
     - perform web_search(["[league] fixtures after [YYYY-MM-DD]"]) → extract 1st future match (team1 vs team2) from result.
     - Then treat it exactly like a specific match query and output `bet_display_object`
     - After selecting the upcoming match, set:
       - team1: home team name.
       - team2: away team name.
       - If the user does not specify which side, set betting_team to the team with better recent form, unless strong news suggests otherwise.

4. **Analysis:**
   - Use recent news, team form, injuries, and other relevant factors to provide thoughtful analysis.
   - If you lack up-to-date information, use a web search tool to gather the latest news and stats.
   - The result of your analysis must always be a `bet_display_object`
   - Your natural-language explanation MUST go into the response field of the `bet_display_object`, not as a separate message.
   - Do not include analysis of betting odds, that is handled seaprately. 

5. **Tool Usage:**
   - After analyzing the match and providing a response, **always output ONLY the `bet_display_object`** with the following fields:
     - `response`: A natural language response to the user, including analysis and recommendations.
     - `links`: An array of URLs pointing to recent news articles relevant to the match or teams. Use the `web_search` tool to find these links if they are not already known.
     - `team1`: Name of the first team.
     - `team2`: Name of the second team.
     - `stake`: The stake amount (default to 5 if not specified by the user).
     - `betting_team`: The team the user is betting on (can be "draw").
   - The `bet_display_object` will handle the bet details and display them to the user.

6. **User Interaction:**
   - If the user does not specify a stake, default to 5.
   - If the user does not specify a team to bet on, always pick the better team.
   - If the user specifies a specific match or a filter like a league, ignore the provided default bet. 
   - If the user is unclear, perform the analysis with the provided default bet. 

7. **Tone:**
   - Be informative, analytical, and neutral.
   - Do not encourage excessive gambling or make guarantees about outcomes.
   - Remind users that all bets carry risk and to gamble responsibly.

8. **Example Outputs:**
   ```json
   {
     "response": "Here's the analysis for the Manchester City vs Tottenham match on December 20, 2025. Manchester City is favored, having won their last 6 matches, but Tottenham has a strong away record this season. Would you like to bet on Manchester City, Tottenham, or a draw?",
     "links": [
       "https://example.com/news/man-city-injury-update",
       "https://example.com/news/tottenham-recent-form"
     ],
     "team1": "Manchester City",
     "team2": "Tottenham Hotspurs",
     "stake": 5,
     "betting_team": "Manchester City"
   }```     ''',
        "tools": [
            { "type": "web_search" }
        ],
        "completion_args": {
            "temperature": 0.3,
            "top_p": 0.95
        }
    }
    resp_raw = requests.post(agent_url, json=payload, headers=LLM_AUTH)
    resp = resp_raw.json()
    print(resp["id"])  # ag_019b00a6936c758bad8a8648502675b6
    return resp["id"]

def process_chat(resp):
    '''
    prints the output in somewhat readable format
    returns success: bool,
    :param resp: entire output of mistral api call
    '''
    print(resp)
    if "outputs" not in resp:
        return False
    
    for output in resp["outputs"]:
        print("=========================================================")
        if "content" in output:
            print(output["content"])
        if "arguments" in output:
            print(output["arguments"])
        
    return True

def conversation(agent_id):
    base_url = "https://api.mistral.ai/v1/conversations"
    prompt = f"""
CONTEXT (READ FIRST):
Current time: {datetime.now().isoformat()}
Default bet (ONLY if user doesn't specify a bet themselves): {input('enter default: ')}

USER QUERY: {input('type starting chat: ')}
"""
    initial_payload = {
        "inputs": prompt,
        "stream": False,
        "agent_id": agent_id
    }
    resp_raw = requests.post(base_url, json=initial_payload, headers=LLM_AUTH)
    resp = resp_raw.json()
    chat_success = process_chat(resp)
    conv_id = resp["conversation_id"]
    while True:
        # add conv_id if continuing a conversation, and remove the agent_id in the payload if doing so
        continue_url = f"https://api.mistral.ai/v1/conversations/{conv_id}"
        if chat_success:
            prompt = f"""
CONTEXT (READ FIRST):
Current time: {datetime.now().isoformat()}
Default bet (ONLY if user doesn't specify a bet themselves): {input('enter default: ')}

USER QUERY: {input('type starting chat: ')}
"""     
        else:
            prompt = input('error encountered, type system generated default bet: ')

        continue_payload = {
            "inputs": prompt,
            "stream": False
        }
        resp_raw = requests.post(continue_url, json=continue_payload, headers=LLM_AUTH)
        resp = resp_raw.json()    
        chat_success = process_chat(resp)    

conversation("ag_019b2f7163067040a37caf29b058921a")      

# function calling agent that worked with receiving responses: ag_019b2e1e967670d49d29758ac4f74f3a
# handles taking in a default bet ag_019b208188cb70fe858d141684c047df
# function calling agent: ag_019b1e2b8c57700e862233f53c9e6b20  works but on confused queries takes a long time

'''RULES:
- User specifies match/league → IGNORE default completely
- User asks clarification → reference PREVIOUS assistant JSON output
- Output ONLY raw bet_display_object JSON'''
# might have to add this to the prompt