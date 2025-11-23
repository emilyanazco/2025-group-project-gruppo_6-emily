let data_aree, data_animali, data_piante, data_funghi, data_cromisti;
let areas = [];
let selectedArea = "south america"; 
let menuOpen = false;

const COLORS = {
  Animalia: "#B96A82",
  Plantae: "#A6C3A0",
  Fungi: "#A59382",
  Chromista: "#8096AD"
};

const BG = "#E1DDD3";

let causes = [];
let hoveredCause = null;
let clickedCause = null;
let scrollY = 0; // per lo scroll

function preload() {
  data_aree   = loadTable("data/data_aree.csv", "csv", "header");
  data_animali= loadTable("data/data_animali.csv", "csv", "header");
  data_piante = loadTable("data/data_piante.csv", "csv", "header");
  data_funghi = loadTable("data/data_funghi.csv", "csv", "header");
  data_cromisti=loadTable("data/data_cromisti.csv","csv","header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Georgia");

  for (let r = 0; r < data_aree.getRowCount(); r++) {
    let area = data_aree.getString(r, 0);
    if (area && area.toLowerCase() !== "total") areas.push(area.toLowerCase());
  }
  causes = data_animali.columns.slice(1, -1);
}

function draw() {
  background(BG);

  push();
  translate(0, scrollY); // scroll del contenuto

  fill(0);
  textAlign(LEFT, TOP);
  textSize(28);
  text("Cause di rischio estinzione — " + toTitleCase(selectedArea), 20, 70);

  drawDropdownMenu();
  drawKingdomCircles();

  if (clickedCause) drawOverlay(clickedCause);

  pop();
}

/* ---------- Cerchi ---------- */
function drawKingdomCircles() {
  let kingdoms = ["Animalia", "Plantae", "Fungi", "Chromista"];
  let marginLeft = 200;
  let marginTop = 150;
  let colGap = 250;
  let rowGap = 160; // più piccolo per permettere sovrapposizione

  for (let k = 0; k < kingdoms.length; k++) {
    let regno = kingdoms[k];
    let dataset = getDatasetByKingdom(regno);
    let row = getRowByArea(dataset, selectedArea);
    if (!row) continue;

    let values = [];
    for (let c of causes) {
      let v = int(row.get(c));
      if (v > 0) values.push({ cause: c, value: v });
    }
    if (!values.length) continue;

    values.sort((a, b) => b.value - a.value);
    let maxV = values[0].value;

    let x = marginLeft + k * colGap;
    let y = marginTop;

    fill(0);
    textAlign(CENTER, BOTTOM);
    textSize(20);
    text(regno, x, y - 40);

    for (let i = 0; i < values.length; i++) {
      let causa = values[i].cause;
      let v = values[i].value;
      let d = map(v, 0, maxV, 60, 200);

      let cx = x;
      let cy = y + i * rowGap;

      let baseColor = color(COLORS[regno]);
      baseColor.setAlpha(200); // trasparenza abbassata
      noStroke();
      if (hoveredCause === causa) {
        fill(baseColor);
      } else if (hoveredCause) {
        fill(red(baseColor), green(baseColor), blue(baseColor), 60);
      } else {
        fill(baseColor);
      }

      ellipse(cx, cy, d, d);

      // Testo centrato dentro il cerchio
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(adjustLabelSize(causa, d));
      textWrap(WORD);
      text(causa, cx, cy, d - 20);
    }
  }
}

function mouseMoved() {
  hoveredCause = null;
  let kingdoms = ["Animalia", "Plantae", "Fungi", "Chromista"];
  let marginLeft = 200;
  let marginTop = 150;
  let colGap = 250;
  let rowGap = 160;

  for (let k = 0; k < kingdoms.length; k++) {
    let regno = kingdoms[k];
    let dataset = getDatasetByKingdom(regno);
    let row = getRowByArea(dataset, selectedArea);
    if (!row) continue;

    let values = [];
    for (let c of causes) {
      let v = int(row.get(c));
      if (v > 0) values.push({ cause: c, value: v });
    }
    if (!values.length) continue;

    values.sort((a, b) => b.value - a.value);
    let maxV = values[0].value;

    let x = marginLeft + k * colGap;
    let y = marginTop;

    for (let i = 0; i < values.length; i++) {
      let causa = values[i].cause;
      let v = values[i].value;
      let d = map(v, 0, maxV, 60, 200);
      let cx = x;
      let cy = y + i * rowGap;

      if (dist(mouseX, mouseY - scrollY, cx, cy) < d / 2) {
        hoveredCause = causa;
      }
    }
  }
}

