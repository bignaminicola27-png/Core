// CONFIGURAZIONE PIN (Predefinito: 1234)
const CORRECT_PIN = "1234"; 
let currentPin = "";
let userShortcuts = [];
let userSubscriptions = [];
let userStrings = [];

// Funzione di sblocco riscritta appositamente per il touch di iPhone
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
            }, 200);
        } else if (currentPin.length === 4) {
            setTimeout(() => { 
                alert("PIN Errato"); 
                clearPin(); 
            }, 200);
        }
    }
}

function updateDots() {
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
        if (index < currentPin.length) {
            dot.classList.add("filled");
        } else {
            dot.classList.remove("filled");
        }
    });
}

function clearPin() { 
    currentPin = ""; 
    updateDots(); 
}

function lockApp() {
    document.getElementById("main-screen").classList.add("hidden");
    document.getElementById("pin-screen").classList.remove("hidden");
}

function calculateFinance() {
    const inbank = parseFloat(document.getElementById("val-inbank").value) || 0;
    const trade = parseFloat(document.getElementById("val-trade").value) || 0;
    const binance = parseFloat(document.getElementById("val-binance").value) || 0;
    const revolut = parseFloat(document.getElementById("val-revolut").value) || 0;
    const total = inbank + trade + binance + revolut;
    document.getElementById("total-assets").innerText = total.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
    localStorage.setItem("core_finance", JSON.stringify({inbank, trade, binance, revolut}));
    calculateSavingsRate();
}

function calculateBudget() {
    const salary = parseFloat(document.getElementById("salary-input").value) || 0;
    if(salary <= 0) return;
    document.getElementById("b-50").innerText = (salary * 0.5).toFixed(2) + " €";
    document.getElementById("b-30").innerText = (salary * 0.3).toFixed(2) + " €";
    document.getElementById("b-20").innerText = (salary * 0.2).toFixed(2) + " €";
    localStorage.setItem("core_salary", salary);
    calculateSavingsRate();
}

function calculateSavingsRate() {
    const salary = parseFloat(document.getElementById("salary-input").value) || parseFloat(localStorage.getItem("core_salary")) || 0;
    if (salary <= 0) return;
    const b30 = salary * 0.3;
    const b20 = salary * 0.2;
    const standardRate = (((b30 + b20) / salary) * 100).toFixed(0);
    document.getElementById("savings-rate-display").innerText = `${standardRate}%`;
    document.getElementById("budget-results").classList.remove("hidden-results");
}

function generateSecurePassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#\$%^&*()_+";
    let password = "";
    for (let i = 0; i < 16; i++) { password += chars.charAt(Math.floor(Math.random() * chars.length)); }
    document.getElementById("generated-pwd").value = password;
}

// Assicura il corretto funzionamento della copia su iOS PWA
function copyPassword() {
    const pwdInput = document.getElementById("generated-pwd");
    if(pwdInput.value) { 
        navigator.clipboard.writeText(pwdInput.value); 
        alert("Password copiata!"); 
    }
}

function addNewString() {
    const title = prompt("Nome della stringa (es: IBAN Inbank):");
    if (!title) return;
    const value = prompt("Incolla qui il codice:");
    if (!value) return;
    userStrings.push({ title, value });
    localStorage.setItem("core_strings", JSON.stringify(userStrings));
    renderStrings();
}

