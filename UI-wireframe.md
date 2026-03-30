# Headache Causes and Solutions

Below are **wireframe-level screen designs + UX logic** you can directly hand to a designer/dev.

* * *

🎯 Design Philosophy (Strava-inspired)
======================================

*   **Progress-first UI** (not task-first)
*   Bold metrics, minimal text
*   Strong visual feedback (streaks, rings, bars)
*   Dark mode friendly (less eye strain)

* * *

📱 1. Home Screen (Daily Execution Dashboard)
=============================================

![https://cdn.dribbble.com/userupload/45227416/file/0ab76b4ef063540ad81bbd3f150d5808.png?resize=2048x1536&vertical=center](https://cdn.dribbble.com/userupload/45227416/file/0ab76b4ef063540ad81bbd3f150d5808.png?resize=2048x1536&vertical=center)

![https://cdn.prod.website-files.com/67859049c02d67b2cfccef08/698277dc9f818a52dd45ebf4_8380786f.png](https://cdn.prod.website-files.com/67859049c02d67b2cfccef08/698277dc9f818a52dd45ebf4_8380786f.png)

![https://cdn.dribbble.com/userupload/40840391/file/original-5840b88ae968e177832adb3e19d18796.jpg?resize=400x0](https://cdn.dribbble.com/userupload/40840391/file/original-5840b88ae968e177832adb3e19d18796.jpg?resize=400x0)

4

### Layout:

**Top Section (Hero)**

*   🔥 Streak: `12 days`
*   🎯 Today Score: `65% complete`
*   Circular progress ring (like Strava activity ring)

* * *

**Middle Section (Timeline View)**  
Scrollable vertical timeline:

```
5:00  Wake + Hydrate        ✅
5:20  Workout               🔄 (in progress)
6:30  Meditation            ⏳
7:00  Study                 ⏳
...
```

Each block:

*   Color-coded:
    *   Green = Done
    *   Blue = Active
    *   Grey = Pending
    *   Red = Missed

👉 Tap = open activity details

* * *

**Bottom Sticky Bar**

*   ▶ Start / Resume Activity
*   ⏱ Timer
*   ✔ Quick Check-off

* * *

🧘 2. Activity Detail Screen
============================

![https://cdn.dribbble.com/userupload/18234268/file/original-d0f571547dbb43cb9e3080d584b7b4fb.png?resize=752x&vertical=center](https://cdn.dribbble.com/userupload/18234268/file/original-d0f571547dbb43cb9e3080d584b7b4fb.png?resize=752x&vertical=center)

![https://cdn.dribbble.com/userupload/17719203/file/original-2bcc8a8af4a8eab347b916e61862bc05.png?resize=400x0](https://cdn.dribbble.com/userupload/17719203/file/original-2bcc8a8af4a8eab347b916e61862bc05.png?resize=400x0)

![https://cdn.dribbble.com/userupload/43494146/file/original-1a9eb13fb2d101b35c78162217f72f83.png?resize=752x&vertical=center](https://cdn.dribbble.com/userupload/43494146/file/original-1a9eb13fb2d101b35c78162217f72f83.png?resize=752x&vertical=center)

4

### Example: Workout / Meditation / Study

* * *

A. Workout Screen
-----------------

*   Title: “Morning Workout”
*   Timer running

**Checklist:**

*   ☐ Warm-up
*   ☐ Workout
*   ☐ Cool-down

**Visual Section:**

*   Swipeable images:
    *   Neck stretch
    *   Shoulder stretch

👉 Tap image → full screen guide

* * *

B. Meditation Screen
--------------------

*   Big calm timer (center)
*   Play audio ▶

Options:

*   5 min / 10 min / custom

👉 Auto-complete when finished

* * *

C. Study Screen (Pomodoro)
--------------------------

*   Timer (25:00)
*   Start / Pause

Features:

*   DND toggle
*   Overlay mode

* * *

🚗 3. Travel Mode Screen
========================

![https://cdn.dribbble.com/userupload/44922205/file/765f17e4707571d605ba7bb947988e98.png?crop=0x0-2400x1800&resize=1600x1200](https://cdn.dribbble.com/userupload/44922205/file/765f17e4707571d605ba7bb947988e98.png?crop=0x0-2400x1800&resize=1600x1200)

![https://cdn.dribbble.com/userupload/42650687/file/original-e546b6a050b51db403c8c09c9f32c259.png?resize=752x&vertical=center](https://cdn.dribbble.com/userupload/42650687/file/original-e546b6a050b51db403c8c09c9f32c259.png?resize=752x&vertical=center)

![https://cdn.dribbble.com/userupload/17076658/file/original-e9ef1401a9c08c7e44b6e667fd66b9bc.jpg?resize=400x0](https://cdn.dribbble.com/userupload/17076658/file/original-e9ef1401a9c08c7e44b6e667fd66b9bc.jpg?resize=400x0)

4

### Layout:

*   “Commute Session Active”

Options:

*   🎧 Podcast
*   🧘 Relax
*   ❌ Idle

**Tracking:**

*   Duration
*   What listened (manual or auto)

* * *

📊 4. Analytics Screen (Strava-style performance)
=================================================

![https://cdn.dribbble.com/userupload/45000858/file/ae08d02c837a138d68a913b4ca2520e5.png](https://cdn.dribbble.com/userupload/45000858/file/ae08d02c837a138d68a913b4ca2520e5.png)

![https://repository-images.githubusercontent.com/875711108/ab0bb25f-6996-4a82-ace0-c8abcdbcf32a](https://repository-images.githubusercontent.com/875711108/ab0bb25f-6996-4a82-ace0-c8abcdbcf32a)

![https://cdn.dribbble.com/userupload/47062867/file/d02c0a79ac76ed3d31fbecf0626bc988.png?format=webp&resize=400x300&vertical=center](https://cdn.dribbble.com/userupload/47062867/file/d02c0a79ac76ed3d31fbecf0626bc988.png?format=webp&resize=400x300&vertical=center)

4

* * *

Sections:
---------

### 🔥 Streak Tracker

*   “Current: 12 days”
*   “Best: 28 days”

* * *

### 📅 Calendar Heatmap

*   Green = full completion
*   Yellow = partial
*   Red = missed

* * *

### 📈 Graphs

*   Daily completion %
*   Weekly consistency trend

* * *

💰 5. Reward System Screen
==========================

![https://cdn.dribbble.com/userupload/17485203/file/original-11ba7a028840ed7953aec8795c609a22.png?format=webp&resize=400x300&vertical=center](https://cdn.dribbble.com/userupload/17485203/file/original-11ba7a028840ed7953aec8795c609a22.png?format=webp&resize=400x300&vertical=center)

![https://cdn.dribbble.com/userupload/46974297/file/15f6e084e72a16c013e465461c410f54.png](https://cdn.dribbble.com/userupload/46974297/file/15f6e084e72a16c013e465461c410f54.png)

![https://cdn.dribbble.com/userupload/44094049/file/original-ed538e0f512a385925542c73717c78d2.png?resize=400x0](https://cdn.dribbble.com/userupload/44094049/file/original-ed538e0f512a385925542c73717c78d2.png?resize=400x0)

4

* * *

### Layout:

**Top:**

*   💰 Reward Balance: ₹1,250

**Rules:**

*   +₹50 per full day
*   \-₹20 missed

* * *

**Progress Bar:**

*   “Next reward unlock: ₹2000 → New headphones 🎧”

* * *

⚙️ 6. Schedule Editor Screen
============================

![https://framerusercontent.com/images/fwtp4ZI1aTkRp2R4sielK1ZYPmQ.png?height=1039&width=1600](https://framerusercontent.com/images/fwtp4ZI1aTkRp2R4sielK1ZYPmQ.png?height=1039&width=1600)

![https://cdn.sanity.io/images/599r6htc/regionalized/80fd657520293966a25bfb1a604eeee2bafa2bc3-1108x1108.png?auto=format&fit=max&q=70&w=1200](https://cdn.sanity.io/images/599r6htc/regionalized/80fd657520293966a25bfb1a604eeee2bafa2bc3-1108x1108.png?auto=format&fit=max&q=70&w=1200)

![https://cdn.prod.website-files.com/634681057b887c6f4830fae2/698b130788bf08eedda8c2a7_5b260b41.jpeg](https://cdn.prod.website-files.com/634681057b887c6f4830fae2/698b130788bf08eedda8c2a7_5b260b41.jpeg)

4

* * *

### Features:

*   Drag & adjust time blocks
*   Edit activity
*   Add/remove

* * *

### Constraint UI:

⚠ “You can modify schedule only once today”

* * *

🔔 7. Smart Notification UX (CRITICAL)
======================================

### Types:

#### ⏰ Activity Start

“Time for Study Session”

* * *

#### 🔁 Checkpoint Prompt

“Are you still doing this?”

*   ✅ Yes
*   ⏸ Pause
*   ❌ Skip

* * *

#### 🚨 Escalation

*   5 min → soft ping
*   15 min → stronger
*   30+ → persistent

* * *

#### 🧘 Focus Mode

*   Blocks notifications
*   Shows floating timer

* * *

🧠 Key UX Differentiators
=========================

### 1\. “Execution over planning”

Most apps plan. This app **forces execution gently**.

* * *

### 2\. “Adaptive nudging”

Not annoying—but persistent enough to prevent drifting.

* * *

### 3\. “Visual discipline”

You _see_ your consistency like fitness stats.

* * *

🚀 MVP UI (what to build first)
===============================

Start with only:

1.  Home dashboard
2.  Activity screen
3.  Pomodoro timer
4.  Basic notifications
5.  Daily tracking

* * *

💡 Final honest insight
=======================

If you nail:

*   Simplicity
*   Consistency tracking
*   Smart nudges

👉 This can be **addictive in a good way** (like Strava for life discipline)

* * *

If you want next:

*   I can design **actual clickable prototype flow (Figma-level structure)**
*   Or suggest **exact tech stack + architecture to build this fast**


