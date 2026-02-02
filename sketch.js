/* 1. COSTANTI E VARIABILI GLOBALI */

let data_aree, data_animali, data_piante, data_funghi, data_cromisti;
let areas = [];
let selectedAreaOriginal = "Sud America";
let selectedArea = normalizeAreaName("Sud America");
let menuOpen = false;
let menuX_global, menuY_global, menuW_global, menuH_global, menuSz_global;
let menuAlpha = 0;
let areasNormalized = [];


let petalShapes = {};   // forme precalcolate dei petali
let centerShapes = {};  // forme precalcolate dei pistilli
let customFont;
let causeMap = {};      // mappa cause → colonne dataset
let causes = [];        // lista cause normalizzate

let hoveredCause = null;
let clickedCause = null;
let overlayCloseBounds = null;

// Palette regni
const COLORS = {
  Animalia: "#B96A82",
  Plantae: "#A6C3A0",
  Fungi: "#A59382",
  Chromista: "#8096AD"
};

// Colori UI
const BG = "#E1DDD3";
const TEXT_COLOR = "#4f4838";

// Mappa abbreviazioni cause
const LETTERE_CAUSE = {
  "agriculture and aquaculture": "e",
  "biological resource use": "h",
  "climate change and severe weather": "b",
  "energy production and mining": "f",
  "human intrusions and disturbance": "i",
  "invasive and other problematic species, genes and diseases": "m",
  "natural system modifications": "l",
  "pollution": "n",
  "residential and commericial development": "d",
  "transportation and service corridors": "g",
  "geological events": "a",
  "other/unknown": "c"
};

// Nomi leggibili delle cause
const NOMI_CAUSE = {
  "agriculture and aquaculture": "Agricoltura",
  "biological resource use": "Sfruttamento risorse",
  "climate change and severe weather": "Cambiamento climatico",
  "energy production and mining": "Energia e miniere",
  "human intrusions and disturbance": "Intrusioni umane",
  "invasive and other problematic species, genes and diseases": "Specie invasive",
  "natural system modifications": "Modifiche naturali",
  "pollution": "Inquinamento",
  "residential and commericial development": "Edilizia",
  "transportation and service corridors": "Trasporti",
  "geological events": "Eventi geologici",
  "other/unknown": "Altro"
};

