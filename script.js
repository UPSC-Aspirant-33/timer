let timer;
let totalSeconds = 0;
let remaining = 0;
let currentSubject;
let plannedMinutes;
let modalResolve;

function startTimer() {
  currentSubject = document.getElementById("subject").value;
  plannedMinutes = parseInt(document.getElementById("time").value);

  if(!currentSubject || !plannedMinutes){
    alert("Please enter subject and time 🌱"); return;
  }

  remaining = plannedMinutes * 60;
  totalSeconds = remaining;

  document.getElementById("currentSubject").innerText = `📘 ${currentSubject}`;
  clearInterval(timer);
  timer = setInterval(runTimer,1000);
}

function runTimer(){
  remaining--;
  updateClock();
  if(remaining<=0){
    clearInterval(timer);
    document.getElementById("alarm").play();
    pauseSession(true);
  }
}

function updateClock(){
  const m=Math.floor(remaining/60);
  const s=remaining%60;
  document.getElementById("clock").innerText=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

async function pauseSession(auto=false){
  clearInterval(timer);
  const spentSeconds = totalSeconds - remaining;
  const spentMinutes = Math.max(1, Math.ceil(spentSeconds/60));

  const achieved = await showYesNoModal(
    auto ? "⏰ Time completed.\nDid you achieve your study target?" : "Did you achieve what you planned?"
  );

  const advice = generateAdvice(achieved, spentMinutes);
  alert(advice.message);

  saveSession(spentMinutes, achieved, advice.text);
}

function generateAdvice(achieved, spentMinutes){
  let message="", adviceText="";
  if(spentMinutes>plannedMinutes){
    if(achieved){
      message="🌸 Achieved goal but took longer.\nTip: Break topic into smaller sub-topics.";
      adviceText="Break topic into smaller parts";
    }else{
      message="🌱 Topic heavy today.\nTip: Reduce scope, revise basics first.";
      adviceText="Reduce scope, revise basics";
    }
  }else{
    if(achieved){
      message="✨ Perfect balance today. Time and focus managed beautifully.";
      adviceText="Perfect balance";
    }else{
      message="🌿 It's okay. Set lighter target to build confidence.";
      adviceText="Lower target, build confidence";
    }
  }
  return {message, text:adviceText};
}

function saveSession(spentMinutes, achieved, advice){
  const data = JSON.parse(localStorage.getItem("sessions")||"[]");
  data.push({
    subject: currentSubject,
    planned: plannedMinutes,
    spent: spentMinutes,
    achieved:achieved?"YES":"NO",
    advice:advice,
    date:new Date().toLocaleString()
  });
  localStorage.setItem("sessions",JSON.stringify(data));
  loadDashboard();
}

function loadDashboard(){
  const dash=document.getElementById("dashboard");
  dash.innerHTML="";
  const data=JSON.parse(localStorage.getItem("sessions")||"[]");
  data.reverse().forEach(d=>{
    const div=document.createElement("div");
    div.className="entry";
    div.innerHTML=`
      <b>${d.subject}</b><br>
      Planned: ${d.planned} min | Spent: ${d.spent} min<br>
      Target Achieved: ${d.achieved}<br>
      🧠 Advice: ${d.advice}<br>
      🗓 ${d.date}
    `;
    dash.appendChild(div);
  });
}
loadDashboard();

// ---------- YES/NO MODAL ----------
function showYesNoModal(question){
  return new Promise(resolve=>{
    modalResolve = resolve;
    document.getElementById("modalQuestion").innerText=question;
    document.getElementById("yesNoModal").style.display="flex";
  });
}

function modalAnswer(value){
  document.getElementById("yesNoModal").style.display="none";
  if(modalResolve) modalResolve(value);
}