function mouseWheel(event) {
  scrollY -= event.delta; // scroll con rotellina
}

function mousePressed() {
  if (mouseX > 20 && mouseX < 240 && mouseY > 20 && mouseY < 56) {
    menuOpen = !menuOpen;
    return;
  }
  if (menuOpen) {
    for (let i = 0; i < areas.length; i++) {
      let iy = 56 + i * 32;
      if (mouseX > 20 && mouseX < 240 && mouseY > iy && mouseY < iy + 32) {
        selectedArea = areas[i];
        menuOpen = false;
        return;
      }
    }
  }
  if (hoveredCause) {
    clickedCause = hoveredCause;
  }
}

/* ---------- Menu ---------- */
function drawDropdownMenu() {
  fill(BG);
  noStroke();
  rect(20, 20, 220, 36, 6);
  fill(0);
  textSize(14);
  textAlign(LEFT, CENTER);
  text(toTitleCase(selectedArea), 32, 38);

  textAlign(RIGHT, CENTER);
  text(menuOpen ? "▴" : "▾", 230, 38);

  if (menuOpen) {
    for (let i = 0; i < areas.length; i++) {
      let iy = 56 + i * 32;
      fill("#D6D2C8");
      rect(20, iy, 220, 32, 6);
      fill(0);
      textAlign(LEFT, CENTER);
      text(toTitleCase(areas[i]), 32, iy + 16);
    }
  }
}

/* ---------- Overlay ---------- */
function drawOverlay(cause) {
  fill(0, 150);
  rect(0, 0, width, height);

  fill(255);
  rect(width/2 - 250, height/2 - 150, 500, 300, 10);

  fill(0);
  textAlign(CENTER, TOP);
  textSize(18);
  text("Dettaglio causa: " + cause, width/2, height/2 - 120);

  textSize(14);
  text("Spiegazione segnaposto per la causa selezionata.\nQui puoi inserire un testo descrittivo dal dataset.", width/2, height/2 - 80);

  fill("#EDEDED");
  rect(width/2 - 40, height/2 + 80, 80, 30, 5);
  fill(0);
  textAlign(CENTER, CENTER);
  text("Chiudi", width/2, height/2 + 95);
}

function mouseClicked() {
  if (clickedCause) {
    if (mouseX > width/2 - 40 && mouseX < width/2 + 40 &&
        mouseY > height/2 + 80 && mouseY < height/2 + 110) {
      clickedCause = null;
    }
  }
}

/* ---------- Helpers ---------- */
function getDatasetByKingdom(regno) {
    if (regno === "Animalia") return data_animali;
    if (regno === "Plantae")  return data_piante;
    if (regno === "Fungi")    return data_funghi;
    if (regno === "Chromista")return data_cromisti;
    return null;
  }
  
  function getRowByArea(table, areaLower) {
    for (let r = 0; r < table.getRowCount(); r++) {
      let name = table.getString(r, 0);
      if (!name) continue;
      if (name.trim().toLowerCase() === areaLower.trim().toLowerCase()) {
        return table.getRow(r);
      }
    }
    return null;
  }
  
  function toTitleCase(s) {
    return String(s)
      .toLowerCase()
      .replace(/\b\w/g, ch => ch.toUpperCase());
  }
  
  // adatta la dimensione del testo al diametro del cerchio
  function adjustLabelSize(textStr, diameter) {
    if (diameter >= 180) return 14;
    if (diameter >= 140) return 13;
    if (diameter >= 100) return 12;
    return 11;
  }
  