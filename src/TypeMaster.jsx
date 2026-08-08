import React, { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from "react";
import {
  LayoutDashboard, GraduationCap, Keyboard, Timer, Gamepad2, LineChart as LineChartIcon,
  Trophy, User, Settings as SettingsIcon, Sun, Moon, Volume2, VolumeX, Flame, Target,
  CheckCircle2, Circle, RotateCcw, Play, ChevronRight, ChevronLeft, Zap, Award, Clock,
  TrendingUp, Percent, Hash, Menu, X, Lock
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

/* ============================== DATA ============================== */

const WORD_BANK = ["the","quick","brown","fox","jumps","over","lazy","dog","time","light","water","earth",
"paper","stone","river","cloud","field","house","music","voice","dream","story","learn","teach","speed",
"focus","brave","quiet","happy","gentle","spark","shadow","bridge","garden","forest","winter","summer",
"candle","window","mirror","pocket","planet","rocket","silver","golden","copper","marble","desert","island",
"harbor","castle","dragon","wizard","knight","empire","legend","hunter","warrior","traveler","mountain",
"village","kitchen","journey","freedom","courage","balance","harmony","silence","thunder","whisper","crystal",
"horizon","fortune","victory","mystery","chapter","project","concept","machine","engine","signal","current",
"puzzle","canvas","pattern","texture","rhythm","melody","cadence","gravity","orbit","comet","meteor","nebula",
"keyboard","monitor","desktop","laptop","browser","network","program","function","variable","structure"];

const SENTENCES = [
"The quick brown fox jumps over the lazy dog.",
"Practice makes progress, not perfection.",
"Every expert was once a beginner who refused to give up.",
"A steady rhythm beats a rushed sprint every single time.",
"Good habits are built one small repetition at a time.",
"Focus on accuracy first, and speed will follow naturally.",
"The keyboard is a bridge between thought and words.",
"Small daily improvements add up to remarkable results.",
"Typing well is a skill that pays off for a lifetime.",
"Breathe, relax your shoulders, and let your fingers flow.",
"Champions are made through consistent, deliberate practice.",
"Discipline is choosing between what you want now and what you want most.",
"The best way to predict the future is to build it.",
"Slow is smooth, and smooth is fast.",
"A journey of a thousand miles begins with a single step.",
"Clarity of thought produces clarity of typing.",
"Confidence comes from repetition, not luck.",
"Your only competition is who you were yesterday.",
"Master the basics, and everything else becomes easier.",
"Keep your eyes on the screen, not on the keys."
];

const PARAGRAPHS = [
"Learning to type well is less about raw talent and more about patient, repeated practice. When you first sit at a keyboard, every key feels like a small negotiation between your eyes, your brain, and your fingers. Over time, that negotiation disappears entirely, replaced by a quiet, automatic flow where words simply appear as fast as you can think them.",
"Modern life runs on the ability to communicate quickly and clearly through a screen. Whether you are writing an email, coding a new feature, or chatting with a friend, your typing speed quietly shapes how much you can get done in a day. A faster, more accurate typist spends less energy on mechanics and more energy on ideas.",
"The history of the keyboard stretches back further than most people realize, evolving from mechanical typewriters into the sleek digital devices we use today. Despite all the technological change, the fundamental skill required to use one well has stayed remarkably constant: rhythm, accuracy, and calm, confident repetition.",
"There is a particular kind of satisfaction that comes from watching your words-per-minute climb week after week. It rewards patience over intensity, consistency over occasional bursts of effort, and calm focus over frantic speed. Anyone willing to practice a little every day can build a skill that lasts a lifetime.",
"Great typists rarely look down at their hands. Instead, their fingers memorize the geography of the keyboard so completely that the keys become an extension of their own thoughts. This kind of muscle memory only comes from many small sessions of deliberate, focused repetition spread out over weeks and months.",
"Accuracy and speed are often treated as opposites, but the fastest typists in the world know a secret: real speed is built entirely on a foundation of accuracy. Chasing raw speed too early leads to sloppy habits that are hard to unlearn, while patient accuracy naturally accelerates into effortless speed over time."
];

function seededRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function buildDrill(keys, seed) {
  const pool = keys.split(" ").filter(Boolean);
  const rnd = seededRand(seed);
  const groups = [];
  for (let i = 0; i < 14; i++) {
    const len = 2 + Math.floor(rnd() * 3);
    let g = "";
    for (let j = 0; j < len; j++) g += pool[Math.floor(rnd() * pool.length)];
    groups.push(g);
  }
  return groups.join(" ");
}

function generateWordStream(count, seed) {
  const rnd = seededRand(seed);
  const arr = [];
  for (let i = 0; i < count; i++) arr.push(WORD_BANK[Math.floor(rnd() * WORD_BANK.length)]);
  return arr.join(" ");
}

const PHASES = [
  { range: [1, 5], name: "Home Row Foundations", concept: "Home Row" },
  { range: [6, 10], name: "Top Row Expansion", concept: "Top Row" },
  { range: [11, 15], name: "Bottom Row & Full Keyboard", concept: "Bottom Row" },
  { range: [16, 20], name: "Numbers & Punctuation", concept: "Numbers / Punctuation" },
  { range: [21, 25], name: "Words & Sentences", concept: "Words / Sentences" },
  { range: [26, 30], name: "Paragraphs & Speed", concept: "Paragraphs / Speed" },
];

const DAY_CONFIG = [
  { keys: "f j", title: "Meet the Home Row Anchors", objective: "Find F and J by touch using the keyboard bumps." },
  { keys: "d f j k", title: "Expanding Outward", objective: "Add D and K without looking down." },
  { keys: "s d f j k l", title: "Building the Chain", objective: "Add S and L, keep wrists relaxed." },
  { keys: "a s d f j k l ;", title: "Completing the Row", objective: "Add A and the semicolon, full home row reach." },
  { keys: "a s d f g h j k l ;", title: "Home Row Review", objective: "Combine every home-row key into smooth words." },
  { keys: "q w e r", title: "Reaching Up: Left Side", objective: "Stretch upward from home row without dropping anchor fingers." },
  { keys: "u i o p", title: "Reaching Up: Right Side", objective: "Mirror the stretch on your right hand." },
  { keys: "t y", title: "Closing the Gap", objective: "Add T and Y, the trickiest top-row reaches." },
  { keys: "q w e r t y u i o p", title: "Top Row Review", objective: "Blend top row and home row into flowing text." },
  { keys: "a s d f g h j k l ; q w e r t y u i o p", title: "Two Rows Combined", objective: "Full speed drills across both rows." },
  { keys: "z x c v", title: "Reaching Down: Left Side", objective: "Stretch down while keeping your palm stable." },
  { keys: "b n m", title: "Reaching Down: Right Side", objective: "Complete the downward reach on your right hand." },
  { keys: "z x c v b n m", title: "Bottom Row Review", objective: "Consolidate every bottom row letter." },
  { keys: "a b c d e f g h i j k l m n o p q r s t u v w x y z", title: "Full Alphabet Review", objective: "Type every letter of the alphabet with confidence." },
  { keys: "the quick brown fox jumps over lazy dog and runs fast", title: "Full Keyboard Mastery", objective: "Prove full-keyboard fluency with pangram-style drills." },
  { keys: "1 2 3 4 5", title: "Numbers: Left Hand", objective: "Learn the top number row, left side." },
  { keys: "6 7 8 9 0", title: "Numbers: Right Hand", objective: "Learn the top number row, right side." },
  { keys: ". , ' \"", title: "Everyday Punctuation", objective: "Add periods, commas and quotation marks." },
  { keys: "! ? ; : -", title: "Expressive Punctuation", objective: "Add exclamation, question marks and more." },
  { keys: "1 2 3 4 5 6 7 8 9 0 . , ! ?", title: "Numbers & Punctuation Review", objective: "Blend digits and punctuation into real text." },
  { type: "words", title: "Common Short Words", objective: "Build speed on the most frequent English words." },
  { type: "words", title: "Common Words, Faster", objective: "Repeat common words while pushing your WPM higher." },
  { type: "sentence", title: "Your First Sentences", objective: "Move from words to complete, flowing sentences." },
  { type: "sentence", title: "Sentences with Punctuation", objective: "Handle capitals and punctuation inside real sentences." },
  { type: "sentence", title: "Sentence Speed Round", objective: "Chain multiple sentences together at pace." },
  { type: "paragraph", title: "Your First Paragraph", objective: "Sustain accuracy across a full paragraph." },
  { type: "paragraph", title: "Paragraphs with Numbers", objective: "Stay accurate when digits appear mid-sentence." },
  { type: "paragraph", title: "Punctuation-Heavy Paragraph", objective: "Handle commas, periods and quotes at speed." },
  { type: "paragraph", title: "Advanced Mixed Paragraph", objective: "Combine everything you've learned so far." },
  { type: "paragraph", title: "Final Assessment", objective: "Take your Day 30 test and see how far you've come." },
];

const COURSE = DAY_CONFIG.map((cfg, i) => {
  const day = i + 1;
  const phase = PHASES.find(p => day >= p.range[0] && day <= p.range[1]);
  let text;
  if (cfg.type === "words") text = generateWordStream(40, day * 97 + 13);
  else if (cfg.type === "sentence") text = SENTENCES[(day * 3) % SENTENCES.length] + " " + SENTENCES[(day * 7 + 1) % SENTENCES.length];
  else if (cfg.type === "paragraph") text = PARAGRAPHS[day % PARAGRAPHS.length];
  else text = buildDrill(cfg.keys, day * 31 + 7);
  return { day, phase: phase.name, concept: phase.concept, title: cfg.title, objective: cfg.objective, keys: cfg.keys || "", text };
});

const ACHIEVEMENTS = [
  { id: "first_test", label: "First Test", desc: "Complete your first typing test.", icon: Play, check: s => s.testsCompleted >= 1 },
  { id: "wpm_30", label: "30 WPM Club", desc: "Reach 30 WPM in any test.", icon: Zap, check: s => s.bestWpm >= 30 },
  { id: "wpm_50", label: "50 WPM Club", desc: "Reach 50 WPM in any test.", icon: Zap, check: s => s.bestWpm >= 50 },
  { id: "wpm_70", label: "70 WPM Club", desc: "Reach 70 WPM in any test.", icon: Zap, check: s => s.bestWpm >= 70 },
  { id: "wpm_100", label: "Century Club", desc: "Reach 100 WPM in any test.", icon: Award, check: s => s.bestWpm >= 100 },
  { id: "acc_95", label: "Sharpshooter", desc: "Score 95% accuracy or higher.", icon: Target, check: s => s.bestAccuracy >= 95 },
  { id: "streak_7", label: "7 Day Streak", desc: "Practice 7 days in a row.", icon: Flame, check: s => s.longestStreak >= 7 },
  { id: "course_done", label: "Course Complete", desc: "Finish all 30 days of the course.", icon: GraduationCap, check: s => s.completedDays.length >= 30 },
  { id: "tests_10", label: "10 Tests Completed", desc: "Complete 10 typing tests.", icon: Trophy, check: s => s.testsCompleted >= 10 },
];

const TEST_DURATIONS = [
  { label: "30 sec", value: 30 }, { label: "1 min", value: 60 },
  { label: "2 min", value: 120 }, { label: "5 min", value: 300 },
];

/* ============================== HELPERS ============================== */

function calcStats(correct, incorrect, elapsedSeconds) {
  const minutes = Math.max(elapsedSeconds / 60, 1 / 60);
  const wpm = Math.round((correct / 5) / minutes) || 0;
  const total = correct + incorrect;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  return { wpm, accuracy };
}

function playBeep(freq = 440, duration = 0.03) {
  try {
    const ctx = playBeep._ctx || (playBeep._ctx = new (window.AudioContext || window.webkitAudioContext)());
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.03;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
  } catch (e) { /* audio unavailable */ }
}

/* ============================== APP CONTEXT ============================== */

const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

function useAppState() {
  const [profileName, setProfileName] = useState("Typist");
  const [completedDays, setCompletedDays] = useState([]);
  const [testHistory, setTestHistory] = useState([]); // {date, wpm, accuracy, mode}
  const [unlocked, setUnlocked] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(1);
  const [longestStreak, setLongestStreak] = useState(1);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [keyboardSounds, setKeyboardSounds] = useState(true);

  const stats = useMemo(() => {
    const testsCompleted = testHistory.length;
    const bestWpm = testHistory.reduce((m, t) => Math.max(m, t.wpm), 0);
    const bestAccuracy = testHistory.reduce((m, t) => Math.max(m, t.accuracy), 0);
    const avgWpm = testsCompleted ? Math.round(testHistory.reduce((s, t) => s + t.wpm, 0) / testsCompleted) : 0;
    const avgAccuracy = testsCompleted ? Math.round(testHistory.reduce((s, t) => s + t.accuracy, 0) / testsCompleted) : 0;
    const practiceMinutes = testHistory.reduce((s, t) => s + (t.duration || 0), 0) / 60;
    return { testsCompleted, bestWpm, bestAccuracy, avgWpm, avgAccuracy, practiceMinutes, completedDays, longestStreak };
  }, [testHistory, completedDays, longestStreak]);

  useEffect(() => {
    const newlyUnlocked = ACHIEVEMENTS.filter(a => !unlocked.includes(a.id) && a.check(stats)).map(a => a.id);
    if (newlyUnlocked.length) setUnlocked(prev => [...prev, ...newlyUnlocked]);
  }, [stats]);

  const recordTest = useCallback((entry) => {
    setTestHistory(prev => [...prev, { ...entry, date: new Date().toISOString() }]);
  }, []);

  const completeDay = useCallback((day) => {
    setCompletedDays(prev => prev.includes(day) ? prev : [...prev, day].sort((a, b) => a - b));
  }, []);

  const resetProgress = useCallback(() => {
    setCompletedDays([]); setTestHistory([]); setUnlocked([]);
    setCurrentStreak(1); setLongestStreak(1);
  }, []);

  return {
    profileName, setProfileName, completedDays, testHistory, unlocked, stats,
    recordTest, completeDay, resetProgress, currentStreak, longestStreak,
    darkMode, setDarkMode, soundEnabled, setSoundEnabled, keyboardSounds, setKeyboardSounds,
  };
}

/* ============================== TYPING ENGINE ============================== */

function TypingEngine({ text, durationSeconds, onFinish, playSounds }) {
  const [status, setStatus] = useState("idle"); // idle | running | done
  const [typed, setTyped] = useState("");
  const [errorsAt, setErrorsAt] = useState(new Set());
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);
  const inputRef = useRef(null);
  const rafRef = useRef(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);

  useEffect(() => {
    if (status !== "running") return;
    const tick = () => {
      const secs = (Date.now() - startRef.current) / 1000;
      setElapsed(secs);
      if (durationSeconds && secs >= durationSeconds) {
        finish(secs);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status]);

  const finish = (secs) => {
    setStatus("done");
    const { wpm, accuracy } = calcStats(correctCount, incorrectCount, secs || elapsed || 1);
    onFinish && onFinish({ wpm, accuracy, correct: correctCount, incorrect: incorrectCount, duration: Math.round(secs || elapsed) });
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (status === "idle") { setStatus("running"); startRef.current = Date.now(); }
    if (val.length < typed.length) { setTyped(val); return; }
    const idx = val.length - 1;
    const ch = val[idx];
    const target = text[idx];
    if (playSounds) playBeep(ch === target ? 520 : 260, 0.02);
    if (ch === target) setCorrectCount(c => c + 1);
    else { setIncorrectCount(c => c + 1); setErrorsAt(prev => new Set(prev).add(idx)); }
    setTyped(val);
    if (!durationSeconds && val.length >= text.length) {
      const secs = (Date.now() - startRef.current) / 1000;
      finish(secs);
    }
  };

  const restart = () => {
    setStatus("idle"); setTyped(""); setErrorsAt(new Set()); setElapsed(0);
    setCorrectCount(0); setIncorrectCount(0);
    startRef.current = null;
    inputRef.current && inputRef.current.focus();
  };

  const liveStats = calcStats(correctCount, incorrectCount, elapsed || 1);
  const remaining = durationSeconds ? Math.max(0, Math.ceil(durationSeconds - elapsed)) : null;
  const progressPct = durationSeconds ? Math.min(100, (elapsed / durationSeconds) * 100) : Math.min(100, (typed.length / text.length) * 100);

  return (
    <div className="engine">
      <div className="engine-stats-row">
        <div className="stat-chip"><Zap size={15}/> {liveStats.wpm} <span>WPM</span></div>
        <div className="stat-chip"><Target size={15}/> {liveStats.accuracy}% <span>ACC</span></div>
        <div className="stat-chip"><Hash size={15}/> {incorrectCount} <span>ERR</span></div>
        {durationSeconds && <div className="stat-chip accent"><Clock size={15}/> {remaining}s</div>}
      </div>
      <div className="progress-track"><div className="progress-fill" style={{ width: progressPct + "%" }} /></div>

      {status !== "done" ? (
        <div className="type-box" onClick={() => inputRef.current && inputRef.current.focus()}>
          <div className="type-text">
            {text.split("").map((ch, i) => {
              let cls = "pending";
              if (i < typed.length) cls = errorsAt.has(i) ? "wrong" : "correct";
              else if (i === typed.length) cls = "cursor";
              return <span key={i} className={cls}>{ch}</span>;
            })}
          </div>
          <input
            ref={inputRef}
            className="hidden-input"
            value={typed}
            onChange={handleChange}
            onPaste={(e) => e.preventDefault()}
            autoFocus
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="results-card">
          <div className="results-title"><CheckCircle2 size={20}/> Results</div>
          <div className="results-grid">
            <div><span>{liveStats.wpm}</span><label>WPM</label></div>
            <div><span>{liveStats.accuracy}%</span><label>Accuracy</label></div>
            <div><span>{correctCount}</span><label>Correct</label></div>
            <div><span>{incorrectCount}</span><label>Errors</label></div>
          </div>
        </div>
      )}
      <button className="btn ghost" onClick={restart}><RotateCcw size={15}/> Restart</button>
    </div>
  );
}

/* ============================== LAYOUT ============================== */

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "course", label: "30-Day Course", icon: GraduationCap },
  { id: "practice", label: "Practice", icon: Keyboard },
  { id: "tests", label: "Tests", icon: Timer },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "progress", label: "Progress", icon: LineChartIcon },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function Sidebar({ page, setPage, mobileOpen, setMobileOpen }) {
  return (
    <>
      <aside className={"sidebar" + (mobileOpen ? " open" : "")}>
        <div className="brand"><Keyboard size={22}/> <span>TypeMaster</span></div>
        <nav>
          {NAV.map(n => (
            <button key={n.id} className={"nav-item" + (page === n.id ? " active" : "")}
              onClick={() => { setPage(n.id); setMobileOpen(false); }}>
              <n.icon size={17}/> <span>{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}
    </>
  );
}

function Header({ title, mobileOpen, setMobileOpen }) {
  const { darkMode, setDarkMode, currentStreak } = useApp();
  return (
    <header className="topbar">
      <button className="icon-btn only-mobile" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={19}/> : <Menu size={19}/>}
      </button>
      <h1>{title}</h1>
      <div className="topbar-right">
        <div className="streak-pill"><Flame size={15}/> {currentStreak} day streak</div>
        <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun size={17}/> : <Moon size={17}/>}
        </button>
      </div>
    </header>
  );
}

/* ============================== PAGES ============================== */

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="stat-card">
      <div className={"stat-icon" + (accent ? " accent" : "")}><Icon size={18}/></div>
      <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
    </div>
  );
}