// Descrizioni lunghe per overlay
const DESCRIZIONI_CAUSE = {
  "agriculture and aquaculture": "L'impatto maggiore sulla biodiversità deriva dall'espansione e dell'intensificazione dell'agricoltura e acquacoltura, che interessa circa il 46,5% delle specie minacciate. Questa minaccia è guidata principalmente dalla conversione degli habitat naturali per le colture, il pascolo del bestiame e, in misura minore, lo sviluppo dell'acquacoltura, causando una perdita di habitat su vasta scala.",
  "biological resource use": "L'uso insostenibile delle risorse biologiche, come la raccolta eccessiva o la caccia, colpisce circa il 39,6% delle specie. La componente più significativa è il taglio e la raccolta di legname, spesso non sostenibile, seguito dalla pesca e dalla raccolta di risorse acquatiche, e dalla caccia e cattura non regolamentata di animali terrestri e piante.",
  "climate change and severe weather": "L'espansione dell'urbanizzazione e delle infrastrutture umane, raggruppata nello sviluppo residenziale e commerciale, minaccia circa il 24,5% delle specie. Questa categoria include la crescita delle aree urbane, industriali e turistiche, che provoca la distruzione diretta e la frammentazione degli ecosistemi.",
  "energy production and mining": "La produzione di energia e l'attività mineraria minacciano circa il 13,1% delle specie. Le attività di estrazione mineraria e le cave sono la componente più impattante, causando la distruzione fisica dell'habitat, seguite dalle trivellazioni di petrolio e gas e dalle infrastrutture per le energie rinnovabili.",
  "human intrusions and disturbance": "Questa minaccia, che incide su circa il 5,7% delle specie, si riferisce al disturbo diretto causato principalmente dalle attività ricreative non regolamentate. Altri fattori, sebbene minori, includono i conflitti (guerre e disordini civili) che destabilizzano gli ecosistemi.",
  "invasive and other problematic species, genes and diseases": "L'introduzione di specie invasive non native, malattie e altro materiale genetico problematico minaccia circa il 14,5% delle specie. Le specie aliene invasive sono il problema predominante; possono agire come predatori, concorrenti o vettori di malattie, portando al rapido declino delle specie native.",
  "natural system modifications": "Questa categoriaQuesta categoria rappresenta le alterazioni su larga scala degli ecosistemi, impattando circa il 22,1% delle specie. Le principali cause sono gli incendi (la cui frequenza e intensità sono spesso alterate dall'uomo) e la gestione idrica tramite la costruzione di dighe e la deviazione dei corsi d'acqua, che sconvolgono gli habitat acquatici e terrestri. rappresenta le alterazioni ...",
  "pollution": "L'inquinamento danneggia circa il 13,5% delle specie. Sebbene l'inquinamento da effluenti agricoli e forestali (come i fertilizzanti in eccesso) sia spesso la componente più diffusa, anche gli scarichi industriali, i rifiuti solidi e l'inquinamento atmosferico contribuiscono significativamente alla contaminazione degli habitat.",
  "residential and commericial development": "L'espansione dell'urbanizzazione e delle infrastrutture umane, raggruppata nello sviluppo residenziale e commerciale, minaccia circa il 24,5% delle specie. Questa categoria include la crescita delle aree urbane, industriali e turistiche, che provoca la distruzione diretta e la frammentazione degli ecosistemi.",
  "transportation and service corridors": "Lo sviluppo di corridoi di trasporto e servizi minaccia circa l'8,1% delle specie. Questo impatto è dominato dalla costruzione di strade e ferrovie, che oltre a distruggere l'habitat, creano barriere fisiche e aumentano la mortalità degli animali.",
  "geological events": "Gli eventi geologici che minacciano circa l'1,1% delle specie sono perlopiù fenomeni naturali, come frane, valanghe ed eruzioni vulcaniche. Tuttavia, l'impatto sulle specie è spesso esacerbato quando gli habitat sono già stressati da altre minacce antropiche.",
  "other/unknown": "Questa categoria raccoglie le minacce che non sono state ancora identificate con precisione o per le quali mancano dati sufficienti."
};


/* 2. FUNZIONI DI UTILITÀ E NORMALIZZAZIONE */

function normalizeCause(name) {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

function normalizeAreaName(str) {
  return str.toLowerCase().trim().replace(/-/g, " ").replace(/\s+/g, " ");
}

function toTitleCase(s) {
  return String(s).toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase());
}

// Costruisce una mappa { causa_normalizzata → nome_colonna_originale }
function buildCauseMap(table) {
  let map = {};
  for (let col of table.columns) {
    map[normalizeCause(col)] = col;
  }
  return map;
}

// Estrae area da URL
function getAreaFromURL() {
  const params = new URLSearchParams(window.location.search);
  let area = params.get("area");
  return area ? area.replace(/-/g, " ").toLowerCase() : null;
}

// Trova la riga corrispondente all’area selezionata
function getRowByArea(table, areaFromURL) {
  const target = normalizeAreaName(areaFromURL);
  let bestMatch = null;
  let bestScore = 0;

  for (let r = 0; r < table.getRowCount(); r++) {
    let name = table.getString(r, 0);
    if (!name) continue;

    let normalizedName = normalizeAreaName(name);

    if (normalizedName.includes(target)) return table.getRow(r);

    let common = 0;
    let minLen = min(normalizedName.length, target.length);
    for (let i = 0; i < minLen; i++) {
      if (normalizedName[i] === target[i]) common++;
    }
    if (common > bestScore) {
      bestScore = common;
      bestMatch = table.getRow(r);
    }
  }

  return bestMatch;
}

// Dataset per regno
function getDatasetByKingdom(regno) {
  if (regno === "Animalia") return data_animali;
  if (regno === "Plantae") return data_piante;
  if (regno === "Fungi") return data_funghi;
  if (regno === "Chromista") return data_cromisti;
  return null;
}


