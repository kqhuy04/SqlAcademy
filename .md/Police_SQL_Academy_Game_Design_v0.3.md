# Police SQL Academy
## Game Mechanics, Investigation System, Case Pipeline & MVP Technical Design

**Version:** 0.3  
**Platform:** Android / iOS  
**Genre:** Detective Puzzle / SQL Learning Game  
**Core Theme:** Police Academy / Criminal Investigation

> **Revision note:** Version 0.3 keeps the strongest ideas from v0.2, but restructures the design around one principle: **SQL must be part of the player's investigation and reasoning, not merely a database access minigame.**  
> The document also separates SQL difficulty from investigation difficulty, introduces an Investigation Graph and Investigation State, reduces the MVP scope, and moves security-heavy backend SQL execution out of the first playable milestone.

---

# 1. Product Vision

**Police SQL Academy** is a mobile detective puzzle game in which the player learns and uses SQL to investigate fictional criminal cases.

The game combines:

- SQL learning and practice
- Detective investigation
- Logic puzzles
- Evidence analysis
- Hypothesis building
- Data reasoning

The player is a police academy trainee. SQL is not presented as an independent school subject. It is one of the player's main investigation tools.

## Core fantasy

> **Learn SQL → Ask the right question → Request evidence → Query data → Discover patterns → Cross-check → Solve the case**

The target feeling is:

> "I am investigating a case, and SQL is the tool that lets me uncover the truth."

Not:

> "I am doing SQL exercises with a police skin."

---

# 2. Core Design Principles

The game follows these principles.

## 2.1 SQL is an investigation tool

SQL must help answer an investigation question.

Bad:

> "Use GROUP BY because this lesson is about GROUP BY."

Good:

> "Which suspect contacted the victim most frequently during the week before the murder?"

The SQL concept should emerge naturally from the problem.

---

## 2.2 Evidence is objective; interpretation can be wrong

Structured evidence should not randomly lie.

A GPS record should not arbitrarily say:

```text
20:30 → Home
```

when the hidden truth says:

```text
20:30 → Crime Scene
```

Instead, the evidence can be:

- incomplete
- ambiguous
- low precision
- noisy within a documented accuracy range
- difficult to interpret
- legitimately unrelated to the crime

Human statements can be false.

---

## 2.3 A liar is not automatically the killer

A suspect may lie because they:

- are hiding an affair
- committed another minor crime
- are protecting another person
- misunderstood the event
- remember incorrectly
- are embarrassed
- have a secret unrelated to the murder

Therefore:

```text
Liar ≠ Killer
```

---

## 2.4 Evidence does not equal conclusion

Correct evidence can still lead to an incorrect inference.

Example:

```text
Train ticket:
20:20 → Station
```

This proves the ticket exists and was used at 20:20.

It does not automatically prove:

> "The suspect could not have reached the crime scene."

The player must reason about:

- distance
- travel time
- gaps in evidence
- possible routes
- timestamps
- other evidence

---

## 2.5 Every required inference must be supported

A player must have enough information to make every conclusion the case requires.

The designer may know:

```text
Hotel → Crime Scene = 4 minutes
```

but if the player has never been given the distance, route, or travel-time information, the player cannot reasonably be expected to infer it.

Therefore:

```text
Evidence A
+
Evidence B
+
Known rule / accessible information
        ↓
Required inference
```

The game must never depend on hidden developer knowledge.

---

## 2.6 The goal is to build a case, not merely guess the killer

A player who guesses correctly but cannot support the accusation should receive a lower result than a player who reconstructs a strong evidence chain.

---

# 3. Core Gameplay Formula

The core loop is:

```text
ASK
 ↓
REQUEST
 ↓
DATA
 ↓
SQL
 ↓
DISCOVER PATTERN
 ↓
FORM HYPOTHESIS
 ↓
CROSS-CHECK
 ↓
NEW QUESTION
 ↓
FINAL CASE
```

Short version:

> **Ask → Request → Query → Analyze → Connect → Deduce → Accuse**

The important change from v0.2 is that **SQL produces investigative insight**, not merely raw data.

---

# 4. Two Separate Difficulty Dimensions

SQL difficulty and investigation difficulty must not be treated as the same thing.

A case can be:

```text
Easy SQL + Hard Investigation
```

or:

```text
Hard SQL + Easy Investigation
```

## 4.1 SQL Difficulty

Possible levels:

### SQL Basic

- SELECT
- WHERE
- ORDER BY
- LIMIT

### SQL Intermediate

- AND / OR / NOT
- LIKE
- IN
- BETWEEN
- JOIN
- LEFT JOIN

### SQL Advanced

