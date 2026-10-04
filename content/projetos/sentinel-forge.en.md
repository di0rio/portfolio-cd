## tl;dr

sentinel-forge is a **detection-as-code** engine in Go. Rules live in versioned YAML, go through review, and are validated before they run. The engine reads events or sshd and nginx logs, then returns detections with their context: rule, version, window, threshold, and MITRE ATT&CK technique. It’s where I study security hands-on.

[code](https://github.com/di0rio/sentinel-forge)

## the problem

detection logic usually lives in dashboards and ad-hoc queries. that brings three pains:

- **hard to review:** nobody code-reviews a filter in a dashboard;
- **hard to test:** changing the query can break the detection without anyone noticing;
- **impossible to reproduce:** months later, the same data doesn't give the same alert.

## the idea

treat detection like code:

- **a rule is versioned YAML**, reviewed in a PR and validated before it runs;
- **every rule is tested** against artificial fixtures, so a change can't silently break a detection;
- **every detection explains itself**;
- **deterministic:** windows use event time, not the wall clock, so replaying the same events always gives the same result.

## what it looks like

### the rule

this is `AUTH-001`, in `rules/authentication/AUTH-001.yml`:

```yaml
id: AUTH-001
version: 1

name: Brute Force Authentication

description: >
  Detects repeated authentication failures
  from the same source IP.

severity: high

tags:
  - authentication
  - brute-force

when:
  type: authentication_failure

threshold:
  count: 10
  window: 60s

group_by:
  - network.sourceIp

attack:
  tactic: credential-access
  technique: T1110

references:
  - https://attack.mitre.org/techniques/T1110/
```

reading it top to bottom: **10 events** of type `authentication_failure` **within 60 seconds**, counted **separately per source IP**, is a brute force (MITRE ATT&CK technique T1110). every condition in `when` has to match, and `group_by` keeps one counter per value.

### the input log

the engine reads a real sshd `auth.log`. an excerpt of the test file (`fixtures/authentication/auth.log`):

```text
Oct  3 14:31:05 bastion01 sshd[1180]: Accepted publickey for deploy from 198.51.100.7 port 50022 ssh2: ED25519 SHA256:EXAMPLEFINGERPRINTNOTAREALKEY0000000000000
Oct  3 14:31:58 bastion01 sshd[1244]: Failed password for alice from 192.0.2.18 port 49810 ssh2
Oct  3 14:32:04 bastion01 sshd[1244]: Failed password for alice from 192.0.2.18 port 49810 ssh2
Oct  3 14:32:09 bastion01 sshd[1244]: Accepted password for alice from 192.0.2.18 port 49810 ssh2
Oct  3 14:32:11 bastion01 sshd[1301]: Invalid user admin from 203.0.113.45 port 51234
Oct  3 14:32:12 bastion01 sshd[1301]: Failed password for invalid user admin from 203.0.113.45 port 51234 ssh2
Oct  3 14:32:14 bastion01 sshd[1303]: Failed password for root from 203.0.113.45 port 51240 ssh2
Oct  3 14:32:16 bastion01 sshd[1305]: Failed password for root from 203.0.113.45 port 51246 ssh2
Oct  3 14:32:18 bastion01 sshd[1307]: Invalid user test from 203.0.113.45 port 51252
Oct  3 14:32:19 bastion01 sshd[1307]: Failed password for invalid user test from 203.0.113.45 port 51252 ssh2
```

the whole file has 35 lines: regular people logging in, `alice` getting her password wrong twice and then right, and an attacker at `203.0.113.45` trying `admin`, `root`, `test`, `oracle`, `ubuntu` and `postgres` for about 40 seconds. the IPs are documentation addresses (`192.0.2.0/24`, `198.51.100.0/24` and `203.0.113.0/24`), not anybody's real ones.

### the replay

```bash
sentinelforge replay --format sshd --year 2026 fixtures/authentication/auth.log
```

`--year` exists because the classic syslog timestamp (`Oct  3 14:32:11`) carries no year. with it pinned, the result is reproducible. the real output:

```text
SentinelForge Detection Engine

✓ 25 events processed
· 10 lines skipped (not security events)
✓ 2 rules evaluated

────────────────────────────────────────

🚨 Detection triggered

AUTH-001 v1
Brute Force Authentication

Severity:      HIGH
Group:         network.sourceIp=203.0.113.45
Matched:       14 events
Window:        42s (14:32:12 → 14:32:54)
Threshold:     10 events / 60s
MITRE ATT&CK:  T1110 (credential-access)

Reason:
14 events matched type=authentication_failure, reaching the threshold of 10 within 60s.

────────────────────────────────────────

1 detections in 10ms
```

out of 35 lines, 25 became events and 10 were skipped for not being security events (the PAM session lines, CRON, `Server listening`…). `alice` got it wrong twice, but stayed under the threshold: nothing. the attacker got it wrong 14 times in 42 seconds: one detection. and those 14 attempts became **one** detection, not fourteen.

### a second rule, on nginx

`WEB-001` (`rules/web/WEB-001.yml`) detects directory and vulnerability scanners, the kind that probe for paths that don't exist:

```yaml
id: WEB-001
version: 1

name: Web Scanning

description: >
  Detects many 404 responses to the same source IP in a short time,
  typical of directory and vulnerability scanners probing for paths
  that do not exist. The status is compared as a string.

severity: medium

tags:
  - web
  - scanning
  - reconnaissance

when:
  type: http_request
  metadata.status: "404"

threshold:
  count: 20
  window: 60s

group_by:
  - network.sourceIp

attack:
  tactic: reconnaissance
  technique: T1595

references:
  - https://attack.mitre.org/techniques/T1595/
```

note the quoted `"404"`: the status is compared as text. the access log (`fixtures/web/scan.log`) mixes regular traffic with a scanner (its user agent announces itself as Nuclei):

```text
203.0.113.88 - - [03/Oct/2026:14:01:10 +0000] "GET /products/42 HTTP/1.1" 200 8140 "https://shop.example.test/products" "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0"
198.51.100.77 - - [03/Oct/2026:14:01:35 +0000] "GET /wp-login.php HTTP/1.1" 404 153 "-" "Nuclei - Open-source project (github.com/projectdiscovery/nuclei)"
198.51.100.77 - - [03/Oct/2026:14:01:37 +0000] "GET /.env HTTP/1.1" 404 153 "-" "Nuclei - Open-source project (github.com/projectdiscovery/nuclei)"
198.51.100.77 - - [03/Oct/2026:14:01:38 +0000] "GET /phpmyadmin/ HTTP/1.1" 404 153 "-" "Nuclei - Open-source project (github.com/projectdiscovery/nuclei)"
198.51.100.77 - - [03/Oct/2026:14:01:41 +0000] "GET /.git/config HTTP/1.1" 404 153 "-" "Nuclei - Open-source project (github.com/projectdiscovery/nuclei)"
```

```bash
sentinelforge replay --format nginx fixtures/web/scan.log
```

```text
SentinelForge Detection Engine

✓ 35 events processed
· 1 lines skipped (not security events)
✓ 2 rules evaluated

────────────────────────────────────────

🚨 Detection triggered

WEB-001 v1
Web Scanning

Severity:      MEDIUM
Group:         network.sourceIp=198.51.100.77
Matched:       25 events
Window:        32s (14:01:35 → 14:02:07)
Threshold:     20 events / 60s
MITRE ATT&CK:  T1595 (reconnaissance)

Reason:
25 events matched metadata.status=404, type=http_request, reaching the threshold of 20 within 60s.

────────────────────────────────────────

1 detections in 14ms
```

the skipped line is a line from nginx's **error** log that ended up in the same file. the lone `favicon.ico` 404 from another IP doesn't come close to 20.

and validating the rules before running is a single command:

```text
$ sentinelforge rules validate
✓ AUTH-001 v1  Brute Force Authentication
✓ WEB-001 v1  Web Scanning

2 rules valid
```

## how it works under the hood

```text
auth.log / access.log ─► parser ─┐
                                 ├─► events ─► sort ─► engine ─► detections
JSON events ─► validation ───────┘               ▲
YAML rules ─► strict parse ──────────────────────┘
```

### 1. the parser: a raw log becomes a normalized event

the whole engine works on a single event, with fixed fields: `type`, `source`, `actor.username`, `network.sourceIp`, `target.host` and `metadata.*`. it's the format of the input JSON:

```json
{"id": "evt_002", "timestamp": "2026-09-26T14:30:41Z", "source": "auth-service", "type": "authentication_failure", "actor": {"username": "bob"}, "network": {"sourceIp": "10.0.0.22"}, "metadata": {"method": "password"}}
```

the parsers (`internal/parser`) turn a log line into that same format. the sshd one, for example, is a set of anchored expressions:

```go
sshdFailed   = regexp.MustCompile(`^Failed (\S+) for (invalid user )?(.+) from (\S+) port ([0-9]{1,5})(?: ssh2)?$`)
sshdInvalid  = regexp.MustCompile(`^Invalid user (.+) from (\S+)(?: port ([0-9]{1,5}))?$`)
sshdAccepted = regexp.MustCompile(`^Accepted (\S+) for (\S+) from (\S+) port ([0-9]{1,5})(?: ssh2)?(?::.*)?$`)
```

sshd produces three types: `authentication_failure`, `authentication_success` and `invalid_user`. that last one is a separate type on purpose: sshd logs `Invalid user` **before** the `Failed password for invalid user` of the same attempt, so treating both as failures would count one attempt twice. nginx produces `http_request`, with the status in `metadata.status` as text.

and the event ID comes from the source and the line number (`sshd-12`), so reading the same file twice gives identical events.

### 2. the engine: a sliding window on event time

`Engine.Evaluate` takes one event at a time and runs it through every rule. state is kept apart by a key that combines **rule + tenant + the `group_by` values**: that's why each IP has its own counter.

```go
hits := append(prune(e.windows[key], ev.Timestamp.Add(-window)), hit{ev.ID, ev.Timestamp})
if len(hits) < r.Threshold.Count {
    e.windows[key] = hits
    continue
}
```

for every event that matches `when`, the engine drops the hits older than the window (`prune`) and checks whether the total reached the threshold. the clock is `ev.Timestamp`, never `time.Now()`. that's why the result is deterministic, and you can reproduce an incident six months from now.

replay sorts the events by timestamp before handing them to the engine, because the engine expects order.

### 3. alert storm protection

when the threshold is reached, the detection stays **open**. while more hits keep arriving within the window, they **extend** the detection instead of opening another one:

```go
if d := e.open[key]; d != nil {
    if ev.Timestamp.Sub(d.Last) <= window {
        d.MatchedEvents = append(d.MatchedEvents, ev.ID)
        d.Last = ev.Timestamp
        continue
    }
    delete(e.open, key)
}
```

in the sample log, the attacker's tenth failure (14:32:36) opens the detection. the next four (14:32:39, 43, 46 and 54) join it, and that's why the report says **14** events. a 1,000-attempt attack is one detection, not a hundred.

### 4. the rule is a strict DSL, treated as untrusted input

the rule language is declarative and **restricted**: no expressions, templates or code execution. `when` is just text equality (`field: value`), and the fields a rule can reference are a fixed list. when loading (`internal/rule`):

- an unknown field in the YAML **fails** (`yaml.Strict()`), and so does an unknown field in `when` or `group_by`;
- the `id` has to match `^[A-Z]+-[0-9]{3}$`, severity is `low`, `medium`, `high` or `critical`, and the window is between 0 and 24 hours;
- **YAML aliases are rejected**, and so are files with more than one document: alias expansion turns a few hundred bytes into gigabytes (the "billion laughs");
- a rule file has a size limit (64 KiB), and symlinks inside the rules folder aren't followed;
- a duplicate id is an error, and the errors from every file come back together.

a fuzz test (`FuzzParse`) already found a case where the YAML decoder panicked on a malformed tag. now a bad file becomes an error, not a crash.

### 5. hardening: logs and events are untrusted input too

a log can be written by whoever is attacking. so:

- lines are limited to **64 KiB**. a longer line is rejected and reading continues with the next one. (a `bufio.Scanner` would stop for good on that line.)
- patterns are anchored and Go's `regexp` runs in linear time, so there's no catastrophic backtracking;
- the IP is validated with `net/netip` and normalized (no zone, IPv4-mapped becomes IPv4), so one host is always one group;
- a line that isn't a security event or fails validation is **counted and skipped**, never fatal;
- replay reads at most **64 MiB** (bigger logs have to be split) and tracks at most **100,000 groups** at once. past that, the engine stops with an error instead of exhausting memory. the state key has the length of each part in front (`3:abc`), so values with any byte can't collide with another split of rule, tenant and group;
- when printing, event and rule fields become clean text: an sshd username with `\x1b[2J` would redraw the terminal, so control and invisible characters come out as `<U+XXXX>`:

```go
func unsafeRune(r rune) bool { return unicode.IsControl(r) || unicode.Is(unicode.Cf, r) }
```

## decisions

**declarative and restricted.** a small language is easier to review, validate and protect. a rule can't execute anything, because the language doesn't offer that.

**event time, not the wall clock.** that's what makes detection reproducible and testable with a fixture.

**explainable by default.** the output says rule, version, group, how many events, window, threshold, ATT&CK technique and the reason. you can understand the alert without opening the code.

**one normalized event.** a new parser only has to produce that event, and a new rule only has to cite its fields. that's why the same `AUTH-001` works on the test JSON and on a real `auth.log`.

**fail safe.** malformed input is skipped and counted, hitting a limit is an explicit error. CI runs tests with `-race`, lint, [govulncheck](https://go.dev/doc/security/vuln/) and [gitleaks](https://github.com/gitleaks/gitleaks) on every push.

## status and next steps

the project is in early development (pre-1.0): the detection core works end to end, but the API and the rule format may still change. it already has the threshold engine, YAML rules, the replay CLI and parsers for sshd `auth.log` and nginx access logs.

one limit the code documents itself: the engine expects events in time order (replay sorts them first) and doesn't tolerate out-of-order events yet. an event with a far-future timestamp would expire its group's windows.

what's on the roadmap:

- sequence and correlation rules;
- alerts with deduplication, suppression, cooldown and persistence;
- incidents and a timeline;
- an HTTP API and a web UI;
- Sigma rule import.