/* 3. PRELOAD: CARICAMENTO FONT E CSV */

function preload() {
  customFont = loadFont("fonts/CormorantGaramond-VariableFont_wght.ttf");

  data_aree    = loadTable("data/data_aree.csv", "csv", "header");
  data_animali = loadTable("data/data_animali.csv", "csv", "header");
  data_piante  = loadTable("data/data_piante.csv", "csv", "header");
  data_funghi  = loadTable("data/data_funghi.csv", "csv", "header");
  data_cromisti = loadTable("data/data_cromisti.csv","csv","header");

  sfondo_overlay = loadImage("immagini/carta2.jpg");
}


/* 4. SETUP: INIZIALIZZAZIONE CANVAS E DATI */

function setup() {
  const areaFromURL = getAreaFromURL();
  if (areaFromURL) selectedArea = normalizeAreaName(areaFromURL);

// Rimuove la riga "Totale" da tutti i dataset
function removeTotalRow(table) {
  for (let r = table.getRowCount() - 1; r >= 0; r--) {
    let name = table.getString(r, 0);
    if (name && name.toLowerCase().trim() === "totale") {
      table.removeRow(r);
    }
  }
}

removeTotalRow(data_aree);
removeTotalRow(data_animali);
removeTotalRow(data_piante);
removeTotalRow(data_funghi);
removeTotalRow(data_cromisti);


  //
  let marginTop = 280;
  let spacingY = 400;
  let rows = 2;
  let totalHeight = marginTop + (rows - 1) * spacingY + 600;

  createCanvas(windowWidth, totalHeight);
  textFont(customFont);

  // Lista aree disponibili
  for (let r = 0; r < data_aree.getRowCount(); r++) {
    let area = data_aree.getString(r, 0);
    if (area && area.toLowerCase() !== "total") {
      areas.push(area);  //forma originale per il menu
      areasNormalized.push(normalizeAreaName(area));   // forma normalizzata per il matching
      
    }
  }

  // Lista cause normalizzate
  causes = data_animali.columns.slice(1).map(normalizeCause);

  // Mappa cause → colonne reali per ogni regno
  causeMap = {
    Animalia: buildCauseMap(data_animali),
    Plantae: buildCauseMap(data_piante),
    Fungi: buildCauseMap(data_funghi),
    Chromista: buildCauseMap(data_cromisti)
  };

  // Precalcolo forme organiche dei petali e pistilli
  precalcShapes();
}

// Precalcolo forme organiche per petali e pistilli
function precalcShapes() {
  for (let regno of ["Animalia","Plantae","Fungi","Chromista"]) {
    petalShapes[regno] = [];
    centerShapes[regno] = [];

    // Petali
    for (let i = 0; i < causes.length; i++) {
      let layers = [];
      for (let l = 0; l < 12; l++) {
        let shape = [];
        for (let a = 0; a < TWO_PI; a += PI/8) {
          shape.push({
            angle: a,
            rxVar: random(-3,3),
            ryVar: random(-5,5),
            alpha: 25 + random(-10,10),
            colorVar: [random(-20,20), random(-20,20), random(-20,20)]
          });
        }
        layers.push(shape);
      }
      petalShapes[regno].push(layers);
    }

    // Pistilli
    for (let l = 0; l < 8; l++) {
      let shape = [];
      for (let a = 0; a < TWO_PI; a += PI/10) {
        shape.push({
          angle: a,
          rVar: random(-2,2),
          alpha: 30 + random(-10,10),
          colorVar: [random(-15,15), random(-15,15), random(-15,15)]
        });
      }
      centerShapes[regno].push(shape);
    }
  }
}


/* 5. DRAW: CICLO DI RENDERING */

function draw() {
  clear();

  let activeCause = clickedCause
    ? clickedCause
    : (hoveredCause ? hoveredCause.cause : null);

  drawHeader();
  drawLegend(activeCause);
  drawKingdomFlowers(activeCause);

  if (clickedCause) drawOverlay(clickedCause);
  if (!clickedCause) drawTooltip();
  
  if (menuOpen) drawDropdownMenu(menuX_global, menuY_global, menuW_global, menuH_global, menuSz_global);
}