- GROUP BY
- HAVING
- Subquery
- EXISTS
- CASE

### SQL Expert

- CTE
- Window Function
- complex joins

---

## 4.2 Investigation Difficulty

### Investigation Easy

- few suspects
- obvious evidence relationships
- little ambiguity
- one primary path

### Investigation Medium

- multiple evidence sources
- one or two red herrings
- incomplete alibis
- alternative explanations

### Investigation Hard

- multiple valid investigation paths
- partial truths
- layered evidence
- misleading but accurate evidence
- several plausible suspects

### Investigation Expert

- interconnected evidence
- multiple motives
- hidden relationships
- evidence gaps
- indirect conclusions
- strong need for cross-checking

---

# 5. Training Mode

Training teaches SQL through miniature investigations rather than isolated textbook exercises.

## 5.1 Training structure

```text
Concept
 ↓
Investigation question
 ↓
Guided query
 ↓
Result
 ↓
Interpretation
 ↓
Short follow-up
```

Example:

> "Who was near the station between 20:00 and 20:30?"

The player learns `WHERE` because filtering the dataset is useful.

```sql
SELECT person_id, timestamp, location
FROM gps_logs
WHERE timestamp BETWEEN '20:00' AND '20:30';
```

The game then explains:

> `WHERE` lets you filter records to the part of the evidence relevant to your investigation.

---

# 6. SQL Learning Progression

The first version should focus on four topics:

1. SELECT
2. WHERE
3. ORDER BY
4. JOIN

Other topics can be added later.

Training should not require the player to memorize syntax before seeing why the syntax is useful.

---

# 7. SQL Input UX

Typing SQL on mobile is a major UX risk.

The SQL editor should therefore support three stages.

## 7.1 Guided SQL

Example:

```sql
SELECT ______
FROM gps_logs
WHERE ______;
```

The player fills the missing parts.

---

## 7.2 Assisted SQL

Features:

- syntax highlighting
- autocomplete
- schema explorer
- keyword bar
- query history
- readable error messages
- formatting
- copy/paste

---

## 7.3 Free SQL

The player writes the query independently.

Free SQL should become increasingly important as the player progresses.

---

# 8. Optional Query Builder

A visual query builder can be used as a bridge for beginners.

Example:

```text
TABLE:
GPS Logs

FILTER:
Person = John

TIME:
20:00 - 21:00

SORT:
Timestamp ↑
```

The game can preview:

```sql
SELECT *
FROM gps_logs
WHERE person_id = 17
  AND timestamp BETWEEN '20:00' AND '21:00'
ORDER BY timestamp;
```

The player can then be asked to reproduce the query manually.

The query builder is an accessibility and learning feature, not the main end-game interaction.

---

# 9. Case Files

Case Files are the main game mode.

A case starts with an initial information package.

Example:

```text
CASE #001
The Murder at Blackwood House

Victim:
Robert Blackwood

Estimated Time of Death:
20:30 - 21:00

Location:
Blackwood House

Suspects:
3

Known Facts:
- Victim was found in the study.
- No sign of forced entry.
- Three people were known to be nearby.
```

The player is not given every piece of evidence immediately.

---

# 10. Investigation Questions

The player should always have a reason for requesting information.

Examples:

> "Can I verify John's alibi?"

> "Who was near the crime scene?"

> "Who contacted the victim before the murder?"

> "Which suspect had access to the study?"

> "Did anyone travel between two relevant locations?"

The player chooses what they want to investigate.

---

# 11. Investigation Request System

The player does not automatically receive every database.

Instead, the game exposes available evidence sources.

Example:

```text
INVESTIGATION DESK

What do you want to investigate?

[ Verify a suspect's location ]
[ Check communications ]
[ Investigate the crime scene ]
[ Investigate financial activity ]
```

The exact implementation may still expose sources such as:

```text
GPS
Phone
Messages
CCTV
Financial
Vehicle
Medical
Documents
Witness
```

However, the design should encourage the player to think in terms of **questions**, not simply memorize which evidence type unlocks which clue.

---

# 12. Evidence Request

Example:

```text
REQUEST

Question:
Verify John's location between 20:00 and 21:00

Source:
GPS

Cost:
1 request
```

After the request, the player receives the evidence.

The request itself does not reveal the answer.

---

# 13. Evidence Sources

Possible evidence sources include:

- GPS / Location
- Phone Records
- Messages
- CCTV
- Financial Records
- Vehicle Records
- Medical Records
- Official Documents
- Access Logs
- Witness Statements

Evidence sources can contain structured SQL data, documents, reports, or statements.

---

# 14. Evidence Source ≠ SQL Table

