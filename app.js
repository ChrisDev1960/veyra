const services = [
  {name:"Data",icon:`<path d="M4 6h16M4 12h16M4 18h16"/>`},
  {name:"Airtime",icon:`<circle cx="12" cy="12" r="8"/>`},
  {name:"Betting",icon:`<path d="M4 12h16M12 4v16"/>`},
  {name:"TV",icon:`<rect x="4" y="6" width="16" height="10"/>`},
  {name:"Loans",icon:`<path d="M12 2v20M2 12h20"/>`},
  {name:"Wallet",icon:`<rect x="3" y="7" width="18" height="10"/>`},
  {name:"Referral",icon:`<circle cx="8" cy="8" r="3"/><circle cx="16" cy="16" r="3"/>`},
  {name:"Electricity",icon:`<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>`},
  {name:"Education",icon:`<path d="M4 6l8-4 8 4-8 4z"/>`},
  {name:"Internet",icon:`<circle cx="12" cy="12" r="10"/>`},
  {name:"Insurance",icon:`<path d="M12 2l8 4v6c0 5-3 9-8 10-5-1-8-5-8-10V6z"/>`},
  {name:"Gaming",icon:`<path d="M6 12h12M12 6v12"/>`},
  {name:"Transport",icon:`<rect x="4" y="10" width="16" height="6"/>`},
  {name:"Tickets",icon:`<rect x="3" y="8" width="18" height="8"/>`},
  {name:"More",icon:`<circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/>`}
];

const container = document.getElementById("services");

services.forEach(s=>{
  const div=document.createElement("div");
  div.className="service";
  div.innerHTML=`<svg viewBox="0 0 24 24">${s.icon}</svg><div>${s.name}</div>`;
  container.appendChild(div);
});

/* BALANCE */
let visible=true;
document.getElementById("toggleBalance").onclick=()=>{
  visible=!visible;
  document.getElementById("balance").innerText=visible?"₦ 128,400":"••••••";
  if(navigator.vibrate) navigator.vibrate(10);
};

/* THEME */
document.getElementById("themeToggle").onclick=()=>{
  document.body.classList.toggle("dark");
};

/* TX + SKELETON */
const skeleton=document.getElementById("skeleton");
for(let i=0;i<3;i++){
  const d=document.createElement("div");
  skeleton.appendChild(d);
}

setTimeout(()=>{
  skeleton.style.display="none";
  const list=document.getElementById("tx-list");
  list.classList.remove("hidden");

  ["MTN Data","Wallet Funding","Bet9ja"].forEach(t=>{
    const div=document.createElement("div");
    div.className="tx";
    div.innerHTML=`${t}`;
    list.appendChild(div);
  });
},1000);