/* 6. COMPONENTI UI: HEADER, MENU, LEGENDA */

function drawHeader() {
  push();
  const sz = constrain(width * 0.05, 30, 60);
  const menuTextSize = sz * 0.48;   // <<< DIMENSIONE TESTO COERENTE
  textFont(customFont);
  textStyle(NORMAL);
  fill(TEXT_COLOR);

  const x = width * 0.63;
  const y = sz * 1.2;

  textAlign(LEFT, TOP);
  textSize(sz);
  text("Cause di rischio", x, y);

  const titoloY2 = y + sz * 1.2;
  textSize(sz);
  text("estinzione in", x, titoloY2);

  const titoloY3 = titoloY2 + sz * 1.2;
  const label = selectedAreaOriginal;


  // Calcolo coerente della larghezza
  textSize(menuTextSize);
  let maxW = textWidth(label);
  for (let area of areas) {
    maxW = max(maxW, textWidth(toTitleCase(area)));
  }

  const menuW = maxW + 48;   // <<< PIÙ COMPATTO
  const menuH = sz * 0.58;   // <<< CASELLA PIÙ BASSA
  const menuX = x;
  const menuY = titoloY3;

  // Bottone
  noStroke();
  fill('#F2F0E5');
  rect(menuX, menuY, menuW, menuH, 10);

  // Testo area
  fill(TEXT_COLOR);
  textAlign(LEFT, CENTER);
  textSize(menuTextSize);
  text(label, menuX + 12, menuY + menuH / 2);

  // Freccia
  textAlign(RIGHT, CENTER);
  text(menuOpen ? "▲" : "▼", menuX + menuW - 12, menuY + menuH / 2);

  pop();

  menuX_global = menuX;
  menuY_global = menuY;
  menuW_global = menuW;
  menuH_global = menuH;
  menuSz_global = sz;  
}

function drawDropdownMenu(menuX, menuY, menuW, menuH, sz) {
  const menuTextSize = sz * 0.48;
  textSize(menuTextSize);

  for (let i = 0; i < areas.length; i++) {
    const iy = menuY + menuH + i * menuH;
    const ih = menuH;

    const isHovered =
      mouseX > menuX && mouseX < menuX + menuW &&
      mouseY > iy && mouseY < iy + ih;

    // Sfondo voce
    fill(isHovered ? "#BFBBAF" : "#F2F0E5");
    noStroke();

    // Angoli smussati
    let tl = 0, tr = 0, br = 0, bl = 0;

    // Primo elemento → angoli superiori
    if (i === 0) {
      tl = 10;
      tr = 10;
    }

    // Ultimo elemento → angoli inferiori
    if (i === areas.length - 1) {
      bl = 10;
      br = 10;
    }

    rect(menuX, iy, menuW, ih, tl, tr, br, bl);

    // Testo
    fill(TEXT_COLOR);
    textAlign(LEFT, CENTER);
    text(areas[i], menuX + 12, iy + ih / 2);

  }
}

function drawLegend(activeCause) {
  push();
  textFont(customFont);
  textAlign(LEFT, TOP);

  const sz = constrain(width * 0.05, 30, 60);
  const x = width * 0.63;
  const startY = sz * 1.2 + sz * 1.2 + sz * 1.2 + sz * 2.0;
  const lineHeight = 34;

  let entries = Object.entries(LETTERE_CAUSE)
    .sort((a, b) => a[1].localeCompare(b[1]));

    for (let i = 0; i < entries.length; i++) {
      const causa = entries[i][0];
      const lettera = entries[i][1];
      const nome = NOMI_CAUSE[causa];
      const y = startY + i * lineHeight;
    
      const fullText = `${lettera}) ${nome}`;
      const isActive = activeCause === causa;
    
      // --- HIGHLIGHT PIÙ EVIDENTE ---
      if (isActive) {
        fill(230, 224, 210);   // colore più caldo e più visibile
        noStroke();
        rect(x - 14, y - 6, 300, lineHeight + 8, 8); 
      }
    
      // --- TESTO ---
      fill(TEXT_COLOR);
      textFont(customFont, isActive ? 700 : 400);
      textSize(24);
      text(fullText, x, y);
    }    
    

  pop();
}