This distinction remains fundamental.

## GPS

May expose:

```text
gps_logs
```

## Phone

May expose:

```text
phone_calls
```

## Messages

May expose:

```text
messages
```

## CCTV

May be a report:

```text
CCTV REPORT #1837

20:42
Person matching Suspect B entered east corridor.

20:47
Camera temporarily obstructed.

20:51
Person exited.
```

Therefore the game can combine:

```text
SQL Data
+
Documents
+
Images
+
Statements
+
Reports
```

---

# 15. Evidence Reliability

Every evidence source may have characteristics such as:

```text
GPS
Accuracy: ±50m

CCTV
Identity certainty: Medium

Witness
Memory reliability: Low

Bank Transaction
Timestamp precision: High
```

Reliability describes the limitations of the source.

It should not be used as an excuse for arbitrary contradictions.

---

# 16. Truth Model

Every case has a hidden Truth Model.

Example:

```text
CASE #001

Killer:
Suspect C

Motive:
Inheritance

Crime Time:
20:37

Crime Location:
Study

Weapon:
Knife
```

The player never directly sees this model.

It is used by the case engine and validation tools.

---

# 17. Suspect System

A suspect can have:

```text
Identity
Occupation
Relationship with Victim
Motive
Statement
Alibi
Known Activities
Secrets
Associated Evidence
```

The important distinction is:

```text
Truth
vs
Statement
vs
Player Interpretation
```

These are separate concepts.

---

# 18. Statement System

Example:

> "I was in the living room from 20:00 to 21:00."

The game does not label this as true or false.

The player must investigate.

Possible evidence:

```text
GPS:
20:31 → Unknown

CCTV:
20:34 → East Corridor
```

The player can conclude:

> The statement is probably false.

But the game should not automatically conclude:

> Therefore this person is the killer.

---

# 19. Alibi System

An alibi can have three primary states.

```text
FALSE
TRUE
TRUE_BUT_INSUFFICIENT
```

## False

The evidence contradicts the claim.

## True

The evidence sufficiently covers the relevant period and location.

## True but insufficient

The evidence confirms part of the claim but leaves a meaningful gap.

Example:

```text
20:30 → Home
```

does not prove:

```text
20:00 - 21:00 → Home
```

---

# 20. Evidence Dependency

Evidence should often create new investigation questions.

Example:

```text
GPS
 ↓
Unknown Location
 ↓
CCTV
 ↓
Vehicle Identified
 ↓
Vehicle Registry
 ↓
Owner Identified
 ↓
Phone Records
 ↓
Motive
```

This creates an **Investigation Graph**.

---

# 21. Investigation Graph

The Investigation Graph describes how discoveries can lead to new discoveries.

Example:

```text
START
 │
 ├── John alibi
 │      ↓
 │   GPS anomaly
 │      ↓
 │   CCTV
 │      ↓
 │   Vehicle identified
 │      ↓
 │   John connected to vehicle
 │
 └── Victim communications
        ↓
      Phone records
        ↓
      John contacted victim
```

The graph is a design-time structure.

It tells the case designer:

- what discoveries exist
- what evidence supports them
- what questions they unlock
- which discoveries are required
- which are optional

---

# 22. Required and Optional Discoveries

A case should distinguish between:

## Required discoveries

The player must reasonably be able to discover these to build a correct accusation.

## Supporting discoveries

Useful but not strictly necessary.

## Optional discoveries

Interesting side information that improves understanding or score.

Example:

```yaml
required_discoveries:
  - JOHN_NEAR_CRIME_SCENE
  - JOHN_ALIBI_CONTRADICTED
  - JOHN_MOTIVE

supporting_discoveries:
  - JOHN_CONTACTED_VICTIM

optional_discoveries:
  - JOHN_HIDING_AFFAIR
```

---

# 23. Investigation State

The game tracks what the player has actually discovered.

Example:

```json
{
  "caseId": "CASE_001",
  "requestedEvidence": [
    "GPS"
  ],
  "discoveredFacts": [
    "JOHN_NEAR_SCENE"
  ],
  "contradictions": [
    "JOHN_ALIBI_FALSE"
  ],
  "hypotheses": [
    "JOHN_COULD_BE_KILLER"
  ],
  "usedEvidence": [
    "GPS_14"
  ]
}
```

This is different from simply tracking which SQL queries the player executed.

---

# 24. Why Investigation State Matters

The player may guess:

```text
Killer = John
```

without having discovered supporting facts.

The game should distinguish:

```text
Correct guess
```

from:

```text
Correct investigation
```

This allows the game to reward reasoning rather than luck.

---

# 25. Red Herring System

Red herrings must be based on truthful data.

