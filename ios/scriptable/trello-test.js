// Minimal Trello API test - run this in Scriptable to debug
const auth = importModule("trello-auth");

async function test() {
  try {
    const url = `https://api.trello.com/1/organizations/juratempest/boards?key=${auth.TRELLO_API_KEY}&token=${auth.TRELLO_API_TOKEN}&fields=name&filter=open`;
    console.log("API Key: " + auth.TRELLO_API_KEY);
    console.log("Token: " + auth.TRELLO_API_TOKEN);
    console.log("Workspaces: " + auth.WORKSPACES);
    console.log("Fetching: " + url);

    const req = new Request(url);
    req.timeoutInterval = 30;

    const text = await req.loadString();
    const status = req.response.statusCode;

    console.log("Status: " + status);
    console.log("Response: " + text.slice(0, 500));

    if (status >= 400) {
      await Alert.alert("API Error", `HTTP ${status}\n${text.slice(0, 300)}`);
      return;
    }

    const data = JSON.parse(text);
    const names = data.map(b => b.name).join(", ");
    await Alert.alert("Success", `Found ${data.length} boards:\n${names}`);
  } catch (e) {
    console.log("Error: " + e.message);
    await Alert.alert("Error", e.message + "\n" + e.stack);
  }
}

test();