/* 7. FIORI E PETALI */

function drawKingdomFlowers(activeCause) {
  let kingdoms = ["Animalia", "Plantae", "Fungi", "Chromista"];
  
  let centerRadius = 20;
  let angleStep = TWO_PI / causes.length;

  let marginLeft = 260;
  let marginTop = 250;
  let spacingX = 420;
  let spacingY = 400;

  let maxPossibleRadius = min(spacingX, spacingY) / 2 - 40;
  let maxPetalLengthLimit = maxPossibleRadius - centerRadius;

  let minPetalMidRadius = centerRadius + 60;
  let availableArc = (minPetalMidRadius * TWO_PI) / causes.length;
  let dynamicPetalWidth = min(65, availableArc * 0.95);

  for (let k = 0; k < kingdoms.length; k++) {
    let regno = kingdoms[k];
    let dataset = getDatasetByKingdom(regno);
    let row = getRowByArea(dataset, selectedArea);
    if (!row) continue;

    let maxValInRow = 0;
    for (let causa of causes) {
      let realCol = causeMap[regno][causa];
      if (!realCol) continue;
      let val = int(row.get(realCol) || 0);
      if (val > maxValInRow) maxValInRow = val;
    }

    // --- POSIZIONAMENTO DEL FIORE ---
    let col = k % 2;
    let rowIdx = floor(k / 2);
    let centerX = marginLeft + col * spacingX;
    let centerY = marginTop + rowIdx * spacingY;

    // --- SE NON CI SONO DATI PER QUESTO REGNO, MOSTRA IL CARTELLINO ---
    if (maxValInRow === 0) {
      push();
      translate(centerX, centerY);

      let cardW = 240;
      let cardH = 110;

      fill(242, 240, 229); // sfondo carta
      stroke(TEXT_COLOR + "40"); // bordo tenue
      strokeWeight(1);
      rect(-cardW/2, -cardH/2, cardW, cardH, 10);

      noStroke();
      fill(TEXT_COLOR);
      textAlign(CENTER, TOP);

      // Nome del regno (titolo)
      textSize(18);
      text(regno, 0, -cardH/2 + 12);

      // Testo descrittivo
      textSize(15);
      textAlign(CENTER, CENTER);
      text(
        "Non è stata ancora analizzata\nnessuna specie a rischio\nin quest'area geografica",
        0,
        12
      );

      pop();
      continue; // salta il disegno del fiore
    }



    let baseColor = color(COLORS[regno]);

    push();
    translate(centerX, centerY);

    // PETALI
    for (let i = 0; i < causes.length; i++) {
      let causa = causes[i];
      let realCol = causeMap[regno][causa];
      if (!realCol) continue;

      let raw = row.get(realCol);
      let val = raw ? int(raw) : 0;
      if (val === 0) continue;

      let normVal = log(val + 1) / log(maxValInRow + 1);
      let petalLength = (80 + normVal * (maxPetalLengthLimit * 1.5 - 80)) * 0.8;
      let angle = i * angleStep - HALF_PI;

      let isActive = activeCause === causa;
      let shouldFade = activeCause && !isActive;

      push();
      rotate(angle);

      if (isActive) {
        scale(1.1);
        translate(0, -8);
      }

      for (let l = 0; l < petalShapes[regno][i].length; l++) {
        let shape = petalShapes[regno][i][l];
        beginShape();
        noStroke();
        for (let p of shape) {
          let c = color(
            red(baseColor) + p.colorVar[0],
            green(baseColor) + p.colorVar[1],
            blue(baseColor) + p.colorVar[2]
          );

          c.setAlpha(shouldFade ? p.alpha * 0.3 : p.alpha);
          fill(c);

          let rx = dynamicPetalWidth/2 + p.rxVar;
          let ry = petalLength/2 + p.ryVar;
          let baseOffset = centerRadius * 0.6;
          let x = cos(p.angle) * rx;
          let y = baseOffset + petalLength/2 + sin(p.angle) * ry;
          curveVertex(x, y);
        }
        endShape(CLOSE);
      }

      // Etichetta lettera causa
      push();
      let baseDist = centerRadius + petalLength + 15;
      let stagger = (i % 2 === 0) ? 0 : 12;
      translate(0, baseDist + stagger);
      rotate(-angle);
      textSize(15);
      textAlign(CENTER, CENTER);
      fill(TEXT_COLOR);
      text(LETTERE_CAUSE[causa], 0, 0);
      pop();

      pop();
    }

    pop();

    // NOME REGNO
    push();
    textAlign(CENTER, TOP);
    textFont(customFont);
    textSize(22);
    fill(TEXT_COLOR);
    text(regno, centerX, centerY + maxPossibleRadius + 40);
    pop();
  }
}



