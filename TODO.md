# BalhinBalay – Todo list

Use this file to track and follow along. Check off items with `[x]` as they’re done.

---

## Checkpoint (revert if you don't like changes)

Tag: `checkpoint-before-plan`

- **Restore to checkpoint (discard all changes after it):**  
  `git reset --hard checkpoint-before-plan`
- **Just view the checkpoint (detached HEAD):**  
  `git checkout checkpoint-before-plan`

---

## Push notifications toggle

- [x] Add user preference for push enabled (DB or Preferences)
- [x] Add API to get/set push-enabled (e.g. GET/PATCH users/me or push-token)
- [x] UI: toggle in profile/settings to enable/disable push notifications
- [x] Register/unregister device token based on toggle; server skip push when disabled

---

## Main

- [ ] Improve chat (general UX/behavior)
- [ ] Improve UI for mobile use
- [x] Remove maximise button on chat window (ChatModal.js — only Close button now)
- [ ] Improve navigation
- [x] Improve header when opening property details modal (header gets `app-header-modal-open`, actions hidden in App.css)
- [x] Add sold / currently being rented and next availability
- [x] Pull down to refresh results
- [x] Redesign "Newest first" filter so it's clearly a dropdown (SortBar already uses a proper select dropdown)

---

## Non-priority

- [ ] Get rid of notifications when message is opened
