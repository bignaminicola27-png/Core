const CORRECT_PIN = "1234"; 
let currentPin = "";
let userShortcuts = [];
let userSubscriptions = [];
let userStrings = [];
let dcaTranches = [];

// GESTIONE SBLOCCO PIN ACCURATO
function pressKey(num) {
    if (currentPin.length < 4) {
        currentPin += num;
        updateDots();
        if (currentPin === CORRECT_PIN) {
            setTimeout(() => {
                document.getElementById("pin-screen").classList.add("hidden");
                document.getElementById("main-screen").classList.remove("hidden");
                loadData();
                clearPin();
            }, 180);
        } else if (currentPin.length === 4) {
            setTimeout(() => { alert("PIN Errato"); clearPin(); }, 200);
        }
    }
}

function updateDots() {
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
        if (index < currentPin.length) dot.classList.add("filled");
        else dot.classList.remove("filled");
    });
}

function clearPin() { currentPin = ""; updateDots(); }

function lockApp() {
    document.getElementById("main-screen").classList.add("hidden");
    document.getElementById("pin-screen").classList.remove("hidden");
    if(document.getElementById("sidebar").classList.contains("open")) toggleMenu();
}

// MANAGEMENT SIDEBAR E NAVIGAZIONE INTERNA
function toggleMenu() {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebar-overlay").classList.toggle("show");
}

function switchView(viewId, title) {
    document.querySelectorAll(".sub-view").forEach(v => v.classList.add("hidden"));
    document.getElementById(`view-${viewId}`).classList.remove("hidden");
    document.getElementById("view-title").innerText = title;
    document.querySelectorAll(".menu-list li").forEach(li => li.classList.remove("active"));
    
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add("active");
    }
    toggleMenu();
    if(viewId === 'qr-view') generateLocalQr();
}

// CALCOLI FINANZIARI
function calculateFinance() {
    const inbank = parseFloat(document.getElementById("val-inbank").value) || 0;
    const trade = parseFloat(document.getElementById("val-trade").value) || 0;
    const binance = parseFloat(document.getElementById("val-binance").value) || 0;
    const revolut = parseFloat(document.getElementById("val-revolut").value) || 0;
    
    const total = inbank + trade + binance + revolut;
    document.getElementById("total-assets").innerText = total.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
    localStorage.setItem("core_finance", JSON.stringify({inbank, trade, binance, revolut}));
    calculateRunway(total);
}

function calculateBudget() {
    const salary = parseFloat(document.getElementById("salary-input").value) || 0;
    if(salary <= 0) return;
    document.getElementById("b-50").innerText = (salary * 0.5).toFixed(2) + " €";
    document.getElementById("b-30").innerText = (salary * 0.3).toFixed(2) + " €";
    document.getElementById("b-20").innerText = (salary * 0.2).toFixed(2) + " €";
    localStorage.setItem("core_salary", salary);
    calculateFinance();
}

function calculateRunway(totalAssets) {
    let totalFixedCosts = 0;
    userSubscriptions.forEach(sub => totalFixedCosts += sub.cost);
    const output = document.getElementById("runway-output");
    if (totalFixedCosts <= 0) {
        output.innerText = "Nessuna uscita fissa registrata.";
        return;
    }
    const months = (totalAssets / totalFixedCosts).toFixed(1);
    output.innerText = (months === "Infinity" || isNaN(months)) ? "Dati insufficienti" : `${months} Mesi di Copertura`;
}

// LOGICA GENERATORE QR OFFLINE
function generateLocalQr() {
    const text = document.getElementById("qr-text-input").value || "CORE SYSTEM";
    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";
    if (typeof QRCode !== "undefined") {
        new QRCode(qrContainer, { text: text, width: 140, height: 140 });
    } else {
        qrContainer.innerText = "Attivazione modulo hardware...";
    }
}

// CALCOLATORE PREZZO DI CARICO MEDIO
function addDcaTranche() {
    const qty = parseFloat(document.getElementById("dca-amount").value) || 0;
    const price = parseFloat(document.getElementById("dca-price").value) || 0;
    if (qty <= 0 || price <= 0) return;

    dcaTranches.push({ qty, price });
    localStorage.setItem("core_dca", JSON.stringify(dcaTranches));
    document.getElementById("dca-amount").value = "";
    document.getElementById("dca-price").value = "";
    renderDca();
}