/* 8. INTERAZIONI: HOVER, CLICK, TOOLTIP */

function mouseMoved() {

  // --- POINTER SULLA X DELL’OVERLAY ---
  if (clickedCause && overlayCloseBounds) {
    if (dist(mouseX, mouseY, overlayCloseBounds.x, overlayCloseBounds.y) < overlayCloseBounds.size) {
      cursor(HAND);
      return;
    }
  }

  // --- SE OVERLAY APERTO → blocca tutto ---
  if (clickedCause) {
    cursor(ARROW);
    return;
  }

  // --- SE MENU APERTO → blocca TUTTO l’hover ---
  if (menuOpen) {
    hoveredCause = null;
    cursor(ARROW);
    return;
  }

  // --- POINTER SULLA CASELLA MENU ---
  if (mouseX > menuX_global && mouseX < menuX_global + menuW_global &&
      mouseY > menuY_global && mouseY < menuY_global + menuH_global) {
    cursor(HAND);
    return;
  }

  // --- HOVER SULLA LEGENDA (senza tooltip) ---
  const szLegend = constrain(width * 0.05, 30, 60);
  const xLegend = width * 0.63;
  const startYLegend = szLegend * 1.2 + szLegend * 1.2 + szLegend * 1.2 + szLegend * 2.0;
  const lineHeightLegend = 34;

  let entriesLegend = Object.entries(LETTERE_CAUSE)
    .sort((a, b) => a[1].localeCompare(b[1]));

  for (let i = 0; i < entriesLegend.length; i++) {
    const causa = entriesLegend[i][0];
    const yLine = startYLegend + i * lineHeightLegend;

    if (mouseX > xLegend &&
        mouseY > yLine && mouseY < yLine + lineHeightLegend) {

      hoveredCause = { kingdom: null, cause: causa, value: undefined };  
      cursor(HAND);
      return;
    }
  }

  // --- HOVER SUI PETALI ---
  hoveredCause = null;
  let isPointer = false;

  let kingdoms = ["Animalia", "Plantae", "Fungi", "Chromista"];
  let centerRadius = 20;
  let angleStep = TWO_PI / causes.length;

  let marginLeft = 260;
  let marginTop = 280;
  let spacingX = 420;
  let spacingY = 400;

  let maxPossibleRadius = min(spacingX, spacingY) / 2 - 40;
  let maxPetalLengthLimit = maxPossibleRadius - centerRadius;

  let minPetalMidRadius = centerRadius + 60;
  let availableArc = (minPetalMidRadius * TWO_PI) / causes.length;
  let dynamicPetalWidth = min(65, availableArc * 0.95);

  let mx = mouseX;
  let my = mouseY;

  for (let k = 0; k < kingdoms.length; k++) {
    let regno = kingdoms[k];
    let dataset = getDatasetByKingdom(regno);
    let row = getRowByArea(dataset, selectedArea);
    if (!row) continue;

    let maxValInRow = 0;
    for (let c of causes) {
      let realCol = causeMap[regno][c];
      if (!realCol) continue;
      let raw = row.get(realCol);
      let val = raw ? int(raw) : 0;
      if (val > maxValInRow) maxValInRow = val;
    }
    if (maxValInRow === 0) continue;

    let col = k % 2;
    let rowIdx = floor(k / 2);
    let centerX = marginLeft + col * spacingX;
    let centerY = marginTop + rowIdx * spacingY;

    if (dist(mx, my, centerX, centerY) > maxPossibleRadius + 160) continue;

    for (let i = 0; i < causes.length; i++) {
      let causa = causes[i];
      let realCol = causeMap[regno][causa];
      if (!realCol) continue;

      let raw = row.get(realCol);
      let val = raw ? int(raw) : 0;
      if (val === 0) continue;

      let normVal = log(val + 1) / log(maxValInRow + 1);
      let petalLength = (80 + normVal * (maxPetalLengthLimit * 1.5 - 80)) * 0.8;
      let petalAngle = i * angleStep - HALF_PI;

      let dx = mx - centerX;
      let dy = my - centerY;
      let cosA = cos(-petalAngle), sinA = sin(-petalAngle);
      let localX = dx * cosA - dy * sinA;
      let localY = dx * sinA + dy * cosA;

      let baseOffset = centerRadius * 0.6;
      let ellipseCenterX = 0;
      let ellipseCenterY = baseOffset + petalLength / 2;
      let radiusX = dynamicPetalWidth / 2;
      let radiusY = petalLength / 2;

      const tol = 1.05;
      let part1 = sq(localX - ellipseCenterX) / sq(radiusX * tol);
      let part2 = sq(localY - ellipseCenterY) / sq(radiusY * tol);

      if (part1 + part2 <= 1) {
        hoveredCause = { kingdom: regno, cause: causa, value: val };
        isPointer = true;
        break;
      }
    }
  }

  cursor(isPointer ? HAND : ARROW);
}