function removeString(index) {
    if(confirm("Vuoi eliminare questa stringa?")) {
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
        container.innerHTML = "<p style='color:var(--text-gray); font-size:12px; text-align:center;'>Nessun codice inserito.</p>";
        return;
    }
    userStrings.forEach((str, index) => {
        const div = document.createElement("div");
        div.style = "display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #1c1c1e;";
        div.innerHTML = `
            <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-right:10px;">
                <span style="font-weight:500; font-size:14px; display:block;">${str.title}</span>
                <span style="font-size:11px; color:var(--text-gray); font-family:monospace;">${str.value}</span>
            </div>
            <div style="display:flex; gap:8px;">
                <button onclick="copyStringToClipboard('${str.value}')" style="background:transparent; border:1px solid var(--cyan); color:var(--cyan); padding:4px 10px; font-size:12px;">Copia</button>
                <button onclick="removeString(${index})" style="background:#ff3b30; color:white; padding:4px 8px; font-size:12px; border-radius:6px;">✕</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function addNewSubscription() {
    const name = prompt("Nome abbonamento:");
    if (!name) return;
    const cost = parseFloat(prompt("Costo mensile (€):")) || 0;
    const day = parseInt(prompt("Giorno di scadenza (1-31):")) || 1;
    userSubscriptions.push({ name, cost, day });
    localStorage.setItem("core_subs", JSON.stringify(userSubscriptions));
    renderSubscriptions();
}

function removeSubscription(index) {
    if(confirm("Eliminare questa scadenza?")) {
        userSubscriptions.splice(index, 1);
        localStorage.setItem("core_subs", JSON.stringify(userSubscriptions));
        renderSubscriptions();
    }
}

function renderSubscriptions() {
    const container = document.getElementById("subs-container");
    container.innerHTML = "";
    let totalCost = 0;
    const today = new Date();
    const currentDay = today.getDate();

    if(userSubscriptions.length === 0) {
        container.innerHTML = "<p style='color:var(--text-gray); font-size:12px; text-align:center;'>Nessuna scadenza inserita.</p>";
        document.getElementById("total-subs-cost").innerText = "0.00 €";
        return;
    }

    userSubscriptions.forEach((sub, index) => {
        totalCost += sub.cost;
        let diff = sub.day - currentDay;
        let daysLeftText = "";
        if (diff === 0) daysLeftText = "Oggi ⚠️";
        else if (diff > 0) daysLeftText = `Tra ${diff} gg`;
        else {
            let nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, sub.day);
            let timeDiff = nextMonthDate.getTime() - today.getTime();
            let daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            daysLeftText = `Tra ${daysDiff} gg`;
        }

        const div = document.createElement("div");
        div.style = "display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #1c1c1e; font-size:14px;";
        div.innerHTML = `
            <div style="flex:1;">
                <span style="font-weight:500;">${sub.name}</span>
                <span style="font-size:11px; color:var(--text-gray); margin-left:8px;">(Gg ${sub.day})</span>
            </div>
            <div style="color:var(--cyan); font-weight:bold; margin-right:15px;">${sub.cost.toFixed(2)} €</div>
            <div style="font-size:12px; color:var(--text-gray); margin-right:15px;">${daysLeftText}</div>
            <button onclick="removeSubscription(${index})" style="background:#ff3b30; color:white; padding:2px 8px; font-size:11px; border-radius:4px;">✕</button>
        `;
        container.appendChild(div);
    });
    document.getElementById("total-subs-cost").innerText = totalCost.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
}

function addNewShortcut() {
    const name = prompt("Nome esatto del comando rapido iOS:");
    if (!name || userShortcuts.includes(name)) return;
    userShortcuts.push(name);
    localStorage.setItem("core_shortcuts", JSON.stringify(userShortcuts));
    renderShortcuts();
}

function removeShortcut(name) {
    if(confirm(`Rimuovere "${name}"?`)) {
        userShortcuts = userShortcuts.filter(item => item !== name);
        localStorage.setItem("core_shortcuts", JSON.stringify(userShortcuts));
        renderShortcuts();
    }
}

function renderShortcuts() {
    const container = document.getElementById("shortcuts-container");
    container.innerHTML = "";
    if(userShortcuts.length === 0) {
        container.innerHTML = "<p style='color:var(--text-gray); font-size:12px; text-align:center;'>Nessun comando aggiunto.</p>";
        return;
    }
    userShortcuts.forEach(shortcut => {
        const wrapper = document.createElement("div");
        wrapper.style = "display:flex; gap:10px; margin-bottom:10px;";
        const encodedName = encodeURIComponent(shortcut);
        wrapper.innerHTML = `
            <a href="shortcuts://run-shortcut?name=${encodedName}" class="btn-hk" style="flex:1; text-align:left; padding:12px;">⚡ ${shortcut}</a>
            <button onclick="removeShortcut('${shortcut}')" style="background:#ff3b30; color:white; padding:0 15px; border-radius:12px;">✕</button>
        `;
        container.appendChild(wrapper);
    });
}

function saveNotes() {
    const noteText = document.getElementById("secure-notes").value;
const encrypted = btoa(unescape(encodeURIComponent(noteText)));
localStorage.setItem("core_notes", encrypted);
alert("Nota salvata localmente.");
}
function loadData() {
const savedFin = JSON.parse(localStorage.getItem("core_finance"));
if(savedFin) {
document.getElementById("val-inbank").value = savedFin.inbank;
document.getElementById("val-trade").value = savedFin.trade;
document.getElementById("val-binance").value = savedFin.binance;
document.getElementById("val-revolut").value = savedFin.revolut;
calculateFinance();
}
const savedSalary = localStorage.getItem("core_salary");
if(savedSalary) {
document.getElementById("salary-input").value = savedSalary;
calculateBudget();
}
const savedNotes = localStorage.getItem("core_notes");
if(savedNotes) {
document.getElementById("secure-notes").value = decodeURIComponent(escape(atob(savedNotes)));
}
const savedShortcuts = JSON.parse(localStorage.getItem("core_shortcuts"));
if(savedShortcuts) userShortcuts = savedShortcuts;
renderShortcuts();
const savedSubs = JSON.parse(localStorage.getItem("core_subs"));
if(savedSubs) userSubscriptions = savedSubs;
renderSubscriptions();
const savedStrings = JSON.parse(localStorage.getItem("core_strings"));
if(savedStrings) userStrings = savedStrings;
renderStrings();
}