Three useful types:

## 25.1 Innocent coincidence

Suspicious evidence is genuinely unrelated to the murder.

## 25.2 Real wrongdoing, wrong conclusion

A suspect really committed another crime but is not the murderer.

## 25.3 Partial truth

A suspect lies, but the lie hides something unrelated to the murder.

Example:

```text
John transferred $5,000.
```

Later:

```text
Hospital record:
$5,000 → emergency surgery.
```

The transaction was real.

The initial interpretation was wrong.

---

# 26. Anti-Meta-Game Principle

The player should not be able to learn:

```text
"Suspicious clue = red herring."
```

or:

```text
"Most obvious suspect = innocent."
```

Cases should vary.

Some obvious evidence should be important.

Some suspicious evidence should be irrelevant.

Some lies should be central.

Some lies should be unrelated.

---

# 27. Timeline System

A timeline can help the player reconstruct events.

Example:

```text
20:00 ─────────────────────── 21:00

20:12
John receives message

20:24
John leaves home

20:34
John near crime scene

20:37
Estimated time of death

20:45
John returns home
```

The timeline helps answer:

- Who had opportunity?
- Who could physically reach the location?
- Which alibis are incomplete?
- Which periods remain unexplained?

The first MVP does not need a visual timeline editor. A simple evidence list or chronological view is enough.

---

# 28. Motive / Opportunity / Means

The final reasoning model can use:

```text
                SUSPECT
                   │
        ┌──────────┼──────────┐
        ↓          ↓          ↓
      MOTIVE   OPPORTUNITY   MEANS
        │          │          │
       Why?      Could?      Could?
```

The game should not require every element to come from the same evidence source.

---

# 29. Final Accusation

The player submits:

```text
Killer:
John Smith

Motive:
Inheritance

Time:
20:37

Location:
Study

Key Evidence:
GPS #14
CCTV #08
Message #22

Alibi:
Contradicted
```

But the player should also identify **why the evidence supports the accusation**.

Example:

```text
WHY?

[x] John had a motive
[x] John could physically reach the scene
[x] His alibi is contradicted
[x] CCTV supports his presence
[ ] Financial evidence proves the murder
```

This turns the final screen into a reasoning check rather than a multiple-choice guess.

---

# 30. Case Evaluation

A simplified scoring model:

```text
Killer correctly identified      +40
Motive correctly identified      +15
Opportunity supported            +15
Means supported                  +15
Evidence chain                   +15
```

Optional penalties:

```text
Unnecessary evidence request
Unsupported accusation
Excessive hints
```

The MVP can simplify this to:

```text
Accuracy
Evidence Used Correctly
```

---

# 31. Investigation Efficiency

Do not primarily score SQL execution speed.

The more useful metric is investigation efficiency:

```text
Evidence requested
Useful evidence discovered
Unnecessary requests
Query attempts
Hints used
Required discoveries completed
```

SQL query performance remains a technical constraint, not the main player-facing score.

---

# 32. SQL Must Create Insight

A query should ideally produce something the player can reason about.

Bad gameplay:

```text
SELECT *
FROM gps_logs;
```

Result:

```text
3,000 rows
```

Player:

> "Now what?"

Better:

```sql
SELECT person_id, timestamp, location
FROM gps_logs
WHERE timestamp BETWEEN '20:20' AND '20:40'
ORDER BY timestamp;
```

Result:

```text
A → Home
B → Hotel
C → Crime Scene
```

This creates:

```text
Discovery:
C was near the crime scene.
```

That discovery unlocks a new question.

---

# 33. Training → Case Progression

Training concepts should appear naturally in cases.

Example:

```text
TRAINING
   │
   ├── SELECT
   ├── WHERE
   ├── ORDER BY
   └── JOIN
          │
          ▼
      EASY CASE
          │
          ▼
      MEDIUM CASE
          │
          ▼
      HARD CASE
```

However, case difficulty should also be controlled independently by the Investigation Difficulty dimension.

---

# 34. Difficulty Matrix

Example:

| Case | SQL | Investigation |
|---|---|---|
| 001 | Easy | Easy |
| 002 | Easy | Medium |
| 003 | Medium | Easy |
| 004 | Medium | Medium |
| 005 | Easy | Hard |
| 006 | Hard | Medium |

This allows the game to teach SQL without automatically making every case narratively harder.

---

# 35. Real Cases

Real cases are not part of MVP.

Instead, v1 uses:

> **Real-case-inspired fictional cases**

The process is:

```text
Research
 ↓
Extract structural pattern
 ↓
Fictionalize
 ↓
Create original case
 ↓
Validate
```