function mousePressed() {

  if (clickedCause) {
    // Solo il pulsante X deve funzionare
    if (overlayCloseBounds &&
        dist(mouseX, mouseY, overlayCloseBounds.x, overlayCloseBounds.y) < overlayCloseBounds.size) {
      clickedCause = null;
    }
    return;
  }
  

  /* 1) CLICK SUL BOTTONE DEL MENU (APRI/CHIUDI) */
  const menuX = menuX_global;
  const menuY = menuY_global;
  const menuW = menuW_global;
  const menuH = menuH_global;

  // Se clicchi sul bottone → toggle SEMPRE, anche se il menu è aperto
  if (mouseX > menuX && mouseX < menuX + menuW &&
      mouseY > menuY && mouseY < menuY + menuH) {
    menuOpen = !menuOpen;

    return;
  }


  /* 2) SE IL MENU È APERTO → BLOCCA TUTTO IL RESTO */
  if (menuOpen) {

    // CLICK SULLE VOCI DEL MENU
    for (let i = 0; i < areas.length; i++) {
      const iy = menuY + menuH + i * menuH;
      const ih = menuH;

      if (mouseX > menuX && mouseX < menuX + menuW &&
          mouseY > iy && mouseY < iy + ih) {
        selectedAreaOriginal = areas[i];
        selectedArea = areasNormalized[i];
        menuOpen = false;
        return;
      }
    }

    // CLICK FUORI → chiudi menu
    const menuBottom = menuY + menuH + areas.length * menuH;
    if (!(mouseX > menuX && mouseX < menuX + menuW &&
          mouseY > menuY && mouseY < menuBottom)) {
      menuOpen = false;
    }

    return; // blocca tutto il resto
  }


  /* 3) CLICK SU OVERLAY (CHIUSURA) */
  if (clickedCause) {
    if (overlayCloseBounds &&
        dist(mouseX, mouseY, overlayCloseBounds.x, overlayCloseBounds.y) < overlayCloseBounds.size) {
      clickedCause = null;
      return;
    }
    return;
  }


  /* 4) CLICK SULLA LEGENDA */
  const szLegend = constrain(width * 0.05, 30, 60);
  const xLegend = width * 0.63;
  const titoloY2Legend = szLegend * 1.2 + szLegend * 1.2;
  const titoloY3Legend = titoloY2Legend + szLegend * 1.2;
  const startYLegend = titoloY3Legend + szLegend * 2.0;
  const lineHeightLegend = 34;

  let entriesLegend = Object.entries(LETTERE_CAUSE)
    .sort((a, b) => a[1].localeCompare(b[1]));

  for (let i = 0; i < entriesLegend.length; i++) {
    const causa = entriesLegend[i][0];
    const yLine = startYLegend + i * lineHeightLegend;

    if (mouseX > xLegend &&
        mouseY > yLine && mouseY < yLine + lineHeightLegend) {
      clickedCause = causa;
      return;
    }
  }


  /* 5) CLICK SU UN PETALO */
  if (hoveredCause) {
    clickedCause = hoveredCause.cause;
    return;
  }
  
}

