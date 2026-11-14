let savedAdmins = JSON.parse(localStorage.getItem("sims_admins")) || [
  ["admin", { name: "Administrator", user: "admin", pass: "admin123" }],
  ["gabriel", { name: "Elijah Gabriel P. Gelle", user: "Gabriel", pass: "123456" }]
];
let uMap = new Map(savedAdmins);

let defaultArr = [
  { id: "20241762", name: "Elijah Gabriel P. Gelle", course: "BSIS 2A", gwa: 1.25, pass: "1234", notifs: ["Welcome!"] },
  { id: "20241801", name: "Christian Gelle", course: "BSIS 2A", gwa: 1.50, pass: "1234", notifs: ["Welcome!"] },
  { id: "20241802", name: "Adelfa Irene P. Gelle", course: "BSIS 2A", gwa: 1.25, pass: "1234", notifs: ["Welcome!"] },
  { id: "20241755", name: "Aldrin Regalado", course: "BSIS 2A", gwa: 1.00, pass: "1234", notifs: ["Welcome!"] }
];
let arr = JSON.parse(localStorage.getItem("sims_arr")) || defaultArr;
let map = new Map(), delMap = new Map(), delStack = [], logStack = [];
arr.forEach(s => map.set(s.id, s));

function save() {
  localStorage.setItem("sims_arr", JSON.stringify(arr));
  localStorage.setItem("sims_admins", JSON.stringify(Array.from(uMap.entries())));
}

function aMsg(t, e) {
  let m = document.getElementById("amsg");
  m.style.display = "block";
  m.style.background = e ? "#f8d7da" : "#d4edda";
  m.style.color = e ? "#721c24" : "#155724";
  m.innerText = t;
}

function showTab(t) {
  document.getElementById("amsg").style.display = "none";
  document.getElementById("vLogin").className = (t === "login") ? "" : "hide";
  document.getElementById("vReg").className = (t === "reg") ? "" : "hide";
  document.getElementById("bLoginTab").className = (t === "login") ? "" : "off";
  document.getElementById("bRegTab").className = (t === "reg") ? "" : "off";
}

document.getElementById("bLoginTab").onclick = () => showTab("login");
document.getElementById("bRegTab").onclick = () => showTab("reg");

document.getElementById("btnDoReg").onclick = function() {
  let name = document.getElementById("rName").value.trim(), user = document.getElementById("rUser").value.trim(), pass = document.getElementById("rPass").value;
  if (!name || !user || !pass) return aMsg("Fill in all fields!", true);
  if (pass.length < 6) return aMsg("Password must be at least 6 chars!", true);
  if (uMap.has(user.toLowerCase()) || map.has(user)) return aMsg("Username already exists!", true);
  uMap.set(user.toLowerCase(), { name, user, pass });
  save();
  document.getElementById("rName").value = document.getElementById("rUser").value = document.getElementById("rPass").value = "";
  showTab("login");
  aMsg("Account created! You can now log in.", false);
};

document.getElementById("btnDoLogin").onclick = function() {
  let raw = document.getElementById("lUser").value.trim(), user = raw.toLowerCase(), pass = document.getElementById("lPass").value;
  let acc = uMap.get(user);
  if (acc && acc.pass === pass) {
    document.getElementById("authBox").className = "auth hide";
    document.getElementById("mainBox").className = "box";
    document.getElementById("uLabel").innerText = "User: " + acc.name + " ";
    addLog("[LOGIN] " + acc.user);
    showAll();
    return;
  }
  if (delMap.has(raw)) return aMsg("Account Notice: Student ID " + raw + " was deleted by Admin!", true);
  let stu = map.get(raw);
  if (stu && stu.pass === pass) {
    document.getElementById("authBox").className = "auth hide";
    document.getElementById("studentBox").className = "box";
    document.getElementById("stId").innerText = stu.id;
    document.getElementById("stName").innerText = stu.name;
    document.getElementById("stCourse").innerText = stu.course;
    document.getElementById("stGwa").innerText = Number(stu.gwa).toFixed(2);
    document.getElementById("stuNotif").innerHTML = stu.notifs.map(n => "<li>" + n + "</li>").join("");
    return;
  }
  aMsg("Invalid username/ID or password!", true);
};

document.getElementById("btnDoLogout").onclick = () => { document.getElementById("mainBox").className = "box hide"; document.getElementById("authBox").className = "auth"; };
document.getElementById("btnStuLogout").onclick = () => { document.getElementById("studentBox").className = "box hide"; document.getElementById("authBox").className = "auth"; };

function notify(t, e) {
  let m = document.getElementById("msg");
  m.style.display = "block";
  m.style.background = e ? "#f8d7da" : "#d4edda";
  m.style.color = e ? "#721c24" : "#155724";
  m.innerText = t;
}

function addLog(t) {
  logStack.push(t);
  document.getElementById("log").innerHTML = logStack.slice().reverse().join("<br>");
}