function clearDca() {
    dcaTranches = [];
    localStorage.removeItem("core_dca");
    renderDca();
}

function renderDca() {
    let totalQty = 0; let totalSpent = 0;
    dcaTranches.forEach(t => { totalQty += t.qty; totalSpent += (t.qty * t.price); });
    const avgPrice = totalQty > 0 ? (totalSpent / totalQty) : 0;
    document.getElementById("dca-total-qty").innerText = totalQty.valueOf();
    document.getElementById("dca-average-output").innerText = avgPrice.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
}

// VAULT COPIA RAPIDA
function addNewString() {
    const title = prompt("Esempio: IBAN Inbank, Wallet BTC:");
    if (!title) return;
    const value = prompt("Testo o codice da salvare:");
    if (!value) return;
    userStrings.push({ title, value });
    localStorage.setItem("core_strings", JSON.stringify(userStrings));
    renderStrings();
}

function removeString(index) {
    if(confirm("Eliminare dal Vault?")) {
        userStrings.splice(index, 1);
        localStorage.setItem("core_strings", JSON.stringify(userStrings));
        renderStrings();
    }
}

function copyStringToClipboard(value) {
    navigator.clipboard.writeText(value);
    alert("Copiato negli appunti!");
}

function renderStrings() {
    const container = document.getElementById("strings-container");
    container.innerHTML = "";
    if(userStrings.length === 0) {
        container.innerHTML = "<p style='color:var(--apple-gray); font-size:12px; text-align:center;'>Vault vuoto.</p>";
        return;
    }
    userStrings.forEach((str, index) => {
        const div = document.createElement("div");
        div.className = "card";
        div.style = "display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:12px 16px;";
        div.innerHTML = `
            <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-right:12px;">
                <span style="font-weight:600; font-size:14px; display:block; color:white;">${str.title}</span>
                <span style="font-size:12px; color:var(--apple-gray); font-family:monospace;">${str.value}</span>
            </div>
            <div style="display:flex; gap:8px;">
                <button onclick="copyStringToClipboard('${str.value}')" class="apple-btn-secondary" style="padding:6px 12px;">Copia</button>
                <button onclick="removeString(${index})" style="background:#ff3b30; color:white; border:none; padding:0 10px; border-radius:6px;">✕</button>
            </div>`;
        container.appendChild(div);
    });
}

// GESTORE SCADENZE REQUISITO MONTHLY
function addNewSubscription() {
    const name = prompt("Nome scadenza (es: iCloud):");
    if (!name) return;
    const cost = parseFloat(prompt("Costo mensile in €:")) || 0;
    const day = parseInt(prompt("Giorno rinnovo (1-31):")) || 1;
    userSubscriptions.push({ name, cost, day });
    localStorage.setItem("core_subs", JSON.stringify(userSubscriptions));
    renderSubscriptions();
}

function removeSubscription(index) {
    if(confirm("Eliminare scadenza fissa?")) {
        userSubscriptions.splice(index, 1);
        localStorage.setItem("core_subs", JSON.stringify(userSubscriptions));
        renderSubscriptions();
    }
}

function renderSubscriptions() {
    const container = document.getElementById("subs-container");
    container.innerHTML = "";
    let totalCost = 0; const currentDay = new Date().getDate();
    if(userSubscriptions.length === 0) {
        container.innerHTML = "<p style='color:var(--apple-gray); font-size:12px; text-align:center;'>Nessun elemento presente.</p>";
        document.getElementById("total-subs-cost").innerText = "0.00 €";
        return;
    }
    userSubscriptions.forEach((sub, index) => {
        totalCost += sub.cost;
        let diff = sub.day - currentDay;
        let daysText = diff === 0 ? "Oggi ⚠️" : (diff > 0 ? `Tra ${diff} gg` : `Mese prox`);
        const div = document.createElement("div");
        div.className = "card";
        div.style = "display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:12px 16px;";
        div.innerHTML = `
            <div style="flex:1;"><span style="font-weight:600;">${sub.name}</span><span style="font-size:11px; color:var(--apple-gray); margin-left:8px;">Gg ${sub.day}</span></div>
            <div style="color:var(--apple-green); font-weight:700; margin-right:15px;">${sub.cost.toFixed(2)} €</div>
            <div style="font-size:12px; color:var(--apple-gray); margin-right:15px;">${daysText}</div>
            <button onclick="removeSubscription(${index})" style="background:rgba(255,59,48,0.2); color:#ff3b30; border:none; padding:4px 8px; border-radius:4px;">✕</button>`;
        container.appendChild(div);
    });
    document.getElementById("total-subs-cost").innerText = totalCost.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
}