function drawTooltip() {
  if (clickedCause) return;
  if (!hoveredCause) return;

  // niente tooltip per la legenda
  if (hoveredCause.value === undefined) return;
  

  let lettera = LETTERE_CAUSE[hoveredCause.cause] || "";
  let nomeEsteso = NOMI_CAUSE[hoveredCause.cause] || hoveredCause.cause;
  let txt = `${lettera} - ${nomeEsteso}: ${hoveredCause.value} specie`;

  textSize(14);
  let w = textWidth(txt) + 20;
  let h = 30;

  let x = mouseX + 15;
  let y = mouseY + 15;

  if (x + w > width) x = mouseX - w - 10;
  if (y + h > height) y = mouseY - h - 10;

  fill(255);
  noStroke();
  rect(x, y, w, h, 5);

  fill(TEXT_COLOR);
  textAlign(LEFT, CENTER);
  text(txt, x + 10, y + h/2);
}




/* 9. OVERLAY DESCRIZIONI */

function drawOverlay(causeKey) {
  fill(0, 120);
  noStroke();
  rect(0, 0, width, height);

  const w = 500;
  const h = 300;
  const popX = windowWidth / 2;
  const popY = windowHeight / 2;
  const boxLeft = popX - w / 2;
  const boxTop = popY - h / 2;

  push();
  push();

  // crea path arrotondato per il clipping
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.moveTo(boxLeft + 12, boxTop);
  drawingContext.lineTo(boxLeft + w - 12, boxTop);
  drawingContext.quadraticCurveTo(boxLeft + w, boxTop, boxLeft + w, boxTop + 12);
  drawingContext.lineTo(boxLeft + w, boxTop + h - 12);
  drawingContext.quadraticCurveTo(boxLeft + w, boxTop + h, boxLeft + w - 12, boxTop + h);
  drawingContext.lineTo(boxLeft + 12, boxTop + h);
  drawingContext.quadraticCurveTo(boxLeft, boxTop + h, boxLeft, boxTop + h - 12);
  drawingContext.lineTo(boxLeft, boxTop + 12);
  drawingContext.quadraticCurveTo(boxLeft, boxTop, boxLeft + 12, boxTop);
  drawingContext.closePath();
  drawingContext.clip();
  
  // disegna l’immagine dentro il clipping arrotondato
  image(sfondo_overlay, boxLeft, boxTop, w, h);
  
  // ripristina contesto
  drawingContext.restore();
  
  pop();
  

  let titolo = NOMI_CAUSE[causeKey] || causeKey;
  let descrizione = DESCRIZIONI_CAUSE[causeKey] || "Descrizione non disponibile.";

  fill(TEXT_COLOR);
  noStroke();
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(22);
  text(titolo, popX, boxTop + 20);

  textStyle(NORMAL);
  textSize(16);
  textAlign(LEFT, TOP);
  text(descrizione, boxLeft + 30, boxTop + 70, w - 60, h - 100);

  // --- X per chiudere, più piccola e marrone ---
  const btnSize = 12;  // prima era 20
  const closeCx = boxLeft + w - 22;
  const closeCy = boxTop + 22;

  stroke(TEXT_COLOR);
  strokeWeight(1.6);   // più fine e più elegante

  line(closeCx - btnSize/2, closeCy - btnSize/2,
      closeCx + btnSize/2, closeCy + btnSize/2);

  line(closeCx + btnSize/2, closeCy - btnSize/2,
      closeCx - btnSize/2, closeCy + btnSize/2);

  pop();

  overlayCloseBounds = {x: closeCx, y: closeCy, size: btnSize};
}