function showAll(list) {
  list = list || arr;
  let tb = document.getElementById("tbody");
  tb.innerHTML = "";
  list.forEach(s => {
    let tr = document.createElement("tr");
    tr.innerHTML = "<td>" + s.id + "</td><td>" + s.name + "</td><td>" + s.course + "</td><td>" + Number(s.gwa).toFixed(2) + "</td><td><button class='ed'>Edit</button> <button class='btn-del dl'>Del</button></td>";
    tr.querySelector(".ed").onclick = () => {
      document.getElementById("sid").value = s.id;
      document.getElementById("sname").value = s.name;
      document.getElementById("scourse").value = s.course;
      document.getElementById("sgwa").value = s.gwa;
      document.getElementById("spass").value = s.pass;
      notify("Editing ID: " + s.id, false);
    };
    tr.querySelector(".dl").onclick = () => {
      if (!confirm("Are you sure you want to delete " + s.name + " (" + s.id + ")?")) return;
      delStack.push(s);
      map.delete(s.id);
      delMap.set(s.id, true);
      arr = arr.filter(x => x.id !== s.id);
      save();
      addLog("[DELETE] " + s.id);
      notify("Deleted ID: " + s.id, true);
      showAll();
    };
    tb.appendChild(tr);
  });
}

document.getElementById("btnAdd").onclick = () => {
  let id = document.getElementById("sid").value.trim(), name = document.getElementById("sname").value.trim(),
      course = document.getElementById("scourse").value.trim(), gwa = parseFloat(document.getElementById("sgwa").value),
      pass = document.getElementById("spass").value.trim() || "1234";
  if (!id || !name || !course || isNaN(gwa) || gwa < 1 || gwa > 5) return notify("Invalid inputs!", true);
  if (map.has(id)) return notify("Duplicate Student ID!", true);
  delMap.delete(id);
  let obj = { id, name, course, gwa, pass, notifs: ["Account created by Admin."] };
  arr.push(obj); map.set(id, obj); save();
  addLog("[ADD] " + id); notify("Added: " + name, false); showAll();
};

document.getElementById("btnUpdate").onclick = () => {
  let id = document.getElementById("sid").value.trim(), name = document.getElementById("sname").value.trim(),
      course = document.getElementById("scourse").value.trim(), gwa = parseFloat(document.getElementById("sgwa").value),
      pass = document.getElementById("spass").value.trim();
  let obj = map.get(id);
  if (!obj || !name || !course || isNaN(gwa) || gwa < 1 || gwa > 5) return notify("ID not found or invalid input!", true);
  if (obj.name !== name) obj.notifs.push("Name changed to " + name);
  if (obj.course !== course) obj.notifs.push("Course updated to " + course);
  if (obj.gwa !== gwa) obj.notifs.push("GWA updated from " + Number(obj.gwa).toFixed(2) + " to " + gwa.toFixed(2));
  if (pass) obj.pass = pass;
  obj.name = name; obj.course = course; obj.gwa = gwa; save();
  addLog("[UPDATE] " + id); notify("Updated: " + name, false); showAll();
};

document.getElementById("btnUndo").onclick = () => {
  let s = delStack.pop();
  if (!s) return notify("Stack is empty!", true);
  delMap.delete(s.id);
  s.notifs.push("Account restored by Admin.");
  arr.push(s); map.set(s.id, s); save();
  addLog("[RESTORE] " + s.id); notify("Restored: " + s.name, false); showAll();
};

document.getElementById("btnHash").onclick = () => {
  let q = document.getElementById("q").value.trim(), f = map.get(q);
  if (f) { showAll([f]); addLog("[HASH SEARCH] " + q); notify("Found ID: " + q, false); }
  else notify("Record not found!", true);
};

document.getElementById("btnLinear").onclick = () => {
  let q = document.getElementById("q").value.trim().toLowerCase();
  let res = arr.filter(x => x.name.toLowerCase().includes(q));
  if (res.length) { showAll(res); addLog("[LINEAR SEARCH] " + res.length); notify("Found " + res.length, false); }
  else notify("No matching name!", true);
};

document.getElementById("btnSortName").onclick = () => {
  for (let i = 0; i < arr.length - 1; i++)
    for (let j = 0; j < arr.length - i - 1; j++)
      if (arr[j].name.toLowerCase() > arr[j + 1].name.toLowerCase()) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
  save(); addLog("[BUBBLE SORT] Name"); notify("Sorted by Name", false); showAll();
};

document.getElementById("btnSortGwa").onclick = () => {
  for (let i = 0; i < arr.length - 1; i++)
    for (let j = 0; j < arr.length - i - 1; j++)
      if (arr[j].gwa > arr[j + 1].gwa) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
  save(); addLog("[BUBBLE SORT] GWA"); notify("Sorted by GWA", false); showAll();
};

document.getElementById("btnShowAll").onclick = () => { showAll(); notify("Showing all records", false); };
addLog("[SYSTEM] Loaded " + arr.length + " initial records");
showAll();
