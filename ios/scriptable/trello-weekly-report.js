// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;
// Trello Weekly Report - Scriptable (iOS)

var auth = importModule("trello-auth");
var TRELLO_API_KEY = auth.TRELLO_API_KEY;
var TRELLO_API_TOKEN = auth.TRELLO_API_TOKEN;
var WORKSPACES = auth.WORKSPACES;

var DONE_LIST_NAMES = ["Done", "Closed \ud83c\udf89"];
var WEEKS_BACK = 10;
var API = "https://api.trello.com/1";

async function trelloGetRaw(path, params) {
  var qs = "key=" + TRELLO_API_KEY + "&token=" + TRELLO_API_TOKEN;
  for (var k in params) {
    qs += "&" + k + "=" + encodeURIComponent(params[k]);
  }
  var url = API + path + "?" + qs;
  var req = new Request(url);
  req.timeoutInterval = 30;
  var text = await req.loadString();
  var status = req.response.statusCode;
  if (status >= 400) {
    throw new Error("HTTP " + status + ": " + text.slice(0, 300));
  }
  return JSON.parse(text);
}

function weekKey(date) {
  var d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

function getWeekLabels() {
  var labels = [];
  var now = new Date();
  for (var i = WEEKS_BACK - 1; i >= 0; i--) {
    var d = new Date(now);
    d.setDate(d.getDate() - d.getDay() - i * 7);
    labels.push(d.toISOString().slice(0, 10));
  }
  return labels;
}

async function getBoardReport(board) {
  try {
    var lists = await trelloGetRaw("/boards/" + board.id + "/lists", {});
    var doneListIds = new Set();
    (Array.isArray(lists) ? lists : []).forEach(function(l) {
      for (var i = 0; i < DONE_LIST_NAMES.length; i++) {
        if (l.name.indexOf(DONE_LIST_NAMES[i]) >= 0) {
          doneListIds.add(l.id);
          break;
        }
      }
    });

    if (doneListIds.size === 0) {
      return { name: board.name, activeWeeks: new Set() };
    }

    var actions = await trelloGetRaw("/boards/" + board.id + "/actions", {
      filter: "updateCard",
      limit: "1000",
    });

    var weekSet = new Set();
    (Array.isArray(actions) ? actions : []).forEach(function(action) {
      var listAfter = action.data && action.data.listAfter;
      if (listAfter && doneListIds.has(listAfter.id)) {
        weekSet.add(weekKey(action.date));
      }
    });

    return { name: board.name, activeWeeks: weekSet };
  } catch (e) {
    console.log("  Board " + board.name + " failed: " + e.message);
    return { name: board.name, activeWeeks: new Set() };
  }
}

async function fetchWorkspaceBoards() {
  var workspaces = [];
  for (var w = 0; w < WORKSPACES.length; w++) {
    var wsId = WORKSPACES[w];
    try {
      console.log("Workspace: " + wsId + "...");
      var boards = await trelloGetRaw("/organizations/" + wsId + "/boards", {
        fields: "name",
        filter: "open",
      });
      if (!Array.isArray(boards)) {
        console.log("  Unexpected response for " + wsId);
        workspaces.push({ id: wsId, boards: [] });
        continue;
      }
      console.log("  Found " + boards.length + " boards");
      workspaces.push({ id: wsId, boards: boards });
    } catch (e) {
      console.log("  Failed workspace " + wsId + ": " + e.message);
      workspaces.push({ id: wsId, boards: [] });
    }
  }
  return workspaces;
}

function drawReport(wsData, weekLabels) {
  var width = 800;
  var headerH = 36;
  var rowH = 52;
  var padTop = 110;
  var padLeft = 200;
  var padRight = 60;
  var barH = 28;
  var cellW = (width - padLeft - padRight) / weekLabels.length;

  var totalRows = 0;
  for (var i = 0; i < wsData.length; i++) totalRows += 1 + wsData[i].boards.length;

  var height = padTop + totalRows * rowH + 80;

  var ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;

  ctx.setFillColor(new Color("#1a1a2e"));
  ctx.fillRect(new Point(0, 0), ctx.size);

  ctx.setFont(Font.boldSystemFont(22));
  ctx.setTextColor(new Color("#ffffff"));
  ctx.drawText("Weekly Task Report", new Point(20, 20));

  ctx.setFont(Font.regularSystemFont(12));
  ctx.setTextColor(new Color("#666688"));
  ctx.drawText(WEEKS_BACK + " weeks \u00b7 grouped by workspace", new Point(20, 50));

  ctx.setFont(Font.mediumSystemFont(11));
  ctx.setTextColor(new Color("#888888"));
  for (var i = 0; i < weekLabels.length; i++) {
    var x = padLeft + i * cellW;
    ctx.drawText(weekLabels[i].slice(5), new Point(x + 4, 60));
  }

  ctx.setStrokeColor(new Color("#333355"));
  ctx.setLineWidth(1);
  ctx.drawLine(new Point(padLeft, 78), new Point(width - padRight, 78));

  var y = padTop;
  var wsColors = ["#88aaff", "#ffaa66", "#aa88ff", "#66ddbb"];

  for (var wi = 0; wi < wsData.length; wi++) {
    var ws = wsData[wi];
    var color = wsColors[wi % wsColors.length];

    ctx.setFont(Font.boldSystemFont(16));
    ctx.setTextColor(new Color(color));
    ctx.drawText("\u25b8 " + ws.id, new Point(10, y + 8));

    var wsTotal = 0;
    for (var b = 0; b < ws.boards.length; b++) wsTotal += ws.boards[b].activeWeeks.size;
    ctx.setFont(Font.mediumSystemFont(13));
    ctx.setTextColor(new Color(color).alpha(0.6));
    ctx.drawText(wsTotal + " active weeks total", new Point(padLeft, y + 10));

    y += headerH;

    for (var r = 0; r < ws.boards.length; r++) {
      var br = ws.boards[r];

      ctx.setFont(Font.semiboldSystemFont(14));
      ctx.setTextColor(new Color("#e0e0ff"));
      var displayName = br.name.length > 24 ? br.name.slice(0, 22) + "\u2026" : br.name;
      ctx.drawText(displayName, new Point(30, y + 6));

      var count = br.activeWeeks.size;
      ctx.setFont(Font.mediumSystemFont(13));
      ctx.setTextColor(count > 0 ? new Color("#66ffaa") : new Color("#555577"));
      ctx.drawText(count + "/" + WEEKS_BACK, new Point(30, y + 28));

      for (var i = 0; i < weekLabels.length; i++) {
        var x = padLeft + i * cellW;
        var active = br.activeWeeks.has(weekLabels[i]);

        ctx.setFillColor(active ? new Color("#66ffaa") : new Color("#2a2a4a"));
        ctx.fillRoundedRect(new Rect(x + 2, y + 8, cellW - 4, barH), 6);

        if (active) {
          ctx.setFont(Font.boldSystemFont(14));
          ctx.setTextColor(new Color("#1a1a2e"));
          ctx.drawText("\u2713", new Point(x + cellW / 2 - 5, y + 14));
        }
      }

      y += rowH;
    }

    if (wi < wsData.length - 1) {
      ctx.setStrokeColor(new Color("#333355"));
      ctx.setLineWidth(1.5);
      ctx.drawLine(new Point(10, y - 4), new Point(width - 10, y - 4));
      y += 8;
    }
  }

  ctx.setFont(Font.mediumSystemFont(11));
  ctx.setTextColor(new Color("#555577"));
  ctx.drawText("Generated " + new Date().toLocaleDateString(), new Point(20, y + 10));

  ctx.setFillColor(new Color("#66ffaa"));
  ctx.fillRoundedRect(new Rect(width - 160, y + 8, 12, 12), 3);
  ctx.setTextColor(new Color("#888888"));
  ctx.drawText("Active week", new Point(width - 142, y + 4));

  ctx.setFillColor(new Color("#2a2a4a"));
  ctx.fillRoundedRect(new Rect(width - 160, y + 24, 12, 12), 3);
  ctx.drawText("No tasks", new Point(width - 142, y + 20));

  return ctx.getImage();
}

var weekLabels = getWeekLabels();
var workspaces = await fetchWorkspaceBoards();

var wsData = [];
for (var w = 0; w < workspaces.length; w++) {
  var ws = workspaces[w];
  var boards = [];
  for (var b = 0; b < ws.boards.length; b++) {
    var board = ws.boards[b];
    console.log("  Board: " + (board.name || board.id) + "...");
    var report = await getBoardReport(board);
    boards.push(report);
  }
  wsData.push({ id: ws.id, boards: boards });
}

var img = drawReport(wsData, weekLabels);

var fm = FileManager.iCloud();
var pathFile = fm.joinPath(fm.documentsDirectory(), "trello-weekly-report.png");
fm.writeImage(pathFile, img);

Script.setShortcutOutput(pathFile);
Script.complete();
