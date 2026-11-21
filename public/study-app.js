/* Math Quest Study Hub 1.0 – client UI, practice, original puzzles, full-weight exam simulations. */
(function(){
"use strict";
const M=window.MathCore;
const $=id=>document.getElementById(id);
if(!M){$("stage").innerHTML='<section class="panel"><h2 class="errorText">課程引擎未載入</h2><p>請確認 curriculum.js 已一併部署。</p></section>';return;}
const KEY="math-quest-study-v1";
const empty=()=>({lesson:1,difficulty:3,format:"choice",attempts:0,correct:0,wrong:[],puzzles:{},examResults:[],view:"lessons"});
let data=empty();
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==="object"){data={...empty(),...s};if(!Array.isArray(data.wrong))data.wrong=[];if(!Array.isArray(data.examResults))data.examResults=[];if(!data.puzzles||typeof data.puzzles!=="object")data.puzzles={};}}catch(e){}
let q=null,response=null,checked=false,hintLevel=0,feedback="",exam=null,puzzleMode="clock",puzzle=null,puzzlePhase="setup",puzzleAnswer="",puzzleFailures=0;
function save(){try{localStorage.setItem(KEY,JSON.stringify(data));if(exam)localStorage.setItem(KEY+"-exam",JSON.stringify(exam));else localStorage.removeItem(KEY+"-exam");}catch(e){}}
try{const old=JSON.parse(localStorage.getItem(KEY+"-exam"));if(old&&Array.isArray(old.answers)&&Array.isArray(old.questions)&&!old.finished)exam=old;}catch(e){}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=s=>esc(s).replace(/\n/g,"<br>");
const modeName={lessons:"七上 14 回課程地圖",practice:"分級練習",puzzle:"數學機關解謎",exam:"段考模擬考",wrong:"錯題診斷中心"};
const modeSub={lessons:"每一回對照不同知識點，先選回次再開始練習。",practice:"D1–D5 隨機原創題目，每題都有精確判分與解析。",puzzle:"透過時間同步、分數路線及文字委託完成數學任務。",exam:"依 A／B／C 配分模擬，45 分鐘，非官方原卷。",wrong:"分析已作答的錯題，保留可能錯因與回練入口。"};
function updateStats(){
 $("statAttempts").textContent=data.attempts;
 $("statAccuracy").textContent=data.attempts?Math.round(data.correct/data.attempts*100)+"%":"0%";
 $("statPuzzles").textContent=Object.values(data.puzzles).reduce((s,v)=>s+(v>0?1:0),0);
 document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("on",b.dataset.view===data.view));
 $("pageTitle").textContent=modeName[data.view];$("pageSubtitle").textContent=modeSub[data.view];
}
function view(v){if(!modeName[v])return;data.view=v;save();render();}
function fieldQuestion(qq,answer,disabled=false){
 if(qq.format==="choice")return '<div class="choices">'+qq.options.map((c,i)=>'<button class="option '+(checked&&M.equivalent(qq,c)?"correct":checked&&answer===c?"incorrect":answer===c?"selected":"")+'" data-opt="'+esc(c)+'" '+(disabled?'disabled':'')+'><small>'+("ABCD"[i])+'</small>'+esc(c)+'</button>').join("")+'</div>';
 return '<div class="answerArea"><label>請輸入答案（整數、分數或小數）<input id="numericAnswer" class="response" type="text" inputmode="decimal" autocomplete="off" placeholder="例如 -3/4、-1 1/2、0.75" '+(disabled?'disabled':'')+' value="'+esc(answer||"")+'"></label></div>';
}
function lessonCard(u){
 const ch=u.chapter,desc=ch===1?"🌲 第一章":ch===2?"⛰️ 第二章":"🏰 第三章";
 return '<button class="lesson '+(data.lesson===u.index?"active":"")+'" data-lesson="'+u.index+'"><span class="eyebrow">第 '+u.index+' 回 · '+desc+'</span><strong>'+esc(u.code)+" "+esc(u.name)+'</strong><small>'+esc(u.skills)+'</small></button>';
}
function renderLessons(){
 $("stage").innerHTML='<section class="panel"><h2>📚 依試卷 14 回對照</h2><p class="muted">範圍來自 A／B／C 同回考點；1-R、2-R、3-R 為複習回次，不是課本新增小節。</p><div class="grid">'+M.UNITS.map(lessonCard).join("")+'</div><div class="action"><button class="btn" id="startChosen">開始第 '+data.lesson+' 回練習 →</button></div></section>';
 document.querySelectorAll("[data-lesson]").forEach(btn=>btn.onclick=()=>{data.lesson=Number(btn.dataset.lesson);save();render();});
 $("startChosen").onclick=()=>{resetPractice();view("practice");};
}
function resetPractice(){q=M.makeQuestion(data.lesson,data.difficulty,data.format);response=null;checked=false;hintLevel=0;feedback="";}
function recordWrong(qq,user,reason,source){
 data.wrong.unshift({id:qq.id,round:qq.round,code:qq.topic_code,topic:qq.topic_name,prompt:qq.prompt,answer:qq.answer,user:String(user),explanation:qq.explanation,category:reason.category,tag:qq.mistake_tags[0],hint:qq.hint,source,at:new Date().toISOString()});
 data.wrong=data.wrong.slice(0,200);
}
function markPractice(user){
 if(checked)return;
 let parsed;
 try{parsed=M.R.parse(user);}catch(e){feedback="請輸入有效的整數、分數或小數，例如 3/4 或 -1.25。";renderPractice();return;}
 const ok=M.equivalent(q,user),reason=M.diagnose(q,user);
 response=String(user);checked=true;data.attempts++;if(ok)data.correct++;else recordWrong(q,user,reason,"practice");
 feedback=ok?"✅ 精確判分：答對！":"❌ 答案不符。可能錯因："+reason.category+"（僅依題型初步分類）";
 save();render();
}
function renderPractice(){
 if(!q)resetPractice();
 const unit=M.UNITS[data.lesson-1];
 $("stage").innerHTML='<section class="panel"><h2>🎯 知識點練習</h2><div class="settings">'+
 '<label>回次<select class="control" id="topicSelect">'+M.UNITS.map(u=>'<option value="'+u.index+'" '+(u.index===data.lesson?"selected":"")+'>'+u.index+' · '+u.code+' '+esc(u.name)+'</option>').join("")+'</select></label>'+
 '<label>難度<select class="control" id="difficultySelect">'+M.DIFFICULTY.map((d,i)=>'<option value="'+(i+1)+'" '+(i+1===data.difficulty?"selected":"")+'>D'+(i+1)+' '+esc(d)+'</option>').join("")+'</select></label>'+
 '<label>題型<select class="control" id="formatSelect"><option value="choice" '+(data.format==="choice"?"selected":"")+'>四選一</option><option value="fill" '+(data.format==="fill"?"selected":"")+'>自行填答</option></select></label></div>'+
 '<div class="meta"><b>'+esc(unit.code)+' '+esc(unit.name)+'</b><b>D'+q.difficulty+' · '+esc(q.difficulty_name)+'</b><b>題目分類：'+esc(q.mistake_tags[0])+'</b></div>'+
 '<div class="question">'+fmt(q.prompt)+'</div>'+fieldQuestion(q,response,checked)+
 '<div class="action">'+(!checked&&q.format!=="choice"?'<button id="submitPractice" class="btn">批改答案</button>':'')+
 (!checked?'<button class="btn secondary" id="giveHint">'+(hintLevel?"下一層提示":"顯示提示")+'</button>':'')+
 (checked?'<button class="btn good" id="nextPractice">下一道隨機題 →</button>':'')+'</div>'+
 (hintLevel?'<div class="feedback"><strong>提示 '+hintLevel+' / 3</strong>'+esc([q.hint,q.method||"請先找出已知與未知。",q.explanation][hintLevel-1])+'</div>':'')+
 (feedback?'<div class="feedback '+(checked?(M.equivalent(q,response)?"good":"bad"):"")+'"><strong>'+esc(feedback)+'</strong>'+(checked?'<p>正確答案：'+esc(q.answer)+'</p><p>解析：'+esc(q.explanation)+'</p>':'')+'</div>':'')+
 '<p class="fine">'+esc(q.source_reference)+'</p></section>';
 $("topicSelect").onchange=e=>{data.lesson=Number(e.target.value);resetPractice();save();render();};
 $("difficultySelect").onchange=e=>{data.difficulty=Number(e.target.value);resetPractice();save();render();};
 $("formatSelect").onchange=e=>{data.format=e.target.value;resetPractice();save();render();};
 document.querySelectorAll("[data-opt]").forEach(btn=>btn.onclick=()=>markPractice(btn.dataset.opt));
 const sb=$("submitPractice");if(sb)sb.onclick=()=>markPractice($("numericAnswer").value);
 const hint=$("giveHint");if(hint)hint.onclick=()=>{hintLevel=Math.min(3,hintLevel+1);renderPractice();};
 const next=$("nextPractice");if(next)next.onclick=()=>{resetPractice();render();};
}
function generateClock(){
 const a=M.rand(3,9)*2,b=M.rand(3,10)*3;
 return {a,b,solution:M.lcm(a,b),method:"LCM",title:"雙鐘同步機關",explanation:"兩個週期再次同時出現要使用最小公倍數。LCM("+a+","+b+") = "+M.lcm(a,b)+" 分鐘。"};
}
function generateFractionRoute(){
 const r=M.R;let pair=[],solutions=[],targetIndex=M.rand(0,2);
 for(let i=0;i<3;i++){
  let a=r.of(M.rand(1,7),M.rand(3,9)),b=r.of(M.rand(1,6),M.rand(3,8));
  let sum=r.str(r.add(a,b));if(solutions.includes(sum)){i--;continue;}
  pair.push({a:r.str(a),b:r.str(b),sum});solutions.push(sum);
 }
 return {pair,targetIndex,target:pair[targetIndex].sum};
}
function generateCommission(){
 const scenarios=[
 ()=>{const p=M.rand(15,39),fee=M.rand(8,35),x=M.rand(4,12),total=p*x+fee;return {story:"商店每件商品 "+p+" 元，另收運費 "+fee+" 元。買若干件共付 "+total+" 元，買了幾件？",formula:p+"x + "+fee+" = "+total,options:[p+"x + "+fee+" = "+total,p+" + "+fee+"x = "+total,p+"x − "+fee+" = "+total],answer:String(x),why:"商品費用 "+p+"x 加運費 "+fee+" 等於總價 "+total+"，x="+x+"。",category:"購物"};},
 ()=>{const x=M.rand(11,17),diff=M.rand(3,9),sum=x*2+diff;return {story:"姊姊比弟弟大 "+diff+" 歲，兩人的年齡和為 "+sum+" 歲。若弟弟是 x 歲，x = ?",formula:"x + (x + "+diff+") = "+sum,options:["x + (x + "+diff+") = "+sum,"x + "+diff+" = "+sum,"x + (x − "+diff+") = "+sum],answer:String(x),why:"弟弟 x，姊姊 x+"+diff+"，相加可得 x="+x+"。",category:"年齡"};},
 ()=>{const p=M.rand(5,12),students=M.rand(4,9),left=M.rand(1,8),total=p*students+left;return {story:"把 "+total+" 顆糖分給 "+students+" 個人，每人 x 顆，最後剩 "+left+" 顆。求 x。",formula:students+"x + "+left+" = "+total,options:[students+"x + "+left+" = "+total,students+" + "+left+"x = "+total,students+"x − "+left+" = "+total],answer:String(p),why:"每人 x 顆共 "+students+"x 顆，加剩下 "+left+" 顆 = "+total+"，x="+p+"。",category:"分配"};},
 ()=>{const speed=M.rand(45,75),time=M.rand(2,5),dist=speed*time;return {story:"一段路長 "+dist+" 公里，巴士平均每小時行駛 x 公里，行車 "+time+" 小時到達。求 x。",formula:time+"x = "+dist,options:[time+"x = "+dist,"x + "+time+" = "+dist,"x − "+time+" = "+dist],answer:String(speed),why:"路程=速度×時間，所以 "+time+"x="+dist+"，x="+speed+"。",category:"路程"};}
 ];return takeOne(scenarios)();
}
function takeOne(arr){return arr[M.rand(0,arr.length-1)];}
function resetPuzzle(){
 puzzle=puzzleMode==="clock"?generateClock():puzzleMode==="fraction"?generateFractionRoute():generateCommission();
 puzzlePhase=puzzleMode==="commission"?"model":"setup";puzzleAnswer="";puzzleFailures=0;
}
function countPuzzleClear(){
 if(!data.puzzles[puzzleMode])data.puzzles[puzzleMode]=1;else data.puzzles[puzzleMode]++;
 save();
}
function puzzleFeedback(correct,reason){
 if(correct){puzzlePhase="done";puzzleAnswer="✅ "+reason;countPuzzleClear();}
 else{puzzleFailures++;puzzleAnswer="❌ "+reason+" 可調整後再試。";}
 render();
}
function renderPuzzle(){
 if(!puzzle)resetPuzzle();
 const choices='<div class="settings">'+[["clock","🕰️ 公倍數時間機關"],["fraction","🧭 分數路線"],["commission","📦 文字委託任務"]].map(x=>'<button class="btn '+(puzzleMode===x[0]?"":"secondary")+'" data-puzzle="'+x[0]+'">'+x[1]+'</button>').join("")+'</div>';
 let scene="";
 if(puzzleMode==="clock"){
  scene='<div class="puzzle-scene"><small>同步機關 · 週期推理</small><strong>🕰️ '+puzzle.a+' 分鐘　↔　'+puzzle.b+' 分鐘</strong><small>兩座時鐘現在同時響，下一次同時響要等待幾分鐘？</small></div>'+
  '<p class="muted">第一步：你要使用哪一種策略？</p><div class="choices"><button class="option" data-method="GCD">最大公因數 GCD</button><button class="option" data-method="LCM">最小公倍數 LCM</button></div>'+
  '<label>第二步：輸入等待時間（分鐘）<input class="control" id="puzzleNumber" type="number" placeholder="分鐘"></label><div class="action"><button class="btn" id="solveClock">啟動同步機關</button></div>';
 }else if(puzzleMode==="fraction"){
  scene='<div class="puzzle-scene"><small>分數迷宮 · 選擇正確通道</small><strong>🎯 目標總長度 '+esc(puzzle.target)+'</strong><small>每條路由兩段分數長度組成，找出相加符合目標的路線。</small></div>'+
  '<div class="routeGrid">'+puzzle.pair.map((r,i)=>'<button class="route" data-route="'+i+'"><span>'+["🌲","🌉","🏔️"][i]+'</span>路線 '+(i+1)+'<br>'+esc(r.a)+' + '+esc(r.b)+'</button>').join("")+'</div>';
 }else{
  scene='<div class="puzzle-scene"><small>委託板 · '+esc(puzzle.category)+'</small><strong>📜 解鎖文字密室</strong><small>'+esc(puzzle.story)+'</small></div>';
  if(puzzlePhase==="model")scene+='<p class="muted">第一步：選擇符合題意的列式。</p><div class="choices">'+puzzle.options.map((f,i)=>'<button class="option" data-model="'+esc(f)+'">'+esc(f)+'</button>').join("")+'</div>';
  else scene+='<p class="muted">列式正確！第二步：求出 x。</p><label>輸入 x 的值<input class="control" id="commissionValue" type="text" inputmode="decimal" placeholder="未知數 x"></label><div class="action"><button class="btn" id="solveCommission">完成委託</button></div>';
 }
 if(puzzlePhase==="done")scene='<div class="puzzle-scene"><strong>🏆 機關解鎖成功</strong><small>'+esc(puzzleAnswer)+'</small></div><div class="action"><button id="playAgain" class="btn good">挑戰下一組題目 →</button></div>';
 $("stage").innerHTML='<section class="panel"><h2>🧩 實際操作數學機關</h2><p class="muted">每個機關都需要先辨認數學策略，不是只有普通選擇題。</p>'+choices+scene+
 (puzzleAnswer&&puzzlePhase!=="done"?'<div class="feedback bad">'+esc(puzzleAnswer)+'</div>':'')+
 '<p class="fine">本模式採原創數值組合，重試不清除星星與金幣。通關紀錄只計算本中心的機關成績。</p></section>';
 document.querySelectorAll("[data-puzzle]").forEach(b=>b.onclick=()=>{puzzleMode=b.dataset.puzzle;resetPuzzle();render();});
 document.querySelectorAll("[data-method]").forEach(b=>b.onclick=()=>{puzzle.selectedMethod=b.dataset.method;document.querySelectorAll("[data-method]").forEach(c=>c.classList.toggle("selected",c===b));});
 const clock=$("solveClock");if(clock)clock.onclick=()=>{
  let v=$("puzzleNumber").value;
  if(!puzzle.selectedMethod){puzzleAnswer="請先選擇 GCD 或 LCM 策略。";render();return;}
  if(v.trim()===""){puzzleAnswer="請輸入等待時間。";render();return;}
  puzzleFeedback(puzzle.selectedMethod==="LCM"&&M.equivalent({answer:String(puzzle.solution)},v),puzzle.explanation);
 };
 document.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>{const idx=Number(b.dataset.route),correct=idx===puzzle.targetIndex;puzzleFeedback(correct,"正確路線是 "+(puzzle.targetIndex+1)+"，路段 "+puzzle.pair[puzzle.targetIndex].a+" + "+puzzle.pair[puzzle.targetIndex].b+" = "+puzzle.target+"。");});
 document.querySelectorAll("[data-model]").forEach(b=>b.onclick=()=>{if(b.dataset.model===puzzle.formula){puzzlePhase="solve";puzzleAnswer="";render();}else{puzzleFailures++;puzzleAnswer="列式錯誤：先找出『總價、總年齡、總路程或總數』的等量關係。";render();}});
 const finish=$("solveCommission");if(finish)finish.onclick=()=>{const v=$("commissionValue").value;if(!v.trim())return;puzzleFeedback(M.equivalent({answer:puzzle.answer},v),puzzle.why);};
 const again=$("playAgain");if(again)again.onclick=()=>{resetPuzzle();render();};
}
function prepareExam(form,scope){
 const ranges={all:M.UNITS.map(x=>x.index),ch1:[1,2,3,4,5],ch2:[6,7,8,9,10],ch3:[11,12,13,14]};
 const test=M.makeExam(form,ranges[scope]||ranges.all);
 exam={form,scope,questions:test.questions,answers:Array(test.questions.length).fill(""),index:0,deadline:Date.now()+45*60*1000,started:Date.now(),finished:false,total:test.total,minutes:45,results:null};
 save();render();
}
function finishExam(){
 if(!exam||exam.finished)return;
 let score=0,answered=0,records=[],diag={};
 for(let i=0;i<exam.questions.length;i++){
  const q=exam.questions[i],a=exam.answers[i]||"",ok=a.trim()&&M.equivalent(q,a);
  if(a.trim())answered++;if(ok)score+=q.points;
  else{
   const reason=M.diagnose(q,a);
   recordWrong(q,a||"(未作答)",reason,"exam");
   diag[reason.category]=(diag[reason.category]||0)+1;
  }
  records.push({number:i+1,round:q.round,points:q.points,ok:!!ok,answer:q.answer,chosen:a,prompt:q.prompt,explanation:q.explanation,format:q.format});
 }
 const result={form:exam.form,scope:exam.scope,date:new Date().toISOString(),score,total:exam.total,answered,questions:exam.questions.length,diagnostics:diag,records};
 exam.finished=true;exam.results=result;data.examResults.unshift({form:result.form,scope:result.scope,date:result.date,score,total:result.total,answered,questions:result.questions,diagnostics:diag});data.examResults=data.examResults.slice(0,15);
 save();render();
}
function renderExamSetup(){
 $("stage").innerHTML='<section class="panel"><h2>📝 A／B／C 配分模擬考</h2><p class="muted">仿三卷題型配分，全部是原創題目；A、B、C 並非簡單／中等／困難的官方難度分級。</p><div class="settings">'+
 '<label>考卷<select id="examForm" class="control"><option value="A">A 卷結構｜30% 選擇</option><option value="B">B 卷結構｜48% 選擇</option><option value="C">C 卷結構｜60% 選擇</option></select></label>'+
 '<label>考試範圍<select id="examScope" class="control"><option value="all">七上 14 回綜合</option><option value="ch1">第一章（1～5回）</option><option value="ch2">第二章（6～10回）</option><option value="ch3">第三章（11～14回）</option></select></label></div>'+
 '<table class="table"><thead><tr><th>配分</th><th>A 卷</th><th>B 卷</th><th>C 卷</th></tr></thead><tbody><tr><td>選擇題</td><td>10×3＝30</td><td>12×4＝48</td><td>12×5＝60</td></tr><tr><td>填充題</td><td>10×4＝40</td><td>6×4＝24</td><td>7×4＝28</td></tr><tr><td>非選擇題</td><td>3×10＝30</td><td>4×7＝28</td><td>2×6＝12</td></tr></tbody></table>'+
 '<div class="action"><button class="btn" id="beginExam">開始 45 分鐘模擬考</button></div><p class="fine">A 卷的 10 格填充對應基礎／精熟各 5 格。非選擇題以數值最終答案評分，不採步驟部分給分；不能與原卷分數直接比較。</p></section>';
 $("beginExam").onclick=()=>prepareExam($("examForm").value,$("examScope").value);
}
function renderExamLive(){
 if(!exam)return renderExamSetup();
 if(exam.finished)return renderExamResult();
 if(Date.now()>=exam.deadline){finishExam();return;}
 const qq=exam.questions[exam.index],currentAnswer=exam.answers[exam.index];
 const remain=exam.deadline-Date.now(),sec=Math.max(0,Math.ceil(remain/1000));const time=String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");
 $("stage").innerHTML='<section class="panel"><div class="examProgress"><div><h2>📝 '+exam.form+' 卷結構模擬考</h2><p class="muted">第 '+(exam.index+1)+' / '+exam.questions.length+' 題 · '+qq.points+' 分 · '+(qq.format==="choice"?"選擇題":qq.format==="fill"?"填充題":"計算解答題")+'</p></div><div class="timer" id="timer">'+time+'</div></div>'+
 '<div class="exam-nav">'+exam.questions.map((x,i)=>'<button class="'+(exam.answers[i]?"answered ":"")+(i===exam.index?"now":"")+'" data-q="'+i+'">'+(i+1)+'</button>').join("")+'</div>'+
 '<div class="meta"><b>'+esc(qq.topic_code)+' '+esc(qq.topic_name)+'</b><b>D'+qq.difficulty+'</b></div><div class="question">'+fmt(qq.prompt)+'</div>'+
 (qq.format==="choice"?'<div class="choices">'+qq.options.map((v,i)=>'<button class="option '+(currentAnswer===v?"selected":"")+'" data-exam-choice="'+esc(v)+'"><small>'+("ABCD"[i])+'</small>'+esc(v)+'</button>').join("")+'</div>':
 '<label>你的最終答案<input id="examText" class="response" type="text" inputmode="decimal" autocomplete="off" value="'+esc(currentAnswer)+'" placeholder="輸入分數、整數或小數"></label>')+
 '<div class="action"><button class="btn secondary" id="prevExam" '+(exam.index===0?"disabled":"")+'>上一題</button><button class="btn" id="nextExam">'+(exam.index===exam.questions.length-1?"最後一題":"保存並下一題")+'</button><button class="btn warn" id="finishExam">交卷並評分</button></div><p class="fine">作答可跳題，倒數計時會在 45 分鐘結束時自動交卷。未作答題目計 0 分。</p></section>';
 document.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{examCapture();exam.index=Number(b.dataset.q);save();render();});
 document.querySelectorAll("[data-exam-choice]").forEach(b=>b.onclick=()=>{exam.answers[exam.index]=b.dataset.examChoice;save();render();});
 const entry=$("examText");if(entry)entry.oninput=()=>{exam.answers[exam.index]=entry.value;save();};
 $("prevExam").onclick=()=>{examCapture();exam.index=Math.max(0,exam.index-1);save();render();};
 $("nextExam").onclick=()=>{examCapture();exam.index=Math.min(exam.questions.length-1,exam.index+1);save();render();};
 $("finishExam").onclick=()=>{examCapture();if(confirm("確定交卷？未作答題目將計 0 分。"))finishExam();};
}
function examCapture(){const t=$("examText");if(t&&exam)exam.answers[exam.index]=t.value;}
function renderExamResult(){
 const r=exam.results,wrong=r.records.filter(x=>!x.ok);
 $("stage").innerHTML='<section class="panel"><h2>🏅 '+r.form+' 卷模擬考結果</h2><div class="result">'+r.score+' / '+r.total+'</div><p class="muted">完成 '+r.answered+' / '+r.questions+' 題。這是原創題自動批改結果，不包含計算過程部分給分。</p><div class="bars">'+Object.entries(r.diagnostics).map(([x,n])=>'<span class="bar">'+esc(x)+'：'+n+' 題</span>').join("")+'</div><div class="action"><button class="btn" id="newExam">再考一份</button><button class="btn secondary" id="reviewExam">回到錯題本</button></div><div class="divider"></div><h3>錯題摘要（最多前 8 題）</h3>'+(!wrong.length?'<p class="muted">全部答對，恭喜！</p>':wrong.slice(0,8).map(x=>'<div class="feedback bad"><b>第 '+x.number+' 題 · '+x.points+' 分</b><p>'+esc(x.prompt)+'</p><p>你的答案：'+esc(x.chosen||"未作答")+' ｜ 正確答案：'+esc(x.answer)+'</p><p>'+esc(x.explanation)+'</p></div>').join(""))+'</section>';
 $("newExam").onclick=()=>{exam=null;save();render();};
 $("reviewExam").onclick=()=>view("wrong");
}
function renderWrong(){
 const cats={},rounds={};
 data.wrong.forEach(x=>{cats[x.category]=(cats[x.category]||0)+1;rounds[x.round]=(rounds[x.round]||0)+1;});
 let entries=data.wrong.slice(0,40);
 $("stage").innerHTML='<section class="panel"><h2>📕 錯題診斷</h2><p class="muted">以下是可能錯因，系統沒有完整的作答步驟，因此不能直接判定真正錯誤原因。</p><div class="bars">'+(Object.keys(cats).length?Object.entries(cats).map(([k,n])=>'<span class="bar">'+esc(k)+'：'+n+'</span>').join(""):'<span class="muted">尚無錯題紀錄。</span>')+'</div><div class="divider"></div><h3>錯誤較多的回次</h3><div class="bars">'+Object.entries(rounds).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([k,n])=>'<button data-review-topic="'+k+'" class="btn secondary">第 '+k+' 回 · '+n+' 題</button>').join("")+'</div><div class="divider"></div><h3>最近錯題</h3>'+(!entries.length?'<div class="empty">完成練習或模擬考後，錯題會顯示在這裡。</div>':entries.map(x=>'<div class="feedback"><b>第 '+x.round+' 回 · '+esc(x.topic)+' · '+esc(x.category)+'</b><p>'+esc(x.prompt)+'</p><p>原答案：'+esc(x.user)+' ｜ 正確：'+esc(x.answer)+'</p><p>解析：'+esc(x.explanation)+'</p><button class="btn secondary" data-retry="'+x.round+'">回到這一回練習</button></div>').join(""))+'</section>'+
 '<section class="panel"><h3>近期模擬考</h3>'+(!data.examResults.length?'<p class="muted">尚無模擬考紀錄。</p>':data.examResults.map(x=>'<p class="muted">'+esc(x.form)+' 卷 · '+x.score+'/'+x.total+' · '+new Date(x.date).toLocaleString("zh-TW")+'</p>').join(""))+'</section>';
 document.querySelectorAll("[data-review-topic],[data-retry]").forEach(b=>b.onclick=()=>{data.lesson=Number(b.dataset.retry||b.dataset.reviewTopic);resetPractice();view("practice");});
}
function render(){updateStats();const mode=data.view;if(mode==="lessons")renderLessons();else if(mode==="practice")renderPractice();else if(mode==="puzzle")renderPuzzle();else if(mode==="exam"){if(exam)renderExamLive();else renderExamSetup();}else renderWrong();}
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>view(b.dataset.view));
setInterval(()=>{if(data.view!=="exam"||!exam||exam.finished)return;if(Date.now()>=exam.deadline){finishExam();return;}const node=$("timer");if(node){const left=Math.max(0,Math.ceil((exam.deadline-Date.now())/1000));node.textContent=String(Math.floor(left/60)).padStart(2,"0")+":"+String(left%60).padStart(2,"0");}},1000);
render();
window.MathQuestStudy={getProgress:()=>({...data}),openLesson:(id)=>{data.lesson=id;resetPractice();view("practice");},engine:M};
})();