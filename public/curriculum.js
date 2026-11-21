/* Math Quest Study Engine 1.0 – original concept-aligned question templates.
   All question answers use exact reduced rational numbers; no eval or AI marking. */
(function(root){
"use strict";
const UNITS=[
 ["1-1","正數與負數","數線、絕對值、相反數、大小比較","sign"],
 ["1-2","正負數的加減","連加減、括號、溫度與增減","add"],
 ["1-3","正負數的乘除","符號規則、分配律、運算次序","mul"],
 ["1-4","指數記法與科學記號","次方、科學記號與數量級","sci"],
 ["1-R","第一章複習","整數運算與科學記號整合","review1"],
 ["2-1","質因數分解","標準分解式、因數個數","prime"],
 ["2-2","最大公因數與最小公倍數","分組、週期同步與最值","gcdlcm"],
 ["2-3","分數的四則運算","通分、約分、負分數與應用","fraction"],
 ["2-4","指數律","同底數運算與乘方","power"],
 ["2-R","第二章複習","質因數、分數、指數整合","review2"],
 ["3-1","式子的運算","代數式、係數、分配律","algebra"],
 ["3-2","解一元一次方程式","等量公理、去括號、解未知數","equation"],
 ["3-3","應用問題","費用、年齡、路程、分配","application"],
 ["3-R","第三章複習","列式、解方程式與應用整合","review3"]
].map((u,i)=>({index:i+1,code:u[0],name:u[1],skills:u[2],template:u[3],chapter:i<5?1:i<10?2:3}));
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){const c=a%b;a=b;b=c;}return a||1;}
function rat(n,d){d=d===undefined?1:d;if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||d===0)throw Error("invalid fraction "+n+"/"+d);if(d<0){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};}
const R={
 of:rat,
 add:(a,b)=>rat(a.n*b.d+b.n*a.d,a.d*b.d),
 sub:(a,b)=>rat(a.n*b.d-b.n*a.d,a.d*b.d),
 mul:(a,b)=>rat(a.n*b.n,a.d*b.d),
 div:(a,b)=>rat(a.n*b.d,a.d*b.n),
 eq:(a,b)=>a.n===b.n&&a.d===b.d,
 str:a=>a.d===1?String(a.n):a.n+"/"+a.d,
 parse:function(v){
  if(typeof v==="number")return Number.isSafeInteger(v)?rat(v):R.parse(String(v));
  let s=String(v).trim().replace(/[−－]/g,"-").replace(/，/g,",").replace(/／/g,"/").replace(/\s+/g," ");
  let m=s.match(/^([+-]?)(\d+) (\d+)\/(\d+)$/);
  if(m){let sign=m[1]==="-"?-1:1;return rat(sign*(Number(m[2])*Number(m[4])+Number(m[3])),Number(m[4]));}
  if(/^[+-]?\d+\/[+-]?\d+$/.test(s)){let x=s.split("/").map(Number);return rat(x[0],x[1]);}
  if(/^[+-]?\d+(?:\.\d+)?$/.test(s)){
   const dot=s.indexOf(".");if(dot<0)return rat(Number(s));
   const digits=s.length-dot-1,den=10**digits;
   return rat(Math.round(Number(s)*den),den);
  }
  throw Error("invalid input");
 },
 cmp:(a,b)=>Math.sign(a.n*b.d-b.n*a.d)
};
const I=n=>rat(n), rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a, take=arr=>arr[rand(0,arr.length-1)];
function shuffle(a){let r=[...a];for(let i=r.length-1;i>0;i--){let j=rand(0,i);[r[j],r[i]]=[r[i],r[j]];}return r;}
function lcm(a,b){return Math.abs(a*b)/gcd(a,b);}
function factors(n){let r=[];for(let p=2;p<=n;p++)while(n%p===0){r.push(p);n/=p;}return r;}
function wrongChoices(answer){
 const a=R.parse(answer), candidates=[R.add(a,I(1)),R.sub(a,I(1)),R.add(a,I(2)),R.sub(a,I(2)),R.mul(a,I(-1)),R.add(a,rat(1,2)),R.sub(a,rat(1,2)),R.mul(a,I(2)),R.add(a,I(4))];
 const seen=new Set([answer]),out=[answer];
 for(const r of shuffle(candidates)){const s=R.str(r);if(!seen.has(s)){seen.add(s);out.push(s);if(out.length===4)break;}}
 let x=5;while(out.length<4){let s=R.str(R.add(a,I(x++)));if(!seen.has(s)){out.push(s);seen.add(s);}}
 return shuffle(out);
}
function build(code,d,format,context){
 const n=rand(-15,-3),m=rand(3,14),a=rand(2,8),b=rand(2,8),c=rand(2,6),x=rand(-9,12),y=rand(2,11);
 let p="",ans=I(0),why="",hint="",tag="計算規則",stem="直接計算",method="先觀察題目所給條件。";
 switch(code){
 case "sign":{
  if(d===1){ans=I(Math.abs(n));p="在數線上，"+n+" 到 0 的距離是多少？";why="距離就是絕對值 |"+n+"| = "+Math.abs(n)+"。";tag="絕對值";}
  else if(d<=3){ans=I(Math.abs(n)-Math.abs(x));p="計算 |"+n+"| − |"+x+"|。";why=Math.abs(n)+" − "+Math.abs(x)+" = "+R.str(ans)+"。";tag="絕對值";}
  else{const climb=rand(4,9);ans=I(Math.abs(n+climb-m));p="登山隊從海拔 "+n+" 公尺上升 "+climb+" 公尺，再比較終點與海拔 "+m+" 公尺的觀測站，兩處高度相差多少公尺？";why="登山隊終點海拔 "+(n+climb)+"，高度差 = |"+(n+climb)+" − "+m+"| = "+R.str(ans)+" 公尺。";tag="數線距離";stem="多步情境";}
  hint="在數線上先找兩個位置，並注意距離不會是負數。";method="使用數線及絕對值。";break;
 }
 case "add":{
  let v=rand(-22,-5),w=rand(-13,15),z=rand(-8,11);
  ans=d<=2?I(v-w):I(v-w+z);
  p=d<=2?"計算 ("+v+") − ("+w+")。":d===3?"計算 ("+v+") − ("+w+") + ("+z+")。":"某地早上溫度 "+v+"°C，中午升高 "+(-w+10)+"°C，晚上又降低 10°C。晚上溫度是多少？";
  if(d>=4){ans=I(v-w);why=v+" + "+(-w+10)+" − 10 = "+R.str(ans)+"°C。";stem="溫度變化建模";}
  else why="將減法換成加相反數，結果為 "+R.str(ans)+"。";
  hint="減去負數等於加正數；依順序處理括號。";tag="負號與括號";break;
 }
 case "mul":{
  const v=rand(-9,-3),w=rand(-8,-2),z=rand(2,7);
  ans=d<=2?I(v*w):d===3?I(v*w-z*(v+w)):I((v-z)*(w+z));
  p=d<=2?"計算 ("+v+") × ("+w+")。":d===3?"計算 ("+v+")×("+w+") − "+z+"×[("+v+")+("+w+")]。":"利用分配律計算 [("+v+") − "+z+"] × [("+w+") + "+z+"]。";
  why="先算括號與乘法，得到 "+R.str(ans)+"。";hint="先算括號，符號規則：負×負＝正。";tag="運算次序";break;
 }
 case "sci":{
  const coeff=rand(12,95), exp=rand(3,6); // coeff / 10 x 10^exp
  if(d<=2){ans=I(coeff*10**(exp-1));p=(coeff/10)+" × 10^"+exp+" 的十進位數值是多少？";why="移動小數點 "+exp+" 位，得到 "+R.str(ans)+"。";}
  else if(d===3){ans=I(exp);p="數字 "+(coeff*10**(exp-1))+" 寫成 a×10^n（1≤a<10）的科學記號時，n = ?";why=(coeff/10)+"×10^"+exp+"，所以 n="+exp+"。";}
  else{ans=I(coeff*10**(exp-1)-coeff*10**(exp-2));p="兩段距離分別為 "+(coeff/10)+"×10^"+exp+" 與 "+(coeff/10)+"×10^"+(exp-1)+" 公尺，兩者相差多少公尺？";why="先換成整數，再相減，得到 "+R.str(ans)+" 公尺。";stem="單位與數量級應用";}
  hint="科學記號的係數介於 1 與 10 之間，10 的指數決定小數點移動格數。";tag="科學記號";method="先將兩數換成相同單位與表示法。";break;
 }
 case "prime":{
  const p1=take([2,3,5,7]),p2=take([2,3,5,7]),p3=take([2,3,5]);
  const num=p1*p2*p3,ff=factors(num);
  if(d<=2){ans=I(Math.max(...ff));p="將 "+num+" 質因數分解後，最大的質因數是多少？";why=num+" 的質因數依序為 "+ff.join(" × ")+"，最大的是 "+R.str(ans)+"。";}
  else if(d===3){ans=I(new Set(ff).size);p=num+" 的不同質因數共有幾個？";why=ff.join(" × ")+"，不同質因數共 "+R.str(ans)+" 個。";}
  else{const ct=ff.reduce((obj,v)=>(obj[v]=(obj[v]||0)+1,obj),{});ans=I(Object.values(ct).reduce((v,e)=>v*(e+1),1));p="將 "+num+" 分解成標準分解式後，它有多少個正因數？";why="各質因數的指數加一相乘，得到 "+R.str(ans)+" 個正因數。";}
  hint="從最小的質數開始分解；因數個數使用 (指數＋1) 相乘。";tag="質因數分解";break;
 }
 case "gcdlcm":{
  const aa=a*c,bb=b*c;const g=gcd(aa,bb),L=lcm(aa,bb);
  if(d<=2){ans=I(g);p="把 "+aa+" 顆紅珠和 "+bb+" 顆藍珠平均裝成最多個相同且無剩餘的禮物包，最多可做幾包？";why="分成最多組，用最大公因數 GCD("+aa+","+bb+") = "+g+"。";stem="分組建模";tag="公因數／公倍數辨認";}
  else if(d===3){ans=I(L);p="兩個警鈴分別每 "+aa+" 分鐘、"+bb+" 分鐘響一次，同時響後，最少再過幾分鐘會同時響？";why="同步週期 = LCM("+aa+","+bb+") = "+L+" 分鐘。";stem="週期建模";tag="公因數／公倍數辨認";}
  else{ans=I(L*2);p="甲、乙號燈每 "+aa+" 與 "+bb+" 分鐘閃一次。現在同時閃，從現在起第 2 次再同時閃是幾分鐘後？";why="最短重逢週期 "+L+" 分鐘，第 2 次再同時閃為 "+L+"×2="+R.str(ans)+" 分鐘。";stem="多步週期";tag="文字條件";}
  hint="分成最多相同組通常找最大公因數；週期同時出現找最小公倍數。";method="先判定使用 GCD 還是 LCM。";break;
 }
 case "fraction":{
  let aa=rat(rand(-7,-1),rand(3,9)),bb=rat(rand(1,8),rand(3,9)),cc=rat(rand(1,5),rand(2,7));
  if(d<=2){ans=R.add(aa,bb);p="計算 "+R.str(aa)+" + "+R.str(bb)+"（最簡分數）。";why="先通分，"+R.str(aa)+" + "+R.str(bb)+" = "+R.str(ans)+"。";}
  else if(d===3){ans=R.sub(R.mul(aa,cc),bb);p="計算 ("+R.str(aa)+") × ("+R.str(cc)+") − "+R.str(bb)+"（最簡分數）。";why="先乘法再通分相減，答案 "+R.str(ans)+"。";}
  else{ans=R.sub(R.add(aa,bb),cc);p="水槽起初有 "+R.str(bb)+" 公升，先加入 "+R.str(cc)+" 公升，接著倒掉 "+R.str(aa).replace("-","")+" 公升。水槽的水量淨變化為多少公升？（增加為正，減少為負）";ans=R.sub(cc,rat(Math.abs(aa.n),aa.d));why="淨變化 = 加入 "+R.str(cc)+" − 倒掉 "+R.str(rat(Math.abs(aa.n),aa.d))+" = "+R.str(ans)+" 公升。";stem="分數水量變化";}
  hint="先按乘除後加減處理，注意負號；可用公分母精確計算。";tag="通分與負號";break;
 }
 case "power":{
  const base=rand(2,5),p1=rand(3,6),p2=rand(2,4),p3=rand(1,2);
  const exp=p1+p2-p3;
  if(d<=3){ans=I(exp);p=base+"^"+p1+" × "+base+"^"+p2+" ÷ "+base+"^"+p3+" = "+base+"^n，求 n。";why="同底數指數相加減：n = "+p1+"+"+p2+"−"+p3+"="+exp+"。";}
  else{ans=I(base**(p1+p3));p="計算 ("+base+"^"+p1+" × "+base+"^"+p3+") 的值。";why="指數相加得到 "+base+"^"+(p1+p3)+" = "+R.str(ans)+"。";}
  hint="同底數相乘指數相加、相除指數相減；括號與負號要分清楚。";tag="指數律";break;
 }
 case "algebra":{
  const p1=rand(2,5),q=rand(2,6),r=rand(1,5),s=rand(-9,9);
  const coeff=p1*q-r,constant=p1*s-r*b;
  if(d<=2){ans=I(coeff);p="化簡 "+p1+"("+q+"x "+(s>=0?"+ "+s:"− "+(-s))+") − "+r+"(x+"+b+")，x 的係數是多少？";}
  else if(d<=3){ans=I(constant);p="化簡 "+p1+"("+q+"x "+(s>=0?"+ "+s:"− "+(-s))+") − "+r+"(x+"+b+")，常數項是多少？";}
  else{ans=I(coeff*x+constant);p="小明把代數式 "+p1+"("+q+"x "+(s>=0?"+ "+s:"− "+(-s))+") − "+r+"(x+"+b+") 化簡後，代入 x="+x+"。結果應是多少？";}
  why="先分配律，得 "+coeff+"x "+(constant<0?"− "+(-constant):"+ "+constant)+(d>=4?"；代入 x="+x+" 得 "+R.str(ans)+"。":"。");
  hint="括號前的乘數要乘到每一項；最後再合併同類項。";tag="分配律與同類項";break;
 }
 case "equation":{
  const v=rand(-8,12),k=rand(2,7),off=rand(-8,9);
  if(d<=2){ans=I(v);p=k+"x "+(off>=0?"+ "+off:"− "+(-off))+" = "+(k*v+off)+"，求 x。";why="移項得到 "+k+"x="+(k*v)+"，x="+v+"。";}
  else if(d===3){ans=I(v);p=k+"(x "+(off>=0?"+ "+off:"− "+(-off))+") = "+(k*(v+off))+"，求 x。";why="兩邊除以 "+k+"，x "+(off>=0?"+ "+off:"− "+(-off))+"="+(v+off)+"，x="+v+"。";}
  else{const val=rat(v,2);ans=val;const rhs=R.add(R.mul(I(k),val),I(off));p=k+"x "+(off>=0?"+ "+off:"− "+(-off))+" = "+R.str(rhs)+"，求 x（最簡分數）。";why="移項並除以 "+k+"，得到 x="+R.str(ans)+"；代回可驗證。";}
  hint="等號兩邊做相同運算，移項時注意符號；解完要代回驗算。";tag="等式變形";break;
 }
 case "application":{
  if(d<=2){
   const price=rand(13,35),fee=rand(5,20),count=rand(3,12);
   ans=I(count);p="買文具每件 "+price+" 元，另付一次運費 "+fee+" 元，共花 "+(price*count+fee)+" 元，買了幾件？";
   why="設件數 x，"+price+"x+"+fee+"="+(price*count+fee)+"，解得 x="+count+"。";stem="購物列式";
  }else if(d===3){
   const younger=rand(10,18),gap=rand(3,10);
   ans=I(younger);p="姊姊比弟弟大 "+gap+" 歲，兩人年齡總和 "+(younger*2+gap)+" 歲，弟弟幾歲？";
   why="設弟弟 x 歲，x+(x+"+gap+")="+(younger*2+gap)+"，解得 x="+younger+"。";stem="年齡列式";
  }else if(d===4){
   const speed=rand(45,85),hours=rand(2,5),rest=rand(15,30);
   ans=I(speed*hours);p="巴士以每小時 "+speed+" 公里行駛 "+hours+" 小時，中間休息 "+rest+" 分鐘。實際行駛距離是多少公里？";
   why="行駛距離 = 速度 × 真正行駛時間 = "+speed+"×"+hours+"="+R.str(ans)+" 公里，休息時間不影響距離。";stem="速度時間判讀";
  }else{
   const bags=rand(5,11),students=rand(4,9),left=rand(2,16);
   ans=I(bags);p="一批糖果平均分給 "+students+" 人，每人分得 x 顆，還剩 "+left+" 顆；已知總數為 "+(bags*students+left)+" 顆。每人分得多少顆？";
   why="設每人 x 顆，"+students+"x+"+left+"="+(bags*students+left)+"，解得 x="+bags+"。";stem="分配建模";
  }
  hint="先列出已知條件，設未知數，再寫等量關係並代回檢查單位。";tag="列式建模";method="提取條件 → 設 x → 列式 → 驗算。";break;
 }
 }
 return {prompt:p,answer:R.str(ans),explanation:why,hint,tag,stem,method};
}
const DIFFICULTY=["直接辨認","規則應用","跨觀念整合","情境建模","推理與檢錯"];
function makeQuestion(topicIndex,d,format){
 if(topicIndex<1||topicIndex>14)throw Error("Invalid lesson");
 d=Math.max(1,Math.min(5,Number(d)||3));
 const u=UNITS[topicIndex-1];
 let type=u.template,refTopic=u.code;
 if(type==="review1"){type=take(["sign","add","mul","sci"]);refTopic="1-R";}
 if(type==="review2"){type=take(["prime","gcdlcm","fraction","power"]);refTopic="2-R";}
 if(type==="review3"){type=take(["algebra","equation","application"]);refTopic="3-R";}
 const spec=build(type,d,format||"choice",u);
 if(!spec.prompt)throw Error("Empty question for "+u.code);
 const kind=format||"choice",answer=spec.answer;
 const options=kind==="choice"?wrongChoices(answer):null;
 if(options && (new Set(options).size!==4||options.filter(s=>R.eq(R.parse(s),R.parse(answer))).length!==1))throw Error("Invalid options");
 return {
  id:"mq-"+u.code+"-"+Math.random().toString(36).slice(2,10),
  round:topicIndex,topic_code:u.code,chapter:u.chapter,topic_name:u.name,skills:u.skills,
  difficulty:d,difficulty_name:DIFFICULTY[d-1],format:kind,prompt:spec.prompt,
  answer:answer,options,explanation:spec.explanation||spec.why, hint:spec.hint,
  method:spec.method, mistake_tags:[spec.tag], source_reference:"115上翰林國七數學 A/B/C 卷第"+topicIndex+"回（僅知識點對照；原創題目）",
  skill_type:type,model_type:spec.stem
 };
}
function equivalent(q,userAnswer){
 try{return R.eq(R.parse(userAnswer),R.parse(q.answer));}catch(e){return false;}
}
function diagnose(q,userAnswer){
 if(equivalent(q,userAnswer))return {correct:true,category:"已掌握",reason:"答案符合精確有理數等值。"};
 const tag=q.mistake_tags?.[0]||"計算錯誤";
 let category="計算錯誤";
 if(/列式|文字/.test(tag)||/建模/.test(q.model_type||""))category="列式／題意理解";
 else if(/分配律|等式變形/.test(tag))category="觀念／代數規則";
 else if(/公因數|公倍數/.test(tag))category="策略選擇";
 else if(/通分|負號|指數|科學/.test(tag))category="運算規則";
 return {correct:false,category,reason:"可能涉及「"+tag+"」。僅依題型推估；需要作答步驟才能確認實際錯因。"};
}
function makeExam(form,topicRange){
 const specs={A:[["choice",10,3],["fill",10,4],["open",3,10]],B:[["choice",12,4],["fill",6,4],["open",4,7]],C:[["choice",12,5],["fill",7,4],["open",2,6]]};
 if(!specs[form])throw Error("Unknown exam");
 const scope=Array.isArray(topicRange)&&topicRange.length?topicRange:UNITS.map(x=>x.index);
 const seen=new Set();
 let questions=[],sequence=0;
 for(const [kind,count,score] of specs[form]){
  for(let i=0;i<count;i++){
   const chapter=scope[sequence%scope.length];
   const d=form==="A"&&kind==="fill"?(i<5?[1,2,2,2,3][i]:[3,4,4,5,5][i-5]):kind==="choice"?[2,3,4,3,5][sequence%5]:kind==="fill"?[2,3,4,4,5][sequence%5]:[4,5,4][sequence%3];
   let q=makeQuestion(chapter,d,kind);let retries=0;
   while(seen.has(q.prompt)&&retries++<24)q=makeQuestion(chapter,d,kind);
   seen.add(q.prompt);q.points=score;q.number=++sequence;questions.push(q);
  }
 }
 return {form,minutes:45,total:questions.reduce((s,q)=>s+q.points,0),questions,original:false,grading_note:"非選擇題以最終答案自動批改，不含原卷計算過程的部分給分。"};
}
function validateQuestion(q){
 const a=R.parse(q.answer);
 return Boolean(q.prompt&&q.explanation&&q.hint&&q.source_reference&&q.mistake_tags?.length&&
 (!q.options||(q.options.length===4&&new Set(q.options).size===4&&q.options.filter(v=>R.eq(R.parse(v),a)).length===1)));
}
root.MathCore={UNITS,DIFFICULTY,R,makeQuestion,equivalent,diagnose,makeExam,validateQuestion,rand,lcm,gcd};
})(window);