function Dashboard({ setPage, setCourseDay }) {
  const { stats, testHistory, completedDays, unlocked, profileName } = useApp();
  const recent = [...testHistory].slice(-5).reverse();
  const nextDay = COURSE.find(d => !completedDays.includes(d.day)) || COURSE[COURSE.length - 1];
  const completionPct = Math.round((completedDays.length / 30) * 100);

  return (
    <div className="page">
      <p className="lede">Welcome back, {profileName}. Here's how your typing is progressing.</p>
      <div className="stat-grid">
        <StatCard icon={Zap} label="Best WPM" value={stats.bestWpm} accent />
        <StatCard icon={TrendingUp} label="Average WPM" value={stats.avgWpm} />
        <StatCard icon={Percent} label="Average Accuracy" value={stats.avgAccuracy + "%"} />
        <StatCard icon={GraduationCap} label="Course Completion" value={completionPct + "%"} />
        <StatCard icon={Timer} label="Tests Completed" value={stats.testsCompleted} />
        <StatCard icon={Clock} label="Practice Time" value={Math.round(stats.practiceMinutes) + " min"} />
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head"><h3>Continue Course</h3></div>
          <div className="continue-card">
            <div>
              <div className="eyebrow">Day {nextDay.day} · {nextDay.concept}</div>
              <div className="continue-title">{nextDay.title}</div>
              <p className="muted">{nextDay.objective}</p>
            </div>
            <button className="btn primary" onClick={() => { setCourseDay(nextDay.day); setPage("course-day"); }}>
              Start <ChevronRight size={15}/>
            </button>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Recent Tests</h3></div>
          {recent.length === 0 ? (
            <div className="empty">No tests yet — take your first test to see results here.</div>
          ) : (
            <table className="mini-table">
              <thead><tr><th>WPM</th><th>Accuracy</th><th>Mode</th></tr></thead>
              <tbody>
                {recent.map((t, i) => (
                  <tr key={i}><td>{t.wpm}</td><td>{t.accuracy}%</td><td>{t.mode}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Achievements Unlocked</h3><span className="muted">{unlocked.length}/{ACHIEVEMENTS.length}</span></div>
        <div className="badge-row">
          {ACHIEVEMENTS.map(a => (
            <div key={a.id} className={"badge" + (unlocked.includes(a.id) ? " unlocked" : "")} title={a.desc}>
              {unlocked.includes(a.id) ? <a.icon size={16}/> : <Lock size={14}/>}
              <span>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseList({ setCourseDay, setPage }) {
  const { completedDays } = useApp();
  return (
    <div className="page">
      <p className="lede">A structured 30-day path from finding home row to full-speed paragraphs.</p>
      {PHASES.map(phase => (
        <div key={phase.name} className="phase-block">
          <h3 className="phase-title">{phase.name}</h3>
          <div className="course-grid">
            {COURSE.filter(d => d.day >= phase.range[0] && d.day <= phase.range[1]).map(d => {
              const done = completedDays.includes(d.day);
              const locked = d.day > 1 && !completedDays.includes(d.day - 1) && !done;
              return (
                <button key={d.day} className={"course-card" + (done ? " done" : "") + (locked ? " locked" : "")}
                  onClick={() => { setCourseDay(d.day); setPage("course-day"); }}>
                  <div className="course-card-top">
                    <span className="day-num">Day {d.day}</span>
                    {done ? <CheckCircle2 size={16} className="ok"/> : locked ? <Lock size={14}/> : <Circle size={14}/>}
                  </div>
                  <div className="course-card-title">{d.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function CourseDay({ day, setPage, setCourseDay }) {
  const { completeDay, completedDays, soundEnabled } = useApp();
  const d = COURSE.find(c => c.day === day);
  const [finishedThis, setFinishedThis] = useState(false);
  if (!d) return null;
  const idx = COURSE.indexOf(d);

  return (
    <div className="page">
      <button className="link-btn" onClick={() => setPage("course")}><ChevronLeft size={15}/> All 30 Days</button>
      <div className="lesson-head">
        <div className="eyebrow">Day {d.day} of 30 · {d.concept}</div>
        <h2>{d.title}</h2>
        <p className="muted">{d.objective}</p>
      </div>
      <div className="card">
        <TypingEngine
          key={d.day}
          text={d.text}
          playSounds={soundEnabled}
          onFinish={({ wpm, accuracy }) => {
            completeDay(d.day);
            setFinishedThis(true);
          }}
        />
      </div>
      {finishedThis && (
        <div className="lesson-nav">
          <div className="success-banner"><CheckCircle2 size={16}/> Day {d.day} marked complete.</div>
          {idx < COURSE.length - 1 && (
            <button className="btn primary" onClick={() => setCourseDay(COURSE[idx + 1].day)}>
              Next: Day {COURSE[idx + 1].day} <ChevronRight size={15}/>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Practice() {
  const { soundEnabled } = useApp();
  const [mode, setMode] = useState("words");
  const [seed, setSeed] = useState(1);
  const text = useMemo(() => {
    if (mode === "words") return generateWordStream(40, seed);
    if (mode === "sentence") return SENTENCES[seed % SENTENCES.length];
    if (mode === "paragraph") return PARAGRAPHS[seed % PARAGRAPHS.length];
    if (mode === "story") return PARAGRAPHS[(seed + 3) % PARAGRAPHS.length] + " " + PARAGRAPHS[(seed + 1) % PARAGRAPHS.length];
    return "";
  }, [mode, seed]);

  return (
    <div className="page">
      <p className="lede">Free practice — pick a format and go at your own pace.</p>
      <div className="pill-row">
        {[["words", "Random Words"], ["sentence", "Sentences"], ["paragraph", "Paragraphs"], ["story", "Stories"]].map(([id, label]) => (
          <button key={id} className={"pill" + (mode === id ? " active" : "")} onClick={() => { setMode(id); setSeed(s => s + 1); }}>{label}</button>
        ))}
      </div>
      <div className="card">
        <TypingEngine key={mode + seed} text={text} playSounds={soundEnabled} onFinish={() => {}} />
      </div>
      <button className="btn ghost" onClick={() => setSeed(s => s + 1)}><RotateCcw size={15}/> New Text</button>
    </div>
  );
}

function Tests({ setPage }) {
  const { recordTest, soundEnabled, stats } = useApp();
  const [duration, setDuration] = useState(null);
  const seed = useRef(Math.floor(Math.random() * 10000)).current;
  const text = useMemo(() => generateWordStream(600, seed), [seed]);

  if (!duration) {
    return (
      <div className="page">
        <p className="lede">Choose a test length. Your best WPM and accuracy are saved to your profile.</p>
        <div className="duration-grid">
          {TEST_DURATIONS.map(t => (
            <button key={t.value} className="duration-card" onClick={() => setDuration(t.value)}>
              <Clock size={20}/><span>{t.label}</span>
            </button>
          ))}
          <button className="duration-card" onClick={() => setDuration("custom")}>
            <SettingsIcon size={20}/><span>Custom</span>
          </button>
        </div>
        {duration === "custom" && null}
        <CustomDurationPicker onPick={setDuration} />
        <div className="card">
          <div className="card-head"><h3>Personal Best</h3></div>
          <div className="stat-grid">
            <StatCard icon={Zap} label="Best WPM" value={stats.bestWpm} accent />
            <StatCard icon={Target} label="Best Accuracy" value={stats.bestAccuracy + "%"} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button className="link-btn" onClick={() => setDuration(null)}><ChevronLeft size={15}/> Choose Different Length</button>
      <div className="card">
        <TypingEngine
          key={duration}
          text={text}
          durationSeconds={duration}
          playSounds={soundEnabled}
          onFinish={({ wpm, accuracy, duration: d }) => recordTest({ wpm, accuracy, duration: d, mode: (typeof duration === "number" ? duration : d) + "s test" })}
        />
      </div>
    </div>
  );
}

function CustomDurationPicker({ onPick }) {
  const [val, setVal] = useState(45);
  return (
    <div className="card">
      <div className="card-head"><h3>Custom Duration</h3></div>
      <div className="custom-row">
        <input type="range" min="10" max="600" step="5" value={val} onChange={e => setVal(Number(e.target.value))} />
        <span className="custom-val">{val}s</span>
        <button className="btn primary" onClick={() => onPick(val)}>Start</button>
      </div>
    </div>
  );
}

/* ---- Games ---- */

function WordRushGame() {
  const { recordTest, soundEnabled } = useApp();
  const [status, setStatus] = useState("idle");
  const [words, setWords] = useState([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const idRef = useRef(0);
  const spawnRef = useRef(null);
  const fallRef = useRef(null);
  const startedAt = useRef(null);

  useEffect(() => {
    if (status !== "running") return;
    startedAt.current = Date.now();
    spawnRef.current = setInterval(() => {
      setWords(w => [...w, { id: idRef.current++, text: WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)], top: 0, left: 5 + Math.random() * 80 }]);
    }, 1400);
    fallRef.current = setInterval(() => {
      setWords(w => {
        const next = [];
        let livesLost = 0;
        for (const word of w) {
          const nt = word.top + 3.5;
          if (nt >= 92) livesLost++;
          else next.push({ ...word, top: nt });
        }
        if (livesLost) setLives(l => Math.max(0, l - livesLost));
        return next;
      });
    }, 120);
    return () => { clearInterval(spawnRef.current); clearInterval(fallRef.current); };
  }, [status]);

  useEffect(() => {
    if (status === "running" && lives <= 0) {
      setStatus("done");
      const secs = (Date.now() - startedAt.current) / 1000;
      recordTest({ wpm: Math.round(score / (secs / 60)) || score, accuracy: 100, duration: Math.round(secs), mode: "Word Rush" });
    }
  }, [lives]);

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);
    const match = words.find(w => w.text === val.trim());
    if (match) {
      if (soundEnabled) playBeep(660, 0.03);
      setWords(w => w.filter(x => x.id !== match.id));
      setScore(s => s + match.text.length);
      setInput("");
    }
  };

  const start = () => { setWords([]); setScore(0); setLives(3); setInput(""); setStatus("running"); };

  return (
    <div className="card game-card">
      <div className="game-head">
        <div className="stat-chip accent"><Zap size={15}/> {score} pts</div>
        <div className="stat-chip"><Flame size={15}/> {lives} lives</div>
      </div>
      {status !== "running" ? (
        <div className="empty tall">
          {status === "done" ? <p>Game over — final score {score}.</p> : <p>Type each falling word before it reaches the bottom.</p>}
          <button className="btn primary" onClick={start}><Play size={15}/> {status === "done" ? "Play Again" : "Start Word Rush"}</button>
        </div>
      ) : (
        <>
          <div className="rush-field">
            {words.map(w => (
              <div key={w.id} className="rush-word" style={{ top: w.top + "%", left: w.left + "%" }}>{w.text}</div>
            ))}
          </div>
          <input className="rush-input" value={input} onChange={handleInput} autoFocus placeholder="Type the falling word…" />
        </>
      )}
    </div>
  );
}

function TypingRaceGame() {
  const { recordTest, soundEnabled } = useApp();
  const [status, setStatus] = useState("idle");
  const text = useMemo(() => generateWordStream(35, Date.now() % 1000), [status]);
  const [playerPct, setPlayerPct] = useState(0);
  const [botPct, setBotPct] = useState(0);
  const botTimer = useRef(null);

  const start = () => { setPlayerPct(0); setBotPct(0); setStatus("running"); };

  useEffect(() => {
    if (status !== "running") return;
    const botWpm = 45;
    const totalChars = text.length;
    const charsPerMs = (botWpm * 5) / 60000;
    const startTime = Date.now();
    botTimer.current = setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      const pct = Math.min(100, (elapsedMs * charsPerMs / totalChars) * 100);
      setBotPct(pct);
      if (pct >= 100) { clearInterval(botTimer.current); finishRace("bot"); }
    }, 100);
    return () => clearInterval(botTimer.current);
  }, [status]);

  const finishRace = (winner) => {
    setStatus("done-" + winner);
    clearInterval(botTimer.current);
  };

  return (
    <div className="card game-card">
      {status === "idle" && (
        <div className="empty tall">
          <p>Race a bot typing at 45 WPM across a short passage.</p>
          <button className="btn primary" onClick={start}><Play size={15}/> Start Race</button>
        </div>
      )}
      {(status === "running" || status.startsWith("done")) && (
        <>
          <div className="race-lane"><span>You</span><div className="race-track"><div className="race-fill you" style={{ width: playerPct + "%" }} /></div></div>
          <div className="race-lane"><span>Bot</span><div className="race-track"><div className="race-fill bot" style={{ width: botPct + "%" }} /></div></div>
          {status === "running" && (
            <TypingEngine
              text={text}
              playSounds={soundEnabled}
              onFinish={({ wpm, accuracy }) => {
                setPlayerPct(100);
                recordTest({ wpm, accuracy, duration: Math.round(text.length / (wpm * 5 / 60)) || 10, mode: "Typing Race" });
                finishRace(botPct >= 100 ? "bot" : "you");
              }}
            />
          )}
          {status.startsWith("done") && (
            <div className="success-banner">{status === "done-you" ? "You won the race! 🏁" : "The bot won this time — try again!"}</div>
          )}
        </>
      )}
    </div>
  );
}

function SpeedChallengeGame() {
  const { recordTest, soundEnabled } = useApp();
  const text = useMemo(() => generateWordStream(200, Date.now() % 1000), []);
  return (
    <div className="card game-card">
      <p className="muted">Type as much as you can in 15 seconds — pure burst speed.</p>
      <TypingEngine
        text={text}
        durationSeconds={15}
        playSounds={soundEnabled}
        onFinish={({ wpm, accuracy, duration }) => recordTest({ wpm, accuracy, duration, mode: "Speed Challenge" })}
      />
    </div>
  );
}

function Games() {
  const [game, setGame] = useState(null);
  const GAME_LIST = [
    { id: "race", label: "Typing Race", desc: "Race a bot across a short passage.", icon: Zap },
    { id: "rush", label: "Word Rush", desc: "Clear falling words before they land.", icon: Gamepad2 },
    { id: "speed", label: "Speed Challenge", desc: "15 seconds of pure burst typing.", icon: Timer },
  ];
  if (game) {
    return (
      <div className="page">
        <button className="link-btn" onClick={() => setGame(null)}><ChevronLeft size={15}/> All Games</button>
        {game === "race" && <TypingRaceGame />}
        {game === "rush" && <WordRushGame />}
        {game === "speed" && <SpeedChallengeGame />}
      </div>
    );
  }
  return (
    <div className="page">
      <p className="lede">Sharpen your speed with a few focused typing games.</p>
      <div className="course-grid">
        {GAME_LIST.map(g => (
          <button key={g.id} className="course-card game-select" onClick={() => setGame(g.id)}>
            <g.icon size={20}/>
            <div className="course-card-title">{g.label}</div>
            <p className="muted small">{g.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgressPage() {
  const { testHistory, stats } = useApp();
  const chartData = testHistory.map((t, i) => ({ name: "T" + (i + 1), wpm: t.wpm, accuracy: t.accuracy }));
  return (
    <div className="page">
      <p className="lede">Track how your WPM and accuracy evolve over time.</p>
      <div className="stat-grid">
        <StatCard icon={Zap} label="Best WPM" value={stats.bestWpm} accent />
        <StatCard icon={TrendingUp} label="Average WPM" value={stats.avgWpm} />
        <StatCard icon={Percent} label="Average Accuracy" value={stats.avgAccuracy + "%"} />
        <StatCard icon={GraduationCap} label="Days Completed" value={stats.completedDays.length + "/30"} />
      </div>
      <div className="card">
        <div className="card-head"><h3>WPM Over Time</h3></div>
        {chartData.length === 0 ? <div className="empty">Complete a test to see your WPM chart.</div> : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5EEAD4" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#5EEAD4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#243044" />
              <XAxis dataKey="name" stroke="#7f8ba3" fontSize={12} />
              <YAxis stroke="#7f8ba3" fontSize={12} />
              <Tooltip contentStyle={{ background: "#111826", border: "1px solid #243044", borderRadius: 8, color: "#e7ecf5" }} />
              <Area type="monotone" dataKey="wpm" stroke="#5EEAD4" fill="url(#wpmGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="card">
        <div className="card-head"><h3>Accuracy Over Time</h3></div>
        {chartData.length === 0 ? <div className="empty">Complete a test to see your accuracy chart.</div> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243044" />
              <XAxis dataKey="name" stroke="#7f8ba3" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#7f8ba3" fontSize={12} />
              <Tooltip contentStyle={{ background: "#111826", border: "1px solid #243044", borderRadius: 8, color: "#e7ecf5" }} />
              <Line type="monotone" dataKey="accuracy" stroke="#F5B942" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function AchievementsPage() {
  const { unlocked } = useApp();
  return (
    <div className="page">
      <p className="lede">Badges unlock automatically as you practice, test, and complete the course.</p>
      <div className="achieve-grid">
        {ACHIEVEMENTS.map(a => {
          const done = unlocked.includes(a.id);
          return (
            <div key={a.id} className={"achieve-card" + (done ? " unlocked" : "")}>
              <div className="achieve-icon">{done ? <a.icon size={22}/> : <Lock size={18}/>}</div>
              <div className="achieve-label">{a.label}</div>
              <div className="achieve-desc">{a.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfilePage() {
  const { profileName, setProfileName, stats, completedDays, unlocked } = useApp();
  const [draft, setDraft] = useState(profileName);
  return (
    <div className="page">
      <div className="card profile-card">
        <div className="avatar">{(draft || "T")[0].toUpperCase()}</div>
        <div className="profile-fields">
          <label className="field-label">Display Name</label>
          <div className="name-edit-row">
            <input className="text-input" value={draft} onChange={e => setDraft(e.target.value)} />
            <button className="btn primary" onClick={() => setProfileName(draft || "Typist")}>Save</button>
          </div>
        </div>
      </div>
      <div className="stat-grid">
        <StatCard icon={Zap} label="Best WPM" value={stats.bestWpm} accent />
        <StatCard icon={TrendingUp} label="Average WPM" value={stats.avgWpm} />
        <StatCard icon={Percent} label="Accuracy" value={stats.avgAccuracy + "%"} />
        <StatCard icon={Timer} label="Tests Completed" value={stats.testsCompleted} />
        <StatCard icon={GraduationCap} label="Course Progress" value={completedDays.length + "/30"} />
        <StatCard icon={Trophy} label="Achievements" value={unlocked.length + "/" + ACHIEVEMENTS.length} />
      </div>
    </div>
  );
}

function SettingsPage() {
  const { darkMode, setDarkMode, soundEnabled, setSoundEnabled, keyboardSounds, setKeyboardSounds, resetProgress } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <div className="page">
      <div className="card">
        <div className="card-head"><h3>Appearance</h3></div>
        <div className="setting-row">
          <div><div className="setting-title">Dark Mode</div><div className="muted small">Switch between light and dark themes.</div></div>
          <button className={"toggle" + (darkMode ? " on" : "")} onClick={() => setDarkMode(!darkMode)}><span/></button>
        </div>
      </div>
      <div className="card">
        <div className="card-head"><h3>Sound</h3></div>
        <div className="setting-row">
          <div><div className="setting-title">Sound Effects</div><div className="muted small">Play sounds on correct/incorrect keystrokes.</div></div>
          <button className={"toggle" + (soundEnabled ? " on" : "")} onClick={() => setSoundEnabled(!soundEnabled)}><span/></button>
        </div>
        <div className="setting-row">
          <div><div className="setting-title">Keyboard Sounds</div><div className="muted small">Mechanical-style click on every key.</div></div>
          <button className={"toggle" + (keyboardSounds ? " on" : "")} onClick={() => setKeyboardSounds(!keyboardSounds)}><span/></button>
        </div>
      </div>
      <div className="card danger-card">
        <div className="card-head"><h3>Data</h3></div>
        <p className="muted small">Progress in this session is stored in memory only — it resets on page reload since this environment has no persistent storage.</p>
        {!confirmReset ? (
          <button className="btn danger-outline" onClick={() => setConfirmReset(true)}>Reset All Progress</button>
        ) : (
          <div className="confirm-row">
            <span>Are you sure? This clears all stats.</span>
            <button className="btn danger" onClick={() => { resetProgress(); setConfirmReset(false); }}>Yes, Reset</button>
            <button className="btn ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== ROOT ============================== */

const PAGE_TITLES = {
  dashboard: "Dashboard", course: "30-Day Course", "course-day": "Lesson", practice: "Practice",
  tests: "Typing Tests", games: "Games", progress: "Progress", achievements: "Achievements",
  profile: "Profile", settings: "Settings",
};

export default function TypeMasterApp() {
  const app = useAppState();
  const [page, setPage] = useState("dashboard");
  const [courseDay, setCourseDay] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AppCtx.Provider value={app}>
      <div className={"app-root" + (app.darkMode ? " dark" : " light")}>
        <style>{CSS}</style>
        <Sidebar page={page.startsWith("course") ? "course" : page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="main-col">
          <Header title={PAGE_TITLES[page]} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          <main className="content">
            {page === "dashboard" && <Dashboard setPage={setPage} setCourseDay={setCourseDay} />}
            {page === "course" && <CourseList setCourseDay={setCourseDay} setPage={setPage} />}
            {page === "course-day" && <CourseDay day={courseDay} setPage={setPage} setCourseDay={setCourseDay} />}
            {page === "practice" && <Practice />}
            {page === "tests" && <Tests setPage={setPage} />}
            {page === "games" && <Games />}
            {page === "progress" && <ProgressPage />}
            {page === "achievements" && <AchievementsPage />}
            {page === "profile" && <ProfilePage />}
            {page === "settings" && <SettingsPage />}
          </main>
        </div>
      </div>
    </AppCtx.Provider>
  );
}

/* ============================== STYLES ============================== */

const CSS = `
*, *::before, *::after { box-sizing:border-box; }
.app-root { display:flex; min-height:100vh; max-width:100%; overflow-x:hidden; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }
.app-root.dark { background:#0B0F19; color:#E7ECF5; }
.app-root.light { background:#F3F5F9; color:#131A26; }
.app-root.light .sidebar { background:#FFFFFF; border-right:1px solid #E3E7EF; }
.app-root.light .card, .app-root.light .stat-card, .app-root.light .course-card, .app-root.light .duration-card, .app-root.light .achieve-card, .app-root.light .badge { background:#FFFFFF; border:1px solid #E3E7EF; }
.app-root.light .topbar { background:#FFFFFF; border-bottom:1px solid #E3E7EF; }
.app-root.light .type-box { background:#F8FAFC; border:1px solid #E3E7EF; }
.app-root.light .pending { color:#9AA5B5; }
.app-root.light .muted { color:#5B6678; }

.sidebar { width:230px; flex-shrink:0; background:#111826; border-right:1px solid #1E2635; display:flex; flex-direction:column; padding:20px 14px; position:sticky; top:0; height:100vh; }
.brand { display:flex; align-items:center; gap:9px; font-weight:700; font-size:17px; padding:6px 10px 22px 10px; color:#5EEAD4; }
.nav-item { display:flex; align-items:center; gap:11px; width:100%; text-align:left; background:none; border:none; color:#9AA7BD; padding:10px 12px; border-radius:9px; font-size:14px; cursor:pointer; margin-bottom:2px; transition:background .15s, color .15s; }
.nav-item:hover { background:#1A2233; color:#E7ECF5; }
.nav-item.active { background:#17342F; color:#5EEAD4; font-weight:600; }
.scrim { display:none; }

.main-col { flex:1; display:flex; flex-direction:column; min-width:0; }
.topbar { height:60px; display:flex; align-items:center; gap:14px; padding:0 24px; background:#0E1420; border-bottom:1px solid #1E2635; position:sticky; top:0; z-index:5; }
.topbar h1 { font-size:16px; font-weight:600; margin:0; flex:1; }
.topbar-right { display:flex; align-items:center; gap:10px; }
.icon-btn { background:none; border:1px solid #243044; color:inherit; width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.icon-btn:hover { border-color:#5EEAD4; }
.only-mobile { display:none; }
.streak-pill { display:flex; align-items:center; gap:6px; background:#241B10; color:#F5B942; padding:6px 12px; border-radius:20px; font-size:12.5px; font-weight:600; }

.content { padding:24px; max-width:1100px; width:100%; margin:0 auto; }
.page { display:flex; flex-direction:column; gap:18px; }
.lede { color:#9AA7BD; font-size:14px; margin:0 0 2px 0; }
.muted { color:#8792A6; }
.muted.small { font-size:12.5px; }

.stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; }
.stat-card { background:#111826; border:1px solid #1E2635; border-radius:12px; padding:14px 16px; display:flex; align-items:center; gap:12px; }
.stat-icon { width:34px; height:34px; border-radius:9px; background:#1A2233; display:flex; align-items:center; justify-content:center; color:#9AA7BD; flex-shrink:0; }
.stat-icon.accent { background:#123B36; color:#5EEAD4; }
.stat-value { font-size:19px; font-weight:700; line-height:1.1; }
.stat-label { font-size:11.5px; color:#8792A6; margin-top:2px; }

.two-col { display:grid; grid-template-columns:1.3fr 1fr; gap:14px; }
@media (max-width:800px) { .two-col { grid-template-columns:1fr; } }

.card { background:#111826; border:1px solid #1E2635; border-radius:14px; padding:18px; }
.card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.card-head h3 { margin:0; font-size:14.5px; font-weight:600; }

.continue-card { display:flex; align-items:center; justify-content:space-between; gap:14px; background:#0E1420; border:1px solid #1E2635; border-radius:10px; padding:14px 16px; }
.eyebrow { font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#5EEAD4; font-weight:700; margin-bottom:4px; }
.continue-title { font-size:15px; font-weight:600; margin-bottom:4px; }

.mini-table { width:100%; border-collapse:collapse; font-size:13px; }
.mini-table th { text-align:left; color:#8792A6; font-weight:500; padding:4px 6px; border-bottom:1px solid #1E2635; }
.mini-table td { padding:7px 6px; border-bottom:1px solid #171F2C; }

.empty { color:#8792A6; font-size:13.5px; padding:18px 10px; text-align:center; }
.empty.tall { padding:40px 20px; display:flex; flex-direction:column; align-items:center; gap:14px; }

.badge-row { display:flex; flex-wrap:wrap; gap:8px; }
.badge { display:flex; align-items:center; gap:6px; background:#0E1420; border:1px solid #1E2635; color:#5B6678; padding:7px 12px; border-radius:20px; font-size:12px; }
.badge.unlocked { color:#F5B942; border-color:#3A2E12; background:#1D1608; }

.phase-block { margin-bottom:4px; }
.phase-title { font-size:13px; text-transform:uppercase; letter-spacing:.05em; color:#5EEAD4; margin:6px 0 10px 2px; }
.course-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:10px; }
.course-card { background:#111826; border:1px solid #1E2635; border-radius:12px; padding:14px; text-align:left; cursor:pointer; color:inherit; display:flex; flex-direction:column; gap:8px; }
.course-card:hover { border-color:#5EEAD4; }
.course-card.done { border-color:#1F5C50; background:#0E1D19; }
.course-card.locked { opacity:.5; cursor:not-allowed; }
.course-card-top { display:flex; align-items:center; justify-content:space-between; }
.day-num { font-size:11px; color:#8792A6; font-weight:700; }
.course-card-title { font-size:13.5px; font-weight:600; line-height:1.3; }
.ok { color:#5EEAD4; }
.game-select { align-items:flex-start; }

.link-btn { display:flex; align-items:center; gap:4px; background:none; border:none; color:#5EEAD4; font-size:13px; cursor:pointer; padding:0; width:fit-content; }
.lesson-head h2 { margin:6px 0 4px 0; font-size:20px; }
.lesson-nav { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.success-banner { display:flex; align-items:center; gap:8px; background:#0E1D19; color:#5EEAD4; border:1px solid #1F5C50; padding:9px 14px; border-radius:9px; font-size:13.5px; }

.pill-row { display:flex; gap:8px; flex-wrap:wrap; }
.pill { background:#111826; border:1px solid #1E2635; color:#9AA7BD; padding:8px 15px; border-radius:20px; font-size:13px; cursor:pointer; }
.pill.active { background:#123B36; border-color:#1F5C50; color:#5EEAD4; font-weight:600; }

.engine { display:flex; flex-direction:column; gap:12px; }
.engine-stats-row { display:flex; gap:10px; flex-wrap:wrap; }
.stat-chip { display:flex; align-items:center; gap:6px; background:#0E1420; border:1px solid #1E2635; padding:6px 12px; border-radius:8px; font-size:13px; font-weight:600; }
.stat-chip span, .stat-chip { color:#C7D0DF; }
.stat-chip.accent { color:#F5B942; border-color:#3A2E12; }
.progress-track { height:5px; background:#1A2233; border-radius:3px; overflow:hidden; }
.progress-fill { height:100%; background:linear-gradient(90deg,#5EEAD4,#38BDF8); transition:width .1s linear; }

.type-box { position:relative; width:100%; max-width:100%; background:#0E1420; border:1px solid #1E2635; border-radius:12px; padding:20px; cursor:text; overflow-x:hidden; }
.type-text { display:block; width:100%; max-width:100%; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:19px; line-height:1.9; letter-spacing:.3px; white-space:normal; word-break:normal; overflow-wrap:break-word; }
.type-text span { white-space:pre-wrap; }
.type-text .pending { color:#4B5568; }
.type-text .correct { color:#5EEAD4; }
.type-text .wrong { color:#F87171; background:#3A1418; border-radius:3px; }
.type-text .cursor { color:#0B0F19; background:#5EEAD4; border-radius:2px; }
.hidden-input { position:absolute; opacity:0; pointer-events:none; height:1px; width:1px; }
.engine { max-width:100%; }

.results-card { text-align:center; padding:10px 0; }
.results-title { display:flex; align-items:center; justify-content:center; gap:8px; color:#5EEAD4; font-weight:700; margin-bottom:14px; }
.results-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
.results-grid span { display:block; font-size:22px; font-weight:800; }
.results-grid label { font-size:11px; color:#8792A6; }

.btn { display:flex; align-items:center; justify-content:center; gap:7px; border:none; border-radius:9px; padding:9px 16px; font-size:13.5px; font-weight:600; cursor:pointer; width:fit-content; }
.btn.primary { background:#5EEAD4; color:#052420; }
.btn.primary:hover { background:#7FF3E0; }
.btn.ghost { background:#151D2C; color:#C7D0DF; border:1px solid #243044; }
.btn.ghost:hover { border-color:#5EEAD4; }
.btn.danger { background:#F87171; color:#2A0A0A; }
.btn.danger-outline { background:none; border:1px solid #5C2626; color:#F87171; }

.duration-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:10px; }
.duration-card { background:#111826; border:1px solid #1E2635; border-radius:12px; padding:18px 10px; display:flex; flex-direction:column; align-items:center; gap:8px; color:inherit; cursor:pointer; font-size:13.5px; font-weight:600; }
.duration-card:hover { border-color:#5EEAD4; color:#5EEAD4; }
.custom-row { display:flex; align-items:center; gap:14px; }
.custom-row input[type=range] { flex:1; }
.custom-val { font-weight:700; min-width:44px; }

.game-card { display:flex; flex-direction:column; gap:14px; }
.game-head { display:flex; gap:10px; }
.rush-field { position:relative; height:280px; background:#0E1420; border:1px solid #1E2635; border-radius:12px; overflow:hidden; }
.rush-word { position:absolute; background:#123B36; color:#5EEAD4; padding:4px 10px; border-radius:6px; font-family:ui-monospace,monospace; font-size:13px; transform:translateX(-50%); }
.rush-input { background:#0E1420; border:1px solid #1E2635; border-radius:9px; padding:10px 14px; color:inherit; font-family:ui-monospace,monospace; font-size:14px; }

.race-lane { display:flex; align-items:center; gap:10px; font-size:12.5px; color:#8792A6; }
.race-lane span { width:32px; }
.race-track { flex:1; height:10px; background:#1A2233; border-radius:6px; overflow:hidden; }
.race-fill { height:100%; border-radius:6px; }
.race-fill.you { background:#5EEAD4; }
.race-fill.bot { background:#F5B942; }

.achieve-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px; }
.achieve-card { background:#111826; border:1px solid #1E2635; border-radius:12px; padding:16px; opacity:.55; }
.achieve-card.unlocked { opacity:1; border-color:#3A2E12; background:#1D1608; }
.achieve-icon { color:#F5B942; margin-bottom:8px; }
.achieve-label { font-weight:700; font-size:13.5px; margin-bottom:3px; }
.achieve-desc { font-size:12px; color:#8792A6; }

.profile-card { display:flex; align-items:center; gap:16px; }
.avatar { width:56px; height:56px; border-radius:50%; background:#123B36; color:#5EEAD4; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:22px; flex-shrink:0; }
.profile-fields { flex:1; }
.field-label { font-size:11.5px; color:#8792A6; display:block; margin-bottom:6px; }
.name-edit-row { display:flex; gap:8px; }
.text-input { flex:1; background:#0E1420; border:1px solid #1E2635; border-radius:8px; padding:9px 12px; color:inherit; font-size:14px; }

.setting-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #171F2C; }
.setting-row:last-child { border-bottom:none; }
.setting-title { font-size:13.5px; font-weight:600; }
.toggle { width:42px; height:24px; border-radius:14px; background:#243044; border:none; position:relative; cursor:pointer; }
.toggle span { position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#8792A6; transition:transform .15s; }
.toggle.on { background:#123B36; }
.toggle.on span { transform:translateX(18px); background:#5EEAD4; }
.danger-card { border-color:#2A1414; }
.confirm-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; font-size:13px; }

@media (max-width:860px) {
  .sidebar { position:fixed; left:-240px; top:0; z-index:20; transition:left .2s; box-shadow:0 0 40px rgba(0,0,0,.5); }
  .sidebar.open { left:0; }
  .scrim { display:block; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:15; }
  .only-mobile { display:flex; }
  .content { padding:16px; }
  .type-box { padding:14px; }
  .type-text { font-size:16px; line-height:1.75; }
}
`;