The final case should not depend on preserving historical facts.

Real cases can be reconsidered later with a separate research, fact-checking, legal, and ethical pipeline.

---

# 36. Content Pipeline

AI should assist content production, not autonomously decide the entire case.

Recommended pipeline:

```text
HUMAN
Design investigation concept
        ↓
HUMAN
Define truth model
        ↓
HUMAN
Define investigation graph
        ↓
AI
Generate statements / records / descriptions
        ↓
RULE-BASED VALIDATION
Schema and structural checks
        ↓
LLM REVIEW
Logic review assistance
        ↓
HUMAN PLAYTEST
Actual solvability test
        ↓
PUBLISH
```

The human designer remains responsible for the final case.

---

# 37. Case Schema

The Case Schema is the shared format between:

- human case designers
- content tools
- validation scripts
- case engine

Example:

```yaml
case_id: CASE_001

title: "The Murder at Blackwood House"

sql_topics_required:
  - SELECT
  - WHERE
  - ORDER BY

difficulty:
  sql: EASY
  investigation: EASY

truth_model:
  killer: suspect_c
  motive: inheritance
  crime_time: "20:37"
  crime_location: study
  weapon: knife

case_file:
  victim: Robert Blackwood
  estimated_time_of_death: "20:30 - 21:00"
  location: Blackwood House
  known_facts:
    - Victim was found in the study
    - No sign of forced entry

suspects:
  - id: suspect_a
    identity:
      name: John Smith
      occupation: Lawyer
      relationship_to_victim: Business partner
    statement: "I was at home."
    alibi:
      claim: "At home from 20:00 to 21:00"
      status: FALSE
    secrets: []

evidence_sources:
  - id: evidence_01
    type: GPS
    access: REQUESTABLE
    reliability:
      accuracy: "±50m"
      certainty: HIGH
    sql_table: gps_logs
    data: []

red_herrings:
  - evidence_id: evidence_08
    type: REAL_WRONG_CONCLUSION
    surface_reading: "John made a suspicious transfer."
    actual_explanation: "The transfer paid for emergency surgery."

investigation_graph:
  required_discoveries:
    - JOHN_NEAR_SCENE
    - JOHN_ALIBI_CONTRADICTED
    - JOHN_MOTIVE

  supporting_discoveries:
    - JOHN_CONTACTED_VICTIM

  edges:
    - from: JOHN_ALIBI
      to: JOHN_NEAR_SCENE
    - from: JOHN_NEAR_SCENE
      to: JOHN_ALIBI_CONTRADICTED

timeline_ground_truth:
  - time: "20:12"
    event: "John receives message"
    involved:
      - suspect_a
```

---

# 38. Investigation Graph vs Truth Model

These must remain separate.

## Truth Model

Answers:

> What actually happened?

## Investigation Graph

Answers:

> What can the player discover, and how can one discovery lead to another?

Example:

```text
TRUTH MODEL

John killed Robert.
```

Investigation Graph:

```text
GPS
 ↓
John near scene
 ↓
CCTV
 ↓
John's vehicle
 ↓
Phone
 ↓
Motive
 ↓
Accusation
```

A case is not complete merely because its Truth Model is complete.

It must also have a playable Investigation Graph.

---

# 39. Validation Checklist

Every case should pass:

## 39.1 Consistency

All objective data must have a logically valid interpretation consistent with the Truth Model.

## 39.2 Solvability

The player must have enough accessible information to identify the killer without guessing.

## 39.3 Investigation Graph Integrity

Every required discovery must have a reachable path.

## 39.4 Evidence Integrity

Every important conclusion must be supported by player-accessible evidence.

## 39.5 Red Herring Integrity

Every red herring must have a real explanation.

## 39.6 SQL Solvability

Every required SQL concept must have a meaningful query that contributes to an investigation insight.

## 39.7 No Orphan Suspects

Every suspect must have relevant statements, evidence, or relationships.

## 39.8 No Hidden Knowledge

No required conclusion may depend on information unavailable to the player.

## 39.9 Alternative Path Check

Where intended, more than one valid investigation path should exist.

## 39.10 Human Playtest

Automated validation is not enough.

A real person must be able to solve the case.

---

# 40. Case Validation Levels

Not every validation problem can be solved with simple rules.

### Rule-based

Good for:

- missing fields
- broken references
- duplicate IDs
- missing red-herring explanations
- orphan suspects
- invalid SQL topic declarations

### Automated SQL tests

Good for:

- query validity
- expected result existence
- expected columns
- row constraints

### LLM-assisted review

Useful for:

- contradiction detection
- narrative consistency
- clue interpretation
- suspicious ambiguity

### Human playtest