// COMANDI AUTOMAZIONE HOMEKIT INTERRUTTORI
function addNewShortcut() {
    const name = prompt("Nome ESATTO del comando rapido su iPhone:");
    if (!name || userShortcuts.includes(name)) return;
    userShortcuts.push(name);
    localStorage.setItem("core_shortcuts", JSON.stringify(userShortcuts));
    renderShortcuts();
}

function removeShortcut(name) {
    if(confirm(`Rimuovere interruttore "${name}"?`)) {
userShortcuts = userShortcuts.filter(item => item !== name);
localStorage.setItem("core_shortcuts", JSON.stringify(userShortcuts));
renderShortcuts();
}
}
function renderShortcuts() {
const container = document.getElementById("shortcuts-container");
container.innerHTML = "";
if(userShortcuts.length === 0) {
container.innerHTML = "Nessun interruttore configurato.";
return;
}
userShortcuts.forEach(shortcut => {
const div = document.createElement("div");
div.style = "position:relative;";
const encodedName = encodeURIComponent(shortcut);
div.innerHTML =  <a href="shortcuts://run-shortcut?name=${encodedName}" class="btn-hk"> <div class="hk-icon">💡</div> <div class="hk-title">${shortcut}</div> </a> <button onclick="removeShortcut('${shortcut}')" style="position:absolute; top:8px; right:8px; background:rgba(255,59,48,0.2); color:#ff3b30; border:none; border-radius:50%; width:22px; height:22px; font-size:10px; cursor:pointer;">✕</button>;
container.appendChild(div);
});
}
// SCRATCHPAD E NOTE
function saveScratchpad() { localStorage.setItem("core_scratchpad", document.getElementById("scratchpad-text").value); }
function clearScratchpad() { document.getElementById("scratchpad-text").value = ""; localStorage.removeItem("core_scratchpad"); }
function saveNotes() { localStorage.setItem("core_notes", btoa(unescape(encodeURIComponent(document.getElementById("secure-notes").value)))); alert("Nota salvata localmente."); }
function loadData() {
const savedFin = JSON.parse(localStorage.getItem("core_finance"));
if(savedFin) {
document.getElementById("val-inbank").value = savedFin.inbank;
document.getElementById("val-trade").value = savedFin.trade;
document.getElementById("val-binance").value = savedFin.binance;
document.getElementById("val-revolut").value = savedFin.revolut;
}
calculateFinance();
const savedSalary = localStorage.getItem("core_salary");
if(savedSalary) document.getElementById("salary-input").value = savedSalary;
const savedNotes = localStorage.getItem("core_notes");
if(savedNotes) document.getElementById("secure-notes").value = decodeURIComponent(escape(atob(savedNotes)));
const savedScratch = localStorage.getItem("core_scratchpad");
if(savedScratch) document.getElementById("scratchpad-text").value = savedScratch;
const savedShortcuts = JSON.parse(localStorage.getItem("core_shortcuts"));
if(savedShortcuts) userShortcuts = savedShortcuts;
renderShortcuts();
const savedSubs = JSON.parse(localStorage.getItem("core_subs"));
if(savedSubs) userSubscriptions = savedSubs;
renderSubscriptions();
const savedStrings = JSON.parse(localStorage.getItem("core_strings"));
if(savedStrings) userStrings = savedStrings;
renderStrings();
const savedDca = JSON.parse(localStorage.getItem("core_dca"));
if(savedDca) dcaTranches = savedDca;
renderDca();
}