Required for:

- fun
- difficulty
- clarity
- fair inference
- pacing
- frustration

---

# 41. Database Design

A case may have several logical evidence tables.

Example:

```text
suspects
gps_logs
phone_calls
messages
vehicle_logs
access_logs
```

The player should only see schemas/data that the case state has unlocked.

---

# 42. SQL Execution Architecture

There are two possible architectures.

## Option A — Client-side SQLite

```text
Mobile
 ├── Case data
 ├── SQLite
 └── SQL engine
```

Advantages:

- fast
- offline capable
- simple
- no server round-trip
- easy to prototype

Disadvantages:

- player can inspect local data
- real access control cannot be enforced
- client can be modified

For a single-player MVP, these disadvantages are acceptable.

---

## Option B — Backend execution

```text
Mobile
 ↓
Spring Boot
 ↓
Query validation
 ↓
Case-scoped database
 ↓
SQL execution
 ↓
Result
```

Advantages:

- server-side access control
- easier auditing
- stronger content protection
- resource enforcement

Disadvantages:

- infrastructure complexity
- SQL sandboxing
- timeout/DoS concerns
- network dependency
- more operational cost

---

# 43. MVP Technical Decision

**MVP should prefer client-side SQL execution unless a concrete product requirement demands server-side enforcement.**

The reason is simple:

The first product question is:

> "Is the gameplay fun?"

Not:

> "Can a player reverse-engineer their local SQLite database?"

If later requirements introduce:

- competitive leaderboards
- economy
- valuable rewards
- anti-cheat
- server-authoritative progression
- protected premium data

then backend execution can be introduced.

---

# 44. If Backend SQL Execution Is Introduced Later

The following constraints are required:

- case isolation
- SELECT-only execution
- parser-based statement validation
- query timeout
- row limit
- result-size limit
- rate limiting
- strict authorization
- no cross-case access
- audit logging where appropriate

Do not rely only on UI restrictions.

If restricted data is present in the client, the restriction is not real.

---

# 45. Case Isolation

When server-side execution is eventually used:

```text
CASE_001
 ├── suspects
 ├── gps_logs
 └── phone_calls

CASE_002
 ├── suspects
 ├── gps_logs
 └── messages
```

The player's SQL execution context must be scoped to the current case.

A player should never be able to query another case's data.

---

# 46. Investigation Resources

Resource limits are **not part of the first playable MVP**.

Potential future resources:

```text
Database Requests
Witness Interviews
CCTV Requests
Forensic Requests
```

They can later create strategic decisions.

But the first prototype should allow unlimited investigation.

Why?

Because resource limits add balance complexity before the team knows whether the core loop is fun.

---

# 47. Evidence Board

The full mind-map version is postponed.

MVP:

```text
Evidence List

#14 GPS
John
20:34
Crime Scene
Tags:
[John] [Alibi]
```

Future:

```text
John
 ├── GPS #14
 ├── CCTV #08
 └── Message #22
```

The graph UI should only be built if playtests show that manual evidence organization creates meaningful value.

---

# 48. Timeline UI

MVP can use:

```text
Evidence
↓
Sort by timestamp
```

A drag-and-drop timeline editor is postponed.

Again, the goal is to validate reasoning before building visualization-heavy systems.

---

# 49. Player Progression

Potential long-term progression:

```text
Police Academy
      ↓
Cadet
      ↓
Junior Investigator
      ↓
Detective
      ↓
Senior Detective
```

Progression can unlock:

- SQL topics
- case difficulty
- investigation tools
- new evidence types

But progression is secondary to the core investigation loop.

---

# 50. MVP Scope

The MVP is intentionally small.

## Required

### Training

- SELECT
- WHERE
- ORDER BY
- JOIN

### One complete case

- 3 suspects
- 2–3 SQL tables
- 1 non-SQL evidence source
- 1 meaningful red herring
- 1 liar
- 1 investigation graph
- 1 final accusation
- evidence-based evaluation

### Basic UI

```text
Case File
 ↓
Investigation Question
 ↓
Evidence Request
 ↓
SQL Editor
 ↓
Results
 ↓
Evidence / Discovery
 ↓
Final Accusation
 ↓
Evaluation
```

---

# 51. MVP Explicitly Excludes

Do not build these before the core loop is validated:

- real cases
- premium content
- resource economy
- evidence mind-map
- advanced timeline editor
- complex ranking
- multiplayer
- leaderboard
- AI autonomous case generation
- server-side arbitrary SQL execution
- complex permission systems
- CTE / Window Function content

These may be added later.

---

# 52. MVP Success Criteria

The MVP is successful if a new player can:

1. learn the basics of SQL,
2. receive a case,
3. understand an investigation question,
4. request evidence,
5. use SQL to discover a meaningful fact,
6. form a hypothesis,
7. request or query additional evidence,
8. cross-check the hypothesis,
9. identify the killer,
10. explain the accusation using evidence.

Most importantly:

> The player should feel that SQL helped them solve the case.

---

# 53. The Most Important Prototype Test

After the first case, ask:

> **"Would this investigation still be interesting if SQL were removed?"**

If yes, the detective game is carrying the experience and SQL is probably only a wrapper.

If no, and the player specifically misses querying data, the integration is working.

The target is:

> **The investigation is interesting because SQL and detective reasoning reinforce each other.**

---

# 54. First Case Design

The first case should be deliberately small.

Example:

```text
CASE #001
The Hotel at 20:37

Victim:
Robert Blackwood

Suspects:
John
Mary
David
```

Data:

```text
suspects
gps_logs
phone_calls
```

Additional evidence:

```text
CCTV report
```

Mechanics:

```text
SELECT
WHERE
ORDER BY
JOIN
```

Investigation:

```text
John claims he was at home.
        ↓
Request GPS
        ↓
SQL
        ↓
John appears near the hotel
        ↓
New question:
Could John physically reach the crime scene?
        ↓
Request CCTV
        ↓
CCTV supports presence
        ↓
Phone data reveals contact with victim
        ↓
Motive discovered
        ↓
Final accusation
```

The first case should be written manually.

No AI generation is required.

---

# 55. Development Order

The recommended implementation order is:

```text
1. Design CASE_001
        ↓
2. Write Truth Model
        ↓
3. Write Investigation Graph
        ↓
4. Define SQL tables
        ↓
5. Define evidence
        ↓
6. Validate manually
        ↓
7. Build SQL execution prototype
        ↓
8. Build minimal Case UI
        ↓
9. Playtest
        ↓
10. Fix core loop
        ↓
11. Build case pipeline
        ↓
12. Create CASE_002 / CASE_003
```

Do not start with authentication, premium content, resource economy, or a large content system.

---

# 56. Recommended Project Architecture

A clean logical architecture:

```text
                    MOBILE APP
                         │
          ┌──────────────┴──────────────┐
          │                             │
     Training UI                  Investigation UI
          │                             │
          └──────────────┬──────────────┘
                         │
                    Game Client
                         │
             ┌───────────┴───────────┐
             │                       │
        SQL Engine              Case Engine
                                     │
                   ┌─────────────────┼─────────────────┐
                   │                 │                 │
             Evidence State   Investigation State   Evaluation
```

Server, if used:

```text
                    SPRING BOOT
                         │
        ┌────────────────┼────────────────┐
        │                │                │
      Auth          Progression       Case Delivery
        │                │                │
        └────────────────┼────────────────┘
                         │
                       MySQL
```

The Case Engine should remain logically independent from infrastructure.

---

# 57. Case Engine Responsibilities

The Case Engine should know:

- current case
- available evidence
- requested evidence
- discovered facts
- contradictions
- investigation graph
- required discoveries
- final evaluation

It should not care whether the player is using:

- Android
- iOS
- local SQLite
- server-side SQL

This separation allows the SQL execution layer to change later.

---

# 58. Long-Term Architecture

When the MVP is proven:

```text
                    CLIENT
                      │
              Investigation UI
                      │
                Case Engine
                      │
          ┌───────────┴───────────┐
          │                       │
     SQL Executor          Evidence Manager
          │                       │
          └───────────┬───────────┘
                      │
                 Game Backend
                      │
        ┌─────────────┼─────────────┐
        │             │             │
       Auth        Progression   Content
        │             │             │
        └─────────────┼─────────────┘
                      │
                    MySQL
```

The architecture can evolve without rewriting the gameplay model.

---

# 59. Long-Term Content Scaling

Once CASE_001 proves the loop:

```text
Case Schema
      ↓
Investigation Graph
      ↓
Content Generator
      ↓
Validation
      ↓
Playtest
      ↓
Case Library
```

AI can then assist with:

- fictional names
- statements
- descriptions
- data generation
- alternative clues
- red-herring variants
- localization

But the investigation logic remains controlled.

---

# 60. Future Content Types

Potential future case categories:

```text
Murder
Theft
Fraud
Kidnapping
Corporate Espionage
Missing Person
Cybercrime
Insurance Fraud
```

The same core engine can support them.

The crime type changes.

The investigation loop does not.

---

# 61. Future SQL Topics

After the core game proves successful:

```text
AND / OR / NOT
LIKE
IN
BETWEEN
GROUP BY
HAVING
Subquery
EXISTS
CASE
CTE
Window Function
```

The order should be based on actual case requirements, not a desire to check every SQL feature.

---

# 62. Future Investigation Mechanics

Possible later additions:

- limited investigation resources
- witness interviews
- evidence board
- visual timeline
- map investigation
- forensic analysis
- vehicle tracing
- social graph
- hidden relationships
- multi-stage cases
- multiple crime scenes

Every future system must answer:

> Does this improve investigation reasoning?

If not, it should not be added merely because it looks impressive.

---

# 63. Product Risks

## Risk 1 — SQL feels like homework

Mitigation:

- start from investigation questions
- make every query produce an insight
- use guided SQL
- avoid syntax for syntax's sake

## Risk 2 — Mobile typing is frustrating

Mitigation:

- autocomplete
- keyboard bar
- query builder
- guided queries
- schema explorer

## Risk 3 — Cases become linear checklists

Mitigation:

- Investigation Graph
- multiple possible paths
- optional discoveries
- varied evidence dependencies

## Risk 4 — Cases become unfair

Mitigation:

- player-accessible inference
- validation
- human playtest
- no hidden required knowledge

## Risk 5 — AI generates broken cases

Mitigation:

- human truth model
- human investigation graph
- automated validation
- human playtest

## Risk 6 — Architecture becomes larger than the game

Mitigation:

- one-case MVP
- local SQL execution first
- no premature security systems
- no premature economy

---

# 64. Core Game Identity

The game should ultimately be described as:

> **A detective game where the player uses SQL to interrogate structured evidence and must combine query results with human statements, reports, and contextual clues to construct a defensible case.**

Not:

> An SQL course with a detective theme.

---

# 65. Final Design Formula

The final design can be reduced to:

```text
                 PLAYER QUESTION
                        ↓
                EVIDENCE REQUEST
                        ↓
                     SQL
                        ↓
                DATA / PATTERN
                        ↓
                NEW DISCOVERY
                        ↓
                 HYPOTHESIS
                        ↓
                 CROSS-CHECK
                        ↓
             INVESTIGATION GRAPH
                        ↓
                EVIDENCE CHAIN
                        ↓
               FINAL ACCUSATION
```

And the most important relationship is:

```text
             SQL
              │
              ▼
        Data Discovery
              │
              ▼
       Detective Reasoning
              │
              ▼
        Better Questions
              │
              └──────────→ SQL
```

That feedback loop is the heart of Police SQL Academy.

---

# 66. Final MVP Definition

The first milestone is **not**:

> "Build a complete SQL detective platform."

It is:

> **Build one small, genuinely fun investigation in which SQL is necessary, understandable, and satisfying to use.**

The first playable milestone should contain:

```text
1 CASE
3 SUSPECTS
2–3 SQL TABLES
1–2 OTHER EVIDENCE SOURCES
1 LIAR
1 RED HERRING
1 INVESTIGATION GRAPH
4 BASIC SQL CONCEPTS
1 FINAL ACCUSATION
1 SIMPLE EVALUATION
```

If players enjoy this:

```text
1 case
 ↓
3 cases
 ↓
case pipeline
 ↓
progression
 ↓
more SQL
 ↓
more investigation systems
 ↓
server-side execution if needed
```

If players do not enjoy it, stop and redesign the core loop before building the larger platform.

---

# 67. Senior Engineering Decision Summary

| Decision | MVP | Later |
|---|---|---|
| SQL as investigation tool | **YES** | — |
| Investigation Graph | **YES** | Expand |
| Investigation State | **YES** | Expand |
| Truth Model | **YES** | — |
| Case Schema | **YES** | — |
| Automated validation | Basic | Advanced |
| Human playtest | **YES** | **YES** |
| SELECT / WHERE / ORDER BY / JOIN | **YES** | — |
| CTE / Window Function | No | Yes |
| Resource limits | No | Maybe |
| Evidence mind-map | No | Maybe |
| Visual timeline editor | No | Maybe |
| Real cases | No | Separate pipeline |
| AI case generation | No | Assisted only |
| Backend SQL execution | No | If needed |
| Complex permissions | No | If needed |
| Premium content | No | Later |
| Multiplayer | No | Not core |

---

# 68. Final Principle

The project should be developed in this order:

```text
FUN
 ↓
GAMEPLAY
 ↓
CASE QUALITY
 ↓
CONTENT PIPELINE
 ↓
ARCHITECTURE SCALE
 ↓
SECURITY / ECONOMY / MONETIZATION
```

Not the other way around.

> **First prove that solving a murder with SQL is fun. Then build the platform around it.**
